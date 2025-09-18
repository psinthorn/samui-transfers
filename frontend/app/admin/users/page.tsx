import Link from "next/link"
import { listUsers } from "@/actions/users"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage(props: any) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return (
      <main className="p-6"><p>Access denied.</p></main>
    )
  }
  const searchParams = (await props.searchParams) as Record<string, string | string[] | undefined>
  const q = (searchParams?.q as string) || ""
  const page = Number(searchParams?.page ?? 1)
  const pageSize = Number(searchParams?.pageSize ?? 20)
  const role = (searchParams?.role as string) || ""
  const disabled = (searchParams?.disabled as string) || ""
  const sort = (searchParams?.sort as string) || "createdAt-desc"
  const from = (searchParams?.from as string) || ""
  const to = (searchParams?.to as string) || ""

  const { data, total } = await listUsers({ q, page, pageSize, role: role || undefined, disabled: disabled || undefined })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const makeSearch = (next: Partial<Record<string, string>>) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (role) params.set("role", role)
    if (disabled) params.set("disabled", disabled)
    if (sort) params.set("sort", sort)
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    params.set("page", String(next.page ?? page))
    params.set("pageSize", String(pageSize))
    return `?${params.toString()}`
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Users</h1>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <input name="q" defaultValue={q} placeholder="Search name or email" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select name="role" defaultValue={role} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select name="disabled" defaultValue={disabled} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All status</option>
          <option value="false">Active</option>
          <option value="true">Disabled</option>
        </select>
        <select name="sort" defaultValue={sort} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
        </select>
        <input type="date" name="from" defaultValue={from} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" name="to" defaultValue={to} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-md bg-[#005B9A] text-white px-4 py-2 text-sm">Filter</button>
      </form>

      <div className="flex items-center justify-end mb-2">
        <a
          href={`/admin/users/export${makeSearch({})}`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          Export CSV
        </a>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((u:any)=> (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name || "—"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.disabled ? "Disabled" : "Active"}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/users/${u.id}`} className="underline">Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">Page {page} of {totalPages} • {total} users</div>
        <div className="flex gap-2">
          <Link href={makeSearch({ page: String(Math.max(1, page - 1)) })} className="rounded border px-3 py-1 text-sm disabled:opacity-50 aria-disabled:true" aria-disabled={page<=1}>Prev</Link>
          <Link href={makeSearch({ page: String(Math.min(totalPages, page + 1)) })} className="rounded border px-3 py-1 text-sm disabled:opacity-50 aria-disabled:true" aria-disabled={page>=totalPages}>Next</Link>
        </div>
      </div>
    </main>
  )
}
