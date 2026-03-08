/**
 * SOOZIP 이메일 발송 헬퍼
 * 우선순위:
 *   1. Resend API (RESEND_API_KEY 환경변수 설정 시) - 네이버/구글 등 모든 이메일 수신 가능
 *   2. SMTP (SMTP_HOST/SMTP_USER/SMTP_PASS 환경변수 설정 시) - Gmail 등 직접 SMTP
 *   3. 개발 모드 콘솔 출력 (환경변수 미설정 시)
 *
 * Resend 설정 방법:
 *   1. https://resend.com 에서 무료 계정 생성
 *   2. API Keys 메뉴에서 키 생성
 *   3. 프로젝트 Secrets에 RESEND_API_KEY 추가
 *   4. (선택) 발신 도메인 등록 시 RESEND_FROM_EMAIL 추가 (기본: onboarding@resend.dev)
 */
import { Resend } from "resend";
import nodemailer from "nodemailer";

/**
 * Resend API를 통한 이메일 발송
 */
async function sendWithResend(to: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const resend = new Resend(apiKey);
    // 도메인 미등록 시 onboarding@resend.dev 사용 (테스트용)
    // 도메인 등록 후에는 RESEND_FROM_EMAIL 환경변수로 변경 가능
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const fromName = process.env.RESEND_FROM_NAME || "SOOZIP";

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: "[SOOZIP] 이메일 인증 코드",
      html: buildEmailHtml(code),
    });

    if (error) {
      console.error("[Mailer/Resend] 발송 실패:", error);
      return false;
    }

    console.log(`[Mailer/Resend] 인증 코드 발송 완료: ${to}`);
    return true;
  } catch (err) {
    console.error("[Mailer/Resend] 오류:", err);
    return false;
  }
}

/**
 * SMTP를 통한 이메일 발송 (폴백)
 */
async function sendWithSmtp(to: string, code: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return false;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"SOOZIP" <${user}>`,
      to,
      subject: "[SOOZIP] 이메일 인증 코드",
      html: buildEmailHtml(code),
    });

    console.log(`[Mailer/SMTP] 인증 코드 발송 완료: ${to}`);
    return true;
  } catch (err) {
    console.error("[Mailer/SMTP] 오류:", err);
    return false;
  }
}

/**
 * 이메일 HTML 템플릿
 */
function buildEmailHtml(code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f9f9f9;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
              <!-- 헤더 -->
              <tr>
                <td style="background:#0a0a0a;padding:24px 32px;text-align:center;">
                  <span style="color:#ffffff;font-weight:900;font-size:20px;letter-spacing:4px;">SOOZIP</span>
                </td>
              </tr>
              <!-- 본문 -->
              <tr>
                <td style="padding:40px 32px;">
                  <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0a;text-align:center;">
                    이메일 인증 코드
                  </h2>
                  <p style="margin:0 0 32px;font-size:14px;color:#666;text-align:center;line-height:1.6;">
                    아래 인증 코드를 입력하여 이메일을 인증해 주세요.<br/>
                    코드는 <strong>10분</strong> 동안 유효합니다.
                  </p>
                  <!-- 코드 박스 -->
                  <div style="background:#f5f5f5;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
                    <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#0a0a0a;font-variant-numeric:tabular-nums;">
                      ${code}
                    </span>
                  </div>
                  <p style="margin:0;font-size:12px;color:#999;text-align:center;line-height:1.6;">
                    본인이 요청하지 않은 경우 이 이메일을 무시해 주세요.<br/>
                    인증 코드는 타인에게 공유하지 마세요.
                  </p>
                </td>
              </tr>
              <!-- 푸터 -->
              <tr>
                <td style="background:#f5f5f5;padding:16px 32px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#bbb;">© 2025 SOOZIP. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * 이메일 인증 코드 발송 (Resend → SMTP → 콘솔 순서로 시도)
 */
export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  // 1. Resend API 시도
  const resendResult = await sendWithResend(to, code);
  if (resendResult) return true;

  // 2. SMTP 시도
  const smtpResult = await sendWithSmtp(to, code);
  if (smtpResult) return true;

  // 3. 개발 환경 콘솔 출력
  console.log(`[Mailer] ⚠️  이메일 발송 설정 없음. 개발 모드 코드 출력:`);
  console.log(`[Mailer] 📧 수신: ${to} | 코드: ${code}`);
  console.log(`[Mailer] 💡 실제 발송을 위해 RESEND_API_KEY 환경변수를 설정하세요.`);
  return true; // 개발 환경에서는 성공으로 처리
}
