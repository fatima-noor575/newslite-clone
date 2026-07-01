
CREATE POLICY "Users read own crop scans" ON storage.objects FOR SELECT
  USING (bucket_id = 'crop-scans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own crop scans" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'crop-scans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own crop scans" ON storage.objects FOR DELETE
  USING (bucket_id = 'crop-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own reports" ON storage.objects FOR SELECT
  USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own reports" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
