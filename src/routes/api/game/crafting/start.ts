import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, recipeId } = body;

    if (!characterId || !recipeId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get recipe details
    const recipeResult = await db.execute({
      sql: `SELECT * FROM recipes WHERE id = ?`,
      args: [recipeId]
    });

    if (recipeResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Recipe not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const recipe = recipeResult.rows[0] as any;

    // Get character
    const charResult = await db.execute({
      sql: `SELECT * FROM characters WHERE id = ?`,
      args: [characterId]
    });
    const character = charResult.rows[0] as any;

    // Get profession level
    const profResult = await db.execute({
      sql: `SELECT * FROM character_professions WHERE character_id = ? AND profession_type = ?`,
      args: [characterId, recipe.profession_type]
    });

    if (profResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Profession not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const profession = profResult.rows[0] as any;

    // Check level requirement
    if (profession.level < recipe.level_required) {
      return new Response(JSON.stringify({ 
        error: `Requires ${recipe.profession_type} level ${recipe.level_required}` 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if crafting level can exceed character level / 2
    const maxCraftingLevel = Math.floor(character.level / 2);
    if (profession.level > maxCraftingLevel) {
      return new Response(JSON.stringify({ 
        error: `Crafting level cannot exceed ${maxCraftingLevel} (Character level ${character.level} / 2)` 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get recipe materials
    const materialsResult = await db.execute({
      sql: `SELECT rm.*, cm.name 
            FROM recipe_materials rm 
            JOIN crafting_materials cm ON rm.material_id = cm.id
            WHERE rm.recipe_id = ?`,
      args: [recipeId]
    });

    // Check if player has enough materials
    for (const material of materialsResult.rows as any[]) {
      const charMaterialResult = await db.execute({
        sql: `SELECT quantity FROM character_crafting_materials 
              WHERE character_id = ? AND material_id = ?`,
        args: [characterId, material.material_id]
      });

      const hasQuantity = charMaterialResult.rows.length > 0 
        ? (charMaterialResult.rows[0] as any).quantity 
        : 0;

      if (hasQuantity < material.quantity) {
        return new Response(JSON.stringify({ 
          error: `Not enough ${material.name} (need ${material.quantity}, have ${hasQuantity})` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Consume materials
    console.log('[Crafting Start] Consuming materials for character', characterId);
    for (const material of materialsResult.rows as any[]) {
      console.log('[Crafting Start] Consuming', material.quantity, 'x', material.name, '(material_id:', material.material_id, ')');
      const result = await db.execute({
        sql: `UPDATE character_crafting_materials 
              SET quantity = quantity - ? 
              WHERE character_id = ? AND material_id = ?`,
        args: [material.quantity, characterId, material.material_id]
      });
      console.log('[Crafting Start] Update result:', result.rowsAffected, 'rows affected');
    }
    console.log('[Crafting Start] Material consumption complete');

    // Calculate target position and radius based on difficulty
    // Difficulty = recipe level vs profession level
    const levelDiff = recipe.level_required - profession.level;
    
    // Target radius: larger if player is over-leveled, smaller if under-leveled
    // Range: 2 (hard) to 5 (easy)
    let targetRadius = 3.5 - (levelDiff * 0.3);
    targetRadius = Math.max(2, Math.min(5, targetRadius));

    // Random target position within bounds
    const maxTargetDistance = 7; // Max distance from center
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * maxTargetDistance;
    const targetX = Math.round(Math.cos(angle) * distance);
    const targetY = Math.round(Math.sin(angle) * distance);

    // Random starting position on the rim of the grid (radius ~9)
    const rimRadius = 9;
    const startAngle = Math.random() * Math.PI * 2;
    const startX = Math.round(Math.cos(startAngle) * rimRadius);
    const startY = Math.round(Math.sin(startAngle) * rimRadius);

    // Create crafting session
    await db.execute({
      sql: `INSERT INTO crafting_sessions 
            (character_id, recipe_id, profession_type, pin_x, pin_y, target_x, target_y, target_radius, start_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        characterId,
        recipeId,
        recipe.profession_type,
        startX,
        startY,
        targetX,
        targetY,
        targetRadius
      ]
    });

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          pinX: startX,
          pinY: startY,
          targetX,
          targetY,
          targetRadius,
          craftTimeSeconds: recipe.craft_time_seconds,
          recipeName: recipe.name,
          profession: recipe.profession_type
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Crafting Start API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to start crafting" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
