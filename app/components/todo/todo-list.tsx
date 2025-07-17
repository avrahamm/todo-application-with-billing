'use client';

import { useEffect } from 'react';
import { useTodoStore } from '@/app/store/todo-store';
import { TodoItem } from './todo-item';
import { TodoForm } from './todo-form';
import { useAuth } from '@/app/context/auth-context';

export function TodoList() {
  const { todos, isLoading, error, fetchTodos } = useTodoStore();
  const { user } = useAuth();


  useEffect(() => {
    let isMounted = true;

    const loadTodos = async () => {
      try {
        await fetchTodos(user?.id);

      } catch (error) {
        console.error('Error loading todos:', error);
      }
    };

    loadTodos();

    return () => {
      isMounted = false;
    };
  }, [fetchTodos, user]);

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Todos</h2>

      <TodoForm />

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Loading todos...</p>
        </div>
      )}
      {!isLoading && error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}
      {!isLoading && !error && todos.length === 0 && (
        <div className="text-center py-8 text-foreground/70">
          No todos yet. Add one above!
        </div>
      )}
      {!isLoading && !error && todos.length > 0 && (
        <div>
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}
