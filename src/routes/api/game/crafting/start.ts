import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, recipeId, rareMaterialId } = body;

    if (!characterId || !recipeId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get recipe group details
    const recipeResult = await db.execute({
      sql: `SELECT * FROM recipe_groups WHERE id = ?`,
      args: [recipeId]
    });

    if (recipeResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Recipe not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const recipe = recipeResult.rows[0] as any;

    // Check if this recipe has any named outputs that require rare materials
    const namedOutputsResult = await db.execute({
      sql: `SELECT DISTINCT ro.requires_rare_material_id, cm.name as material_name
            FROM recipe_outputs ro
            JOIN crafting_materials cm ON ro.requires_rare_material_id = cm.id
            WHERE ro.recipe_group_id = ? AND ro.is_named = 1 AND ro.requires_rare_material_id IS NOT NULL`,
      args: [recipeId]
    });

    // Check which rare materials the player has
    const availableRareMaterials = [];
    for (const namedOutput of namedOutputsResult.rows as any[]) {
      const playerMaterialResult = await db.execute({
        sql: `SELECT quantity FROM character_crafting_materials 
              WHERE character_id = ? AND material_id = ?`,
        args: [characterId, namedOutput.requires_rare_material_id]
      });

      const quantity = playerMaterialResult.rows.length > 0 
        ? (playerMaterialResult.rows[0] as any).quantity 
        : 0;

      if (quantity > 0) {
        availableRareMaterials.push({
          id: namedOutput.requires_rare_material_id,
          name: namedOutput.material_name,
          quantity
        });
      }
    }

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
    if (profession.level < recipe.min_level) {
      return new Response(JSON.stringify({ 
        error: `Requires ${recipe.profession_type} level ${recipe.min_level}` 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if crafting level can exceed character level / 2
    // Level 1 characters can craft at level 1, otherwise level / 2
    const maxCraftingLevel = character.level === 1 ? 1 : Math.floor(character.level / 2);
    if (profession.level > maxCraftingLevel) {
      return new Response(JSON.stringify({ 
        error: `Crafting level cannot exceed ${maxCraftingLevel} (Character level ${character.level} / 2)` 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If player has rare materials available and hasn't selected one, prompt them
    // rareMaterialId === -1 means user explicitly chose to use normal materials
    if (!rareMaterialId && rareMaterialId !== -1 && availableRareMaterials.length > 0) {
      return new Response(
        JSON.stringify({
          needsRareMaterialChoice: true,
          availableRareMaterials
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get recipe group materials
    const materialsResult = await db.execute({
      sql: `SELECT rgm.*, cm.name 
            FROM recipe_group_materials rgm 
            JOIN crafting_materials cm ON rgm.material_id = cm.id
            WHERE rgm.recipe_group_id = ?`,
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

    // Check if rare material is provided and player has it
    // rareMaterialId === -1 means user explicitly chose normal materials
    let usedRareMaterialId = null;
    if (rareMaterialId && rareMaterialId !== -1) {
      const rareMaterialResult = await db.execute({
        sql: `SELECT quantity FROM character_crafting_materials 
              WHERE character_id = ? AND material_id = ?`,
        args: [characterId, rareMaterialId]
      });

      const hasRareMaterial = rareMaterialResult.rows.length > 0 
        ? (rareMaterialResult.rows[0] as any).quantity 
        : 0;

      if (hasRareMaterial < 1) {
        return new Response(JSON.stringify({ 
          error: `You don't have the required rare material` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Consume 1 rare material
      await db.execute({
        sql: `UPDATE character_crafting_materials 
              SET quantity = quantity - 1 
              WHERE character_id = ? AND material_id = ?`,
        args: [characterId, rareMaterialId]
      });

      usedRareMaterialId = rareMaterialId;
    }

    // Consume materials
    for (const material of materialsResult.rows as any[]) {
      await db.execute({
        sql: `UPDATE character_crafting_materials 
              SET quantity = quantity - ? 
              WHERE character_id = ? AND material_id = ?`,
        args: [material.quantity, characterId, material.material_id]
      });
    }

    // Calculate target position and radius based on difficulty
    // Difficulty = recipe level vs profession level
    const levelDiff = recipe.min_level - profession.level;
    
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

    // Create crafting session (still using recipe_id column for now - it now holds recipe_group_id)
    await db.execute({
      sql: `INSERT INTO crafting_sessions 
            (character_id, recipe_id, profession_type, pin_x, pin_y, target_x, target_y, target_radius, rare_material_id, start_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        characterId,
        recipeId, // This is actually recipe_group_id now
        recipe.profession_type,
        startX,
        startY,
        targetX,
        targetY,
        targetRadius,
        usedRareMaterialId
      ]
    });

    // Get updated materials after consumption
    const updatedMaterialsResult = await db.execute({
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
        success: true,
        session: {
          recipeId: recipe.id,
          pinX: startX,
          pinY: startY,
          targetX,
          targetY,
          targetRadius,
          craftTimeSeconds: recipe.craft_time_seconds,
          recipeName: recipe.name,
          profession: recipe.profession_type
        },
        materials: updatedMaterialsResult.rows
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
