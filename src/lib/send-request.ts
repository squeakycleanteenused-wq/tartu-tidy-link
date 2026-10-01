import { useEffect, useState } from "react";
import { mailStatus, sendSiteMail } from "@/lib/mail.functions";
import type { MailKind } from "@/lib/mail-texts";
import type { Lang } from "@/lib/i18n";

/* Saadab päringu või taganemisavalduse serveri kaudu (MailerSend) sinu postkasti ja kliendile
   koopia/kinnituse. Kui saatmine pole Vercelis seadistatud, tagastab { sent: false } ja vorm
   avab kliendi e-posti programmi (mailto). */

export type SendParams = {
  kind: MailKind;
  lang: Lang;
  subject: string;
  message: string;
  clientEmail: string;
  clientName: string;
};

export function sendRequest(p: SendParams) {
  return sendSiteMail({ data: p });
}

/** Kas otse saatmine on seadistatud (päritakse serverilt üks kord). */
export function useDirectMail() {
  const [configured, setConfigured] = useState(false);
  useEffect(() => {
    let alive = true;
    mailStatus()
      .then((r) => alive && setConfigured(r.configured))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return configured;
}
