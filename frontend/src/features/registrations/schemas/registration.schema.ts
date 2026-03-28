import { z } from "zod";

export const registrationSchema = z.object({
  eventId: z.string().min(1)
});
