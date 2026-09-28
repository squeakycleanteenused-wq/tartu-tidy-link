/* ------------------------------------------------------------------ */
/* TEKSTIILIPUHASTAJA ÜÜRILEPING (VÕS § 271)                           */
/* Muuda seadme andmeid ja hinda ainult siin.                          */
/* ------------------------------------------------------------------ */
export const RENTAL = {
  device: "Spot Cleaner Pro tekstiilipuhastusmasin",
  // Üür ühe päeva eest eurodes, käibemaksuta. Kui null, kirjutatakse lepingusse "hind kokkuleppel".
  pricePerDay: 18 as number | null,
  maxDays: 14,
};

/* ------------------------------------------------------------------ */
/* ETTEVÕTTE ANDMED (kasutatakse kalkulaatoris, lepingus ja taganemisel).  */
/* KOHUSTUSLIK TÄITA: seadus nõuab, et tarbijale on enne lepingu sõlmimist */
/* teada ettevõtja asukoha aadress, telefon ja e-post.                  */
/* ------------------------------------------------------------------ */
export const RENTAL_COMPANY = {
  name: "Squeaky Clean Teenused OÜ",
  code: "16288747",
  email: "squeakycleanteenused@gmail.com",
  address: "Rattasepa tee 16, Soinaste küla", // TÄIDA VEEL: lisa vald/maakond ja postiindeks, kui need kuuluvad aadressi juurde
  phone: "+372 5685 7899",
};

export function companyContact() {
  const c = RENTAL_COMPANY;
  return [
    `registrikood ${c.code}`,
    c.address ? `asukoha aadress ${c.address}` : "",
    c.phone ? `telefon ${c.phone}` : "",
    `e-post ${c.email}`,
  ]
    .filter(Boolean)
    .join(", ");
}

export type RentalData = {
  isCompany: boolean;
  name: string;
  code: string; // isikukood (eraisik) või registrikood (ettevõte)
  address: string; // eraisikul elukoha, ettevõttel asukoha aadress
  repName?: string; // ettevõtte esindaja nimi
  phone: string;
  email: string;
  days: number;
  startISO: string; // yyyy-mm-dd
  place: string;
};

const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

export function rentalPeriod(startISO: string, days: number) {
  if (!startISO || !(days > 0)) return { start: "…", end: "…" };
  const s = new Date(`${startISO}T12:00:00`);
  if (Number.isNaN(s.getTime())) return { start: "…", end: "…" };
  const e = new Date(s);
  e.setDate(e.getDate() + days);
  return { start: fmtDate(s), end: fmtDate(e) };
}

export function rentalTotal(days: number): number | null {
  return RENTAL.pricePerDay == null || !(days > 0) ? null : Math.round(RENTAL.pricePerDay * days * 100) / 100;
}

const money = (n: number) => `${n.toLocaleString("et-EE", { maximumFractionDigits: 2 })} €`;

