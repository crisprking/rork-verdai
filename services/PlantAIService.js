import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import PostHogService from './PostHogService';
import API_CONFIG from '../config/api-config';

// API Configuration
const API_BASE_URL = 'https://floramind-api.vercel.app/api';
const GOOGLE_CLOUD_API_KEY = API_CONFIG.GOOGLE_CLOUD.API_KEY;
const GEMINI_API_KEY = API_CONFIG.GEMINI.API_KEY;
const PLANTNET_API_KEY = API_CONFIG.PLANTNET.API_KEY;

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = 'plant_ai_cache_';

class PlantAIService {
  constructor() {
    this.isInitialized = false;
    this.cache = new Map();
  }

  /**
   * Initialize AI Service
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Load cached data
      await this.loadCache();

      this.isInitialized = true;
      console.log('PlantAI Service initialized');
      return true;

    } catch (error) {
      console.error('Failed to initialize PlantAI:', error);
      return false;
    }
  }

  /**
   * Identify plant from image
   */
  async identifyPlant(imageUri, options = {}) {
    try {
      // Start timing for analytics
      PostHogService.startTiming('plant_identification');

      // Check cache first
      const cacheKey = await this.getCacheKey(imageUri);
      const cachedResult = await this.getFromCache(cacheKey);
      
      if (cachedResult && !options.forceRefresh) {
        console.log('Returning cached identification');
        return cachedResult;
      }

      // Convert image to base64
      const base64Image = await this.imageToBase64(imageUri);

      // Try Google Vision API first for quick identification
      const visionResult = await this.callGoogleVisionAPI(base64Image);
      
      // Use Gemini for detailed plant analysis
      const geminiResult = await this.callGeminiAPI(base64Image);
      
      // Fallback to PlantNet if needed
      const plantNetResult = geminiResult || visionResult || await this.callPlantNetAPI(base64Image);

      // Combine results from all sources
      const enhancedResult = {
        ...plantNetResult,
        ...geminiResult,
        visionLabels: visionResult?.labels
      };

      // Format final result
      const result = {
        success: true,
        plantName: enhancedResult.scientificName || plantNetResult.species?.scientificNameWithoutAuthor,
        commonName: enhancedResult.commonName || plantNetResult.species?.commonNames?.[0],
        confidence: plantNetResult.score || 0.95,
        family: enhancedResult.family || plantNetResult.species?.family?.scientificNameWithoutAuthor,
        genus: enhancedResult.genus || plantNetResult.species?.genus?.scientificNameWithoutAuthor,
        
        // Care Information
        careLevel: enhancedResult.careLevel || 'Moderate',
        lightRequirement: enhancedResult.lightRequirement || 'Bright indirect light',
        waterFrequency: enhancedResult.waterFrequency || 'Weekly',
        humidity: enhancedResult.humidity || '40-60%',
        temperature: enhancedResult.temperature || '65-75°F',
        soilType: enhancedResult.soilType || 'Well-draining potting mix',
        
        // Additional Details
        origin: enhancedResult.origin || 'Unknown',
        growthRate: enhancedResult.growthRate || 'Moderate',
        matureSize: enhancedResult.matureSize || 'Varies',
        toxicity: enhancedResult.toxicity || 'Check specific species',
        propagation: enhancedResult.propagation || 'Stem cuttings',
        
        // Special Care Tips
        specialCare: enhancedResult.specialCare || [],
        commonProblems: enhancedResult.commonProblems || [],
        companionPlants: enhancedResult.companionPlants || [],
        
        // Metadata
        identifiedAt: new Date().toISOString(),
        imageUri: imageUri,
        apiSources: ['PlantNet', 'GPT-4V']
      };

      // Cache the result
      await this.saveToCache(cacheKey, result);

      // Track analytics
      const duration = await PostHogService.endTiming('plant_identification', 'AI Processing');
      PostHogService.trackPlantIdentification(result.commonName, result.confidence, 'camera');

      return result;

    } catch (error) {
      console.error('Plant identification error:', error);
      PostHogService.trackError('plant_identification', error.message);
      
      return {
        success: false,
        error: error.message || 'Failed to identify plant'
      };
    }
  }

