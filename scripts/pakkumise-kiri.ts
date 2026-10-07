/* Pakkumise e-kirja põhi koos täielike tingimustega (VÕS § 55: tingimused püsival andmekandjal).
   Tingimused võetakse failist src/lib/legal.ts, seega on põhi alati lehega kooskõlas.
   Genereeri uuesti pärast tingimuste muutmist:
     npx bun scripts/pakkumise-kiri.ts > docs/pakkumise-kiri.txt */
import { RENTAL_COMPANY, companyContact } from "../src/lib/rental-contract";
import { TERMS_VALID_FROM, legalTerms } from "../src/lib/legal";
import { SITE_URL } from "../src/lib/site";

const c = RENTAL_COMPANY;
const terms = legalTerms("et", false)
  .map(([h, p], i) => `${i + 1}. ${h}\n${p}`)
  .join("\n\n");

const template = `TEEMA: Pakkumine: [TEENUS], [KUUPÄEV]

Tere, [NIMI]!

Aitäh päringu eest. Saadame sulle pakkumise:

Teenus: [TEENUS, nt hoolduskoristus 55 m², 4 tavalist akent]
Objekti aadress: [AADRESS]
Aeg: [KUUPÄEV] kell [KELLAAEG], orienteeruv kestus [X] h
Hind: [SUMMA] € (kindel hind; käibemaksu ei lisandu, ettevõte ei ole käibemaksukohustuslane)
[Ettemaks: ... – kustuta rida, kui ettemaksu pole]
Maksmine: arve alusel pangaülekandega pärast tööd, maksetähtaeg 7 päeva. Sularahas maksta ei saa.

Leping sõlmitakse, kui vastad sellele kirjale ja kinnitad pakkumise (nt „Kinnitan pakkumise“).
Kuni kinnitamiseni ei ole sul mingeid kohustusi. Pakkumine kehtib [X] päeva.

Kui oled eraisik ja soovid, et alustaksime tööga enne 14-päevase taganemistähtaja lõppu,
kirjuta kinnitusse ka: „Soovin teenuse osutamist enne taganemistähtaja lõppu ja olen teadlik,
et teenuse täielikul osutamisel kaotan taganemisõiguse.“

Lugupidamisega
${c.name}
${companyContact()}

======================================================================
TEENUSEOSUTAMISE TINGIMUSED (kehtivad alates ${TERMS_VALID_FROM.et})
Need tingimused on osa lepingust. Salvesta see kiri.
Veebis: ${SITE_URL}/tingimused · Privaatsuspoliitika: ${SITE_URL}/privaatsus
======================================================================

${terms}

Ettevõttest tellijale tarbija taganemisõigus ei kohaldu.

======================================================================
TAGANEMISAVALDUSE TÜÜPVORM
(Täitke ja saatke see vorm ainult juhul, kui soovite lepingust taganeda.
Taganeda saab ka veebilehe ülamenüüs nupuga „Taganen lepingust“: ${SITE_URL}/#taganemine)
======================================================================

Kellele: ${c.name}, ${companyContact()}
Mina/meie (*) teatan/teatame (*) käesolevaga, et taganen/taganeme (*) minu/meie (*) sõlmitud lepingust, mille ese on järgmise teenuse osutamine / kauba müük (*): ……………………
Tellitud (*)/kätte saadud (*) (kuupäev): ……………………
Tarbija(te) nimi: ……………………
Tarbija(te) aadress: ……………………
Tarbija(te) allkiri (ainult juhul, kui vorm esitatakse paberil): ……………………
Kuupäev: ……………………
(*) Mittevajalik maha kriipsutada.
`;

console.log(template);