export function buildRentalContract(d: RentalData): string {
  const v = (s: string) => (s && s.trim() ? s.trim() : "…");
  const { start, end } = rentalPeriod(d.startISO, d.days);
  const total = rentalTotal(d.days);
  const rentLine =
    RENTAL.pricePerDay == null
      ? "Üür on kokkulepitud hind, mille pooled kinnitavad kirjalikult (e-kirjaga) enne Masina üleandmist."
      : `Üür on ${money(RENTAL.pricePerDay)} päevas, ${d.days > 0 ? `${d.days} päeva eest kokku ${money(total ?? 0)}` : "kokku päevade arvu alusel"}.`;
  const lateLine =
    RENTAL.pricePerDay == null
      ? "Tagastamisega viivitamisel tasub Üürnik iga alanud viivituspäeva eest üüri päevamääras, mis on poolte vahel kokku lepitud."
      : `Tagastamisega viivitamisel tasub Üürnik iga alanud viivituspäeva eest üüri päevamääras (${money(RENTAL.pricePerDay)}) kuni Masina tagastamiseni.`;

  return [
    "TEKSTIILIPUHASTUSMASINA ÜÜRILEPING",
    "",
    "1. POOLED",
    `1.1. Üürileandja: ${RENTAL_COMPANY.name}, ${companyContact()}. Üürileandja ei ole käibemaksukohustuslane.`,
    d.isCompany
      ? `1.2. Üürnik (ettevõte): ${v(d.name)}, registrikood ${v(d.code)}, asukoha aadress ${v(d.address)}, telefon ${v(d.phone)}, e-post ${v(d.email)}. Üürnikku esindab ja Masina võtab vastu ${v(d.repName ?? "")}.`
      : `1.2. Üürnik (eraisik): ${v(d.name)}, isikukood ${v(d.code)}, elukoha aadress ${v(d.address)}, telefon ${v(d.phone)}, e-post ${v(d.email)}.`,
    "",
    "2. LEPINGU ESE",
    `2.1. Üürileandja annab Üürnikule ajutiselt kasutada seadme: ${RENTAL.device} koos tarvikutega (edaspidi Masin). Tarvikute komplekt fikseeritakse Masina üleandmisel.`,
    "2.2. Masin antakse üle töökorras. Üürnik vaatab Masina üleandmisel üle ja teavitab nähtavatest puudustest kohe.",
    "2.3. Masin on mõeldud kodutekstiilide (nt polstermööbel, vaibad, madratsid, autoistmed) niiskeks puhastamiseks.",
    "",
    "3. ÜÜRIPERIOOD, ÜLEANDMINE JA TAGASTAMINE",
    `3.1. Üüriperiood on ${d.days > 0 ? d.days : "…"} päeva, algusega ${start}. Masin tagastatakse hiljemalt ${end}.`,
    `3.2. Üleandmise ja tagastamise koht ja aeg: ${v(d.place)}.`,
    "3.3. Üürnik tagastab Masina puhtana: mahutid on tühjendatud ja loputatud.",
    `3.4. ${lateLine}`,
    "",
    "4. ÜÜR JA MAKSMINE",
    `4.1. ${rentLine}`,
    "4.2. Üürileandja ei ole käibemaksukohustuslane, käibemaksu üürile ei lisandu.",
    "4.3. Üür tasutakse Üürileandja esitatud arve alusel pangaülekandega, maksetähtaeg üldjuhul 7 päeva. Sularahamakseid ei aktsepteerita.",
    "4.4. Üürileandja ei nõua tagatisraha (pandi).",
    "",
    "5. MASINA KASUTAMINE",
    "5.1. Üürnik kasutab Masinat ainult otstarbekohaselt, kasutusjuhendi ja Üürileandja juhiste kohaselt ning ainult enda tarbeks.",
    "5.2. Üürnik ei anna Masinat kolmandatele isikutele kasutada, ei anna seda edasi üürile ega tee Masinas muudatusi ega remonti.",
    "5.3. Üürnik kasutab Masinas ainult sobivat puhastusvahendit ja vett vastavalt Üürileandja juhistele.",
    "5.4. Üürnik vastutab ise selle eest, et puhastatav tekstiil sobib niiskeks puhastuseks, ning katsetab puhastust esmalt märkamatul kohal. Üürileandja ei vastuta Üürniku tekstiili, mööbli, põranda ega muu vara kahjustuste eest, mis tulenevad Masina kasutamisest, kui kahju ei ole põhjustatud Masina puudusest ega Üürileandja süülisest tegevusest.",
    "",
    "6. VASTUTUS",
    "6.1. Üürnik vastutab Masina kaotsimineku, varguse ja kahjustumise eest, kui see on tekkinud Üürniku süül (sh kasutusjuhendi või juhiste vastasel kasutamisel). Tavapärasest kulumisest tulenevat kahju Üürnik ei hüvita.",
    "6.2. Kahju hüvitise suuruses lepivad pooled kokku. Kokkuleppe puudumisel on hüvitis Masina parandamise põhjendatud kulu, kuid mitte rohkem kui Masina turuväärtus kahju tekkimise ajal.",
    "6.3. Tagatisraha ei võeta. Hüvitis nõutakse kahju tekkimise korral eraldi arvega.",
    "6.4. Üürnik teavitab Üürileandjat viivitamata Masina rikkest, kahjustumisest või kaotsiminekust.",
    "6.5. Üürileandja vastutab Masina puuduste eest seaduses sätestatud ulatuses.",
    `6.6. ${d.isCompany ? "" : "Käesolev peatükk ei piira tarbijast Üürniku seadusest tulenevaid õigusi. "}Üürileandja ei piira oma vastutust tahtluse ja raske hooletuse eest ega vastutust elu ja tervise kahjustamise eest.`,
    "",
    "7. TÜHISTAMINE, TAGANEMINE JA LEPINGU LÕPETAMINE",
    "7.1. Üürnik võib tellimuse tasuta tühistada kuni 24 tundi enne Masina üleandmist.",
    d.isCompany
      ? "7.2. Ettevõttest Üürnikule ei kohaldu tarbija 14-päevane taganemisõigus."
      : "7.2. Eraisikust Üürnikul on õigus sidevahendi teel sõlmitud lepingust 14 päeva jooksul põhjust avaldamata taganeda, teatades sellest Üürileandjale e-kirjaga või lehel oleva taganemisvormi kaudu (võib kasutada taganemisavalduse tüüpvormi). Kui Üürnik soovib Masina kasutamist alustada enne selle tähtaja lõppu, tasub ta taganemisel proportsionaalselt kasutatud aja eest.",
    "7.3. Üürileandjal on õigus leping erakorraliselt üles öelda ja Masin tagasi nõuda, kui Üürnik kasutab Masinat lepingu vastaselt või ei tasu üüri tähtajaks.",
    "",
    "8. ISIKUANDMED",
    d.isCompany
      ? "8.1. Vastutav töötleja on Üürileandja (kontaktandmed punktis 1.1). Üürileandja töötleb Üürniku esindaja nime ja kontaktandmeid lepingu täitmiseks ning õigusnõuete esitamiseks ja kaitsmiseks."
      : "8.1. Vastutav töötleja on Üürileandja (kontaktandmed punktis 1.1). Üürileandja töötleb Üürniku nime, isikukoodi, kontaktandmeid ja aadressi lepingu täitmiseks ning õigusnõuete esitamiseks ja kaitsmiseks. Isikukoodi kasutatakse Üürniku tuvastamiseks võimaliku kahjunõude korral.",
    "8.2. Andmeid säilitatakse lepingu kehtivuse ajal ja pärast seda nii kaua, kui seadus nõuab (arvete ja muude raamatupidamisdokumentide puhul üldjuhul 7 aastat) või kuni nõuete aegumiseni. Andmeid ei anta edasi kolmandatele isikutele, välja arvatud seadusest tulenevalt ja teenusepakkujatele (nt e-kirjade saatmise teenus), kes töötlevad andmeid Üürileandja nimel.",
    "8.3. Üürnikul on õigus tutvuda oma andmetega, nõuda nende parandamist, kustutamist ja töötlemise piiramist ning esitada kaebus Andmekaitse Inspektsioonile.",
    "",
    "9. KOHALDATAV ÕIGUS JA VAIDLUSED",
    d.isCompany
      ? "9.1. Lepingule kohaldatakse Eesti Vabariigi õigust. Vaidlused lahendatakse esmalt läbirääkimiste teel, kokkuleppe puudumisel Tartu Maakohtus."
      : "9.1. Lepingule kohaldatakse Eesti Vabariigi õigust. Vaidlused lahendatakse esmalt läbirääkimiste teel, kokkuleppe puudumisel kohtus (tarbijast Üürniku puhul tema elukohajärgses kohtus). Tarbijal on õigus pöörduda Tarbijavaidluste komisjoni poole.",
    "",
    "10. LEPINGU SÕLMIMINE",
    "10.1. Üürnik esitab üüri taotluse hinnapäringu vormi kaudu ja kinnitab, et on lepingu tingimustega tutvunud ja nõustub nendega. Taotlus ei ole siduv leping. Leping loetakse sõlmituks, kui Üürileandja on taotluse kinnitanud e-kirjaga (püsival andmekandjal), lisades sellele käesoleva lepingu ja lõpliku üüri. Masin antakse üle pärast kinnitust.",
    "10.2. Leping on koostatud eesti keeles.",
  ].join("\n");
}