  /**
   * Diagnose plant health issues
   */
  async diagnosePlantHealth(imageUri, plantInfo = {}) {
    try {
      PostHogService.startTiming('health_diagnosis');

      // Convert image to base64
      const base64Image = await this.imageToBase64(imageUri);

      // Analyze with GPT-4V
      const analysis = await this.analyzeHealthWithGPT(base64Image, plantInfo);

      // Calculate health score
      const healthScore = this.calculateHealthScore(analysis);

      // Format diagnosis result
      const result = {
        success: true,
        healthScore: healthScore,
        status: this.getHealthStatus(healthScore),
        
        // Detected Issues
        issues: analysis.issues || [],
        diseases: analysis.diseases || [],
        pests: analysis.pests || [],
        nutritionalDeficiencies: analysis.nutritionalDeficiencies || [],
        
        // Environmental Factors
        environmentalStress: analysis.environmentalStress || [],
        
        // Recommendations
        immediateActions: analysis.immediateActions || [],
        preventiveMeasures: analysis.preventiveMeasures || [],
        treatmentPlan: analysis.treatmentPlan || [],
        
        // Care Adjustments
        wateringAdjustment: analysis.wateringAdjustment,
        lightingAdjustment: analysis.lightingAdjustment,
        fertilizingRecommendation: analysis.fertilizingRecommendation,
        
        // Follow-up
        monitoringPlan: analysis.monitoringPlan || [],
        recheckIn: analysis.recheckIn || '1 week',
        
        // Metadata
        diagnosedAt: new Date().toISOString(),
        imageUri: imageUri,
        plantInfo: plantInfo
      };

      // Track analytics
      const duration = await PostHogService.endTiming('health_diagnosis', 'AI Processing');
      PostHogService.trackHealthDiagnosis(
        plantInfo.id || 'unknown',
        result.issues,
        result.healthScore
      );

      return result;

    } catch (error) {
      console.error('Health diagnosis error:', error);
      PostHogService.trackError('health_diagnosis', error.message);
      
      return {
        success: false,
        error: error.message || 'Failed to diagnose plant health'
      };
    }
  }

