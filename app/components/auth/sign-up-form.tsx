'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface SignUpFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

export function SignUpForm({ onSuccess, onToggleForm }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signupAttempted, setSignupAttempted] = useState(false);
  const { signUp, user } = useAuth();

  // Effect to handle successful signup
  useEffect(() => {
    if (user && signupAttempted && onSuccess) {
      onSuccess();
    }
  }, [user, signupAttempted, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignupAttempted(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password);
      setIsSuccess(true);
      setSignupAttempted(true);
      // onSuccess will be called by the useEffect when user state updates
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
          <p>Check your email for the confirmation link.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign Up
          </Button>
        </form>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-foreground/70">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-foreground underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
