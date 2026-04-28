import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream, createWriteStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import * as tar from 'tar';
import { pipeline } from 'stream/promises';
import {
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME,
} from '../config/serverConfig.js';

// ── S3 Client ────────────────────────────────────────────
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload a project to S3 as a tar.gz archive
 *
 * 1. Creates a tar.gz of ./projects/{projectId}/ (excluding node_modules)
 * 2. Uploads to S3: projects/{userId}/{projectId}.tar.gz
 * 3. Cleans up the local tar.gz file
 *
 * @returns {string} The S3 key
 */
export const uploadProjectToS3 = async (projectId, userId) => {
    const projectPath = path.resolve(`./projects/${projectId}`);
    const tarFileName = `${projectId}.tar.gz`;
    const tarFilePath = path.resolve(`./projects/${tarFileName}`);
    const s3Key = `projects/${userId}/${tarFileName}`;

    try {
        // Verify project directory exists
        await fs.access(projectPath);

        console.log(`[S3] Packing project ${projectId}...`);

        // Create tar.gz (excluding node_modules to save space)
        await tar.create(
            {
                gzip: true,
                file: tarFilePath,
                cwd: path.resolve('./projects'),
                filter: (filePath) => {
                    // Exclude node_modules and .git directories
                    return !filePath.includes('node_modules') && !filePath.includes('.git');
                },
            },
            [projectId]
        );

        // Read the tar.gz file
        const fileBuffer = await fs.readFile(tarFilePath);

        console.log(`[S3] Uploading ${s3Key} (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);

        // Upload to S3
        await s3Client.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: 'application/gzip',
                Metadata: {
                    projectId,
                    userId,
                    uploadedAt: new Date().toISOString(),
                },
            })
        );

        // Clean up local tar file
        await fs.unlink(tarFilePath).catch(() => {});

        console.log(`[S3] Upload complete: ${s3Key}`);
        return s3Key;
    } catch (error) {
        // Clean up tar file on error
        await fs.unlink(tarFilePath).catch(() => {});
        console.error(`[S3] Upload failed for ${projectId}:`, error.message);
        throw error;
    }
};

/**
 * Download a project from S3 and extract to local disk
 *
 * 1. Downloads tar.gz from S3
 * 2. Extracts to ./projects/{projectId}/
 * 3. Runs npm install in the sandbox directory
 *
 * @returns {string} Path to the extracted project
 */
export const downloadProjectFromS3 = async (projectId, userId) => {
    const tarFileName = `${projectId}.tar.gz`;
    const tarFilePath = path.resolve(`./projects/${tarFileName}`);
    const s3Key = `projects/${userId}/${tarFileName}`;
    const projectPath = path.resolve(`./projects/${projectId}`);

    try {
        console.log(`[S3] Downloading ${s3Key}...`);

        // Download from S3
        const response = await s3Client.send(
            new GetObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
            })
        );

        // Save to local file
        const writeStream = createWriteStream(tarFilePath);
        await pipeline(response.Body, writeStream);

        console.log(`[S3] Extracting to ${projectPath}...`);

        // Ensure projects directory exists
        await fs.mkdir('./projects', { recursive: true });

        // Remove existing project directory if it exists (clean restore)
        await fs.rm(projectPath, { recursive: true, force: true }).catch(() => {});

        // Extract tar.gz
        await tar.extract({
            file: tarFilePath,
            cwd: path.resolve('./projects'),
        });

        // Clean up tar file
        await fs.unlink(tarFilePath).catch(() => {});

        // Reinstall node_modules (we excluded them from the archive)
        const sandboxPath = path.join(projectPath, 'sandbox');
        try {
            await fs.access(sandboxPath);
            console.log(`[S3] Installing dependencies in ${sandboxPath}...`);
            const { execPromisified } = await import('./execUtility.js');
            await execPromisified('npm install', {
                cwd: sandboxPath,
                timeout: 120000,
            });
            console.log(`[S3] Dependencies installed.`);
        } catch (err) {
            console.warn(`[S3] Could not install dependencies:`, err.message);
        }

        console.log(`[S3] Restore complete for ${projectId}`);
        return projectPath;
    } catch (error) {
        await fs.unlink(tarFilePath).catch(() => {});
        console.error(`[S3] Download failed for ${projectId}:`, error.message);
        throw error;
    }
};

/**
 * Delete a project archive from S3
 */
export const deleteProjectFromS3 = async (s3Key) => {
    try {
        console.log(`[S3] Deleting ${s3Key}...`);
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
            })
        );
        console.log(`[S3] Deleted ${s3Key}`);
    } catch (error) {
        console.error(`[S3] Delete failed for ${s3Key}:`, error.message);
        throw error;
    }
};

/**
 * Check if a project exists on local disk
 */
export const projectExistsLocally = async (projectId) => {
    try {
        await fs.access(path.resolve(`./projects/${projectId}`));
        return true;
    } catch {
        return false;
    }
};
