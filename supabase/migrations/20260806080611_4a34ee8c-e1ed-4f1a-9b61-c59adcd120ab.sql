CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  client_type text NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  billing_address text NOT NULL,
  object_address text NOT NULL,
  city text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  extra text NOT NULL DEFAULT '',
  consent_terms boolean NOT NULL DEFAULT false,
  consent_withdrawal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;