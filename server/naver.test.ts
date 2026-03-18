/**
 * 네이버 환경변수 유효성 검증 테스트
 */
import { describe, it, expect } from "vitest";
import dotenv from "dotenv";

dotenv.config();

describe("네이버 환경변수 유효성", () => {
  it("NAVER_CLIENT_ID 환경변수가 설정되어 있어야 한다", () => {
    const clientId = process.env.NAVER_CLIENT_ID;
    expect(clientId).toBeTruthy();
    expect(clientId!.length).toBeGreaterThan(5);
  });

  it("NAVER_CLIENT_SECRET 환경변수가 설정되어 있어야 한다", () => {
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    expect(clientSecret).toBeTruthy();
    expect(clientSecret!.length).toBeGreaterThan(5);
  });

  it("VITE_NAVER_CLIENT_ID가 NAVER_CLIENT_ID와 일치해야 한다", () => {
    const serverId = process.env.NAVER_CLIENT_ID;
    const viteId = process.env.VITE_NAVER_CLIENT_ID;
    // 둘 다 설정되어 있으면 동일해야 함
    if (serverId && viteId) {
      expect(viteId).toBe(serverId);
    } else {
      // VITE_NAVER_CLIENT_ID만 있어도 OK
      expect(viteId ?? serverId).toBeTruthy();
    }
  });
});
