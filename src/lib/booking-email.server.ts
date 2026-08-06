// Server-only helper that turns a booking into the two notification emails.
// Wired to the managed email sender once the sender domain is verified.
export type BookingPayload = {
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
  lang: "et" | "en";
};

export const COMPANY_EMAIL = "squeakycleanteenused@gmail.com";

export async function sendBookingEmails(booking: BookingPayload) {
  console.log("[booking] notification pending", {
    to: COMPANY_EMAIL,
    client: booking.email,
    service: booking.service,
    date: booking.date,
    time: booking.time,
  });
  return { sent: false as const, reason: "email_domain_not_configured" as const };
}
