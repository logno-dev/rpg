import { db } from "~/lib/db";
import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const area = url.searchParams.get("area");
    const minLevel = url.searchParams.get("minLevel");
    const maxLevel = url.searchParams.get("maxLevel");

    let query = `
      SELECT id, name, level, area, max_health, damage_min, damage_max,
             defense, attack_speed, evasiveness, experience_reward,
             gold_min, gold_max, aggressive
      FROM mobs
      WHERE 1=1
    `;

    const params: any[] = [];

    if (area) {
      query += ` AND area = ?`;
      params.push(area);
    }

    if (minLevel) {
      query += ` AND level >= ?`;
      params.push(parseInt(minLevel));
    }

    if (maxLevel) {
      query += ` AND level <= ?`;
      params.push(parseInt(maxLevel));
    }

    query += ` ORDER BY level ASC, name ASC`;

    const mobs = await db.execute({ sql: query, args: params });

    return new Response(JSON.stringify(mobs.rows), {
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
