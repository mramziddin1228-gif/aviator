import { env } from '../config/env';

const toAbsoluteUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const parseBody = async <T>(response: Response) => {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
};

export async function apiGet<T>(path: string) {
  const response = await fetch(toAbsoluteUrl(path));
  const data = await parseBody<T & { error?: string }>(response);

  if (!response.ok) {
    throw new Error(data.error ?? `GET ${path} failed with ${response.status}`);
  }

  return data;
}

export async function apiPost<T>(path: string, body: unknown) {
  const response = await fetch(toAbsoluteUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await parseBody<T & { error?: string }>(response);

  if (!response.ok) {
    throw new Error(data.error ?? `POST ${path} failed with ${response.status}`);
  }

  return data;
}
