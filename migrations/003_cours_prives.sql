-- Create professeurs table
CREATE TABLE IF NOT EXISTS public.professeurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  bio TEXT,
  photo_url TEXT,
  diplome TEXT,
  specialites TEXT[] DEFAULT ARRAY[]::TEXT[],
  localisation TEXT,
  experience_years INTEGER DEFAULT 0,
  rate_per_session DECIMAL(10, 2) NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations_cours table
CREATE TABLE IF NOT EXISTS public.reservations_cours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prof_id UUID NOT NULL REFERENCES public.professeurs(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  woocommerce_order_id TEXT,
  zoom_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appreciations_cours table
CREATE TABLE IF NOT EXISTS public.appreciations_cours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prof_id UUID NOT NULL REFERENCES public.professeurs(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.reservations_cours(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disponibilites table
CREATE TABLE IF NOT EXISTS public.disponibilites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prof_id UUID NOT NULL REFERENCES public.professeurs(id) ON DELETE CASCADE,
  date_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_end TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.professeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations_cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appreciations_cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilites ENABLE ROW LEVEL SECURITY;

-- RLS Policies: professeurs (public read)
CREATE POLICY "professeurs_select_public" ON public.professeurs
  FOR SELECT USING (true);

-- RLS Policies: reservations_cours
CREATE POLICY "reservations_select_own" ON public.reservations_cours
  FOR SELECT USING (auth.uid() = etudiant_id);

CREATE POLICY "reservations_insert_own" ON public.reservations_cours
  FOR INSERT WITH CHECK (auth.uid() = etudiant_id);

-- RLS Policies: appreciations_cours
CREATE POLICY "appreciations_select_public" ON public.appreciations_cours
  FOR SELECT USING (true);

CREATE POLICY "appreciations_insert_own" ON public.appreciations_cours
  FOR INSERT WITH CHECK (auth.uid() = etudiant_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reservations_etudiant_id ON public.reservations_cours(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_prof_id ON public.reservations_cours(prof_id);
CREATE INDEX IF NOT EXISTS idx_reservations_scheduled_at ON public.reservations_cours(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appreciations_prof_id ON public.appreciations_cours(prof_id);
CREATE INDEX IF NOT EXISTS idx_disponibilites_prof_id ON public.disponibilites(prof_id);
