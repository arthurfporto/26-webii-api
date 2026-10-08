import prisma from "../../../config/database.js";
import { ConflictError, NotFoundError } from "../../../errors/AppError.js";

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
  createdAt: true,
  updatedAt: true,
  professor: { select: publicUserSelect },
};

/**
 * Busca matérias públicas ordenadas da mais recente para a mais antiga.
 * @returns {Promise<object[]>} Matérias públicas.
 */
export function getAllSubjects() {
  return prisma.subject.findMany({
    select: publicSubjectSelect,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Busca uma matéria existente.
 * @param {number} subjectId - ID já validado da matéria.
 * @returns {Promise<object>} Matéria encontrada.
 * @throws {NotFoundError} Quando a matéria não existe.
 */
export async function getSubjectById(subjectId) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: publicSubjectSelect,
  });

  if (!subject) {
    throw new NotFoundError(`Matéria com ID ${subjectId} não encontrada`);
  }

  return subject;
}

/**
 * Cria uma matéria para um professor existente.
 * @param {{nome: string, professorId: number, ativa?: boolean}} data - Dados parseados pelo Zod.
 * @returns {Promise<object>} Matéria criada.
 * @throws {NotFoundError} Quando o professor não existe.
 */
export async function createSubject(data) {
  const professor = await prisma.user.findUnique({
    where: { id: data.professorId },
    select: { id: true },
  });

  if (!professor) {
    throw new NotFoundError(
      `Professor com ID ${data.professorId} não encontrado`,
    );
  }

  return prisma.subject.create({
    data: { ...data, ativa: data.ativa ?? true },
    select: publicSubjectSelect,
  });
}

/**
 * Atualiza uma matéria e, quando necessário, confere o novo professor.
 * @param {number} subjectId - ID da matéria.
 * @param {{nome?: string, professorId?: number, ativa?: boolean}} data - Atualização parcial validada.
 * @returns {Promise<object>} Matéria atualizada.
 * @throws {NotFoundError} Quando matéria ou professor não existem.
 */
export async function updateSubject(subjectId, data) {
  await getSubjectById(subjectId);

  if (data.professorId !== undefined) {
    const professor = await prisma.user.findUnique({
      where: { id: data.professorId },
      select: { id: true },
    });

    if (!professor) {
      throw new NotFoundError(
        `Professor com ID ${data.professorId} não encontrado`,
      );
    }
  }

  return prisma.subject.update({
    where: { id: subjectId },
    data,
    select: publicSubjectSelect,
  });
}

/**
 * Remove uma matéria sem questões vinculadas.
 * @param {number} subjectId - ID da matéria.
 * @returns {Promise<object>} Matéria removida.
 * @throws {NotFoundError} Quando a matéria não existe.
 * @throws {ConflictError} Quando há questões vinculadas.
 */
export async function deleteSubject(subjectId) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, _count: { select: { questions: true } } },
  });

  if (!subject) {
    throw new NotFoundError(`Matéria com ID ${subjectId} não encontrada`);
  }

  if (subject._count.questions > 0) {
    throw new ConflictError("Matéria possui questões vinculadas");
  }

  try {
    return await prisma.subject.delete({
      where: { id: subjectId },
      select: publicSubjectSelect,
    });
  } catch (error) {
    if (error?.code === "P2003" || error?.code === "P2014") {
      throw new ConflictError("Matéria possui questões vinculadas");
    }

    if (error?.code === "P2025") {
      throw new NotFoundError(`Matéria com ID ${subjectId} não encontrada`);
    }

    throw error;
  }
}
