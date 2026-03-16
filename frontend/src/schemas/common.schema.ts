import { z } from "zod";

export const idSchema = z.string().min(1);
export const isoDateSchema = z.string().datetime().or(z.string().min(1));
export const currencySchema = z.string().default("MAD");
