import { supabase } from '@/integrations/supabase/client'

export interface FieldData {
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

export interface FieldInsights {
  summary: string
  diagnosis: string
  recommendations: string[]
}

export const api = {
  async summarizeField(fieldData: FieldData, language: string = 'hi'): Promise<FieldInsights> {
    const { data, error } = await supabase.functions.invoke('summarize-field', {
      body: { fieldData, language }
    })
    
    if (error) {
      throw new Error(`Failed to get field insights: ${error.message}`)
    }
    
    return data
  }
}