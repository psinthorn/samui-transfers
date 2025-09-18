"use client";

import { useState, useTransition } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { accountText } from "@/data/content/account";
import { pick } from "@/data/i18n/core";
import { updateSettings } from "@/actions/settings";
import { useToast } from "@/components/ui/toast";

export default function SettingsForm({
  initialLang,
  initialMarketingEmails = false,
}: {
  initialLang: "en" | "th";
  initialMarketingEmails?: boolean;
}) {
  const { lang, setLang } = useLanguage();
  const [preferredLang, setPreferredLang] = useState<"en" | "th">(initialLang);
  const [marketing, setMarketing] = useState<boolean>(initialMarketingEmails);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  return (
    <form
      action={async (formData) => {
        startTransition(async () => {
          try {
            const res = await updateSettings(formData);
            if (res?.ok) {
              push({ type: "success", message: pick(lang, accountText.settings.saved) });
              // Sync LanguageContext for UI labels; if server suggests reload (for Maps/Places), do it
              if (preferredLang !== lang) setLang(preferredLang);
              if (res.reload) {
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set("lang", res.preferredLanguage || preferredLang);
                  window.location.replace(url.toString());
                } catch {
                  window.location.reload();
                }
              }
            } else if (res?.message) {
              push({ type: "error", message: res.message });
            }
          } catch (e) {
            push({ type: "error", message: (e as Error).message });
          }
        });
      }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="preferredLanguage" className="text-sm text-slate-600">
          {pick(lang, accountText.settings.preferredLanguage)}
        </label>
        <select
          id="preferredLanguage"
          name="preferredLanguage"
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={preferredLang}
          onChange={(e) => setPreferredLang(e.target.value as any)}
        >
          <option value="en">{pick(lang, accountText.settings.languageEnglish)}</option>
          <option value="th">{pick(lang, accountText.settings.languageThai)}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="marketingEmails"
          name="marketingEmails"
          type="checkbox"
          className="h-4 w-4"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        <label htmlFor="marketingEmails" className="text-sm text-slate-700">
          {pick(lang, accountText.settings.marketingEmails)}
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {pick(lang, accountText.settings.save)}
      </button>
    </form>
  );
}
