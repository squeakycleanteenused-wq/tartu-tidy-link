-- E-pood: tooted ja tellimused (1. etapp: digitaalsed tooted).
-- Failid on privaatses salves "product-files", pildid avalikus salves "product-images".
-- Ligipääs tabelitele ainult serveri kaudu (service_role). RLS on sees ja poliitikaid pole.

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text NOT NULL,
  short text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'digital' CHECK (kind IN ('digital', 'physical')),
  price_cents integer NOT NULL CHECK (price_cents BETWEEN 50 AND 1000000),
  image_path text,
  file_path text,
  file_name text,
  -- 2. etapp (füüsilised kaubad)
  weight_g integer,
  fits_letter boolean NOT NULL DEFAULT false,
  stock integer,
  active boolean NOT NULL DEFAULT false,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.product_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  product_title text NOT NULL,
  price_cents integer NOT NULL,
  buyer_name text NOT NULL DEFAULT '',
  buyer_email text NOT NULL,
  -- tarbija nõusolek digisisu kohesele üleandmisele ja taganemisõiguse kaotusele (VÕS § 53 lg 4 p 13)
  consent_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded')),
  stripe_session_id text UNIQUE,
  paid_at timestamptz,
  downloads integer NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_orders_paid_idx ON public.product_orders (paid_at DESC) WHERE status = 'paid';

GRANT ALL ON public.product_orders TO service_role;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Failisalved. Privaatsest salvest saab faili ainult serveri loodud lühiajalise lingiga.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('product-files', 'product-files', false, 52428800)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Maksmata tellimused kustuvad 30 päeva pärast.
CREATE OR REPLACE FUNCTION public.purge_product_orders() RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  DELETE FROM public.product_orders WHERE status = 'pending' AND created_at < now() - interval '30 days';
$$;

REVOKE ALL ON FUNCTION public.purge_product_orders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_product_orders() TO service_role;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.schedule('purge-product-orders', '25 3 * * *', 'SELECT public.purge_product_orders()');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron pole saadaval: %', SQLERRM;
END $$;
