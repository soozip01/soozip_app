/**
 * SOOZIP 통합 인증 모듈
 *
 * - Access Token: 15분 유효, 클라이언트 localStorage에 저장
 * - Refresh Token: 30일 유효, HttpOnly 쿠키에 저장 + DB에 해시 저장
 * - 통합 soozip_users 테이블 사용 (카카오/네이버/이메일 통합)
 */
import * as crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { soozipUsers, refreshTokens } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ─── 상수 ────────────────────────────────────────────────────────────────────
export const REFRESH_TOKEN_COOKIE = "soozip_refresh";
const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "soozip-secret-key-2024");
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = 30;

// ─── 타입 ────────────────────────────────────────────────────────────────────
export interface TokenPayload {
  sub: string;       // soozipUsers.id (string)
  nickname: string;
  provider: string;
  role: string;
  type: "access" | "refresh";
  [key: string]: unknown; // JWTPayload 호환
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── 비밀번호 해시 ────────────────────────────────────────────────────────────
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "soozip_salt_2024").digest("hex");
}

// ─── Refresh Token 해시 (DB 저장용) ──────────────────────────────────────────
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ─── Access Token 발급 ────────────────────────────────────────────────────────
export async function createAccessToken(user: {
  id: number;
  nickname: string;
  provider: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    sub: String(user.id),
    nickname: user.nickname,
    provider: user.provider,
    role: user.role,
    type: "access",
  } as TokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES)
    .sign(JWT_SECRET);
}

// ─── Refresh Token 발급 + DB 저장 ────────────────────────────────────────────
export async function createRefreshToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB 연결 오류");

  // 랜덤 토큰 생성 (64바이트 hex)
  const rawToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  // 기존 토큰 무효화 (선택적 - 단일 세션 정책)
  // await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    expiresAt,
    revoked: false,
  });

  return rawToken;
}

// ─── Access Token 검증 ────────────────────────────────────────────────────────
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "access") return null;
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Refresh Token 검증 + 새 Access Token 발급 ───────────────────────────────
export async function refreshAccessToken(rawRefreshToken: string): Promise<{
  accessToken: string;
  user: { id: number; nickname: string; provider: string; role: string; email: string | null };
} | null> {
  const db = await getDb();
  if (!db) return null;

  const tokenHash = hashToken(rawRefreshToken);

  // DB에서 토큰 조회
  const tokenRecord = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.revoked, false)))
    .limit(1);

  if (tokenRecord.length === 0) return null;

  const record = tokenRecord[0];

  // 만료 확인
  if (new Date() > record.expiresAt) {
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, record.id));
    return null;
  }

  // 사용자 조회
  const userRecord = await db
    .select()
    .from(soozipUsers)
    .where(eq(soozipUsers.id, record.userId))
    .limit(1);

  if (userRecord.length === 0) return null;

  const user = userRecord[0];
  const accessToken = await createAccessToken({
    id: user.id,
    nickname: user.nickname,
    provider: user.provider,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      nickname: user.nickname,
      provider: user.provider,
      role: user.role,
      email: user.email ?? null,
    },
  };
}

// ─── Refresh Token 무효화 (로그아웃) ─────────────────────────────────────────
export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const tokenHash = hashToken(rawRefreshToken);
  await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.tokenHash, tokenHash));
}

// ─── 사용자 전체 토큰 무효화 (보안 이슈 시) ──────────────────────────────────
export async function revokeAllUserTokens(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));
}

// ─── 닉네임 중복 확인 (통합 테이블) ──────────────────────────────────────────
export async function isNicknameTaken(nickname: string, excludeUserId?: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select({ id: soozipUsers.id })
    .from(soozipUsers)
    .where(eq(soozipUsers.nickname, nickname))
    .limit(1);
  if (excludeUserId) {
    return rows.some(r => r.id !== excludeUserId);
  }
  return rows.length > 0;
}

// ─── Supabase users 테이블 동기화 ────────────────────────────────────────────
export async function syncToSupabase(userId: number, userLogin: string): Promise<void> {
  const supabaseUrl = ENV.surveySupabaseUrl;
  const supabaseKey = ENV.surveySupabaseServiceRoleKey;
  if (!supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ user_id: String(userId), user_login: userLogin }),
    });
  } catch (e) {
    console.warn("[Supabase sync] 동기화 실패 (무시):", e);
  }
}

// ─── Refresh Token 쿠키 옵션 ─────────────────────────────────────────────────
export function getRefreshCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}
