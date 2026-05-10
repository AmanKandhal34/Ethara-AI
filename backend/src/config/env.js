import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    sqlitePath: process.env.SQLITE_PATH || 'data/ethara-ai.sqlite',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

export default config;
