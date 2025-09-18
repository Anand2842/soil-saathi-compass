import { supabase } from '@/integrations/supabase/client';

export interface Field {
  id: string;
  name: string;
  crop_type: string;
  crop_variety?: string;
  area_hectares: number;
  planting_date?: string;
  expected_harvest_date?: string;
  status: string;
  boundary: any; // GeoJSON geometry
  center_point: any;
  created_at: string;
  updated_at: string;
}

export interface SatelliteAnalysis {
  id: string;
  field_id: string;
  analysis_date: string;
  satellite_source: string;
  cloud_cover_percentage: number;
  ndvi_value: number;
  msavi2_value: number;
  ndre_value: number;
  ndmi_value: number;
  soc_vis_value?: number;
  rvi_value: number;
  crop_stage: string;
  health_status: string;
  water_stress_level: string;
  quality_score: number;
  status: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  action_items: string[];
  estimated_cost?: number;
  implementation_timeline?: string;
  is_implemented: boolean;
  created_at: string;
}

export const fieldService = {
// Create a new field
  async createField(fieldData: {
    name: string;
    crop_type: 'wheat' | 'rice' | 'maize' | 'sugarcane' | 'soybean' | 'cotton' | 'potato' | 'tomato' | 'other';
    crop_variety?: string;
    area_hectares: number;
    boundary: any;
    planting_date?: string;
    expected_harvest_date?: string;
  }) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // First create or get a default farm
    let { data: farm } = await supabase
      .from('farms')
      .select('id')
      .eq('user_id', user.data.user.id)
      .limit(1)
      .single();

    if (!farm) {
      const { data: newFarm, error: farmError } = await supabase
        .from('farms')
        .insert({
          user_id: user.data.user.id,
          name: 'Default Farm',
          total_area_hectares: fieldData.area_hectares
        })
        .select()
        .single();

      if (farmError) throw farmError;
      farm = newFarm;
    }

    const { data, error } = await supabase
      .from('fields')
      .insert({
        ...fieldData,
        user_id: user.data.user.id,
        farm_id: farm.id
      })
      .select()
      .single();

    return { data, error };
  },

  // Get all fields for the current user
  async getUserFields() {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get a specific field
  async getField(fieldId: string) {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('id', fieldId)
      .single();

    return { data, error };
  },

  // Update a field
  async updateField(fieldId: string, updates: Partial<Omit<Field, 'user_id' | 'farm_id'>>) {
    const { data, error } = await supabase
      .from('fields')
      .update(updates as any)
      .eq('id', fieldId)
      .select()
      .single();

    return { data, error };
  },

  // Delete a field
  async deleteField(fieldId: string) {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', fieldId);

    return { error };
  },

  // Get latest satellite analysis for a field
  async getLatestAnalysis(fieldId: string) {
    const { data, error } = await supabase
      .from('satellite_analyses')
      .select('*')
      .eq('field_id', fieldId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  },

  // Get all analyses for a field
  async getFieldAnalyses(fieldId: string) {
    const { data, error } = await supabase
      .from('satellite_analyses')
      .select('*')
      .eq('field_id', fieldId)
      .order('analysis_date', { ascending: false });

    return { data, error };
  },

  // Get recommendations for a field
  async getFieldRecommendations(fieldId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Trigger satellite analysis
  async triggerAnalysis(fieldId: string, boundary: any, cropType?: string, plantingDate?: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // Get auth token for the edge function
    const session = await supabase.auth.getSession();
    
    const { data, error } = await supabase.functions.invoke('gee-analysis', {
      body: {
        fieldId,
        boundary,
        cropType,
        plantingDate,
        analysisDate: new Date().toISOString()
      },
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`
      }
    });

    if (error) {
      console.error('Analysis trigger error:', error);
      throw error;
    }

    return { data, error };
  },

  // Get enhanced field summary
  async getFieldSummary(fieldId: string, language = 'hi') {
    const { data, error } = await supabase.functions.invoke('enhanced-field-summary', {
      body: {
        fieldId,
        language
      }
    });

    return { data, error };
  },

  // Mark recommendation as implemented
  async markRecommendationImplemented(recommendationId: string, feedback?: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .update({
        is_implemented: true,
        farmer_feedback: feedback
      })
      .eq('id', recommendationId)
      .select()
      .single();

    return { data, error };
  }
};