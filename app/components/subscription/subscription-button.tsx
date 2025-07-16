'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Button } from '@/app/components/ui/button';
import { AuthModal } from '@/app/components/auth/auth-modal';

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
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_PRO_PRICE_ID,
          returnUrl: window.location.origin,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout session:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      });
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
