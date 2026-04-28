import Project from '../models/projectModel.js';

/**
 * Create a new project document
 */
export const createProject = async (data) => {
    return await Project.create(data);
};

/**
 * Find all projects belonging to a user, sorted by most recently updated
 */
export const findProjectsByUser = async (userId) => {
    return await Project.find({ userId })
        .sort({ updatedAt: -1 })
        .lean();
};

/**
 * Find a single project by its UUID (projectId field, not _id)
 */
export const findProjectByProjectId = async (projectId) => {
    return await Project.findOne({ projectId });
};

/**
 * Find a project by projectId AND userId (ownership check)
 */
export const findProjectByIdAndUser = async (projectId, userId) => {
    return await Project.findOne({ projectId, userId });
};

/**
 * Update a project's fields
 */
export const updateProject = async (projectId, updates) => {
    return await Project.findOneAndUpdate(
        { projectId },
        { $set: updates },
        { new: true }
    );
};

/**
 * Delete a project document
 */
export const deleteProjectById = async (projectId) => {
    return await Project.findOneAndDelete({ projectId });
};

/**
 * Mark a project as active (container running)
 */
export const markProjectActive = async (projectId) => {
    return await updateProject(projectId, { isActive: true });
};

/**
 * Mark a project as inactive
 */
export const markProjectInactive = async (projectId) => {
    return await updateProject(projectId, { isActive: false });
};
