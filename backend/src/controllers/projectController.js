import { createProjectService, getProjectTreeService } from "../service/projectService.js";

export const createProjectController = async (req, res) => {
    try {
        const projectId = await createProjectService();
        return res.status(201).json({
            message: "Project created successfully",
            data: projectId,
            success: true,
        });
    } catch (error) {
        console.error("Error creating project:", error.message);
        return res.status(500).json({
            message: "Failed to create project",
            error: error.message,
            success: false,
        });
    }
};

export const getProjectTree = async (req, res) => {
    try {
        const tree = await getProjectTreeService(req.params.projectId);
        return res.status(200).json({
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