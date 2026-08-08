import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ paid: false, error: 'Missing session_id.' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ paid: false, error: 'Stripe is not configured.' }, { status: 503 });
    }

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const session: unknown = await response.json();
    if (!response.ok) {
      return NextResponse.json({ paid: false, error: 'Failed to verify checkout session.' }, { status: 502 });
    }

    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null;

    if (!isRecord(session) || typeof session.payment_status !== 'string') {
      return NextResponse.json({ paid: false, error: 'Invalid checkout session.' }, { status: 502 });
    }

    const metadata = isRecord(session.metadata) ? session.metadata : null;
    const plan = metadata?.covercraft_plan;
    if (plan !== 'pack' && plan !== 'unlimited') {
      return NextResponse.json(
        { paid: false, error: 'Checkout session is missing valid plan metadata.' },
        { status: 502 }
      );
    }

    const expectedMode = plan === 'unlimited' ? 'subscription' : 'payment';
    const paid = session.payment_status === 'paid' && session.mode === expectedMode;
    return NextResponse.json({ paid, plan });
  } catch (error) {
    console.error('Stripe verify error:', error);
    return NextResponse.json(
      { paid: false, error: 'Failed to verify checkout session' },
      { status: 500 }
    );
  }
}
