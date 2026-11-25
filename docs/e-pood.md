# E-pood (plaan ja otsused)

## 1. etapp: digitaalsed tooted
- Leht `/pood`: tooted kategooriate kaupa, iga toote leht.
- Ost Stripe Checkoutiga (sama mis kinkekaartidel). Enne makset nõusolek: digisisu antakse kohe ja
  14-päevane taganemisõigus kaob (VÕS § 53 lg 4 p 13).
- Failid privaatses Supabase'i salves; pärast makset allkirjastatud aeguv allalaadimislink + e-kiri.
- Halduses (`/haldus`) vahekaart „Tooted": lisa/muuda toode (nimi, kirjeldus, hind, kategooria, pilt, fail),
  peida/avalda, müügid, saada link uuesti.
- E-poe tingimused (digisisu) ja privaatsuspoliitika täiendus.

## 2. etapp: füüsilised kaubad (otsused 19.11.2026)
Klient valib tarneviisi ise, iga valiku juures hind ja lühike selgitus.

| Tarneviis | Hind kliendile | Märkus |
|---|---|---|
| Omniva standardkiri | 1,80 € | kuni 250 g ja õhuke (mahub ümbrikusse); ei ole jälgitav |
| Unisend pakiautomaat (Nutitarne automaadist automaati) | XS 2,00 € (S/M/L: täpsustada) | jälgitav, 1–2 tööpäeva; XS 61 × 18,5 × 8 cm, kuni 30 kg; Eestis 319 automaati, Tartus 30, Põlvas 2 |
| Järeletulemine (Tartu) | tasuta | kokkuleppel |
| Koristaja toob kaasa | tasuta | kui kliendil on koristus tellitud |

Toodetel halduses: kaal, mõõdud ja „mahub ümbrikusse". Pood pakub ainult sobivaid tarneviise.
Lihtkirja kohta tingimustes: kui saadetis ei jõua 10 tööpäeva jooksul kohale, saadame uuesti.

Võrreldud (19.11.2026, eraklienditasu Eesti sees, XS): Unisend 2,00 €, Venipak 2,05 €, DPD 2,63 €,
SmartPost 2,90 €; Omniva standardpakk postkontorisse 9,00 €; Omniva maksikiri 3,05–6,75 € (ei ole jälgitav).
Omniva hinnakirjad ja üldleping: omaniku failides (leping on konfidentsiaalne, ära lisa reposse).

Unisendi automaatide nimekiri: `src/data/unisend-terminals-ee.json` (uuenda: my.unisend.ee/map → „Laadi alla", seejärel teisenda Eesti read).
