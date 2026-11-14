// ADICIONADO: módulo V2 de questões; não altera arquivos ou regras da V1.
import express from "express";
import stableQuestionRoutes from "../../v1/routes/questionRoutes.js";
// ADICIONADO (aula 11): autenticação (quem é) e autorização (o que pode fazer).
import authenticate from "../../../middlewares/auth.js";
import authorize, { isAdmin } from "../../../middlewares/authorize.js";

const router = express.Router();

// Leitura (GET) continua pública. As escritas exigem token, e as verificações vêm
// ANTES do router.use abaixo: um middleware que chama next() deixa a requisição
// seguir para o próximo handler que corresponda ao caminho, inclusive o das rotas V1.
router.post("/", authenticate, authorize("PROFESSOR", "ADMIN"));
router.patch("/:id", authenticate, authorize("PROFESSOR", "ADMIN"));
router.delete("/:id", authenticate, isAdmin);

// ADICIONADO: reaproveita integralmente o contrato estável de Question.
router.use("/", stableQuestionRoutes);

export default router;
