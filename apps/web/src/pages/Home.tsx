import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { Error as ErrorState } from '@/components/ui/error';
import { useLinks } from '@/hooks/useLinks';
import LinkCard from '@/components/links/LinkCard';
import LinkCardSkeleton from '@/components/skeletons/LinkCardSkeleton';
import ManageLinkModal from '@/components/modals/ManageLinkModal';
import ManageCategoriesModal from '@/components/modals/ManageCategoriesModal';
import { Plus, FolderKanban } from 'lucide-react';
import type { Link } from '@linkvault/shared';
import { homeTabs, getEmptyStateConfig } from '@/hooks/useHomeTabs';
import type { TabValue } from '@/hooks/useHomeTabs';
import { motion } from 'framer-motion';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const { items, isLoading, isFetchingNextPage, hasNextPage, setSentinelRef, error, refetch } = useLinks(activeTab, 5);

  const handleEditLink = (link: Link) => {
    setLinkToEdit(link);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setLinkToEdit(null);
  };

  const emptyState = getEmptyStateConfig({
    activeTab,
    onCreateNewLink: () => setIsCreateModalOpen(true),
    setAllTab: () => setActiveTab('all'),
  });

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
          <motion.div 
            whileHover={{ y: -2, scale: 1.04 }} 
            whileTap={{ scale: 0.995 }} 
            transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}>
              <Button variant="outline" onClick={() => setIsCategoriesModalOpen(true)} className="flex-1 sm:flex-initial">
                <FolderKanban className="h-4 w-4 mr-2" />
                Categories
              </Button>
          </motion.div>
          <motion.div 
            whileHover={{ y: -2, scale: 1.04 }} 
            whileTap={{ scale: 0.995 }} 
            transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
          >
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex-1 sm:flex-initial">
              <Plus className="h-4 w-4 mr-2" />
              New Link
            </Button>
          </motion.div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          {homeTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {isLoading ? (
            <LinkCardSkeleton count={3} />
          ) : error ? (
            <ErrorState
              title="Error loading links"
              description="Try again in a few seconds or reload the page."
              actionLabel="Try again"
              onAction={() => refetch()}
            />
          ) : items.length === 0 ? (
            <Empty
              icon={emptyState.icon}
              title={emptyState.title}
              description={emptyState.description}
              actionLabel={emptyState.actionLabel}
              onAction={emptyState.onAction}
            />
          ) : (
            <>
              {items.map((link: Link) => (
                <LinkCard key={link.id} link={link} onEdit={handleEditLink} />
              ))}
              {hasNextPage && (
                <div ref={setSentinelRef} />
              )}
              {isFetchingNextPage && <LinkCardSkeleton count={5} />}
            </>
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

