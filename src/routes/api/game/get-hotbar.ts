import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getUser } from "~/lib/auth";
import { getCharacter, getHotbar } from "~/lib/game";

export async function GET(event: APIEvent) {
  try {
    const user = await getUser();
    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(event.request.url);
    const characterId = parseInt(url.searchParams.get("characterId") || "0");

    if (!characterId) {
      return json({ error: "Character ID required" }, { status: 400 });
    }

    const character = await getCharacter(characterId);
    if (!character || character.user_id !== user.id) {
      return json({ error: "Character not found or access denied" }, { status: 403 });
    }

    const hotbar = await getHotbar(characterId);

    return json({ hotbar });
  } catch (error: any) {
    console.error('Get hotbar error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
