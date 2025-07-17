'use client';

import { useState, useEffect } from 'react';
import { useTodoStore } from '@/app/store/todo-store';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/app/context/auth-context';
import { getUserTodoCount } from '@/utils/supabase';

export function TodoForm() {
  const [title, setTitle] = useState('');
  const [userTodoCount, setUserTodoCount] = useState(0);
  const { addTodo, error, isLoading, todoCount } = useTodoStore();
  const { user, isProUser } = useAuth();

  // Fetch the user's todo count when the user changes
  useEffect(() => {
    const fetchUserTodoCount = async () => {
      if (user) {
        const count = await getUserTodoCount(user.id);
        setUserTodoCount(count);
      } else {
        setUserTodoCount(todoCount);
      }
    };

    fetchUserTodoCount().then(r => null);
  }, [user, todoCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addTodo(title.trim(), user?.id);
      setTitle('');

      // Update the user's todo count after adding a todo
      if (user) {
        const count = await getUserTodoCount(user.id);
        setUserTodoCount(count);
      } else {
        // For non-authenticated users, increment the count directly
        setUserTodoCount(prevCount => prevCount + 1);
      }
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
    (!user && userTodoCount >= 3) || 
    (!!user && !isProUser && userTodoCount >= 5);

  const getTodoLimitMessage = () => {
    if (!user) {
      const remaining = Math.max(0, 3 - userTodoCount);
      return `You can create ${remaining} more todo${remaining === 1 ? '' : 's'} as an unregistered user.`;
    }

    if (!isProUser) {
      const remaining = Math.max(0, 5 - userTodoCount);
      return `You can create ${remaining} more todo${remaining === 1 ? '' : 's'} as a free user.`;
    }

    return 'You have unlimited todos as a PRO user.';
  };

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
        {getTodoLimitMessage()}
      </p>
    </div>
  );
}
