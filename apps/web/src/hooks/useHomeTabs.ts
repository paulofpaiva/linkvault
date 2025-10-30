import { Link as LinkIcon, Inbox, Star, Archive } from 'lucide-react';

export type TabValue = 'all' | 'unread' | 'archived' | 'favorites';

export const homeTabs: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'archived', label: 'Archived' },
  { value: 'favorites', label: 'Favorites' },
];

interface EmptyStateConfig {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

interface GetEmptyStateParams {
  activeTab: TabValue;
  onCreateNewLink: () => void;
  setAllTab: () => void;
}

export function getEmptyStateConfig({ activeTab, onCreateNewLink, setAllTab }: GetEmptyStateParams): EmptyStateConfig {
  switch (activeTab) {
    case 'unread':
      return {
        icon: Inbox,
        title: "You're all caught up!",
        description: "No unread links. You're doing great staying organized!",
        actionLabel: 'Create New Bookmark',
        onAction: onCreateNewLink,
      };
    case 'favorites':
      return {
        icon: Star,
        title: 'No favorite links',
        description: 'Mark links as favorite to find them quickly here',
        actionLabel: 'View All Links',
        onAction: setAllTab,
      };
    case 'archived':
      return {
        icon: Archive,
        title: 'No archived links',
        description: 'Links you archive will appear here for later reference',
        actionLabel: 'View All Links',
        onAction: setAllTab,
      };
    default:
      return {
        icon: LinkIcon,
        title: 'No links saved yet',
        description: 'Start saving your favorite links and organize them easily',
        actionLabel: 'Create Your First Link',
        onAction: onCreateNewLink,
      };
  }
}


