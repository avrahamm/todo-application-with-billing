import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a custom fetch implementation with longer timeout
const customFetch = (url: RequestInfo | URL, options?: RequestInit) => {
  return fetch(url, {
    ...options,
    signal: options?.signal || (typeof AbortController !== 'undefined' ? new AbortController().signal : undefined),
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit', // Use implicit flow for better browser compatibility
  },
  global: {
    fetch: customFetch,
    headers: { 'x-application-name': 'todo-app' },
  },
  realtime: {
    timeout: 60000, // Increase timeout for realtime connections
  },
});

// Database types
export type Todo = {
  id: string;
  user_id: string | null;
  title: string;
  completed: boolean;
  created_at: string;
};

export type UserSubscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  price_id: string;
  quantity: number;
  cancel_at_period_end: boolean;
  created_at: string;
  current_period_start: string;
  current_period_end: string;
  ended_at: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
};

// Helper functions
export async function getUserTodoCount(userId: string | undefined): Promise<number> {
  if (!userId) return 0;

  const { count, error } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting todo count:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return 0;
  }

  return count || 0;
}

export async function getUserSubscription(userId: string | undefined): Promise<UserSubscription | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      // Check if the error is a "not found" error, which is expected when a user doesn't have a subscription
      if (error.code === 'PGRST116') {
        // This is a "not found" error, which is expected for users without subscriptions
        return null;
      }

      console.error('Error getting user subscription:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    return data as UserSubscription;
  } catch (e) {
    // Catch any unexpected errors that might occur
    console.error('Unexpected error in getUserSubscription:', e);
    return null;
  }
}

export async function isProUser(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;

  try {
    const subscription = await getUserSubscription(userId);
    return !!subscription;
  } catch (e) {
    console.error('Error in isProUser:', e);
    return false;
  }
}
