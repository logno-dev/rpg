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
    // Get recipes for the specific profession
    const recipesResult = await db.execute({
      sql: `SELECT 
              r.id,
              r.name,
              r.profession_type,
              r.level_required,
              r.craft_time_seconds,
              r.base_experience
            FROM recipes r
            WHERE r.profession_type = ?
            ORDER BY r.level_required, r.name`,
      args: [profession]
    });

    // Get ALL recipe materials for this profession's recipes in a single query
    const recipeIds = recipesResult.rows.map(r => r.id);
    
    if (recipeIds.length === 0) {
      return new Response(
        JSON.stringify({ recipes: [] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const placeholders = recipeIds.map(() => '?').join(',');
    const allMaterialsResult = await db.execute({
      sql: `SELECT 
              rm.recipe_id,
              rm.material_id,
              cm.name as material_name,
              rm.quantity
            FROM recipe_materials rm
            JOIN crafting_materials cm ON rm.material_id = cm.id
            WHERE rm.recipe_id IN (${placeholders})
            ORDER BY rm.recipe_id`,
      args: recipeIds
    });

    // Group materials by recipe_id
    const materialsByRecipe = new Map();
    for (const material of allMaterialsResult.rows) {
      const recipeId = material.recipe_id;
      if (!materialsByRecipe.has(recipeId)) {
        materialsByRecipe.set(recipeId, []);
      }
      materialsByRecipe.get(recipeId).push({
        material_id: material.material_id,
        material_name: material.material_name,
        quantity: material.quantity
      });
    }

    // Build recipes with their materials
    const recipes = recipesResult.rows.map(recipe => ({
      ...recipe,
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
