import { db } from "~/lib/db";
import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  try {
    const regions = await db.execute(
      `SELECT id, name, description, min_level, max_level, locked, unlock_requirement 
       FROM regions 
       ORDER BY min_level ASC`
    );

    return new Response(JSON.stringify(regions.rows), {
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
