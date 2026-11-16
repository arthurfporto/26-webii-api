import express from "express";
import stableSubjectRoutes from "../../v1/routes/subjectRoutes.js";
import authenticate from "../../../middlewares/auth.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("PROFESSOR", "ADMIN"),
  stableSubjectRoutes,
);

router.patch(
  "/:id",
  authenticate,
  authorize("PROFESSOR", "ADMIN"),
  stableSubjectRoutes,
);

router.delete("/:id", authenticate, authorize("ADMIN"), stableSubjectRoutes);

router.use("/", stableSubjectRoutes);

export default router;
