"use client";
import { useState, useTransition } from 'react'

export default function RoleUpdateForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole)
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null)

  async function updateRole(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        })
        if (!res.ok) throw new Error(await res.text())
        setStatus('saved')
      } catch (err: any) {
        setStatus(err.message)
      }
    })
  }

  return (
    <form onSubmit={updateRole} className="flex items-center gap-2">
      <select value={role} onChange={e=>setRole(e.target.value)} disabled={pending} className="border rounded px-2 py-1 text-xs">
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button type="submit" disabled={pending} className="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50">Save</button>
      {status === 'saved' && <span className="text-green-600 text-xs">✔</span>}
      {status && status !== 'saved' && <span className="text-red-600 text-xs" title={status}>!</span>}
    </form>
  )
}
