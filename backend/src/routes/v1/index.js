import express from "express";
import { pingCheck } from "../../controllers/pingController.js";
import projectRouter from "./projects.js";
import authRouter from "./auth.js";

const router = express.Router();

router.get('/ping', pingCheck);
router.use('/projects', projectRouter);
router.use('/auth', authRouter);

export default router;