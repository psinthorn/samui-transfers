import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <section className="page-gutter page-section">
      <Skeleton className="h-8 w-40" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-10/12" />
      </div>
    </section>
  )
}
