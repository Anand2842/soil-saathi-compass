import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startTime = Date.now();
    const healthStatus: Record<string, any> = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {},
    };

    // Check database connectivity
    try {
      const dbStart = Date.now();
      const { error: dbError } = await supabase
        .from('system_health')
        .select('id')
        .limit(1);
      
      const dbTime = Date.now() - dbStart;
      
      healthStatus.services.database = {
        status: dbError ? 'critical' : 'healthy',
        response_time_ms: dbTime,
        error: dbError?.message,
      };

      // Log health check to database
      if (!dbError) {
        await supabase.from('system_health').insert({
          service_name: 'database',
          status: 'healthy',
          response_time_ms: dbTime,
        });
      }
    } catch (error) {
      healthStatus.services.database = {
        status: 'critical',
        error: error.message,
      };
    }

    // Check authentication service
    try {
      const authStart = Date.now();
      const { error: authError } = await supabase.auth.getUser();
      const authTime = Date.now() - authStart;
      
      healthStatus.services.auth = {
        status: authError ? 'warning' : 'healthy',
        response_time_ms: authTime,
        error: authError?.message,
      };

      // Log auth check
      await supabase.from('system_health').insert({
        service_name: 'auth',
        status: authError ? 'warning' : 'healthy',
        response_time_ms: authTime,
      });
    } catch (error) {
      healthStatus.services.auth = {
        status: 'critical',
        error: error.message,
      };
    }

    // Check storage service
    try {
      const storageStart = Date.now();
      const { error: storageError } = await supabase.storage.listBuckets();
      const storageTime = Date.now() - storageStart;
      
      healthStatus.services.storage = {
        status: storageError ? 'warning' : 'healthy',
        response_time_ms: storageTime,
        error: storageError?.message,
      };

      // Log storage check
      await supabase.from('system_health').insert({
        service_name: 'storage',
        status: storageError ? 'warning' : 'healthy',
        response_time_ms: storageTime,
      });
    } catch (error) {
      healthStatus.services.storage = {
        status: 'critical',
        error: error.message,
      };
    }

    // Determine overall health status
    const hasCritical = Object.values(healthStatus.services).some(
      (s: any) => s.status === 'critical'
    );
    const hasWarning = Object.values(healthStatus.services).some(
      (s: any) => s.status === 'warning'
    );
    
    healthStatus.status = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';
    healthStatus.total_response_time_ms = Date.now() - startTime;

    return new Response(
      JSON.stringify(healthStatus),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: healthStatus.status === 'healthy' ? 200 : 503,
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'critical',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      }
    );
  }
});