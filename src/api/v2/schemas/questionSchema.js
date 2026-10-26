
import { z } from "zod";
import {
  positiveIdSchema,
  numericInputSchema,
} from "../../../schemas/idSchema.js";

export const idParamSchema = z.object({
  id: positiveIdSchema,
});

const questionFields = {
  enunciado: z.string().trim().min(3).max(500),
  dificuldade: numericInputSchema.pipe(
    z.coerce.number().int().min(1).max(3),
  ),
  respostaCorreta: z.union([
    z.string().trim().min(1).max(500),
    z.null(),
  ]),
  subjectId: positiveIdSchema,
  authorId: positiveIdSchema,
  ativa: z.boolean(),
};

export const createQuestionSchema = z.object({
  enunciado: questionFields.enunciado,
  dificuldade: questionFields.dificuldade,
  respostaCorreta: questionFields.respostaCorreta.optional(),
  subjectId: questionFields.subjectId,
  authorId: questionFields.authorId,
  ativa: questionFields.ativa.optional(),
}).strict();

export const updateQuestionSchema = z.object({
  enunciado: questionFields.enunciado.optional(),
  dificuldade: questionFields.dificuldade.optional(),
  respostaCorreta: questionFields.respostaCorreta.optional(),
  subjectId: questionFields.subjectId.optional(),
  authorId: questionFields.authorId.optional(),
  ativa: questionFields.ativa.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Envie pelo menos um campo para atualização",
});
