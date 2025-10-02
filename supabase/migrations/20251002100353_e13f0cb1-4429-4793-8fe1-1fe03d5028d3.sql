-- Create database backup and monitoring tables
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on system health
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Create policy for system health - only allow admins to view
CREATE POLICY "Admin can view system health"
ON public.system_health
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.display_name ILIKE '%admin%'
  )
);

-- Create analytics events table for monitoring
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  url TEXT
);

-- Enable RLS on analytics events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics - users can only see their own events
CREATE POLICY "Users can view own analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create policy for analytics - allow inserts for tracking
CREATE POLICY "Allow analytics inserts"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL DEFAULT 'ms',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  context JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on performance metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for performance metrics
CREATE POLICY "Users can insert performance metrics"
ON public.performance_metrics
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admin can view all performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.display_name ILIKE '%admin%'
  )
);

-- Create backup metadata table
CREATE TABLE IF NOT EXISTS public.backup_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'schema')),
  backup_status TEXT NOT NULL CHECK (backup_status IN ('running', 'completed', 'failed')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  backup_size_mb NUMERIC,
  tables_count INTEGER,
  records_count BIGINT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on backup metadata
ALTER TABLE public.backup_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy for backup metadata - only admins
CREATE POLICY "Admin can manage backups"
ON public.backup_metadata
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.display_name ILIKE '%admin%'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_health_service_time 
ON public.system_health (service_name, check_time DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_user_timestamp 
ON public.analytics_events (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
ON public.analytics_events (event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time 
ON public.performance_metrics (metric_name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_backup_metadata_type_time 
ON public.backup_metadata (backup_type, start_time DESC);

-- Create function to check system health
CREATE OR REPLACE FUNCTION public.check_system_health()
RETURNS TABLE (
  service_name TEXT,
  status TEXT,
  response_time_ms INTEGER,
  last_check TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check database connectivity
  INSERT INTO public.system_health (service_name, status, response_time_ms)
  VALUES ('database', 'healthy', 0);
  
  -- Return current health status
  RETURN QUERY
  SELECT DISTINCT ON (h.service_name)
    h.service_name,
    h.status,
    h.response_time_ms,
    h.check_time as last_check
  FROM public.system_health h
  ORDER BY h.service_name, h.check_time DESC;
END;
$$;

-- Create function to log analytics events
CREATE OR REPLACE FUNCTION public.log_analytics_event(
  p_event_type TEXT,
  p_event_name TEXT,
  p_properties JSONB DEFAULT '{}',
  p_session_id TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    event_type,
    event_name,
    user_id,
    session_id,
    properties,
    timestamp
  ) VALUES (
    p_event_type,
    p_event_name,
    auth.uid(),
    p_session_id,
    p_properties,
    NOW()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Create function to record performance metrics
CREATE OR REPLACE FUNCTION public.record_performance_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_metric_unit TEXT DEFAULT 'ms',
  p_context JSONB DEFAULT '{}',
  p_session_id TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.performance_metrics (
    metric_name,
    metric_value,
    metric_unit,
    user_id,
    session_id,
    context,
    recorded_at
  ) VALUES (
    p_metric_name,
    p_metric_value,
    p_metric_unit,
    auth.uid(),
    p_session_id,
    p_context,
    NOW()
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;