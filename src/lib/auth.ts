import { db, type User } from './db';
import bcrypt from 'bcryptjs';
import { useSession } from 'vinxi/http';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function getSessionInternal() {
  'use server';
  return await useSession({
    password: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getUser(): Promise<User | null> {
  'use server';
  try {
    const session = await getSessionInternal();
    const userId = session.data.userId;

    if (!userId) return null;

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [userId],
    });

    return result.rows[0] as User | null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function requireUser(): Promise<User> {
  'use server';
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function login(email: string, password: string): Promise<User> {
  'use server';
  
  console.log('Login attempt for:', email);
  
  // Validate inputs
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email');
  }
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password');
  }
  
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  const user = result.rows[0] as User | undefined;

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Use default export methods
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const session = await getSessionInternal();
  await session.update((data: any) => {
    data.userId = user.id;
    return data;
  });

  return user;
}

export async function register(email: string, password: string): Promise<User> {
  'use server';
  
  console.log('Register attempt for:', email);
  
  // Validate inputs
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email');
  }
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password');
  }
  
  // Check if user already exists
  const existingUser = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  if (existingUser.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password using async method
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);
  
  console.log('Generated hash');

  // Create user
  const result = await db.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING *',
    args: [email, password_hash],
  });

  const user = result.rows[0] as User;
  console.log('User created:', user.id);

  // Log them in
  const session = await getSessionInternal();
  console.log('Got session:', session);
  
  await session.update((data: any) => {
    data.userId = user.id;
    return data;
  });
  
  console.log('Session updated');

  return user;
}

export async function logout(): Promise<void> {
  'use server';
  const session = await getSessionInternal();
  await session.update((data: any) => {
    data.userId = undefined;
    return data;
  });
}
