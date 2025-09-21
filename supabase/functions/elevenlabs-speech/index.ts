import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'en', voiceId, speed = 1.0 } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Voice mapping for different languages
    const voiceMapping = {
      en: voiceId || 'EXAVITQu4vr4xnSDxMaL', // Sarah - clear English
      hi: voiceId || 'cgSgspJ2msm6clMCkdW9', // Jessica - good for multilingual
      pa: voiceId || 'pFZP5JQG7iQjIQuC4Bku', // Lily - works well for Punjabi
      default: 'EXAVITQu4vr4xnSDxMaL'
    };

    const selectedVoiceId = voiceMapping[language as keyof typeof voiceMapping] || voiceMapping.default;

    console.log(`Generating speech for language: ${language}, voice: ${selectedVoiceId}`);

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
          speaking_rate: speed
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Convert audio to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      contentType: 'audio/mpeg',
      language: language,
      voiceId: selectedVoiceId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in elevenlabs-speech function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate speech'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});