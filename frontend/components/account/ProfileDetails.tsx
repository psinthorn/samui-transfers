"use client";

import { useLanguage } from "@/context/LanguageContext";
import { pick } from "@/data/i18n/core";
import { accountText } from "@/data/content/account";

export default function ProfileDetails({
  name,
  email,
  role,
}: {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}) {
  const { lang } = useLanguage();
  return (
    <dl className="divide-y">
      <div className="py-2 flex justify-between">
        <dt className="text-slate-500">{pick(lang, accountText.profile.name)}</dt>
        <dd className="font-medium text-slate-800">{name || "-"}</dd>
      </div>
      <div className="py-2 flex justify-between">
        <dt className="text-slate-500">{pick(lang, accountText.profile.email)}</dt>
        <dd className="font-medium text-slate-800">{email || "-"}</dd>
      </div>
      <div className="py-2 flex justify-between">
        <dt className="text-slate-500">{pick(lang, accountText.profile.role)}</dt>
        <dd className="font-medium text-slate-800">{role || "USER"}</dd>
      </div>
    </dl>
  );
}
