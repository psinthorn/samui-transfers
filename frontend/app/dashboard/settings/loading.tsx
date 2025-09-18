import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <div className="card card-padding space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
