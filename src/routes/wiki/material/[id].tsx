import { useParams, A } from "@solidjs/router";
import { createResource, Show, For } from "solid-js";
import WikiLayout from "~/components/WikiLayout";
import { db } from "~/lib/db";

async function fetchMaterial(id: string) {
  "use server";
  
  const materialId = parseInt(id);
  if (isNaN(materialId)) {
    throw new Error("Invalid material ID");
  }
  
  const result = await db.execute({
    sql: `SELECT * FROM crafting_materials WHERE id = ?`,
    args: [materialId]
  });
  
  if (result.rows.length === 0) {
    throw new Error("Material not found");
  }
  
  const material = result.rows[0] as any;
  
  // Fetch mob loot sources with grouped regions
  const mobLootResult = await db.execute({
    sql: `
      SELECT 
        mobs.id as mob_id,
        mobs.name as mob_name,
        mobs.level as mob_level,
        mobs.area as mob_area,
        mob_crafting_loot.drop_chance,
        mob_crafting_loot.min_quantity,
        mob_crafting_loot.max_quantity,
        (SELECT GROUP_CONCAT(r2.id || ':' || r2.name, '|')
         FROM (
           SELECT DISTINCT region_id FROM (
             SELECT region_id FROM region_mobs WHERE mob_id = mobs.id
             UNION
             SELECT sa.region_id FROM sub_area_mobs sam 
             JOIN sub_areas sa ON sam.sub_area_id = sa.id 
             WHERE sam.mob_id = mobs.id
           )
         ) mr
         JOIN regions r2 ON mr.region_id = r2.id
        ) as region_data
      FROM mob_crafting_loot
      JOIN mobs ON mob_crafting_loot.mob_id = mobs.id
      WHERE mob_crafting_loot.material_id = ?
      ORDER BY mobs.level, mobs.name
    `,
    args: [materialId]
  });
  
  // Fetch named mob loot sources
  const namedMobLootResult = await db.execute({
    sql: `
      SELECT 
        named_mobs.id as mob_id,
        named_mobs.name as mob_name,
        named_mobs.title as mob_title,
        named_mobs.level as mob_level,
        regions.name as region_name,
        named_mob_crafting_loot.drop_chance,
        named_mob_crafting_loot.min_quantity,
        named_mob_crafting_loot.max_quantity
      FROM named_mob_crafting_loot
      JOIN named_mobs ON named_mob_crafting_loot.named_mob_id = named_mobs.id
      LEFT JOIN regions ON named_mobs.region_id = regions.id
      WHERE named_mob_crafting_loot.material_id = ?
      ORDER BY named_mobs.level, named_mobs.name
    `,
    args: [materialId]
  });
  
  // Fetch quest reward sources
  const questRewardResult = await db.execute({
    sql: `
      SELECT 
        quests.id as quest_id,
        quests.name as quest_name,
        quests.min_level as quest_level,
        regions.name as region_name,
        quest_rewards.reward_amount as quantity
      FROM quest_rewards
      JOIN quests ON quest_rewards.quest_id = quests.id
      LEFT JOIN regions ON quests.region_id = regions.id
      WHERE quest_rewards.reward_type = 'crafting_material'
        AND quest_rewards.reward_material_id = ?
      ORDER BY quests.min_level, quests.name
    `,
    args: [materialId]
  });
  
  // Fetch recipe groups that use this material
  const recipesResult = await db.execute({
    sql: `
      SELECT DISTINCT
        rg.id as recipe_id,
        rg.name as recipe_name,
        rg.min_level as min_profession_level,
        rg.profession_type,
        rg.category
      FROM recipe_groups rg
      JOIN recipe_group_materials rgm ON rg.id = rgm.recipe_group_id
      WHERE rgm.material_id = ?
      ORDER BY rg.min_level, rg.name
    `,
    args: [materialId]
  });
  
  return {
    material,
    mobLoot: mobLootResult.rows,
    namedMobLoot: namedMobLootResult.rows,
    questRewards: questRewardResult.rows,
    recipes: recipesResult.rows
  };
}

