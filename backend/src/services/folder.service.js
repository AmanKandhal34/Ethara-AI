import { randomUUID } from 'crypto';
import { getDb } from '../config/db.js';
import { publicFolderFields, toIso } from '../utils/sqlite.js';

const countFolderItems = (folderId) => {
    const db = getDb();
    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects WHERE folderId = ?').get(folderId).count;
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE folderId = ?').get(folderId).count;

    return { projectCount, taskCount };
};

export class FolderService {
    static async getAllFolders() {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM folders ORDER BY datetime(createdAt) DESC').all();

        return rows.map((row) => ({
            ...publicFolderFields(row),
            ...countFolderItems(row.id),
        }));
    }

    static async getFolderById(folderId) {
        const db = getDb();
        const row = db.prepare('SELECT * FROM folders WHERE id = ?').get(folderId);

        if (!row) {
            throw new Error('Folder not found');
        }

        return {
            ...publicFolderFields(row),
            ...countFolderItems(row.id),
        };
    }

    static async createFolder(folderData) {
        const db = getDb();
        const now = toIso(new Date());
        const id = randomUUID();

        if (!folderData.name) {
            throw new Error('Folder name is required');
        }

        db.prepare('INSERT INTO folders (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)').run(
            id,
            folderData.name,
            folderData.description || null,
            now,
            now
        );

        return this.getFolderById(id);
    }

    static async updateFolder(folderId, updateData) {
        const db = getDb();
        const row = db.prepare('SELECT * FROM folders WHERE id = ?').get(folderId);

        if (!row) {
            throw new Error('Folder not found');
        }

        const now = toIso(new Date());
        db.prepare(
            'UPDATE folders SET name = ?, description = ?, updatedAt = ? WHERE id = ?'
        ).run(updateData.name ?? row.name, updateData.description ?? row.description, now, folderId);

        return this.getFolderById(folderId);
    }

    static async deleteFolder(folderId) {
        const db = getDb();
        const row = db.prepare('SELECT * FROM folders WHERE id = ?').get(folderId);

        if (!row) {
            throw new Error('Folder not found');
        }

        db.prepare('UPDATE projects SET folderId = NULL WHERE folderId = ?').run(folderId);
        db.prepare('UPDATE tasks SET folderId = NULL WHERE folderId = ?').run(folderId);
        db.prepare('DELETE FROM folders WHERE id = ?').run(folderId);

        return { message: 'Folder deleted successfully' };
    }

    static async getFolderContents(folderId) {
        const db = getDb();
        const folder = await this.getFolderById(folderId);
        const projects = db.prepare('SELECT * FROM projects WHERE folderId = ? ORDER BY datetime(createdAt) DESC').all(folderId);
        const tasks = db.prepare('SELECT * FROM tasks WHERE folderId = ? ORDER BY datetime(createdAt) DESC').all(folderId);

        return { folder, projects, tasks };
    }
}

export default FolderService;