import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang, type Lang } from "@/lib/i18n";
import { canSendDirect, sendRequest } from "@/lib/send-request";
import { RENTAL, RENTAL_COMPANY, buildRentalContract, companyContact, rentalPeriod, rentalTotal } from "@/lib/rental-contract";

/* ------------------------------------------------------------------ */
/* HINNAD: muuda ainult siin. Kõik on eurodes, käibemaksuta.           */
/* [min, max] = hinnavahemik.                                          */
/* NB! Ruutmeetri hinnad on arvutatud sinu hinnakirjast:               */
/*   hoolduskoristus 60-70 € / 70 m²,  suurpuhastus 80-100 € / 70 m².  */
/* ------------------------------------------------------------------ */
const BASE_M2 = 70;
const RATES = {
  minFee: 30,
  hourly: 15,
  // Pakett kehtib kuni 70 m² eluruumile. Suurema pinna eest lisandub proportsionaalselt.
  maintenanceBase: [60, 70],
  deepBase: [80, 100],
  windows: { normal: [3.5, 4], large: [4, 5.5], old: [5, 8] },
  maintenanceHours: [4, 5], // ajakulu 70 m² kohta
} as const;

/* Muud tööd (tunnihinnaga 15 €/h). Tunnid on OLETUS, muuda vastavalt oma kogemusele: [min h, max h] */
const OTHER_TASKS = [
  { key: "oven", hours: [1, 2], et: "Ahju puhastus", en: "Oven cleaning" },
  { key: "fridge", hours: [0.5, 1.5], et: "Külmkapi / sügavkülmiku sisepesu", en: "Fridge / freezer interior cleaning" },
  { key: "cupboards", hours: [1, 2], et: "Kappide sisemus", en: "Inside of cupboards" },
  { key: "appliances", hours: [0.5, 1], et: "Muu kodumasina sisepesu (nt nõudepesumasin)", en: "Other appliance interior (e.g. dishwasher)" },
  { key: "balcony", hours: [1, 2], et: "Rõdu / terrass", en: "Balcony / terrace" },
] as const;

/* Tolmuimeja kaasavedu, kui kliendil oma tolmuimejat pole. Fikseeritud tasu eurodes või null ("lepime kokku"). */
const VACUUM_FEE: number | null = null;

const COMPANY = RENTAL_COMPANY; // andmed asuvad failis rental-contract.ts

type Cleaning = "none" | "maintenance" | "deep";
type Unit = "m2" | "pcs" | "h" | "task" | "rent" | "fee";
type Line = { key: string; unit: Unit; qty: number; min: number; max: number; hMin?: number; hMax?: number };

const num = (s: string, max: number) => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
};

type Input = {
  cleaning: Cleaning;
  area: number;
  normal: number;
  large: number;
  old: number;
  hours: number;
  picks: string[];
  vacuumFee: number; // 0 kui ei rakendu
  rentDays: number; // 0 kui rent ei ole valitud
};

function calculate(i: Input) {
  const svc: Line[] = []; // teenused (nende peale kehtib minimaalne väljakutsetasu)
  let timeMin = 0;
  let timeMax = 0;

  if (i.cleaning !== "none" && i.area > 0) {
    const base = i.cleaning === "maintenance" ? RATES.maintenanceBase : RATES.deepBase;
    const extra = Math.max(0, i.area - BASE_M2) / BASE_M2;
    const min = base[0] * (1 + extra);
    const max = base[1] * (1 + extra);
    svc.push({ key: i.cleaning, unit: "m2", qty: i.area, min, max });
    if (i.cleaning === "maintenance") {
      timeMin += RATES.maintenanceHours[0] * (1 + extra);
      timeMax += RATES.maintenanceHours[1] * (1 + extra);
    } else {
      // ajakulu = hind / tunnihind
      timeMin += min / RATES.hourly;
      timeMax += max / RATES.hourly;
    }
  }
  (["normal", "large", "old"] as const).forEach((k) => {
    const qty = k === "normal" ? i.normal : k === "large" ? i.large : i.old;
    if (qty > 0) {
      const min = qty * RATES.windows[k][0];
      const max = qty * RATES.windows[k][1];
      svc.push({ key: k, unit: "pcs", qty, min, max });
      timeMin += min / RATES.hourly;
      timeMax += max / RATES.hourly;
    }
  });
  OTHER_TASKS.filter((t) => i.picks.includes(t.key)).forEach((t) => {
    svc.push({
      key: t.key,
      unit: "task",
      qty: 1,
      hMin: t.hours[0],
      hMax: t.hours[1],
      min: t.hours[0] * RATES.hourly,
      max: t.hours[1] * RATES.hourly,
    });
    timeMin += t.hours[0];
    timeMax += t.hours[1];
  });
  if (i.hours > 0) {
    svc.push({ key: "hours", unit: "h", qty: i.hours, min: i.hours * RATES.hourly, max: i.hours * RATES.hourly });
    timeMin += i.hours;
    timeMax += i.hours;
  }

  const hasService = svc.length > 0;
  const rawMin = svc.reduce((s, l) => s + l.min, 0);
  const rawMax = svc.reduce((s, l) => s + l.max, 0);
  const minFeeApplied = hasService && rawMax < RATES.minFee;
  let min = hasService ? Math.max(rawMin, RATES.minFee) : 0;
  let max = hasService ? Math.max(rawMax, RATES.minFee) : 0;

  const lines: Line[] = [...svc];
  if (hasService && i.vacuumFee > 0) {
    lines.push({ key: "vacuum", unit: "fee", qty: 1, min: i.vacuumFee, max: i.vacuumFee });
    min += i.vacuumFee;
    max += i.vacuumFee;
  }
  const rent = rentalTotal(i.rentDays);
  if (rent != null) {
    lines.push({ key: "rent", unit: "rent", qty: i.rentDays, min: rent, max: rent });
    min += rent;
    max += rent;
  }
  return {
    lines,
    min: Math.round(min),
    max: Math.round(max),
    hasItems: lines.length > 0,
    hasService,
    minFeeApplied,
    timeMin,
    timeMax,
  };
}

