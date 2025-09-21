-- Fix RLS security issues for geometry and geography system tables
-- Enable RLS on geometry_columns (PostGIS system table)
ALTER TABLE geometry_columns ENABLE ROW LEVEL SECURITY;

-- Create policy for geometry_columns - allow read access to authenticated users
CREATE POLICY "Allow authenticated users to read geometry_columns"
ON geometry_columns
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on geography_columns (PostGIS system table)  
ALTER TABLE geography_columns ENABLE ROW LEVEL SECURITY;

-- Create policy for geography_columns - allow read access to authenticated users
CREATE POLICY "Allow authenticated users to read geography_columns"
ON geography_columns
FOR SELECT
TO authenticated
USING (true);

-- spatial_ref_sys table should remain public for spatial reference lookups
-- but we can add a read-only policy for better security
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policy for spatial_ref_sys - allow read access to all users (needed for spatial operations)
CREATE POLICY "Allow read access to spatial_ref_sys"
ON spatial_ref_sys
FOR SELECT
TO public
USING (true);

-- Add database-level security improvements
-- Create function to log authentication events
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log authentication events for monitoring
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    jsonb_build_object(
      'event_type', 'user_activity',
      'user_id', NEW.id,
      'action', TG_OP,
      'table_name', TG_TABLE_NAME
    ),
    now(),
    inet_client_addr()
  );
  
  RETURN NEW;
END;
$$;

-- Enhance existing RLS policies with better security
-- Update farms table policies to be more restrictive
DROP POLICY IF EXISTS "Users can create own farms" ON farms;
DROP POLICY IF EXISTS "Users can update own farms" ON farms;
DROP POLICY IF EXISTS "Users can delete own farms" ON farms;
DROP POLICY IF EXISTS "Users can view own farms" ON farms;

-- Create enhanced farm policies with better validation
CREATE POLICY "Users can create own farms"
ON farms
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  name IS NOT NULL AND 
  length(trim(name)) > 0
);

CREATE POLICY "Users can update own farms"
ON farms
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  name IS NOT NULL AND 
  length(trim(name)) > 0
);

CREATE POLICY "Users can delete own farms"
ON farms
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own farms"
ON farms
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Enhanced field policies with validation
DROP POLICY IF EXISTS "Users can create own fields" ON fields;
DROP POLICY IF EXISTS "Users can update own fields" ON fields;
DROP POLICY IF EXISTS "Users can delete own fields" ON fields;
DROP POLICY IF EXISTS "Users can view own fields" ON fields;

CREATE POLICY "Users can create own fields"
ON fields
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  name IS NOT NULL AND 
  length(trim(name)) > 0 AND
  boundary IS NOT NULL
);

CREATE POLICY "Users can update own fields"
ON fields
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  name IS NOT NULL AND 
  length(trim(name)) > 0
);

CREATE POLICY "Users can delete own fields"
ON fields
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own fields"
ON fields
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);