type OTPType = "sign-in" | "email-verification" | "forget-password" | "change-email";

const subjects: Record<OTPType, string> = {
  "sign-in": "Код для входа в Окурмэн айти",
  "email-verification": "Подтвердите email в Окурмэн айти",
  "forget-password": "Код для сброса пароля",
  "change-email": "Подтвердите изменение email",
};

export async function sendAuthOTP({ email, otp, type }: {
  email: string;
  otp: string;
  type: OTPType;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: subjects[type],
      text: `Ваш код: ${otp}\n\nОн действует 5 минут. Если вы не запрашивали код, проигнорируйте это письмо.`,
      html: `<main style="font-family:Arial,sans-serif;color:#252622"><p>Ваш код подтверждения:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p><p>Код действует 5 минут. Если вы не запрашивали его, проигнорируйте это письмо.</p></main>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed with status ${response.status}.`);
  }
}