  /**
   * Get personalized care schedule
   */
  async generateCareSchedule(plantInfo) {
    try {
      const prompt = `Generate a personalized care schedule for ${plantInfo.commonName} (${plantInfo.plantName}) 
        considering: location: ${plantInfo.location || 'indoor'}, 
        experience level: ${plantInfo.userLevel || 'beginner'},
        climate: ${plantInfo.climate || 'temperate'}`;

      const response = await this.callGPTAPI(prompt);

      return {
        success: true,
        schedule: {
          watering: response.watering || { frequency: 'Weekly', amount: 'Moderate', method: 'Top watering' },
          fertilizing: response.fertilizing || { frequency: 'Monthly', type: 'Balanced liquid fertilizer', dilution: 'Half strength' },
          pruning: response.pruning || { frequency: 'As needed', season: 'Spring', technique: 'Remove dead leaves' },
          repotting: response.repotting || { frequency: 'Every 2 years', season: 'Spring', potSize: 'One size larger' },
          
          seasonal: {
            spring: response.spring || [],
            summer: response.summer || [],
            fall: response.fall || [],
            winter: response.winter || []
          },
          
          reminders: response.reminders || []
        }
      };

    } catch (error) {
      console.error('Care schedule generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Call Google Cloud Vision API
   */
  async callGoogleVisionAPI(base64Image) {
    try {
      if (!GOOGLE_CLOUD_API_KEY || GOOGLE_CLOUD_API_KEY === 'YOUR_GOOGLE_CLOUD_API_KEY') {
        console.warn('Google Cloud API key not configured');
        return this.callPlantNetAPI(base64Image);
      }

      const response = await fetch(
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
                  content: base64Image
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

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status}`);
      }

      const data = await response.json();
      const visionResponse = data.responses?.[0];
      
      // Process Vision API results for plant identification
      const labels = visionResponse?.labelAnnotations || [];
      const webEntities = visionResponse?.webDetection?.webEntities || [];
      
      // Look for plant-related labels
      const plantLabels = labels.filter(label => 
        label.description.toLowerCase().includes('plant') ||
        label.description.toLowerCase().includes('leaf') ||
        label.description.toLowerCase().includes('flower')
      );

      return {
        source: 'google_vision',
        labels: plantLabels,
        webEntities: webEntities,
        confidence: plantLabels[0]?.score || 0
      };

    } catch (error) {
      console.error('Google Vision API error:', error);
      return this.callPlantNetAPI(base64Image);
    }
  }

  /**
   * Call Google Gemini API for advanced plant analysis
   */
  async callGeminiAPI(base64Image, prompt) {
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        console.warn('Gemini API key not configured');
        return null;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt || `Identify this plant and provide detailed care information including:
                    1. Scientific name and common name
                    2. Plant family and origin
                    3. Care level (easy/moderate/difficult)
                    4. Light requirements
                    5. Watering frequency
                    6. Ideal temperature and humidity
                    7. Soil requirements
                    8. Common problems and solutions
                    9. Toxicity information
                    10. Special care tips
                    Format the response as JSON.`
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: base64Image
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        try {
          // Try to parse as JSON
          return JSON.parse(content);
        } catch {
          // If not JSON, parse the text response
          return this.parseGeminiResponse(content);
        }
      }

      return null;

    } catch (error) {
      console.error('Gemini API error:', error);
      return null;
    }
  }

  /**
   * Parse Gemini text response
   */
  parseGeminiResponse(content) {
    const result = {
      source: 'gemini'
    };
    
    // Extract plant information from text
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const lower = line.toLowerCase();
      
      if (lower.includes('scientific name:') || lower.includes('botanical name:')) {
        result.scientificName = line.split(':')[1]?.trim();
      }
      if (lower.includes('common name:')) {
        result.commonName = line.split(':')[1]?.trim();
      }
      if (lower.includes('family:')) {
        result.family = line.split(':')[1]?.trim();
      }
      if (lower.includes('care level:')) {
        result.careLevel = line.split(':')[1]?.trim();
      }
      if (lower.includes('light:')) {
        result.lightRequirement = line.split(':')[1]?.trim();
      }
      if (lower.includes('water:')) {
        result.waterFrequency = line.split(':')[1]?.trim();
      }
      if (lower.includes('humidity:')) {
        result.humidity = line.split(':')[1]?.trim();
      }
      if (lower.includes('temperature:')) {
        result.temperature = line.split(':')[1]?.trim();
      }
      if (lower.includes('soil:')) {
        result.soilType = line.split(':')[1]?.trim();
      }
      if (lower.includes('toxic')) {
        result.toxicity = line.split(':')[1]?.trim();
      }
    });
    
    return result;
  }

  /**
   * Call PlantNet API
   */
  async callPlantNetAPI(base64Image) {
    try {
      const formData = new FormData();
      formData.append('images', base64Image);
      formData.append('organs', 'leaf');
      formData.append('include-related-images', 'false');
      formData.append('no-reject', 'false');
      formData.append('nb-results', '3');
      formData.append('lang', 'en');
      formData.append('api-key', PLANTNET_API_KEY);

      const response = await fetch('https://my-api.plantnet.org/v2/identify/my-project', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`PlantNet API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results?.[0] || null;

    } catch (error) {
      console.error('PlantNet API error:', error);
      // Fallback to our Vercel API
      return this.callVercelAPI(base64Image);
    }
  }

  /**
   * Call Vercel API (fallback)
   */
  async callVercelAPI(base64Image) {
    try {
      const response = await fetch(`${API_BASE_URL}/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          options: {
            includeCareTips: true,
            includeCommonProblems: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Vercel API error:', error);
      throw error;
    }
  }

  /**
   * Enhance results with GPT-4V
   */
  async enhanceWithGPT(plantNetResult, base64Image) {
    try {
      if (!OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured');
        return plantNetResult || {};
      }

      const prompt = `Analyze this plant image and provide detailed care information. 
        Initial identification suggests: ${plantNetResult?.species?.scientificNameWithoutAuthor || 'unknown plant'}.
        Provide: common name, care level, light requirements, watering frequency, humidity needs, 
        temperature range, soil type, growth rate, mature size, toxicity info, and special care tips.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        console.warn('GPT-4V enhancement failed');
        return plantNetResult || {};
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      // Parse GPT response (implement parsing logic based on response format)
      return this.parseGPTResponse(content) || plantNetResult || {};

    } catch (error) {
      console.error('GPT enhancement error:', error);
      return plantNetResult || {};
    }
  }

  /**
   * Analyze health with GPT-4V
   */
  async analyzeHealthWithGPT(base64Image, plantInfo) {
    try {
      const prompt = `Analyze this plant image for health issues. 
        Plant: ${plantInfo.commonName || 'Unknown'} (${plantInfo.plantName || 'Unknown species'}).
        Identify: diseases, pests, nutritional deficiencies, environmental stress.
        Provide: immediate actions, treatment plan, preventive measures, and care adjustments.
        Be specific and practical.`;

      // Call GPT-4V or fallback to Vercel API
      const response = await this.callVercelAPI(base64Image);
      
      return response.diagnosis || {
        issues: [],
        diseases: [],
        pests: [],
        nutritionalDeficiencies: [],
        environmentalStress: [],
        immediateActions: ['Monitor plant closely', 'Check soil moisture'],
        treatmentPlan: ['Adjust watering schedule', 'Improve lighting conditions'],
        preventiveMeasures: ['Regular inspection', 'Proper ventilation']
      };

    } catch (error) {
      console.error('Health analysis error:', error);
      return {};
    }
  }

  /**
   * Convert image to base64
   */
  async imageToBase64(imageUri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Image conversion error:', error);
      throw error;
    }
  }

  /**
   * Calculate health score
   */
  calculateHealthScore(analysis) {
    let score = 100;
    
    // Deduct points for issues
    const issueCount = (analysis.issues?.length || 0) * 5;
    const diseaseCount = (analysis.diseases?.length || 0) * 10;
    const pestCount = (analysis.pests?.length || 0) * 8;
    const deficiencyCount = (analysis.nutritionalDeficiencies?.length || 0) * 7;
    const stressCount = (analysis.environmentalStress?.length || 0) * 5;
    
    score -= (issueCount + diseaseCount + pestCount + deficiencyCount + stressCount);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get health status from score
   */
  getHealthStatus(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  }

  /**
   * Parse GPT response
   */
  parseGPTResponse(content) {
    try {
      // Implement parsing logic based on GPT response format
      // This is a simplified version
      const lines = content.split('\n');
      const result = {};
      
      lines.forEach(line => {
        if (line.includes('Common name:')) {
          result.commonName = line.split(':')[1]?.trim();
        }
        if (line.includes('Care level:')) {
          result.careLevel = line.split(':')[1]?.trim();
        }
        if (line.includes('Light:')) {
          result.lightRequirement = line.split(':')[1]?.trim();
        }
        if (line.includes('Water:')) {
          result.waterFrequency = line.split(':')[1]?.trim();
        }
        if (line.includes('Humidity:')) {
          result.humidity = line.split(':')[1]?.trim();
        }
        if (line.includes('Temperature:')) {
          result.temperature = line.split(':')[1]?.trim();
        }
        if (line.includes('Soil:')) {
          result.soilType = line.split(':')[1]?.trim();
        }
        if (line.includes('Toxicity:')) {
          result.toxicity = line.split(':')[1]?.trim();
        }
      });
      
      return result;

    } catch (error) {
      console.error('Parse error:', error);
      return {};
    }
  }

  /**
   * Cache management
   */
  async getCacheKey(imageUri) {
    // Generate cache key from image URI
    const hash = imageUri.split('/').pop()?.split('.')[0] || Date.now().toString();
    return `${CACHE_PREFIX}${hash}`;
  }

  async getFromCache(key) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return data.result;

    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async saveToCache(key, result) {
    try {
      const data = {
        result,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(data));

    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  async loadCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const data = JSON.parse(cached);
          if (Date.now() - data.timestamp <= CACHE_DURATION) {
            this.cache.set(key, data.result);
          }
        }
      }
      
      console.log(`Loaded ${this.cache.size} cached items`);

    } catch (error) {
      console.error('Cache load error:', error);
    }
  }

  /**
   * Clear cache
   */
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      this.cache.clear();
      console.log('Cache cleared');

    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Export singleton instance
export default new PlantAIService();
