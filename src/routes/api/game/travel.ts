import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';
import { hasUnlockedRegion, unlockRegion, getAllRegions } from '~/lib/game';

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

    // Check if character has unlocked this region
    const isUnlocked = await hasUnlockedRegion(characterId, regionId);
    
    if (!isUnlocked) {
      // Region is locked for this character - check if they can unlock it now
      if (region.unlock_requirement) {
        // Check level-based unlock
        const levelMatch = region.unlock_requirement.match(/level (\d+)/i);
        if (levelMatch) {
          const requiredLevel = parseInt(levelMatch[1]);
          if (character.level >= requiredLevel) {
            // Unlock the region for this character
            await unlockRegion(characterId, regionId);
          } else {
            return json({ 
              error: `This region is locked. Requirement: ${region.unlock_requirement}` 
            }, { status: 403 });
          }
        } else {
          // Other unlock requirements (boss defeat, dungeon completion, etc.)
          return json({ 
            error: `This region is locked. Requirement: ${region.unlock_requirement}` 
          }, { status: 403 });
        }
      } else {
        // Locked but no requirement specified
        return json({ 
          error: 'This region is locked.' 
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

    // Get all regions with character-specific unlock status
    const regions = await getAllRegions(character.level, characterId);

    return json({ 
      success: true, 
      region: regionResult.rows[0],
      character: updatedCharResult.rows[0],
      regions: regions
    });
  } catch (error: any) {
    console.error('Travel error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
