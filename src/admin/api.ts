import type { Content } from '../data/portfolio';

const TOKEN_KEY = 'portfolio-admin-token';

function token() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setToken(t: string) {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: the session just won't survive a reload */
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public log?: string) {
    super(message);
  }
}

async function call<T>(method: string, path: string, body?: BodyInit, type?: string): Promise<T> {
  const headers: Record<string, string> = {};
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (type) headers['Content-Type'] = type;
  let res: Response;
  try {
    res = await fetch(`/__admin/api${path}`, { method, headers, body });
  } catch {
    throw new ApiError(0, 'Cannot reach the dev server. Is `npm run dev` still running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.log);
  return data as T;
}

const json = (v: unknown) => JSON.stringify(v);

export type Crop = { left: number; top: number; width: number; height: number };
export type GitStatus = { branch: string; remote: string; changes: string[]; ahead: number };

export const api = {
  session: () => call<{ authRequired: boolean; authed: boolean; local: boolean }>('GET', '/session'),
  login: (password: string) => call<{ token: string }>('POST', '/login', json({ password }), 'application/json'),
  logout: () => call('POST', '/logout'),
  content: () => call<Content>('GET', '/content'),
  save: (c: Content) => call('PUT', '/content', json(c), 'application/json'),
  photo: (file: File, crop: 'auto' | 'keep') => call<{ crop: Crop }>('POST', `/photo?crop=${crop}`, file, file.type),
  recrop: (crop: 'auto' | Crop) => call<{ crop: Crop }>('POST', '/recrop', json({ crop }), 'application/json'),
  resume: (file: File) => call<{ path: string; bytes: number }>('POST', '/resume', file, 'application/pdf'),
  backups: () => call<{ backups: string[] }>('GET', '/backups'),
  restore: (name: string) => call('POST', '/restore', json({ name }), 'application/json'),
  git: () => call<GitStatus>('GET', '/git'),
  publish: (message: string) => call<{ log: string }>('POST', '/publish', json({ message }), 'application/json'),
};
