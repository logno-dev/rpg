import { useParams, A } from "@solidjs/router";
import { createResource, Show, For } from "solid-js";
import WikiLayout from "~/components/WikiLayout";
import { db } from "~/lib/db";

async function fetchMob(id: string) {
  "use server";
  
  const mobId = parseInt(id);
  if (isNaN(mobId)) {
    throw new Error("Invalid mob ID");
  }
  
  const result = await db.execute({
    sql: `SELECT * FROM mobs WHERE id = ?`,
    args: [mobId]
  });
  
  if (result.rows.length === 0) {
    throw new Error("Mob not found");
  }
  
  const mob = result.rows[0] as any;
  
  // Get spawn locations (regions)
  const regionsResult = await db.execute({
    sql: `
      SELECT 
        r.id,
        r.name,
        rm.spawn_weight
      FROM region_mobs rm
      JOIN regions r ON rm.region_id = r.id
      WHERE rm.mob_id = ?
      ORDER BY r.min_level
    `,
    args: [mobId]
  });
  
  // Get spawn locations (sub-areas)
  const subAreasResult = await db.execute({
    sql: `
      SELECT 
        sa.id,
        sa.name,
        r.id as region_id,
        r.name as region_name,
        sam.spawn_weight,
        sam.level_variance
      FROM sub_area_mobs sam
      JOIN sub_areas sa ON sam.sub_area_id = sa.id
      JOIN regions r ON sa.region_id = r.id
      WHERE sam.mob_id = ?
      ORDER BY r.min_level, sa.name
    `,
    args: [mobId]
  });
  
  // Get item loot
  const itemLootResult = await db.execute({
    sql: `
      SELECT 
        i.id,
        i.name,
        i.rarity,
        ml.drop_chance,
        ml.quantity_min,
        ml.quantity_max
      FROM mob_loot ml
      JOIN items i ON ml.item_id = i.id
      WHERE ml.mob_id = ?
      ORDER BY ml.drop_chance DESC, i.rarity DESC, i.name
    `,
    args: [mobId]
  });
  
  // Get material loot
  const materialLootResult = await db.execute({
    sql: `
      SELECT 
        cm.id,
        cm.name,
        cm.rarity,
        mcl.drop_chance,
        mcl.min_quantity,
        mcl.max_quantity
      FROM mob_crafting_loot mcl
      JOIN crafting_materials cm ON mcl.material_id = cm.id
      WHERE mcl.mob_id = ?
      ORDER BY mcl.drop_chance DESC, cm.rarity DESC, cm.name
    `,
    args: [mobId]
  });
  
  return {
    mob,
    regions: regionsResult.rows,
    subAreas: subAreasResult.rows,
    itemLoot: itemLootResult.rows,
    materialLoot: materialLootResult.rows
  };
}

