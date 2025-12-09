-- =====================================================
-- COMPLETE DATABASE SCHEMA AND DATA EXPORT
-- Project: PropakistaniAds Clone
-- Generated: 2025-12-09
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =====================================================
-- TABLES
-- =====================================================

-- Categories Table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Roles Table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Ads Table
CREATE TABLE public.ads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    category_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    location TEXT,
    images TEXT[] DEFAULT '{}'::text[],
    status TEXT DEFAULT 'pending'::text,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Articles Table
CREATE TABLE public.articles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    thumbnail_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Favorites Table
CREATE TABLE public.favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    ad_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- RLS POLICIES - Categories
-- =====================================================
CREATE POLICY "Anyone can view categories" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - Profiles
-- =====================================================
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - User Roles
-- =====================================================
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - Ads
-- =====================================================
CREATE POLICY "Anyone can view approved ads" ON public.ads
FOR SELECT USING (
  (status = 'approved'::text) OR 
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can create ads" ON public.ads
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads" ON public.ads
FOR UPDATE USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete own ads" ON public.ads
FOR DELETE USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- =====================================================
-- RLS POLICIES - Articles
-- =====================================================
CREATE POLICY "Anyone can view published articles" ON public.articles
FOR SELECT USING (true);

CREATE POLICY "Admins can insert articles" ON public.articles
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update articles" ON public.articles
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete articles" ON public.articles
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - Favorites
-- =====================================================
CREATE POLICY "Users can view own favorites" ON public.favorites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON public.favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DATA: Categories
-- =====================================================
INSERT INTO public.categories (id, name, icon, created_at) VALUES
('023140f9-6a2b-49fc-b7fe-85c67ac98edd', 'Mobiles', '📱', '2025-11-30 11:25:46.24079+00'),
('33e3bda9-609f-4860-9518-1bd140cdfaa8', 'Electronics', '💻', '2025-11-30 11:25:46.24079+00'),
('890baf02-6b98-469b-85fb-23c441982b04', 'Vehicles', '🚗', '2025-11-30 11:25:46.24079+00'),
('f42732b6-0e07-4dbf-8b5b-caec31a56568', 'Property', '🏠', '2025-11-30 11:25:46.24079+00'),
('ab035be8-39c7-42c6-855c-c03d8a1725ff', 'Jobs', '💼', '2025-11-30 11:25:46.24079+00'),
('add4af94-8722-48a4-82c4-a014f5be557f', 'Services', '🔧', '2025-11-30 11:25:46.24079+00'),
('88bd5b22-c493-470f-84df-a56927f91f2f', 'Fashion', '👗', '2025-11-30 11:25:46.24079+00'),
('296c9a9d-5334-46fc-b774-c80b21e1e487', 'Furniture', '🪑', '2025-11-30 11:25:46.24079+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DATA: Profiles (Note: Users created via auth.users)
-- =====================================================
INSERT INTO public.profiles (id, user_id, name, phone, avatar_url, created_at) VALUES
('f8ee9051-b623-40db-a53f-7dbcf222cce5', 'd2f15b10-5f35-4c7f-a25e-b8b087753d35', 'Muhammad qadeer', NULL, NULL, '2025-12-03 06:44:16.01873+00'),
('ffa0fd2c-a44f-4858-987e-ff11bf9ca8a6', '043742dc-12be-44d9-936b-6ff69c67265b', 'm qadeer', NULL, NULL, '2025-12-09 07:48:49.420979+00'),
('f21099b7-e025-4a59-9ad8-2d761bc07916', '432fb9bc-4665-41db-b341-e0b2d6f610d8', 'fatimanoor', NULL, NULL, '2025-12-09 07:53:41.465655+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DATA: User Roles (Admin assignments)
-- =====================================================
INSERT INTO public.user_roles (user_id, role) VALUES
('432fb9bc-4665-41db-b341-e0b2d6f610d8', 'admin'),
('043742dc-12be-44d9-936b-6ff69c67265b', 'admin'),
('d2f15b10-5f35-4c7f-a25e-b8b087753d35', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- DATA: Ads
-- =====================================================
INSERT INTO public.ads (id, user_id, category_id, title, description, price, location, images, status, rejection_reason, created_at, updated_at) VALUES
('873ac614-70b0-41aa-ad76-35782a4a738f', 'd2f15b10-5f35-4c7f-a25e-b8b087753d35', 'ab035be8-39c7-42c6-855c-c03d8a1725ff', 'our project', 'build a clone of propakistani website', 900000.00, 'taxila', ARRAY['https://wjndfhggunouotzarzyt.supabase.co/storage/v1/object/public/ad-images/d2f15b10-5f35-4c7f-a25e-b8b087753d35/0.8384108200264838.jpg'], 'pending', NULL, '2025-12-03 06:47:17.082805+00', '2025-12-03 06:47:17.082805+00'),
('befb66d2-37a6-48bf-b365-37b154fc1223', '043742dc-12be-44d9-936b-6ff69c67265b', 'f42732b6-0e07-4dbf-8b5b-caec31a56568', 'comsats wah', 'plot for sale assan iksaat par', 150000.00, 'wah cannt', ARRAY['https://wjndfhggunouotzarzyt.supabase.co/storage/v1/object/public/ad-images/043742dc-12be-44d9-936b-6ff69c67265b/0.20626644254965254.webp'], 'pending', NULL, '2025-12-09 07:52:46.698935+00', '2025-12-09 07:52:46.698935+00'),
('9d5fbe41-ad40-4f34-820f-60fc2bb0a560', '432fb9bc-4665-41db-b341-e0b2d6f610d8', '33e3bda9-609f-4860-9518-1bd140cdfaa8', 'IPHONE', 'The iPhone 17 Pro Max, released around late 2025, is Apple''s high-end model featuring the powerful A19 Pro chip, an advanced triple-camera system with a periscope telephoto lens for extended zoom, a large 6.9-inch Super Retina XDR display, and a durable aluminum unibody design, supporting advanced AI features, ProRAW video, and available in colors like Silver, Cosmic Orange, and Deep Blue, with storage up to 2TB, though power adapters aren''t included.', 1500.00, 'Karachi', ARRAY['https://wjndfhggunouotzarzyt.supabase.co/storage/v1/object/public/ad-images/432fb9bc-4665-41db-b341-e0b2d6f610d8/0.1386473839561857.jfif'], 'pending', NULL, '2025-12-09 07:55:36.149093+00', '2025-12-09 07:55:36.149093+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DATA: Articles
-- =====================================================
INSERT INTO public.articles (id, title, slug, excerpt, content, category, thumbnail_url, published_at, created_at, updated_at) VALUES
('311f35dd-2940-48c1-b4ea-79f83d7aab07', 'Breaking: New AI Technology Transforms Healthcare', 'ai-technology-healthcare', 'AI-powered healthcare solutions are changing how doctors diagnose and treat patients, leading to better outcomes.', 'Artificial Intelligence is revolutionizing the healthcare industry with groundbreaking innovations that promise to improve patient outcomes and streamline medical processes. Recent developments in machine learning algorithms have enabled more accurate diagnoses and personalized treatment plans.', 'Technology', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop', '2025-11-28 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00'),
('b577f410-eb51-4e12-9b58-9b24647ef948', 'Climate Summit: World Leaders Agree on Carbon Reduction', 'climate-summit-carbon-reduction', 'Global leaders unite with unprecedented carbon reduction commitments at international climate summit.', 'In a historic agreement at the Global Climate Summit, world leaders from over 150 countries have committed to ambitious carbon reduction targets. The landmark deal includes provisions for renewable energy investment and sustainable development initiatives.', 'Environment', 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=450&fit=crop', '2025-11-28 13:48:33.109501+00', '2025-11-28 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00'),
('5b290818-4808-40bf-8528-f085d8c37084', 'Stock Market Reaches Record High Amid Tech Rally', 'stock-market-record-tech-rally', 'Tech stocks drive market to new heights as investor confidence surges.', 'Major stock indices hit all-time highs today as technology stocks led a broad market rally. Investors showed renewed confidence in the tech sector following strong earnings reports from leading companies and positive economic indicators.', 'Business', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop', '2025-11-28 10:48:33.109501+00', '2025-11-28 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00'),
('af25b720-83d7-49c1-b6e7-addb5c83c974', 'Revolutionary Electric Vehicle Unveiled with 1000-Mile Range', 'electric-vehicle-1000-mile-range', 'New EV breaks range barriers with innovative battery technology.', 'A major automotive manufacturer has unveiled a revolutionary electric vehicle featuring groundbreaking battery technology that enables a range of over 1000 miles on a single charge. The announcement marks a significant milestone in the transition to sustainable transportation.', 'Automotive', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=450&fit=crop', '2025-11-27 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00'),
('b2ccc4ff-0b52-4903-a605-b620e6fad1b3', 'SpaceX Successfully Launches Next-Generation Satellite Network', 'spacex-satellite-network-launch', 'SpaceX expands global internet coverage with successful satellite deployment.', 'SpaceX has successfully launched the latest batch of satellites for its next-generation global internet network. The deployment represents a major step forward in providing high-speed internet access to underserved regions worldwide.', 'Space', 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=450&fit=crop', '2025-11-27 09:48:33.109501+00', '2025-11-28 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00'),
('3a619196-a2e5-42c9-bf8f-e50a1a8d8e7e', 'Breakthrough in Quantum Computing: Scientists Achieve Quantum Supremacy', 'quantum-computing-breakthrough', 'Quantum computing achieves major milestone with demonstration of quantum supremacy.', 'Researchers at a leading technology institute have achieved a major breakthrough in quantum computing, demonstrating quantum supremacy by solving complex problems that would take traditional computers thousands of years. This milestone opens new possibilities for scientific discovery and technological innovation.', 'Science', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop', '2025-11-26 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00', '2025-11-28 15:48:33.109501+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- END OF DATABASE EXPORT
-- =====================================================
