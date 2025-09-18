"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/actions/profile";
import { useLanguage } from "@/context/LanguageContext";
import { pick } from "@/data/i18n/core";
import { accountText } from "@/data/content/account";
import { useToast } from "@/components/ui/toast";

export default function ProfileForm({ initialName }: { initialName: string | null | undefined }) {
  const { lang } = useLanguage();
  const [name, setName] = useState(initialName ?? "");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await updateProfile(formData);
          if (res?.ok) {
            push({ type: "success", message: pick(lang, accountText.profile.saved) });
          } else {
            const key = (res?.message || "invalid") as keyof typeof accountText.profile.errors;
            const localized = accountText.profile.errors[key]
              ? pick(lang, accountText.profile.errors[key])
              : pick(lang, accountText.profile.errors.invalid);
            push({ type: "error", message: localized });
          }
        });
      }}
      className="space-y-3"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-slate-600">
          {pick(lang, accountText.profile.name)}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {pick(lang, accountText.profile.save)}
      </button>
    </form>
  );
}
