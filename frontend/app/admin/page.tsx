import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminClient from "./AdminClient"

export default async function AdminHome() {
  const session = await auth()
  const user = session?.user as any

  if (!user) {
    redirect("/sign-in?callbackUrl=/admin")
  }
  if (user.role !== "ADMIN") {
    redirect("/Denied")
  }
  return <AdminClient email={user?.email} role={(user as any).role} />
}
