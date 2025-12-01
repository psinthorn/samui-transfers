import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AgentContextClient from "./AgentContextClient"

export const runtime = "nodejs"

export default async function AgentContextPage() {
  const session = await auth()
  const user = session?.user as any
  if (!user) redirect("/sign-in?callbackUrl=/admin/agent-context")
  if (user.role !== "ADMIN") redirect("/Denied")

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">AI Agent Context</h2>
      <AgentContextClient />
    </div>
  )
}
