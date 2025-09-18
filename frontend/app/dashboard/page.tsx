import { auth } from "@/auth"
import LocalizedRecentEmpty from "./LocalizedRecentEmpty"

export const runtime = "nodejs"

export default async function DashboardHome() {
  const session = await auth()
  return (
    <div className="space-y-3">
      <p className="text-slate-700">Signed in as {session?.user?.email}</p>
      <LocalizedRecentEmpty />
    </div>
  )
}
