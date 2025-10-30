import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveDropdown } from '@/components/ui/responsive-dropdown';
import CategoryBadge from '@/components/categories/CategoryBadge';
import { ExternalLink, Archive, Trash2, MoreVertical, Edit, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToggleRead, useArchiveLink, useDeleteLink, useToggleFavorite } from '@/hooks/useLinks';
import type { Link } from '@linkvault/shared';
import { useState } from 'react';
import ConfirmDeleteLinkModal from '@/components/modals/ConfirmDeleteLinkModal';
import { motion } from 'framer-motion';

interface LinkCardProps {
  link: Link;
  onEdit?: (link: Link) => void;
}

export default function LinkCard({ link, onEdit }: LinkCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleReadMutation = useToggleRead();
  const archiveLinkMutation = useArchiveLink();
  const deleteLinkMutation = useDeleteLink();
  const toggleFavoriteMutation = useToggleFavorite();

  const formattedDate = formatDistanceToNow(new Date(link.createdAt), {
    addSuffix: true,
  });

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleToggleRead = () => {
    toggleReadMutation.mutate(link.id);
  };

  const handleArchive = () => {
    archiveLinkMutation.mutate(link.id);
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteLinkMutation.mutate(link.id, {
      onSettled: () => setIsDeleteOpen(false),
    });
  };

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(link.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(link);
    }
  };

  const isChecked = link.status === 'read';
  const isArchived = link.status === 'archived';

  const dropdownItems = [
    ...(onEdit ? [{
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      disabled: false,
    }] : []),
    {
      label: (link as any).isFavorite ? 'Unfavorite' : 'Favorite',
      icon: <Star className={`h-4 w-4 ${(link as any).isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />,
      onClick: handleToggleFavorite,
      disabled: toggleFavoriteMutation.isPending,
    },
    {
      label: isArchived ? 'Unarchive' : 'Archive',
      icon: <Archive className="h-4 w-4" />,
      onClick: handleArchive,
      disabled: archiveLinkMutation.isPending,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: 'destructive' as const,
      disabled: deleteLinkMutation.isPending,
    },
  ];

  return (
    <motion.div
      initial={{ y: 0, scale: 1, boxShadow: '0 0 #0000' }}
      whileHover={{ y: -2, scale: 1.04, }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
    >
    <Card className="bg-muted/20 rounded-3xl transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {!isArchived ? (
            <button
              onClick={handleToggleRead}
              disabled={toggleReadMutation.isPending}
              className="flex-shrink-0 disabled:opacity-50"
              aria-label={isChecked ? 'Mark as unread' : 'Mark as read'}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isChecked 
                  ? 'bg-green-600 border-green-600' 
                  : 'border-gray-300 hover:border-green-600'
              }`}>
                {isChecked && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </button>
          ) : (
            <div
              className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-muted"
              aria-hidden="true"
            >
              <Archive className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <CardTitle className="text-lg flex-1 truncate flex items-center gap-2">
            {link.title}
            {(link as any).isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-label="Favorite" />
            )}
          </CardTitle>
          <ResponsiveDropdown
            trigger={
              <button className="p-1 hover:bg-accent rounded flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            items={dropdownItems}
            align="end"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        <div className="flex items-center gap-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:text-blue-600 truncate flex-1"
          >
            {link.url}
          </a>
          <button
            onClick={handleOpenLink}
            className="p-1 hover:bg-accent rounded"
            aria-label="Open link in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
          {link.categories && link.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end">
              {link.categories.map((category) => (
                <CategoryBadge key={category.id} category={category} size="sm" />
              ))}
            </div>
          )}
        </div>
    </CardContent>
    <ConfirmDeleteLinkModal
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      onConfirm={handleConfirmDelete}
      linkTitle={link.title}
    />
    </Card>
    </motion.div>
  );
}

