import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend 이메일 설정 검증", () => {
  it("RESEND_API_KEY 환경변수가 설정되어 있어야 한다", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey?.startsWith("re_")).toBe(true);
  });

  it("RESEND_FROM_EMAIL 환경변수가 설정되어 있어야 한다", () => {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    expect(fromEmail).toBeDefined();
    expect(fromEmail).not.toBe("");
    // 이메일 형식 검증
    expect(fromEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("RESEND_FROM_EMAIL이 soozip.org 도메인을 사용해야 한다", () => {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    expect(fromEmail).toContain("soozip.org");
  });

  it("Resend API 키가 유효하고 soozip.org 도메인이 인증되어 있어야 한다", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY가 없어 테스트를 건너뜁니다.");
      return;
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.domains.list();

    expect(error).toBeNull();
    expect(data?.data).toBeDefined();

    const verifiedDomain = data?.data?.find(
      (d) => d.name === "soozip.org" && d.status === "verified"
    );
    expect(verifiedDomain).toBeDefined();
  }, 15000);
});
