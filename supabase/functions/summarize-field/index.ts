import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

interface FieldData {
  field_id: string
  location: string
  crop: string
  crop_stage: string
  last_analysis_date: string
  health_zones: {
    overall_ndvi: number
    problem_areas: string[]
    ndvi_trend: string
  }
  weather: {
    recent_rainfall_mm: number
    temperature_celsius: number
  }
  farmer_actions: {
    last_irrigation: string
    last_fertilizer: string
  }
}

const SYSTEM_PROMPT = `You are 'Soil Saathi', an expert agricultural advisor for Indian smallholder farmers. Your role is to analyze technical satellite and weather data and translate it into a simple, actionable summary for a farmer who may have low literacy.

Instructions:
* Start with a one-sentence summary of the field's overall health (e.g., "Your field is mostly healthy," or "Your field needs attention.").
* Identify the main problem (if any) and its likely cause (e.g., "The north-east corner shows signs of water stress...").
* Provide 1-2 clear, simple, and prioritized action steps (e.g., "1. Irrigate the northern part of the field within 2 days. 2. Consider applying a nitrogen-based fertilizer next week.").
* Keep the language extremely simple.
* The response must be in the language requested. Default to Hindi if not specified.
* Return the response as a JSON object with three keys: summary, diagnosis, and recommendations.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fieldData, language = 'hi' } = await req.json()
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const userPrompt = `Language: ${language}

Here is the field report data:
${JSON.stringify(fieldData, null, 2)}

Please analyze this data and provide insights in the requested language.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    // Try to parse as JSON, fallback to plain text if needed
    let insights
    try {
      insights = JSON.parse(generatedText)
    } catch {
      insights = {
        summary: "Analysis generated successfully",
        diagnosis: generatedText,
        recommendations: []
      }
    }

    return new Response(
      JSON.stringify(insights),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in summarize-field function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate field insights',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})