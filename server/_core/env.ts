export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.SUPABASE_DB_URL ?? "",
  supabaseDbUrl: process.env.SUPABASE_DB_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // 소셜 로그인
  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY ?? "",
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
  naverClientId: process.env.NAVER_CLIENT_ID ?? "",
  naverClientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
  // Supabase - 단일 프로젝트 (lrozgykdsydvoppqnjdl) 통합
  // SURVEY_SUPABASE_* 를 우선 사용하고, 없으면 SUPABASE_* 폴백
  supabaseUrl: process.env.SURVEY_SUPABASE_URL || process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SURVEY_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  // surveySupabase* 는 하위 호환을 위해 동일 값으로 유지
  get surveySupabaseUrl() { return this.supabaseUrl; },
  get surveySupabaseAnonKey() { return this.supabaseAnonKey; },
  surveySupabaseServiceRoleKey: process.env.SURVEY_SUPABASE_SERVICE_ROLE_KEY ?? "",
  // SMTP (이메일 발송)
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
};
