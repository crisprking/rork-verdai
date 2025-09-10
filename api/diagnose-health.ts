import { NextRequest, NextResponse } from 'next/server';

// Plant health diagnosis API endpoint
export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { imageBase64, plantName, userId } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // TODO: Replace with actual plant health AI service
    const mockDiagnosisData = {
      diagnosis: 'Spider Mites Infestation',
      severity: 'medium' as const,
      confidence: 0.88,
      symptoms: [
        'Small yellow/white spots on leaves',
        'Fine webbing visible on plant surfaces',
        'Leaves turning yellow and dropping prematurely',
        'Stunted growth',
        'Dry, dusty appearance on leaves'
      ],
      treatment: [
        'Spray with insecticidal soap solution',
        'Increase humidity around the plant (50-60%)',
        'Isolate plant from other houseplants immediately',
        'Wipe leaves with damp cloth daily',
        'Apply neem oil treatment weekly',
        'Improve air circulation around plant'
      ],
      prevention: [
        'Maintain proper humidity levels (50-60%)',
        'Regular inspection of plants weekly',
        'Quarantine new plants for 2 weeks',
        'Keep plants well-watered but not soggy',
        'Clean leaves regularly',
        'Avoid over-fertilizing'
      ],
      urgency: 'Moderate - treat within 1 week',
      affectedAreas: ['Leaves', 'Stems'],
      likelySpread: 'High - can spread to nearby plants',
      recoveryTime: '2-4 weeks with proper treatment',
      followUpRecommendations: [
        'Monitor plant daily for 2 weeks',
        'Repeat treatment if symptoms persist',
        'Consider professional consultation if no improvement'
      ]
    };

    // Log the request for analytics
    console.log('Health diagnosis request:', {
      userId,
      plantName,
      diagnosis: mockDiagnosisData.diagnosis,
      severity: mockDiagnosisData.severity,
      timestamp: new Date().toISOString(),
      confidence: mockDiagnosisData.confidence
    });

    return NextResponse.json({
      success: true,
      data: mockDiagnosisData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to diagnose plant health', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