/* ------------------------------ TEKSTID ----------------------------- */
const COPY = {
  et: {
    title: "Hinnakalkulaator",
    askPhoto: "Pole kindel, kas midagi on võimalik puhastada? Küsi nõu fotoga",
    subtitle: "Sisesta oma vajadus ja näed kohe orienteeruvat hinda. Seejärel saad päringu meile saata.",
    s1: "1. Mida vajad?",
    cleaning: "Koristuse liik",
    cleaningOpts: { none: "Ei vaja (ainult aknapesu või lisatööd)", maintenance: "Hoolduskoristus (kerge koristus)", deep: "Suurpuhastus / süvapesu" },
    area: "Pind (m²)",
    includes: {
      none: "",
      maintenance:
        "Sisaldab: tolmu võtmine vabadelt pindadelt, põrandate tolmuimemine ja niiske puhastus, peegelpindade puhastus, vannitoa ja WC kerge puhastus (valamu, pott), olmeprügi väljaviimine. Ainult need tööd; kõik muu (aknad, kappide sisemus, kodumasinate sisepesu) on lisatöö. Hind kehtib eluruumile kuni 70 m², suurema pinna eest lisandub tasu proportsionaalselt.",
      deep: "Sisaldab hoolduskoristuse töid ning lisaks köögipindade süvapuhastust (rasva eemaldamine), vannitoa katlakivi ja vuukide pesu, liistude, lülitite ja uste puhastust, radiaatorite ja torude tolmu pühkimist. Parim võimalik tulemus pindade seisukorrast lähtuvalt; kinnistunud vana mustuse täielikku eemaldamist ei garanteerita. Hind kehtib kuni 70 m², suurema pinna eest lisandub tasu proportsionaalselt.",
    },
    windows: "Aknapesu",
    windowsHint:
      "Hind sisaldab klaase, raame ja aknalaudu. Vanad puitaknad vajavad lahtikruvimist ja nelja pinna pesu. Kui aknaid on vähe, rakendub minimaalne väljakutsetasu 30 €.",
    normal: "Tavaline korteriaken, avatav (tk)",
    large: "Suur maast laeni aken / rõduuks (tk)",
    old: "Vana puitaken, topeltraamid (tk)",
    other: "Muud tööd",
    otherHint: "Vali, mida vajad (võid tellida ka ainult need). Hind arvutatakse tunnihinnaga 15 €/h, aeg on orienteeruv.",
    otherDesc: "Kirjelda muud tööd",
    otherDescPh: "nt rasvase ahju puhastus, mõõtmed; pildid saad saata hiljem",
    otherPending: "Kirjeldatud töö hind täpsustatakse eraldi pärast kirjeldusega tutvumist.",
    hours: "Lisatunnid (kui tead täpsemalt)",
    hoursHint: "Muude tööde jaoks tunnihinnaga 15 €/h.",
    vacuumQ: "Kas sul on töökorras tolmuimeja, mida me tohime kasutada?",
    vacuumYes: "Jah, on olemas ja töökorras",
    vacuumNo: "Ei ole",
    vacuumYesNote: "Kasutame sinu tolmuimejat, et me ei peaks oma tehnikat kaasa vedama. Me ei vastuta seadme varasemate defektide ega kulumise eest.",
    vacuumNoFee: (fee: number) => `Ilma tolmuimejata ei saa põrandaid puhastada. Toome oma tolmuimeja kaasa, lisatasu ${fee} €.`,
    vacuumNoPending: "Ilma tolmuimejata ei saa põrandaid puhastada. Toome oma tolmuimeja kaasa, lisatasu lepime kokku eraldi.",
    vacuumPending: "Tolmuimeja kaasaveo lisatasu lepime eraldi kokku.",
    rentTitle: "Tekstiilipuhastaja üür",
    rentText: `Spot Cleaner Pro tekstiilipuhastusmasin polstermööbli, vaipade ja madratsite puhastamiseks. Tagatisraha ei võeta. Kui masinaga midagi juhtub, lepime hüvitise kokku (kokkuleppe puudumisel remondikulu, kuid mitte üle masina turuväärtuse).`,
    rentOn: "Soovin tekstiilipuhastajat üürida",
    rentDays: "Mitmeks päevaks",
    rentFrom: "Üüri algus",
    rentPlace: "Üleandmise ja tagastamise koht ja aeg",
    rentPlacePh: "nt Tartu, kokkuleppel",
    idCode: "Isikukood",
    rentWho: "Üürnik",
    renterAddrPerson: "Elukoha aadress",
    renterAddrCompany: "Ettevõtte asukoha aadress",
    repName: "Esindaja nimi (kes masina vastu võtab)",
    rentVat: "Squeaky Clean Teenused OÜ ei ole käibemaksukohustuslane. Üürile käibemaksu ei lisandu, näidatud hind on lõplik.",
    rentWhoHint: "Nimi, e-post, telefon ja ettevõtte puhul registrikood täidetakse jaotises „2. Sinu andmed“.",
    rentPending: "Üüri hind lepitakse kokku enne üleandmist.",
    contractShow: "Vaata üürilepingut (täistekst)",
    contractNote: "Üürileping genereeritakse sinu sisestatud andmetega. Kontrolli see enne saatmist üle.",
    contractCopy: "Kopeeri leping",
    contractDownload: "Laadi leping alla (.txt)",
    utilities: "Kinnitan, et objektil on töötav elekter ning ligipääs soojale ja külmale veele. Ilma nendeta ei saa tööd teha.",
    consent3: "Olen üürilepingu tingimustega tutvunud ja nõustun nendega. Saan aru, et tagatisraha ei võeta, kuid masina kahjustamisel hüvitan kahju kokkuleppel (kokkuleppe puudumisel remondikulu, kuid mitte üle masina turuväärtuse).",
    timeNote: "Ajakulu on hinnang. Tegelik aeg sõltub pinna suurusest ja seisukorrast.",
    resultTitle: "Orienteeruv hind",
    empty: "Sisesta vajadus, et hinda näha.",
    total: "Kokku",
    time: "Orienteeruv ajakulu",
    hoursUnit: "h",
    minFee: "Rakendatud on minimaalne väljakutsetasu 30 € (2 töötundi).",
    indicative:
      "Hind on orienteeruv ja põhineb sinu sisestatud andmetel. See ei ole siduv pakkumine; leping sõlmitakse alles siis, kui kinnitame päringu e-kirjaga. Kui objekt või mustuse aste erineb oluliselt kirjeldatust, on teenuseosutajal õigus hinda kohapeal korrigeerida või tööst keelduda.",
    vat: "Käibemaksuta: ettevõte ei ole käibemaksukohustuslane, käibemaksu hinnale ei lisandu.",
    pay: "Maksmine ainult pangaülekandega arve alusel. Sularahas kahjuks maksta ei saa.",
    lines: {
      maintenance: "Hoolduskoristus",
      deep: "Suurpuhastus / süvapesu",
      normal: "Tavaline aken",
      large: "Suur aken / rõduuks",
      old: "Vana puitaken",
      hours: "Lisatööd",
      vacuum: "Tolmuimeja kaasavedu",
      rent: "Tekstiilipuhastaja üür",
    } as Record<string, string>,
    rentUnit: "päeva",
    units: { m2: "m²", pcs: "tk", h: "h" },
    s2: "2. Sinu andmed",
    clientType: "Tellija tüüp",
    person: "Eraisik",
    company: "Ettevõte",
    namePerson: "Ees- ja perekonnanimi",
    nameCompany: "Ettevõtte nimi",
    regCode: "Registrikood",
    email: "E-post",
    phone: "Telefon",
    address: "Koristusobjekti aadress",
    city: "Asukoht",
    cityOpts: ["Tartu linn", "Põlva linn", "Lähiümbrus (kokkuleppel)"],
    when: "Soovitud aeg (kuupäev ja kellaaeg)",
    whenPh: "nt 05.10.2026 kell 15:00",
    notes: "Lisainfo",
    notesPh: "Ruumide arv, allergiad, erilised pinnad, erisoovid",
    s3: "3. Olulised tingimused",
    legalIntro: "Palun loe läbi enne päringu saatmist.",
    legal: [
      ["Teenuseosutaja", "__PROVIDER__ Tegevuspiirkond: Tartu ja Põlva linn ning kokkuleppel nende lähiümbrus. Kaebused ja küsimused palume saata ülaltoodud aadressile või e-postile."],
      ["Lepingu sõlmimine", "See kalkulaator ja päring ei ole siduv pakkumine ega leping. Leping sõlmitakse, kui kinnitame sinu päringu e-kirjaga. Kinnituses saad meilt lõpliku hinna, aja, tingimused ning taganemisinfo ja tüüpvormi. Kuni kinnituseni võid päringust loobuda."],
      ["Hind ja käibemaks", "Ettevõte ei ole käibemaksukohustuslane, käibemaksu hinnale ei lisandu. Minimaalne väljakutsetasu on 30 € (2 töötundi). Kui mustuse aste või töömaht erineb oluliselt kirjeldatust, võime hinda enne töö algust korrigeerida või tööaega pikendada (lisatööde tunnihind 15 €/h). Enne töö algust küsime sinu nõusolekut uue hinnaga. Kui sa ei nõustu, võid tööst loobuda ja tasud ainult minimaalse väljakutsetasu (30 €). Lõplik hind kinnitatakse enne töö algust."],
      ["Arveldamine", "Tasumine toimub arve alusel pangaülekandega (maksetähtaeg üldjuhul 7 päeva). Sularahamakseid ei aktsepteerita. Maksmisega viivitamisel on viivis 0,05% päevas. Teenuseosutajal on õigus nõuda ettemaksu, eriti suuremate tööde ja esmatellimuste puhul."],
      ["Kliendi kohustused", "Klient tagab kokkulepitud ajal takistusteta ligipääsu, töötava elektri, sooja ja külma vee ning võimaluse kasutada töökorras tolmuimejat (vastasel juhul toome lisatasu eest kaasa oma tolmuimeja). Erihooldust vajavatest pindadest (nt õlitatud põrandad, looduskivi) tuleb ette teatada. Sularaha, väärisasjad, dokumendid ja kergesti purunevad esemed tuleb enne eemaldada või lukustada. Isiklikke asju me ei tõsta ega korrasta."],
      ["Tühistamine", "Tasuta tühistamine kuni 24 h enne töö algust. Hilisema tühistamise või sissepääsu mittetagamise korral (ooteaeg uksel kuni 30 min) on tasu 30 €."],
      ["Vastutus", "Teenuseosutaja vastutab töö käigus tekitatud otsese ja tõendatud varakahju eest seaduses sätestatud korras. Vastutus ei laiene pindade eelnevale kulumisele, varjatud puudustele ega teavitamata erimaterjalide kahjustustele. See ei piira tarbija seadusest tulenevaid õigusi ega meie vastutust tahtluse ja raske hooletuse eest."],
      ["Pretensioonid", "Puudustest teavita kohe kohapeal või fotodega mõistliku aja jooksul (ettevõttest tellijal 24 h jooksul). Puuduse korral teeme tasuta parandustöö. Tarbijal on õigus pöörduda Tarbijavaidluste komisjoni poole."],
      ["Isikuandmed", "Vastutav töötleja on Squeaky Clean Teenused OÜ. Töötleme sinu nime, kontaktandmeid ja aadressi hinnapakkumise koostamiseks ja lepingu täitmiseks. Arvete andmeid säilitame seadusega nõutud tähtaja jooksul (üldjuhul 7 aastat), muid andmeid nii kaua, kui see on vajalik nõuete esitamiseks ja kaitsmiseks. E-kirjade saatmisel kasutame teenusepakkujat, kes töötleb andmeid meie nimel. Sul on õigus oma andmetega tutvuda, neid parandada, kustutada ja töötlemist piirata ning esitada kaebus Andmekaitse Inspektsioonile. Kvaliteedikontrolliks võime teha „enne ja pärast“ fotosid ilma isikuandmeid jäädvustamata."],
    ] as [string, string][],
    withdrawalPerson: [
      "Taganemisõigus (eraisik)",
      "Sul on õigus sidevahendi teel sõlmitud lepingust 14 päeva jooksul põhjust avaldamata taganeda. Tähtaeg algab lepingu sõlmimisest ehk meie kinnituse päevast. Teavita meid ühemõtteliselt (e-postiga või lehel oleva vormi „Taganen lepingust“ kaudu, võid kasutada tüüpvormi). Tähtaja pidamiseks piisab avalduse ärasaatmisest. Kui soovid teenust alustada enne selle tähtaja lõppu, tasud taganemisel juba osutatud teenuse eest proportsionaalselt ning teenuse täielikul osutamisel taganemisõigus kaob.",
    ] as [string, string],
    withdrawalCompany: ["Taganemisõigus", "Ettevõttest tellijale tarbija taganemisõigus ei kohaldu."] as [string, string],
    fullTerms: "Loe täielikke tingimusi",
    consent1: "Olen tutvunud ja nõustun teenuseosutamise tingimustega. Saan aru, et teenuseosutaja ei ole käibemaksukohustuslane, hinnale käibemaksu ei lisandu, ning et arveldamine toimub ainult pangaülekandega (sularahamakseid ei aktsepteerita).",
    consent2: "Soovin, et teenuse (sh seadme üüri) osutamist alustatakse enne 14-päevase taganemistähtaja lõppu. Saan aru, et teenuse täielikul osutamisel kaotan taganemisõiguse ning taganemisel pärast teenuse alustamist tasun juba osutatud teenuse eest proportsionaalselt.",
    submit: "Saada hinnapäring",
    sendNote: "Avame sinu e-posti programmis valmis kirja. Päring jõuab meieni, kui vajutad seal „Saada“.",
    sendNoteDirect: "Päring jõuab meieni kohe ja saadame sulle koopia (koos üürilepinguga, kui tellisid masina üüri). Vastame e-postiga.",
    sending: "Saadan…",
    sentTitle: "Päring on saadetud",
    sentOk: (email: string) => `Aitäh! Saime sinu päringu kätte. Vastame aadressile ${email}. Leping sõlmitakse, kui kinnitame päringu e-kirjaga.`,
    sentCopy: (email: string) => `Saatsime koopia aadressile ${email}. Kui kirja mõne minuti pärast ei ole, vaata rämpspostikausta.`,
    sentNoCopy: "Koopia saatmine sinu e-postile ei õnnestunud. Salvesta see leht või kopeeri päring.",
    sendFail: "Otse saatmine ei õnnestunud. Avame selle asemel e-posti programmi.",
    clientIntro: (name: string) => `Tere, ${name}!\n\nSaime sinu päringu. See ei ole veel leping: leping sõlmitakse, kui kinnitame päringu e-kirjaga. Allpool on kõik, mille sa saatsid.`,
    clientOutro: (contact: string, origin: string) => `Teenuseosutaja: Squeaky Clean Teenused OÜ, ${contact}.\nTingimused: ${origin}/tingimused\nTarbijal (eraisikul) on õigus lepingust 14 päeva jooksul põhjust avaldamata taganeda. Taganemisvorm ja tüüpvorm: ${origin}/#taganemine\nKaebused: saada samale aadressile või e-postile. Tarbijal on õigus pöörduda Tarbijavaidluste komisjoni poole.`,
    contractHead: "ÜÜRILEPING (koostatud sinu andmetega)",
    errNeed: "Sisesta vajadus (pind, aknad või muu töö), et hind arvutada.",
    errFields: "Palun täida kõik kohustuslikud väljad.",
    errEmail: "Palun sisesta korrektne e-posti aadress.",
    errConsent: "Palun kinnita kõik vajalikud nõusolekud.",
    doneTitle: "Päring on valmis",
    doneText: `Kui e-posti programm ei avanenud, kopeeri päring ja saada see aadressile ${COMPANY.email}.`,
    copy: "Kopeeri päring",
    copied: "Kopeeritud",
    mail: {
      vacuum: "Kliendi tolmuimeja on kasutatav",
      yes: "JAH",
      no: "EI (toome oma, lisatasu kokkuleppel)",
      utilities: "Elekter ning ligipääs soojale ja külmale veele olemas: JAH",
      rent: "Üür",
      rentLine: "Tekstiilipuhastaja üür",
      rentPeriod: "Üüriperiood",
      rentPlace: "Üleandmise ja tagastamise koht ja aeg",
      rentId: "Isikukood",
      rentAddr: "Üürniku aadress",
      rentRep: "Esindaja",
      c3: "Üürilepingu tingimused (tagatisraha puudub, kahju hüvitis kokkuleppel): JAH",
      contractNote: "Üürilepingu täistekst on kliendile kuvatud lehel ja kinnitatud nõustumisega.",
      other: "Muu töö kirjeldus",
      pending: "Hind täpsustatakse pärast kirjeldusega tutvumist",
      subject: "Hinnapäring",
      head: "HINNAPÄRING",
      price: "Orienteeruv hind (käibemaksuta)",
      service: "Vajadus",
      client: "Tellija",
      type: "Tüüp",
      code: "Registrikood",
      email: "E-post",
      phone: "Telefon",
      address: "Aadress",
      city: "Asukoht",
      when: "Soovitud aeg",
      notes: "Lisainfo",
      consents: "Nõustumised",
      c1: "Tingimused, käibemaksuvabadus ja pangaülekanne: JAH",
      c2: "Teenuse alustamine enne taganemistähtaja lõppu: JAH",
      c2na: "Taganemisõigus ei kohaldu (ettevõte)",
    },
  },
  en: {
    title: "Price calculator",
    askPhoto: "Not sure if something can be cleaned? Ask with a photo",
    subtitle: "Enter what you need and see an estimated price right away. Then you can send us your request.",
    s1: "1. What do you need?",
    cleaning: "Type of cleaning",
    cleaningOpts: { none: "None (window washing or extras only)", maintenance: "Maintenance cleaning (light cleaning)", deep: "Deep cleaning" },
    area: "Area (m²)",
    includes: {
      none: "",
      maintenance:
        "Includes: dusting of free surfaces, vacuuming and damp cleaning of floors, cleaning of mirrors, light cleaning of bathroom and WC (sink, toilet), taking out household waste. Only these tasks; everything else (windows, inside cupboards, inside appliances) is extra work. The price applies to homes up to 70 m²; larger areas are charged proportionally.",
      deep: "Includes maintenance cleaning plus deep cleaning of kitchen surfaces (degreasing), limescale and grout cleaning in the bathroom, cleaning of skirting boards, switches and doors, dusting of radiators and pipes. Best possible result given the condition of the surfaces; full removal of ingrained old dirt is not guaranteed. The price applies up to 70 m²; larger areas are charged proportionally.",
    },
    windows: "Window washing",
    windowsHint:
      "The price includes glass, frames and window sills. Old wooden windows need unscrewing and cleaning of four surfaces. For very few windows the minimum call-out fee of 30 € applies.",
    normal: "Standard apartment window, openable (pcs)",
    large: "Large floor-to-ceiling window / balcony door (pcs)",
    old: "Old wooden window, double frames (pcs)",
    other: "Other jobs",
    otherHint: "Select what you need (you may order only these). Priced at 15 €/h; times are estimates.",
    otherDesc: "Describe other work",
    otherDescPh: "e.g. cleaning a greasy oven, dimensions; you can send photos later",
    otherPending: "The price of the described work will be confirmed separately after we review the description.",
    hours: "Extra hours (if you know the exact amount)",
    hoursHint: "For other work, charged at 15 €/h.",
    vacuumQ: "Do you have a working vacuum cleaner we may use?",
    vacuumYes: "Yes, I have a working one",
    vacuumNo: "No",
    vacuumYesNote: "We will use your vacuum cleaner so we do not have to carry our own equipment. We are not liable for its prior defects or wear.",
    vacuumNoFee: (fee: number) => `Floors cannot be cleaned without a vacuum cleaner. We will bring our own for an extra fee of ${fee} €.`,
    vacuumNoPending: "Floors cannot be cleaned without a vacuum cleaner. We will bring our own; the extra fee will be agreed separately.",
    vacuumPending: "The extra fee for bringing a vacuum cleaner will be agreed separately.",
    rentTitle: "Upholstery cleaner rental",
    rentText: `Spot Cleaner Pro machine for cleaning upholstery, carpets and mattresses. No deposit is taken. If anything happens to the machine, we agree on compensation (failing agreement, the repair cost, but not more than the market value of the machine).`,
    rentOn: "I want to rent the upholstery cleaner",
    rentDays: "Number of days",
    rentFrom: "Rental start",
    rentPlace: "Place and time of handover and return",
    rentPlacePh: "e.g. Tartu, by agreement",
    idCode: "Personal ID code",
    rentWho: "Renter",
    renterAddrPerson: "Home address",
    renterAddrCompany: "Company registered address",
    repName: "Representative's name (who receives the machine)",
    rentVat: "Squeaky Clean Teenused OÜ is not VAT-registered. No VAT is added to the rent; the price shown is final.",
    rentWhoHint: "Name, email, phone and, for a company, the registry code are filled in under “2. Your details”.",
    rentPending: "The rental price will be agreed before handover.",
    contractShow: "View the rental agreement (full text)",
    contractNote: "The agreement is generated with the details you entered. Please check it before sending. The agreement is in Estonian; ask us for an English copy if needed.",
    contractCopy: "Copy agreement",
    contractDownload: "Download agreement (.txt)",
    utilities: "I confirm that the site has working electricity and access to hot and cold water. Work cannot be done without them.",
    consent3: "I have read and accept the rental agreement. I understand that no deposit is taken, but if the machine is damaged I will compensate by agreement (failing agreement, the repair cost, but not more than the market value of the machine).",
    timeNote: "Time is an estimate. Actual time depends on the size and condition of the space.",
    resultTitle: "Estimated price",
    empty: "Enter your needs to see the price.",
    total: "Total",
    time: "Estimated time",
    hoursUnit: "h",
    minFee: "The minimum call-out fee of 30 € (2 working hours) has been applied.",
    indicative:
      "The price is an estimate based on the information you entered. It is not a binding offer; the contract is concluded only when we confirm by email. If the property or level of dirt differs significantly from the description, the provider may adjust the price on site or refuse the work.",
    vat: "No VAT: the company is not VAT-registered; VAT is not added to the price.",
    pay: "Payment by bank transfer against an invoice only. Unfortunately, cash payments are not accepted.",
    lines: {
      maintenance: "Maintenance cleaning",
      deep: "Deep cleaning",
      normal: "Standard window",
      large: "Large window / balcony door",
      old: "Old wooden window",
      hours: "Extra work",
      vacuum: "Vacuum cleaner delivery",
      rent: "Upholstery cleaner rental",
    } as Record<string, string>,
    rentUnit: "days",
    units: { m2: "m²", pcs: "pcs", h: "h" },
    s2: "2. Your details",
    clientType: "Customer type",
    person: "Private person",
    company: "Company",
    namePerson: "First and last name",
    nameCompany: "Company name",
    regCode: "Registry code",
    email: "Email",
    phone: "Phone",
    address: "Address of the cleaning site",
    city: "Location",
    cityOpts: ["Tartu city", "Põlva city", "Surrounding area (by agreement)"],
    when: "Preferred time (date and time)",
    whenPh: "e.g. 05.10.2026 at 15:00",
    notes: "Additional info",
    notesPh: "Number of rooms, allergies, special surfaces, requests",
    s3: "3. Important terms",
    legalIntro: "Please read before sending your request.",
    legal: [
      ["Service provider", "__PROVIDER__ Service area: Tartu and Põlva cities and, by agreement, their surroundings. Please send complaints and questions to the address or email above."],
      ["Conclusion of contract", "This calculator and your request are not a binding offer or contract. The contract is concluded when we confirm your request by email. The confirmation will contain the final price, time, terms, and the withdrawal information and standard form. Until confirmation you may cancel your request."],
      ["Price and VAT", "The company is not VAT-registered; VAT is not added to prices. The minimum call-out fee is 30 € (2 working hours). If the level of dirt or the scope differs significantly from the description, we may adjust the price or extend the working time before starting (extra work 15 €/h). We ask for your confirmation of the new price before starting. If you do not agree, you may cancel the work and pay only the minimum call-out fee (30 €). The final price is confirmed before the work starts."],
      ["Payment", "Payment is made against an invoice by bank transfer (payment term generally 7 days). Cash payments are not accepted. Late payment interest is 0.05% per day. The provider may require a prepayment, especially for larger jobs and first orders."],
      ["Customer obligations", "The customer ensures unobstructed access at the agreed time, working electricity, hot and cold water, and the use of a working vacuum cleaner (otherwise we bring our own for an extra fee). Surfaces needing special care (e.g. oiled floors, natural stone) must be reported in advance. Cash, valuables, documents and fragile items must be removed or locked away. We do not move or organise personal belongings."],
      ["Cancellation", "Free cancellation up to 24 h before the start. For later cancellation or no access (waiting time at the door up to 30 min) a 30 € fee applies."],
      ["Liability", "The provider is liable for direct, proven property damage caused during the work as provided by law. Liability does not cover prior wear of surfaces, hidden defects or damage to special materials not disclosed in advance. This does not limit consumer rights under law or our liability for intent and gross negligence."],
      ["Complaints", "Report defects immediately on site or with photos within a reasonable time (business customers within 24 h). We will fix defects free of charge. Consumers may turn to the Consumer Disputes Committee."],
      ["Personal data", "The controller is Squeaky Clean Teenused OÜ. We process your name, contact details and address to prepare the offer and perform the contract. We keep invoice data for the period required by law (generally 7 years) and other data as long as needed to make and defend claims. We use an email service provider that processes data on our behalf. You have the right to access, correct, erase and restrict your data and to complain to the Estonian Data Protection Inspectorate. For quality control we may take before/after photos without capturing personal data."],
    ] as [string, string][],
    withdrawalPerson: [
      "Right of withdrawal (private person)",
      "You have the right to withdraw from a contract concluded at a distance within 14 days without giving a reason. The period starts when the contract is concluded, i.e. on the day of our confirmation. Inform us unambiguously (by email or using the “Withdraw from a contract” form on this site; you may use the standard form). It is enough to send your notice before the period ends. If you ask us to start the service before this period ends, you pay proportionally for the service already provided if you withdraw, and the right of withdrawal is lost once the service has been fully performed.",
    ] as [string, string],
    withdrawalCompany: ["Right of withdrawal", "The consumer right of withdrawal does not apply to business customers."] as [string, string],
    fullTerms: "Read the full terms",
    consent1: "I have read and accept the service terms. I understand that the provider is not VAT-registered, that VAT is not added to the price and that payment is by bank transfer only (cash is not accepted).",
    consent2: "I ask that the service (incl. equipment rental) start before the 14-day withdrawal period ends. I understand that I lose the right of withdrawal once the service is fully performed and that if I withdraw after the service has started I pay proportionally for what has been provided.",
    submit: "Send price request",
    sendNote: "We will open a ready-made email in your mail app. Your request reaches us when you press “Send” there.",
    sendNoteDirect: "Your request reaches us immediately and we send you a copy (with the rental agreement if you ordered a rental). We reply by email.",
    sending: "Sending…",
    sentTitle: "Your request has been sent",
    sentOk: (email: string) => `Thank you! We received your request. We will reply to ${email}. The contract is concluded when we confirm your request by email.`,
    sentCopy: (email: string) => `We sent a copy to ${email}. If it does not arrive in a few minutes, check your spam folder.`,
    sentNoCopy: "Sending a copy to your email did not work. Save this page or copy the request.",
    sendFail: "Direct sending failed. We will open your mail app instead.",
    clientIntro: (name: string) => `Hello, ${name}!\n\nWe received your request. It is not yet a contract: the contract is concluded when we confirm your request by email. Below is everything you sent.`,
    clientOutro: (contact: string, origin: string) => `Service provider: Squeaky Clean Teenused OÜ, ${contact}.\nTerms: ${origin}/tingimused\nA consumer (private person) has the right to withdraw from the contract within 14 days without giving a reason. Withdrawal form and standard form: ${origin}/#taganemine\nComplaints: send to the same address or email. Consumers may turn to the Consumer Disputes Committee.`,
    contractHead: "RENTAL AGREEMENT (generated with your details)",
    errNeed: "Enter what you need (area, windows or other work) to calculate a price.",
    errFields: "Please fill in all required fields.",
    errEmail: "Please enter a valid email address.",
    errConsent: "Please confirm all required consents.",
    doneTitle: "Your request is ready",
    doneText: `If your mail app did not open, copy the request and send it to ${COMPANY.email}.`,
    copy: "Copy request",
    copied: "Copied",
    mail: {
      vacuum: "Customer's vacuum cleaner can be used",
      yes: "YES",
      no: "NO (we bring our own, fee by agreement)",
      utilities: "Electricity and hot and cold water available: YES",
      rent: "Rental",
      rentLine: "Upholstery cleaner rental",
      rentPeriod: "Rental period",
      rentPlace: "Place and time of handover and return",
      rentId: "Personal ID code",
      rentAddr: "Renter's address",
      rentRep: "Representative",
      c3: "Rental agreement terms (no deposit, damage compensation by agreement): YES",
      contractNote: "The full text of the rental agreement was shown to the customer on the page and accepted.",
      other: "Description of other work",
      pending: "Price to be confirmed after reviewing the description",
      subject: "Price request",
      head: "PRICE REQUEST",
      price: "Estimated price (excl. VAT, none charged)",
      service: "Needs",
      client: "Customer",
      type: "Type",
      code: "Registry code",
      email: "Email",
      phone: "Phone",
      address: "Address",
      city: "Location",
      when: "Preferred time",
      notes: "Additional info",
      consents: "Consents",
      c1: "Terms, no VAT and bank transfer only: YES",
      c2: "Start of service before the end of the withdrawal period: YES",
      c2na: "Right of withdrawal not applicable (company)",
    },
  },
} satisfies Record<Lang, unknown>;

const fieldCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function PriceCalculator() {
  const { lang } = useLang();
  const c = COPY[lang];
  const nf = (n: number) => `${n.toLocaleString(lang === "et" ? "et-EE" : "en-GB", { maximumFractionDigits: 1 })}`;
  const eur = (n: number) => `${nf(n)} €`;

  const [cleaning, setCleaning] = useState<Cleaning>("maintenance");
  const [area, setArea] = useState("");
  const [normal, setNormal] = useState("");
  const [large, setLarge] = useState("");
  const [old, setOld] = useState("");
  const [hours, setHours] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [otherDesc, setOtherDesc] = useState("");
  const [vacuum, setVacuum] = useState<"yes" | "no">("yes");
  const [rentOn, setRentOn] = useState(false);
  const [rentDays, setRentDays] = useState("1");
  const [rentFrom, setRentFrom] = useState("");
  const [rentPlace, setRentPlace] = useState("");
  const [idCode, setIdCode] = useState("");
  const [renterAddress, setRenterAddress] = useState("");
  const [repName, setRepName] = useState("");

  const [clientType, setClientType] = useState<"person" | "company">("person");
  const [name, setName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(0);
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [ok1, setOk1] = useState(false);
  const [ok2, setOk2] = useState(false);
  const [ok0, setOk0] = useState(false);
  const [ok3, setOk3] = useState(false);
  const [error, setError] = useState("");
  const [mailText, setMailText] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentCopyOk, setSentCopyOk] = useState(false);

  const isCompany = clientType === "company";

  const noVacuum = cleaning !== "none" && vacuum === "no";
  const days = rentOn ? Math.floor(num(rentDays, RENTAL.maxDays)) : 0;
  const r = useMemo(
    () =>
      calculate({
        cleaning,
        area: num(area, 2000),
        normal: num(normal, 500),
        large: num(large, 500),
        old: num(old, 500),
        hours: num(hours, 100),
        picks,
        vacuumFee: noVacuum && VACUUM_FEE ? VACUUM_FEE : 0,
        rentDays: days,
      }),
    [cleaning, area, normal, large, old, hours, picks, noVacuum, days],
  );
  const vacuumPending = noVacuum && r.hasService && VACUUM_FEE === null;
  const rentPending = rentOn && RENTAL.pricePerDay === null;
  const descPending = otherDesc.trim().length > 0;
  const pending = descPending || vacuumPending || rentPending;
  const canQuote = r.hasItems || descPending || rentOn;
  const needsSite = r.hasService || descPending;
  const contract = useMemo(
    () =>
      buildRentalContract({
        isCompany,
        name,
        code: isCompany ? regCode : idCode,
        address: renterAddress,
        repName,
        phone,
        email,
        days,
        startISO: rentFrom,
        place: rentPlace,
      }),
    [isCompany, name, regCode, idCode, renterAddress, repName, phone, email, days, rentFrom, rentPlace],
  );
  const period = rentalPeriod(rentFrom, days);
  const togglePick = (k: string) => setPicks((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const priceText = r.min === r.max ? eur(r.min) : `${eur(r.min)} – ${eur(r.max)}`;
  const withdrawal = isCompany ? c.withdrawalCompany : c.withdrawalPerson;
  const providerText = `${COMPANY.name}, ${companyContact()}.`;
  const legalItems: [string, string][] = c.legal.map(([h, p]) => [h, p.replace("__PROVIDER__", providerText)]);

  const lineText = (l: Line) => {
    const price = l.min === l.max ? eur(l.min) : `${eur(l.min)} – ${eur(l.max)}`;
    if (l.unit === "task") {
      const t = OTHER_TASKS.find((x) => x.key === l.key);
      const label = t ? t[lang] : l.key;
      return `${label}, ~${nf(l.hMin ?? 0)}–${nf(l.hMax ?? 0)} ${c.units.h}: ${price}`;
    }
    if (l.unit === "fee") return `${c.lines[l.key]}: ${price}`;
    if (l.unit === "rent") return `${c.lines[l.key]}, ${nf(l.qty)} ${c.rentUnit}: ${price}`;
    const unit = l.unit === "m2" ? c.units.m2 : l.unit === "h" ? c.units.h : c.units.pcs;
    return `${c.lines[l.key]}, ${nf(l.qty)} ${unit}: ${price}`;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(false);
    if (!canQuote) return setError(c.errNeed);
    if (!name.trim() || !email.trim() || phone.trim().length < 5 || address.trim().length < 4 || (isCompany && !regCode.trim()))
      return setError(c.errFields);
    if (rentOn && (days < 1 || !rentFrom || !rentPlace.trim() || renterAddress.trim().length < 4 || (isCompany ? repName.trim().length < 3 : !/^\d{11}$/.test(idCode.trim()))))
      return setError(c.errFields);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError(c.errEmail);
    if (!ok1 || (!isCompany && !ok2) || (needsSite && !ok0) || (rentOn && !ok3)) return setError(c.errConsent);
    setError("");

    const m = c.mail;
    const text = [
      m.head,
      "",
      `${m.service}:`,
      ...r.lines.map((l) => `- ${lineText(l)}`),
      ...(descPending ? [`- ${m.other}: ${otherDesc.trim()}`] : []),
      ...(cleaning !== "none" ? [`${m.vacuum}: ${vacuum === "yes" ? m.yes : m.no}`] : []),
      ...(rentOn
        ? [
            "",
            `${m.rent}:`,
            `- ${m.rentLine}, ${days} ${c.rentUnit}`,
            `- ${m.rentPeriod}: ${period.start} – ${period.end}`,
            `- ${m.rentPlace}: ${rentPlace.trim()}`,
            ...(!isCompany ? [`- ${m.rentId}: ${idCode.trim()}`] : [`- ${m.rentRep}: ${repName.trim()}`]),
            `- ${m.rentAddr}: ${renterAddress.trim()}`,
          ]
        : []),
      "",
      `${m.price}: ${r.hasItems ? priceText : m.pending}${r.hasItems && pending ? ` (+ ${m.pending.toLowerCase()})` : ""}`,
      "",
      `${m.client}: ${name.trim()}`,
      `${m.type}: ${isCompany ? c.company : c.person}`,
      ...(isCompany ? [`${m.code}: ${regCode.trim()}`] : []),
      `${m.email}: ${email.trim()}`,
      `${m.phone}: ${phone.trim()}`,
      `${m.address}: ${address.trim()}`,
      `${m.city}: ${c.cityOpts[city]}`,
      `${m.when}: ${when.trim() || "-"}`,
      `${m.notes}: ${notes.trim() || "-"}`,
      "",
      `${m.consents}:`,
      `- ${m.c1}`,
      `- ${isCompany ? m.c2na : m.c2}`,
      ...(needsSite ? [`- ${m.utilities}`] : []),
      ...(rentOn ? [`- ${m.c3}`, `- ${m.contractNote}`] : []),
    ].join("\n");
    setMailText(text);
    setSent(false);
    const subject = `${m.subject}: ${name.trim()}`;
    const openMail = () => {
      window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    };
    if (!canSendDirect()) {
      openMail();
      return;
    }
    const full = rentOn ? `${text}\n\n=== ${c.contractHead} ===\n\n${contract}` : text;
    const clientMessage = `${c.clientIntro(name.trim())}\n\n${full}\n\n---\n${c.clientOutro(companyContact(), window.location.origin)}`;
    setSending(true);
    sendRequest({ subject, message: full, clientEmail: email.trim(), clientName: name.trim(), clientMessage })
      .then((res) => {
        setSentCopyOk(res.copy);
        setSent(true);
      })
      .catch(() => {
        setError(c.sendFail);
        openMail();
      })
      .finally(() => setSending(false));
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const downloadContract = () => {
    const blob = new Blob([contract], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uurileping.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="hinnakalkulaator" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">
          {c.title}
        </h2>
        <p className="mt-2 text-muted-foreground">{c.subtitle}</p>
        <a href="#kusi-nou" className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
          {c.askPhoto}
        </a>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
          {/* 1. VAJADUS + HIND */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card space-y-4 p-6">
              <h3 className="text-lg font-bold">{c.s1}</h3>
              <Field label={c.cleaning}>
                <select className={fieldCls} value={cleaning} onChange={(e) => setCleaning(e.target.value as Cleaning)}>
                  <option value="maintenance">{c.cleaningOpts.maintenance}</option>
                  <option value="deep">{c.cleaningOpts.deep}</option>
                  <option value="none">{c.cleaningOpts.none}</option>
                </select>
              </Field>
              {cleaning !== "none" && (
                <>
                  <Field label={c.area}>
                    <Input inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} placeholder="nt 55" />
                  </Field>
                  <p className="rounded-md border border-border bg-secondary/40 p-3 text-xs text-secondary-foreground">
                    {c.includes[cleaning]}
                  </p>
                  <Field label={c.vacuumQ}>
                    <select className={fieldCls} value={vacuum} onChange={(e) => setVacuum(e.target.value as "yes" | "no")}>
                      <option value="yes">{c.vacuumYes}</option>
                      <option value="no">{c.vacuumNo}</option>
                    </select>
                  </Field>
                  <p className="-mt-2 text-xs text-muted-foreground">
                    {vacuum === "yes" ? c.vacuumYesNote : VACUUM_FEE ? c.vacuumNoFee(VACUUM_FEE) : c.vacuumNoPending}
                  </p>
                </>
              )}
              <p className="pt-2 text-sm font-semibold">{c.windows}</p>
              <p className="-mt-2 text-xs text-muted-foreground">{c.windowsHint}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label={c.normal}>
                  <Input inputMode="numeric" value={normal} onChange={(e) => setNormal(e.target.value)} placeholder="0" />
                </Field>
                <Field label={c.large}>
                  <Input inputMode="numeric" value={large} onChange={(e) => setLarge(e.target.value)} placeholder="0" />
                </Field>
                <Field label={c.old}>
                  <Input inputMode="numeric" value={old} onChange={(e) => setOld(e.target.value)} placeholder="0" />
                </Field>
              </div>
              <p className="pt-2 text-sm font-semibold">{c.other}</p>
              <p className="-mt-2 text-xs text-muted-foreground">{c.otherHint}</p>
              <div className="space-y-2">
                {OTHER_TASKS.map((t) => (
                  <label key={t.key} className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={picks.includes(t.key)}
                      onChange={() => togglePick(t.key)}
                      className="mt-1 size-4 accent-primary"
                    />
                    <span>
                      {t[lang]}{" "}
                      <span className="text-muted-foreground">
                        (~{nf(t.hours[0])}–{nf(t.hours[1])} {c.units.h})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <Field label={c.otherDesc}>
                <textarea
                  rows={2}
                  value={otherDesc}
                  onChange={(e) => setOtherDesc(e.target.value)}
                  maxLength={600}
                  placeholder={c.otherDescPh}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
              <Field label={c.hours} hint={c.hoursHint}>
                <Input inputMode="decimal" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
              </Field>

              <div className="space-y-3 rounded-md border border-border bg-secondary/30 p-4">
                <p className="text-sm font-semibold">{c.rentTitle}</p>
                <p className="text-xs text-muted-foreground">{c.rentText}</p>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={rentOn} onChange={(e) => setRentOn(e.target.checked)} className="mt-1 size-4 accent-primary" />
                  <span>{c.rentOn}</span>
                </label>
                {rentOn && (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={`${c.rentDays} (max ${RENTAL.maxDays})`}>
                        <Input inputMode="numeric" value={rentDays} onChange={(e) => setRentDays(e.target.value)} />
                      </Field>
                      <Field label={c.rentFrom}>
                        <input type="date" className={fieldCls} value={rentFrom} onChange={(e) => setRentFrom(e.target.value)} />
                      </Field>
                    </div>
                    <Field label={c.rentPlace}>
                      <Input value={rentPlace} onChange={(e) => setRentPlace(e.target.value)} placeholder={c.rentPlacePh} maxLength={160} />
                    </Field>
                    <Field label={c.rentWho} hint={c.rentWhoHint}>
                      <select className={fieldCls} value={clientType} onChange={(e) => setClientType(e.target.value as "person" | "company")}>
                        <option value="person">{c.person}</option>
                        <option value="company">{c.company}</option>
                      </select>
                    </Field>
                    {isCompany ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label={c.repName}>
                          <Input value={repName} onChange={(e) => setRepName(e.target.value)} maxLength={120} />
                        </Field>
                        <Field label={c.renterAddrCompany}>
                          <Input value={renterAddress} onChange={(e) => setRenterAddress(e.target.value)} maxLength={200} />
                        </Field>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label={c.idCode}>
                          <Input value={idCode} onChange={(e) => setIdCode(e.target.value.replace(/\D/g, ""))} maxLength={11} inputMode="numeric" />
                        </Field>
                        <Field label={c.renterAddrPerson}>
                          <Input value={renterAddress} onChange={(e) => setRenterAddress(e.target.value)} maxLength={200} />
                        </Field>
                      </div>
                    )}
                    <p className="rounded-md border border-border bg-background p-3 text-xs font-medium">
                      {c.rentVat}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.contractNote}</p>
                    <details className="rounded-md border border-border bg-background p-3 text-xs">
                      <summary className="cursor-pointer font-medium">{c.contractShow}</summary>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-secondary-foreground">{contract}</pre>
                    </details>
                  </div>
                )}
              </div>
            </div>

            <div className="surface-card flex flex-col p-6">
              <h3 className="text-lg font-bold">{c.resultTitle}</h3>
              {r.hasItems ? (
                <>
                  <ul className="mt-4 divide-y divide-border text-sm text-secondary-foreground">
                    {r.lines.map((l) => (
                      <li key={l.key} className="py-1.5">
                        {lineText(l)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 rounded-md bg-ink p-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{c.total}</p>
                    <p className="mt-1 font-display text-3xl font-bold">{priceText}</p>
                    {r.timeMax > 0 && (
                      <p className="mt-1 text-sm text-white/85">
                        {c.time}: {nf(Math.round(r.timeMin * 2) / 2)} – {nf(Math.round(r.timeMax * 2) / 2)} {c.hoursUnit}
                        <span className="block text-xs text-white/65">{c.timeNote}</span>
                      </p>
                    )}
                    {r.minFeeApplied && <p className="mt-2 text-xs text-white/85">{c.minFee}</p>}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">{descPending ? c.otherPending : rentOn ? c.rentPending : c.empty}</p>
              )}
              {(r.hasItems || descPending) && (
                <div className="mt-3 space-y-1 text-xs text-secondary-foreground">
                  {descPending && r.hasItems && <p>{c.otherPending}</p>}
                  {vacuumPending && <p>{c.vacuumPending}</p>}
                  {rentPending && <p>{c.rentPending}</p>}
                </div>
              )}
              {!r.hasItems && rentOn && rentPending && <p className="mt-3 text-xs text-secondary-foreground">{c.rentPending}</p>}
              <div className="mt-5 space-y-2 text-sm">
                <p className="rounded-md border border-border bg-secondary/70 p-3">
                  {c.indicative}
                </p>
                <p className="rounded-md border border-border bg-secondary/70 p-3 font-medium">
                  {c.vat}
                </p>
                <p className="rounded-md border border-border bg-secondary/70 p-3 font-medium">
                  {c.pay}
                </p>
              </div>
            </div>
          </div>

          {/* 2. ANDMED */}
          <div className="surface-card space-y-4 p-6">
            <h3 className="text-lg font-bold">{c.s2}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={c.clientType}>
                <select className={fieldCls} value={clientType} onChange={(e) => setClientType(e.target.value as "person" | "company")}>
                  <option value="person">{c.person}</option>
                  <option value="company">{c.company}</option>
                </select>
              </Field>
              <Field label={isCompany ? c.nameCompany : c.namePerson}>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
              </Field>
              {isCompany && (
                <Field label={c.regCode}>
                  <Input value={regCode} onChange={(e) => setRegCode(e.target.value)} maxLength={40} />
                </Field>
              )}
              <Field label={c.email}>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
              </Field>
              <Field label={c.phone}>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
              </Field>
              <Field label={c.address}>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
              </Field>
              <Field label={c.city}>
                <select className={fieldCls} value={city} onChange={(e) => setCity(Number(e.target.value))}>
                  {c.cityOpts.map((o, i) => (
                    <option key={o} value={i}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={c.when}>
                <Input value={when} onChange={(e) => setWhen(e.target.value)} placeholder={c.whenPh} maxLength={80} />
              </Field>
            </div>
            <Field label={c.notes}>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                placeholder={c.notesPh}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
          </div>

          {/* 3. TINGIMUSED */}
          <div className="surface-card space-y-4 p-6">
            <h3 className="text-lg font-bold">{c.s3}</h3>
            <p className="text-sm text-muted-foreground">{c.legalIntro}</p>
            <dl className="grid gap-3 text-sm md:grid-cols-2">
              {[...legalItems.slice(0, 6), withdrawal, ...legalItems.slice(6)].map(([h, p]) => (
                <div key={h} className="rounded-md border border-border bg-secondary/40 p-3">
                  <dt className="font-semibold">{h}</dt>
                  <dd className="mt-1 text-secondary-foreground">{p}</dd>
                </div>
              ))}
            </dl>
            <Link to="/tingimused" target="_blank" className="inline-block text-sm font-medium text-primary hover:underline">
              {c.fullTerms}
            </Link>

            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={ok1} onChange={(e) => setOk1(e.target.checked)} className="mt-1 size-4 accent-primary" />
              <span>{c.consent1}</span>
            </label>
            {needsSite && (
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={ok0} onChange={(e) => setOk0(e.target.checked)} className="mt-1 size-4 accent-primary" />
                <span>{c.utilities}</span>
              </label>
            )}
            {rentOn && (
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={ok3} onChange={(e) => setOk3(e.target.checked)} className="mt-1 size-4 accent-primary" />
                <span>{c.consent3}</span>
              </label>
            )}
            {!isCompany && (
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={ok2} onChange={(e) => setOk2(e.target.checked)} className="mt-1 size-4 accent-primary" />
                <span>{c.consent2}</span>
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="px-6" disabled={sending}>
              {sending ? c.sending : c.submit}
            </Button>
            <p className="text-xs text-muted-foreground">{canSendDirect() ? c.sendNoteDirect : c.sendNote}</p>
            {sent && (
              <div className="rounded-md border border-border bg-primary-soft/60 p-4 text-sm">
                <p className="font-semibold">{c.sentTitle}</p>
                <p className="mt-1 text-secondary-foreground">{c.sentOk(email.trim())}</p>
                <p className="mt-1 text-secondary-foreground">{sentCopyOk ? c.sentCopy(email.trim()) : c.sentNoCopy}</p>
              </div>
            )}
            {mailText && !sent && !error && !sending && (
              <div className="rounded-md border border-border bg-primary-soft/60 p-4 text-sm">
                <p className="font-semibold">{c.doneTitle}</p>
                <p className="mt-1 text-secondary-foreground">{c.doneText}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => copyText(mailText)}>
                    {copied ? c.copied : c.copy}
                  </Button>
                  {rentOn && (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={() => copyText(contract)}>
                        {c.contractCopy}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={downloadContract}>
                        {c.contractDownload}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