export default function MobDetailPage() {
  const params = useParams();
  const [data] = createResource(() => params.id, fetchMob);
  
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
          <A href="/wiki/world" style={{ color: "var(--accent)" }}>
            ← Back to World
          </A>
        </div>

        <Show when={!data.loading} fallback={<div class="card">Loading mob details...</div>}>
          <Show when={!data.error} fallback={<div class="card">Error: {data.error?.message}</div>}>
            <Show when={data()}>
              {(mobData) => {
                const mob = () => mobData().mob;
                return (
                <div>
                  <h1>{mob().name}</h1>
                  
                  <div class="card" style={{ "margin-bottom": "2rem" }}>
                    <h2 style={{ "margin-top": "0" }}>Mob Information</h2>
                    
                    <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Level</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold" }}>
                          {mob().level}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Health</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--danger)" }}>
                          {mob().max_health}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Damage</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--warning)" }}>
                          {mob().damage_min}-{mob().damage_max}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Defense</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--accent)" }}>
                          {mob().defense || 0}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Attack Speed</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold" }}>
                          {mob().attack_speed || 1.0}x
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Evasiveness</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold" }}>
                          {mob().evasiveness || 10}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ "margin-top": "1.5rem", display: "grid", gap: "0.5rem" }}>
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Area Type</div>
                        <div style={{ "text-transform": "capitalize" }}>
                          {mob().area}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Behavior</div>
                        <div style={{ color: mob().aggressive === 1 ? "var(--danger)" : "var(--success)" }}>
                          {mob().aggressive === 1 ? "Aggressive" : "Passive"}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Experience Reward</div>
                        <div style={{ "font-weight": "bold", color: "var(--accent)" }}>
                          {mob().experience_reward} XP
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Gold Reward</div>
                        <div style={{ "font-weight": "bold", color: "var(--warning)" }}>
                          {mob().gold_min}-{mob().gold_max} Gold
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spawn Locations */}
                  <Show when={mobData().regions.length > 0 || mobData().subAreas.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Spawn Locations</h2>
                      
                      <Show when={mobData().regions.length > 0}>
                        <div style={{ "margin-bottom": mobData().subAreas.length > 0 ? "1.5rem" : "0" }}>
                          <h3 style={{ "font-size": "1.1rem", "margin-bottom": "0.75rem", color: "var(--text-secondary)" }}>
                            Regions
                          </h3>
                          <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.5rem" }}>
                            <For each={mobData().regions}>
                              {(region: any) => (
                                <A 
                                  href={`/wiki/region/${region.id}`}
                                  style={{
                                    padding: "0.5rem 1rem",
                                    background: "var(--bg-light)",
                                    "border-radius": "4px",
                                    "text-decoration": "none",
                                    color: "inherit",
                                    border: "1px solid var(--border)",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--accent)";
                                    e.currentTarget.style.borderColor = "var(--accent)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--bg-light)";
                                    e.currentTarget.style.borderColor = "var(--border)";
                                  }}
                                >
                                  {region.name}
                                </A>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                      
                      <Show when={mobData().subAreas.length > 0}>
                        <div>
                          <h3 style={{ "font-size": "1.1rem", "margin-bottom": "0.75rem", color: "var(--text-secondary)" }}>
                            Sub-Areas
                          </h3>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            <For each={mobData().subAreas}>
                              {(subArea: any) => (
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
                                  <div>
                                    <div style={{ "font-weight": "bold" }}>
                                      {subArea.name}
                                    </div>
                                    <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                      <A href={`/wiki/region/${subArea.region_id}`} style={{ color: "var(--accent)", "text-decoration": "none" }}>
                                        {subArea.region_name}
                                      </A>
                                      {subArea.level_variance > 0 && ` • ±${subArea.level_variance} level variance`}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </Show>

                  {/* Item Loot */}
                  <Show when={mobData().itemLoot.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Item Drops</h2>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={mobData().itemLoot}>
                          {(loot: any) => (
                            <A 
                              href={`/wiki/equipment/${loot.id}`}
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
                                <div style={{ "font-weight": "bold", color: getRarityColor(loot.rarity) }}>
                                  {loot.name}
                                </div>
                                <div style={{ "font-size": "0.875rem", color: getRarityColor(loot.rarity), "text-transform": "capitalize" }}>
                                  {loot.rarity}
                                </div>
                              </div>
                              <div style={{ "text-align": "right" }}>
                                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                  Drop Rate
                                </div>
                                <div style={{ "font-weight": "bold", color: "var(--accent)" }}>
                                  {(loot.drop_chance * 100).toFixed(1)}%
                                </div>
                                <Show when={loot.quantity_max > 1}>
                                  <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                    Qty: {loot.quantity_min}-{loot.quantity_max}
                                  </div>
                                </Show>
                              </div>
                            </A>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Material Loot */}
                  <Show when={mobData().materialLoot.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Material Drops</h2>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={mobData().materialLoot}>
                          {(loot: any) => (
                            <A 
                              href={`/wiki/material/${loot.id}`}
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
                                <div style={{ "font-weight": "bold", color: getRarityColor(loot.rarity) }}>
                                  {loot.name}
                                </div>
                                <div style={{ "font-size": "0.875rem", color: getRarityColor(loot.rarity), "text-transform": "capitalize" }}>
                                  {loot.rarity}
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
                            </A>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* No Loot */}
                  <Show when={mobData().itemLoot.length === 0 && mobData().materialLoot.length === 0}>
                    <div class="card" style={{ 
                      "margin-bottom": "2rem",
                      border: "1px solid var(--text-secondary)",
                      background: "rgba(128, 128, 128, 0.1)"
                    }}>
                      <h2 style={{ color: "var(--text-secondary)" }}>No Loot</h2>
                      <p style={{ color: "var(--text-secondary)" }}>
                        This mob does not drop any items or materials (only gold and experience).
                      </p>
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
