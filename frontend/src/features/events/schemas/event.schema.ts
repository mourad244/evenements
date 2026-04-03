import { z } from "zod";

export const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    venue: z.string().min(2, "Venue must be at least 2 characters"),
    startAt: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => !Number.isNaN(Date.parse(val)), "Start date must be a valid date"),
    endAt: z
      .string()
      .optional()
      .refine(
        (val) => !val || !Number.isNaN(Date.parse(val)),
        "End date must be a valid date"
      ),
    price: z.coerce.number().min(0, "Price must be 0 or greater"),
    currency: z.string().min(1, "Currency is required").default("MAD"),
    capacity: z.coerce
      .number()
      .int("Capacity must be a whole number")
      .positive("Capacity must be greater than 0"),
    theme: z.string().min(2, "Theme must be at least 2 characters")
  })
  .refine(
    (data) => {
      if (!data.endAt) return true;
      return Date.parse(data.endAt) > Date.parse(data.startAt);
    },
    { message: "End date must be after start date", path: ["endAt"] }
  );

export type EventSchema = z.infer<typeof eventSchema>;
