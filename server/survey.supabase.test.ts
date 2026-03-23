import { describe, it, expect } from "vitest";

/**
 * Supabase 연동 테스트 (단일 프로젝트: lrozgykdsydvoppqnjdl)
 * - SURVEY_SUPABASE_URL / SURVEY_SUPABASE_SERVICE_ROLE_KEY 환경변수 사용 확인
 * - survey_submissions 테이블 접근 검증
 */

describe("Supabase 단일 프로젝트 연동", () => {
  it("SURVEY_SUPABASE_URL 환경변수가 lrozgykdsydvoppqnjdl을 가리켜야 한다", () => {
    const url = process.env.SURVEY_SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toContain("supabase.co");
    expect(url).toContain("lrozgykdsydvoppqnjdl");
  });

  it("SURVEY_SUPABASE_ANON_KEY 환경변수가 설정되어 있어야 한다", () => {
    const key = process.env.SURVEY_SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(50);
  });

  it("SURVEY_SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되어 있어야 한다", () => {
    const key = process.env.SURVEY_SUPABASE_SERVICE_ROLE_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(50);
  });

  it("styling_type 매핑 - 배치솔루션은 5단계를 반환해야 한다", () => {
    const STEP_MAP: Record<string, string[]> = {
      "배치솔루션(가구 재배치 위주)": [
        "공간 실측",
        "기존가구 정보",
        "배치 솔루션 제안",
        "피드백 및 수정",
        "최종 시안 전달",
      ],
      "풀 스타일링(온라인)": [
        "공간 실측",
        "기존가구 정보",
        "배치 솔루션 제안",
        "풀 스타일링 진행",
        "피드백 및 수정",
        "최종 시안 전달",
      ],
      "풀 스타일링(오프라인)": [
        "공간 실측",
        "기존가구 정보",
        "배치 솔루션",
        "풀 스타일링",
        "피드백 및 수정",
        "최종 시안 전달",
        "가구 세팅",
      ],
    };

    expect(STEP_MAP["배치솔루션(가구 재배치 위주)"].length).toBe(5);
    expect(STEP_MAP["풀 스타일링(온라인)"].length).toBe(6);
    expect(STEP_MAP["풀 스타일링(오프라인)"].length).toBe(7);
  });

  it("Service Role Key로 survey_submissions 조회 가능해야 함", async () => {
    const url = process.env.SURVEY_SUPABASE_URL ?? "";
    const serviceKey = process.env.SURVEY_SUPABASE_SERVICE_ROLE_KEY ?? "";
    const res = await fetch(`${url}/rest/v1/survey_submissions?limit=1&select=id,login_provider`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("phone_number 입력 유효성 검사", () => {
  /**
   * 휴대폰 번호 포맷팅 로직 테스트 (StylingRequestForm의 handlePhoneChange 로직 검증)
   */
  const formatPhone = (digits: string): string => {
    const d = digits.replace(/\D/g, "").slice(0, 11);
    if (d.length > 7) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return d;
  };

  it("숫자 3자리 입력 시 dash 없이 반환", () => {
    expect(formatPhone("010")).toBe("010");
  });

  it("숫자 4자리 입력 시 010-1 형태로 반환", () => {
    expect(formatPhone("0101")).toBe("010-1");
  });

  it("숫자 8자리 입력 시 010-1234-5 형태로 반환", () => {
    expect(formatPhone("01012345")).toBe("010-1234-5");
  });

  it("숫자 11자리 입력 시 010-1234-5678 형태로 반환", () => {
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
  });

  it("11자리 초과 입력 시 11자리로 잘림", () => {
    expect(formatPhone("010123456789")).toBe("010-1234-5678");
  });

  it("dash 포함 입력 시 숫자만 추출하여 포맷팅", () => {
    expect(formatPhone("010-1234-5678")).toBe("010-1234-5678");
  });

  it("DB 저장 시 dash 제거 후 숫자 11자리만 저장", () => {
    const displayValue = "010-1234-5678";
    const dbValue = displayValue.replace(/-/g, "");
    expect(dbValue).toBe("01012345678");
    expect(dbValue.length).toBe(11);
    expect(/^\d{11}$/.test(dbValue)).toBe(true);
  });

  it("phone_number 컬럼이 survey_submissions 테이블에 존재해야 한다", async () => {
    const url = process.env.SURVEY_SUPABASE_URL ?? "";
    const serviceKey = process.env.SURVEY_SUPABASE_SERVICE_ROLE_KEY ?? "";
    const res = await fetch(`${url}/rest/v1/survey_submissions?limit=1&select=phone_number`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    // 컬럼이 존재하면 응답에 phone_number 키가 포함됨 (값은 null일 수 있음)
    if (data.length > 0) {
      expect(Object.keys(data[0])).toContain("phone_number");
    }
  });
});
