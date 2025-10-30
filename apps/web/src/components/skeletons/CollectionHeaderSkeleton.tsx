import { Skeleton } from '@/components/ui/skeleton';

export default function CollectionHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

