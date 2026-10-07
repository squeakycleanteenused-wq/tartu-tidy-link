import type { Lang } from "@/lib/i18n";
import { RENTAL_COMPANY, companyContact } from "@/lib/rental-contract";
import { SITE_URL } from "@/lib/site";

/* Kliendile saadetavate kirjade kindlad tekstid. Server paneb kliendi koopia kokku ainult nendest
   ja sama sisuga, mis läks ettevõtte postkasti, et vormi kaudu ei saaks saata suvalist teksti. */

export type MailKind = "request" | "withdrawal";

const outro = (lang: Lang) =>
  lang === "et"
    ? `Teenuseosutaja: ${RENTAL_COMPANY.name}, ${companyContact("et")}.\nTingimused: ${SITE_URL}/tingimused\nPrivaatsuspoliitika: ${SITE_URL}/privaatsus\nTarbijal (eraisikul) on õigus lepingust 14 päeva jooksul põhjust avaldamata taganeda: lehe ülamenüüs „Taganen lepingust“ (${SITE_URL}/#taganemine), seal on ka tüüpvorm.\nKaebused: saada samale aadressile või e-postile. Tarbijal on õigus pöörduda Tarbijavaidluste komisjoni poole.`
    : `Service provider: ${RENTAL_COMPANY.name}, ${companyContact("en")}.\nTerms: ${SITE_URL}/tingimused\nPrivacy policy: ${SITE_URL}/privaatsus\nA consumer (private person) has the right to withdraw from the contract within 14 days without giving a reason: “Withdraw from a contract” in the top menu (${SITE_URL}/#taganemine), the standard form is there too.\nComplaints: send to the same address or email. Consumers may turn to the Consumer Disputes Committee.`;

export function clientCopySubject(kind: MailKind, lang: Lang) {
  if (kind === "withdrawal") return lang === "et" ? "Taganemisavalduse kättesaamise kinnitus" : "Confirmation of receipt of your withdrawal notice";
  return lang === "et" ? "Saime sinu hinnapäringu" : "We received your price request";
}

export function clientCopyText(kind: MailKind, lang: Lang, name: string, body: string, receivedAt: string) {
  const et = lang === "et";
  if (kind === "withdrawal") {
    return et
      ? `Tere, ${name}!\n\nKinnitame, et saime sinu taganemisavalduse kätte ${receivedAt}.\n\nAvalduse sisu:\n${body}\n\nTagastame sinu tasutu viivitamata, kuid hiljemalt 14 päeva jooksul avalduse kättesaamisest (arvestades juba osutatud teenuse proportsionaalset tasu, kui teenus on alanud sinu soovil). Üüri puhul tagasta masin viivitamata, kuid mitte hiljem kui 14 päeva jooksul avalduse tegemisest; tagastamise otsesed kulud kannad sina.\n\n---\n${outro(lang)}`
      : `Hello, ${name}!\n\nWe confirm that we received your withdrawal notice on ${receivedAt}.\n\nContent of the notice:\n${body}\n\nWe will refund what you paid without delay and no later than 14 days after receiving your notice (taking into account proportional payment for the service already provided, if it started at your request). For a rental, return the machine without delay and no later than 14 days after your notice; you bear the direct costs of returning it.\n\n---\n${outro(lang)}`;
  }
  return et
    ? `Tere, ${name}!\n\nSaime sinu päringu kätte ${receivedAt}. See ei ole veel leping ega too kaasa maksekohustust. Saadame sulle pakkumise kindla hinnaga ja leping sõlmitakse, kui sa selle e-kirjaga kinnitad. Allpool on kõik, mille sa saatsid.\n\n${body}\n\n---\n${outro(lang)}`
    : `Hello, ${name}!\n\nWe received your request on ${receivedAt}. It is not yet a contract and creates no obligation to pay. We will send you an offer with a fixed price, and the contract is concluded when you confirm it by email. Below is everything you sent.\n\n${body}\n\n---\n${outro(lang)}`;
}
