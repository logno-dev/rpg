import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getUser } from "~/lib/auth";
import { getCharacter, setHotbarSlot } from "~/lib/game";

export async function POST(event: APIEvent) {
  try {
    const user = await getUser();
    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await event.request.json();
    const { characterId, slot, type, abilityId, itemId } = body;
    
    console.log('[set-hotbar] Request:', { characterId, slot, type, abilityId, itemId });

    if (!characterId || !slot || !type) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    if (slot < 1 || slot > 8) {
      return json({ error: "Slot must be between 1 and 8" }, { status: 400 });
    }

    if (!['ability', 'consumable'].includes(type)) {
      return json({ error: "Type must be 'ability' or 'consumable'" }, { status: 400 });
    }

    const character = await getCharacter(characterId);
    if (!character || character.user_id !== user.id) {
      return json({ error: "Character not found or access denied" }, { status: 403 });
    }

    await setHotbarSlot(characterId, slot, type, abilityId, itemId);
    
    console.log('[set-hotbar] Successfully saved to database');

    return json({ success: true });
  } catch (error: any) {
    console.error('Set hotbar error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
