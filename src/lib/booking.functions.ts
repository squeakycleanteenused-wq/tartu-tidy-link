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
});

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    // Notification target for the cleaning company.
    console.log("[booking] new request", {
      service: data.service,
      city: data.city,
      date: data.date,
      time: data.time,
    });
    return { ok: true as const };
  });

const orderSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(5).max(40),
  delivery: z.string().min(1).max(80),
  items: z
    .array(z.object({ id: z.string().max(60), qty: z.number().int().min(1).max(99) }))
    .min(1)
    .max(50),
});

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    console.log("[shop] new order", { delivery: data.delivery, items: data.items.length });
    return { ok: true as const };
  });