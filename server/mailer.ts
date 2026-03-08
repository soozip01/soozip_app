/**
 * SOOZIP 이메일 발송 헬퍼
 * Nodemailer를 사용하여 SMTP로 이메일 발송
 * 환경 변수: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Gmail 사용 시: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587
 */
import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[Mailer] SMTP 환경 변수가 설정되지 않았습니다. 이메일 발송이 비활성화됩니다.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

/**
 * 이메일 인증 코드 발송
 */
export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    // SMTP 미설정 시 개발 환경에서는 콘솔에 코드 출력
    console.log(`[Mailer] [개발 모드] ${to} 에게 인증 코드 발송: ${code}`);
    return true; // 개발 환경에서는 성공으로 처리
  }

  try {
    await transporter.sendMail({
      from: `"SOOZIP" <${process.env.SMTP_USER}>`,
      to,
      subject: "[SOOZIP] 이메일 인증 코드",
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fff;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #0a0a0a; color: #fff; font-weight: 900; font-size: 18px; letter-spacing: 4px; padding: 8px 16px; border-radius: 6px;">
              SOOZIP
            </div>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #0a0a0a; text-align: center; margin-bottom: 8px;">
            이메일 인증 코드
          </h2>
          <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 32px;">
            아래 인증 코드를 입력하여 이메일을 인증해 주세요.<br/>
            코드는 <strong>10분</strong> 동안 유효합니다.
          </p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0a0a0a;">
              ${code}
            </span>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center;">
            본인이 요청하지 않은 경우 이 이메일을 무시해 주세요.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 11px; color: #bbb; text-align: center;">
            © 2025 SOOZIP. All rights reserved.
          </p>
        </div>
      `,
    });
    console.log(`[Mailer] 인증 코드 이메일 발송 완료: ${to}`);
    return true;
  } catch (error) {
    console.error("[Mailer] 이메일 발송 실패:", error);
    return false;
  }
}
