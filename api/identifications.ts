export const config = { runtime: 'edge' };

type RecordType = { name: string; scientific: string; confidence: number; timestamp: number };

const memory: { items: RecordType[] } = { items: [] };

export default async function handler(req: Request) {
  try {
    const rec = (await req.json()) as RecordType;
    if (!rec || typeof rec.name !== 'string') return json({ ok: false, error: 'bad_payload' }, 400);
    memory.items.unshift(rec);
    if (memory.items.length > 1000) memory.items.length = 1000;
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: 'save_error' }, 500);
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
