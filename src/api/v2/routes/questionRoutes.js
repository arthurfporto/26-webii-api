import express from "express";
import stableQuestionRoutes from "../../v1/routes/questionRoutes.js";
import authenticate from "../../../middlewares/auth.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("PROFESSOR", "ADMIN"),
  stableQuestionRoutes,
);

router.patch(
  "/:id",
  authenticate,
  authorize("PROFESSOR", "ADMIN"),
  stableQuestionRoutes,
);

router.delete("/:id", authenticate, authorize("ADMIN"), stableQuestionRoutes);

router.use("/", stableQuestionRoutes);

export default router;
