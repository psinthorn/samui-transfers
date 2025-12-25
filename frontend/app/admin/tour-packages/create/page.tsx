import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TourPackageForm from '@/components/admin/tour-packages/TourPackageForm';

export const metadata = {
  title: 'Create Tour Package - Admin',
  description: 'Create a new tour package',
};

export default async function CreateTourPackagePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/admin/tour-packages/create');
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Tour Package</h1>
        <p className="text-gray-600 mt-2">Add a new tour package to the system</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TourPackageForm />
      </div>
    </div>
  );
}
