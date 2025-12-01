import { useParams, A } from "@solidjs/router";
import { createResource, Show, For } from "solid-js";
import WikiLayout from "~/components/WikiLayout";
import { db } from "~/lib/db";

async function fetchAbility(id: string) {
  "use server";
  
  const abilityId = parseInt(id);
  if (isNaN(abilityId)) {
    throw new Error("Invalid ability ID");
  }
  
  // Fetch ability details
  const abilityResult = await db.execute({
    sql: `SELECT * FROM abilities WHERE id = ?`,
    args: [abilityId]
  });
  
  if (abilityResult.rows.length === 0) {
    throw new Error("Ability not found");
  }
  
  // Fetch ability effects
  const effectsResult = await db.execute({
    sql: `SELECT * FROM ability_effects WHERE ability_id = ? ORDER BY effect_order ASC`,
    args: [abilityId]
  });
  
  return {
    ability: abilityResult.rows[0] as any,
    effects: effectsResult.rows as any[]
  };
}

export default function AbilityDetailPage() {
  const params = useParams();
  const [data] = createResource(() => params.id, fetchAbility);
  
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "damage": return "var(--danger)";
      case "healing": return "var(--success)";
      case "buff": return "var(--accent)";
      case "debuff": return "var(--warning)";
      case "utility": return "var(--text-secondary)";
      default: return "var(--text)";
    }
  };

  return (
    <WikiLayout>
      <div>
        <div style={{ "margin-bottom": "1rem" }}>
          <A href="/wiki/ability" style={{ color: "var(--accent)" }}>
            ← Back to Abilities
          </A>
        </div>

        <Show when={!data.loading} fallback={<div class="card">Loading ability details...</div>}>
          <Show when={!data.error} fallback={<div class="card">Error: {data.error?.message}</div>}>
            <Show when={data()}>
              {(abilityData) => (
                <div>
                  <h1>{abilityData().ability.name}</h1>
                  
                  <div class="card" style={{ "margin-bottom": "2rem" }}>
                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", gap: "2rem", "flex-wrap": "wrap" }}>
                      <div style={{ flex: 1, "min-width": "300px" }}>
                        <h2 style={{ "margin-top": "0" }}>Ability Information</h2>
                        
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          <div>
                            <strong>Type:</strong> {abilityData().ability.type}
                          </div>
                          
                          <div>
                            <strong>Category:</strong>{" "}
                            <span style={{ color: getCategoryColor(abilityData().ability.category) }}>
                              {abilityData().ability.category}
                            </span>
                          </div>
                          
                          <div>
                            <strong>Tier:</strong> {abilityData().ability.level}
                          </div>
                          
                          {abilityData().ability.mana_cost > 0 && (
                            <div>
                              <strong>Mana Cost:</strong> {abilityData().ability.mana_cost}
                            </div>
                          )}
                          
                          {abilityData().ability.cooldown > 0 && (
                            <div>
                              <strong>Cooldown:</strong> {abilityData().ability.cooldown}s
                            </div>
                          )}
                          
                          {abilityData().ability.primary_stat && (
                            <div>
                              <strong>Primary Stat:</strong> {abilityData().ability.primary_stat.toUpperCase()}
                            </div>
                          )}
                          
                          {abilityData().ability.stat_scaling > 0 && (
                            <div>
                              <strong>Stat Scaling:</strong> {(abilityData().ability.stat_scaling * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>

                      {abilityData().ability.description && (
                        <div style={{ flex: 1, "min-width": "300px" }}>
                          <h2 style={{ "margin-top": "0" }}>Description</h2>
                          <p style={{ color: "var(--text-secondary)" }}>
                            {abilityData().ability.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ability Effects */}
                  <Show when={abilityData().effects && abilityData().effects.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Effects</h2>
                      <div style={{ display: "grid", gap: "1rem" }}>
                        <For each={abilityData().effects}>
                          {(effect) => (
                            <div style={{ 
                              padding: "1rem", 
                              background: "var(--bg-light)", 
                              "border-radius": "6px",
                              "border-left": `4px solid ${getCategoryColor(effect.effect_type)}`
                            }}>
                              <div style={{ "font-weight": "bold", "margin-bottom": "0.5rem", "text-transform": "capitalize" }}>
                                {effect.effect_type}
                                {effect.target === 'self' && ' (Self)'}
                                {effect.target === 'enemy' && ' (Enemy)'}
                              </div>
                              
                              <div style={{ display: "grid", gap: "0.25rem", "font-size": "0.9rem" }}>
                                {effect.damage_min > 0 && (
                                  <div>
                                    <strong>Damage:</strong> {effect.damage_min} - {effect.damage_max}
                                  </div>
                                )}
                                
                                {effect.healing > 0 && (
                                  <div>
                                    <strong>Healing:</strong> {effect.healing}
                                  </div>
                                )}
                                
                                {effect.stat_name && (
                                  <div>
                                    <strong>Stat Buff:</strong> +{effect.stat_amount} {effect.stat_name.toUpperCase()} for {effect.duration}s
                                  </div>
                                )}
                                
                                {effect.dot_damage > 0 && (
                                  <div>
                                    <strong>Damage Over Time:</strong> {effect.dot_damage} per tick for {effect.dot_duration}s
                                  </div>
                                )}
                                
                                {effect.hot_healing > 0 && (
                                  <div>
                                    <strong>Healing Over Time:</strong> {effect.hot_healing} per tick for {effect.hot_duration}s
                                  </div>
                                )}
                                
                                {effect.thorns_damage > 0 && (
                                  <div>
                                    <strong>Thorns:</strong> Reflects {effect.thorns_damage} damage for {effect.thorns_duration}s
                                  </div>
                                )}
                                
                                {effect.primary_stat && (
                                  <div>
                                    <strong>Scales with:</strong> {effect.primary_stat.toUpperCase()} ({(effect.stat_scaling * 100).toFixed(0)}%)
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Equipment Requirements */}
                  <Show when={abilityData().ability.weapon_type_requirement || abilityData().ability.offhand_type_requirement}>
                    <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                      <h2 style={{ "margin-top": "0" }}>Equipment Requirements</h2>
                      <p style={{ color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                        This ability requires specific equipment to use:
                      </p>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        {abilityData().ability.weapon_type_requirement && (
                          <div>
                            <strong>Weapon:</strong> {abilityData().ability.weapon_type_requirement}
                          </div>
                        )}
                        {abilityData().ability.offhand_type_requirement && (
                          <div>
                            <strong>Offhand:</strong> {abilityData().ability.offhand_type_requirement}
                          </div>
                        )}
                      </div>
                    </div>
                  </Show>

                  {/* Stat Requirements */}
                  <Show when={
                    abilityData().ability.required_level > 1 || 
                    abilityData().ability.required_strength > 0 ||
                    abilityData().ability.required_dexterity > 0 || 
                    abilityData().ability.required_constitution > 0 ||
                    abilityData().ability.required_intelligence > 0 || 
                    abilityData().ability.required_wisdom > 0 ||
                    abilityData().ability.required_charisma > 0
                  }>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Requirements</h2>
                      <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                        {abilityData().ability.required_level > 1 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Level</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {abilityData().ability.required_level}
                            </div>
                          </div>
                        )}
                        
                        {abilityData().ability.required_strength > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Strength</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {abilityData().ability.required_strength}
                            </div>
                          </div>
                        )}
                        
                        {abilityData().ability.required_dexterity > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Dexterity</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {abilityData().ability.required_dexterity}
                            </div>
                          </div>
                        )}
                        
                        {abilityData().ability.required_constitution > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Constitution</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {abilityData().ability.required_constitution}
                            </div>
                          </div>
                        )}
                        
                        {abilityData().ability.required_intelligence > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Intelligence</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {abilityData().ability.required_intelligence}
                            </div>
                          </div>
                        )}
                        
                        {abilityData().ability.required_wisdom > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Wisdom</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {abilityData().ability.required_wisdom}
                            </div>
                          </div>
                        )}
                        
                        {abilityData().ability.required_charisma > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Charisma</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {abilityData().ability.required_charisma}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Show>
                </div>
              )}
            </Show>
          </Show>
        </Show>
      </div>
    </WikiLayout>
  );
}
