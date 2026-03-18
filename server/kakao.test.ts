import { describe, it, expect } from "vitest";
import dotenv from "dotenv";
dotenv.config();

describe("카카오 환경변수 검증", () => {
  it("KAKAO_REST_API_KEY가 설정되어 있어야 한다", () => {
    const key = process.env.KAKAO_REST_API_KEY;
    expect(key).toBeTruthy();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("KAKAO_CLIENT_SECRET이 설정되어 있어야 한다", () => {
    const secret = process.env.KAKAO_CLIENT_SECRET;
    expect(secret).toBeTruthy();
    expect(secret!.length).toBeGreaterThan(10);
  });

  it("카카오 앱 키 형식이 올바른 hex 문자열이어야 한다", () => {
    const key = process.env.KAKAO_REST_API_KEY ?? "";
    // 카카오 REST API 키는 32자 hex 문자열
    expect(key).toMatch(/^[a-f0-9]{32}$/);
  });
});
