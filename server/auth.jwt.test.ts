/**
 * JWT 통합 인증 시스템 테스트
 * - createAccessToken / verifyAccessToken
 * - createRefreshToken / refreshAccessToken / revokeRefreshToken
 * - syncToSupabase (mock)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAccessToken, verifyAccessToken } from "./auth";

// ─── DB 모킹 ─────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── ENV 모킹 ─────────────────────────────────────────────────────────────────
vi.mock("./_core/env", () => ({
  ENV: {
    cookieSecret: "test-secret-key-for-jwt-unit-tests-32chars",
    surveySupabaseUrl: null,
    surveySupabaseServiceRoleKey: null,
    isProduction: false,
  },
}));

describe("JWT Access Token", () => {
  const mockUser = {
    id: 42,
    nickname: "테스트유저",
    provider: "email",
    role: "user",
  };

  it("Access Token을 생성할 수 있다", async () => {
    const token = await createAccessToken(mockUser);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT 형식 확인
  });

  it("생성된 Access Token을 검증할 수 있다", async () => {
    const token = await createAccessToken(mockUser);
    const payload = await verifyAccessToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("42");
    expect(payload?.nickname).toBe("테스트유저");
    expect(payload?.provider).toBe("email");
    expect(payload?.role).toBe("user");
    expect(payload?.type).toBe("access");
  });

  it("잘못된 토큰은 null을 반환한다", async () => {
    const result = await verifyAccessToken("invalid.token.here");
    expect(result).toBeNull();
  });

  it("빈 문자열 토큰은 null을 반환한다", async () => {
    const result = await verifyAccessToken("");
    expect(result).toBeNull();
  });

  it("다른 type의 토큰은 null을 반환한다", async () => {
    // refresh type 토큰을 access 검증에 사용하면 null 반환
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode("test-secret-key-for-jwt-unit-tests-32chars");
    const fakeToken = await new SignJWT({ sub: "1", type: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);
    const result = await verifyAccessToken(fakeToken);
    expect(result).toBeNull();
  });

  it("서로 다른 사용자의 토큰은 다르다", async () => {
    const token1 = await createAccessToken({ ...mockUser, id: 1 });
    const token2 = await createAccessToken({ ...mockUser, id: 2 });
    expect(token1).not.toBe(token2);
  });

  it("Access Token payload에 만료 시간이 포함된다", async () => {
    const token = await createAccessToken(mockUser);
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    expect(payload.exp).toBeDefined();
    expect(payload.iat).toBeDefined();
    // 만료 시간이 현재보다 미래여야 함
    expect(payload.exp * 1000).toBeGreaterThan(Date.now());
  });
});

describe("토큰 만료 감지 (클라이언트 측 유틸리티)", () => {
  function isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() / 1000 >= (payload.exp as number) - 30;
    } catch {
      return true;
    }
  }

  it("유효한 토큰은 만료되지 않은 것으로 판단한다", async () => {
    const token = await createAccessToken({
      id: 1, nickname: "test", provider: "email", role: "user"
    });
    expect(isTokenExpired(token)).toBe(false);
  });

  it("잘못된 형식의 토큰은 만료된 것으로 판단한다", () => {
    expect(isTokenExpired("not.a.token")).toBe(true);
    expect(isTokenExpired("")).toBe(true);
  });
});
