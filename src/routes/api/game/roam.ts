import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { roamField, getRandomMobFromSubArea, setCharacterSubArea } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, subAreaId } = body;

    // If sub-area is specified, use new system
    if (subAreaId) {
      // Update character's current sub-area
      await setCharacterSubArea(characterId, subAreaId);
      
      // Spawn multiple mobs from the sub-area (2-4 mobs)
      const mobCount = Math.floor(Math.random() * 3) + 2; // 2-4 mobs
      const mobs = [];
      
      for (let i = 0; i < mobCount; i++) {
        const mob = await getRandomMobFromSubArea(subAreaId);
        if (mob) mobs.push(mob);
      }
      
      // Check if any are aggressive
      const aggressiveMob = mobs.find(m => m.aggressive);
      
      return json({
        mobs,
        initiated: !!aggressiveMob,
        aggroMob: aggressiveMob || null,
      });
    } else {
      // Fallback to old system for regions without sub-areas
      const result = await roamField(characterId);
      
      return json({
        mobs: result.mobs,
        initiated: result.initiated,
        aggroMob: result.aggroMob,
      });
    }
  } catch (error: any) {
    console.error('Roam error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
