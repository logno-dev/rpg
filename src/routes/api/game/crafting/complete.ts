import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, success } = body;

    if (!characterId || success === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get active crafting session
    const sessionResult = await db.execute({
      sql: `SELECT cs.*, r.name as recipe_name, r.base_experience, r.item_id, r.item_type, r.item_data,
              cp.level as profession_level, cp.experience as profession_exp
            FROM crafting_sessions cs
            JOIN recipes r ON cs.recipe_id = r.id
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

    // Calculate XP gained (100% on success, 25% on failure)
    const xpMultiplier = success ? 1.0 : 0.25;
    const xpGained = Math.floor(session.base_experience * xpMultiplier);

    // Update profession XP
    const newProfessionExp = session.profession_exp + xpGained;
    
    // Check for level up (simple: 1000 XP per level)
    const XP_PER_LEVEL = 1000;
    let newProfessionLevel = session.profession_level;
    let levelUp = false;
    let finalExp = newProfessionExp;

    if (newProfessionExp >= XP_PER_LEVEL * session.profession_level) {
      // Get character level to check max crafting level
      const charResult = await db.execute({
        sql: `SELECT level FROM characters WHERE id = ?`,
        args: [characterId]
      });
      const characterLevel = (charResult.rows[0] as any).level;
      const maxCraftingLevel = Math.floor(characterLevel / 2);

      // Only level up if not at max
      if (session.profession_level < maxCraftingLevel) {
        newProfessionLevel = session.profession_level + 1;
        finalExp = newProfessionExp - (XP_PER_LEVEL * session.profession_level);
        levelUp = true;
      }
    }

    await db.execute({
      sql: `UPDATE character_professions 
            SET level = ?, experience = ?
            WHERE character_id = ? AND profession_type = ?`,
      args: [newProfessionLevel, finalExp, characterId, session.profession_type]
    });

    let craftedItem = null;

    // If successful, award the item
    if (success && session.item_id) {
      // Add item to inventory
      const invResult = await db.execute({
        sql: `SELECT * FROM character_inventory WHERE character_id = ? AND item_id = ?`,
        args: [characterId, session.item_id]
      });

      if (invResult.rows.length > 0) {
        // Item exists, increase quantity (if stackable)
        await db.execute({
          sql: `UPDATE character_inventory SET quantity = quantity + 1 
                WHERE character_id = ? AND item_id = ?`,
          args: [characterId, session.item_id]
        });
      } else {
        // New item
        await db.execute({
          sql: `INSERT INTO character_inventory (character_id, item_id, quantity) 
                VALUES (?, ?, 1)`,
          args: [characterId, session.item_id]
        });
      }

      // Get item details for response
      const itemResult = await db.execute({
        sql: `SELECT * FROM items WHERE id = ?`,
        args: [session.item_id]
      });
      craftedItem = itemResult.rows[0];
    }

    // Delete crafting session
    await db.execute({
      sql: `DELETE FROM crafting_sessions WHERE id = ?`,
      args: [session.id]
    });

    return new Response(
      JSON.stringify({
        success: true,
        craftSuccess: success,
        xpGained,
        levelUp,
        newLevel: newProfessionLevel,
        craftedItem: craftedItem ? {
          name: (craftedItem as any).name,
          rarity: (craftedItem as any).rarity
        } : null,
        recipeName: session.recipe_name
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Crafting Complete API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to complete crafting" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
