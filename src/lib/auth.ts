import { db, type User, type Session } from './db';
import bcrypt from 'bcryptjs';
import { useSession } from 'vinxi/http';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getSession() {
  return useSession<{ userId?: number }>({
    password: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  });
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  const userId = session.data.userId;

  if (!userId) return null;

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [userId],
  });

  return result.rows[0] as User | null;
}

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function login(email: string, password: string): Promise<User> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  const user = result.rows[0] as User | undefined;

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const session = await getSession();
  await session.update({ userId: user.id });

  return user;
}

export async function register(email: string, password: string): Promise<User> {
  // Check if user already exists
  const existingUser = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  if (existingUser.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const result = await db.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING *',
    args: [email, password_hash],
  });

  const user = result.rows[0] as User;

  // Log them in
  const session = await getSession();
  await session.update({ userId: user.id });

  return user;
}

export async function logout(): Promise<void> {
  const session = await getSession();
  await session.update({ userId: undefined });
}
