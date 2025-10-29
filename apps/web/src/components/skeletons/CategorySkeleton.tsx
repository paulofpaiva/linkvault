interface CategorySkeletonProps {
  count?: number;
}

export default function CategorySkeleton({ count = 5 }: CategorySkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card animate-pulse"
        >
          <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1 h-5 bg-muted rounded" />
          <div className="w-8 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

