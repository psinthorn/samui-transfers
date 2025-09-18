export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="page-gutter page-section">
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}
