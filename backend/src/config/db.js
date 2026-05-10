import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import config from './env.js';

let db;

const hasColumn = (database, tableName, columnName) => {
    const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some((column) => column.name === columnName);
};

const initializeSchema = (database) => {
    database.exec(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            avatar TEXT,
            bio TEXT,
            isActive INTEGER NOT NULL DEFAULT 1,
            lastLogin TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            ownerId TEXT NOT NULL,
            folderId TEXT,
            members TEXT NOT NULL DEFAULT '[]',
            status TEXT NOT NULL DEFAULT 'active',
            priority TEXT NOT NULL DEFAULT 'medium',
            startDate TEXT,
            endDate TEXT,
            budget REAL NOT NULL DEFAULT 0,
            thumbnail TEXT,
            tags TEXT NOT NULL DEFAULT '[]',
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL,
            FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            folderId TEXT,
            projectId TEXT NOT NULL,
            assigneeId TEXT,
            createdById TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            priority TEXT NOT NULL DEFAULT 'medium',
            dueDate TEXT,
            startDate TEXT,
            completedDate TEXT,
            estimatedHours REAL NOT NULL DEFAULT 0,
            actualHours REAL NOT NULL DEFAULT 0,
            tags TEXT NOT NULL DEFAULT '[]',
            subtasks TEXT NOT NULL DEFAULT '[]',
            attachments TEXT NOT NULL DEFAULT '[]',
            comments TEXT NOT NULL DEFAULT '[]',
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL,
            FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (assigneeId) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    if (!hasColumn(database, 'projects', 'folderId')) {
        database.exec('ALTER TABLE projects ADD COLUMN folderId TEXT REFERENCES folders(id) ON DELETE SET NULL;');
    }

    if (!hasColumn(database, 'tasks', 'folderId')) {
        database.exec('ALTER TABLE tasks ADD COLUMN folderId TEXT REFERENCES folders(id) ON DELETE SET NULL;');
    }
};

export const connectDB = async () => {
    try {
        if (db) {
            return db;
        }

        const dbPath = path.isAbsolute(config.sqlitePath)
            ? config.sqlitePath
            : path.resolve(process.cwd(), config.sqlitePath);

        fs.mkdirSync(path.dirname(dbPath), { recursive: true });

        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initializeSchema(db);

        console.log(`SQLite connected: ${dbPath}`);
        return db;
    } catch (error) {
        console.error(`Error connecting to SQLite: ${error.message}`);
        process.exit(1);
    }
};

export const getDb = () => {
    if (!db) {
        throw new Error('Database has not been initialized');
    }

    return db;
};

export default connectDB;
