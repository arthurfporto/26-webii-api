
import { z } from "zod";
import { positiveIdSchema } from "../../../schemas/idSchema.js";

export const idParamSchema = z.object({
  id: positiveIdSchema,
});

export const createSubjectSchema = z.object({
  nome: z.string().trim().min(3).max(100),
  professorId: positiveIdSchema,
  ativa: z.boolean().optional(),
}).strict();

export const updateSubjectSchema = z.object({
  nome: z.string().trim().min(3).max(100).optional(),
  professorId: positiveIdSchema.optional(),
  ativa: z.boolean().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Envie pelo menos um campo para atualização",
});
