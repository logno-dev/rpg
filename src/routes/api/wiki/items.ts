import { db } from "~/lib/db";
import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const type = url.searchParams.get("type");
    const rarity = url.searchParams.get("rarity");

    let query = `
      SELECT id, name, description, type, slot, rarity,
             damage_min, damage_max, armor, attack_speed,
             strength_bonus, dexterity_bonus, constitution_bonus,
             intelligence_bonus, wisdom_bonus, charisma_bonus,
             health_restore, mana_restore, value,
             required_level, required_strength, required_dexterity,
             required_constitution, required_intelligence, required_wisdom, required_charisma
      FROM items
      WHERE 1=1
    `;

    const params: any[] = [];

    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }

    if (rarity) {
      query += ` AND rarity = ?`;
      params.push(rarity);
    }

    query += ` ORDER BY required_level ASC, name ASC`;

    const items = await db.execute({ sql: query, args: params });

    return new Response(JSON.stringify(items.rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
