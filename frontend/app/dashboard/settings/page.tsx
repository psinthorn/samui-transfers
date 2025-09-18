import { auth } from "@/auth";
import SectionHeading from "@/components/account/SectionHeading";
import { accountText } from "@/data/content/account";
import SettingsForm from "@/components/account/SettingsForm";
import { db } from "@/lib/db";
import LanguageBootstrap from "@/components/account/LanguageBootstrap";

export default async function SettingsPage() {
  const session = await auth();
  // Load current user's preferences from DB (cast to any to accommodate client typegen timing)
  const userAny = (await db.user.findUnique({
    where: { id: session!.user!.id },
  })) as any;
  const initialLang = userAny?.preferredLanguage === "th" ? ("th" as const) : ("en" as const);
  const initialMarketingEmails = Boolean(userAny?.marketingEmails);
  return (
    <div className="space-y-6">
      <SectionHeading title={accountText.settings.title} />
      {/* Ensure client LanguageContext syncs with server preferred language on mount */}
      <LanguageBootstrap initial={initialLang} />
      <div className="card card-padding">
        <SettingsForm initialLang={initialLang} initialMarketingEmails={initialMarketingEmails} />
      </div>
    </div>
  );
}
