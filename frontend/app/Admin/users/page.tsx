import { requireRole } from '@/components/utilities/requireRole'
import prisma from '@/components/utilities/db'
import RoleUpdateForm from './role-update-form' // form component

export default async function UsersAdminPage() {
  const gate = await requireRole(['ADMIN'])
  if (!gate.allowed) return null
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } })
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Created</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2 border font-mono">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">{u.createdAt.toISOString().substring(0,10)}</td>
              <td className="p-2 border"><RoleUpdateForm userId={u.id} currentRole={u.role || 'USER'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
