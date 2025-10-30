import { Skeleton } from '@/components/ui/skeleton';

export default function PublicCollectionHeaderSkeleton() {
  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
    </header>
  );
}

