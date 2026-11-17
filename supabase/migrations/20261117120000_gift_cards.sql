-- Kinkekaardid.
-- gift_card_orders: ostja vormi andmed enne makset (Stripe Checkout). Kaarti siin veel pole.
-- gift_cards: väljastatud kaardid. Rida tekib alles siis, kui Stripe'i webhook on makse kinnitanud
--   (või omanik väljastab kaardi käsitsi). payment_id on unikaalne, seega sama makse ei loo kahte kaarti.
-- Ligipääs ainult serveri kaudu (service_role). RLS on sees ja poliitikaid pole, seega brauser ei näe midagi.

CREATE TABLE public.gift_card_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_eur integer NOT NULL CHECK (amount_eur BETWEEN 1 AND 100000),
  design text NOT NULL,
  recipient_name text NOT NULL DEFAULT '',
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text NOT NULL DEFAULT '',
  delivery text NOT NULL CHECK (delivery IN ('digital', 'print')),
  shipping_address jsonb,
  envelope_message text NOT NULL DEFAULT '',
  print_fee_eur integer NOT NULL DEFAULT 0,
  total_eur integer NOT NULL,
  stripe_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.gift_card_orders TO service_role;
ALTER TABLE public.gift_card_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number text NOT NULL UNIQUE,
  amount_eur integer NOT NULL,
  design text NOT NULL,
  recipient_name text NOT NULL DEFAULT '',
  buyer_name text NOT NULL DEFAULT '',
  buyer_email text NOT NULL DEFAULT '',
  buyer_phone text NOT NULL DEFAULT '',
  delivery text NOT NULL CHECK (delivery IN ('digital', 'print')),
  shipping_address jsonb,
  envelope_message text NOT NULL DEFAULT '',
  print_fee_eur integer NOT NULL DEFAULT 0,
  payment_provider text NOT NULL DEFAULT 'stripe',
  payment_id text UNIQUE,
  order_id uuid REFERENCES public.gift_card_orders (id) ON DELETE SET NULL,
  paid_at timestamptz,
  issued_at timestamptz NOT NULL DEFAULT now(),
  valid_until date NOT NULL,
  status text NOT NULL DEFAULT 'aktiivne' CHECK (status IN ('aktiivne', 'kasutatud', 'aegunud', 'tühistatud')),
  print_status text CHECK (print_status IN ('ootab_printimist', 'postitatud')),
  used_at timestamptz,
  notes text NOT NULL DEFAULT ''
);

CREATE INDEX gift_cards_print_idx ON public.gift_cards (print_status) WHERE print_status = 'ootab_printimist';
CREATE INDEX gift_cards_valid_idx ON public.gift_cards (valid_until) WHERE status = 'aktiivne';

GRANT ALL ON public.gift_cards TO service_role;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Aegunud kaardid märgitakse automaatselt. Rakendus teeb sama ka iga kaardi lugemisel,
-- seega töötab kõik ka siis, kui pg_cron puudub.
CREATE OR REPLACE FUNCTION public.expire_gift_cards() RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE public.gift_cards SET status = 'aegunud'
  WHERE status = 'aktiivne' AND valid_until < (now() AT TIME ZONE 'Europe/Tallinn')::date;
  DELETE FROM public.gift_card_orders o
  WHERE o.created_at < now() - interval '30 days'
    AND NOT EXISTS (SELECT 1 FROM public.gift_cards c WHERE c.order_id = o.id);
$$;

REVOKE ALL ON FUNCTION public.expire_gift_cards() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_gift_cards() TO service_role;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.schedule('expire-gift-cards', '5 0 * * *', 'SELECT public.expire_gift_cards()');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron pole saadaval, aegunud kaardid märgib rakendus: %', SQLERRM;
END $$;
