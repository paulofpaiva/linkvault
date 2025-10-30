import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import ManageLinkModal from '@/components/modals/ManageLinkModal';
import ManageCategoriesModal from '@/components/modals/ManageCategoriesModal';
import { useState } from 'react';
import { CreateLinkProvider } from '@/contexts/CreateLinkContext';
import { ManageCategoriesProvider } from '@/contexts/ManageCategoriesContext';

export default function RootLayout() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const openCreateLink = () => setIsCreateOpen(true);
  const closeCreateLink = () => setIsCreateOpen(false);
  const openManageCategories = () => setIsCategoriesOpen(true);
  const closeManageCategories = () => setIsCategoriesOpen(false);

  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      <Header />

      <CreateLinkProvider openCreateLink={openCreateLink}>
        <ManageCategoriesProvider openManageCategories={openManageCategories}>
          <main className="container mx-auto px-4 py-8">
            <Outlet />
          </main>

          <BottomNavigation />
        </ManageCategoriesProvider>
      </CreateLinkProvider>

      <ManageLinkModal isOpen={isCreateOpen} onClose={closeCreateLink} />
      <ManageCategoriesModal isOpen={isCategoriesOpen} onClose={closeManageCategories} />
    </div>
  );
}

