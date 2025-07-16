'use client';

import { useState } from 'react';
import { TodoList } from '@/app/components/todo/todo-list';
import { Button } from '@/app/components/ui/button';
import { AuthModal } from '@/app/components/auth/auth-modal';
import { useAuth } from '@/app/context/auth-context';
import { SubscriptionButton } from '@/app/components/subscription/subscription-button';

export default function Home() {
  const { user, signOut, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');

  const handleSignIn = () => {
    setAuthView('signin');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthView('signup');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Todo App</h1>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-foreground/70">
                {user.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button onClick={handleSignUp}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <TodoList />
        </div>

        <div className="w-full md:w-64 p-4 border border-foreground/10 rounded-md h-fit">
          <h2 className="text-xl font-bold mb-4">Subscription</h2>
          <p className="text-sm text-foreground/70 mb-4">
            Upgrade to PRO for unlimited todos. Only $2/month.
          </p>
          <SubscriptionButton />
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          defaultView={authView} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
}
