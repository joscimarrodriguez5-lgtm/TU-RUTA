
-- Fix RLS policy for route_stops UPDATE - add proper WITH CHECK clause
DROP POLICY IF EXISTS "admin_update_stops" ON route_stops;
CREATE POLICY "admin_update_stops" ON route_stops FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Remove broad SELECT policy from avatars bucket to prevent listing all files
-- Public bucket files can still be accessed via direct URL without this policy
DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