export default function MaterialDetailPage() {
  const params = useParams();
  const [data] = createResource(() => params.id, fetchMaterial);
  
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "legendary": return "#ff8000";
      case "epic": return "#a335ee";
      case "rare": return "#f97316";
      case "uncommon": return "#3b82f6";
      default: return "#9ca3af";
    }
  };

  return (
    <WikiLayout>
      <div>
        <div style={{ "margin-bottom": "1rem" }}>
          <A href="/wiki/crafting" style={{ color: "var(--accent)" }}>
            ← Back to Crafting
          </A>
        </div>

        <Show when={!data.loading} fallback={<div class="card">Loading material details...</div>}>
          <Show when={!data.error} fallback={<div class="card">Error: {data.error?.message}</div>}>
            <Show when={data()}>
              {(materialData) => {
                const material = () => materialData().material;
                return (
                <div>
                  <h1 style={{ color: getRarityColor(material().rarity) }}>{material().name}</h1>
                  
                  <div class="card" style={{ "margin-bottom": "2rem" }}>
                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", gap: "2rem", "flex-wrap": "wrap" }}>
                      <div style={{ flex: 1, "min-width": "300px" }}>
                        <h2 style={{ "margin-top": "0" }}>Material Information</h2>
                        
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          <div>
                            <strong>Type:</strong> Crafting Material
                          </div>
                          
                          <div>
                            <strong>Rarity:</strong>{" "}
                            <span style={{ color: getRarityColor(material().rarity) }}>
                              {material().rarity}
                            </span>
                          </div>
                          
                          <Show when={material().is_special === 1}>
                            <div>
                              <strong>Special Material:</strong>{" "}
                              <span style={{ color: "var(--warning)" }}>
                                Yes (Quest/Dungeon Only)
                              </span>
                            </div>
                          </Show>
                        </div>
                      </div>

                      {material().description && (
                        <div style={{ flex: 1, "min-width": "300px" }}>
                          <h2 style={{ "margin-top": "0" }}>Description</h2>
                          <p style={{ color: "var(--text-secondary)" }}>
                            {material().description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Used In Recipes */}
                  <Show when={materialData().recipes.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Used In Recipes</h2>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={materialData().recipes}>
                          {(recipe: any) => (
                            <div style={{
                              padding: "0.75rem",
                              background: "var(--bg-light)",
                              "border-radius": "4px",
                              display: "flex",
                              "justify-content": "space-between",
                              "align-items": "center",
                              "flex-wrap": "wrap",
                              gap: "0.5rem"
                            }}>
                              <div style={{ flex: "1 1 200px" }}>
                                <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
                                  {recipe.recipe_name}
                                </div>
                                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                  {recipe.profession_type} • Level {recipe.min_profession_level} • {recipe.category}
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Loot Sources */}
                  <Show when={materialData().mobLoot.length > 0 || materialData().namedMobLoot.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Loot Sources</h2>
                      
                      <Show when={materialData().mobLoot.length > 0}>
                        <div style={{ "margin-bottom": "1.5rem" }}>
                          <h3 style={{ "font-size": "1.1rem", "margin-bottom": "0.75rem", color: "var(--text-secondary)" }}>
                            Regular Mobs ({materialData().mobLoot.length} sources)
                          </h3>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            <For each={materialData().mobLoot}>
                              {(loot: any) => (
                                <div style={{
                                  padding: "0.75rem",
                                  background: "var(--bg-light)",
                                  "border-radius": "4px",
                                  display: "flex",
                                  "justify-content": "space-between",
                                  "align-items": "center",
                                  "flex-wrap": "wrap",
                                  gap: "0.5rem"
                                }}>
                                  <div style={{ flex: "1 1 200px" }}>
                                    <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
                                      <A href={`/wiki/mob/${loot.mob_id}`} style={{ color: "inherit", "text-decoration": "none" }}>
                                        {loot.mob_name}
                                      </A>
                                    </div>
                                    <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                      Level {loot.mob_level} • {loot.mob_area}
                                      {loot.region_data && (
                                        <div style={{ "margin-top": "0.25rem" }}>
                                          Spawns in: {
                                            loot.region_data.split('|').map((region: string, index: number) => {
                                              const [id, name] = region.split(':');
                                              return (
                                                <>
                                                  {index > 0 && ', '}
                                                  <A href={`/wiki/region/${id}`} style={{ color: "var(--accent)", "text-decoration": "none" }}>
                                                    {name}
                                                  </A>
                                                </>
                                              );
                                            })
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ "text-align": "right" }}>
                                    <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                      Drop Rate
                                    </div>
                                    <div style={{ "font-weight": "bold", color: "var(--accent)" }}>
                                      {(loot.drop_chance * 100).toFixed(1)}%
                                    </div>
                                    <Show when={loot.max_quantity > 1}>
                                      <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                        Qty: {loot.min_quantity}-{loot.max_quantity}
                                      </div>
                                    </Show>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                      
                      <Show when={materialData().namedMobLoot.length > 0}>
                        <div>
                          <h3 style={{ "font-size": "1.1rem", "margin-bottom": "0.75rem", color: "var(--text-secondary)" }}>
                            Named Mobs & Bosses
                          </h3>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            <For each={materialData().namedMobLoot}>
                              {(loot: any) => (
                                <div style={{
                                  padding: "0.75rem",
                                  background: "var(--bg-light)",
                                  "border-radius": "4px",
                                  border: "1px solid var(--warning)",
                                  display: "flex",
                                  "justify-content": "space-between",
                                  "align-items": "center",
                                  "flex-wrap": "wrap",
                                  gap: "0.5rem"
                                }}>
                                  <div style={{ flex: "1 1 200px" }}>
                                    <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem", color: "var(--warning)" }}>
                                      {loot.mob_name}
                                      {loot.mob_title && <span style={{ "font-weight": "normal", color: "var(--text-secondary)" }}> {loot.mob_title}</span>}
                                    </div>
                                    <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                      Level {loot.mob_level} • {loot.region_name || 'Unknown Region'}
                                    </div>
                                  </div>
                                  <div style={{ "text-align": "right" }}>
                                    <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                      Drop Rate
                                    </div>
                                    <div style={{ "font-weight": "bold", color: "var(--warning)" }}>
                                      {(loot.drop_chance * 100).toFixed(1)}%
                                    </div>
                                    <Show when={loot.max_quantity > 1}>
                                      <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                        Qty: {loot.min_quantity}-{loot.max_quantity}
                                      </div>
                                    </Show>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </Show>

                  {/* Quest Rewards */}
                  <Show when={materialData().questRewards.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Quest Rewards</h2>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={materialData().questRewards}>
                          {(reward: any) => (
                            <A 
                              href={`/wiki/quest/${reward.quest_id}`}
                              style={{
                                padding: "0.75rem",
                                background: "var(--bg-light)",
                                "border-radius": "4px",
                                display: "flex",
                                "justify-content": "space-between",
                                "align-items": "center",
                                "flex-wrap": "wrap",
                                gap: "0.5rem",
                                "text-decoration": "none",
                                color: "inherit",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--bg-medium)";
                                e.currentTarget.style.transform = "translateX(4px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "var(--bg-light)";
                                e.currentTarget.style.transform = "translateX(0)";
                              }}
                            >
                              <div style={{ flex: "1 1 200px" }}>
                                <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem", color: "var(--accent)" }}>
                                  {reward.quest_name}
                                </div>
                                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                  Level {reward.quest_level} • {reward.region_name || 'Unknown Region'}
                                </div>
                              </div>
                              <div style={{ "text-align": "right" }}>
                                <Show when={reward.quantity > 1}>
                                  <div style={{ "font-weight": "bold", color: "var(--accent)" }}>
                                    x{reward.quantity}
                                  </div>
                                </Show>
                              </div>
                            </A>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* No Sources Warning */}
                  <Show when={
                    materialData().mobLoot.length === 0 && 
                    materialData().namedMobLoot.length === 0 && 
                    materialData().questRewards.length === 0
                  }>
                    <div class="card" style={{ 
                      "margin-bottom": "2rem",
                      border: "1px solid var(--warning)",
                      background: "rgba(251, 191, 36, 0.1)"
                    }}>
                      <h2 style={{ color: "var(--warning)" }}>No Known Sources</h2>
                      <p style={{ color: "var(--text-secondary)" }}>
                        This material currently has no known loot or quest sources. It may be:
                      </p>
                      <ul style={{ color: "var(--text-secondary)", "margin-top": "0.5rem" }}>
                        <li>Available through special events</li>
                        <li>Obtained from future content</li>
                        <li>A legacy material no longer in use</li>
                      </ul>
                    </div>
                  </Show>
                </div>
                );
              }}
            </Show>
          </Show>
        </Show>
      </div>
    </WikiLayout>
  );
}
