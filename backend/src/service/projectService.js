import fs from 'fs/promises';
import uuid4 from 'uuid4';
import { REACT_PROJECT_COMMAND } from '../config/serverConfig.js';
import { execPromisified } from '../utils/execUtility.js';
import { uploadProjectToS3, downloadProjectFromS3, deleteProjectFromS3, projectExistsLocally } from '../utils/s3Utility.js';
import { createProject, findProjectsByUser, findProjectByIdAndUser, findProjectByProjectId, updateProject, deleteProjectById } from '../repository/projectRepository.js';
import directoryTree from 'directory-tree';
import path from 'path';

/**
 * Create a new project — scaffold, save to MongoDB, upload initial snapshot to S3
 */
export const createProjectService = async (userId, name, description = '') => {
    const projectId = uuid4();
    console.log("Creating new project:", projectId, "for user:", userId);

    const projectPath = `./projects/${projectId}`;

    // Ensure the projects directory exists
    await fs.mkdir('./projects', { recursive: true });
    await fs.mkdir(projectPath);

    // Scaffold a React + Vite project
    console.log("Running scaffold command:", REACT_PROJECT_COMMAND);
    const { stdout, stderr } = await execPromisified(REACT_PROJECT_COMMAND, {
        cwd: projectPath,
        timeout: 60000,
    });
    console.log("Scaffold stdout:", stdout);
    if (stderr) console.warn("Scaffold stderr:", stderr);

    // Modify package.json to bind Vite to 0.0.0.0
    try {
        const pkgPath = path.join(projectPath, 'sandbox', 'package.json');
        const pkgData = await fs.readFile(pkgPath, 'utf8');
        const pkgJson = JSON.parse(pkgData);
        if (pkgJson.scripts && pkgJson.scripts.dev) {
            pkgJson.scripts.dev = pkgJson.scripts.dev.replace('vite', 'vite --host 0.0.0.0');
            await fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2));
            console.log("Updated package.json to run Vite with --host 0.0.0.0");
        }
    } catch (err) {
        console.error("Failed to modify package.json:", err.message);
    }

    // Overwrite vite.config.js with polling + HMR settings
    try {
        const viteConfigPath = path.join(projectPath, 'sandbox', 'vite.config.js');
        const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 300,
    },
    hmr: true,
  },
})
`;
        await fs.writeFile(viteConfigPath, viteConfig);
        console.log("Updated vite.config.js with polling and HMR settings");
    } catch (err) {
        console.error("Failed to modify vite.config.js:", err.message);
    }

    // Install dependencies
    console.log("Installing dependencies...");
    const installResult = await execPromisified('npm install', {
        cwd: path.join(projectPath, 'sandbox'),
        timeout: 120000,
    });
    console.log("Install stdout:", installResult.stdout);
    if (installResult.stderr) console.warn("Install stderr:", installResult.stderr);

    // Upload initial snapshot to S3
    let s3Key = null;
    try {
        s3Key = await uploadProjectToS3(projectId, userId);
        console.log("Initial S3 snapshot uploaded:", s3Key);
    } catch (err) {
        console.error("Failed to upload initial S3 snapshot (continuing anyway):", err.message);
    }

    // Save project metadata to MongoDB
    const project = await createProject({
        projectId,
        userId,
        name: name || 'Untitled Project',
        description,
        template: 'react',
        s3Key,
        lastSyncedAt: s3Key ? new Date() : null,
    });

    console.log("Project saved to database:", project.projectId);
    return project;
};

/**
 * Open an existing project — restore from S3 if not on local disk
 */
export const openProjectService = async (projectId, userId) => {
    // Verify ownership
    const project = await findProjectByIdAndUser(projectId, userId);
    if (!project) {
        throw new Error('Project not found or you do not have access');
    }

    // Check if project files exist locally
    const existsLocally = await projectExistsLocally(projectId);

    if (!existsLocally) {
        if (!project.s3Key) {
            throw new Error('Project files not found locally or in cloud storage');
        }

        console.log(`Project ${projectId} not on disk — restoring from S3...`);
        await downloadProjectFromS3(projectId, userId);
        console.log(`Project ${projectId} restored from S3`);
    }

    // Mark as active
    await updateProject(projectId, { isActive: true });

    return project;
};

/**
 * Sync a project's current files to S3
 */
export const syncProjectToS3Service = async (projectId) => {
    const project = await findProjectByProjectId(projectId);
    if (!project) {
        console.warn(`[Sync] Project ${projectId} not found in DB — skipping sync`);
        return null;
    }

    try {
        const s3Key = await uploadProjectToS3(projectId, project.userId.toString());
        await updateProject(projectId, {
            s3Key,
            lastSyncedAt: new Date(),
            isActive: false,
        });
        console.log(`[Sync] Project ${projectId} synced to S3`);
        return s3Key;
    } catch (error) {
        console.error(`[Sync] Failed to sync project ${projectId}:`, error.message);
        return null;
    }
};

/**
 * Get all projects for a user
 */
export const getUserProjectsService = async (userId) => {
    return await findProjectsByUser(userId);
};

/**
 * Delete a project — remove from S3, MongoDB, and local disk
 */
export const deleteProjectService = async (projectId, userId) => {
    const project = await findProjectByIdAndUser(projectId, userId);
    if (!project) {
        throw new Error('Project not found or you do not have access');
    }

    // Delete from S3
    if (project.s3Key) {
        try {
            await deleteProjectFromS3(project.s3Key);
        } catch (err) {
            console.error("Failed to delete from S3 (continuing):", err.message);
        }
    }

    // Delete local files
    try {
        await fs.rm(path.resolve(`./projects/${projectId}`), { recursive: true, force: true });
    } catch (err) {
        console.error("Failed to delete local files (continuing):", err.message);
    }

    // Delete from MongoDB
    await deleteProjectById(projectId);

    console.log(`Project ${projectId} fully deleted`);
    return { deleted: true };
};

/**
 * Get project directory tree (existing functionality)
 */
export const getProjectTreeService = async (projectId) => {
    const projectPath = path.resolve(`./projects/${projectId}`);

    try {
        await fs.access(projectPath);
    } catch {
        throw new Error(`Project ${projectId} not found`);
    }

    const tree = directoryTree(projectPath, {
        exclude: /node_modules/,
    });
    return tree;
};
