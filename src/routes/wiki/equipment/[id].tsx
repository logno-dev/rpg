import { useParams, A } from "@solidjs/router";
import { createResource, Show, For } from "solid-js";
import WikiLayout from "~/components/WikiLayout";
import { db } from "~/lib/db";

async function fetchItem(id: string) {
  "use server";
  
  const itemId = parseInt(id);
  if (isNaN(itemId)) {
    throw new Error("Invalid item ID");
  }
  
  const result = await db.execute({
    sql: `SELECT * FROM items WHERE id = ?`,
    args: [itemId]
  });
  
  if (result.rows.length === 0) {
    throw new Error("Item not found");
  }
  
  const item = result.rows[0] as any;
  
  // Fetch mob loot sources with grouped regions
  const mobLootResult = await db.execute({
    sql: `
      SELECT 
        mobs.id as mob_id,
        mobs.name as mob_name,
        mobs.level as mob_level,
        mobs.area as mob_area,
        mob_loot.drop_chance,
        mob_loot.quantity_min,
        mob_loot.quantity_max,
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
      FROM mob_loot
      JOIN mobs ON mob_loot.mob_id = mobs.id
      WHERE mob_loot.item_id = ?
      ORDER BY mobs.level, mobs.name
    `,
    args: [itemId]
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
        named_mob_loot.drop_chance,
        named_mob_loot.min_quantity as quantity_min,
        named_mob_loot.max_quantity as quantity_max
      FROM named_mob_loot
      JOIN named_mobs ON named_mob_loot.named_mob_id = named_mobs.id
      LEFT JOIN regions ON named_mobs.region_id = regions.id
      WHERE named_mob_loot.item_id = ?
      ORDER BY named_mobs.level, named_mobs.name
    `,
    args: [itemId]
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
      WHERE quest_rewards.reward_type = 'item'
        AND quest_rewards.reward_item_id = ?
      ORDER BY quests.min_level, quests.name
    `,
    args: [itemId]
  });
  
  return {
    item,
    mobLoot: mobLootResult.rows,
    namedMobLoot: namedMobLootResult.rows,
    questRewards: questRewardResult.rows
  };
}

