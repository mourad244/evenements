import { z } from "zod";

const mediaReferenceSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().max(2048).refine((value) => value.startsWith("/"), {
  message: "Image reference must be a public path that starts with /."
}).optional());

export const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  city: z.string().min(2),
  venue: z.string().min(2),
  startAt: z.string().min(1),
  endAt: z.string().optional(),
  price: z.coerce.number().min(0),
  currency: z.string().default("MAD"),
  capacity: z.coerce.number().int().positive(),
  theme: z.string().min(2),
  imageUrl: mediaReferenceSchema
});

export type EventSchema = z.infer<typeof eventSchema>;
