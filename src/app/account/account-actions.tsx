"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import type { Locale } from "@/lib/i18n/catalogs";

const authClient = createAuthClient();

export default function AccountActions({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button className="account-signout" type="button" onClick={signOut} disabled={pending}>
      {pending ? "…" : locale === "en" ? "Sign out" : locale === "kg" ? "Чыгуу" : "Выйти"}
    </button>
  );
}