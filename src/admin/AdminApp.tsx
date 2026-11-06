import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Content } from '../data/portfolio';
import { api, ApiError, setToken, type Crop, type GitStatus } from './api';
import { Fields, getPath, setPath } from './fields';
import { buildPages, THEME_PRESETS, type FormPage, type Page } from './schema';

type Toast = { kind: 'ok' | 'error'; text: string } | null;

/** Small fixes applied on every save so hand-made mistakes don't break the site. */
function normalize(c: Content): Content {
  return {
    ...c,
    seasons: c.seasons.map((s, i) => ({
      ...s,
      number: i + 1,
      episodes: s.episodes.map((e) => ({ ...e, tags: e.tags.filter(Boolean) })),
    })),
    projects: c.projects.map((p) => ({ ...p, id: p.id.trim().toLowerCase().replace(/\s+/g, '-') })),
  };
}

export default function AdminApp() {
  const [phase, setPhase] = useState<'loading' | 'login' | 'blocked' | 'ready'>('loading');
  const [blockedMsg, setBlockedMsg] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [saved, setSaved] = useState<Content | null>(null);
  const [draft, setDraft] = useState<Content | null>(null);
  const [pageId, setPageId] = useState(() => location.hash.slice(1) || 'profile');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [preview, setPreview] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const c = await api.content();
      setSaved(c);
      setDraft(c);
      setPhase('ready');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setPhase('login');
      else if (e instanceof ApiError && e.status === 403) {
        setBlockedMsg(e.message);
        setPhase('blocked');
      } else {
        setBlockedMsg(e instanceof Error ? e.message : String(e));
        setPhase('blocked');
      }
    }
  }, []);

  useEffect(() => {
    api
      .session()
      .then((s) => {
        setAuthRequired(s.authRequired);
        if (s.authRequired && !s.authed) setPhase('login');
        else load();
      })
      .catch((e) => {
        setBlockedMsg(e.message);
        setPhase('blocked');
      });
  }, [load]);

  const dirty = useMemo(() => !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === 'error' ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const iframe = useRef<HTMLIFrameElement>(null);

  const save = useCallback(async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      const clean = normalize(draft);
      await api.save(clean);
      setSaved(clean);
      setDraft(clean);
      setToast({ kind: 'ok', text: 'Saved. The site has been updated.' });
    } catch (e) {
      setToast({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }, [draft, saving]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const go = (id: string) => {
    setPageId(id);
    history.replaceState(null, '', `#${id}`);
    setNavOpen(false);
    window.scrollTo(0, 0);
  };

  if (phase === 'loading') return <Centered>Loading…</Centered>;
  if (phase === 'blocked') return <Blocked message={blockedMsg} />;
  if (phase === 'login') return <Login onDone={load} />;
  if (!draft || !saved) return null;

  const pages = buildPages(draft);
  const page = pages.find((p) => p.id === pageId) ?? pages[0];
  const groups = ['Content', 'Site', 'Files'] as const;

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur">
        <button type="button" className="ad-icon-btn lg:hidden" aria-label="Menu" onClick={() => setNavOpen((v) => !v)}>☰</button>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand font-bold text-white">{draft.profile.firstName.charAt(0)}</span>
          <span className="hidden text-sm font-semibold sm:inline">Portfolio Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {dirty ? <span className="hidden text-xs font-medium text-amber-600 sm:inline">● Unsaved changes</span> : <span className="hidden text-xs text-zinc-400 sm:inline">All changes saved</span>}
          <button type="button" className="ad-btn ad-btn-ghost hidden md:inline-flex" onClick={() => setPreview((v) => !v)}>
            {preview ? 'Hide preview' : 'Show preview'}
          </button>
          <a className="ad-btn ad-btn-ghost" href="/" target="_blank" rel="noreferrer">
            View site ↗
          </a>
          <button type="button" className="ad-btn ad-btn-ghost" disabled={!dirty || saving} onClick={() => confirm('Discard all unsaved changes?') && setDraft(saved)}>
            Discard
          </button>
          <button type="button" className="ad-btn ad-btn-primary" disabled={!dirty || saving} onClick={save} title="Ctrl+S">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {authRequired && (
            <button
              type="button"
              className="ad-icon-btn"
              title="Sign out"
              aria-label="Sign out"
              onClick={async () => {
                await api.logout().catch(() => {});
                setToken('');
                location.reload();
              }}
            >
              ⎋
            </button>
          )}
        </div>
      </header>

      <div className="flex">
        {/* sidebar */}
        <nav
          className={`fixed inset-y-0 left-0 top-14 z-20 w-60 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-3 transition-transform lg:sticky lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 ${navOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
        >
          {groups.map((g) => (
            <div key={g} className="mb-4">
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{g}</p>
              {pages
                .filter((p) => p.group === g)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => go(p.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm ${p.id === page.id ? 'bg-red-50 font-semibold text-brand-dark' : 'text-zinc-700 hover:bg-zinc-100'}`}
                  >
                    <span className="w-5 text-center" aria-hidden>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
            </div>
          ))}
          <p className="mt-6 px-2 text-[11px] leading-relaxed text-zinc-400">
            Everything here is stored in <code>src/data/content.json</code>. You can also edit that file by hand.
          </p>
        </nav>
        {navOpen && <div className="fixed inset-0 top-14 z-10 bg-black/20 lg:hidden" onClick={() => setNavOpen(false)} />}

        {/* main */}
        <main className={`min-w-0 flex-1 ${preview ? 'md:max-w-[52%]' : ''}`}>
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
            <h1 className="text-2xl font-bold tracking-tight">{page.label}</h1>
            <p className="mt-1 text-sm text-zinc-500">{page.description}</p>
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <PageBody page={page} draft={draft} setDraft={setDraft} dirty={dirty} onReload={load} setToast={setToast} iframe={iframe} />
            </div>
          </div>
        </main>

        {preview && (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] flex-1 border-l border-zinc-200 bg-zinc-900 md:block">
            <iframe ref={iframe} title="Site preview" src="/" className="h-full w-full" />
          </aside>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 whitespace-pre-line rounded-xl px-4 py-3 text-sm shadow-lg ${toast.kind === 'ok' ? 'bg-zinc-900 text-white' : 'bg-red-600 text-white'}`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function PageBody({
  page,
  draft,
  setDraft,
  dirty,
  onReload,
  setToast,
  iframe,
}: {
  page: Page;
  draft: Content;
  setDraft: (c: Content) => void;
  dirty: boolean;
  onReload: () => Promise<void>;
  setToast: (t: Toast) => void;
  iframe: React.RefObject<HTMLIFrameElement | null>;
}) {
  if ('custom' in page) {
    if (page.custom === 'media') return <MediaPage draft={draft} dirty={dirty} onReload={onReload} setToast={setToast} iframe={iframe} />;
    return <PublishPage dirty={dirty} onReload={onReload} setToast={setToast} />;
  }
  const p = page as FormPage;
  return (
    <>
      {p.id === 'design' && (
        <div className="mb-6">
          <p className="mb-2 text-[13px] font-semibold text-zinc-800">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((t) => (
              <button
                key={t.name}
                type="button"
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:border-zinc-400"
                onClick={() => setDraft({ ...draft, theme: { ...draft.theme, ...t.theme } })}
              >
                <span className="flex h-5 w-9 overflow-hidden rounded">
                  <span className="flex-1" style={{ background: t.theme.background }} />
                  <span className="flex-1" style={{ background: t.theme.accent }} />
                  <span className="flex-1" style={{ background: t.theme.accentBright }} />
                </span>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <Fields fields={p.fields} value={getPath(draft, p.root)} onChange={(v) => setDraft(setPath(draft, p.root, v))} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Photo & resume                                                      */
/* ------------------------------------------------------------------ */

function MediaPage({
  draft,
  dirty,
  onReload,
  setToast,
  iframe,
}: {
  draft: Content;
  dirty: boolean;
  onReload: () => Promise<void>;
  setToast: (t: Toast) => void;
  iframe: React.RefObject<HTMLIFrameElement | null>;
}) {
  const [bust, setBust] = useState(() => Date.now());
  const [busy, setBusy] = useState<'' | 'photo' | 'resume' | 'crop'>('');
  const [crop, setCrop] = useState<Crop | null>(draft.settings.photoCrop === 'auto' ? null : (draft.settings.photoCrop as Crop));

  const after = async (text: string) => {
    setBust(Date.now());
    await onReload();
    iframe.current?.contentWindow?.location.reload();
    setToast({ kind: 'ok', text });
  };
  const fail = (e: unknown) => setToast({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
  const guard = () => {
    if (dirty) {
      setToast({ kind: 'error', text: 'Save or discard your other changes first — uploading saves the content file.' });
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold">Portrait photo</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Best results: a photo on a plain white or light background, or a PNG with the background already removed. The background is cut out automatically.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-[180px_1fr]">
          <div className="aspect-[4/5] overflow-hidden rounded-xl" style={{ background: `radial-gradient(circle at 50% 30%, ${draft.theme.accent}, ${draft.theme.background})` }}>
            <img src={`/assets/portrait-420.webp?v=${bust}`} alt="Current portrait" className="h-full w-full object-contain object-bottom" />
          </div>
          <div className="space-y-4">
            <label className={`ad-btn ad-btn-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}>
              {busy === 'photo' ? 'Processing photo…' : 'Upload new photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file || !guard()) return;
                  setBusy('photo');
                  try {
                    const r = await api.photo(file, 'auto');
                    setCrop(r.crop);
                    await after('Photo updated.');
                  } catch (err) {
                    fail(err);
                  } finally {
                    setBusy('');
                  }
                }}
              />
            </label>
            {crop && (
              <details className="rounded-lg border border-zinc-200 p-3">
                <summary className="cursor-pointer text-sm font-medium text-zinc-700">Adjust crop</summary>
                <p className="mt-2 text-xs text-zinc-500">Pixels in the original photo. “Auto” finds you in the frame.</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(['left', 'top', 'width', 'height'] as const).map((k) => (
                    <label key={k} className="text-xs capitalize text-zinc-600">
                      {k}
                      <input type="number" className="ad-input mt-1" value={crop[k]} onChange={(e) => setCrop({ ...crop, [k]: Number(e.target.value) })} />
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  {(['apply', 'auto'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`ad-btn ${mode === 'apply' ? 'ad-btn-primary' : 'ad-btn-ghost'}`}
                      disabled={!!busy}
                      onClick={async () => {
                        if (!guard()) return;
                        setBusy('crop');
                        try {
                          const r = await api.recrop(mode === 'auto' ? 'auto' : crop);
                          setCrop(r.crop);
                          await after('Crop updated.');
                        } catch (err) {
                          fail(err);
                        } finally {
                          setBusy('');
                        }
                      }}
                    >
                      {busy === 'crop' ? 'Working…' : mode === 'apply' ? 'Apply crop' : 'Auto crop'}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </section>

      <hr className="border-zinc-200" />

      <section>
        <h2 className="text-base font-semibold">Resume PDF</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Replaces the file behind “View Resume” and “Download Resume”. Remember: anything in it (like your phone number) becomes public when you publish.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className={`ad-btn ad-btn-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            {busy === 'resume' ? 'Uploading…' : 'Upload new resume (PDF)'}
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setBusy('resume');
                try {
                  const r = await api.resume(file);
                  setToast({ kind: 'ok', text: `Resume replaced (${Math.round(r.bytes / 1024)} KB).` });
                } catch (err) {
                  fail(err);
                } finally {
                  setBusy('');
                }
              }}
            />
          </label>
          <a className="ad-btn ad-btn-ghost" href={`${draft.profile.resumePdf}?v=${bust}`} target="_blank" rel="noreferrer">
            Open current resume ↗
          </a>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Publish & backups                                                   */
/* ------------------------------------------------------------------ */

function PublishPage({ dirty, onReload, setToast }: { dirty: boolean; onReload: () => Promise<void>; setToast: (t: Toast) => void }) {
  const [git, setGit] = useState<GitStatus | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState('');
  const [backups, setBackups] = useState<string[]>([]);

  const refresh = useCallback(() => {
    api.git().then(setGit).catch((e) => setToast({ kind: 'error', text: e.message }));
    api.backups().then((b) => setBackups(b.backups)).catch(() => {});
  }, [setToast]);
  useEffect(refresh, [refresh]);

  const pretty = (name: string) => {
    const m = name.match(/content-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/);
    if (!m) return name;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
    return d.toLocaleString();
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold">Publish to GitHub</h2>
        <p className="mt-1 text-sm text-zinc-500">Commits every saved change in the project and pushes it to your repository.</p>
        {git && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
            <p>
              <span className="text-zinc-500">Repository:</span> {git.remote || 'none set'} <span className="text-zinc-400">({git.branch})</span>
            </p>
            <p className="mt-1">
              <span className="text-zinc-500">Changed files:</span> {git.changes.length || 'none'}
              {git.ahead > 0 && <span className="text-zinc-500"> · {git.ahead} commit(s) not pushed yet</span>}
            </p>
            {git.changes.length > 0 && (
              <ul className="mt-2 max-h-40 overflow-auto font-mono text-xs text-zinc-600">
                {git.changes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {dirty && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">You have unsaved changes. Save them first, or they won’t be included.</p>}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input className="ad-input" placeholder="What changed? e.g. Add new project" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button
            type="button"
            className="ad-btn ad-btn-primary"
            disabled={busy || !git || (!git.changes.length && !git.ahead)}
            onClick={async () => {
              setBusy(true);
              setLog('');
              try {
                const r = await api.publish(message);
                setLog(r.log);
                setMessage('');
                setToast({ kind: 'ok', text: 'Published to GitHub.' });
              } catch (e) {
                setLog(e instanceof ApiError && e.log ? e.log : '');
                setToast({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
              } finally {
                setBusy(false);
                refresh();
              }
            }}
          >
            {busy ? 'Publishing…' : 'Publish'}
          </button>
        </div>
        {log && <pre className="mt-3 max-h-60 overflow-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">{log}</pre>}
      </section>

      <hr className="border-zinc-200" />

      <section>
        <h2 className="text-base font-semibold">Earlier versions</h2>
        <p className="mt-1 text-sm text-zinc-500">A copy is kept every time you save (last 30). Restoring replaces the current content.</p>
        {backups.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">No saved versions yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200">
            {backups.map((b) => (
              <li key={b} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span>{pretty(b)}</span>
                <button
                  type="button"
                  className="ad-btn ad-btn-ghost !py-1 !text-xs"
                  onClick={async () => {
                    if (!confirm(`Restore the version from ${pretty(b)}? Your current content is backed up first.`)) return;
                    try {
                      await api.restore(b);
                      await onReload();
                      refresh();
                      setToast({ kind: 'ok', text: 'Version restored.' });
                    } catch (e) {
                      setToast({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
                    }
                  }}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login / states                                                      */
/* ------------------------------------------------------------------ */

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center p-6 text-sm text-zinc-500">{children}</div>;
}

function Blocked({ message }: { message: string }) {
  return (
    <Centered>
      <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-700 shadow-sm">
        <h1 className="text-lg font-semibold text-zinc-900">Admin unavailable</h1>
        <p className="mt-2">{message}</p>
        <p className="mt-4 text-xs text-zinc-500">
          To use the admin from another device, add a line <code className="rounded bg-zinc-100 px-1">ADMIN_PASSWORD=your-password</code> to <code className="rounded bg-zinc-100 px-1">.env.local</code> in the project folder and restart <code className="rounded bg-zinc-100 px-1">npm run dev</code>.
        </p>
      </div>
    </Centered>
  );
}

function Login({ onDone }: { onDone: () => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Centered>
      <form
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            const { token } = await api.login(password);
            setToken(token);
            await onDone();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1 className="text-lg font-semibold text-zinc-900">Portfolio Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter the admin password.</p>
        <input type="password" autoFocus className="ad-input mt-4" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button type="submit" className="ad-btn ad-btn-primary mt-4 w-full" disabled={busy || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </Centered>
  );
}
