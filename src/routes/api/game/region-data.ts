import { json } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import { getMerchantsInRegion, getDungeonsInRegion } from '~/lib/game';

export async function GET() {
  'use server';
  
  const event = getRequestEvent();
  if (!event) {
    return json({ error: 'No request event' }, { status: 400 });
  }

  const url = new URL(event.request.url);
  const regionId = url.searchParams.get('regionId');

  if (!regionId) {
    return json({ error: 'Missing regionId' }, { status: 400 });
  }

  try {
    const [merchants, dungeons] = await Promise.all([
      getMerchantsInRegion(parseInt(regionId)),
      getDungeonsInRegion(parseInt(regionId)),
    ]);
    
    return json({ merchants, dungeons });
  } catch (error: any) {
    console.error('Get regional data error:', error);
    return json({ error: error.message || 'Failed to get regional data' }, { status: 500 });
  }
}
