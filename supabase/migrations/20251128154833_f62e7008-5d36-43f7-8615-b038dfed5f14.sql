-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read all articles
CREATE POLICY "Anyone can view published articles"
  ON public.articles
  FOR SELECT
  USING (true);

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin policies for articles
CREATE POLICY "Admins can insert articles"
  ON public.articles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles"
  ON public.articles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles"
  ON public.articles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo articles
INSERT INTO public.articles (title, slug, content, excerpt, thumbnail_url, category, published_at) VALUES
(
  'Breaking: New AI Technology Transforms Healthcare',
  'ai-technology-healthcare',
  'Artificial Intelligence is revolutionizing the healthcare industry with groundbreaking innovations that promise to improve patient outcomes and streamline medical processes. Recent developments in machine learning algorithms have enabled more accurate diagnoses and personalized treatment plans.',
  'AI-powered healthcare solutions are changing how doctors diagnose and treat patients, leading to better outcomes.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
  'Technology',
  now()
),
(
  'Climate Summit: World Leaders Agree on Carbon Reduction',
  'climate-summit-carbon-reduction',
  'In a historic agreement at the Global Climate Summit, world leaders from over 150 countries have committed to ambitious carbon reduction targets. The landmark deal includes provisions for renewable energy investment and sustainable development initiatives.',
  'Global leaders unite with unprecedented carbon reduction commitments at international climate summit.',
  'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=450&fit=crop',
  'Environment',
  now() - interval '2 hours'
),
(
  'Stock Market Reaches Record High Amid Tech Rally',
  'stock-market-record-tech-rally',
  'Major stock indices hit all-time highs today as technology stocks led a broad market rally. Investors showed renewed confidence in the tech sector following strong earnings reports from leading companies and positive economic indicators.',
  'Tech stocks drive market to new heights as investor confidence surges.',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
  'Business',
  now() - interval '5 hours'
),
(
  'Revolutionary Electric Vehicle Unveiled with 1000-Mile Range',
  'electric-vehicle-1000-mile-range',
  'A major automotive manufacturer has unveiled a revolutionary electric vehicle featuring groundbreaking battery technology that enables a range of over 1000 miles on a single charge. The announcement marks a significant milestone in the transition to sustainable transportation.',
  'New EV breaks range barriers with innovative battery technology.',
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=450&fit=crop',
  'Automotive',
  now() - interval '1 day'
),
(
  'SpaceX Successfully Launches Next-Generation Satellite Network',
  'spacex-satellite-network-launch',
  'SpaceX has successfully launched the latest batch of satellites for its next-generation global internet network. The deployment represents a major step forward in providing high-speed internet access to underserved regions worldwide.',
  'SpaceX expands global internet coverage with successful satellite deployment.',
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=450&fit=crop',
  'Space',
  now() - interval '1 day 6 hours'
),
(
  'Breakthrough in Quantum Computing: Scientists Achieve Quantum Supremacy',
  'quantum-computing-breakthrough',
  'Researchers at a leading technology institute have achieved a major breakthrough in quantum computing, demonstrating quantum supremacy by solving complex problems that would take traditional computers thousands of years. This milestone opens new possibilities for scientific discovery and technological innovation.',
  'Quantum computing achieves major milestone with demonstration of quantum supremacy.',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'Science',
  now() - interval '2 days'
);