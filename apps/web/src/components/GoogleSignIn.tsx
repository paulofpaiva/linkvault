import { useEffect, useRef } from 'react';
import { useGoogleLogin } from '@/hooks/useAuth';
import { useUiStore } from '@/stores/uiStore';

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignIn() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const googleLogin = useGoogleLogin();
  const isAuthProcessing = useUiStore((s) => s.isAuthProcessing);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId || !window.google || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        if (response?.credential) {
          googleLogin.mutate(response.credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
    });
  }, [googleLogin]);

  return (
    <div className="w-full flex justify-center relative">
      <div ref={containerRef} />
      {isAuthProcessing && (
        <div className="absolute inset-0" />
      )}
    </div>
  );
}


