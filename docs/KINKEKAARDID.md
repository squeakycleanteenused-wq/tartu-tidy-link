# Kinkekaardid

Leht `/kinkekaardid`: klient valib kujunduse ja summa, maksab Stripe'is ning saab kaardi PDF-ina e-postile
(soovi korral ka prinditult ümbrikus). Omaniku haldus on `/haldus`.

## Kuidas see töötab

1. Ostja täidab vormi → server arvutab hinna (`src/lib/giftcards.config.ts`) ja loob Stripe Checkouti.
2. Stripe saadab makse kinnituse webhookiga `/api/stripe-webhook`. Allkiri kontrollitakse.
3. Alles siis tekib kaart tabelisse `gift_cards` (number `SQ-AAKK-XXXX`), ostjale ja omanikule lähevad e-kirjad.
   Sama makse kordus ei loo teist kaarti (`payment_id` on unikaalne).
4. Aitäh-leht `/kinkekaardid/aitah` näitab kaardi numbrit ja allkirjastatud PDF-linki (kehtib 30 päeva).

Failid:

| Fail | Mis seal on |
|---|---|
| `src/lib/giftcards.config.ts` | summad, lisatasu, saatmise tekst, kehtivus, tagakülje hinnakiri ja märkus |
| `src/lib/giftcard-draw.ts` | kaardi joonistamine (sama kood eelvaates ja PDF-is) |
| `src/lib/giftcard-pdf.server.ts` | PDF serveris (`@napi-rs/canvas` + `jsPDF`), fondid ja pildid põimitud |
| `src/lib/giftcards.server.ts` | makse, webhook, kaardi number, e-kirjad, haldus |
| `src/lib/giftcards.functions.ts` | serverifunktsioonid lehele ja haldusele |
| `supabase/migrations/20261117120000_gift_cards.sql` | tabelid `gift_card_orders` ja `gift_cards` |
| `tests/giftcards.test.ts` | testid: `npx -y bun@1 test tests/giftcards.test.ts` |

## Seadistamine (testrežiim)

1. **Andmebaas:** käivita migratsioon `supabase/migrations/20261117120000_gift_cards.sql`
   (Supabase → SQL Editor → kleebi faili sisu → Run, või Lovable'i kaudu).
2. **Stripe:** Dashboardis lülita sisse **Test mode**.
   - Developers → API keys → kopeeri **Secret key** (`sk_test_...`).
   - Developers → Webhooks → **Add endpoint**: `https://<eelvaate-aadress>/api/stripe-webhook`,
     sündmused `checkout.session.completed` ja `checkout.session.async_payment_succeeded`.
     **Signing secret** (`whsec_...`) on valikuline: kui see on Vercelis `STRIPE_WEBHOOK_SECRET`-ina, kontrollitakse
     allkirja; kui ei, küsib server iga sündmuse otse Stripe'ist üle.
3. **Vercel → Settings → Environment Variables** (Preview keskkonda):
   `STRIPE_SECRET_KEY` ja soovi korral `GIFTCARD_SECRET` (vähemalt 32 juhuslikku märki, nt `openssl rand -base64 48`;
   kui puudub, tuletatakse see Stripe'i võtmest) ning `STRIPE_WEBHOOK_SECRET` (valikuline), `ADMIN_PASSWORD` (vähemalt 12 märki, juhuslik), soovi korral `OWNER_EMAIL`.
   `MAILERSEND_API_TOKEN` ja Supabase'i muutujad on juba olemas. Vaata ka `.env.example`.
4. Tee uus deploy ja testi Stripe'i testkaardiga `4242 4242 4242 4242` (mis tahes tulevane kuupäev ja CVC).

Võtmeid ei panda koodi ega gitti ning neid ei saadeta kellelegi vestluses.

## Päris režiimi lülitamine

1. Stripe'is lõpeta konto aktiveerimine (ettevõtte andmed, pangakonto).
2. Lülita Dashboard päris režiimi ja võta sealt `sk_live_...` võti.
3. Loo päris režiimis uus webhook `https://www.squeakycleanteenused.ee/api/stripe-webhook` ja võta selle `whsec_...`.
4. Pane need Vercelis **Production** keskkonda (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). Testvõtmed jäävad Preview'sse.
5. Kontrolli, et kinkekaardi tingimuste leht (`src/routes/kinkekaardi-tingimused.tsx`) on täidetud.

## Muutmine

- **Summad, „muu summa“ piirid, printimise lisatasu, saatmise tekst, kehtivus:** `src/lib/giftcards.config.ts`.
- **Laoseis:** `TOTAL_STOCK` samas failis (praegu 6 kaarti kokku, kõik kujundused koos; `null` = piiramatu).
  Arvestatakse kõik tühistamata kaardid (ka käsitsi väljastatud). Pooleli makse hoiab kaarti 31 minutit reserveeritud
  (Stripe'i makseleht aegub sama ajaga), seega ei saa viimast kaarti kaks inimest korraga osta.
  Ostulehel on näha, mitu kaarti on alles; kui need on otsas, on maksmine suletud. Halduses on näha sama.
- **Ühekordne kasutus:** kaart märgitakse halduses kasutatuks enne või pärast koristust. Kasutatud, aegunud või
  tühistatud kaarti ei saa uuesti kasutatuks märkida. Kontrolli kaardi numbrit halduses alati enne tööd.
- **Tagakülje hinnakiri ja märkus:** `PRICES` ja `PRICE_NOTE` samas failis. Uuenda koos kodulehe hinnakirjaga.
- **Kujundused:** pildid `src/assets/giftcards/`, värvid `DESIGNS` massiivis. Uus kujundus vajab pilti, pisipilti
  (`*-thumb.webp`) ja rida failides `giftcard-pdf.server.ts` ning `GiftCardPreview.tsx`.

## Haldus (`/haldus`)

Parool on muutujas `ADMIN_PASSWORD`. Seal saab kaarti numbri järgi otsida, märkida kasutatuks või tühistada,
näha „Ootab printimist“ nimekirja (trükifail lõikevaruga ja „Märgi postitatuks“) ning väljastada kaardi käsitsi
(nt arvega makse korral). Aegunud kaardid märgitakse automaatselt (öine pg_cron töö ja iga lugemise ajal).

## Teadaolevad piirangud

- PDF vajab Node'i serverit (Vercel). Lovable'i enda avaldatud koopia (Cloudflare) PDF-i teha ei saa.
- Kinkekaardi tingimuste leht on kohatäide: juriidiline tekst on vaja kirjutada.
