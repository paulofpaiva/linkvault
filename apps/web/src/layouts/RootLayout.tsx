import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

export default function RootLayout() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

