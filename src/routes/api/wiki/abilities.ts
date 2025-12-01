import { db } from "~/lib/db";
import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const type = url.searchParams.get("type"); // 'ability' or 'spell'
    const category = url.searchParams.get("category"); // 'damage', 'heal', 'buff'

    let query = `
      SELECT a.id, a.name, a.description, a.type, a.category, a.level, 
             a.mana_cost, a.cooldown, a.required_level,
             a.required_strength, a.required_dexterity, a.required_constitution,
             a.required_intelligence, a.required_wisdom, a.required_charisma
      FROM abilities a
      WHERE 1=1
    `;

    const params: any[] = [];

    if (type) {
      query += ` AND a.type = ?`;
      params.push(type);
    }

    if (category) {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY a.level ASC, a.name ASC`;

    const abilities = await db.execute({ sql: query, args: params });

    return new Response(JSON.stringify(abilities.rows), {
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
