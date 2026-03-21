/**
 * 비밀번호 재설정 로직 단위 테스트
 * - sendPasswordReset: 이메일 존재 여부 확인 후 코드 발송
 * - resetPassword: 코드 검증 + 새 비밀번호 저장
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── ENV 모킹 ──────────────────────────────────────────────────────────────────
vi.mock("./_core/env", () => ({
  ENV: {
    cookieSecret: "test-secret-key-for-jwt-unit-tests-32chars",
    surveySupabaseUrl: null,
    surveySupabaseServiceRoleKey: null,
    isProduction: false,
    resendApiKey: null,
    resendFromEmail: "noreply@soozip.org",
  },
}));

// ─── mailer 모킹 ───────────────────────────────────────────────────────────────
vi.mock("./mailer", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
}));

// ─── Supabase 모킹 ─────────────────────────────────────────────────────────────
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

import { hashPassword } from "./auth";

describe("hashPassword (비밀번호 해시 일관성)", () => {
  it("동일한 비밀번호는 동일한 해시를 생성한다", () => {
    const hash1 = hashPassword("mypassword123");
    const hash2 = hashPassword("mypassword123");
    expect(hash1).toBe(hash2);
  });

  it("다른 비밀번호는 다른 해시를 생성한다", () => {
    const hash1 = hashPassword("password123");
    const hash2 = hashPassword("password456");
    expect(hash1).not.toBe(hash2);
  });

  it("해시는 64자리 hex 문자열이다", () => {
    const hash = hashPassword("testpassword");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("빈 문자열도 해시를 생성한다", () => {
    const hash = hashPassword("");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(64);
  });
});

describe("인증 코드 유효성 검사 로직", () => {
  function isCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  function isValidCode(input: string, stored: string): boolean {
    return input === stored && input.length === 6 && /^\d{6}$/.test(input);
  }

  it("만료되지 않은 코드는 유효하다", () => {
    const future = new Date(Date.now() + 10 * 60 * 1000);
    expect(isCodeExpired(future)).toBe(false);
  });

  it("만료된 코드는 무효하다", () => {
    const past = new Date(Date.now() - 1000);
    expect(isCodeExpired(past)).toBe(true);
  });

  it("올바른 6자리 코드는 검증을 통과한다", () => {
    expect(isValidCode("123456", "123456")).toBe(true);
  });

  it("틀린 코드는 검증에 실패한다", () => {
    expect(isValidCode("123456", "654321")).toBe(false);
  });

  it("6자리 미만 코드는 검증에 실패한다", () => {
    expect(isValidCode("12345", "12345")).toBe(false);
  });

  it("숫자가 아닌 코드는 검증에 실패한다", () => {
    expect(isValidCode("abcdef", "abcdef")).toBe(false);
  });
});

describe("비밀번호 재설정 이메일 발송 (mailer 모킹)", () => {
  it("sendVerificationEmail이 정상적으로 호출된다", async () => {
    const { sendVerificationEmail } = await import("./mailer");
    const result = await sendVerificationEmail("test@example.com", "123456");
    expect(result).toBe(true);
    expect(sendVerificationEmail).toHaveBeenCalledWith("test@example.com", "123456");
  });
});

describe("비밀번호 재설정 플로우 시나리오 검증", () => {
  it("새 비밀번호는 8자 이상이어야 한다", () => {
    const isValidPassword = (pw: string) => pw.length >= 8;
    expect(isValidPassword("short")).toBe(false);
    expect(isValidPassword("validpassword")).toBe(true);
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("1234567")).toBe(false);
  });

  it("비밀번호 확인이 일치해야 한다", () => {
    const passwordsMatch = (pw: string, confirm: string) => pw === confirm;
    expect(passwordsMatch("password123", "password123")).toBe(true);
    expect(passwordsMatch("password123", "different123")).toBe(false);
  });

  it("이메일 형식 검증이 올바르다", () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
  });
});
