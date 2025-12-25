import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ServicesManagementClient } from "@/components/admin/ServicesManagementClient"

export const runtime = "nodejs"

export default async function AdminServicesPage() {
  const session = await auth()
  const user = session?.user as any

  if (!user || user.role !== "ADMIN") {
    redirect("/Denied")
  }

  return (
    <div className="space-y-8">
      <ServicesManagementClient />
    </div>
  )
}
