const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '');

if (!baseUrl) {
  throw new Error(
    'NEXT_PUBLIC_BACKEND_URL is not set. Please configure your environment.'
  );
}

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

const handleResponse = async (res: Response) => {
  const text = await res.text();
  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed with ${res.status}`;
    throw new Error(message);
  }
  return data;
};

export async function apiGet(path: string, options: RequestInit = {}) {
  const res = await fetch(buildUrl(path), {
    method: 'GET',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    },
    cache: options.cache ?? 'no-store'
  });
  return handleResponse(res);
}

export async function apiPost(
  path: string,
  body?: any,
  options: RequestInit = {}
) {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });
  return handleResponse(res);
}
