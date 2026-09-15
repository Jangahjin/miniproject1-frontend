export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: { field: string; reason: string }[],
    public traceId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { auth?: boolean }
): Promise<T> {
  return apiFetchInternal<T>(path, options, false);
}

async function apiFetchInternal<T>(
  path: string,
  options: (RequestInit & { auth?: boolean }) | undefined,
  isRetry: boolean
): Promise<T> {
  const { auth, ...init } = options ?? {};
  const isFormData = init.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init.headers as Record<string, string> | undefined),
  };

  if (auth) {
    // 동적 import로 서버 컴포넌트(인증 불필요한 SSR 호출)에서 Redux 스토어를 끌어오지 않게 한다.
    const { store } = await import("@/store");
    const token = store.getState().auth.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && auth && !isRetry) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) return apiFetchInternal<T>(path, options, true);
  }

  if (!res.ok) {
    try {
      const body = await res.json();
      throw new ApiError(res.status, body.code, body.message, body.fieldErrors, body.traceId);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // 에러 바디가 JSON이 아닐 수 있다 (예: HTML 에러 페이지)
      throw new ApiError(res.status, "UNKNOWN", res.statusText);
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

async function tryRefreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) return false;
    const data = await res.json();
    const { store } = await import("@/store");
    const { setSession } = await import("@/store/slices/auth-slice");
    store.dispatch(setSession({ accessToken: data.accessToken, user: data.user }));
    return true;
  } catch {
    return false;
  }
}
