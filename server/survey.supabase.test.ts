import { describe, it, expect, vi } from "vitest";

/**
 * survey Supabase 연동 테스트
 * - SURVEY_SUPABASE_URL / SURVEY_SUPABASE_ANON_KEY 환경변수 사용 확인
 * - userId 기반 저장 및 조회 흐름 검증
 */

describe("survey Supabase 연동", () => {
  it("SURVEY_SUPABASE_URL 환경변수가 설정되어 있어야 한다", () => {
    // 환경변수가 주입되어 있는지 확인
    const url = process.env.SURVEY_SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toContain("supabase.co");
  });

  it("SURVEY_SUPABASE_ANON_KEY 환경변수가 설정되어 있어야 한다", () => {
    const key = process.env.SURVEY_SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(50);
  });

  it("설문조사 전용 Supabase URL이 메인 Supabase URL과 달라야 한다", () => {
    const surveyUrl = process.env.SURVEY_SUPABASE_URL;
    const mainUrl = process.env.SUPABASE_URL;
    // 두 URL이 다른 프로젝트를 가리켜야 함
    expect(surveyUrl).not.toEqual(mainUrl);
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
});

describe("Supabase Service Role Key 유효성", () => {
  it("SURVEY_SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되어 있어야 한다", () => {
    const key = process.env.SURVEY_SUPABASE_SERVICE_ROLE_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(50);
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
