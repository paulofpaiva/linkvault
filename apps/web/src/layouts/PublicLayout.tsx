import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

export default function PublicLayout() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}


