import { describe, it, expect } from "vitest";

describe("Kakao API Key Environment Variable", () => {
  it("KAKAO_REST_API_KEY should be set", () => {
    const key = process.env.KAKAO_REST_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(0);
  });

  it("NAVER_CLIENT_ID should be set", () => {
    const clientId = process.env.NAVER_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId?.length).toBeGreaterThan(0);
  });

  it("NAVER_CLIENT_SECRET should be set", () => {
    const secret = process.env.NAVER_CLIENT_SECRET;
    expect(secret).toBeDefined();
    expect(secret?.length).toBeGreaterThan(0);
  });

  it("OAuth URL can be constructed for Kakao", () => {
    const key = process.env.KAKAO_REST_API_KEY ?? "";
    const redirectUri = "https://example.com/auth/callback?provider=kakao";
    const oauthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${key}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    expect(oauthUrl).toContain("kauth.kakao.com");
    expect(oauthUrl).toContain(key);
  });
});
