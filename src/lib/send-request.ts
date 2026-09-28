import { COMPANY_EMAIL, emailjsConfig, isEmailjsConfigured } from "@/lib/emailjs";

/* Saadab päringu (koos valmis üürilepinguga) otse sinu postkasti ja kliendile koopia.
   Töötab siis, kui Vercelis on määratud 4 muutujat (vt juhend):
   VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID_COMPANY,
   VITE_EMAILJS_TEMPLATE_ID_CLIENT, VITE_EMAILJS_PUBLIC_KEY.
   Kui neid pole, kasutavad vormid vana e-posti programmi (mailto) lahendust. */

export const canSendDirect = () => isEmailjsConfigured();

export type SendParams = {
  subject: string;
  message: string; // sinu postkasti
  clientEmail: string;
  clientName: string;
  clientMessage: string; // kliendi koopia
};

/** Tagastab { copy }: kas kliendile koopia ka õnnestus. Viskab vea, kui sinu kiri ei läinud. */
export async function sendRequest(p: SendParams): Promise<{ copy: boolean }> {
  const emailjs = (await import("@emailjs/browser")).default;
  const opts = { publicKey: emailjsConfig.publicKey };

  await emailjs.send(
    emailjsConfig.serviceId,
    emailjsConfig.templateIdCompany,
    {
      to_email: COMPANY_EMAIL,
      reply_to: p.clientEmail,
      subject: p.subject,
      message: p.message,
      client_name: p.clientName,
      client_email: p.clientEmail,
    },
    opts,
  );

  let copy = false;
  if (emailjsConfig.templateIdClient) {
    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateIdClient,
        {
          to_email: p.clientEmail,
          reply_to: COMPANY_EMAIL,
          subject: p.subject,
          message: p.clientMessage,
          client_name: p.clientName,
        },
        opts,
      );
      copy = true;
    } catch {
      copy = false;
    }
  }
  return { copy };
}
