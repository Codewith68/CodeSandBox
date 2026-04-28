import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import apiRouter from './routes/index.js';
import { PORT } from './config/serverConfig.js';
import connectDB from './config/dbConfig.js';
import configurePassport from './config/passportConfig.js';
import chokidar from 'chokidar';
import { handleEditorSocketEvents } from './socketHandlers/editorHandler.js';


const app = express();
const server = createServer(app);

// Catch unhandled errors to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
});
const io = new Server(server, {
    cors: {
        origin: '*',
        method: ['GET', 'POST'],
    }
});

// Configure Passport strategies
configurePassport();

app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true, // Allow cookies to be sent cross-origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Global rate limiter — 100 requests per 15 minutes per IP
import { globalLimiter } from './middlewares/rateLimiter.js';
app.use(globalLimiter);

app.use('/api', apiRouter);

app.get('/ping', (req, res) => {
    return res.json({ message: 'pong' });
});

const editorNamespace = io.of('/editor');

editorNamespace.on("connection", (socket) => {
    console.log("editor connected");

    // somehow we will get the projectId from frontend;
    let projectId = socket.handshake.query['projectId'];

    console.log("Project id received after connection", projectId);

    if(projectId) {
        var watcher = chokidar.watch(`./projects/${projectId}`, {
            ignored: (path) => path.includes("node_modules"),
            persistent: true, /** keeps the watcher in running state till the time app is running */
            awaitWriteFinish: {
                stabilityThreshold: 2000 /** Ensures stability of files before triggering event */
            },
            ignoreInitial: true /** Ignores the initial files in the directory */
        });

        watcher.on("all", (event, path) => {
            console.log(event, path);
        });
    }

    handleEditorSocketEvents(socket, editorNamespace, projectId);

    // Clean up watcher and sync to S3 on disconnect
    socket.on("disconnect", () => {
        console.log(`Editor disconnected for project ${projectId}`);
        if (watcher) {
            watcher.close();
        }
    });

});

// Global error handler (Express 5 requires 4 args)
app.use((err, req, res, next) => {
    console.error('EXPRESS ERROR:', err.stack || err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`   Run: taskkill /F /IM node.exe   (to kill stale processes)`);
        console.error(`   Or change PORT in .env\n`);
    } else {
        console.error('SERVER ERROR:', err);
    }
    process.exit(1);
});

// Connect to MongoDB first, then start the server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(process.cwd());
    });
});