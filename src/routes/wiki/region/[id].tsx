import { useParams, A } from "@solidjs/router";
import { createResource, Show, For } from "solid-js";
import WikiLayout from "~/components/WikiLayout";
import { db } from "~/lib/db";

async function fetchRegion(id: string) {
  "use server";
  
  const regionId = parseInt(id);
  if (isNaN(regionId)) {
    throw new Error("Invalid region ID");
  }
  
  const result = await db.execute({
    sql: `SELECT * FROM regions WHERE id = ?`,
    args: [regionId]
  });
  
  if (result.rows.length === 0) {
    throw new Error("Region not found");
  }
  
  const region = result.rows[0] as any;
  
  // Fetch sub-areas
  const subAreasResult = await db.execute({
    sql: `
      SELECT * FROM sub_areas 
      WHERE region_id = ?
      ORDER BY min_level, name
    `,
    args: [regionId]
  });
  
  // Fetch mobs spawning in this region (via region_mobs)
  const regionMobsResult = await db.execute({
    sql: `
      SELECT 
        m.id,
        m.name,
        m.level,
        m.area,
        m.max_health,
        m.damage_min,
        m.damage_max,
        rm.spawn_weight
      FROM region_mobs rm
      JOIN mobs m ON rm.mob_id = m.id
      WHERE rm.region_id = ?
      ORDER BY m.level, m.name
    `,
    args: [regionId]
  });
  
  // Fetch mobs spawning in sub-areas
  const subAreaMobsResult = await db.execute({
    sql: `
      SELECT 
        sa.id as sub_area_id,
        sa.name as sub_area_name,
        m.id as mob_id,
        m.name as mob_name,
        m.level as mob_level,
        m.area as mob_area,
        sam.spawn_weight,
        sam.level_variance
      FROM sub_area_mobs sam
      JOIN sub_areas sa ON sam.sub_area_id = sa.id
      JOIN mobs m ON sam.mob_id = m.id
      WHERE sa.region_id = ?
      ORDER BY sa.name, m.level, m.name
    `,
    args: [regionId]
  });
  
  // Organize sub-area mobs by sub-area
  const mobsBySubArea: Record<number, any[]> = {};
  subAreaMobsResult.rows.forEach((row: any) => {
    if (!mobsBySubArea[row.sub_area_id]) {
      mobsBySubArea[row.sub_area_id] = [];
    }
    mobsBySubArea[row.sub_area_id].push(row);
  });
  
  // Fetch named mobs
  const namedMobsResult = await db.execute({
    sql: `
      SELECT 
        id,
        name,
        title,
        level,
        description
      FROM named_mobs
      WHERE region_id = ?
      ORDER BY level, name
    `,
    args: [regionId]
  });
  
  // Fetch dungeons
  const dungeonsResult = await db.execute({
    sql: `
      SELECT 
        id,
        name,
        description,
        required_level
      FROM dungeons
      WHERE region_id = ?
      ORDER BY required_level, name
    `,
    args: [regionId]
  });
  
  return {
    region,
    subAreas: subAreasResult.rows.map((sa: any) => ({
      ...sa,
      mobs: mobsBySubArea[sa.id] || []
    })),
    regionMobs: regionMobsResult.rows,
    namedMobs: namedMobsResult.rows,
    dungeons: dungeonsResult.rows
  };
}

