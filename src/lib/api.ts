// (|/) Klaasvaakie is the author.
export type ApiCapabilityErrorCode =
  | 'api-disabled'
  | 'api-request-failed'
  | 'api-route-missing'
  | 'api-server-error'
  | 'api-unreachable'
  | 'admin-auth-required';

export interface ApiRuntimeStatus {
  enabled: boolean;
  baseUrl: string | null;
  missingConfig: string[];
  adminTokenConfigured: boolean;
  missingAdminAuthConfig: string[];
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  requireAdminAuth?: boolean;
}

export class ApiCapabilityError extends Error {
  code: ApiCapabilityErrorCode;
  status?: number;
  context?: {
    method: string;
    path: string;
    url: string;
  };

  constructor(
    code: ApiCapabilityErrorCode,
    message: string,
    status?: number,
    context?: { method: string; path: string; url: string },
  ) {
    super(message);
    this.name = 'ApiCapabilityError';
    this.code = code;
    this.status = status;
    this.context = context;
  }
}

const trimEnv = (value: string | undefined) => value?.trim() || '';

const apiBaseUrl = trimEnv(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '');
const adminToken = trimEnv(import.meta.env.VITE_API_ADMIN_TOKEN);
const missingConfig = apiBaseUrl ? [] : ['VITE_API_BASE_URL'];

export function getApiRuntimeStatus(): ApiRuntimeStatus {
  return {
    enabled: Boolean(apiBaseUrl),
    baseUrl: apiBaseUrl || null,
    missingConfig: [...missingConfig],
    adminTokenConfigured: Boolean(adminToken),
    missingAdminAuthConfig: adminToken ? [] : ['VITE_API_ADMIN_TOKEN'],
  };
}

function requireApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new ApiCapabilityError(
      'api-disabled',
      'Encore API is disabled because VITE_API_BASE_URL is missing.',
    );
  }

  return apiBaseUrl;
}

function buildHeaders(requireAdminAuth: boolean) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (requireAdminAuth) {
    if (!adminToken) {
      throw new ApiCapabilityError(
        'admin-auth-required',
        'Admin API writes are disabled because VITE_API_ADMIN_TOKEN is missing. The local admin password gate does not authorize Encore writes.',
      );
    }

    headers.Authorization = `Bearer ${adminToken}`;
  }

  return headers;
}

const classifyHttpFailure = (status: number): ApiCapabilityErrorCode => {
  if (status === 401 || status === 403) return 'admin-auth-required';
  if (status === 404) return 'api-route-missing';
  if (status >= 500) return 'api-server-error';
  return 'api-request-failed';
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = requireApiBaseUrl();
  const method = options.method || 'GET';
  const requireAdminAuth = Boolean(options.requireAdminAuth);
  const headers = buildHeaders(requireAdminAuth);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ApiCapabilityError(
      'api-unreachable',
      `Could not reach Encore API at ${baseUrl}. Request ${method} ${normalizedPath} failed before an HTTP response. ${reason}`,
      undefined,
      { method, path: normalizedPath, url },
    );
  }

  if (!response.ok) {
    let detail = '';

    try {
      const errorBody = await response.json() as { message?: string; error?: string };
      detail = errorBody.message || errorBody.error || '';
    } catch {
      // Ignore non-JSON error bodies.
    }

    const fallback = `${method} ${normalizedPath} failed with ${response.status}`;
    const message = detail ? `${fallback}: ${detail}` : fallback;
    throw new ApiCapabilityError(
      classifyHttpFailure(response.status),
      message,
      response.status,
      { method, path: normalizedPath, url },
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function probeCatalogueApi(): Promise<void> {
  await apiRequest('/catalogue/products?limit=1');
}
