import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function GET(event: APIEvent) {
  const url = new URL(event.request.url);
  const characterId = url.searchParams.get("characterId");
  const profession = url.searchParams.get("profession");

  if (!characterId || !profession) {
    return new Response(JSON.stringify({ error: "Character ID and profession are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get recipe groups for the specific profession
    const recipesResult = await db.execute({
      sql: `SELECT 
              rg.id,
              rg.name,
              rg.description,
              rg.profession_type,
              rg.category,
              rg.min_level,
              rg.max_level,
              rg.craft_time_seconds,
              rg.base_experience
            FROM recipe_groups rg
            WHERE rg.profession_type = ?
            ORDER BY rg.category, rg.min_level, rg.name`,
      args: [profession]
    });

    // Get ALL recipe materials for this profession's recipe groups in a single query
    const recipeGroupIds = recipesResult.rows.map(r => r.id);
    
    if (recipeGroupIds.length === 0) {
      return new Response(
        JSON.stringify({ recipes: [] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const placeholders = recipeGroupIds.map(() => '?').join(',');
    const allMaterialsResult = await db.execute({
      sql: `SELECT 
              rgm.recipe_group_id,
              rgm.material_id,
              cm.name as material_name,
              rgm.quantity
            FROM recipe_group_materials rgm
            JOIN crafting_materials cm ON rgm.material_id = cm.id
            WHERE rgm.recipe_group_id IN (${placeholders})
            ORDER BY rgm.recipe_group_id`,
      args: recipeGroupIds
    });

    // Group materials by recipe_group_id
    const materialsByRecipe = new Map();
    for (const material of allMaterialsResult.rows) {
      const recipeGroupId = material.recipe_group_id;
      if (!materialsByRecipe.has(recipeGroupId)) {
        materialsByRecipe.set(recipeGroupId, []);
      }
      materialsByRecipe.get(recipeGroupId).push({
        material_id: material.material_id,
        material_name: material.material_name,
        quantity: material.quantity
      });
    }

    // Build recipe groups with their materials
    const recipes = recipesResult.rows.map(recipe => ({
      ...recipe,
      level_required: recipe.min_level, // For backwards compatibility
      materials: materialsByRecipe.get(recipe.id) || []
    }));

    return new Response(
      JSON.stringify({ recipes }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Crafting Recipes API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch recipes" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
