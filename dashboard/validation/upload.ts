import { z } from "zod";

export const uploadedDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  uri: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  kind: z.enum(["image", "pdf", "other"]),
  file: z.any().optional(),
});

export type UploadedDocument = z.infer<typeof uploadedDocumentSchema>;