export default function RegionDetailPage() {
  const params = useParams();
  const [data] = createResource(() => params.id, fetchRegion);

  return (
    <WikiLayout>
      <div>
        <div style={{ "margin-bottom": "1rem" }}>
          <A href="/wiki/world" style={{ color: "var(--accent)" }}>
            ← Back to World
          </A>
        </div>

        <Show when={!data.loading} fallback={<div class="card">Loading region details...</div>}>
          <Show when={!data.error} fallback={<div class="card">Error: {data.error?.message}</div>}>
            <Show when={data()}>
              {(regionData) => {
                const region = () => regionData().region;
                return (
                <div>
                  <h1>{region().name}</h1>
                  
                  <div class="card" style={{ "margin-bottom": "2rem" }}>
                    <h2 style={{ "margin-top": "0" }}>Region Information</h2>
                    
                    <div style={{ display: "grid", gap: "1rem" }}>
                      <div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Description</div>
                        <p style={{ margin: "0.25rem 0 0 0" }}>
                          {region().description || "No description available"}
                        </p>
                      </div>
                      
                      <div style={{ display: "flex", gap: "2rem", "flex-wrap": "wrap" }}>
                        <div>
                          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Level Range</div>
                          <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                            {region().min_level} - {region().max_level}
                          </div>
                        </div>
                        
                        <Show when={region().locked === 1}>
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Status</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--warning)" }}>
                              Locked
                            </div>
                          </div>
                        </Show>
                        
                        <Show when={region().unlock_requirement}>
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Unlock Requirement</div>
                            <div style={{ "font-size": "1rem", color: "var(--warning)" }}>
                              {region().unlock_requirement}
                            </div>
                          </div>
                        </Show>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Areas */}
                  <Show when={regionData().subAreas.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Sub-Areas</h2>
                      <div style={{ display: "grid", gap: "1rem" }}>
                        <For each={regionData().subAreas}>
                          {(subArea: any) => (
                            <div style={{
                              padding: "1rem",
                              background: "var(--bg-light)",
                              "border-radius": "6px",
                              border: "1px solid var(--border)"
                            }}>
                              <div style={{ "margin-bottom": "0.75rem" }}>
                                <h3 style={{ margin: "0 0 0.5rem 0", "font-size": "1.1rem" }}>
                                  {subArea.name}
                                </h3>
                                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                                  Level {subArea.min_level}-{subArea.max_level}
                                </div>
                                <Show when={subArea.description}>
                                  <p style={{ margin: "0.5rem 0 0 0", "font-size": "0.9rem", color: "var(--text-secondary)" }}>
                                    {subArea.description}
                                  </p>
                                </Show>
                              </div>
                              
                              <Show when={subArea.mobs.length > 0}>
                                <div>
                                  <div style={{ "font-size": "0.875rem", "font-weight": "bold", "margin-bottom": "0.5rem" }}>
                                    Mobs in this area:
                                  </div>
                                  <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.5rem" }}>
                                    <For each={subArea.mobs}>
                                      {(mob: any) => (
                                        <A 
                                          href={`/wiki/mob/${mob.mob_id}`}
                                          style={{
                                            padding: "0.25rem 0.75rem",
                                            background: "var(--bg-medium)",
                                            "border-radius": "4px",
                                            "font-size": "0.875rem",
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
                                            e.currentTarget.style.background = "var(--bg-medium)";
                                            e.currentTarget.style.borderColor = "var(--border)";
                                          }}
                                        >
                                          {mob.mob_name} (Lv {mob.mob_level})
                                        </A>
                                      )}
                                    </For>
                                  </div>
                                </div>
                              </Show>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Region Mobs */}
                  <Show when={regionData().regionMobs.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Region Mobs</h2>
                      <p style={{ "font-size": "0.9rem", color: "var(--text-secondary)", "margin-top": "0" }}>
                        These mobs can spawn anywhere in the region.
                      </p>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={regionData().regionMobs}>
                          {(mob: any) => (
                            <A 
                              href={`/wiki/mob/${mob.id}`}
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
                                <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
                                  {mob.name}
                                </div>
                                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                  Level {mob.level} • {mob.area}
                                </div>
                              </div>
                              <div style={{ "text-align": "right" }}>
                                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                  HP: {mob.max_health} • DMG: {mob.damage_min}-{mob.damage_max}
                                </div>
                              </div>
                            </A>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Named Mobs & Bosses */}
                  <Show when={regionData().namedMobs.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Named Mobs & Bosses</h2>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={regionData().namedMobs}>
                          {(mob: any) => (
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
                                  {mob.name}
                                  {mob.title && <span style={{ "font-weight": "normal", color: "var(--text-secondary)" }}> {mob.title}</span>}
                                </div>
                                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                  Level {mob.level}
                                  {mob.description && ` • ${mob.description}`}
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Dungeons */}
                  <Show when={regionData().dungeons.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Dungeons</h2>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={regionData().dungeons}>
                          {(dungeon: any) => (
                            <div style={{
                              padding: "0.75rem",
                              background: "var(--bg-light)",
                              "border-radius": "4px",
                              border: "1px solid var(--accent)"
                            }}>
                              <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem", color: "var(--accent)" }}>
                                {dungeon.name}
                              </div>
                              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                                Required Level: {dungeon.required_level}
                              </div>
                              <Show when={dungeon.description}>
                                <p style={{ margin: "0.5rem 0 0 0", "font-size": "0.9rem", color: "var(--text-secondary)" }}>
                                  {dungeon.description}
                                </p>
                              </Show>
                            </div>
                          )}
                        </For>
                      </div>
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
