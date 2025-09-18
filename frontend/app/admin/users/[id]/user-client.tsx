"use client"

/* Removed duplicate import of useState and useTransition */
import { useState, useTransition } from "react"
import { useToast } from "@/components/ui/toast"

type Role = "USER" | "ADMIN"
type UpdateRoleAction = (formData: FormData) => Promise<{ ok: boolean; message?: string }>
type ToggleDisabledAction = () => Promise<{ ok: boolean; message?: string }>

export default function ClientControls({
  user,
  updateRole,
  toggleDisabled,
}: {
  user: { id: string; role: "USER" | "ADMIN"; disabled: boolean }
  updateRole: UpdateRoleAction
  toggleDisabled: ToggleDisabledAction
}) {
  const [role, setRole] = useState<"USER" | "ADMIN">(user.role)
  const [pending, startTransition] = useTransition()
  const { push } = useToast()

  return (
    <>
      <form
        action={(fd: FormData) => {
          if (!confirm(`Change role to ${role}?`)) return
          startTransition(async () => {
            const res = await updateRole(fd)
            if (res?.ok) push({ type: "success", message: "Role updated" })
            else push({ type: "error", message: res?.message || "Failed to update role" })
          })
        }}
        className="rounded border bg-white p-4 space-y-3"
      >
        <div className="text-sm text-slate-600">Role</div>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          disabled={pending}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <div>
          <button
            disabled={pending}
            className="rounded-md bg-[#005B9A] text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {pending ? "Updating..." : "Update role"}
          </button>
        </div>
      </form>

      <form
        action={() => {
          const nextDisabled = !user.disabled
          if (!confirm(`${nextDisabled ? "Disable" : "Enable"} this user?`)) return
          startTransition(async () => {
            const res = await toggleDisabled()
            if (res?.ok) push({ type: "success", message: `User ${nextDisabled ? "disabled" : "enabled"}` })
            else push({ type: "error", message: res?.message || "Failed to update status" })
          })
        }}
        className="rounded border bg-white p-4 space-y-3"
      >
        <div className="text-sm text-slate-600">Status</div>
        <div>{user.disabled ? "Disabled" : "Active"}</div>
        <div>
          <button
            disabled={pending}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-60"
          >
            {pending ? (user.disabled ? "Enabling..." : "Disabling...") : user.disabled ? "Enable user" : "Disable user"}
          </button>
        </div>
      </form>
    </>
  )
}
