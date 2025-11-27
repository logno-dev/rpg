import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, success, quality } = body;

    if (!characterId || success === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine quality tier from success (if not provided by minigame)
    const itemQuality = quality || (success ? 'common' : null);

    // Get active crafting session
    const sessionResult = await db.execute({
      sql: `SELECT cs.*, rg.name as recipe_name, rg.base_experience,
              cp.level as profession_level, cp.experience as profession_exp
            FROM crafting_sessions cs
            JOIN recipe_groups rg ON cs.recipe_id = rg.id
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

    // Get character level to check max crafting level
    const charResult = await db.execute({
      sql: `SELECT level FROM characters WHERE id = ?`,
      args: [characterId]
    });
    const characterLevel = (charResult.rows[0] as any).level;
    // Level 1 characters can craft at level 1, otherwise level / 2
    const maxCraftingLevel = characterLevel === 1 ? 1 : Math.floor(characterLevel / 2);

    // Calculate XP gained (100% on success, 25% on failure)
    const xpMultiplier = success ? 1.0 : 0.25;
    const xpGained = Math.floor(session.base_experience * xpMultiplier);

    // Update profession XP
    let newProfessionExp = session.profession_exp + xpGained;
    
    // Check for level up (matches character XP formula: level * 125)
    const CRAFTING_XP_BASE = 125;
    let newProfessionLevel = session.profession_level;
    let levelUp = false;
    let finalExp = newProfessionExp;

    if (newProfessionExp >= CRAFTING_XP_BASE * session.profession_level) {
      // Only level up if not at max
      if (session.profession_level < maxCraftingLevel) {
        newProfessionLevel = session.profession_level + 1;
        finalExp = newProfessionExp - (CRAFTING_XP_BASE * session.profession_level);
        levelUp = true;
      }
    }

    // Cap experience at max level
    if (newProfessionLevel >= maxCraftingLevel) {
      const maxExp = CRAFTING_XP_BASE * maxCraftingLevel;
      if (finalExp > maxExp) {
        finalExp = maxExp;
      }
    }

    await db.execute({
      sql: `UPDATE character_professions 
            SET level = ?, experience = ?
            WHERE character_id = ? AND profession_type = ?`,
      args: [newProfessionLevel, finalExp, characterId, session.profession_type]
    });

    let craftedItem = null;
    let selectedItemId = null;

    // If successful, select item from probability pool
    if (success && itemQuality) {
      // Get all possible outputs for this recipe group
      // If rare material was used, include named items; otherwise exclude them
      let outputsQuery;
      let outputsArgs;

      if (session.rare_material_id) {
        // Include items that either don't require rare materials OR require the specific rare material used
        outputsQuery = `SELECT ro.*, i.name as item_name, i.stackable
              FROM recipe_outputs ro
              JOIN items i ON ro.item_id = i.id
              WHERE ro.recipe_group_id = ? 
              AND ro.min_profession_level <= ?
              AND (ro.requires_rare_material_id IS NULL OR ro.requires_rare_material_id = ?)
              ORDER BY ro.min_profession_level`;
        outputsArgs = [session.recipe_id, session.profession_level, session.rare_material_id];
      } else {
        // Exclude all named items
        outputsQuery = `SELECT ro.*, i.name as item_name, i.stackable
              FROM recipe_outputs ro
              JOIN items i ON ro.item_id = i.id
              WHERE ro.recipe_group_id = ? 
              AND ro.min_profession_level <= ?
              AND ro.is_named = 0
              ORDER BY ro.min_profession_level`;
        outputsArgs = [session.recipe_id, session.profession_level];
      }

      const outputsResult = await db.execute({
        sql: outputsQuery,
        args: outputsArgs
      });

      if (outputsResult.rows.length > 0) {
        // Calculate probability weights for each item
        const isHighQuality = itemQuality === 'superior' || itemQuality === 'masterwork';
        
        const weightedOutputs = outputsResult.rows.map((output: any) => {
          // Base weight
          let weight = output.base_weight;
          
          // Add weight per level above minimum
          const levelsAboveMin = session.profession_level - output.min_profession_level;
          weight += levelsAboveMin * output.weight_per_level;
          
          // Add quality bonus for high quality crafts
          if (isHighQuality) {
            weight += output.quality_bonus_weight;
          }
          
          return {
            item_id: output.item_id,
            weight: Math.max(1, weight), // Ensure at least 1
            name: output.item_name,
            stackable: output.stackable
          };
        });

        // Select item based on weighted random
        const totalWeight = weightedOutputs.reduce((sum, o) => sum + o.weight, 0);
        let random = Math.random() * totalWeight;
        
        let selectedOutput = weightedOutputs[0];
        for (const output of weightedOutputs) {
          random -= output.weight;
          if (random <= 0) {
            selectedOutput = output;
            break;
          }
        }

        selectedItemId = selectedOutput.item_id;

        // Get full item details
        const itemResult = await db.execute({
          sql: `SELECT * FROM items WHERE id = ?`,
          args: [selectedItemId]
        });
        craftedItem = itemResult.rows[0];

        if ((craftedItem as any).stackable) {
          // Stackable items (potions, etc) - check for existing stack with same quality
          const invResult = await db.execute({
            sql: `SELECT * FROM character_inventory 
                  WHERE character_id = ? AND item_id = ? AND quality = ?`,
            args: [characterId, selectedItemId, itemQuality]
          });

          if (invResult.rows.length > 0) {
            // Stack exists, increase quantity
            await db.execute({
              sql: `UPDATE character_inventory SET quantity = quantity + 1 
                    WHERE character_id = ? AND item_id = ? AND quality = ?`,
              args: [characterId, selectedItemId, itemQuality]
            });
          } else {
            // New stack
            await db.execute({
              sql: `INSERT INTO character_inventory (character_id, item_id, quantity, quality) 
                    VALUES (?, ?, 1, ?)`,
              args: [characterId, selectedItemId, itemQuality]
            });
          }
        } else {
          // Non-stackable items (equipment) - always create new entry
          await db.execute({
            sql: `INSERT INTO character_inventory (character_id, item_id, quantity, quality) 
                  VALUES (?, ?, 1, ?)`,
            args: [characterId, selectedItemId, itemQuality]
          });
        }
      }
    }

    // Delete crafting session
    await db.execute({
      sql: `DELETE FROM crafting_sessions WHERE id = ?`,
      args: [session.id]
    });

    // Apply quality multipliers to stats for display
    let fullItemWithQuality = null;
    if (craftedItem && itemQuality) {
      const multiplier = getQualityMultiplier(itemQuality);
      const item = craftedItem as any;
      
      fullItemWithQuality = {
        ...item,
        quality: itemQuality,
        // Apply quality multipliers (using round for better scaling on low stat items)
        strength_bonus: Math.round((item.strength_bonus || 0) * multiplier),
        dexterity_bonus: Math.round((item.dexterity_bonus || 0) * multiplier),
        constitution_bonus: Math.round((item.constitution_bonus || 0) * multiplier),
        intelligence_bonus: Math.round((item.intelligence_bonus || 0) * multiplier),
        wisdom_bonus: Math.round((item.wisdom_bonus || 0) * multiplier),
        charisma_bonus: Math.round((item.charisma_bonus || 0) * multiplier),
        damage_min: Math.round((item.damage_min || 0) * multiplier),
        damage_max: Math.round((item.damage_max || 0) * multiplier),
        armor: Math.round((item.armor || 0) * multiplier),
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        craftSuccess: success,
        xpGained,
        levelUp,
        newLevel: newProfessionLevel,
        newExperience: finalExp,
        professionType: session.profession_type,
        craftedItem: craftedItem ? {
          name: (craftedItem as any).name,
          rarity: (craftedItem as any).rarity,
          quality: itemQuality
        } : null,
        fullItem: fullItemWithQuality,
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

function getQualityMultiplier(quality: string): number {
  const multipliers: Record<string, number> = {
    common: 1.0,
    fine: 1.05,
    superior: 1.10,
    masterwork: 1.15,
  };
  return multipliers[quality] || 1.0;
}
