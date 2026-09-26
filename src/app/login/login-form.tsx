"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Locale } from "@/lib/i18n/catalogs";

const authClient = createAuthClient({ plugins: [emailOTPClient()] });
type Mode = "login" | "signup" | "verify" | "forgot" | "reset";

type AuthCopy = {
  titles: Record<Mode, string>;
  name: string;
  email: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  confirmPassword: string;
  code: string;
  remember: string;
  forgot: string;
  submit: Record<Mode, string>;
  switchText: string;
  switchAction: string;
  divider: string;
  google: string;
  googleUnavailable: string;
  resend: string;
  resendCountdown: string;
  backToLogin: string;
  genericError: string;
  passwordMismatch: string;
  verificationSent: string;
  resetSent: string;
  verified: string;
  resetDone: string;
  checkInbox: string;
};

const copy: Record<Locale, AuthCopy> = {
  ru: {
    titles: { login: "Вход", signup: "Регистрация", verify: "Подтверждение почты", forgot: "Восстановление пароля", reset: "Новый пароль" },
    name: "Имя", email: "Email", password: "Пароль", showPassword: "Показать пароль", hidePassword: "Скрыть пароль", confirmPassword: "Повторите пароль", code: "Код из письма", remember: "Запомнить меня", forgot: "Забыли пароль?",
    submit: { login: "Войти", signup: "Создать аккаунт", verify: "Подтвердить email", forgot: "Отправить код", reset: "Сохранить новый пароль" },
    switchText: "Нет аккаунта?", switchAction: "Зарегистрироваться", divider: "или войти через", google: "Продолжить с Google", googleUnavailable: "Вход через Google пока не настроен.",
    resend: "Отправить код повторно", resendCountdown: "Повторная отправка через", backToLogin: "Вернуться ко входу", genericError: "Не удалось выполнить запрос. Проверьте данные и попробуйте ещё раз.", passwordMismatch: "Пароли не совпадают.", verificationSent: "Код отправлен. Проверьте входящие письма.", resetSent: "Если аккаунт существует, код уже отправлен на почту.", verified: "Email подтверждён. Теперь можно войти.", resetDone: "Пароль изменён. Войдите с новым паролем.", checkInbox: "Если письма нет, проверьте папку «Спам»."
  },
  en: {
    titles: { login: "Sign in", signup: "Create account", verify: "Verify email", forgot: "Reset password", reset: "New password" },
    name: "Name", email: "Email", password: "Password", showPassword: "Show password", hidePassword: "Hide password", confirmPassword: "Confirm password", code: "Email code", remember: "Remember me", forgot: "Forgot password?",
    submit: { login: "Sign in", signup: "Create account", verify: "Verify email", forgot: "Send code", reset: "Save new password" },
    switchText: "New here?", switchAction: "Create an account", divider: "or continue with", google: "Continue with Google", googleUnavailable: "Google sign-in is not configured yet.",
    resend: "Resend code", resendCountdown: "Resend available in", backToLogin: "Back to sign in", genericError: "Couldn't complete the request. Check your details and try again.", passwordMismatch: "Passwords do not match.", verificationSent: "Code sent. Check your inbox.", resetSent: "If an account exists, a recovery code has been sent.", verified: "Email verified. You can now sign in.", resetDone: "Password updated. Sign in with your new password.", checkInbox: "If you don't see the email, check your spam folder."
  },
  kg: {
    titles: { login: "Кирүү", signup: "Катталуу", verify: "Email ырастоо", forgot: "Сырсөздү калыбына келтирүү", reset: "Жаңы сырсөз" },
    name: "Аты", email: "Email", password: "Сырсөз", showPassword: "Сырсөздү көрсөтүү", hidePassword: "Сырсөздү жашыруу", confirmPassword: "Сырсөздү кайталаңыз", code: "Почтадагы код", remember: "Мени эстеп кал", forgot: "Сырсөздү унуттуңузбу?",
    submit: { login: "Кирүү", signup: "Аккаунт түзүү", verify: "Email'ди ырастоо", forgot: "Код жөнөтүү", reset: "Жаңы сырсөздү сактоо" },
    switchText: "Аккаунтуңуз жокпу?", switchAction: "Катталуу", divider: "же Google менен", google: "Google менен улантуу", googleUnavailable: "Google аркылуу кирүү азырынча жөндөлө элек.",
    resend: "Кодду кайра жөнөтүү", resendCountdown: "Кайра жөнөтүүгө чейин", backToLogin: "Кирүүгө кайтуу", genericError: "Сурам аткарылган жок. Маалыматты текшерип, кайра аракет кылыңыз.", passwordMismatch: "Сырсөздөр дал келбейт.", verificationSent: "Код жөнөтүлдү. Почтаңызды текшериңиз.", resetSent: "Аккаунт бар болсо, калыбына келтирүү коду жөнөтүлдү.", verified: "Email ырасталды. Эми кирсеңиз болот.", resetDone: "Сырсөз жаңыртылды. Жаңы сырсөз менен кириңиз.", checkInbox: "Кат көрүнбөсө, спам папкасын текшериңиз."
  }
};

