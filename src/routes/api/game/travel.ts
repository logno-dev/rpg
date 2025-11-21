import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, regionId } = body;

    // Get character
    const charResult = await db.execute({
      sql: 'SELECT * FROM characters WHERE id = ?',
      args: [characterId],
    });

    if (charResult.rows.length === 0) {
      return json({ error: 'Character not found' }, { status: 404 });
    }

    const character = charResult.rows[0] as any;

    // Verify region exists
    const regionResult = await db.execute({
      sql: 'SELECT * FROM regions WHERE id = ?',
      args: [regionId],
    });

    if (regionResult.rows.length === 0) {
      return json({ error: 'Region not found' }, { status: 404 });
    }

    const region = regionResult.rows[0] as any;

    // Check if region is locked
    if (region.locked === 1) {
      // Check unlock conditions based on requirement text
      if (region.unlock_requirement && region.unlock_requirement.includes('level')) {
        // Parse level requirement (e.g., "Reach level 4" -> 4)
        const levelMatch = region.unlock_requirement.match(/level (\d+)/i);
        if (levelMatch) {
          const requiredLevel = parseInt(levelMatch[1]);
          if (character.level >= requiredLevel) {
            // Unlock the region
            await db.execute({
              sql: 'UPDATE regions SET locked = 0 WHERE id = ?',
              args: [regionId],
            });
          } else {
            return json({ 
              error: `This region is locked. ${region.unlock_requirement}` 
            }, { status: 403 });
          }
        }
      } else {
        return json({ 
          error: `This region is locked. ${region.unlock_requirement || 'Complete the required quest to unlock.'}` 
        }, { status: 403 });
      }
    }

    // Update character's current region
    await db.execute({
      sql: 'UPDATE characters SET current_region = ? WHERE id = ?',
      args: [regionId, characterId],
    });

    // Get updated character
    const updatedCharResult = await db.execute({
      sql: 'SELECT * FROM characters WHERE id = ?',
      args: [characterId],
    });

    // Get all regions (in case one was unlocked)
    const regionsResult = await db.execute({
      sql: 'SELECT * FROM regions ORDER BY min_level, id',
      args: [],
    });

    return json({ 
      success: true, 
      region: regionResult.rows[0],
      character: updatedCharResult.rows[0],
      regions: regionsResult.rows
    });
  } catch (error: any) {
    console.error('Travel error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
