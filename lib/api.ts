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

  let refreshedUpfront = false;
  if (auth) {
    // 동적 import로 서버 컴포넌트(인증 불필요한 SSR 호출)에서 Redux 스토어를 끌어오지 않게 한다.
    const { store } = await import("@/store");
    let token = store.getState().auth.accessToken;
    // 새로고침 직후엔 accessToken이 아직 메모리에 없다 — 토큰 없이 보내 401을 받고 재시도하는 대신
    // 세션 복원(AuthBootstrap과 같은 single-flight 요청)을 먼저 기다린다.
    if (!token && !isRetry) {
      await refreshSession();
      refreshedUpfront = true;
      token = store.getState().auth.accessToken;
    }
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  // 방금 복원을 시도했는데도 401이면 세션이 없는 것이므로 한 번 더 갱신하지 않는다.
  if (res.status === 401 && auth && !isRetry && !refreshedUpfront) {
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

let refreshInFlight: Promise<boolean> | null = null;

// 세션 갱신은 반드시 이 함수 하나로만 한다 (AuthBootstrap도 이걸 쓴다).
// 백엔드가 refreshToken을 회전(rotation)시키므로, 같은 토큰으로 갱신이 두 번 나가면
// 두 번째는 이미 폐기된 토큰이라 401 → 라우트가 쿠키를 지워 로그아웃돼버린다.
// 관리자 페이지 새로고침 시 AuthBootstrap의 복원 요청과 "토큰 없이 나간 API의 401 재시도"가
// 동시에 겹쳐 실제로 이 문제가 났다 — 진행 중인 요청이 있으면 새로 보내지 않고 그 결과를 같이 기다린다.
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) return false;
    const data = await res.json();
    // 세션 쿠키가 아예 없는 경우도 이제 200 + accessToken: null로 내려온다
    // (app/api/auth/refresh/route.ts) — 실제로 토큰을 받았을 때만 갱신 성공으로 본다.
    if (!data.accessToken) return false;
    const { store } = await import("@/store");
    const { setSession } = await import("@/store/slices/auth-slice");
    store.dispatch(setSession({ accessToken: data.accessToken, user: data.user }));
    return true;
  } catch {
    return false;
  }
}

function tryRefreshAccessToken(): Promise<boolean> {
  return refreshSession();
}
