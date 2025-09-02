export const config = { runtime: 'edge' };

function tokenFor(email: string) {
  const payload = { email, iat: Date.now() };
  return btoa(JSON.stringify(payload));
}

export default async function handler(req: Request) {
  console.log('[API] Signup request received');
  
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
    const body = await req.text();
    console.log('[API] Signup body:', body);
    
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError);
      return json({ error: 'invalid_json' }, 400);
    }
    
    const { email, password, name } = data as { email?: string; password?: string; name?: string };
    
    if (!email || !password) {
      console.log('[API] Missing fields:', { email: !!email, password: !!password });
      return json({ error: 'missing_fields' }, 400);
    }
    
    // Basic validation
    if (!email.includes('@')) {
      return json({ error: 'invalid_email' }, 400);
    }
    
    if (password.length < 6) {
      return json({ error: 'password_too_short' }, 400);
    }
    
    const token = tokenFor(email);
    const response = {
      token,
      userId: email,
      name: name || email.split('@')[0]
    };
    
    console.log('[API] Signup successful for:', email);
    return json(response, 200);
  } catch (e) {
    console.error('[API] Signup error:', e);
    return json({ error: 'signup_error', message: String(e) }, 500);
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
