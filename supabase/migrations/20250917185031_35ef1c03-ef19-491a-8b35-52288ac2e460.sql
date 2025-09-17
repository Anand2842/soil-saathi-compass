-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE public.crop_type AS ENUM ('wheat', 'rice', 'maize', 'sugarcane', 'soybean', 'cotton', 'potato', 'tomato', 'other');
CREATE TYPE public.field_status AS ENUM ('active', 'fallow', 'harvested', 'planted');
CREATE TYPE public.analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.recommendation_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone_number TEXT,
  location TEXT,
  farm_size_hectares DECIMAL(10,2),
  preferred_language TEXT DEFAULT 'hi',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  total_area_hectares DECIMAL(10,2),
  boundary GEOMETRY(POLYGON, 4326),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fields table with PostGIS geometry
CREATE TABLE public.fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  crop_type crop_type,
  crop_variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  area_hectares DECIMAL(10,2),
  boundary GEOMETRY(POLYGON, 4326) NOT NULL,
  center_point GEOMETRY(POINT, 4326),
  status field_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Satellite analyses table
CREATE TABLE public.satellite_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  satellite_source TEXT NOT NULL, -- 'sentinel-2', 'landsat-8', etc.
  cloud_cover_percentage DECIMAL(5,2),
  ndvi_value DECIMAL(5,3),
  msavi2_value DECIMAL(5,3),
  ndre_value DECIMAL(5,3),
  ndmi_value DECIMAL(5,3),
  soc_vis_value DECIMAL(5,3),
  rvi_value DECIMAL(5,3),
  crop_stage TEXT, -- 'sowing', 'vegetative', 'reproductive', 'maturity'
  health_status TEXT, -- 'excellent', 'good', 'fair', 'poor', 'critical'
  water_stress_level TEXT, -- 'none', 'mild', 'moderate', 'severe'
  quality_score DECIMAL(3,2), -- 0.0 to 1.0
  status analysis_status DEFAULT 'pending',
  gee_task_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.satellite_analyses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority recommendation_priority DEFAULT 'medium',
  category TEXT, -- 'fertilizer', 'irrigation', 'pest_control', 'harvest'
  action_items TEXT[],
  estimated_cost DECIMAL(10,2),
  implementation_timeline TEXT,
  is_implemented BOOLEAN DEFAULT false,
  farmer_feedback TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketplace interactions table
CREATE TABLE public.marketplace_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_category TEXT,
  vendor_name TEXT,
  price DECIMAL(10,2),
  quantity INTEGER,
  unit TEXT,
  purchase_status TEXT DEFAULT 'recommended', -- 'recommended', 'viewed', 'purchased'
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for farms
CREATE POLICY "Users can view own farms" ON public.farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own farms" ON public.farms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own farms" ON public.farms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own farms" ON public.farms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fields
CREATE POLICY "Users can view own fields" ON public.fields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fields" ON public.fields FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fields" ON public.fields FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fields" ON public.fields FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for satellite_analyses
CREATE POLICY "Users can view own analyses" ON public.satellite_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analyses" ON public.satellite_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update analyses" ON public.satellite_analyses FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for recommendations
CREATE POLICY "Users can view own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own recommendations" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON public.recommendations FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for marketplace_interactions
CREATE POLICY "Users can view own marketplace interactions" ON public.marketplace_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own marketplace interactions" ON public.marketplace_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketplace interactions" ON public.marketplace_interactions FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_fields_boundary ON public.fields USING GIST (boundary);
CREATE INDEX idx_fields_center_point ON public.fields USING GIST (center_point);
CREATE INDEX idx_fields_user_id ON public.fields (user_id);
CREATE INDEX idx_satellite_analyses_field_id ON public.satellite_analyses (field_id);
CREATE INDEX idx_satellite_analyses_date ON public.satellite_analyses (analysis_date);
CREATE INDEX idx_recommendations_field_id ON public.recommendations (field_id);
CREATE INDEX idx_recommendations_priority ON public.recommendations (priority);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON public.recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate field center point
CREATE OR REPLACE FUNCTION public.calculate_field_center()
RETURNS TRIGGER AS $$
BEGIN
  NEW.center_point = ST_Centroid(NEW.boundary);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to automatically calculate center point
CREATE TRIGGER calculate_field_center_trigger 
BEFORE INSERT OR UPDATE ON public.fields 
FOR EACH ROW EXECUTE FUNCTION public.calculate_field_center();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();