import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { stripe, createCheckoutSession, createCustomer } from '@/utils/stripe';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    // Create a server-side Supabase client with appropriate configuration
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false, // Don't persist session on server
            autoRefreshToken: false, // No need to refresh token on server
          },
          global: {
            headers: { 'x-application-name': 'todo-app-server' },
          },
        }
    );


    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { priceId, returnUrl } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Check if the user already has a Stripe customer ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId;

    if (customerError || !customer) {
      // Create a new Stripe customer
      customerId = await createCustomer(user.email || '');

      // Store the customer ID in the database
      await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId,
        });
    } else {
      customerId = customer.stripe_customer_id;
    }

    // Create a checkout session
    const { url } = await createCheckoutSession(
      customerId,
      priceId,
      returnUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    );

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error creating checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      statusCode: error.statusCode
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
