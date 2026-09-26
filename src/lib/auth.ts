import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { getPrisma } from "@/lib/prisma";
import { sendAuthOTP } from "@/lib/auth-email";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const googleAuthEnabled = Boolean(googleClientId && googleClientSecret);
export const emailDeliveryEnabled = Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM);

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || secret.length < 32) {
    throw new Error("Set BETTER_AUTH_SECRET to a random value with at least 32 characters.");
  }
  if (!baseURL) {
    throw new Error("Set BETTER_AUTH_URL to the canonical application URL.");
  }

  return betterAuth({
    database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
    baseURL,
    secret,
    trustedOrigins: [baseURL, process.env.NEXT_PUBLIC_APP_URL]
      .filter((origin): origin is string => Boolean(origin)),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      requireEmailVerification: emailDeliveryEnabled,
      autoSignIn: !emailDeliveryEnabled,
      revokeSessionsOnPasswordReset: true,
    },
    socialProviders: googleAuthEnabled
      ? {
          google: {
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            requireEmailVerification: true,
          },
        }
      : {},
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 5,
        storeOTP: "hashed",
        sendVerificationOnSignUp: emailDeliveryEnabled,
        overrideDefaultEmailVerification: true,
        sendVerificationOTP: sendAuthOTP,
      }),
    ],
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth(): ReturnType<typeof createAuth> {
  return (authInstance ??= createAuth());
}
