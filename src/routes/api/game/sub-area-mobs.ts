import { json } from "@solidjs/router";
import { db } from "~/lib/db";

export async function GET(event: { request: Request }) {
  const url = new URL(event.request.url);
  const subAreaId = parseInt(url.searchParams.get('subAreaId') || '0');

  if (!subAreaId) {
    return json({ error: 'Sub-area ID required' }, { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: `SELECT DISTINCT mobs.id, mobs.name, mobs.level, sub_area_mobs.level_variance
            FROM sub_area_mobs
            JOIN mobs ON sub_area_mobs.mob_id = mobs.id
            WHERE sub_area_mobs.sub_area_id = ?
            ORDER BY mobs.level`,
      args: [subAreaId],
    });

    return json({ mobs: result.rows });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
