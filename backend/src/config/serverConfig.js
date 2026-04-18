import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const REACT_PROJECT_COMMAND = process.env.REACT_PROJECT_COMMAND;
export const MONGO_URI = process.env.MONGO_URI;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// SMTP config for Nodemailer
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM;