import express from 'express';
import {
    createProjectController,
    getUserProjectsController,
    openProjectController,
    deleteProjectController,
    getProjectTree,
} from '../../controllers/projectController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// All project routes require authentication
router.use(isAuthenticated);

// POST   /api/v1/projects              — Create a new project
router.post('/', createProjectController);

// GET    /api/v1/projects              — List user's projects
router.get('/', getUserProjectsController);

// POST   /api/v1/projects/:projectId/open — Restore & open a project
router.post('/:projectId/open', openProjectController);

// DELETE /api/v1/projects/:projectId   — Delete a project
router.delete('/:projectId', deleteProjectController);

// GET    /api/v1/projects/:projectId/tree — Get file tree
router.get('/:projectId/tree', getProjectTree);

export default router;