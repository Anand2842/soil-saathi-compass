import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FieldBoundary {
  coordinates: number[][][];
}

interface AnalysisRequest {
  fieldId: string;
  boundary: FieldBoundary;
  analysisDate?: string;
  cropType?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth token from request
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { fieldId, boundary, analysisDate, cropType }: AnalysisRequest = await req.json();
    
    if (!fieldId || !boundary) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting GEE analysis for field ${fieldId} by user ${user.id}`);

    // For now, simulate GEE analysis with realistic values based on crop type and date
    const currentDate = analysisDate ? new Date(analysisDate) : new Date();
    const analysisResults = await simulateGEEAnalysis(boundary, cropType, currentDate);

    // Store results in database
    const { data: analysisRecord, error: dbError } = await supabaseClient
      .from('satellite_analyses')
      .insert({
        field_id: fieldId,
        user_id: user.id,
        analysis_date: currentDate.toISOString().split('T')[0],
        satellite_source: 'sentinel-2',
        cloud_cover_percentage: analysisResults.cloudCover,
        ndvi_value: analysisResults.ndvi,
        msavi2_value: analysisResults.msavi2,
        ndre_value: analysisResults.ndre,
        ndmi_value: analysisResults.ndmi,
        soc_vis_value: analysisResults.socVis,
        rvi_value: analysisResults.rvi,
        crop_stage: analysisResults.cropStage,
        health_status: analysisResults.healthStatus,
        water_stress_level: analysisResults.waterStressLevel,
        quality_score: analysisResults.qualityScore,
        status: 'completed',
        raw_data: analysisResults
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to save analysis' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate AI recommendations based on the analysis
    const recommendations = await generateRecommendations(analysisResults, cropType);
    
    // Store recommendations
    if (recommendations.length > 0) {
      const { error: recError } = await supabaseClient
        .from('recommendations')
        .insert(
          recommendations.map(rec => ({
            field_id: fieldId,
            user_id: user.id,
            analysis_id: analysisRecord.id,
            title: rec.title,
            description: rec.description,
            priority: rec.priority,
            category: rec.category,
            action_items: rec.actionItems,
            estimated_cost: rec.estimatedCost,
            implementation_timeline: rec.timeline
          }))
        );

      if (recError) {
        console.error('Failed to save recommendations:', recError);
      }
    }

    console.log(`Analysis completed for field ${fieldId}`);

    return new Response(JSON.stringify({
      success: true,
      analysisId: analysisRecord.id,
      results: analysisResults,
      recommendations: recommendations
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in GEE analysis:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function simulateGEEAnalysis(boundary: FieldBoundary, cropType?: string, date?: Date) {
  // Simulate realistic satellite analysis based on season and crop type
  const month = date?.getMonth() || new Date().getMonth();
  const isKharif = month >= 5 && month <= 9; // June to October
  const isRabi = month >= 10 || month <= 3; // November to April
  
  // Base values vary by season and crop type
  let baseNDVI = 0.5;
  let cropStage = 'vegetative';
  
  if (cropType === 'wheat' && isRabi) {
    baseNDVI = 0.7;
    cropStage = month <= 1 ? 'vegetative' : month <= 2 ? 'reproductive' : 'maturity';
  } else if (cropType === 'rice' && isKharif) {
    baseNDVI = 0.6;
    cropStage = month <= 7 ? 'vegetative' : month <= 8 ? 'reproductive' : 'maturity';
  }
  
  // Add some randomness
  const variance = 0.1;
  const ndvi = Math.max(0, Math.min(1, baseNDVI + (Math.random() - 0.5) * variance));
  
  return {
    ndvi: Number(ndvi.toFixed(3)),
    msavi2: Number((ndvi * 0.9 + Math.random() * 0.1).toFixed(3)),
    ndre: Number((ndvi * 0.8 + Math.random() * 0.2).toFixed(3)),
    ndmi: Number((0.4 + Math.random() * 0.3).toFixed(3)),
    socVis: cropStage === 'sowing' ? Number((0.2 + Math.random() * 0.3).toFixed(3)) : null,
    rvi: Number((1 + Math.random() * 2).toFixed(3)),
    cloudCover: Number((Math.random() * 20).toFixed(1)),
    cropStage,
    healthStatus: ndvi > 0.7 ? 'excellent' : ndvi > 0.5 ? 'good' : ndvi > 0.3 ? 'fair' : 'poor',
    waterStressLevel: ndvi > 0.6 ? 'none' : ndvi > 0.4 ? 'mild' : ndvi > 0.2 ? 'moderate' : 'severe',
    qualityScore: Number((0.7 + Math.random() * 0.3).toFixed(2))
  };
}

async function generateRecommendations(analysis: any, cropType?: string) {
  const recommendations = [];
  
  // NDVI-based recommendations
  if (analysis.ndvi < 0.4) {
    recommendations.push({
      title: 'Low Vegetation Health Detected',
      description: 'NDVI values indicate poor crop health. Consider nutrient supplementation and pest inspection.',
      priority: 'high',
      category: 'fertilizer',
      actionItems: ['Soil nutrient testing', 'Apply nitrogen-rich fertilizer', 'Check for pest damage'],
      estimatedCost: 2500,
      timeline: '1-2 weeks'
    });
  }
  
  // Water stress recommendations
  if (analysis.waterStressLevel === 'severe' || analysis.waterStressLevel === 'moderate') {
    recommendations.push({
      title: 'Water Stress Management',
      description: 'Satellite data indicates water stress. Implement efficient irrigation strategies.',
      priority: analysis.waterStressLevel === 'severe' ? 'critical' : 'high',
      category: 'irrigation',
      actionItems: ['Check irrigation system', 'Implement drip irrigation', 'Monitor soil moisture'],
      estimatedCost: 5000,
      timeline: 'Immediate'
    });
  }
  
  // Crop stage specific recommendations
  if (analysis.cropStage === 'reproductive' && analysis.ndvi > 0.6) {
    recommendations.push({
      title: 'Optimal Reproductive Stage',
      description: 'Crop is in excellent condition during reproductive stage. Monitor for optimal harvest timing.',
      priority: 'medium',
      category: 'harvest',
      actionItems: ['Monitor grain filling', 'Plan harvest logistics', 'Arrange storage facilities'],
      estimatedCost: 1000,
      timeline: '2-4 weeks'
    });
  }
  
  return recommendations;
}