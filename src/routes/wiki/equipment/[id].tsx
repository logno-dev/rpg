import { useParams, A } from "@solidjs/router";
import { createResource, Show } from "solid-js";
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
  
  return result.rows[0] as any;
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
              {(itemData) => (
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
                </div>
              )}
            </Show>
          </Show>
        </Show>
      </div>
    </WikiLayout>
  );
}
