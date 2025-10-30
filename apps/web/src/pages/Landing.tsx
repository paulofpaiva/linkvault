import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/links');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">linkvault</h1>
          <p className="text-xl text-muted-foreground">
            Organize your links in a smart way
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/auth/sign-in')}
          >
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/auth/sign-up')}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}

