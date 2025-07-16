'use client';

import { Todo } from '@/utils/supabase';
import { useTodoStore } from '@/app/store/todo-store';
import { Button } from '@/app/components/ui/button';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoStore();

  const handleToggle = async () => {
    await toggleTodo(todo.id, !todo.completed);
  };

  const handleDelete = async () => {
    await deleteTodo(todo.id);
  };

  return (
    <div className="flex items-center justify-between p-4 border border-foreground/10 rounded-md mb-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="h-5 w-5 rounded border-foreground/20 focus:ring-foreground/30"
        />
        <span className={`${todo.completed ? 'line-through text-foreground/50' : ''}`}>
          {todo.title}
        </span>
      </div>
      <Button 
        variant="danger" 
        size="sm" 
        onClick={handleDelete}
        aria-label="Delete todo"
      >
        Delete
      </Button>
    </div>
  );
}