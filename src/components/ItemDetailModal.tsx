import { Show, For } from "solid-js";

type ItemDetailModalProps = {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  preventBackgroundClose?: boolean;
  meetsRequirements: (item: any) => boolean;
  formatRequirements: (item: any) => string[];
  getScrollAbilityStatus?: (item: any) => { alreadyLearned: boolean; hasBetter: boolean; status: string };
  getEquipmentComparison?: (item: any) => { equippedItem: any; comparisons: Array<{stat: string, current: number, new: number, diff: number}> } | null;
  onLearnAbility?: (id: number, name: string) => void;
  onUseItem?: (id: number, name: string, healthRestore: number, manaRestore: number) => void;
  onEquip?: (id: number, showModal: boolean) => void;
  onSell?: (id: number, name: string, value: number, quantity: number) => void;
  onSalvage?: (id: number, name: string) => void;
  onDrop?: (id: number, name: string, quantity: number) => void;
  onBuy?: (id: number, name: string, price: number) => void;
  currentGold?: number;
  isMerchantItem?: boolean;
};

export function ItemDetailModal(props: ItemDetailModalProps) {
  const item = props.item;
  if (!props.isOpen || !item) {
    return null;
  }
  
  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: "rgba(0, 0, 0, 0.85)", 
        display: "flex", 
        "align-items": "center", 
        "justify-content": "center",
        "z-index": 1000,
        padding: "1rem"
      }}
      onClick={() => {
        if (!props.preventBackgroundClose) {
          props.onClose();
        }
      }}
    >
      <div 
        class={`card ${item.rarity}`}
        style={{ 
          "max-width": "500px",
          width: "100%",
          background: "var(--bg-dark)",
          border: `2px solid var(--${item.rarity === 'legendary' ? 'warning' : item.rarity === 'rare' ? 'accent' : 'text-secondary'})`,
          "max-height": "90vh",
          overflow: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "margin-bottom": "1rem" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ "margin-bottom": "0.25rem", "font-size": "1.5rem" }}>
              <Show when={item.quality && item.quality !== 'common'}>
                <span style={{
                  color: item.quality === 'masterwork' ? 'var(--legendary)' :
                         item.quality === 'superior' ? 'var(--epic)' :
                         item.quality === 'fine' ? 'var(--rare)' : 'inherit',
                  "margin-right": "0.5rem"
                }}>
                  {item.quality.charAt(0).toUpperCase() + item.quality.slice(1)}
                </span>
              </Show>
              {item.name}
            </h3>
            <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "text-transform": "uppercase", margin: 0 }}>
              {item.type} {item.slot && `• ${item.slot}`}
            </p>
          </div>
          <Show when={item.quantity > 1}>
            <div style={{ "font-weight": "bold", "font-size": "1.5rem", color: "var(--accent)" }}>x{item.quantity}</div>
          </Show>
        </div>

        <Show when={item.description}>
          <p style={{ "font-size": "0.95rem", "margin-bottom": "1rem", color: "var(--text-secondary)", "font-style": "italic" }}>
            {item.description}
          </p>
        </Show>

        {/* Item Stats */}
        <Show when={item.damage_min || item.armor || item.strength_bonus || item.health_restore || item.mana_restore}>
          <div style={{ 
            "margin-bottom": "1rem",
            padding: "1rem",
            background: "var(--bg-light)",
            "border-radius": "6px"
          }}>
            <h4 style={{ "margin-bottom": "0.5rem", "font-size": "1rem", color: "var(--accent)" }}>Stats</h4>
            <div style={{ "font-size": "0.95rem", display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
              <Show when={item.damage_min && item.damage_max}>
                <div style={{ color: "var(--danger)" }}>⚔️ {item.damage_min}-{item.damage_max} Damage</div>
              </Show>
              <Show when={item.armor}>
                <div style={{ color: "var(--accent)" }}>🛡️ {item.armor} Armor</div>
              </Show>
              <Show when={item.attack_speed && item.attack_speed !== 1}>
                <div style={{ color: "var(--success)" }}>⚡ {item.attack_speed}x Attack Speed</div>
              </Show>
              <Show when={item.strength_bonus}>
                <div>💪 +{item.strength_bonus} Strength</div>
              </Show>
              <Show when={item.dexterity_bonus}>
                <div>🏃 +{item.dexterity_bonus} Dexterity</div>
              </Show>
              <Show when={item.constitution_bonus}>
                <div>❤️ +{item.constitution_bonus} Constitution</div>
              </Show>
              <Show when={item.intelligence_bonus}>
                <div>🧠 +{item.intelligence_bonus} Intelligence</div>
              </Show>
              <Show when={item.wisdom_bonus}>
                <div>✨ +{item.wisdom_bonus} Wisdom</div>
              </Show>
              <Show when={item.charisma_bonus}>
                <div>💫 +{item.charisma_bonus} Charisma</div>
              </Show>
              <Show when={item.health_restore}>
                <div style={{ color: "var(--success)" }}>❤️ Restores {item.health_restore} Health</div>
              </Show>
              <Show when={item.mana_restore}>
                <div style={{ color: "var(--accent)" }}>✨ Restores {item.mana_restore} Mana</div>
              </Show>
              <Show when={item.value && !props.isMerchantItem}>
                <div style={{ color: "var(--warning)" }}>💰 {item.value} Gold</div>
              </Show>
            </div>
          </div>
        </Show>

        {/* Equipment Comparison */}
        <Show when={props.getEquipmentComparison && props.getEquipmentComparison(item)}>
          {(comparison) => (
            <Show when={comparison().comparisons.length > 0}>
              <div style={{ 
                "margin-bottom": "1rem",
                padding: "1rem",
                background: "rgba(59, 130, 246, 0.1)",
                "border-radius": "6px",
                border: "1px solid var(--accent)"
              }}>
                <h4 style={{ 
                  color: "var(--accent)",
                  "font-weight": "bold",
                  "margin-bottom": "0.5rem",
                  "font-size": "1rem"
                }}>
                  ⚖️ Compared to {comparison().equippedItem.name}
                </h4>
                <div style={{ display: "flex", "flex-direction": "column", gap: "0.25rem", "font-size": "0.95rem" }}>
                  <For each={comparison().comparisons}>
                    {(comp) => {
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
        <Show when={props.formatRequirements(item).length > 0}>
          <div style={{ 
            "margin-bottom": "1rem",
            padding: "1rem",
            background: props.meetsRequirements(item) ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            "border-radius": "6px",
            border: `1px solid ${props.meetsRequirements(item) ? "var(--success)" : "var(--danger)"}`
          }}>
            <div style={{ 
              color: props.meetsRequirements(item) ? "var(--success)" : "var(--danger)",
              "font-weight": "bold",
              "margin-bottom": "0.25rem"
            }}>
              {props.meetsRequirements(item) ? "✓ Requirements Met" : "✗ Requirements Not Met"}
            </div>
            <div style={{ color: "var(--text-secondary)", "font-size": "0.875rem" }}>
              Requires: {props.formatRequirements(item).join(', ')}
            </div>
          </div>
        </Show>
        
        {/* Weapon Requirements for Scrolls */}
        <Show when={(item.type === 'scroll' || item.type === 'consumable') && item.teaches_ability_id && (item.weapon_type_requirement || item.offhand_type_requirement)}>
          <div style={{ 
            "margin-bottom": "1rem",
            padding: "1rem",
            background: "rgba(59, 130, 246, 0.1)",
            "border-radius": "6px",
            border: "1px solid var(--accent)"
          }}>
            <div style={{ 
              color: "var(--accent)",
              "font-weight": "bold",
              "margin-bottom": "0.5rem",
              "font-size": "0.95rem"
            }}>
              ⚔️ This ability requires specific equipment:
            </div>
            <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
              <Show when={item.weapon_type_requirement}>
                <div>
                  <strong style={{ color: "var(--text)" }}>Weapon:</strong> {item.weapon_type_requirement.split(',').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).replace('_', ' ')).join(', ')}
                </div>
              </Show>
              <Show when={item.offhand_type_requirement}>
                <div>
                  <strong style={{ color: "var(--text)" }}>Offhand:</strong> {item.offhand_type_requirement.split(',').map((o: string) => o.charAt(0).toUpperCase() + o.slice(1).replace('_', ' ')).join(', ')}
                </div>
              </Show>
            </div>
          </div>
        </Show>

        {/* Merchant Price */}
        <Show when={props.isMerchantItem}>
          <div style={{ "margin-bottom": "1rem", "text-align": "center" }}>
            <Show when={item.base_price && item.base_price > item.merchant_price}>
              <div style={{ 
                color: "var(--text-secondary)", 
                "text-decoration": "line-through",
                "font-size": "1rem"
              }}>
                {item.base_price}g
              </div>
            </Show>
            <div style={{ 
              "font-size": "2rem",
              "font-weight": "bold",
              color: "var(--warning)"
            }}>
              {item.merchant_price || item.value}g
            </div>
            <Show when={item.base_price && item.base_price > item.merchant_price}>
              <div style={{ color: "var(--success)", "font-size": "0.875rem" }}>
                Save {item.base_price - item.merchant_price}g!
              </div>
            </Show>
            <Show when={item.stock !== undefined && item.stock !== -1}>
              <div style={{ 
                "margin-top": "0.5rem",
                "font-size": "0.875rem",
                color: item.stock > 5 ? "var(--success)" : item.stock > 0 ? "var(--warning)" : "var(--danger)"
              }}>
                {item.stock > 0 ? `Stock: ${item.stock}` : 'OUT OF STOCK'}
              </div>
            </Show>
          </div>
        </Show>

        {/* Action Buttons */}
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem", "margin-top": "1rem" }}>
          {/* Merchant Buy Button */}
          <Show when={props.isMerchantItem && props.onBuy}>
            <button
              class="button"
              style={{ 
                width: "100%",
                background: (props.currentGold || 0) >= (item.merchant_price || item.value) ? "var(--warning)" : "var(--bg-light)",
                color: (props.currentGold || 0) >= (item.merchant_price || item.value) ? "var(--bg-dark)" : "var(--text-secondary)",
                cursor: ((props.currentGold || 0) >= (item.merchant_price || item.value) && (item.stock === undefined || item.stock === -1 || item.stock > 0)) ? "pointer" : "not-allowed"
              }}
              disabled={(props.currentGold || 0) < (item.merchant_price || item.value) || (item.stock !== undefined && item.stock !== -1 && item.stock <= 0)}
              onClick={() => {
                props.onBuy?.(item.id, item.name, item.merchant_price || item.value);
                props.onClose();
              }}
            >
              {(props.currentGold || 0) >= (item.merchant_price || item.value) ? "Buy Now" : `Need ${item.merchant_price || item.value}g`}
            </button>
          </Show>

          {/* Inventory Item Buttons */}
          <Show when={!props.isMerchantItem}>
            {/* Learn Ability Button */}
            <Show when={(item.type === 'consumable' || item.type === 'scroll') && item.teaches_ability_id && props.onLearnAbility}>
              {(() => {
                const scrollStatus = props.getScrollAbilityStatus?.(item) || { alreadyLearned: false, hasBetter: false, status: 'can_learn' };
                const canLearn = props.meetsRequirements(item) && scrollStatus.status === 'can_learn';
                
                return (
                  <>
                    <Show when={scrollStatus.alreadyLearned || scrollStatus.hasBetter}>
                      <div style={{ 
                        "font-size": "0.875rem", 
                        color: scrollStatus.alreadyLearned ? "var(--success)" : "var(--warning)",
                        "text-align": "center",
                        "font-weight": "500"
                      }}>
                        {scrollStatus.alreadyLearned ? "✓ Already Learned" : "⚠ You have a better version"}
                      </div>
                    </Show>
                    
                    <button
                      class="button"
                      style={{ 
                        width: "100%",
                        background: canLearn ? "var(--accent)" : "var(--bg-light)", 
                        color: canLearn ? "var(--bg-dark)" : "var(--text-secondary)",
                        opacity: canLearn ? 1 : 0.5,
                        cursor: canLearn ? "pointer" : "not-allowed"
                      }}
                      onClick={() => {
                        props.onLearnAbility?.(item.id, item.name);
                        // Don't close here - let the handler close it after updating inventory
                      }}
                      disabled={!canLearn}
                    >
                      {scrollStatus.alreadyLearned ? "Already Learned" : 
                       scrollStatus.hasBetter ? "Have Better" :
                       props.meetsRequirements(item) ? "Learn" : "Can't Learn"}
                    </button>
                  </>
                );
              })()}
            </Show>

            {/* Use Consumable Button */}
            <Show when={item.type === 'consumable' && (item.health_restore || item.mana_restore) && props.onUseItem}>
              <button
                class="button success"
                style={{ width: "100%" }}
                onClick={() => {
                  props.onUseItem?.(item.id, item.name, item.health_restore || 0, item.mana_restore || 0);
                  props.onClose();
                }}
              >
                Use
              </button>
            </Show>

            {/* Equip Button */}
            <Show when={item.slot && props.onEquip}>
              <button
                class="button"
                style={{ 
                  width: "100%",
                  opacity: props.meetsRequirements(item) ? 1 : 0.5,
                  cursor: props.meetsRequirements(item) ? "pointer" : "not-allowed"
                }}
                onClick={() => {
                  props.onEquip?.(item.id, false);
                  props.onClose();
                }}
                disabled={!props.meetsRequirements(item)}
              >
                {props.meetsRequirements(item) ? "Equip" : "Can't Equip"}
              </button>
            </Show>

            {/* Sell Button */}
            <Show when={item.value && item.value > 0 && props.onSell}>
              <button
                class="button secondary"
                style={{ width: "100%" }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event from bubbling to modal background
                  console.log('[ITEM DETAIL] Sell button clicked', { id: item.id, name: item.name, quantity: item.quantity });
                  console.log('[ITEM DETAIL] props.onSell exists?', !!props.onSell);
                  console.log('[ITEM DETAIL] Calling props.onSell with:', item.id, item.name, item.value, item.quantity);
                  try {
                    // Call sell handler to open quantity modal
                    props.onSell?.(item.id, item.name, item.value, item.quantity);
                    console.log('[ITEM DETAIL] Sell handler called successfully');
                  } catch (err) {
                    console.error('[ITEM DETAIL] Error calling onSell:', err);
                  }
                  // Don't close this modal yet - let the sell modal appear first
                  // The sell modal will be on top (higher z-index)
                }}
              >
                Sell ({Math.floor(item.value * 0.4) * item.quantity}g)
              </button>
            </Show>

            {/* Salvage Button */}
            <Show when={!item.equipped && (item.type === 'armor' || item.type === 'weapon') && props.onSalvage}>
              <button
                class="button"
                style={{ 
                  width: "100%",
                  background: "var(--warning)",
                  color: "var(--bg-dark)"
                }}
                onClick={() => {
                  props.onSalvage?.(item.id, item.name);
                  props.onClose();
                }}
              >
                ⚙️ Salvage for Materials
              </button>
            </Show>

            {/* Drop Button */}
            <Show when={(!item.value || item.value === 0) && props.onDrop}>
              <button
                class="button danger"
                style={{ width: "100%" }}
                onClick={() => {
                  props.onDrop?.(item.id, item.name, item.quantity);
                  props.onClose();
                }}
              >
                Drop
              </button>
            </Show>
          </Show>

          {/* Close Button */}
          <button
            class="button secondary"
            style={{ width: "100%" }}
            onClick={props.onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
