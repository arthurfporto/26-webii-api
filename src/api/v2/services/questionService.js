
import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../errors/AppError.js";

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  foto: true,
};

const publicSubjectSelect = {
  id: true,
  nome: true,
  ativa: true,
};

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

export function getAllQuestions() {
  return prisma.question.findMany({
    select: publicQuestionSelect,
    orderBy: { createdAt: "desc" },
  });
}

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

export async function createQuestion(data) {
  await assertRelations(data);

  return prisma.question.create({
    data: { ...data, ativa: data.ativa ?? true },
    select: publicQuestionSelect,
  });
}

export async function updateQuestion(questionId, data) {
  await getQuestionById(questionId);
  await assertRelations(data);

  return prisma.question.update({
    where: { id: questionId },
    data,
    select: publicQuestionSelect,
  });
}

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
