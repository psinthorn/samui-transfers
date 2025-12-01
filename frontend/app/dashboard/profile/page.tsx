import { auth } from "@/auth";
import Link from "next/link";
import { User, Mail, Shield, Calendar, Badge } from "lucide-react";
import SectionHeading from "@/components/account/SectionHeading";
import ProfileForm from "@/components/account/ProfileForm";
import { accountText } from "@/data/content/account";
import { pick } from "@/data/i18n/core";
import ProfileDetails from "@/components/account/ProfileDetails";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user!;
  
  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      ADMIN: { 
        bg: "bg-red-100", 
        text: "text-red-700", 
        icon: <Shield className="h-4 w-4" /> 
      },
      USER: { 
        bg: "bg-blue-100", 
        text: "text-blue-700", 
        icon: <User className="h-4 w-4" /> 
      },
    };
    return roleMap[role] || roleMap.USER;
  };

  const roleBadge = getRoleBadge(user.role as string);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-600 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user.name || "User"}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4 text-slate-600" />
                <span className="text-slate-600">{user.email}</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
            {roleBadge.icon}
            <span className="font-semibold">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Account Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Full Name</label>
              <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">
                {user.name || "Not set"}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Email Address</label>
              <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">
                {user.email}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Account Role</label>
              <div className={`px-4 py-3 rounded-lg border inline-flex items-center gap-2 ${roleBadge.bg} ${roleBadge.text}`}>
                {roleBadge.icon}
                <span className="font-medium">{user.role}</span>
              </div>
            </div>

            {user.emailVerified && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Email Verified</label>
                <div className="px-4 py-3 bg-green-50 rounded-lg border border-green-200 text-green-700 flex items-center gap-2">
                  <Badge className="h-4 w-4" />
                  {new Date(user.emailVerified).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Badge className="h-5 w-5 text-blue-600" />
            Update Profile
          </h3>
          <ProfileForm initialName={user.name} />
        </div>
      </div>

      {/* Additional Actions */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Security
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            href="/dashboard/settings" 
            className="px-4 py-3 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm text-center"
          >
            Privacy & Settings
          </Link>
          <Link 
            href="/contact" 
            className="px-4 py-3 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm text-center"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
