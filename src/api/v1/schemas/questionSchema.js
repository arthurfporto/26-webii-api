import { z } from "zod";
import { positiveIdSchema, numericInputSchema } from "../../../schemas/idSchema.js";

/** Schema reutilizável para IDs de parâmetros de questões. */
export const idParamSchema = z.object({
  id: positiveIdSchema,
});

const questionFields = {
  enunciado: z
    .string()
    .trim()
    .min(3, "Enunciado deve ter pelo menos 3 caracteres")
    .max(500, "Enunciado deve ter no máximo 500 caracteres"),
  dificuldade: numericInputSchema.pipe(
    z.coerce
      .number()
      .int("Dificuldade deve ser inteira")
      .min(1, "Dificuldade deve estar entre 1 e 3")
      .max(3, "Dificuldade deve estar entre 1 e 3"),
  ),
  respostaCorreta: z.union([
    z
      .string()
      .trim()
      .min(1, "Resposta correta não pode ser vazia")
      .max(500, "Resposta correta deve ter no máximo 500 caracteres"),
    z.null(),
  ]),
  subjectId: positiveIdSchema,
  authorId: positiveIdSchema,
  ativa: z.boolean(),
};

/** Schema para POST /questions. */
export const createQuestionSchema = z
  .object({
    enunciado: questionFields.enunciado,
    dificuldade: questionFields.dificuldade,
    respostaCorreta: questionFields.respostaCorreta.optional(),
    subjectId: questionFields.subjectId,
    authorId: questionFields.authorId,
    ativa: questionFields.ativa.optional(),
  })
  .strict();

/** Schema para PATCH /questions/:id. */
export const updateQuestionSchema = z
  .object({
    enunciado: questionFields.enunciado.optional(),
    dificuldade: questionFields.dificuldade.optional(),
    respostaCorreta: questionFields.respostaCorreta.optional(),
    subjectId: questionFields.subjectId.optional(),
    authorId: questionFields.authorId.optional(),
    ativa: questionFields.ativa.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie pelo menos um campo para atualização",
  });
