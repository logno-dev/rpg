import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function GET(event: APIEvent) {
  const url = new URL(event.request.url);
  const characterId = url.searchParams.get("characterId");

  if (!characterId) {
    return new Response(JSON.stringify({ error: "Character ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get character professions (or initialize them if they don't exist)
    const professionsResult = await db.execute({
      sql: `SELECT profession_type as type, level, experience 
            FROM character_professions 
            WHERE character_id = ?`,
      args: [characterId]
    });

    // Initialize professions if they don't exist
    const professions = professionsResult.rows.length > 0 
      ? professionsResult.rows 
      : await initializeProfessions(db, parseInt(characterId));

    // Get character's crafting materials
    const materialsResult = await db.execute({
      sql: `SELECT 
              cm.id,
              cm.name,
              cm.description,
              cm.rarity,
              COALESCE(ccm.quantity, 0) as quantity
            FROM crafting_materials cm
            LEFT JOIN character_crafting_materials ccm 
              ON cm.id = ccm.material_id AND ccm.character_id = ?
            ORDER BY 
              CASE cm.rarity 
                WHEN 'common' THEN 1 
                WHEN 'uncommon' THEN 2 
                WHEN 'rare' THEN 3 
              END,
              cm.name`,
      args: [characterId]
    });

    return new Response(
      JSON.stringify({
        professions,
        materials: materialsResult.rows
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Crafting Basic Data API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch crafting data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Initialize all professions at level 1 for a new character
async function initializeProfessions(db: any, characterId: number) {
  const professions = ["blacksmithing", "leatherworking", "tailoring", "fletching", "alchemy"];
  
  for (const profession of professions) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO character_professions (character_id, profession_type, level, experience)
            VALUES (?, ?, 1, 0)`,
      args: [characterId, profession]
    });
  }

  // Return the initialized professions
  const result = await db.execute({
    sql: `SELECT profession_type as type, level, experience 
          FROM character_professions 
          WHERE character_id = ?`,
    args: [characterId]
  });

  return result.rows;
}
