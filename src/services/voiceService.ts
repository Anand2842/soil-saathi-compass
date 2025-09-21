import { supabase } from "@/integrations/supabase/client";

export interface VoiceOptions {
  language: 'en' | 'hi' | 'pa';
  speed?: number;
  voiceId?: string;
}

export interface AudioResponse {
  audioContent: string;
  contentType: string;
  language: string;
  voiceId: string;
}

class VoiceService {
  private audioCache = new Map<string, string>();
  private currentAudio: HTMLAudioElement | null = null;

  async textToSpeech(text: string, options: VoiceOptions = { language: 'en' }): Promise<AudioResponse> {
    // Create cache key
    const cacheKey = `${text}-${options.language}-${options.speed || 1.0}`;
    
    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      const cachedAudio = this.audioCache.get(cacheKey)!;
      return {
        audioContent: cachedAudio,
        contentType: 'audio/mpeg',
        language: options.language,
        voiceId: ''
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-speech', {
        body: {
          text: text,
          language: options.language,
          speed: options.speed || 1.0,
          voiceId: options.voiceId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate speech');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Cache the result
      if (data?.audioContent) {
        this.audioCache.set(cacheKey, data.audioContent);
      }

      return data;
    } catch (error) {
      console.error('Voice service error:', error);
      throw error;
    }
  }

  async playAudio(audioContent: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        this.stopAudio();

        // Create new audio element
        this.currentAudio = new Audio();
        this.currentAudio.src = `data:audio/mpeg;base64,${audioContent}`;
        
        this.currentAudio.onended = () => {
          resolve();
        };

        this.currentAudio.onerror = () => {
          reject(new Error('Audio playback failed'));
        };

        this.currentAudio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  // Preprocess text for better pronunciation
  preprocessText(text: string, language: 'en' | 'hi' | 'pa'): string {
    // Agricultural term mappings for better pronunciation
    const termMappings: Record<string, Record<string, string>> = {
      en: {
        'NDVI': 'N-D-V-I index',
        'NDRE': 'N-D-R-E index',
        'MSAVI': 'M-SAVI index',
        'pH': 'P-H level'
      },
      hi: {
        'NDVI': 'एनडीवीआई सूचकांक',
        'NDRE': 'एनडीआरई सूचकांक', 
        'MSAVI': 'एमसावी सूचकांक',
        'pH': 'पीएच स्तर'
      },
      pa: {
        'NDVI': 'ਐਨਡੀਵੀਆਈ ਸੂਚਕਾਂਕ',
        'NDRE': 'ਐਨਡੀਆਰਈ ਸੂਚਕਾਂਕ',
        'MSAVI': 'ਐਮਐਸਏਵੀਆਈ ਸੂਚਕਾਂਕ',
        'pH': 'ਪੀਐਚ ਪੱਧਰ'
      }
    };

    let processedText = text;
    const mappings = termMappings[language] || {};

    // Replace technical terms with pronunciable versions
    Object.entries(mappings).forEach(([term, pronunciation]) => {
      const regex = new RegExp(term, 'gi');
      processedText = processedText.replace(regex, pronunciation);
    });

    return processedText;
  }

  // Clear cache to manage memory
  clearCache(): void {
    this.audioCache.clear();
  }
}

export const voiceService = new VoiceService();