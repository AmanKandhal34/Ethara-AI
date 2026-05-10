import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getDb } from '../config/db.js';
import { publicUserFields, toIso } from '../utils/sqlite.js';
import { generateToken } from '../utils/generateToken.js';

export class AuthService {
    static async register(userData) {
        const { name, email, password } = userData;
        const db = getDb();
        const normalizedEmail = email.trim().toLowerCase();

        if (!name || !normalizedEmail || !password) {
            throw new Error('Please provide a name, email, and password');
        }

        const userExists = db
            .prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)')
            .get(normalizedEmail);

        if (userExists) {
            throw new Error('User already exists with this email');
        }

        const now = toIso(new Date());
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = randomUUID();

        db.prepare(
            `INSERT INTO users (id, name, email, password, role, avatar, bio, isActive, lastLogin, createdAt, updatedAt)
             VALUES (@id, @name, @email, @password, @role, @avatar, @bio, @isActive, @lastLogin, @createdAt, @updatedAt)`
        ).run({
            id,
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user',
            avatar: null,
            bio: null,
            isActive: 1,
            lastLogin: null,
            createdAt: now,
            updatedAt: now,
        });

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        const token = generateToken(user.id);

        return {
            token,
            user: publicUserFields(user),
        };
    }

    static async login(email, password) {
        if (!email || !password) {
            throw new Error('Please provide email and password');
        }

        const db = getDb();
        const user = db
            .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
            .get(email.trim().toLowerCase());

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const now = toIso(new Date());
        db.prepare('UPDATE users SET lastLogin = ?, updatedAt = ? WHERE id = ?').run(now, now, user.id);

        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
        const token = generateToken(updatedUser.id);

        return {
            token,
            user: publicUserFields(updatedUser),
        };
    }

    static async getCurrentUser(userId) {
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return publicUserFields(user);
    }

    static async updateProfile(userId, updateData) {
        const { name, avatar, bio } = updateData;
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const now = toIso(new Date());
        db.prepare(
            `UPDATE users
             SET name = COALESCE(?, name),
                 avatar = ?,
                 bio = ?,
                 updatedAt = ?
             WHERE id = ?`
        ).run(name?.trim() || null, avatar ?? null, bio ?? null, now, userId);

        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        return publicUserFields(updatedUser);
    }

    static async logout(userId) {
        // You can implement token blacklist or session management here
        return { message: 'Logged out successfully' };
    }
}

export default AuthService;
