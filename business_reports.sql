-- Ejecutar en Supabase SQL Editor si la base ya existe (no hace falta re-ejecutar database_schema.sql completo).
-- Añade reportes de negocios y políticas RLS para usuarios y admins.

CREATE TABLE IF NOT EXISTS public.business_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (business_id, reporter_id)
);

ALTER TABLE public.business_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own business reports" ON public.business_reports;
DROP POLICY IF EXISTS "Users can view own business reports" ON public.business_reports;
DROP POLICY IF EXISTS "Admins can view all business reports" ON public.business_reports;
DROP POLICY IF EXISTS "Admins can update business reports" ON public.business_reports;
DROP POLICY IF EXISTS "Admins can delete business reports" ON public.business_reports;

CREATE POLICY "Users can insert own business reports"
ON public.business_reports FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND reporter_id = auth.uid()
);

CREATE POLICY "Users can view own business reports"
ON public.business_reports FOR SELECT
USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all business reports"
ON public.business_reports FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update business reports"
ON public.business_reports FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can delete business reports" ON public.business_reports;
CREATE POLICY "Admins can delete business reports"
ON public.business_reports
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
