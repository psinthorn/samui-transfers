import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function UserAuditPage(props: any) {
  const params = await props.params
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") notFound()

  const anyDb = db as any
  const [user, logs] = await Promise.all([
    anyDb.user.findUnique({ where: { id: params.id }, select: { id: true, email: true, name: true } }),
    anyDb.auditLog.findMany({
      where: { targetUserId: params.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, action: true, details: true, createdAt: true, actor: { select: { id: true, email: true } } },
    }),
  ])
  if (!user) notFound()

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-2">Audit Log</h1>
      <div className="text-slate-600 text-sm mb-4">User: {user.email || user.name || user.id}</div>
      <div className="grid gap-3">
        {logs.length === 0 && <div className="text-slate-500 text-sm">No audit entries.</div>}
        {logs.map((log: any) => (
          <div key={log.id} className="rounded border bg-white p-4">
            <div className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</div>
            <div className="font-medium text-sm">{log.action}</div>
            <div className="text-sm text-slate-700">By: {log.actor?.email || log.actor?.id}</div>
            <pre className="mt-2 rounded bg-slate-50 text-xs p-2 overflow-auto border border-slate-200">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </main>
  )
}
