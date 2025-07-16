'use client';

import { useState } from 'react';
import { useTodoStore } from '@/app/store/todo-store';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/app/context/auth-context';

export function TodoForm() {
  const [title, setTitle] = useState('');
  const { addTodo, error, isLoading, todoCount, getTodoLimitMessage } = useTodoStore();
  const { user, isProUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addTodo(title.trim(), user?.id);
      setTitle('');
    } catch (error: any) {
      console.error('Error adding todo:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      });
    }
  };

  const isAtLimit = 
    (!user && todoCount >= 3) || 
    (user && !isProUser && todoCount >= 5);

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder="Add a new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading || isAtLimit}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={!title.trim() || isLoading || isAtLimit}
          isLoading={isLoading}
        >
          Add
        </Button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      <p className="text-sm text-foreground/70 mt-2">
        {getTodoLimitMessage(!!user, isProUser)}
      </p>
    </div>
  );
}
