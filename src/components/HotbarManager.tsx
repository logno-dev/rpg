import { createSignal, For, Show, createMemo } from "solid-js";
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
  const [showSlotModal, setShowSlotModal] = createSignal(false);
  const [selectedSlotForModal, setSelectedSlotForModal] = createSignal<number | null>(null);
  const [showItemModal, setShowItemModal] = createSignal(false);
  const [selectedItem, setSelectedItem] = createSignal<any>(null);
  const [selectedItemType, setSelectedItemType] = createSignal<'ability' | 'consumable'>('ability');
  const [slotSearchQuery, setSlotSearchQuery] = createSignal('');
  const [itemListSearchQuery, setItemListSearchQuery] = createSignal('');
  const [slotModalTab, setSlotModalTab] = createSignal<'ability' | 'consumable'>('ability');
  const [targetSlotForItem, setTargetSlotForItem] = createSignal<number>(1);
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

  // Filtered abilities and consumables for slot modal
  const filteredAbilitiesForSlot = createMemo(() => {
    const query = slotSearchQuery().toLowerCase();
    if (!query) return props.abilities;
    return props.abilities.filter((a: any) => 
      a.name?.toLowerCase().includes(query) || 
      a.description?.toLowerCase().includes(query)
    );
  });

  const filteredConsumablesForSlot = createMemo(() => {
    const query = slotSearchQuery().toLowerCase();
    if (!query) return props.consumables;
    return props.consumables.filter((c: any) => 
      c.name?.toLowerCase().includes(query) || 
      c.description?.toLowerCase().includes(query)
    );
  });

  // Filtered abilities and consumables for item list
  const filteredAbilitiesForList = createMemo(() => {
    const query = itemListSearchQuery().toLowerCase();
    if (!query) return props.abilities;
    return props.abilities.filter((a: any) => 
      a.name?.toLowerCase().includes(query) || 
      a.description?.toLowerCase().includes(query)
    );
  });

  const filteredConsumablesForList = createMemo(() => {
    const query = itemListSearchQuery().toLowerCase();
    if (!query) return props.consumables;
    return props.consumables.filter((c: any) => 
      c.name?.toLowerCase().includes(query) || 
      c.description?.toLowerCase().includes(query)
    );
  });

  // Method 1: Click on hotbar slot to open modal
  const handleSlotClick = (slot: number) => {
    setSelectedSlotForModal(slot);
    setSlotSearchQuery('');
    setSlotModalTab('ability');
    setShowSlotModal(true);
  };

  // Method 2: Click on ability/consumable to open assignment modal
  const handleItemClick = (item: any, type: 'ability' | 'consumable') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setTargetSlotForItem(1);
    setShowItemModal(true);
  };

  const handleAssignToSlot = async (slot: number, type: 'ability' | 'consumable', id: number) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/game/set-hotbar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: props.characterId,
          slot,
          type,
          abilityId: type === 'ability' ? id : undefined,
          itemId: type === 'consumable' ? id : undefined,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign');
      }
      
      setShowSlotModal(false);
      setShowItemModal(false);
      setSelectedSlotForModal(null);
      setSelectedItem(null);
      
      if (props.onHotbarChange) {
        props.onHotbarChange();
      }
    } catch (error) {
      console.error('Failed to assign:', error);
      alert('Failed to assign to hotbar');
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
          Click a slot to assign an ability or consumable. Click an ability/consumable below to assign it to a specific slot.
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
                  background: "var(--bg-light)",
                  border: "2px solid var(--border)",
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
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

      {/* Abilities and Consumables List */}
      <div class="card">
        <h3 style={{ "margin-bottom": "1rem" }}>Available Abilities & Consumables</h3>
        <p style={{ 
          "font-size": "0.875rem", 
          color: "var(--text-secondary)", 
          "margin-bottom": "1rem" 
        }}>
          Click on any ability or consumable to assign it to a hotbar slot.
        </p>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search abilities and consumables..."
          value={itemListSearchQuery()}
          onInput={(e) => setItemListSearchQuery(e.currentTarget.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            "margin-bottom": "1rem",
            background: "var(--bg-light)",
            border: "2px solid var(--border)",
            "border-radius": "6px",
            color: "var(--text)",
            "font-size": "1rem"
          }}
        />

        {/* Abilities Section */}
        <div style={{ "margin-bottom": "2rem" }}>
          <h4 style={{ "margin-bottom": "0.75rem", color: "var(--accent)" }}>
            Abilities ({filteredAbilitiesForList().length})
          </h4>
          <Show when={filteredAbilitiesForList().length === 0}>
            <div style={{
              padding: "2rem",
              "text-align": "center",
              color: "var(--text-secondary)",
              background: "var(--bg-light)",
              "border-radius": "6px"
            }}>
              {itemListSearchQuery() ? 'No abilities match your search.' : 'No abilities learned yet.'}
            </div>
          </Show>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <For each={filteredAbilitiesForList()}>
              {(ability) => (
                <div
                  onClick={() => handleItemClick(ability, 'ability')}
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--border)",
                    "border-radius": "6px",
                    padding: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "var(--bg-dark)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-light)";
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
                          <span style={{ color: "var(--accent)" }}>{ability.mana_cost} Mana</span>
                        </Show>
                        <Show when={ability.cooldown}>
                          <span style={{ color: "var(--warning)" }}>{ability.cooldown}s CD</span>
                        </Show>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Consumables Section */}
        <div>
          <h4 style={{ "margin-bottom": "0.75rem", color: "var(--success)" }}>
            Consumables ({filteredConsumablesForList().length})
          </h4>
          <Show when={filteredConsumablesForList().length === 0}>
            <div style={{
              padding: "2rem",
              "text-align": "center",
              color: "var(--text-secondary)",
              background: "var(--bg-light)",
              "border-radius": "6px"
            }}>
              {itemListSearchQuery() ? 'No consumables match your search.' : 'No consumables in inventory.'}
            </div>
          </Show>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <For each={filteredConsumablesForList()}>
              {(item) => (
                <div
                  onClick={() => handleItemClick(item, 'consumable')}
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--border)",
                    "border-radius": "6px",
                    padding: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--success)";
                    e.currentTarget.style.background = "var(--bg-dark)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-light)";
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
                          <span style={{ color: "var(--danger)" }}>+{item.health_restore} HP</span>
                        </Show>
                        <Show when={item.mana_restore}>
                          <span style={{ color: "var(--accent)" }}>+{item.mana_restore} MP</span>
                        </Show>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Modal 1: Slot Assignment Modal (when clicking on hotbar slot) */}
      <Show when={showSlotModal()}>
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
          onClick={() => setShowSlotModal(false)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "600px",
              width: "100%",
              "max-height": "80vh",
              "overflow-y": "auto",
              background: "var(--bg-dark)",
              border: "2px solid var(--accent)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ "margin-bottom": "1rem" }}>Assign to Slot {selectedSlotForModal()}</h2>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search..."
              value={slotSearchQuery()}
              onInput={(e) => setSlotSearchQuery(e.currentTarget.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                "margin-bottom": "1rem",
                background: "var(--bg-light)",
                border: "2px solid var(--border)",
                "border-radius": "6px",
                color: "var(--text)",
                "font-size": "1rem"
              }}
            />

            {/* Tabs */}
            <div class="button-group" style={{ "margin-bottom": "1rem" }}>
              <button
                class={slotModalTab() === 'ability' ? "button" : "button secondary"}
                onClick={() => setSlotModalTab('ability')}
              >
                Abilities
              </button>
              <button
                class={slotModalTab() === 'consumable' ? "button" : "button secondary"}
                onClick={() => setSlotModalTab('consumable')}
              >
                Consumables
              </button>
            </div>

            {/* Abilities List */}
            <Show when={slotModalTab() === 'ability'}>
              <div style={{ display: "grid", gap: "0.75rem", "max-height": "400px", "overflow-y": "auto" }}>
                <Show when={filteredAbilitiesForSlot().length === 0}>
                  <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                    {slotSearchQuery() ? 'No abilities match your search.' : 'No abilities available.'}
                  </div>
                </Show>
                <For each={filteredAbilitiesForSlot()}>
                  {(ability) => (
                    <div
                      onClick={() => !isSaving() && handleAssignToSlot(selectedSlotForModal()!, 'ability', ability.ability_id || ability.id)}
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
                      <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>{ability.name}</div>
                      <Show when={ability.description}>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                          {ability.description}
                        </div>
                      </Show>
                      <div style={{ "font-size": "0.875rem", display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
                        <Show when={ability.mana_cost}>
                          <span style={{ color: "var(--accent)" }}>{ability.mana_cost} Mana</span>
                        </Show>
                        <Show when={ability.cooldown}>
                          <span style={{ color: "var(--warning)" }}>{ability.cooldown}s</span>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            {/* Consumables List */}
            <Show when={slotModalTab() === 'consumable'}>
              <div style={{ display: "grid", gap: "0.75rem", "max-height": "400px", "overflow-y": "auto" }}>
                <Show when={filteredConsumablesForSlot().length === 0}>
                  <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                    {slotSearchQuery() ? 'No consumables match your search.' : 'No consumables available.'}
                  </div>
                </Show>
                <For each={filteredConsumablesForSlot()}>
                  {(item) => (
                    <div
                      onClick={() => !isSaving() && handleAssignToSlot(selectedSlotForModal()!, 'consumable', item.item_id)}
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
                      <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
                        {item.name} <span style={{ color: "var(--text-secondary)" }}>x{item.quantity}</span>
                      </div>
                      <Show when={item.description}>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                          {item.description}
                        </div>
                      </Show>
                      <div style={{ "font-size": "0.875rem", display: "flex", gap: "1rem" }}>
                        <Show when={item.health_restore}>
                          <span style={{ color: "var(--danger)" }}>+{item.health_restore} HP</span>
                        </Show>
                        <Show when={item.mana_restore}>
                          <span style={{ color: "var(--accent)" }}>+{item.mana_restore} MP</span>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            <button
              class="button secondary"
              onClick={() => setShowSlotModal(false)}
              style={{ width: "100%", "margin-top": "1rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Show>

      {/* Modal 2: Item Assignment Modal (when clicking on ability/consumable) */}
      <Show when={showItemModal() && selectedItem()}>
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
          onClick={() => setShowItemModal(false)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "500px",
              width: "100%",
              background: "var(--bg-dark)",
              border: `2px solid ${selectedItemType() === 'ability' ? 'var(--accent)' : 'var(--success)'}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ "margin-bottom": "1rem" }}>{selectedItem().name}</h2>

            {/* Item Details */}
            <div style={{ 
              padding: "1rem", 
              background: "var(--bg-light)", 
              "border-radius": "6px",
              "margin-bottom": "1.5rem"
            }}>
              <Show when={selectedItem().description}>
                <p style={{ "margin-bottom": "1rem", color: "var(--text-secondary)" }}>
                  {selectedItem().description}
                </p>
              </Show>

              <Show when={selectedItemType() === 'ability'}>
                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "0.5rem", "font-size": "0.875rem" }}>
                  <Show when={selectedItem().mana_cost}>
                    <div><strong>Mana Cost:</strong> {selectedItem().mana_cost}</div>
                  </Show>
                  <Show when={selectedItem().cooldown}>
                    <div><strong>Cooldown:</strong> {selectedItem().cooldown}s</div>
                  </Show>
                  <Show when={selectedItem().damage_min && selectedItem().damage_max}>
                    <div><strong>Damage:</strong> {selectedItem().damage_min}-{selectedItem().damage_max}</div>
                  </Show>
                  <Show when={selectedItem().healing}>
                    <div><strong>Healing:</strong> {selectedItem().healing}</div>
                  </Show>
                </div>
              </Show>

              <Show when={selectedItemType() === 'consumable'}>
                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "0.5rem", "font-size": "0.875rem" }}>
                  <Show when={selectedItem().health_restore}>
                    <div><strong>HP Restore:</strong> +{selectedItem().health_restore}</div>
                  </Show>
                  <Show when={selectedItem().mana_restore}>
                    <div><strong>MP Restore:</strong> +{selectedItem().mana_restore}</div>
                  </Show>
                  <div><strong>Quantity:</strong> x{selectedItem().quantity}</div>
                </div>
              </Show>
            </div>

            {/* Slot Selection */}
            <div style={{ "margin-bottom": "1rem" }}>
              <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>
                Assign to Slot:
              </label>
              <select
                value={targetSlotForItem()}
                onChange={(e) => setTargetSlotForItem(parseInt(e.currentTarget.value))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--bg-light)",
                  border: "2px solid var(--border)",
                  "border-radius": "6px",
                  color: "var(--text)",
                  "font-size": "1rem"
                }}
              >
                <For each={[1, 2, 3, 4, 5, 6, 7, 8]}>
                  {(slot) => {
                    const slotData = hotbar().find(s => s.slot === slot);
                    const slotLabel = slotData?.name ? `Slot ${slot} (${slotData.name})` : `Slot ${slot} (Empty)`;
                    return <option value={slot}>{slotLabel}</option>;
                  }}
                </For>
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                class="button"
                onClick={() => {
                  const id = selectedItemType() === 'ability' 
                    ? (selectedItem().ability_id || selectedItem().id)
                    : selectedItem().item_id;
                  handleAssignToSlot(targetSlotForItem(), selectedItemType(), id);
                }}
                disabled={isSaving()}
                style={{ flex: 1 }}
              >
                {isSaving() ? 'Assigning...' : 'Assign'}
              </button>
              <button
                class="button secondary"
                onClick={() => setShowItemModal(false)}
                disabled={isSaving()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
