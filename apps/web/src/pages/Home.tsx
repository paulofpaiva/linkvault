import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { useLinks } from '@/hooks/useLinks';
import LinkCard from '@/components/links/LinkCard';
import LinkCardSkeleton from '@/components/skeletons/LinkCardSkeleton';
import ManageLinkModal from '@/components/modals/ManageLinkModal';
import ManageCategoriesModal from '@/components/modals/ManageCategoriesModal';
import { Link as LinkIcon, Plus, FolderKanban } from 'lucide-react';
import type { Link } from '@linkvault/shared';

type TabValue = 'all' | 'unread' | 'archived';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const { data, isLoading, error } = useLinks(activeTab);

  const handleEditLink = (link: Link) => {
    setLinkToEdit(link);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setLinkToEdit(null);
  };

  const getEmptyState = () => {
    switch (activeTab) {
      case 'unread':
        return {
          title: "You're all caught up!",
          description: "No unread links. You're doing great staying organized!",
          actionLabel: "Create New Bookmark",
          onAction: () => setIsCreateModalOpen(true),
        };
      case 'archived':
        return {
          title: "No archived links",
          description: "Links you archive will appear here for later reference",
          actionLabel: "View All Links",
          onAction: () => setActiveTab('all'),
        };
      default:
        return {
          title: "No links saved yet",
          description: "Start saving your favorite links and organize them easily",
          actionLabel: "Create Your First Link",
          onAction: () => setIsCreateModalOpen(true),
        };
    }
  };

  const emptyState = getEmptyState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Links</h2>
          <p className="text-muted-foreground">
            Manage and organize your saved links.
          </p>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <Button variant="outline" onClick={() => setIsCategoriesModalOpen(true)} className="flex-1 sm:flex-initial">
            <FolderKanban className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex-1 sm:flex-initial">
            <Plus className="h-4 w-4 mr-2" />
            New Link
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {isLoading ? (
            <LinkCardSkeleton count={3} />
          ) : error ? (
            <p className="text-destructive">Error loading links</p>
          ) : data?.links.length === 0 ? (
            <Empty
              icon={LinkIcon}
              title={emptyState.title}
              description={emptyState.description}
              actionLabel={emptyState.actionLabel}
              onAction={emptyState.onAction}
            />
          ) : (
            data?.links.map((link) => (
              <LinkCard key={link.id} link={link} onEdit={handleEditLink} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <ManageLinkModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        linkToEdit={linkToEdit}
      />
      
      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </div>
  );
}

