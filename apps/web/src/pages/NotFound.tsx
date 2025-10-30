import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <AlertTriangle className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => navigate(-1)} variant="outline" size="lg" className="min-w-[140px]">Go back</Button>
        <Button onClick={() => navigate('/')} size="lg" className="min-w-[140px]">Go to Home</Button>
      </div>
    </div>
  );
}


