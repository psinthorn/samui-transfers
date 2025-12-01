import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Globe, Bell, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import SectionHeading from "@/components/account/SectionHeading";
import { accountText } from "@/data/content/account";
import SettingsForm from "@/components/account/SettingsForm";
import LanguageBootstrap from "@/components/account/LanguageBootstrap";

export default async function SettingsPage() {
  const session = await auth();
  
  // Redirect unauthenticated users
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/settings")
  }
  
  // Load current user's preferences from DB (cast to any to accommodate client typegen timing)
  const userAny = (await db.user.findUnique({
    where: { id: session.user.id },
  })) as any;
  const initialLang = userAny?.preferredLanguage === "th" ? ("th" as const) : ("en" as const);
  const initialMarketingEmails = Boolean(userAny?.marketingEmails);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account preferences and security</p>
      </div>

      {/* Ensure client LanguageContext syncs with server preferred language on mount */}
      <LanguageBootstrap initial={initialLang} />

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* Preferences Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Preferences
              </h2>
              <p className="text-slate-600 text-sm mt-1">Customize your experience</p>
            </div>
          </div>
          <SettingsForm initialLang={initialLang} initialMarketingEmails={initialMarketingEmails} />
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600" />
            Security & Privacy
          </h2>
          
          <div className="space-y-4">
            <Link href="/dashboard/profile" className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Manage Profile</p>
                <p className="text-sm text-slate-600">Update your personal information</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>

            <Link href="/privacy" className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Privacy Policy</p>
                <p className="text-sm text-slate-600">Review our privacy practices</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>

            <Link href="/terms" className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Terms & Conditions</p>
                <p className="text-sm text-slate-600">Review our terms of service</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-600">Receive updates about your bookings</p>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Promotional Emails</p>
                <p className="text-sm text-slate-600">Receive special offers and promotions</p>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" defaultChecked={initialMarketingEmails} />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">SMS Notifications</p>
                <p className="text-sm text-slate-600">Get SMS updates for time-sensitive info</p>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Help & Support Section */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Need Help?</h2>
          <p className="text-blue-800 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/faqs" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              View FAQs
            </Link>
            <Link href="/contact" className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
