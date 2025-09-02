export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const { plant } = (await req.json().catch(() => ({}))) as { plant?: string };

    const generic = [
      'Water when the top 2–3cm of soil is dry. Reduce in winter.',
      'Bright, indirect light suits most houseplants.',
      'Use pots with drainage; empty saucers after watering.',
      'Wipe leaves monthly; inspect for pests weekly.',
      'Fertilize lightly during active growth (spring–summer).',
    ];

    const tips = plant ? [`${plant}: ensure correct light for its species.`, ...generic] : generic;
    return json({ tips });
  } catch (e) {
    return json({ tips: ['Keep soil lightly moist, not soggy.', 'Provide bright, indirect light.'] });
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
