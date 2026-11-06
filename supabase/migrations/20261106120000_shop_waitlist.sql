-- E-poe avamise ootelist (double opt-in).
-- Uus registreering on "pending" kuni inimene vajutab kinnituslingile; kinnitamata read aeguvad 48 h pärast.
-- Ligipääs ainult serveri kaudu (service_role). RLS on sees ja poliitikaid pole, seega brauser ei näe midagi.

CREATE TABLE public.shop_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  lang text NOT NULL DEFAULT 'et' CHECK (lang IN ('et', 'en')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  -- SHA-256 räsi tokenist (token ise on ainult kinnituskirjas)
  token_hash text NOT NULL UNIQUE,
  -- kinnituse aegumine; pärast kinnitamist enam ei kasutata
  expires_at timestamptz,
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

CREATE UNIQUE INDEX shop_waitlist_email_key ON public.shop_waitlist (lower(email));
CREATE INDEX shop_waitlist_pending_expiry_idx ON public.shop_waitlist (expires_at) WHERE status = 'pending';

GRANT ALL ON public.shop_waitlist TO service_role;
ALTER TABLE public.shop_waitlist ENABLE ROW LEVEL SECURITY;

-- Rate limit: IP räsi (mitte IP ise) ja aeg. Read kustuvad 1 päeva pärast.
CREATE TABLE public.shop_waitlist_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX shop_waitlist_attempts_ip_idx ON public.shop_waitlist_attempts (ip_hash, created_at);

GRANT ALL ON public.shop_waitlist_attempts TO service_role;
ALTER TABLE public.shop_waitlist_attempts ENABLE ROW LEVEL SECURITY;

-- Automaatne koristus: kinnitamata read pärast aegumist ja vanad rate limit read.
CREATE OR REPLACE FUNCTION public.purge_shop_waitlist() RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  DELETE FROM public.shop_waitlist WHERE status = 'pending' AND expires_at < now();
  DELETE FROM public.shop_waitlist_attempts WHERE created_at < now() - interval '1 day';
$$;

REVOKE ALL ON FUNCTION public.purge_shop_waitlist() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_shop_waitlist() TO service_role;

-- Iga tund pg_cron'iga, kui laiendus on saadaval. Rakendus puhastab aegunud read ka iga registreerimise ajal,
-- seega töötab kõik ka siis, kui pg_cron puudub.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.schedule('purge-shop-waitlist', '17 * * * *', 'SELECT public.purge_shop_waitlist()');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron pole saadaval, aegunud read kustutab rakendus: %', SQLERRM;
END $$;
