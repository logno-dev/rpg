import { Show, For } from "solid-js";

type InventoryItemCardProps = {
  item: any;
  meetsRequirements: (item: any) => boolean;
  formatRequirements: (item: any) => string[];
  getScrollAbilityStatus: (item: any) => { alreadyLearned: boolean; hasBetter: boolean; status: string };
  getEquipmentComparison?: (item: any) => { equippedItem: any; comparisons: Array<{stat: string, current: number, new: number, diff: number}> } | null;
  onLearnAbility: (id: number, name: string) => void;
  onUseItem: (id: number, name: string, healthRestore: number, manaRestore: number) => void;
  onEquip: (id: number, showModal: boolean) => void;
  onSell: (id: number, name: string, value: number, quantity: number) => void;
  onDrop: (id: number, name: string, quantity: number) => void;
};

export function InventoryItemCard(props: InventoryItemCardProps) {
  const invItem = props.item;
  
  return (
    <div class={`item-card ${invItem.rarity}`}>
      <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "margin-bottom": "0.5rem" }}>
        <div>
          <h4 style={{ "margin-bottom": "0.25rem" }}>{invItem.name}</h4>
          <p style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "text-transform": "uppercase" }}>
            {invItem.type} {invItem.slot && `• ${invItem.slot}`}
          </p>
        </div>
        <Show when={invItem.quantity > 1}>
          <div style={{ "font-weight": "bold", "font-size": "1.2rem" }}>x{invItem.quantity}</div>
        </Show>
      </div>

      <Show when={invItem.description}>
        <p style={{ "font-size": "0.875rem", "margin-bottom": "0.5rem", color: "var(--text-secondary)" }}>
          {invItem.description}
        </p>
      </Show>

      {/* Item Stats */}
      <div style={{ "font-size": "0.875rem", "margin-bottom": "0.5rem" }}>
        <Show when={invItem.damage_min && invItem.damage_max}>
          <div style={{ color: "var(--danger)" }}>⚔️ {invItem.damage_min}-{invItem.damage_max} Damage</div>
        </Show>
        <Show when={invItem.armor}>
          <div style={{ color: "var(--accent)" }}>🛡️ {invItem.armor} Armor</div>
        </Show>
        <Show when={invItem.attack_speed && invItem.attack_speed !== 1}>
          <div style={{ color: "var(--success)" }}>⚡ {invItem.attack_speed}x Attack Speed</div>
        </Show>
        <Show when={invItem.strength_bonus}>
          <div>💪 +{invItem.strength_bonus} Strength</div>
        </Show>
        <Show when={invItem.dexterity_bonus}>
          <div>🏃 +{invItem.dexterity_bonus} Dexterity</div>
        </Show>
        <Show when={invItem.constitution_bonus}>
          <div>❤️ +{invItem.constitution_bonus} Constitution</div>
        </Show>
        <Show when={invItem.intelligence_bonus}>
          <div>🧠 +{invItem.intelligence_bonus} Intelligence</div>
        </Show>
        <Show when={invItem.wisdom_bonus}>
          <div>✨ +{invItem.wisdom_bonus} Wisdom</div>
        </Show>
        <Show when={invItem.charisma_bonus}>
          <div>💫 +{invItem.charisma_bonus} Charisma</div>
        </Show>
        <Show when={invItem.value}>
          <div style={{ color: "var(--warning)" }}>💰 {invItem.value} Gold</div>
        </Show>
      </div>

      {/* Equipment Comparison */}
      <Show when={props.getEquipmentComparison && props.getEquipmentComparison(invItem)}>
        {(comparison) => (
          <Show when={comparison().comparisons.length > 0}>
            <div style={{ 
              "font-size": "0.75rem", 
              "margin-bottom": "0.5rem",
              padding: "0.5rem",
              background: "rgba(59, 130, 246, 0.1)",
              "border-radius": "4px",
              border: "1px solid var(--accent)"
            }}>
              <div style={{ 
                color: "var(--accent)",
                "font-weight": "bold",
                "margin-bottom": "0.25rem"
              }}>
                ⚖️ Compared to {comparison().equippedItem.name}:
              </div>
              <div style={{ display: "flex", "flex-direction": "column", gap: "0.15rem" }}>
                <For each={comparison().comparisons}>
                  {(comp) => {
                    // For attack speed, diff is already inverted (positive = better/faster)
                    const displayValue = comp.stat === 'Damage' ? comp.diff.toFixed(1) : comp.diff.toFixed(2);
                    return (
                      <div style={{ 
                        display: "flex", 
                        "justify-content": "space-between",
                        color: comp.diff > 0 ? "var(--success)" : comp.diff < 0 ? "var(--danger)" : "var(--text-secondary)"
                      }}>
                        <span>{comp.stat}:</span>
                        <span style={{ "font-weight": "bold" }}>
                          {comp.diff > 0 ? '+' : ''}{displayValue}
                          {comp.stat === 'Attack Speed' && 'x'}
                        </span>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </Show>
        )}
      </Show>

      {/* Requirements */}
      <Show when={props.formatRequirements(invItem).length > 0}>
        <div style={{ 
          "font-size": "0.75rem", 
          "margin-bottom": "0.5rem",
          padding: "0.5rem",
          background: props.meetsRequirements(invItem) ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
          "border-radius": "4px",
          border: `1px solid ${props.meetsRequirements(invItem) ? "var(--success)" : "var(--danger)"}`
        }}>
          <div style={{ 
            color: props.meetsRequirements(invItem) ? "var(--success)" : "var(--danger)",
            "font-weight": "bold",
            "margin-bottom": "0.25rem"
          }}>
            {props.meetsRequirements(invItem) ? "✓ Requirements Met" : "✗ Requirements Not Met"}
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            Requires: {props.formatRequirements(invItem).join(', ')}
          </div>
        </div>
      </Show>

      <div style={{ display: "flex", gap: "0.5rem", "margin-top": "0.5rem", "flex-wrap": "wrap" }}>
        <Show when={(invItem.type === 'consumable' || invItem.type === 'scroll') && invItem.teaches_ability_id}>
          {(() => {
            const scrollStatus = props.getScrollAbilityStatus(invItem);
            const canLearn = props.meetsRequirements(invItem) && scrollStatus.status === 'can_learn';
            
            return (
              <>
                {/* Show status indicator above button */}
                <Show when={scrollStatus.alreadyLearned}>
                  <div style={{ 
                    "font-size": "0.75rem", 
                    color: "var(--success)", 
                    "margin-bottom": "0.25rem",
                    "font-weight": "500"
                  }}>
                    ✓ Already Learned
                  </div>
                </Show>
                <Show when={scrollStatus.hasBetter}>
                  <div style={{ 
                    "font-size": "0.75rem", 
                    color: "var(--warning)", 
                    "margin-bottom": "0.25rem",
                    "font-weight": "500"
                  }}>
                    ⚠ You have a better version
                  </div>
                </Show>
                
                <button
                  class="button"
                  style={{ 
                    flex: 1, 
                    "min-width": "100px", 
                    background: canLearn ? "var(--accent)" : "var(--bg-light)", 
                    color: canLearn ? "var(--bg-dark)" : "var(--text-secondary)",
                    opacity: canLearn ? 1 : 0.5,
                    cursor: canLearn ? "pointer" : "not-allowed"
                  }}
                  onClick={() => props.onLearnAbility(invItem.id, invItem.name)}
                  disabled={!canLearn}
                >
                  {scrollStatus.alreadyLearned ? "Already Learned" : 
                   scrollStatus.hasBetter ? "Have Better" :
                   props.meetsRequirements(invItem) ? "Learn" : "Can't Learn"}
                </button>
              </>
            );
          })()}
        </Show>
        <Show when={invItem.type === 'consumable' && (invItem.health_restore || invItem.mana_restore)}>
          <button
            class="button success"
            style={{ flex: 1, "min-width": "100px" }}
            onClick={() => props.onUseItem(invItem.id, invItem.name, invItem.health_restore || 0, invItem.mana_restore || 0)}
          >
            Use
          </button>
        </Show>
        <Show when={invItem.slot}>
          <button
            class="button"
            style={{ 
              flex: 1, 
              "min-width": "100px",
              opacity: props.meetsRequirements(invItem) ? 1 : 0.5,
              cursor: props.meetsRequirements(invItem) ? "pointer" : "not-allowed"
            }}
            onClick={() => props.onEquip(invItem.id, false)}
            disabled={!props.meetsRequirements(invItem)}
          >
            {props.meetsRequirements(invItem) ? "Equip" : "Can't Equip"}
          </button>
        </Show>
        <Show when={invItem.value && invItem.value > 0}>
          <button
            class="button secondary"
            style={{ flex: 1, "min-width": "120px" }}
            onClick={() => props.onSell(invItem.id, invItem.name, invItem.value, invItem.quantity)}
          >
            Sell ({Math.floor(invItem.value * 0.4) * invItem.quantity}g)
          </button>
        </Show>
        <Show when={!invItem.value || invItem.value === 0}>
          <button
            class="button danger"
            style={{ flex: 1, "min-width": "100px" }}
            onClick={() => props.onDrop(invItem.id, invItem.name, invItem.quantity)}
          >
            Drop
          </button>
        </Show>
      </div>
    </div>
  );
}
