import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <section className="page-gutter page-section">
      <Skeleton className="h-8 w-40" />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </section>
  )
}
