import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <section className="page-gutter page-section">
      <div className="mx-auto max-w-md card card-padding space-y-4">
        <Skeleton className="h-7 w-52 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </section>
  )
}
