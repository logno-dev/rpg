import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { register } from '~/lib/auth';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { email, password } = body;

    console.log('Register API - email:', email, 'password length:', password?.length);

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    await register(email, password);

    return json({ success: true });
  } catch (error: any) {
    console.error('Register error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
