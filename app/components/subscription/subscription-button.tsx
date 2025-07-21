'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Button } from '@/app/components/ui/button';
import { AuthModal } from '@/app/components/auth/auth-modal';
import { supabase } from '@/utils/supabase';

export function SubscriptionButton() {
  const { user, isProUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Client-side auth state:', {
        user: user ? { id: user.id, email: user.email } : null,
        isAuthenticated: !!user,
        origin: window.location.origin,
        href: window.location.href,
        pathname: window.location.pathname
      });

      // Check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'exists' : 'none');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent with the request
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_PRO_PRICE_ID,
          returnUrl: window.location.origin || 'http://localhost:3000',
          userId: user.id, // Send the user ID for server-side verification
        }),
      });

      const { url } = await response.json();
      console.log('Redirecting to checkout URL:', url);
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isProUser) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
          PRO
        </span>
        <span className="text-sm text-foreground/70">
          You have unlimited todos!
        </span>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handleUpgrade}
        isLoading={isLoading}
        disabled={isLoading}
        variant="primary"
      >
        Upgrade to PRO
      </Button>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
