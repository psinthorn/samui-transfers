import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <section className="page-gutter page-section">
      <Skeleton className="h-8 w-56" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </section>
  )
}
