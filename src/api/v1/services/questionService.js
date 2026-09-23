import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../errors/AppError.js";

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  foto: true,
};

const publicSubjectSelect = { id: true, nome: true, ativa: true };

const publicQuestionSelect = {
  id: true,
  enunciado: true,
  dificuldade: true,
  respostaCorreta: true,
  ativa: true,
  createdAt: true,
  updatedAt: true,
  subject: { select: publicSubjectSelect },
  author: { select: publicUserSelect },
};

/**
 * Confere as relações informadas na criação ou atualização de uma questão.
 * @param {{subjectId?: number, authorId?: number}} data - Relações já validadas.
 * @returns {Promise<void>} Conclui quando as relações existem.
 * @throws {NotFoundError} Quando matéria ou autor não existem.
 */
async function assertRelations(data) {
  if (data.subjectId !== undefined) {
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundError(
        `Matéria com ID ${data.subjectId} não encontrada`,
      );
    }
  }

  if (data.authorId !== undefined) {
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
      select: { id: true },
    });

    if (!author) {
      throw new NotFoundError(`Autor com ID ${data.authorId} não encontrado`);
    }
  }
}

/**
 * Busca questões públicas ordenadas da mais recente para a mais antiga.
 * @returns {Promise<object[]>} Questões públicas.
 */
export function getAllQuestions() {
  return prisma.question.findMany({
    select: publicQuestionSelect,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Busca uma questão existente.
 * @param {number} questionId - ID da questão.
 * @returns {Promise<object>} Questão encontrada.
 * @throws {NotFoundError} Quando a questão não existe.
 */
export async function getQuestionById(questionId) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: publicQuestionSelect,
  });

  if (!question) {
    throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
  }

  return question;
}

/**
 * Cria uma questão para uma matéria e um autor existentes.
 * @param {{enunciado: string, dificuldade: number, respostaCorreta?: string|null, subjectId: number, authorId: number, ativa?: boolean}} data - Dados parseados pelo Zod.
 * @returns {Promise<object>} Questão criada.
 */
export async function createQuestion(data) {
  await assertRelations(data);

  return prisma.question.create({
    data: { ...data, ativa: data.ativa ?? true },
    select: publicQuestionSelect,
  });
}

/**
 * Atualiza uma questão e confere relações eventualmente enviadas.
 * @param {number} questionId - ID da questão.
 * @param {object} data - Dados parciais validados.
 * @returns {Promise<object>} Questão atualizada.
 * @throws {NotFoundError} Quando questão, matéria ou autor não existem.
 */
export async function updateQuestion(questionId, data) {
  await getQuestionById(questionId);
  await assertRelations(data);

  return prisma.question.update({
    where: { id: questionId },
    data,
    select: publicQuestionSelect,
  });
}

/**
 * Remove uma questão existente.
 * @param {number} questionId - ID da questão.
 * @returns {Promise<object>} Questão removida.
 * @throws {NotFoundError} Quando a questão não existe.
 */
export async function deleteQuestion(questionId) {
  await getQuestionById(questionId);

  try {
    return await prisma.question.delete({
      where: { id: questionId },
      select: publicQuestionSelect,
    });
  } catch (error) {
    if (error?.code === "P2025") {
      throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
    }

    throw error;
  }
}
