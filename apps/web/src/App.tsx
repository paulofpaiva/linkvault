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
import Home from './pages/Home';
import Profile from './pages/Profile';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

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
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
