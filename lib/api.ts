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
  // auth 토큰 주입은 T-25(인증)에서 구현한다. 지금은 시그니처만 고정해둔다.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { auth, ...init } = options ?? {};
  const isFormData = init.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

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
