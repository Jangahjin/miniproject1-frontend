import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "./api";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("정상 응답이면 파싱된 JSON을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const result = await apiFetch<{ id: number }>("/api/v1/test");

    expect(result).toEqual({ id: 1 });
  });

  it("JSON 에러 응답이면 ApiError 필드를 그대로 담아 던진다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "NOT_FOUND", message: "없음", traceId: "t-1" }), {
          status: 404,
        })
      )
    );

    await expect(apiFetch("/api/v1/test")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "없음",
      traceId: "t-1",
    });
  });

  it("비-JSON 에러 응답(HTML 등)이면 UNKNOWN 코드로 ApiError를 던진다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>502 Bad Gateway</html>", {
          status: 502,
          statusText: "Bad Gateway",
        })
      )
    );

    await expect(apiFetch("/api/v1/test")).rejects.toMatchObject({
      status: 502,
      code: "UNKNOWN",
    });
  });

  it("204 No Content면 undefined를 반환한다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    const result = await apiFetch("/api/v1/test");

    expect(result).toBeUndefined();
  });
});
