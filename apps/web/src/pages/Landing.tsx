import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/text';
import { useLogout } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">linkvault</h1>
          <p className="text-xl text-muted-foreground">
            Organize your links in a smart way
          </p>
        </div>

        {isAuthenticated ? (
          <>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/links')}
              variant="outline"
            >
              <Avatar className="h-6 w-6 mr-2 border">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              Continue as {user?.name}
            </Button>
            </div>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => logoutMutation.mutate()}
                variant="outline"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
            </>
          ) : (
            <>
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
            </>
          )}
        <div>
        </div>
      </div>
    </div>
  );
}

