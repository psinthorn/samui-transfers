import { notFound } from "next/navigation"
import { getUser, toggleUserDisabled, updateUserRole } from "@/actions/users"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import ClientControls from "./user-client"

export const dynamic = "force-dynamic"

export default async function AdminUserDetail(props: any) {
  const params = await props.params
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    notFound()
  }
  const { ok, user } = await getUser(params.id)
  if (!ok || !user) notFound()

  async function updateRole(formData: FormData) {
    "use server"
    const role = String(formData.get("role") || "USER") as "USER" | "ADMIN"
    const res = await updateUserRole(params.id, role)
    revalidatePath(`/admin/users/${params.id}`)
    return res
  }

  async function toggleDisabled() {
    "use server"
    const res = await toggleUserDisabled(params.id, !user!.disabled)
    revalidatePath(`/admin/users/${params.id}`)
    return res
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Manage User</h1>
      <div className="grid gap-4 max-w-xl">
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-slate-600">User ID</div>
          <div className="font-mono text-sm">{user.id}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-slate-600">Name</div>
          <div>{user.name || "—"}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-slate-600">Email</div>
          <div>{user.email}</div>
        </div>
        <ClientControls
          user={{ id: user.id, role: user.role as any, disabled: user.disabled }}
          updateRole={updateRole}
          toggleDisabled={toggleDisabled}
        />
        <div>
          <a href={`/admin/users/${user.id}/audit`} className="text-sm underline">View audit log →</a>
        </div>
        <div className="text-sm text-slate-600">Created: {new Date(user.createdAt).toLocaleString()}</div>
        <div className="text-sm text-slate-600">Updated: {new Date(user.updatedAt).toLocaleString()}</div>
      </div>
    </main>
  )
}
