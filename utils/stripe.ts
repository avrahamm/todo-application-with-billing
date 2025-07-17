import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function createCheckoutSession(customerId: string, priceId: string, returnUrl: string) {
  try {
    // Ensure returnUrl is a valid URL
    const baseUrl = returnUrl || 'http://localhost:3000';

    console.log('Creating checkout session with:', {
      customerId,
      priceId,
      returnUrl,
      baseUrl
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: `${baseUrl}?success=true`,
      cancel_url: `${baseUrl}?canceled=true`,
    });

    console.log('Generated checkout URL:', session.url);

    return { sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error('Error creating checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      statusCode: error.statusCode
    });
    throw error;
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });

    return customer.id;
  } catch (error: any) {
    console.error('Error creating customer:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      statusCode: error.statusCode
    });
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error: any) {
    console.error('Error canceling subscription:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      statusCode: error.statusCode
    });
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error: any) {
    console.error('Error retrieving subscription:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      statusCode: error.statusCode
    });
    throw error;
  }
}
