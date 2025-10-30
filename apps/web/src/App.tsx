import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AuthLayout from './layouts/AuthLayout';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';
import Auth from './pages/auth/Auth';
import Links from './pages/links/Links';
import Profile from './pages/profile/Profile';
import Collections from './pages/collections/Collections';
import CollectionDetail from './pages/collections/CollectionDetail';
import { ThemeProvider } from './contexts/ThemeContext';
import PublicCollection from './pages/collections/PublicCollection';
import PublicLayout from './layouts/PublicLayout';
import NotFound from './pages/NotFound';
import Explore from './pages/explore/Explore';
import ExploreUser from './pages/explore/ExploreUser';
import ExploreUserCollection from './pages/explore/ExploreUserCollection';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<PublicLayout />}>
            <Route path="/public-collection/:id" element={<PublicCollection />} />
          </Route>

          <Route
            path="/auth"
            element={
              <PublicRoute restricted>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route index element={<Navigate to="/auth/sign-in" replace />} />
            <Route path="sign-in" element={<Auth />} />
            <Route path="sign-up" element={<Auth />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <RootLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/links" element={<Links />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/user/:userId" element={<ExploreUser />} />
            <Route path="/explore/user/:userId/collection/:collectionId" element={<ExploreUserCollection />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        richColors={false}
        theme="light"
        toastOptions={{
          classNames: {
            toast: 'bg-white text-black border',
            description: 'text-black/70',
            actionButton: 'bg-black text-white',
            cancelButton: 'bg-white text-black border',
          },
        }}
      />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
