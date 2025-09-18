import { auth } from "@/auth";
import SectionHeading from "@/components/account/SectionHeading";
import ProfileForm from "@/components/account/ProfileForm";
import { accountText } from "@/data/content/account";
import { pick } from "@/data/i18n/core";
import ProfileDetails from "@/components/account/ProfileDetails";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user!;
  return (
    <div className="space-y-6">
      <SectionHeading title={accountText.profile.title} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card card-padding">
          <ProfileDetails name={user.name} email={user.email} role={user.role as any} />
        </div>
        <div className="card card-padding">
          <ProfileForm initialName={user.name} />
        </div>
      </div>
    </div>
  );
}
