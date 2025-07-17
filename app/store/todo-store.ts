'use client';

import { create } from 'zustand';
import { supabase, Todo } from '@/utils/supabase';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  todoCount: number;
  fetchTodos: (userId: string | undefined) => Promise<void>;
  addTodo: (title: string, userId: string | undefined) => Promise<void>;
  toggleTodo: (id: string, completed: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  getTodoLimitMessage: (isAuthenticated: boolean, isProUser: boolean) => string;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,
  todoCount: 0,

  fetchTodos: async (userId: string | undefined) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('todos')
        .select('*');

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // If no user is logged in, only show todos with null user_id (public todos)
        query = query.is('user_id', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        todos: data as Todo[], 
        todoCount: data.length,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error fetching todos:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      set({ 
        error: error.message || 'Failed to fetch todos', 
        isLoading: false 
      });
    }
  },

  addTodo: async (title: string, userId: string | undefined) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title, user_id: userId || null }])
        .select();

      if (error) throw error;

      const newTodo = data[0] as Todo;
      const todos = [newTodo, ...get().todos];

      set({ 
        todos, 
        todoCount: todos.length,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error adding todo:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      set({ 
        error: error.message || 'Failed to add todo', 
        isLoading: false 
      });
    }
  },

  toggleTodo: async (id: string, completed: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;

      const todos = get().todos.map(todo => 
        todo.id === id ? { ...todo, completed } : todo
      );

      set({ todos, isLoading: false });
    } catch (error: any) {
      console.error('Error toggling todo:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      set({ 
        error: error.message || 'Failed to update todo', 
        isLoading: false 
      });
    }
  },

  deleteTodo: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const todos = get().todos.filter(todo => todo.id !== id);

      set({ 
        todos, 
        todoCount: todos.length,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error deleting todo:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      set({ 
        error: error.message || 'Failed to delete todo', 
        isLoading: false 
      });
    }
  },

  getTodoLimitMessage: (isAuthenticated: boolean, isProUser: boolean) => {
    const { todoCount } = get();

    if (!isAuthenticated) {
      const remaining = Math.max(0, 3 - todoCount);
      return `You can create ${remaining} more todo${remaining === 1 ? '' : 's'} as an unregistered user.`;
    }

    if (!isProUser) {
      const remaining = Math.max(0, 5 - todoCount);
      return `You can create ${remaining} more todo${remaining === 1 ? '' : 's'} as a free user.`;
    }

    return 'You have unlimited todos as a PRO user.';
  }
}));
