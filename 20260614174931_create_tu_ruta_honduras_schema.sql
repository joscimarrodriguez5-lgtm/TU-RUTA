
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'es',
  location TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'driver')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "admin_select_profiles" ON profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Transport companies
CREATE TABLE IF NOT EXISTS transport_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  type TEXT NOT NULL CHECK (type IN ('bus', 'minibus', 'taxi', 'shuttle', 'international')),
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transport_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_companies" ON transport_companies FOR SELECT USING (true);
CREATE POLICY "admin_insert_companies" ON transport_companies FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_update_companies" ON transport_companies FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_delete_companies" ON transport_companies FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Routes
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES transport_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  origin_lat NUMERIC(10,7),
  origin_lng NUMERIC(10,7),
  destination_lat NUMERIC(10,7),
  destination_lng NUMERIC(10,7),
  waypoints JSONB DEFAULT '[]',
  distance_km NUMERIC(8,2),
  duration_minutes INTEGER,
  price_hnl NUMERIC(10,2) NOT NULL,
  price_usd NUMERIC(10,2),
  frequency TEXT,
  schedule JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_routes" ON routes FOR SELECT USING (true);
CREATE POLICY "admin_insert_routes" ON routes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_update_routes" ON routes FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_delete_routes" ON routes FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Stops (intermediate stops for routes)
CREATE TABLE IF NOT EXISTS route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  order_index INTEGER NOT NULL,
  arrival_offset_minutes INTEGER DEFAULT 0
);

ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_stops" ON route_stops FOR SELECT USING (true);
CREATE POLICY "admin_manage_stops" ON route_stops FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_update_stops" ON route_stops FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (true);
CREATE POLICY "admin_delete_stops" ON route_stops FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  company_id UUID REFERENCES transport_companies(id) ON DELETE SET NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  travel_date DATE NOT NULL,
  travel_time TIME,
  passengers INTEGER DEFAULT 1,
  total_price_hnl NUMERIC(10,2),
  total_price_usd NUMERIC(10,2),
  payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'transfer')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_bookings" ON bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_bookings" ON bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin_select_bookings" ON bookings FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES transport_companies(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_contacts" ON emergency_contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_contacts" ON emergency_contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_contacts" ON emergency_contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_contacts" ON emergency_contacts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seed transport companies
INSERT INTO transport_companies (name, slug, description, type, phone) VALUES
  ('TISMA', 'tisma', 'Transporte Intermunicipal San Manuel - Cubre La Sabana, Santiago, San Manuel y San Pedro Sula', 'bus', '+504 2553-0000'),
  ('TRANSUPLAN', 'transuplan', 'Transportes El Plan - San Manuel - San Pedro Sula', 'bus', '+504 2553-1000'),
  ('TIVA / JACEROMA', 'tiva-jaceroma', 'Transporte Villanueva - Dos Caminos - San Pedro Sula', 'bus', '+504 2553-2000'),
  ('Transportes Cristina', 'transportes-cristina', 'Ruta Tegucigalpa - Siguatepeque - SPS - Tela - La Ceiba - Olanchito', 'bus', '+504 2221-3000'),
  ('Transportes Mirna', 'transportes-mirna', 'Ruta Tegucigalpa - San Pedro Sula - Tela - La Ceiba - Tocoa', 'bus', '+504 2221-4000'),
  ('Transportes Kamaldy', 'transportes-kamaldy', 'Ruta La Ceiba - El Progreso - Tegucigalpa', 'bus', '+504 2441-0000'),
  ('Pullmantur', 'pullmantur', 'Servicio de lujo Tegucigalpa - San Pedro Sula', 'shuttle', '+504 2221-5000'),
  ('Tica Bus', 'tica-bus', 'Transporte internacional Tegucigalpa - Centroamérica', 'international', '+504 2220-0579')
ON CONFLICT (slug) DO NOTHING;

-- Seed routes
INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'La Sabana - San Pedro Sula',
  'La Sabana, Santa Bárbara',
  'San Pedro Sula',
  14.9830, -88.3070,
  15.5000, -88.0300,
  95.0, 120,
  35.00, 1.43,
  'Cada 30 minutos',
  '[{"day": "Lunes-Domingo", "first": "05:00", "last": "19:00"}]'
