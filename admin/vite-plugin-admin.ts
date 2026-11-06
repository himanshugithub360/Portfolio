/**
 * Admin API — only present while `npm run dev` is running (it is a dev-server plugin, so it never
 * ships in `npm run build`). The admin dashboard at /admin talks to these endpoints:
 *
 *   GET  /__admin/api/session        → { authRequired, authed }
 *   POST /__admin/api/login          { password } → { token }
 *   GET  /__admin/api/content        → { content, version }
 *   PUT  /__admin/api/content        { content, version } → saves it (the site hot-reloads); answers 409
 *                                    if content.json changed since that version (e.g. edited by hand)
 *   POST /__admin/api/photo?crop=…   image body → rebuilds the portrait images
 *   POST /__admin/api/resume         PDF body → replaces the resume download
 *   GET  /__admin/api/backups        → recent saved versions;  POST /__admin/api/restore { name }
 *   GET  /__admin/api/git            → branch + changed files;  POST /__admin/api/publish { message }
 *
 * Security: set ADMIN_PASSWORD in .env.local to use the admin from other devices. Without it,
 * the API only answers requests from this computer (localhost).
 */
import type { Plugin, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { execFile } from 'node:child_process';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildPortraits, PHOTO_CANDIDATES } from '../scripts/portrait.mjs';
import { MOTIF_IDS } from '../src/data/motifs';

const MB = 1024 * 1024;
const KEEP_BACKUPS = 30;

const REQUIRED: Record<string, 'object' | 'array'> = {
  profile: 'object',
  hero: 'object',
  about: 'object',
  copy: 'object',
  education: 'array',
  experience: 'array',
  projects: 'array',
  achievements: 'array',
  certifications: 'array',
  skillCategories: 'array',
  skillEvidence: 'object',
  seasons: 'array',
  topPicks: 'array',
  introSlides: 'array',
  viewers: 'object',
  sections: 'object',
  theme: 'object',
  settings: 'object',
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function validate(c: unknown): string[] {
  const errors: string[] = [];
  if (!c || typeof c !== 'object' || Array.isArray(c)) return ['Content must be a JSON object.'];
  const o = c as Record<string, unknown>;
  for (const [k, kind] of Object.entries(REQUIRED)) {
    const v = o[k];
    if (kind === 'array' ? !Array.isArray(v) : !v || typeof v !== 'object' || Array.isArray(v)) errors.push(`"${k}" is missing or not ${kind === 'array' ? 'a list' : 'an object'}.`);
  }
  if (errors.length) return errors;
  const projects = o.projects as { id?: string; title?: string; motif?: string }[];
  const ids = new Set<string>();
  projects.forEach((p, i) => {
    const name = p.title || `Project ${i + 1}`;
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) errors.push(`${name}: ID must be lowercase letters, numbers and dashes.`);
    else if (ids.has(p.id)) errors.push(`${name}: ID "${p.id}" is used twice.`);
    else ids.add(p.id);
    if (!MOTIF_IDS.includes(p.motif ?? '')) errors.push(`${name}: unknown background art "${p.motif}".`);
  });
  (o.seasons as { title?: string; episodes?: { title?: string; motif?: string }[] }[]).forEach((s) =>
    (s.episodes ?? []).forEach((e) => {
      if (e.motif && !MOTIF_IDS.includes(e.motif)) errors.push(`${s.title} → ${e.title}: unknown background art "${e.motif}".`);
    }),
  );
  const profile = o.profile as { fullName?: string; firstName?: string };
  if (!profile.fullName?.trim()) errors.push('Profile: full name is required.');
  if (!profile.firstName?.trim()) errors.push('Profile: first name is required.');
  const viewers = o.viewers as { main?: unknown; recruiter?: unknown; roles?: { id?: string; name?: string }[] };
  if (!viewers.main || typeof viewers.main !== 'object') errors.push('Viewers: the main view is missing.');
  if (!viewers.recruiter || typeof viewers.recruiter !== 'object') errors.push('Viewers: the Recruiter tile is missing.');
  if (!Array.isArray(viewers.roles) || viewers.roles.length === 0) errors.push('Recruiter roles: add at least one role.');
  else {
    const roleIds = new Set<string>();
    viewers.roles.forEach((r, i) => {
      const name = r.name || `Role ${i + 1}`;
      if (!r.id || !/^[a-z0-9-]+$/.test(r.id) || r.id === 'main') errors.push(`${name}: ID must be lowercase letters, numbers and dashes (and not “main”).`);
      else if (roleIds.has(r.id)) errors.push(`${name}: ID "${r.id}" is used twice.`);
      else roleIds.add(r.id);
    });
  }
  return errors;
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((ok, fail) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > limit) {
        fail(new HttpError(413, `File is too large (max ${Math.round(limit / MB)} MB).`));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => ok(Buffer.concat(chunks)));
    req.on('error', fail);
  });
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const buf = await readBody(req, 5 * MB);
  try {
    return JSON.parse(buf.toString('utf8')) as T;
  } catch {
    throw new HttpError(400, 'Request body is not valid JSON.');
  }
}

