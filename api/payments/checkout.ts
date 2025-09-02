export const config = { runtime: 'edge' };

interface Body {
  priceId?: string;
  mode?: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
}

export default async function handler(req: Request) {
  console.log('[API] Checkout request received');
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const price = body.priceId;
    const mode = (body.mode ?? 'subscription') as 'subscription' | 'payment';

    if (!price) return json({ error: 'missing_priceId' }, 400);

    const key = (process as any)?.env?.STRIPE_SECRET_KEY as string | undefined;
    if (!key) {
      return json({ error: 'stripe_not_configured' }, 400);
    }

    const origin = req.headers.get('origin') ?? req.headers.get('x-forwarded-host') ?? '';
    const proto = req.headers.get('x-forwarded-proto') ?? 'https';
    const base = origin.includes('http') ? origin : `${proto}://${origin}`;

    const success = body.successUrl ?? `${base}/?checkout_status=success`;
    const cancel = body.cancelUrl ?? `${base}/?checkout_status=cancel`;

    const form = new URLSearchParams();
    form.set('mode', mode);
    form.set('success_url', success);
    form.set('cancel_url', cancel);
    form.set('line_items[0][price]', price);
    form.set('line_items[0][quantity]', '1');
    if (body.customerEmail) form.set('customer_email', body.customerEmail);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const text = await safeText(res);
      return json({ error: 'stripe_error', details: text }, 400);
    }

    const session = (await res.json()) as { url?: string };
    if (!session?.url) return json({ error: 'no_url' }, 400);

    return json({ url: session.url });
  } catch (e) {
    return json({ error: 'checkout_error' }, 500);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function safeText(res: Response) { try { return await res.text(); } catch { return ''; } }
