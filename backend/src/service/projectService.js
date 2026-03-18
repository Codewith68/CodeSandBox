import fs from 'fs/promises';
import uuid4 from 'uuid4';
import { REACT_PROJECT_COMMAND } from '../config/serverConfig.js';
import { execPromisified } from '../utils/execUtility.js';
import directoryTree from 'directory-tree';
import path from 'path';

export const createProjectService = async () => {
    const projectId = uuid4();
    console.log("Creating new project:", projectId);

    const projectPath = `./projects/${projectId}`;

    // Ensure the projects directory exists
    await fs.mkdir('./projects', { recursive: true });
    await fs.mkdir(projectPath);

    // Scaffold a React + Vite project
    console.log("Running scaffold command:", REACT_PROJECT_COMMAND);
    const { stdout, stderr } = await execPromisified(REACT_PROJECT_COMMAND, {
        cwd: projectPath,
        timeout: 60000, // 60 second timeout
    });
    console.log("Scaffold stdout:", stdout);
    if (stderr) console.warn("Scaffold stderr:", stderr);

    // Modify package.json to bind Vite to 0.0.0.0 so the host can access it
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

    // Install dependencies so they're ready when the container starts
    console.log("Installing dependencies...");
    const installResult = await execPromisified('npm install', {
        cwd: path.join(projectPath, 'sandbox'),
        timeout: 120000, // 120 second timeout
    });
    console.log("Install stdout:", installResult.stdout);
    if (installResult.stderr) console.warn("Install stderr:", installResult.stderr);

    return projectId;
};

export const getProjectTreeService = async (projectId) => {
    const projectPath = path.resolve(`./projects/${projectId}`);

    // Verify the project directory exists
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
