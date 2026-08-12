import { z } from "zod";

import { validateWebsiteUrl } from "@/lib/security/url";

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    // strip control characters — stored evidence must stay clean
    // eslint-disable-next-line no-control-regex
    .transform((value) => value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " "));

export const businessInputSchema = z.object({
  name: safeText(120),
  website: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => validateWebsiteUrl(value).ok, {
      message: "Enter a public website address, for example example.com",
    })
    .transform((value) => {
      const result = validateWebsiteUrl(value);
      return result.ok ? result.url : value;
    }),
  category: safeText(80),
  city: safeText(80),
  state: safeText(40),
  primaryServices: z.array(safeText(80)).min(1).max(10),
  aliases: z.array(safeText(80)).max(10).optional().default([]),
  phone: z.string().trim().max(40).optional().default(""),
});

export type BusinessInput = z.infer<typeof businessInputSchema>;

export const businessIdSchema = z.object({ businessId: z.string().uuid() });
export const scanIdSchema = z.object({ scanId: z.string().uuid() });

export const createScanSchema = z.object({
  businessId: z.string().uuid(),
  scanType: z.enum(["standard"]).default("standard"),
});
