import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ResponsiveDropdown } from '@/components/ui/responsive-dropdown';
import { User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const dropdownItems = [
    {
      label: theme === 'dark' ? 'Light mode' : 'Dark mode',
      icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      onClick: () => toggleTheme(),
    },
    {
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      href: '/profile',
    },
    {
      label: 'Logout',
      icon: <LogOut className="h-4 w-4" />,
      onClick: () => logoutMutation.mutate(),
      variant: 'destructive' as const,
      disabled: logoutMutation.isPending,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-ring rounded">
            linkvault
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link
              to="/links"
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1 py-0.5"
            >
              Links
            </Link>
            <Link
              to="/collections"
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1 py-0.5"
            >
              Collections
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ResponsiveDropdown
            trigger={
              <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
            items={dropdownItems}
            align="end"
          />
        </div>
      </div>
    </header>
  );
}

