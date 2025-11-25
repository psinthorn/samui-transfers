import { requireAdmin } from '@/lib/auth'
import ProjectDocumentation from '@/components/admin/ProjectDocumentation'

export default async function DocumentationPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Documentation</h1>
        <p className="text-muted-foreground">
          Comprehensive documentation and current status of the Samui Transfers platform.
        </p>
      </div>
      
      <ProjectDocumentation />
    </div>
  )
}