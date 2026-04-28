import fs from "fs/promises";
import path from "path";
import { getContainerPort } from "../containers/handleContainerCreate.js";
import { syncProjectToS3Service } from "../service/projectService.js";

export const handleEditorSocketEvents = (socket, editorNamespace, projectId) => {

    // ── Write File ──────────────────────────────────────────
    socket.on("writeFile", async ({ data, pathToFileOrFolder }) => {
        try {
            await fs.writeFile(pathToFileOrFolder, data);
            editorNamespace.emit("writeFileSuccess", {
                data: "File written successfully",
                path: pathToFileOrFolder,
            });
        } catch (error) {
            console.error("Error writing file:", error.message);
            socket.emit("error", { data: `Error writing file: ${error.message}` });
        }
    });

    // ── Create File ─────────────────────────────────────────
    socket.on("createFile", async ({ pathToFileOrFolder }) => {
        try {
            // Check if file already exists
            try {
                await fs.access(pathToFileOrFolder);
                socket.emit("error", { data: "File already exists" });
                return;
            } catch {
                // File doesn't exist — good, create it
            }

            await fs.writeFile(pathToFileOrFolder, "");
            socket.emit("createFileSuccess", {
                data: "File created successfully",
            });
            // Notify all clients to refresh tree
            editorNamespace.emit("treeStructureUpdate");
        } catch (error) {
            console.error("Error creating file:", error.message);
            socket.emit("error", { data: `Error creating file: ${error.message}` });
        }
    });

    // ── Read File ───────────────────────────────────────────
    socket.on("readFile", async ({ pathToFileOrFolder }) => {
        try {
            const content = await fs.readFile(pathToFileOrFolder, "utf-8");
            socket.emit("readFileSuccess", {
                value: content,
                path: pathToFileOrFolder,
            });
        } catch (error) {
            console.error("Error reading file:", error.message);
            socket.emit("error", { data: `Error reading file: ${error.message}` });
        }
    });

    // ── Delete File ─────────────────────────────────────────
    socket.on("deleteFile", async ({ pathToFileOrFolder }) => {
        try {
            await fs.unlink(pathToFileOrFolder);
            socket.emit("deleteFileSuccess", {
                data: "File deleted successfully",
            });
            editorNamespace.emit("treeStructureUpdate");
        } catch (error) {
            console.error("Error deleting file:", error.message);
            socket.emit("error", { data: `Error deleting file: ${error.message}` });
        }
    });

    // ── Rename File or Folder ───────────────────────────────
    socket.on("renameFileOrFolder", async ({ oldPath, newPath }) => {
        try {
            await fs.rename(oldPath, newPath);
            socket.emit("renameFileOrFolderSuccess", {
                data: "Renamed successfully",
                oldPath,
                newPath,
            });
            editorNamespace.emit("treeStructureUpdate");
        } catch (error) {
            console.error("Error renaming:", error.message);
            socket.emit("error", { data: `Error renaming: ${error.message}` });
        }
    });

    // ── Create Folder ───────────────────────────────────────
    socket.on("createFolder", async ({ pathToFileOrFolder }) => {
        try {
            await fs.mkdir(pathToFileOrFolder, { recursive: true });
            socket.emit("createFolderSuccess", {
                data: "Folder created successfully",
            });
            editorNamespace.emit("treeStructureUpdate");
        } catch (error) {
            console.error("Error creating folder:", error.message);
            socket.emit("error", { data: `Error creating folder: ${error.message}` });
        }
    });

    // ── Delete Folder ───────────────────────────────────────
    socket.on("deleteFolder", async ({ pathToFileOrFolder }) => {
        try {
            await fs.rm(pathToFileOrFolder, { recursive: true, force: true });
            socket.emit("deleteFolderSuccess", {
                data: "Folder deleted successfully",
            });
            editorNamespace.emit("treeStructureUpdate");
        } catch (error) {
            console.error("Error deleting folder:", error.message);
            socket.emit("error", { data: `Error deleting folder: ${error.message}` });
        }
    });

    // ── Get Container Port ──────────────────────────────────
    socket.on("getPort", async ({ containerName }) => {
        const port = await getContainerPort(containerName);
        socket.emit("getPortSuccess", { port });
    });

    // ── Sync to S3 on Disconnect ────────────────────────────
    socket.on("disconnect", async () => {
        if (projectId) {
            console.log(`[S3 Sync] User disconnected — syncing project ${projectId}...`);
            try {
                await syncProjectToS3Service(projectId);
                console.log(`[S3 Sync] Project ${projectId} synced successfully`);
            } catch (error) {
                console.error(`[S3 Sync] Failed to sync ${projectId}:`, error.message);
            }
        }
    });
};