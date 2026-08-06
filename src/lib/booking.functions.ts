import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bookingSchema = z.object({
  service: z.string().min(1).max(80),
  clientType: z.string().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(4).max(40),
  billingAddress: z.string().trim().min(4).max(200),
  objectAddress: z.string().trim().min(4).max(200),
  city: z.string().min(1).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(5).max(40),
  date: z.string().min(1).max(40),
  time: z.string().min(1).max(40),
  extra: z.string().max(2000).optional().default(""),
  consentTerms: z.boolean(),
  consentWithdrawal: z.boolean(),
  lang: z.enum(["et", "en"]).optional().default("et"),
});

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    if (!data.consentTerms || !data.consentWithdrawal) {
      throw new Error("Consents are required");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").insert({
      service: data.service,
      client_type: data.clientType,
      name: data.name,
      code: data.code,
      billing_address: data.billingAddress,
      object_address: data.objectAddress,
      city: data.city,
      email: data.email,
      phone: data.phone,
      booking_date: data.date,
      time_slot: data.time,
      extra: data.extra,
      consent_terms: data.consentTerms,
      consent_withdrawal: data.consentWithdrawal,
    });
    if (error) {
      console.error("[booking] insert failed", error.message);
      throw new Error("Booking could not be saved");
    }

    const { sendBookingEmails } = await import("@/lib/booking-email.server");
    const emails = await sendBookingEmails(data);

    return { ok: true as const, emails };
  });

const newsletterSchema = z.object({
  email: z.string().trim().email().max(160),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => newsletterSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert({ email: data.email.toLowerCase() }, { onConflict: "email" });
    if (error) {
      console.error("[newsletter] insert failed", error.message);
      throw new Error("Subscription failed");
    }
    return { ok: true as const };
  });
