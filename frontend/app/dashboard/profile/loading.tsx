import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card card-padding space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="card card-padding space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
