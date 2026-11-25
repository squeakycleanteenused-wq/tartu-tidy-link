# Koduninja

Squeaky Clean Teenused OÜ koduleht: kodukoristus Tartus, Põlvas ja lähiümbruses.
Leht on eesti ja inglise keeles.

- **Leht:** https://www.koduninja.ee (`SITE_URL` failis `src/lib/site.ts`)
- **Lovable'i projekt:** https://lovable.dev/projects/a1f5e545-cabb-4d0d-b566-43655437321c
- **Lovable'i eelvaade:** https://tartu-tidy-link.lovable.app
- **Vercel:** https://tartu-tidy-link-3zq7.vercel.app

**[TÄPSUSTADA]** Koodis ja juhendites on kasutusel kaks domeeni: `koduninja.ee` (leht, sitemap) ning
`squeakycleanteenused.ee` (e-posti saatja `MAIL_FROM`, `PUBLIC_SITE_URL` vaikeväärtus, Stripe'i webhook
failis `docs/kinkekaardid.md`). Kontrolli, kumb on kus õige.

> Repo on ühendatud Lovable'iga: iga `main`-i jõudnud muudatus sünkroonitakse Lovable'isse.
> Ära kirjuta avaldatud ajalugu ümber (force push, rebase). Vt `AGENTS.md`.

## Mis lehel on

| Osa | Leht | Kood |
|---|---|---|
| Avaleht: teenused, hinnakalkulaator, päringuvorm, „Küsi nõu fotoga“, KKK | `/` | `src/routes/index.tsx`, `src/components/site/` |
| Kinkekaardid (Stripe, PDF) | `/kinkekaardid` | `src/lib/giftcards.*`, vt `docs/kinkekaardid.md` |
| E-pood | `/pood` | `src/lib/shop.*`, vt `docs/e-pood.md` |
| Omaniku haldus | `/haldus` | `src/routes/haldus.tsx` |
| Tingimused ja privaatsus | `/tingimused`, `/privaatsus`, `/renditingimused`, `/kinkekaardi-tingimused`, `/e-poe-tingimused` | `src/lib/legal.ts` |
| Kampaaniad | avalehel | `src/lib/campaigns.ts` |

## Kaustad

| Kaust | Mis seal on |
|---|---|
| `src/routes/` | lehed (failipõhine marsruutimine, vt `src/routes/README.md`); `src/routes/api/` serveri otspunktid |
| `src/components/site/` | lehe enda komponendid |
| `src/components/ui/` | shadcn/ui põhikomponendid (osa pole veel kasutusel, jäetakse alles) |
| `src/lib/` | äriloogika, hinnad, tekstid, serverifunktsioonid (`*.server.ts`, `*.functions.ts`) |
| `src/assets/` | pildid; kinkekaartide kujundused kaustas `src/assets/giftcards/` |
| `src/data/` | andmefailid (nt Unisendi pakiautomaadid) |
| `supabase/migrations/` | andmebaasi muudatused (failinimi algab kuupäevaga `YYYYMMDD...`) |
| `scripts/` | abiskriptid (nt pakkumise kirja põhja genereerimine) |
| `tests/` | testid |
| `docs/` | juhendid ja otsused |

## Dokumentatsioon

| Fail | Sisu |
|---|---|
| `docs/kinkekaardid.md` | kinkekaartide töövoog, seadistamine, päris režiimi lülitamine, haldus |
| `docs/e-pood.md` | e-poe plaan ja tarneviiside otsused (19.11.2026) |
| `docs/pakkumise-kiri.txt` | pakkumise e-kirja põhi koos tingimustega (genereeritud, vt allpool) |
| `docs/arhiiv/2026-05-algne-lovable-prompt.md` | projekti algne tellimus Lovable'ile (arhiiv, osaliselt aegunud) |

## Hinnad ja tekstid: kust muuta

| Mida | Kus |
|---|---|
| Hinnakalkulaatori hinnad | `src/components/site/PriceCalculator.tsx` (plokk `RATES` ja `OTHER_TASKS`) |
| Kinkekaardi summad, kujundused, tagakülje hinnakiri | `src/lib/giftcards.config.ts` |
| Tingimuste tekst | `src/lib/legal.ts` |
| Kampaaniad | `src/lib/campaigns.ts` |

Hinnakiri on mitmes kohas. Hindu muutes uuenda kalkulaator, kinkekaardi tagakülg ja vajadusel `docs/pakkumise-kiri.txt`.

## Käivitamine

```sh
npm i
npm run dev
```

Testid:

```sh
npx -y bun@1 test tests/giftcards.test.ts
npx -y bun@1 test tests/shop.test.ts
```

Pakkumise kirja põhi pärast tingimuste muutmist:

```sh
npx bun scripts/pakkumise-kiri.ts > docs/pakkumise-kiri.txt
```

## Keskkonnamuutujad

Näidis on failis `.env.example`. Päris väärtused on Verceli seadetes (Settings → Environment Variables),
mitte koodis ega gitis. Failis `.env` on ainult avalikud (publishable) Supabase'i väärtused.

| Muutuja | Milleks |
|---|---|
| `MAILERSEND_API_TOKEN`, `MAIL_FROM` | e-kirjade saatmine |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_*` | andmebaas |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | robotikaitse (valikuline) |
| `PUBLIC_SITE_URL`, `WAITLIST_SALT` | kinnituslingid, ootelist (valikuline) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GIFTCARD_SECRET` | maksed ja kinkekaardid |
| `ADMIN_PASSWORD`, `OWNER_EMAIL` | haldus ja teavitused |

## Teadaolevad lahtised kohad

- `public/sitemap.xml` sisaldab 5 lehte; `/kinkekaardid` ja `/pood` on puudu.
- Kinkekaardi tingimuste leht on kohatäide (vt `docs/kinkekaardid.md`).
- Kinkekaartide PDF vajab Node'i serverit (Vercel); Lovable'i Cloudflare'i koopia PDF-i teha ei saa.
