import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import ConfirmDeleteAccountModal from '@/components/modals/ConfirmDeleteAccountModal';
import { AlertTriangle } from 'lucide-react';
import { useDeleteAccount } from '@/hooks/useAuth';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  const handleConfirmDelete = () => {
    deleteAccountMutation.mutate(undefined, {
      onSettled: () => setIsDeleteOpen(false),
    });
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Breadcrumb label="Back to Links" backTo="/links" />
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your personal details and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user?.avatarUrl && user.avatarUrl !== null ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.providerId && (
                <div className="mt-2">
                  <Button variant="secondary" size="sm" className="gap-2" >
                    <FcGoogle className="h-4 w-4" />
                    Authenticated with Google
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-base">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account ID</label>
              <p className="text-base font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <Button
                className='w-full'
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Delete Account</span> 
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <ConfirmDeleteAccountModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
}

