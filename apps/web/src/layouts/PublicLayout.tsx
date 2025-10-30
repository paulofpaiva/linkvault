import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import { ManageCategoriesProvider } from '@/contexts/ManageCategoriesContext';

export default function PublicLayout() {
  const noop = () => {};
  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      <ManageCategoriesProvider openManageCategories={noop}>
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </ManageCategoriesProvider>
    </div>
  );
}


