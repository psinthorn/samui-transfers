import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminClient from "./AdminClient"

export const runtime = "nodejs"

export default async function AdminHome() {
  const session = await auth()
  const user = session?.user as any

  if (!user) {
    redirect("/sign-in?callbackUrl=/admin")
  }
  if (user.role !== "ADMIN") {
    redirect("/Denied")
  }
  return (
    <div className="p-6 space-y-4">
      <AdminClient email={user?.email} role={(user as any).role} />
      <ul className="list-disc pl-5 space-y-2">
        <li><Link href="/admin/bookings" className="underline">Bookings</Link></li>
        <li><Link href="/admin/users" className="underline">Users</Link></li>
      </ul>
    </div>
  )
}
