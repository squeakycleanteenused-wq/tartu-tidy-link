// EmailJS configuration (frontend-only email sending — no backend required).
//
// Fill these in with your own EmailJS values, or set them in .env as
// VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID_COMPANY /
// VITE_EMAILJS_TEMPLATE_ID_CLIENT / VITE_EMAILJS_PUBLIC_KEY.
// These values are publishable by design (EmailJS public key is safe in the browser).
export const emailjsConfig = {
  serviceId: import.meta.env['VITE_EMAILJS_SERVICE_ID'] ?? "",
  templateIdCompany: import.meta.env['VITE_EMAILJS_TEMPLATE_ID_COMPANY'] ?? "",
  templateIdClient: import.meta.env['VITE_EMAILJS_TEMPLATE_ID_CLIENT'] ?? "",
  publicKey: import.meta.env['VITE_EMAILJS_PUBLIC_KEY'] ?? "",
};

export const COMPANY_EMAIL = "squeakycleanteenused@gmail.com";

export const isEmailjsConfigured = () =>
  Boolean(emailjsConfig.serviceId && emailjsConfig.templateIdCompany && emailjsConfig.publicKey);

export type BookingEmailParams = {
  service: string;
  clientType: string;
  name: string;
  code: string;
  billingAddress: string;
  objectAddress: string;
  city: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  extra: string;
  consentTerms: boolean;
  consentWithdrawal: boolean;
};

/**
 * Sends the booking notification to the company and a confirmation to the client.
 * Returns false (without throwing) when EmailJS is not configured yet.
 */
export async function sendBookingEmails(params: BookingEmailParams): Promise<boolean> {
  if (!isEmailjsConfigured()) {
    console.warn("[emailjs] not configured — skipping email send");
    return false;
  }

  const emailjs = (await import("@emailjs/browser")).default;

  const templateParams = {
    to_email: COMPANY_EMAIL,
    company_email: COMPANY_EMAIL,
    reply_to: params.email,
    service: params.service,
    client_type: params.clientType,
    name: params.name,
    code: params.code,
    billing_address: params.billingAddress,
    object_address: params.objectAddress,
    city: params.city,
    email: params.email,
    phone: params.phone,
    date: params.date,
    time: params.time,
    extra: params.extra || "-",
    consent_terms: params.consentTerms ? "Jah" : "Ei",
    consent_withdrawal: params.consentWithdrawal ? "Jah" : "Ei",
  };

  await emailjs.send(
    emailjsConfig.serviceId,
    emailjsConfig.templateIdCompany,
    templateParams,
    { publicKey: emailjsConfig.publicKey },
  );

  if (emailjsConfig.templateIdClient) {
    await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateIdClient,
      { ...templateParams, to_email: params.email },
      { publicKey: emailjsConfig.publicKey },
    );
  }

  return true;
}
