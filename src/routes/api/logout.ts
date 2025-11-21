import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { logout } from '~/lib/auth';

export async function POST({ request }: APIEvent) {
  try {
    await logout();
    return json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
