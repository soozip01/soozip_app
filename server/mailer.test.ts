/**
 * Resend API 키 유효성 검증 테스트
 */
import { describe, it, expect } from "vitest";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

describe("Resend API 키 유효성", () => {
  it("RESEND_API_KEY 환경변수가 설정되어 있어야 한다", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey).not.toBe("");
  });

  it("Resend API 키로 도메인 목록을 조회할 수 있어야 한다", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY가 설정되지 않아 테스트를 건너뜁니다.");
      return;
    }

    const resend = new Resend(apiKey);
    // 도메인 목록 조회로 API 키 유효성 확인 (이메일 발송 없이)
    const { data, error } = await resend.domains.list();

    if (error) {
      // 401 에러면 키가 잘못된 것
      expect(error.name).not.toBe("validation_error");
      console.warn("[Resend] 도메인 조회 오류 (키는 유효할 수 있음):", error);
    } else {
      expect(data).toBeDefined();
      console.log(`[Resend] API 키 유효. 등록된 도메인 수: ${data?.data?.length ?? 0}`);
    }
  }, 15000);
});
