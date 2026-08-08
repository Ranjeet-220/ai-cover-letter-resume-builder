import { NextRequest, NextResponse } from 'next/server';

interface CheckoutBody {
  plan?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const { plan }: CheckoutBody = await req.json();

    if (plan !== 'unlimited' && plan !== 'pack') {
      return NextResponse.json({ error: 'Invalid checkout plan.' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = plan === 'unlimited'
      ? process.env.STRIPE_UNLIMITED_PRICE_ID
      : process.env.STRIPE_CREDITS_PRICE_ID;

    if (stripeSecretKey && priceId) {
      const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
      let returnUrl = req.nextUrl.origin;
      if (configuredAppUrl) {
        try {
          const parsedAppUrl = new URL(configuredAppUrl);
          if (parsedAppUrl.protocol === 'http:' || parsedAppUrl.protocol === 'https:') {
            returnUrl = parsedAppUrl.origin;
          }
        } catch {
          return NextResponse.json(
            { error: 'NEXT_PUBLIC_APP_URL is not a valid HTTP(S) URL.' },
            { status: 503 }
          );
        }
      }
      const params = new URLSearchParams();
      params.append('mode', plan === 'unlimited' ? 'subscription' : 'payment');
      params.append('success_url', `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', returnUrl);
      params.append('line_items[0][price]', priceId);
      params.append('line_items[0][quantity]', '1');
      params.append('metadata[covercraft_plan]', plan);

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const session: unknown = await response.json();
      if (!response.ok) {
        return NextResponse.json({ error: 'Stripe rejected the checkout request.' }, { status: 502 });
      }
      if (typeof session === 'object' && session !== null && 'url' in session && typeof session.url === 'string') {
        return NextResponse.json({ url: session.url });
      }
      return NextResponse.json({ error: 'Stripe returned an invalid checkout session.' }, { status: 502 });
    }

    return NextResponse.json(
      { error: 'Checkout is not configured. Set the Stripe secret and price IDs.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Stripe checkout' },
      { status: 500 }
    );
  }
}
