import { Link, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'
import {Folder, User, Plus, Home, Tag } from 'lucide-react'
import { useCreateLinkContext } from '@/contexts/CreateLinkContext'
import { useManageCategoriesContext } from '@/contexts/ManageCategoriesContext'
import { useScrollDirection } from '@/hooks/useScrollDirection'

export function BottomNavigation() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const { openCreateLink } = useCreateLinkContext()
  const { openManageCategories } = useManageCategoriesContext()
  const scrollDirection = useScrollDirection(10)

  if (!isMobile) return null

  const items = [
    { id: 'links', label: 'Links', href: '/links', icon: Home, match: 'eq' as const },
    { id: 'collections', label: 'Collections', href: '/collections', icon: Folder, match: 'startsWith' as const },
    { id: 'profile', label: 'Profile', href: '/profile', icon: User, match: 'eq' as const },
  ]

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-40 border-t transition-all duration-300',
      scrollDirection === 'down' ? 'bg-background/10' : 'bg-background/100'
    )}>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-around px-2 py-2 gap-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.match === 'startsWith'
              ? location.pathname.startsWith(item.href)
              : location.pathname === item.href

            return (
              <>
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    'flex items-center justify-center p-3 rounded-lg transition-colors duration-200 min-w-0 flex-1',
                    scrollDirection === 'down' && 'opacity-60',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title={item.label}
                >
                  <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5px]')} />
                </Link>

                {item.id === 'collections' && (
                  <button
                    type="button"
                    aria-label="Manage categories"
                    onClick={openManageCategories}
                    className={cn(
                      'flex items-center justify-center p-3 rounded-lg transition-colors duration-200 min-w-0 flex-1 text-muted-foreground hover:text-foreground',
                      scrollDirection === 'down' && 'opacity-60'
                    )}
                    title="Manage categories"
                  >
                    <Tag className="h-6 w-6" />
                  </button>
                )}
              </>
            )
          })}
        <button
            type="button"
            aria-label="Add link"
            onClick={openCreateLink}
            className={cn(
              'flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 shadow-lg',
              scrollDirection === 'down' && 'opacity-60'
            )}
            title="Add link"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}


