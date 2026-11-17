import type { Lang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";

/* E-poe ootelisti kinnituskirja kindel tekst (et/en). Lehel on ainult need kaks keelt. */

export const CONFIRM_HOURS = 48;

export function confirmSubject(lang: Lang) {
  return lang === "et"
    ? "Kinnita e-poe avamise teavitus"
    : "Confirm your shop opening notification";
}

export function confirmText(
  lang: Lang,
  confirmUrl: string,
  unsubscribeUrl: string,
  privacyUrl: string,
) {
  if (lang === "et") {
    return `Tere!

Keegi (loodetavasti sina) soovis teavitust, kui ${RENTAL_COMPANY.name} e-pood avaneb. Kinnita oma soov sellel lingil:

${confirmUrl}

Link kehtib ${CONFIRM_HOURS} tundi. Kui sa seda ei soovinud, ära tee midagi: kinnitamata aadress kustutatakse automaatselt.

Andmekaitse: kasutame sinu e-posti aadressi ainult e-poe avamise teavituseks ja kustutame selle pärast teavituse saatmist või kohe, kui seda soovid.

Registreeringust loobumiseks ja aadressi kustutamiseks ava see link:
${unsubscribeUrl}
(või kirjuta ${RENTAL_COMPANY.email})

Privaatsuspoliitika: ${privacyUrl}

${RENTAL_COMPANY.name}`;
  }
  return `Hello!

Someone (hopefully you) asked to be notified when the ${RENTAL_COMPANY.name} shop opens. Please confirm your request using this link:

${confirmUrl}

The link is valid for ${CONFIRM_HOURS} hours. If you did not ask for this, do nothing: an unconfirmed address is deleted automatically.

Data protection: we use your email address only to notify you when the shop opens, and delete it after the notification is sent or as soon as you ask.

To cancel the sign-up and delete your address, open this link:
${unsubscribeUrl}
(or write to ${RENTAL_COMPANY.email})

Privacy policy: ${privacyUrl}

${RENTAL_COMPANY.name}`;
}

export function ownerNotificationText(email: string, lang: string, at: string) {
  return `Palun teavita e-poe avamisest: ${email}\nKeel: ${lang}\nAeg: ${at}\nKinnitatud: jah (topeltkinnitus)\n\nNõusolek: ainult e-poe avamise teavitus. Kustuta aadress pärast teavituse saatmist või kui inimene seda palub.`;
}
