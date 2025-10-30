import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import ConfirmDeleteAccountModal from '@/components/modals/ConfirmDeleteAccountModal';
import { AlertTriangle, Lock } from 'lucide-react';
import { useDeleteAccount } from '@/hooks/useAuth';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import { getInitials } from '@/lib/text';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteAccountMutation = useDeleteAccount();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const handleConfirmDelete = () => {
    deleteAccountMutation.mutate(undefined, {
      onSettled: () => setIsDeleteOpen(false),
    });
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
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
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
            <div className='flex flex-col gap-2'>
              <Button
                className='w-full'
                variant="outline"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span> 
              </Button>
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
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

