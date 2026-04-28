import axios from "../config/axiosConfig";

/**
 * Create a new project
 */
export const createProjectApi = async ({ name, description }) => {
    try {
        const response = await axios.post('/api/v1/projects', { name, description });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * Get all projects for the authenticated user
 */
export const getUserProjectsApi = async () => {
    try {
        const response = await axios.get('/api/v1/projects');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * Open/restore a project (downloads from S3 if needed)
 */
export const openProjectApi = async ({ projectId }) => {
    try {
        const response = await axios.post(`/api/v1/projects/${projectId}/open`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * Delete a project
 */
export const deleteProjectApi = async ({ projectId }) => {
    try {
        const response = await axios.delete(`/api/v1/projects/${projectId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * Get project file tree
 */
export const getProjectTree = async ({ projectId }) => {
    try {
        const response = await axios.get(`/api/v1/projects/${projectId}/tree`);
        console.log(response.data);
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};