export default function ItemDetailPage() {
  const params = useParams();
  const [item] = createResource(() => params.id, fetchItem);
  
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "legendary": return "#ff8000";
      case "epic": return "#a335ee";
      case "rare": return "#0070dd";
      case "uncommon": return "#1eff00";
      default: return "#9d9d9d";
    }
  };

  return (
    <WikiLayout>
      <div>
        <div style={{ "margin-bottom": "1rem" }}>
          <A href="/wiki/equipment" style={{ color: "var(--accent)" }}>
            ← Back to Equipment
          </A>
        </div>

        <Show when={!item.loading} fallback={<div class="card">Loading item details...</div>}>
          <Show when={!item.error} fallback={<div class="card">Error: {item.error?.message}</div>}>
            <Show when={item()}>
              {(data) => {
                const itemData = () => data().item;
                return (
                <div>
                  <h1 style={{ color: getRarityColor(itemData().rarity) }}>{itemData().name}</h1>
                  
                  <div class="card" style={{ "margin-bottom": "2rem" }}>
                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", gap: "2rem", "flex-wrap": "wrap" }}>
                      <div style={{ flex: 1, "min-width": "300px" }}>
                        <h2 style={{ "margin-top": "0" }}>Item Information</h2>
                        
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          <div>
                            <strong>Type:</strong> {itemData().type}
                            {itemData().slot && ` (${itemData().slot})`}
                          </div>
                          
                          <div>
                            <strong>Rarity:</strong>{" "}
                            <span style={{ color: getRarityColor(itemData().rarity) }}>
                              {itemData().rarity}
                            </span>
                          </div>
                          
                          {itemData().weapon_type && (
                            <div>
                              <strong>Weapon Type:</strong> {itemData().weapon_type}
                            </div>
                          )}
                          
                          {itemData().armor_type && (
                            <div>
                              <strong>Armor Type:</strong> {itemData().armor_type}
                            </div>
                          )}
                          
                          {itemData().is_two_handed === 1 && (
                            <div>
                              <strong>Two-Handed:</strong> Yes
                            </div>
                          )}
                          
                          <div>
                            <strong>Value:</strong> {itemData().value} Gold
                          </div>
                          
                          {itemData().stackable === 1 && (
                            <div>
                              <strong>Stackable:</strong> Yes
                            </div>
                          )}
                        </div>
                      </div>

                      {itemData().description && (
                        <div style={{ flex: 1, "min-width": "300px" }}>
                          <h2 style={{ "margin-top": "0" }}>Description</h2>
                          <p style={{ color: "var(--text-secondary)" }}>
                            {itemData().description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Combat Stats */}
                  <Show when={itemData().damage_min > 0 || itemData().armor > 0 || itemData().attack_speed !== 1.0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Combat Stats</h2>
                      <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        {itemData().damage_min > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Damage</div>
                            <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--danger)" }}>
                              {itemData().damage_min} - {itemData().damage_max}
                            </div>
                          </div>
                        )}
                        
                        {itemData().armor > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Armor</div>
                            <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--accent)" }}>
                              {itemData().armor}
                            </div>
                          </div>
                        )}
                        
                        {itemData().attack_speed && itemData().attack_speed !== 1.0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Attack Speed</div>
                            <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--success)" }}>
                              {itemData().attack_speed}x
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Show>

                  {/* Stat Bonuses */}
                  <Show when={
                    itemData().strength_bonus > 0 || itemData().dexterity_bonus > 0 ||
                    itemData().constitution_bonus > 0 || itemData().intelligence_bonus > 0 ||
                    itemData().wisdom_bonus > 0 || itemData().charisma_bonus > 0
                  }>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Stat Bonuses</h2>
                      <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                        {itemData().strength_bonus > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Strength</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
                              +{itemData().strength_bonus}
                            </div>
                          </div>
                        )}
                        
                        {itemData().dexterity_bonus > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Dexterity</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
                              +{itemData().dexterity_bonus}
                            </div>
                          </div>
                        )}
                        
                        {itemData().constitution_bonus > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Constitution</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
                              +{itemData().constitution_bonus}
                            </div>
                          </div>
                        )}
                        
                        {itemData().intelligence_bonus > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Intelligence</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
                              +{itemData().intelligence_bonus}
                            </div>
                          </div>
                        )}
                        
                        {itemData().wisdom_bonus > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Wisdom</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
                              +{itemData().wisdom_bonus}
                            </div>
                          </div>
                        )}
                        
                        {itemData().charisma_bonus > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Charisma</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
                              +{itemData().charisma_bonus}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Show>

                  {/* Consumable Effects */}
                  <Show when={itemData().health_restore > 0 || itemData().mana_restore > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Consumable Effects</h2>
                      <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        {itemData().health_restore > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Health Restore</div>
                            <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--danger)" }}>
                              +{itemData().health_restore} HP
                            </div>
                          </div>
                        )}
                        
                        {itemData().mana_restore > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Mana Restore</div>
                            <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--accent)" }}>
                              +{itemData().mana_restore} MP
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Show>

                  {/* Requirements */}
                  <Show when={
                    itemData().required_level > 1 || itemData().required_strength > 0 ||
                    itemData().required_dexterity > 0 || itemData().required_constitution > 0 ||
                    itemData().required_intelligence > 0 || itemData().required_wisdom > 0 ||
                    itemData().required_charisma > 0
                  }>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Requirements</h2>
                      <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                        {itemData().required_level > 1 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Level</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {itemData().required_level}
                            </div>
                          </div>
                        )}
                        
                        {itemData().required_strength > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Strength</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {itemData().required_strength}
                            </div>
                          </div>
                        )}
                        
                        {itemData().required_dexterity > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Dexterity</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {itemData().required_dexterity}
                            </div>
                          </div>
                        )}
                        
                        {itemData().required_constitution > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Constitution</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {itemData().required_constitution}
                            </div>
                          </div>
                        )}
                        
                        {itemData().required_intelligence > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Intelligence</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {itemData().required_intelligence}
                            </div>
                          </div>
                        )}
                        
                        {itemData().required_wisdom > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Wisdom</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {itemData().required_wisdom}
                            </div>
                          </div>
                        )}
                        
                        {itemData().required_charisma > 0 && (
                          <div>
                            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Charisma</div>
                            <div style={{ "font-size": "1.25rem", "font-weight": "bold" }}>
                              {itemData().required_charisma}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Show>

                  {/* Loot Sources */}
                  <Show when={data().mobLoot.length > 0 || data().namedMobLoot.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Loot Sources</h2>
                      
                      <Show when={data().mobLoot.length > 0}>
                        <div style={{ "margin-bottom": "1.5rem" }}>
                          <h3 style={{ "font-size": "1.1rem", "margin-bottom": "0.75rem", color: "var(--text-secondary)" }}>
                            Regular Mobs
                          </h3>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            <For each={data().mobLoot}>
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
                                    <Show when={loot.quantity_max > 1}>
                                      <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                        Qty: {loot.quantity_min}-{loot.quantity_max}
                                      </div>
                                    </Show>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                      
                      <Show when={data().namedMobLoot.length > 0}>
                        <div>
                          <h3 style={{ "font-size": "1.1rem", "margin-bottom": "0.75rem", color: "var(--text-secondary)" }}>
                            Named Mobs & Bosses
                          </h3>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            <For each={data().namedMobLoot}>
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
                                    <Show when={loot.quantity_max > 1}>
                                      <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                        Qty: {loot.quantity_min}-{loot.quantity_max}
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
                  <Show when={data().questRewards.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Quest Rewards</h2>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <For each={data().questRewards}>
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
