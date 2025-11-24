import { createSignal, For, Show, onMount, createMemo } from "solid-js";
import type { Ability } from "~/lib/db";

type HotbarSlot = {
  slot: number;
  type?: 'ability' | 'consumable';
  id?: number;
  name?: string;
  description?: string;
  manaCost?: number;
  healthRestore?: number;
  manaRestore?: number;
  quantity?: number;
};

type Props = {
  characterId: number;
  abilities: any[];
  consumables: any[];
  hotbar: HotbarSlot[];
  onHotbarChange?: () => void;
};

export function HotbarManager(props: Props) {
  const [selectedSlot, setSelectedSlot] = createSignal<number | null>(null);
  const [assignMode, setAssignMode] = createSignal<'ability' | 'consumable' | null>(null);
  const [isSaving, setIsSaving] = createSignal(false);

  // Create hotbar memo that converts props.hotbar to the format we need
  const hotbar = createMemo(() => {
    const slots: HotbarSlot[] = [
      { slot: 1 },
      { slot: 2 },
      { slot: 3 },
      { slot: 4 },
      { slot: 5 },
      { slot: 6 },
      { slot: 7 },
      { slot: 8 },
    ];
    
    props.hotbar.forEach((item: any) => {
      const slotIndex = item.slot - 1;
      if (slotIndex >= 0 && slotIndex < 8) {
        slots[slotIndex] = {
          slot: item.slot,
          type: item.type,
          id: item.ability_id || item.item_id,
          name: item.ability_name || item.item_name,
          description: item.ability_description || item.item_description,
          manaCost: item.mana_cost,
          healthRestore: item.health_restore,
          manaRestore: item.mana_restore,
          quantity: item.item_quantity,
        };
      }
    });
    
    return slots;
  });

  const handleSlotClick = (slot: number) => {
    setSelectedSlot(slot);
    setAssignMode(null);
  };

  const handleAssignAbility = async (abilityId: number) => {
    const slot = selectedSlot();
    if (slot === null) return;

    console.log('[HotbarManager] Assigning ability', abilityId, 'to slot', slot);
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/game/set-hotbar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: props.characterId,
          slot,
          type: 'ability',
          abilityId,
        }),
      });
      
      const result = await response.json();
      console.log('[HotbarManager] Response:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign ability');
      }
      
      setSelectedSlot(null);
      setAssignMode(null);
      
      // Notify parent of hotbar change - parent will update CharacterContext
      if (props.onHotbarChange) {
        props.onHotbarChange();
      }
    } catch (error) {
      console.error('Failed to assign ability:', error);
      alert('Failed to assign ability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignConsumable = async (itemId: number) => {
    const slot = selectedSlot();
    if (slot === null) return;

    setIsSaving(true);
    try {
      await fetch('/api/game/set-hotbar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: props.characterId,
          slot,
          type: 'consumable',
          itemId,
        }),
      });
      
      setSelectedSlot(null);
      setAssignMode(null);
      
      // Notify parent of hotbar change - parent will update CharacterContext
      if (props.onHotbarChange) {
        props.onHotbarChange();
      }
    } catch (error) {
      console.error('Failed to assign consumable:', error);
      alert('Failed to assign consumable');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSlot = async (slot: number) => {
    setIsSaving(true);
    try {
      await fetch('/api/game/clear-hotbar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: props.characterId,
          slot,
        }),
      });
      
      setSelectedSlot(null);
      
      // Notify parent of hotbar change - parent will update CharacterContext
      if (props.onHotbarChange) {
        props.onHotbarChange();
      }
    } catch (error) {
      console.error('Failed to clear slot:', error);
      alert('Failed to clear slot');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Hotbar Slots Display */}
      <div class="card">
        <h3 style={{ "margin-bottom": "1rem" }}>Action Bar (Keys 1-8)</h3>
        <p style={{ 
          "font-size": "0.875rem", 
          color: "var(--text-secondary)", 
          "margin-bottom": "1rem" 
        }}>
          Click a slot to assign an ability or consumable. These will be available during combat and can be triggered with keyboard keys 1-8.
        </p>
        
        <div style={{
          display: "grid",
          "grid-template-columns": "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "1rem",
          "margin-bottom": "2rem"
        }}>
          <For each={hotbar()}>
            {(slot) => (
              <div
                onClick={() => handleSlotClick(slot.slot)}
                style={{
                  background: selectedSlot() === slot.slot ? "var(--accent)" : "var(--bg-light)",
                  border: `2px solid ${selectedSlot() === slot.slot ? "var(--accent)" : "var(--border)"}`,
                  "border-radius": "8px",
                  padding: "1rem",
                  cursor: "pointer",
                  "min-height": "120px",
                  display: "flex",
                  "flex-direction": "column",
                  "justify-content": "space-between",
                  transition: "all 0.2s",
                  position: "relative"
                }}
                classList={{
                  "hover:transform": true,
                }}
              >
                {/* Slot Number */}
                <div style={{
                  position: "absolute",
                  top: "0.5rem",
                  left: "0.5rem",
                  width: "24px",
                  height: "24px",
                  background: "var(--bg-dark)",
                  "border-radius": "4px",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "font-weight": "bold",
                  "font-size": "0.875rem"
                }}>
                  {slot.slot}
                </div>

                <Show when={slot.type} fallback={
                  <div style={{
                    "text-align": "center",
                    color: "var(--text-secondary)",
                    "font-size": "0.875rem",
                    "margin-top": "1.5rem"
                  }}>
                    Empty
                  </div>
                }>
                  <div style={{ "margin-top": "1.5rem" }}>
                    <div style={{
                      "font-weight": "bold",
                      "font-size": "0.875rem",
                      "margin-bottom": "0.25rem",
                      "word-break": "break-word"
                    }}>
                      {slot.name}
                    </div>
                    <Show when={slot.type === 'ability' && slot.manaCost}>
                      <div style={{ 
                        "font-size": "0.75rem", 
                        color: "var(--accent)" 
                      }}>
                        {slot.manaCost} Mana
                      </div>
                    </Show>
                    <Show when={slot.type === 'consumable'}>
                      <div style={{ 
                        "font-size": "0.75rem", 
                        color: "var(--text-secondary)" 
                      }}>
                        x{slot.quantity || 0}
                      </div>
                    </Show>
                    <button
                      class="button danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSlot(slot.slot);
                      }}
                      style={{
                        width: "100%",
                        "margin-top": "0.5rem",
                        padding: "0.25rem",
                        "font-size": "0.75rem"
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Assignment Panel */}
      <Show when={selectedSlot() !== null}>
        <div class="card">
          <h3 style={{ "margin-bottom": "1rem" }}>
            Assign to Slot {selectedSlot()}
          </h3>
          
          <div class="button-group" style={{ "margin-bottom": "1.5rem" }}>
            <button
              class={assignMode() === 'ability' ? "button" : "button secondary"}
              onClick={() => setAssignMode('ability')}
            >
              Abilities & Spells
            </button>
            <button
              class={assignMode() === 'consumable' ? "button" : "button secondary"}
              onClick={() => setAssignMode('consumable')}
            >
              Consumables
            </button>
            <button
              class="button secondary"
              onClick={() => {
                setSelectedSlot(null);
                setAssignMode(null);
              }}
            >
              Cancel
            </button>
          </div>

          {/* Abilities List */}
          <Show when={assignMode() === 'ability'}>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <Show when={props.abilities.length === 0}>
                <div style={{
                  padding: "2rem",
                  "text-align": "center",
                  color: "var(--text-secondary)",
                  background: "var(--bg-light)",
                  "border-radius": "6px"
                }}>
                  No abilities learned yet. Find ability scrolls to learn new abilities!
                </div>
              </Show>
              <For each={props.abilities}>
                {(ability) => {
                  console.log('[HotbarManager] Ability:', ability);
                  return (
                  <div
                    onClick={() => {
                      console.log('[HotbarManager] Clicked ability:', ability);
                      if (!isSaving()) handleAssignAbility(ability.ability_id || ability.id);
                    }}
                    style={{
                      background: "var(--bg-light)",
                      border: "2px solid var(--border)",
                      "border-radius": "6px",
                      padding: "1rem",
                      cursor: isSaving() ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      opacity: isSaving() ? 0.5 : 1
                    }}
                  >
                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ "font-weight": "bold", "font-size": "1rem", "margin-bottom": "0.25rem" }}>
                          {ability.name}
                        </div>
                        <Show when={ability.description}>
                          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                            {ability.description}
                          </div>
                        </Show>
                        <div style={{ "font-size": "0.875rem", display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
                          <Show when={ability.mana_cost}>
                            <span style={{ color: "var(--accent)" }}>💧 {ability.mana_cost} Mana</span>
                          </Show>
                          <Show when={ability.cooldown}>
                            <span style={{ color: "var(--warning)" }}>⏱️ {ability.cooldown}s</span>
                          </Show>
                          <Show when={ability.damage_min && ability.damage_max}>
                            <span style={{ color: "var(--danger)" }}>⚔️ {ability.damage_min}-{ability.damage_max}</span>
                          </Show>
                          <Show when={ability.healing}>
                            <span style={{ color: "var(--success)" }}>❤️ {ability.healing}</span>
                          </Show>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                }}
              </For>
            </div>
          </Show>

          {/* Consumables List */}
          <Show when={assignMode() === 'consumable'}>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <Show when={props.consumables.length === 0}>
                <div style={{
                  padding: "2rem",
                  "text-align": "center",
                  color: "var(--text-secondary)",
                  background: "var(--bg-light)",
                  "border-radius": "6px"
                }}>
                  No consumables in inventory. Purchase or loot potions to use them in combat!
                </div>
              </Show>
              <For each={props.consumables}>
                {(item) => (
                  <div
                    onClick={() => !isSaving() && handleAssignConsumable(item.item_id)}
                    style={{
                      background: "var(--bg-light)",
                      border: "2px solid var(--border)",
                      "border-radius": "6px",
                      padding: "1rem",
                      cursor: isSaving() ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      opacity: isSaving() ? 0.5 : 1
                    }}
                  >
                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ "font-weight": "bold", "font-size": "1rem", "margin-bottom": "0.25rem" }}>
                          {item.name} <span style={{ color: "var(--text-secondary)" }}>x{item.quantity}</span>
                        </div>
                        <Show when={item.description}>
                          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                            {item.description}
                          </div>
                        </Show>
                        <div style={{ "font-size": "0.875rem", display: "flex", gap: "1rem" }}>
                          <Show when={item.health_restore}>
                            <span style={{ color: "var(--danger)" }}>❤️ +{item.health_restore} HP</span>
                          </Show>
                          <Show when={item.mana_restore}>
                            <span style={{ color: "var(--accent)" }}>💧 +{item.mana_restore} MP</span>
                          </Show>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
