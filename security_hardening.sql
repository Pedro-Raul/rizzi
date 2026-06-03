-- Security hardening for Supabase.
-- Run this file after the schema and feature SQL files have been applied.

-- Enable and force RLS on every application table that may exist.
DO $$
DECLARE
  table_name text;
  table_names text[] := ARRAY[
    'users',
    'categories',
    'businesses',
    'products',
    'business_reports',
    'favorites',
    'reviews',
    'orders',
    'order_items'
  ];
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END $$;

-- Storage objects are managed by Supabase. Keep RLS active there too.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Revoke implicit public table privileges and grant only the roles used by Supabase clients.
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE
  table_name text;
  table_names text[] := ARRAY[
    'users',
    'categories',
    'businesses',
    'products',
    'business_reports',
    'favorites',
    'reviews',
    'orders',
    'order_items'
  ];
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', table_name);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', table_name);
      EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon', table_name);
    END IF;
  END LOOP;
END $$;

-- The service_role key still bypasses RLS in Supabase. Never expose it in the frontend.
