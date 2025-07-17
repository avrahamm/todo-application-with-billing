import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false, // Don't persist session on server
      autoRefreshToken: false, // No need to refresh token on server
    },
    global: {
      headers: { 
        'x-application-name': 'todo-app-test',
        'Accept': 'application/json'
      },
    },
  }
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the user already has a customer record
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    let customerId;

    if (customerError || !customer) {
      // Create a new customer record
      const { data: newCustomer, error: newCustomerError } = await supabaseAdmin
        .from('customers')
        .insert({
          user_id: userId,
          stripe_customer_id: 'test_customer_' + Date.now(),
        })
        .select()
        .single();

      if (newCustomerError) {
        console.error('Error creating customer:', newCustomerError);
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        );
      }

      customerId = newCustomer.stripe_customer_id;
    } else {
      customerId = customer.stripe_customer_id;
    }

    // Create a test subscription record
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Subscription ends in 1 month

    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: 'test_subscription_' + Date.now(),
        status: 'active',
        price_id: process.env.NEXT_PUBLIC_PRO_PRICE_ID || 'price_test',
        quantity: 1,
        cancel_at_period_end: false,
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString(),
      })
      .select();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test subscription created successfully',
      subscription
    });
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}