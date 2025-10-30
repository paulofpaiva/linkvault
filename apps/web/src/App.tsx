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
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