export default function LoginForm({ locale, googleEnabled, emailEnabled }: { locale: Locale; googleEnabled: boolean; emailEnabled: boolean }) {
  const router = useRouter();
  const text = copy[locale];
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [resendWait, setResendWait] = useState(0);

  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = window.setTimeout(() => setResendWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendWait]);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
    if (nextMode === "verify" || nextMode === "reset") setResendWait(60);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    try {
      if ((mode === "signup" || mode === "reset") && password !== confirmPassword) {
        setError(text.passwordMismatch);
        return;
      }

      if (mode === "login") {
        const { error: signInError } = await authClient.signIn.email({ email, password, rememberMe });
        if (signInError) {
          if (emailEnabled && (signInError.status === 403 || signInError.code === "EMAIL_NOT_VERIFIED")) {
            await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
            setOtp("");
            changeMode("verify");
            setNotice(text.verificationSent);
            return;
          }
          setError(text.genericError);
          return;
        }
        router.replace("/account");
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
        if (signUpError) {
          setError(text.genericError);
          return;
        }
        if (emailEnabled) {
          setOtp("");
          changeMode("verify");
          setNotice(text.verificationSent);
        } else {
          router.replace("/account");
          router.refresh();
        }
        return;
      }

      if (mode === "verify") {
        const { error: verifyError } = await authClient.emailOtp.verifyEmail({ email, otp });
        if (verifyError) {
          setError(text.genericError);
          return;
        }
        changeMode("login");
        setNotice(text.verified);
        return;
      }

      if (mode === "forgot") {
        const { error: requestError } = await authClient.emailOtp.requestPasswordReset({ email });
        if (requestError) {
          setError(text.genericError);
          return;
        }
        setOtp("");
        changeMode("reset");
        setNotice(text.resetSent);
        return;
      }

      const { error: resetError } = await authClient.emailOtp.resetPassword({ email, otp, password });
      if (resetError) {
        setError(text.genericError);
        return;
      }
      changeMode("login");
      setNotice(text.resetDone);
    } catch {
      setError(text.genericError);
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    if (pending || resendWait > 0) return;
    setPending(true);
    setError("");
    try {
      if (mode === "verify") {
        const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
        if (resendError) {
          setError(text.genericError);
          return;
        }
        setNotice(text.verificationSent);
      } else {
        const { error: resendError } = await authClient.emailOtp.requestPasswordReset({ email });
        if (resendError) {
          setError(text.genericError);
          return;
        }
        setNotice(text.resetSent);
      }
      setResendWait(60);
    } catch {
      setError(text.genericError);
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    if (!googleEnabled || pending) return;
    setPending(true);
    setError("");
    try {
      const { error: socialError } = await authClient.signIn.social({ provider: "google", callbackURL: "/account" });
      if (!socialError) return;
      setError(text.genericError);
    } catch {
      setError(text.genericError);
    }
    setPending(false);
  }

  const showName = mode === "signup";
  const showEmail = mode !== "verify" && mode !== "reset";
  const showCode = mode === "verify" || mode === "reset";
  const showPasswordField = mode === "login" || mode === "signup" || mode === "reset";
  const fieldStyle = (index: number) => ({ "--auth-field-index": index } as CSSProperties);

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <header className="auth-panel-heading">
        <h2 id="auth-title">{text.titles[mode]}</h2>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        {showName && (
          <label className="auth-field" style={fieldStyle(0)}>
            <span>{text.name}</span>
            <input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        )}
        {showEmail && (
          <label className="auth-field" style={fieldStyle(showName ? 1 : 0)}>
            <span>{text.email}</span>
            <div className="auth-input-wrap">
              <svg className="auth-icon-filled" aria-hidden="true" viewBox="0 0 32 32"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" /></svg>
              <input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </label>
        )}
        {showCode && (
          <label className="auth-field" style={fieldStyle(1)}>
            <span>{text.code}</span>
            <input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} />
          </label>
        )}
        {showPasswordField && (
          <label className="auth-field" style={fieldStyle(showName ? 2 : showEmail ? 1 : 2)}>
            <span>{text.password}</span>
            <div className="auth-input-wrap">
              <svg className="auth-icon-filled" aria-hidden="true" viewBox="-64 0 512 512"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" /></svg>
              <input autoComplete={mode === "login" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} minLength={10} required value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? text.hidePassword : text.showPassword} title={showPassword ? text.hidePassword : text.showPassword}>
                <svg className="auth-eye-icon" aria-hidden="true" viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4 142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32ZM144 256a144 144 0 1 1 288 0 144 144 0 1 1-288 0Zm144-64c0 35.3-28.7 64-64 64-7.1 0-13.9-1.2-20.3-3.3-5.5-1.8-11.9 1.6-11.7 7.4.3 6.9 1.3 13.8 3.2 20.7 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1-5.8-.2-9.2 6.1-7.4 11.7 2.1 6.4 3.3 13.2 3.3 20.3Z" /></svg>
              </button>
            </div>
          </label>
        )}
        {(mode === "signup" || mode === "reset") && (
          <label className="auth-field" style={fieldStyle(3)}>
            <span>{text.confirmPassword}</span>
            <input autoComplete="new-password" type={showPassword ? "text" : "password"} minLength={10} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
        )}

        {mode === "login" && (
          <div className="auth-options">
            <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>{text.remember}</span></label>
            {emailEnabled && <button type="button" className="auth-text-button" onClick={() => changeMode("forgot")}>{text.forgot}</button>}
          </div>
        )}

        {notice && <p className="auth-notice" role="status">{notice} {showCode && <span>{text.checkInbox}</span>}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? <span className="auth-spinner" aria-hidden="true" /> : text.submit[mode]}
        </button>
      </form>

      {(mode === "verify" || mode === "reset") && (
        <button className="auth-resend" type="button" onClick={resendCode} disabled={pending || resendWait > 0}>
          {resendWait > 0 ? `${text.resendCountdown} ${resendWait}${locale === "en" ? "s" : "с"}` : text.resend}
        </button>
      )}

      {mode === "login" || mode === "signup" ? (
        <>
          <p className="auth-switch">
            {mode === "login" ? text.switchText : locale === "en" ? "Already have an account?" : locale === "kg" ? "Аккаунтуңуз барбы?" : "Уже есть аккаунт?"}{" "}
            <button type="button" className="auth-text-button" onClick={() => changeMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? text.switchAction : text.backToLogin}
            </button>
          </p>
          <div className="auth-divider"><span>{text.divider}</span></div>
          <button className="auth-google" type="button" onClick={signInWithGoogle} disabled={!googleEnabled || pending} title={!googleEnabled ? text.googleUnavailable : undefined}>
            <svg className="auth-google-mark" aria-hidden="true" viewBox="0 0 512 512">
              <path fill="#FBBB00" d="M113.47 309.408 95.648 375.94l-65.139 1.378C11.042 341.211 0 299.9 0 256c0-42.451 10.324-82.483 28.624-117.732l57.992 10.632 25.404 57.644c-5.317 15.501-8.215 32.141-8.215 49.456 0 18.792 3.404 36.797 9.665 53.408Z" />
              <path fill="#518EF8" d="M507.527 208.176C510.467 223.662 512 239.655 512 256c0 18.328-1.927 36.206-5.598 53.451-12.462 58.683-45.025 109.925-90.134 146.187l-.014-.014-73.044-3.727-10.338-64.535c29.932-17.554 53.324-45.025 65.646-77.911h-136.89V208.176h138.887L507.527 208.176 507.527 208.176z" />
              <path fill="#28B446" d="M416.253 455.624C372.396 490.901 316.666 512 256 512c-97.491 0-182.252-54.491-225.491-134.681l82.961-67.91c21.619 57.698 77.278 98.771 142.53 98.771 28.047 0 54.323-7.582 76.87-20.818l83.383 68.262Z" />
              <path fill="#F14336" d="m419.404 58.936-82.933 67.896c-23.335-14.586-50.919-23.012-80.471-23.012-66.729 0-123.429 42.957-143.965 102.724l-83.411-68.29C71.23 56.123 157.06 0 256 0c62.115 0 119.068 22.126 163.404 58.936Z" />
            </svg>{text.google}
          </button>
          {!googleEnabled && <p className="auth-google-note">{text.googleUnavailable}</p>}
        </>
      ) : (
        <button className="auth-text-button auth-back-login" type="button" onClick={() => changeMode("login")}>{text.backToLogin}</button>
      )}
    </section>
  );
}
