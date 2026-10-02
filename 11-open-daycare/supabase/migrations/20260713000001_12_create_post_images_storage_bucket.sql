-- SPEC 12: Create post-images storage bucket
-- Storage bucket and policies for post image uploads

-- Create storage bucket 'post-images' (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: any authenticated user can read
CREATE POLICY "select_authenticated" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  );

-- Storage policy: staff/admin can upload
CREATE POLICY "insert_staff" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('staff', 'admin')
    )
  );

-- Storage policy: staff/admin can delete
CREATE POLICY "delete_staff" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('staff', 'admin')
    )
  );
