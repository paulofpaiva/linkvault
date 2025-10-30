import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ResponsiveDropdown } from '@/components/ui/responsive-dropdown';
import { User, LogOut, Sun, Moon, Link2, Folder, Menu, LogIn, UserPlus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { getInitials } from '@/lib/text';
import { useManageCategoriesContext } from '@/contexts/ManageCategoriesContext';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logoutMutation = useLogout();
  const { theme, toggleTheme } = useTheme();
  const { openManageCategories } = useManageCategoriesContext()
  
  const dropdownItems = [
    {
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      href: '/profile',
    },
    {
      label: 'Links',
      icon: <Link2 className="h-4 w-4" />,
      href: '/links',
    },
    {
      label: 'Collections',
      icon: <Folder className="h-4 w-4" />,
      href: '/collections',
    },
    {
      label: theme === 'dark' ? 'Light mode' : 'Dark mode',
      icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      onClick: () => toggleTheme(),
    },
    {
      label: 'Logout',
      icon: <LogOut className="h-4 w-4" />,
      onClick: () => logoutMutation.mutate(),
      variant: 'destructive' as const,
      disabled: logoutMutation.isPending,
    },
  ];

  const unauthMenuItems = [
    {
      label: 'Sign In',
      icon: <LogIn className="h-4 w-4" />,
      href: '/auth/sign-in',
    },
    {
      label: 'Sign Up',
      icon: <UserPlus className="h-4 w-4" />,
      href: '/auth/sign-up',
    },
    {
      label: theme === 'dark' ? 'Light mode' : 'Dark mode',
      icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      onClick: () => toggleTheme(),
    },
  ];

  return (
    //add sticky maybe: className=sticky backdrop-blur supports-[backdrop-filter]:bg-background/60
    <header className="top-0 z-40 border-b bg-background/100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/links" className="text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-ring rounded">
            linkvault
          </Link>
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-4 text-sm">
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
              <button
                onClick={openManageCategories}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1 py-0.5"
              >
                Categories
              </button>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
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
          ) : (
            <ResponsiveDropdown
              trigger={
                <button className="p-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                  <Menu className="h-5 w-5" />
                </button>
              }
              items={unauthMenuItems}
              align="end"
            />
          )}
        </div>
      </div>
    </header>
  );
}

