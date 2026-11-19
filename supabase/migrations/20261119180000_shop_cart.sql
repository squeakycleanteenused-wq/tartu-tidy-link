-- E-pood: ostukorv (mitu toodet ühes tellimuses, komplektisoodustus) ja tehisintellekti märge tootel.
ALTER TABLE public.products ADD COLUMN ai_made boolean NOT NULL DEFAULT false;

-- items: [{ "productId": uuid, "title": text, "priceCents": int (makstud, pärast soodustust) }]
ALTER TABLE public.product_orders ADD COLUMN items jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.product_orders ADD COLUMN discount_cents integer NOT NULL DEFAULT 0;