function git(cwd: string, args: string[]): Promise<{ code: number; out: string }> {
  return new Promise((ok) => {
    execFile('git', args, { cwd, windowsHide: true, timeout: 120_000 }, (err, stdout, stderr) => {
      const code = err ? (typeof (err as NodeJS.ErrnoException).code === 'number' ? Number((err as NodeJS.ErrnoException).code) : 1) : 0;
      ok({ code, out: `${stdout}${stderr}`.trim() });
    });
  });
}

const isLoopback = (addr?: string) => !!addr && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(addr);

export default function adminPlugin({ password }: { password?: string }): Plugin {
  const tokens = new Set<string>();
  const pw = password?.trim() || '';

  return {
    name: 'portfolio-admin',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      const contentPath = join(root, 'src/data/content.json');
      const backupDir = join(root, '.admin-backups');
      const readContent = () => JSON.parse(readFileSync(contentPath, 'utf8'));
      const version = () => createHash('sha1').update(readFileSync(contentPath)).digest('hex');

      const writeContent = (c: unknown) => {
        const errors = validate(c);
        if (errors.length) throw new HttpError(400, errors.join('\n'));
        mkdirSync(backupDir, { recursive: true });
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        writeFileSync(join(backupDir, `content-${stamp}.json`), readFileSync(contentPath));
        const old = readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort();
        old.slice(0, Math.max(0, old.length - KEEP_BACKUPS)).forEach((f) => rmSync(join(backupDir, f)));
        const tmp = `${contentPath}.tmp`;
        writeFileSync(tmp, JSON.stringify(c, null, 2) + '\n');
        renameSync(tmp, contentPath);
      };

      const authed = (req: IncomingMessage) => {
        if (!pw) return isLoopback(req.socket.remoteAddress);
        const h = req.headers.authorization ?? '';
        return h.startsWith('Bearer ') && tokens.has(h.slice(7));
      };

      // Friendly URL: /admin → the admin page.
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin.html';
        next();
      });

      const api: Connect.NextHandleFunction = async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://x');
        if (!url.pathname.startsWith('/__admin/api/')) return next();
        const route = `${req.method} ${url.pathname.slice('/__admin/api'.length)}`;
        try {
          if (route === 'GET /session') return send(res, 200, { authRequired: !!pw, authed: authed(req), local: isLoopback(req.socket.remoteAddress) });

          if (route === 'POST /login') {
            const { password: given = '' } = await readJson<{ password?: string }>(req);
            if (!pw) return send(res, 400, { error: 'No admin password is set. Add ADMIN_PASSWORD to .env.local.' });
            const a = Buffer.from(given), b = Buffer.from(pw);
            if (a.length !== b.length || !timingSafeEqual(a, b)) {
              await new Promise((r) => setTimeout(r, 800));
              return send(res, 401, { error: 'Wrong password.' });
            }
            const token = randomBytes(24).toString('hex');
            tokens.add(token);
            return send(res, 200, { token });
          }

          if (!authed(req)) {
            return send(res, pw ? 401 : 403, {
              error: pw ? 'Please sign in.' : 'The admin only works on this computer until you set ADMIN_PASSWORD in .env.local.',
            });
          }

          if (route === 'POST /logout') {
            tokens.delete((req.headers.authorization ?? '').slice(7));
            return send(res, 200, { ok: true });
          }

          if (route === 'GET /content') return send(res, 200, { content: readContent(), version: version() });

          if (route === 'PUT /content') {
            const body = await readJson<{ content?: unknown; version?: string }>(req);
            if (body.version && body.version !== version()) {
              throw new HttpError(
                409,
                'content.json was changed outside the admin since you opened it (for example edited by hand). Reload the admin to get the latest version — saving now would overwrite those changes.',
              );
            }
            writeContent(body.content);
            return send(res, 200, { ok: true, version: version() });
          }

          if (route === 'POST /photo') {
            const type = req.headers['content-type'] ?? '';
            if (!/^image\/(jpeg|png|webp)$/.test(type)) throw new HttpError(400, 'Upload a JPG, PNG or WebP image.');
            const buf = await readBody(req, 25 * MB);
            const { default: sharp } = await import('sharp');
            const meta = await sharp(buf).metadata().catch(() => null);
            if (!meta?.width) throw new HttpError(400, 'That file is not a readable image.');
            // Keep transparency when there is any; otherwise store a JPG.
            const dest = join(root, meta.hasAlpha ? 'photo.png' : 'photo.jpg');
            PHOTO_CANDIDATES.forEach((p) => existsSync(join(root, p)) && rmSync(join(root, p)));
            if (meta.hasAlpha) await sharp(buf).png().toFile(dest);
            else await sharp(buf).rotate().jpeg({ quality: 92 }).toFile(dest);
            const content = readContent();
            const cropParam = url.searchParams.get('crop');
            const crop = cropParam === 'keep' ? content.settings.photoCrop : 'auto';
            const box = await buildPortraits({
              src: dest,
              crop,
              outDir: join(root, 'public/assets'),
              title: content.profile.firstName,
              subtitle: content.profile.tagline.join(' • '),
            });
            content.settings.photoCrop = box;
            writeContent(content);
            return send(res, 200, { ok: true, crop: box });
          }

          if (route === 'POST /recrop') {
            const { crop } = await readJson<{ crop: unknown }>(req);
            const content = readContent();
            const src = PHOTO_CANDIDATES.map((p) => join(root, p)).find((p) => existsSync(p));
            if (!src) throw new HttpError(400, 'No photo uploaded yet.');
            const box = await buildPortraits({
              src,
              crop: crop === 'auto' ? 'auto' : (crop as never),
              outDir: join(root, 'public/assets'),
              title: content.profile.firstName,
              subtitle: content.profile.tagline.join(' • '),
            });
            content.settings.photoCrop = box;
            writeContent(content);
            return send(res, 200, { ok: true, crop: box });
          }

          if (route === 'POST /resume') {
            if (req.headers['content-type'] !== 'application/pdf') throw new HttpError(400, 'Upload a PDF file.');
            const buf = await readBody(req, 15 * MB);
            if (buf.subarray(0, 5).toString() !== '%PDF-') throw new HttpError(400, 'That file is not a PDF.');
            const rel: string = readContent().profile.resumePdf;
            const dest = resolve(root, 'public', rel.replace(/^\/+/, ''));
            if (!dest.startsWith(resolve(root, 'public'))) throw new HttpError(400, 'Resume path must be inside public/.');
            mkdirSync(join(dest, '..'), { recursive: true });
            writeFileSync(dest, buf);
            return send(res, 200, { ok: true, path: rel, bytes: buf.length });
          }

          if (route === 'GET /backups') {
            const list = existsSync(backupDir) ? readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort().reverse() : [];
            return send(res, 200, { backups: list });
          }

          if (route === 'POST /restore') {
            const { name = '' } = await readJson<{ name?: string }>(req);
            if (!/^content-[\dT-]+\.json$/.test(name) || !existsSync(join(backupDir, name))) throw new HttpError(404, 'Backup not found.');
            writeContent(JSON.parse(readFileSync(join(backupDir, name), 'utf8')));
            return send(res, 200, { ok: true });
          }

          if (route === 'GET /git') {
            const [branch, status, remote, ahead] = await Promise.all([
              git(root, ['branch', '--show-current']),
              git(root, ['status', '--porcelain']),
              git(root, ['remote', 'get-url', 'origin']),
              git(root, ['rev-list', '--count', '@{u}..HEAD']),
            ]);
            return send(res, 200, {
              branch: branch.out,
              remote: remote.code === 0 ? remote.out : '',
              changes: status.out ? status.out.split('\n') : [],
              ahead: ahead.code === 0 ? Number(ahead.out) : 0,
            });
          }

          if (route === 'POST /publish') {
            const { message = '' } = await readJson<{ message?: string }>(req);
            const msg = message.trim() || 'Update portfolio content';
            const log: string[] = [];
            const run = async (args: string[]) => {
              const r = await git(root, args);
              log.push(`$ git ${args.join(' ')}\n${r.out}`.trim());
              return r;
            };
            await run(['add', '-A']);
            const staged = await git(root, ['diff', '--cached', '--quiet']);
            if (staged.code !== 0) {
              const c = await run(['commit', '-m', msg]);
              if (c.code !== 0) return send(res, 500, { error: 'Commit failed.', log: log.join('\n\n') });
            } else log.push('Nothing new to commit.');
            const p = await run(['push']);
            if (p.code !== 0) return send(res, 500, { error: 'Push failed.', log: log.join('\n\n') });
            return send(res, 200, { ok: true, log: log.join('\n\n') });
          }

          return send(res, 404, { error: `Unknown admin endpoint: ${route}` });
        } catch (e) {
          const status = e instanceof HttpError ? e.status : 500;
          return send(res, status, { error: e instanceof Error ? e.message : String(e) });
        }
      };
      server.middlewares.use(api);

      server.httpServer?.once('listening', () => {
        const where = pw ? 'password protected (ADMIN_PASSWORD)' : 'this computer only — set ADMIN_PASSWORD in .env.local to use it from other devices';
        server.config.logger.info(`\n  Admin dashboard: /admin  (${where})\n`);
      });
    },
  };
}
