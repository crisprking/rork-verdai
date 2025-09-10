// AI Service for plant identification and health diagnosis
class AIService {
  private static instance: AIService;
  private apiEndpoint = 'https://floramind-api.vercel.app/api'; // Vercel deployment URL

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Failed to convert image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  async identifyPlant(imageUri: string, userId?: string): Promise<{
    success: boolean;
    data?: {
      plantName: string;
      scientificName: string;
      confidence: number;
      description: string;
      careInstructions: string[];
      commonNames?: string[];
      family?: string;
      origin?: string;
      lightRequirements?: string;
      wateringFrequency?: string;
      humidity?: string;
      temperature?: string;
      toxicity?: string;
      growthRate?: string;
      matureSize?: string;
    };
    error?: string;
  }> {
    try {
      const imageBase64 = await this.convertImageToBase64(imageUri);

      const response = await fetch(`${this.apiEndpoint}/identify-plant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API request failed');
      }

      return {
        success: result.success,
        data: result.data,
      };
    } catch (error) {
      console.error('❌ Plant identification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to identify plant. Please try again.',
      };
    }
  }

  async diagnosePlantHealth(imageUri: string, plantName?: string, userId?: string): Promise<{
    success: boolean;
    data?: {
      diagnosis: string;
      severity: 'low' | 'medium' | 'high';
      confidence: number;
      symptoms: string[];
      treatment: string[];
      prevention: string[];
      urgency?: string;
      affectedAreas?: string[];
      likelySpread?: string;
      recoveryTime?: string;
      followUpRecommendations?: string[];
    };
    error?: string;
  }> {
    try {
      const imageBase64 = await this.convertImageToBase64(imageUri);

      const response = await fetch(`${this.apiEndpoint}/diagnose-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          plantName,
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API request failed');
      }

      return {
        success: result.success,
        data: result.data,
      };
    } catch (error) {
      console.error('❌ Health diagnosis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to diagnose plant health. Please try again.',
      };
    }
  }

  async getCareRecommendations(plantName: string): Promise<{
    success: boolean;
    data?: {
      watering: string;
      lighting: string;
      humidity: string;
      temperature: string;
      fertilizing: string;
      repotting: string;
    };
    error?: string;
  }> {
    try {
      // Mock implementation
      const mockResponse = {
        watering: 'Water when top 1-2 inches of soil are dry, typically every 1-2 weeks',
        lighting: 'Bright, indirect light. Avoid direct sunlight which can scorch leaves',
        humidity: 'Prefers 50-60% humidity. Use humidifier or pebble tray if needed',
        temperature: 'Ideal range is 65-80°F (18-27°C). Avoid cold drafts',
        fertilizing: 'Feed monthly during growing season (spring/summer) with balanced fertilizer',
        repotting: 'Repot every 2-3 years or when roots become pot-bound',
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        data: mockResponse,
      };
    } catch (error) {
      console.error('❌ Care recommendations failed:', error);
      return {
        success: false,
        error: 'Failed to get care recommendations. Please try again.',
      };
    }
  }
}

export default AIService;
