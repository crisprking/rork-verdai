// Vercel API Route: /api/vision-proxy
// This protects your Google Cloud credentials from being exposed in the mobile app

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image data required' });
    }

    // Use your service account credentials server-side
    // Store these in Vercel environment variables
    const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!GOOGLE_CLOUD_API_KEY) {
      console.error('Google Cloud API key not configured');
      return res.status(500).json({ error: 'Vision API not configured' });
    }

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: image
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
                { type: 'WEB_DETECTION', maxResults: 10 },
                { type: 'IMAGE_PROPERTIES', maxResults: 5 }
              ]
            }
          ]
        })
      }
    );

    if (!visionResponse.ok) {
      throw new Error(`Vision API error: ${visionResponse.status}`);
    }

    const data = await visionResponse.json();
    
    // Process and return plant-specific data
    const response = data.responses?.[0];
    const labels = response?.labelAnnotations || [];
    const webEntities = response?.webDetection?.webEntities || [];
    
    // Filter for plant-related information
    const plantLabels = labels.filter(label => {
      const desc = label.description.toLowerCase();
      return desc.includes('plant') || 
             desc.includes('leaf') || 
             desc.includes('flower') ||
             desc.includes('tree') ||
             desc.includes('succulent') ||
             desc.includes('cactus');
    });

    // Find specific plant species from web detection
    const plantSpecies = webEntities.filter(entity => {
      const desc = (entity.description || '').toLowerCase();
      return desc.includes('plant') || 
             desc.includes('species') ||
             desc.includes('botanical');
    });

    return res.status(200).json({
      success: true,
      labels: plantLabels,
      species: plantSpecies,
      webEntities: webEntities.slice(0, 5),
      confidence: plantLabels[0]?.score || 0
    });

  } catch (error) {
    console.error('Vision proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to process image',
      message: error.message 
    });
  }
}
