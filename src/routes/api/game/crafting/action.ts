import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, direction, currentX, currentY } = body;

    if (!characterId || !direction) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get active crafting session
    const sessionResult = await db.execute({
      sql: `SELECT cs.*, cp.level as profession_level
            FROM crafting_sessions cs
            JOIN character_professions cp 
              ON cs.character_id = cp.character_id 
              AND cs.profession_type = cp.profession_type
            WHERE cs.character_id = ?
            ORDER BY cs.id DESC
            LIMIT 1`,
      args: [characterId]
    });

    if (sessionResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: "No active crafting session" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = sessionResult.rows[0] as any;

    // Calculate success rate based on profession level
    // Level 1 = 70%, Level 60 = 95%
    const professionLevel = session.profession_level;
    const successRate = Math.min(0.95, 0.70 + (professionLevel / 60) * 0.25);

    // Roll for success
    const actionSucceeded = Math.random() < successRate;

    let newX = currentX;
    let newY = currentY;

    if (actionSucceeded) {
      // Move pin in the specified direction
      switch (direction) {
        case "east":
          newX = currentX + 1;
          break;
        case "west":
          newX = currentX - 1;
          break;
        case "north":
          newY = currentY + 1;
          break;
        case "south":
          newY = currentY - 1;
          break;
      }

      // Clamp to grid bounds (-10 to +10)
      newX = Math.max(-10, Math.min(10, newX));
      newY = Math.max(-10, Math.min(10, newY));

      // Update session
      await db.execute({
        sql: `UPDATE crafting_sessions 
              SET pin_x = ?, pin_y = ?, last_action_time = datetime('now'), actions_taken = actions_taken + 1
              WHERE id = ?`,
        args: [newX, newY, session.id]
      });
    } else {
      // Action failed, just update action count and timestamp
      await db.execute({
        sql: `UPDATE crafting_sessions 
              SET last_action_time = datetime('now'), actions_taken = actions_taken + 1
              WHERE id = ?`,
        args: [session.id]
      });
    }

    return new Response(
      JSON.stringify({
        success: actionSucceeded,
        newX,
        newY
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Crafting Action API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to perform action" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
