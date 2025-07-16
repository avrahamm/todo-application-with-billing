'use client';

import { useState } from 'react';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';

interface AuthModalProps {
  defaultView?: 'signin' | 'signup';
  onClose?: () => void;
}

export function AuthModal({ defaultView = 'signin', onClose }: AuthModalProps) {
  const [view, setView] = useState<'signin' | 'signup'>(defaultView);

  const toggleView = () => {
    setView(view === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/70 hover:text-foreground"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {view === 'signin' ? (
          <SignInForm onToggleForm={toggleView} onSuccess={onClose} />
        ) : (
          <SignUpForm onToggleForm={toggleView} onSuccess={onClose} />
        )}
      </div>
    </div>
  );
}