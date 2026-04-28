import { StatusCodes } from 'http-status-codes';
import {
    createProjectService,
    getProjectTreeService,
    openProjectService,
    getUserProjectsService,
    deleteProjectService,
} from "../service/projectService.js";

/**
 * POST /api/v1/projects — Create a new project
 * Body: { name: string, description?: string }
 */
export const createProjectController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Project name is required",
                success: false,
            });
        }

        const project = await createProjectService(userId, name.trim(), description?.trim());

        return res.status(StatusCodes.CREATED).json({
            message: "Project created successfully",
            data: project,
            success: true,
        });
    } catch (error) {
        console.error("Error creating project:", error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to create project",
            error: error.message,
            success: false,
        });
    }
};

/**
 * GET /api/v1/projects — List all projects for the authenticated user
 */
export const getUserProjectsController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const projects = await getUserProjectsService(userId);

        return res.status(StatusCodes.OK).json({
            message: "Projects fetched successfully",
            data: projects,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching projects:", error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch projects",
            error: error.message,
            success: false,
        });
    }
};

/**
 * POST /api/v1/projects/:projectId/open — Open/restore a project
 */
export const openProjectController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { projectId } = req.params;

        const project = await openProjectService(projectId, userId);

        return res.status(StatusCodes.OK).json({
            message: "Project opened successfully",
            data: project,
            success: true,
        });
    } catch (error) {
        console.error("Error opening project:", error.message);
        const statusCode = error.message.includes('not found') || error.message.includes('access')
            ? StatusCodes.NOT_FOUND
            : StatusCodes.INTERNAL_SERVER_ERROR;

        return res.status(statusCode).json({
            message: "Failed to open project",
            error: error.message,
            success: false,
        });
    }
};

/**
 * DELETE /api/v1/projects/:projectId — Delete a project
 */
export const deleteProjectController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { projectId } = req.params;

        await deleteProjectService(projectId, userId);

        return res.status(StatusCodes.OK).json({
            message: "Project deleted successfully",
            success: true,
        });
    } catch (error) {
        console.error("Error deleting project:", error.message);
        const statusCode = error.message.includes('not found') || error.message.includes('access')
            ? StatusCodes.NOT_FOUND
            : StatusCodes.INTERNAL_SERVER_ERROR;

        return res.status(statusCode).json({
            message: "Failed to delete project",
            error: error.message,
            success: false,
        });
    }
};

/**
 * GET /api/v1/projects/:projectId/tree — Get project file tree
 */
export const getProjectTree = async (req, res) => {
    try {
        const tree = await getProjectTreeService(req.params.projectId);
        return res.status(StatusCodes.OK).json({
            data: tree,
            message: "Project tree fetched successfully",
            success: true,
        });
    } catch (error) {
        console.error("Error fetching project tree:", error.message);
        const statusCode = error.message.includes("not found") ? 404 : 500;
        return res.status(statusCode).json({
            message: "Failed to fetch project tree",
            error: error.message,
            success: false,
        });
    }
};