
import * as questionService from "../services/questionService.js";

export async function getAll(_req, res, next) {
  try {
    const data = await questionService.getAllQuestions();
    res.status(200).json({ success: true, data, total: data.length });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const data = await questionService.getQuestionById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const data = await questionService.createQuestion(req.body);
    res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const data = await questionService.updateQuestion(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Questão atualizada com sucesso",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const data = await questionService.deleteQuestion(req.params.id);
    res.status(200).json({
      success: true,
      message: "Questão removida com sucesso",
      data,
    });
  } catch (error) {
    next(error);
  }
}
