import { API_URL } from '../config';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

// Appelée quand le serveur répond 401 alors qu'on était connecté (session expirée).
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Une erreur inattendue est survenue.';
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Query = Record<string, string | number | undefined>;

interface RequestOptions {
  body?: unknown;
  query?: Query;
}

export async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  let url = `${API_URL}${path}`;

  if (options.query) {
    const parts = Object.entries(options.query)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    if (parts.length > 0) {
      url += `?${parts.join('&')}`;
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "Impossible de joindre le serveur. Vérifiez votre connexion et l'adresse de l'API.");
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(response.status, 'Réponse inattendue du serveur.');
  }

  if (!response.ok) {
    if (response.status === 401 && authToken && unauthorizedHandler) {
      unauthorizedHandler();
    }
    const serverMessage = (data as { error?: string } | null)?.error;
    throw new ApiError(response.status, serverMessage ?? `Erreur ${response.status}`);
  }

  return data as T;
}
