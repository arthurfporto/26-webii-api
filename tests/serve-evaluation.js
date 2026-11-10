import { config } from "dotenv";
import { startUploadcareStub } from "./helpers/uploadcareStub.js";
import { createUploadFixtures } from "./fixtures/createUploadFixtures.js";

config({ path: ".env.test", quiet: true });
if (!process.env.TEST_DATABASE_URL)
  throw new Error("Defina um TEST_DATABASE_URL exclusivo de avaliação");
// Configura antes de importar app/Prisma: não reutilizar DATABASE_URL de desenvolvimento.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.UPLOADCARE_PUBLIC_KEY = "demopublickey";
// ADICIONADO (aula 11): os mesmos valores exclusivos de teste usados pelo Vitest.
process.env.JWT_SECRET = "segredo-somente-para-testes-0123456789abcdef";
process.env.JWT_EXPIRES_IN = "15m";
process.env.BCRYPT_SALT_ROUNDS = "4";
process.env.CORS_ORIGINS = "http://localhost:5173";
const stub = await startUploadcareStub(
  Number(process.env.EVALUATION_UPLOAD_PORT || 59314),
);
process.env.UPLOADCARE_TEST_BASE_URL = stub.url;
await createUploadFixtures();
const { default: app } = await import("../src/app.js");
const { default: prisma } = await import("../src/config/database.js");
// ADICIONADO (aula 11): hash da senha do ADMIN da avaliação.
const { hashPassword } = await import("../src/config/password.js");

// ADICIONADO (aula 11): ADMIN da avaliação; as credenciais estão no ambiente Avaliacao do Bruno.
const evaluationAdmin = {
  email: "admin.avaliacao@example.com",
  senha: await hashPassword("senha-admin-avaliacao"),
  papel: "ADMIN",
  tipoUsuario: "admin",
};
await prisma.user.upsert({
  where: { email: evaluationAdmin.email },
  update: evaluationAdmin,
  create: {
    ...evaluationAdmin,
    nome: "Admin Avaliação",
    primeiroNome: "Admin",
    sobrenome: "Avaliação",
  },
});
const port = Number(process.env.EVALUATION_PORT || 59313);
const server = app.listen(port, "127.0.0.1", () =>
  console.log(
    `Avaliação API: http://127.0.0.1:${port}; provedor simulado: ${stub.url}`,
  ),
);

/** Encerra recursos da avaliação sem parar bancos ou processos preexistentes. */
async function close() {
  await new Promise((resolve) => server.close(resolve));
  await stub.close();
  await prisma.$disconnect();
}
process.once("SIGINT", close);
process.once("SIGTERM", close);