FROM transport_companies c WHERE c.slug = 'tisma'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'El Plan - San Manuel - San Pedro Sula',
  'El Plan',
  'San Pedro Sula',
  15.1900, -88.2200,
  15.5000, -88.0300,
  75.0, 90,
  30.00, 1.22,
  'Cada hora',
  '[{"day": "Lunes-Domingo", "first": "05:30", "last": "18:30"}]'
FROM transport_companies c WHERE c.slug = 'transuplan'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'Villanueva - Dos Caminos - San Pedro Sula',
  'Villanueva',
  'San Pedro Sula',
  15.3167, -88.0167,
  15.5000, -88.0300,
  30.0, 40,
  18.00, 0.73,
  'Cada 15 minutos',
  '[{"day": "Lunes-Domingo", "first": "04:30", "last": "21:00"}]'
FROM transport_companies c WHERE c.slug = 'tiva-jaceroma'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'Tegucigalpa - San Pedro Sula (vía Siguatepeque)',
  'Tegucigalpa',
  'San Pedro Sula',
  14.0723, -87.2062,
  15.5000, -88.0300,
  245.0, 210,
  120.00, 4.88,
  '8 salidas diarias',
  '[{"day": "Lunes-Domingo", "first": "05:00", "last": "18:00"}]'
FROM transport_companies c WHERE c.slug = 'transportes-cristina'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'San Pedro Sula - Tela',
  'San Pedro Sula',
  'Tela',
  15.5000, -88.0300,
  15.7833, -87.4583,
  90.0, 100,
  65.00, 2.64,
  'Cada 2 horas',
  '[{"day": "Lunes-Domingo", "first": "06:00", "last": "17:00"}]'
FROM transport_companies c WHERE c.slug = 'transportes-cristina'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'Tela - La Ceiba',
  'Tela',
  'La Ceiba',
  15.7833, -87.4583,
  15.7833, -86.7833,
  100.0, 90,
  55.00, 2.24,
  'Cada 2 horas',
  '[{"day": "Lunes-Domingo", "first": "07:00", "last": "18:00"}]'
FROM transport_companies c WHERE c.slug = 'transportes-cristina'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'Tegucigalpa - La Ceiba',
  'Tegucigalpa',
  'La Ceiba',
  14.0723, -87.2062,
  15.7833, -86.7833,
  375.0, 330,
  180.00, 7.32,
  '4 salidas diarias',
  '[{"day": "Lunes-Domingo", "first": "06:00", "last": "14:00"}]'
FROM transport_companies c WHERE c.slug = 'transportes-mirna'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'La Ceiba - El Progreso',
  'La Ceiba',
  'El Progreso',
  15.7833, -86.7833,
  15.4000, -87.8167,
  185.0, 150,
  90.00, 3.66,
  'Cada 2 horas',
  '[{"day": "Lunes-Domingo", "first": "05:30", "last": "17:30"}]'
FROM transport_companies c WHERE c.slug = 'transportes-kamaldy'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'Tegucigalpa - San Pedro Sula (Servicio Directo)',
  'Tegucigalpa',
  'San Pedro Sula',
  14.0723, -87.2062,
  15.5000, -88.0300,
  245.0, 180,
  160.00, 6.50,
  '12 salidas diarias',
  '[{"day": "Lunes-Domingo", "first": "04:00", "last": "22:00"}]'
FROM transport_companies c WHERE c.slug = 'pullmantur'
ON CONFLICT DO NOTHING;

INSERT INTO routes (company_id, name, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, distance_km, duration_minutes, price_hnl, price_usd, frequency, schedule)
SELECT 
  c.id,
  'Tegucigalpa - Guatemala Ciudad',
  'Tegucigalpa',
  'Ciudad de Guatemala',
  14.0723, -87.2062,
  14.6349, -90.5069,
  510.0, 480,
  420.00, 17.07,
  '2 salidas diarias',
  '[{"day": "Lunes-Domingo", "first": "06:00", "last": "10:00"}]'
FROM transport_companies c WHERE c.slug = 'tica-bus'
ON CONFLICT DO NOTHING;
