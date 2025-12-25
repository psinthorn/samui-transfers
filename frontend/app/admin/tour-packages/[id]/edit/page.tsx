import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import TourPackageForm from '@/components/admin/tour-packages/TourPackageForm';

export const metadata = {
  title: 'Edit Tour Package - Admin',
  description: 'Edit tour package details',
};

type Params = Promise<{ id: string }>;

export default async function EditTourPackagePage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/admin/tour-packages');
  }

  const { id } = await params;

  let tourPackage;
  try {
    tourPackage = await db.tourPackage.findUnique({
      where: { id },
      include: {
        tourRates: true,
        locations: true,
        schedules: true,
      },
    });

    if (!tourPackage) {
      redirect('/admin/tour-packages');
    }
  } catch (error) {
    redirect('/admin/tour-packages');
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Tour Package</h1>
        <p className="text-gray-600 mt-2">{tourPackage.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TourPackageForm initialData={tourPackage} />
      </div>
    </div>
  );
}
