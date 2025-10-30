import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Props { count?: number }

export default function CollectionCardSkeleton({ count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-muted/20 rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}


