import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCheckoutSession, createCustomer } from '@/utils/stripe';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { priceId, returnUrl, userId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the user already has a Stripe customer ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId;

    if (customerError || !customer) {
      // Create a new Stripe customer
      customerId = await createCustomer('user@example.com');

      // Store the customer ID in the database
      await supabase
        .from('customers')
        .insert({
          user_id: userId,
          stripe_customer_id: customerId,
        });
    } else {
      customerId = customer.stripe_customer_id;
    }

    const baseUrl = returnUrl || 'http://localhost:3000';

    const { url } = await createCheckoutSession(
      customerId,
      priceId,
      baseUrl
    );

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
