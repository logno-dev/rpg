import { createAsync, useParams, redirect, useNavigate, cache } from "@solidjs/router";
import { createSignal, Show, For, createMemo, createEffect, Suspense } from "solid-js";
import { GameLayout } from "~/components/GameLayout";
import { ItemDetailModal } from "~/components/ItemDetailModal";
import { useCharacter } from "~/lib/CharacterContext";
import { getSelectedCharacterId, useBasicCharacterData } from "~/lib/game-helpers";

export default function InventoryPage() {
  const navigate = useNavigate();
  
  // Use shared hook to initialize character context (uses server session!)
  // This will redirect server-side if no character is selected
  const basicData = useBasicCharacterData();
  
  // Get character ID from context (falls back to localStorage for client-side calls)
  const characterId = () => store.character?.id || getSelectedCharacterId();
  
  // Redirect to active dungeon if one exists
  createEffect(() => {
    const data = basicData();
    if (data?.activeDungeonProgress) {
      console.log('[Inventory] Active dungeon found, redirecting to:', data.activeDungeonProgress.dungeon_id);
      navigate(`/game/dungeon/${data.activeDungeonProgress.dungeon_id}`);
    }
  });
  
  const [store, actions] = useCharacter();

  // Initialize context with basic data when it arrives
  createEffect(() => {
    const data = basicData();
    console.log('[Inventory] basicData changed:', data ? 'HAS DATA' : 'NO DATA');
    console.log('[Inventory] store.character:', store.character ? 'EXISTS' : 'NULL');
    
    if (data && !store.character) {
      console.log('[Inventory] Initializing context with data');
      actions.setCharacter(data.character);
      actions.setInventory(data.inventory as any);
      actions.setAbilities(data.abilities);
      actions.setHotbar(data.hotbar);
      console.log('[Inventory] Context initialized');
    } else if (data && store.character) {
      console.log('[Inventory] Data exists but character already set');
    }
  });

  // State signals
  const [inventoryFilter, setInventoryFilter] = createSignal<"all" | "weapons" | "armor" | "scrolls" | "consumables">("all");
  const [selectionMode, setSelectionMode] = createSignal(false);
  const [selectedItems, setSelectedItems] = createSignal<Set<number>>(new Set());
  const [showItemDetailModal, setShowItemDetailModal] = createSignal(false);
  const [selectedItem, setSelectedItem] = createSignal<any | null>(null);
  const [selectedItemIsMerchant, setSelectedItemIsMerchant] = createSignal(false);
  const [showBulkSellModal, setShowBulkSellModal] = createSignal(false);
  const [showDropModal, setShowDropModal] = createSignal(false);
  const [dropItemData, setDropItemData] = createSignal<{inventoryItemId: number, itemName: string, quantity: number} | null>(null);
  const [isEquipping, setIsEquipping] = createSignal(false);

  // Computed values - use context as source of truth
  const currentInventory = () => store.inventory || [];
  const currentCharacter = () => store.character;
  const currentAbilities = () => store.abilities || [];

  // Handle equip/unequip
  const handleEquip = async (inventoryItemId: number, unequip: boolean = false) => {
    if (isEquipping()) return;
    
    setIsEquipping(true);
    try {
      const response = await fetch("/api/game/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: characterId(), inventoryItemId, unequip })
      });
      
      const result = await response.json();
      if (result.success) {
        actions.setInventory(result.inventory);
      }
    } catch (error) {
      console.error("Failed to equip item:", error);
    } finally {
      setIsEquipping(false);
    }
  };

  // Handle sell item
  const handleSell = async (inventoryItemId: number, itemName: string, value: number, quantity: number) => {
    try {
      const response = await fetch('/api/game/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId, 
          quantity 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sell item');
      }
      
      const result = await response.json();
      
      if (result.success) {
        actions.setCharacter({ ...store.character!, gold: result.character.gold });
        actions.setInventory(result.inventory);
      }
    } catch (error) {
      console.error('Sell error:', error);
      alert('Failed to sell item');
    }
  };

  // Handle learn ability
  const handleLearnAbility = async (inventoryItemId: number, itemName: string) => {
    try {
      const response = await fetch('/api/game/learn-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to learn ability');
      }
      
      const result = await response.json();
      
      if (result.success) {
        actions.setInventory(result.inventory);
        actions.setAbilities(result.abilities);
      }
    } catch (error) {
      console.error('Learn ability error:', error);
      alert('Failed to learn ability');
    }
  };

  // Handle drop item click (show modal)
  const handleDropClick = (inventoryItemId: number, itemName: string, quantity: number) => {
    setDropItemData({ inventoryItemId, itemName, quantity });
    setShowDropModal(true);
  };

  // Handle drop item confirm
  const handleDropConfirm = async () => {
    const dropData = dropItemData();
    if (!dropData) return;

    setShowDropModal(false);

    try {
      const response = await fetch('/api/game/drop-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId: dropData.inventoryItemId,
          quantity: dropData.quantity
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to drop item');
      }
      
      const result = await response.json();
      
      if (result.success) {
        actions.setInventory(result.inventory);
        setDropItemData(null);
      }
    } catch (error) {
      console.error('Drop item error:', error);
      alert('Failed to drop item');
    }
  };

  // Handle view item
  const handleViewItem = (item: any, isMerchant: boolean = false) => {
    setSelectedItem(item);
    setSelectedItemIsMerchant(isMerchant);
    setShowItemDetailModal(true);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const sellableItems = currentInventory().filter((i: any) => 
      !i.equipped && i.value && i.value > 0
    );
    
    if (selectedItems().size === sellableItems.length) {
      setSelectedItems(new Set<number>());
    } else {
      setSelectedItems(new Set<number>(sellableItems.map((i: any) => i.id)));
    }
  };

  // Calculate bulk sell value
  const calculateBulkSellValue = () => {
    return currentInventory()
      .filter((i: any) => selectedItems().has(i.id))
      .reduce((total: number, item: any) => {
        return total + (Math.floor(item.value * 0.4) * item.quantity);
      }, 0);
  };

  // Handle bulk sell
  const handleBulkSell = async () => {
    const itemIds = Array.from(selectedItems());
    if (itemIds.length === 0) return;

    try {
      const response = await fetch('/api/game/bulk-sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), itemIds })
      });

      const result = await response.json();

      if (result.success) {
        actions.setCharacter({ ...store.character!, gold: result.newGold });
        const newInventory = currentInventory().filter((i: any) => !itemIds.includes(i.id));
        actions.setInventory(newInventory);
        setSelectedItems(new Set<number>());
        setSelectionMode(false);
        setShowBulkSellModal(false);
      } else {
        console.error('[BULK SELL] Error:', result.error);
        alert(result.error || 'Failed to sell items');
      }
    } catch (error) {
      console.error('Bulk sell error:', error);
      alert('Failed to sell items');
    }
  };

  // Get scroll ability status
  const getScrollAbilityStatus = (scrollItem: any) => {
    if (!scrollItem.teaches_ability_id) return { alreadyLearned: false, hasBetter: false, status: 'can_learn' };
    
    const abilities = currentAbilities();
    const hasExact = abilities.some((a: any) => a.ability_id === scrollItem.teaches_ability_id || a.id === scrollItem.teaches_ability_id);
    
    if (hasExact) {
      return { alreadyLearned: true, hasBetter: false, status: 'already_learned' };
    }
    
    const scrollName = scrollItem.name.replace('Scroll: ', '');
    const tierMatch = scrollName.match(/^(.+)\s+(I{1,3}|IV|V)$/);
    
    if (tierMatch) {
      const baseName = tierMatch[1];
      const scrollTier = tierMatch[2];
      const tierToNum: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
      const scrollTierNum = tierToNum[scrollTier] || 0;
      
      const hasBetterTier = abilities.some((a: any) => {
        const abilityTierMatch = a.name.match(/^(.+)\s+(I{1,3}|IV|V)$/);
        if (!abilityTierMatch) return false;
        
        const abilityBaseName = abilityTierMatch[1];
        const abilityTier = abilityTierMatch[2];
        const abilityTierNum = tierToNum[abilityTier] || 0;
        
        return abilityBaseName === baseName && abilityTierNum >= scrollTierNum;
      });
      
      if (hasBetterTier) {
        return { alreadyLearned: false, hasBetter: true, status: 'has_better' };
      }
    }
    
    return { alreadyLearned: false, hasBetter: false, status: 'can_learn' };
  };

  // Check requirements
  const meetsRequirements = (item: any) => {
    const char = currentCharacter();
    if (!char) return false;
    
    if (item.required_level && char.level < item.required_level) return false;
    if (item.required_strength && char.strength < item.required_strength) return false;
    if (item.required_dexterity && char.dexterity < item.required_dexterity) return false;
    if (item.required_constitution && char.constitution < item.required_constitution) return false;
    if (item.required_intelligence && char.intelligence < item.required_intelligence) return false;
    if (item.required_wisdom && char.wisdom < item.required_wisdom) return false;
    if (item.required_charisma && char.charisma < item.required_charisma) return false;
    
    return true;
  };

  // Format requirements
  const formatRequirements = (item: any) => {
    const reqs = [];
    if (item.required_level > 1) reqs.push(`Lvl ${item.required_level}`);
    if (item.required_strength > 0) reqs.push(`${item.required_strength} STR`);
    if (item.required_dexterity > 0) reqs.push(`${item.required_dexterity} DEX`);
    if (item.required_constitution > 0) reqs.push(`${item.required_constitution} CON`);
    if (item.required_intelligence > 0) reqs.push(`${item.required_intelligence} INT`);
    if (item.required_wisdom > 0) reqs.push(`${item.required_wisdom} WIS`);
    if (item.required_charisma > 0) reqs.push(`${item.required_charisma} CHA`);
    return reqs;
  };

  // Get equipment comparison
  const getEquipmentComparison = (item: any) => {
    if (!item.slot) return null;
    
    const equippedItem = currentInventory().find((i: any) => i.slot === item.slot && i.equipped === 1);
    if (!equippedItem) return null;
    
    const comparisons: Array<{stat: string, current: number, new: number, diff: number}> = [];
    
    if (item.damage_min || item.damage_max) {
      const newAvg = ((item.damage_min || 0) + (item.damage_max || 0)) / 2;
      const currentAvg = ((equippedItem.damage_min || 0) + (equippedItem.damage_max || 0)) / 2;
      if (newAvg > 0 || currentAvg > 0) {
        comparisons.push({
          stat: 'Damage',
          current: currentAvg,
          new: newAvg,
          diff: newAvg - currentAvg
        });
      }
    }
    
    if (item.armor || equippedItem.armor) {
      comparisons.push({
        stat: 'Armor',
        current: equippedItem.armor || 0,
        new: item.armor || 0,
        diff: (item.armor || 0) - (equippedItem.armor || 0)
      });
    }
    
    if (item.attack_speed && item.attack_speed !== 1 || equippedItem.attack_speed && equippedItem.attack_speed !== 1) {
      const currentSpeed = equippedItem.attack_speed || 1;
      const newSpeed = item.attack_speed || 1;
      const diff = currentSpeed - newSpeed;
      comparisons.push({
        stat: 'Attack Speed',
        current: currentSpeed,
        new: newSpeed,
        diff: diff
      });
    }
    
    const stats = [
      { key: 'strength_bonus', label: 'Strength' },
      { key: 'dexterity_bonus', label: 'Dexterity' },
      { key: 'constitution_bonus', label: 'Constitution' },
      { key: 'intelligence_bonus', label: 'Intelligence' },
      { key: 'wisdom_bonus', label: 'Wisdom' },
      { key: 'charisma_bonus', label: 'Charisma' }
    ];
    
    stats.forEach(({ key, label }) => {
      const newValue = (item as any)[key] || 0;
      const currentValue = (equippedItem as any)[key] || 0;
      if (newValue > 0 || currentValue > 0) {
        comparisons.push({
          stat: label,
          current: currentValue,
          new: newValue,
          diff: newValue - currentValue
        });
      }
    });
    
    return {
      equippedItem,
      comparisons: comparisons.filter(c => c.diff !== 0)
    };
  };

  const LoadingSkeleton = () => (
    <>
      <div class="card">
        <div style={{ height: "400px", display: "flex", "align-items": "center", "justify-content": "center", "flex-direction": "column", gap: "1rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
          <div style={{ "font-size": "3rem" }}>📦</div>
          <div style={{ "font-size": "1.25rem", color: "var(--text-secondary)" }}>Loading inventory...</div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );

  return (
    <GameLayout>
      <Suspense fallback={<LoadingSkeleton />}>
      <Show when={basicData()}>
      {/* Equipment Slots */}
      <div class="card">
        <h3 style={{ "margin-bottom": "1rem" }}>Equipment</h3>
        <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <For each={["weapon", "head", "chest", "hands", "feet"]}>
            {(slotName) => {
              const equippedItem = createMemo(() => 
                currentInventory().find((i: any) => i.slot === slotName && i.equipped === 1)
              );
              return (
                <div style={{
                  padding: "1rem",
                  background: "var(--bg-light)",
                  "border-radius": "6px",
                  border: equippedItem() ? "2px solid var(--accent)" : "2px dashed #444",
                  "min-height": "120px",
                  display: "flex",
                  "flex-direction": "column",
                  "justify-content": "space-between"
                }}>
                  <div>
                    <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "text-transform": "uppercase", "font-weight": "bold", "margin-bottom": "0.5rem" }}>
                      {slotName}
                    </div>
                    <Show when={equippedItem()} fallback={
                      <div style={{ color: "#666", "font-style": "italic", "font-size": "0.875rem" }}>Empty</div>
                    }>
                      {(item) => (
                        <>
                          <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>{item().name}</div>
                          <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                            {item().rarity}
                          </div>
                          <div style={{ "font-size": "0.75rem", "margin-bottom": "0.5rem" }}>
                            <Show when={item().damage_min && item().damage_max}>
                              <div style={{ color: "var(--danger)" }}>⚔️ {item().damage_min}-{item().damage_max} Damage</div>
                            </Show>
                            <Show when={item().armor}>
                              <div style={{ color: "var(--accent)" }}>🛡️ {item().armor} Armor</div>
                            </Show>
                            <Show when={item().attack_speed && item().attack_speed !== 1}>
                              <div style={{ color: "var(--success)" }}>⚡ {item().attack_speed}x Speed</div>
                            </Show>
                            <Show when={item().strength_bonus}>
                              <div>💪 +{item().strength_bonus} STR</div>
                            </Show>
                            <Show when={item().dexterity_bonus}>
                              <div>🏃 +{item().dexterity_bonus} DEX</div>
                            </Show>
                            <Show when={item().constitution_bonus}>
                              <div>❤️ +{item().constitution_bonus} CON</div>
                            </Show>
                            <Show when={item().intelligence_bonus}>
                              <div>🧠 +{item().intelligence_bonus} INT</div>
                            </Show>
                            <Show when={item().wisdom_bonus}>
                              <div>✨ +{item().wisdom_bonus} WIS</div>
                            </Show>
                            <Show when={item().charisma_bonus}>
                              <div>💫 +{item().charisma_bonus} CHA</div>
                            </Show>
                          </div>
                          <button
                            class="button danger"
                            style={{ width: "100%", "font-size": "0.75rem", padding: "0.4rem" }}
                            onClick={() => handleEquip(item().id, true)}
                          >
                            Unequip
                          </button>
                        </>
                      )}
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* General Inventory */}
      <div class="card">
        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
          <h3 style={{ margin: 0 }}>Inventory</h3>
          <button
            class={selectionMode() ? "button" : "button secondary"}
            onClick={() => {
              setSelectionMode(!selectionMode());
              setSelectedItems(new Set<number>());
            }}
            style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
          >
            {selectionMode() ? "Cancel Selection" : "Select Items"}
          </button>
        </div>
        
        {/* Bulk Action Buttons */}
        <Show when={selectionMode() && selectedItems().size > 0}>
          <div style={{
            padding: "1rem",
            background: "var(--bg-light)",
            "border-radius": "6px",
            "margin-bottom": "1rem",
            display: "flex",
            gap: "1rem",
            "align-items": "center",
            "justify-content": "space-between"
          }}>
            <div>
              <div style={{ "font-weight": "bold" }}>{selectedItems().size} item{selectedItems().size !== 1 ? 's' : ''} selected</div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                Total value: {calculateBulkSellValue()}g (at 40%)
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                class="button secondary"
                onClick={toggleSelectAll}
                style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
              >
                {selectedItems().size === currentInventory().filter((i: any) => !i.equipped && i.value && i.value > 0).length ? "Deselect All" : "Select All"}
              </button>
              <button
                class="button"
                onClick={() => setShowBulkSellModal(true)}
                style={{ "font-size": "0.875rem", padding: "0.5rem 1rem", background: "var(--warning)", color: "var(--bg-dark)" }}
              >
                Sell Selected
              </button>
            </div>
          </div>
        </Show>
        
        {/* Filter Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "0.5rem", 
          "margin-bottom": "1.5rem",
          "flex-wrap": "wrap"
        }}>
          <button 
            class={inventoryFilter() === "all" ? "button" : "button secondary"}
            onClick={() => setInventoryFilter("all")}
            style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
          >
            All
          </button>
          <button 
            class={inventoryFilter() === "weapons" ? "button" : "button secondary"}
            onClick={() => setInventoryFilter("weapons")}
            style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
          >
            ⚔️ Weapons
          </button>
          <button 
            class={inventoryFilter() === "armor" ? "button" : "button secondary"}
            onClick={() => setInventoryFilter("armor")}
            style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
          >
            🛡️ Armor
          </button>
          <button 
            class={inventoryFilter() === "scrolls" ? "button" : "button secondary"}
            onClick={() => setInventoryFilter("scrolls")}
            style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
          >
            📜 Scrolls
          </button>
          <button 
            class={inventoryFilter() === "consumables" ? "button" : "button secondary"}
            onClick={() => setInventoryFilter("consumables")}
            style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
          >
            🧪 Consumables
          </button>
        </div>
        
        {/* Categorized "All" View */}
        <Show when={inventoryFilter() === "all"}>
          <Show when={currentInventory().filter((i: any) => !i.equipped && i.slot === "weapon").length > 0}>
            <h4 style={{ "margin-bottom": "0.75rem", color: "var(--accent)", display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "1.1rem" }}>
              ⚔️ Weapons ({currentInventory().filter((i: any) => !i.equipped && i.slot === "weapon").length})
            </h4>
            <div style={{ "margin-bottom": "2rem" }}>
              <For each={currentInventory().filter((i: any) => !i.equipped && i.slot === "weapon")}>
                {(invItem: any) => {
                  const canSell = invItem.value && invItem.value > 0;
                  const isSelected = selectedItems().has(invItem.id);
                  
                  return (
                    <div 
                      style={{
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "center",
                        padding: "0.75rem 1rem",
                        background: isSelected ? "rgba(251, 191, 36, 0.1)" : "var(--bg-light)",
                        "border-radius": "6px",
                        "margin-bottom": "0.5rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: isSelected ? "1px solid var(--warning)" : "1px solid transparent"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-dark)";
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-light)";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                      onClick={() => {
                        if (selectionMode() && canSell) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <Show when={selectionMode()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!canSell}
                            style={{ width: "18px", height: "18px", cursor: canSell ? "pointer" : "not-allowed" }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => canSell && toggleItemSelection(invItem.id)}
                          />
                        </Show>
                        <div style={{ flex: 1, opacity: selectionMode() && !canSell ? 0.5 : 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{invItem.name}</div>
                          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                            {invItem.slot && `${invItem.slot} • `}
                            <Show when={invItem.damage_min && invItem.damage_max}>
                              ⚔️ {invItem.damage_min}-{invItem.damage_max} Dmg
                            </Show>
                            <Show when={selectionMode() && invItem.value}>
                               • {Math.floor(invItem.value * 0.4 * invItem.quantity)}g
                            </Show>
                          </div>
                        </div>
                        <Show when={invItem.quantity > 1}>
                          <div style={{ "font-weight": "bold", color: "var(--accent)" }}>x{invItem.quantity}</div>
                        </Show>
                      </div>
                      <Show when={!selectionMode()}>
                        <div style={{ color: "var(--text-secondary)", "font-size": "1.25rem" }}>›</div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
          
          <Show when={currentInventory().filter((i: any) => !i.equipped && i.slot && i.slot !== "weapon" && i.type === "equipment").length > 0}>
            <h4 style={{ "margin-bottom": "0.75rem", color: "var(--accent)", display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "1.1rem" }}>
              🛡️ Armor ({currentInventory().filter((i: any) => !i.equipped && i.slot && i.slot !== "weapon" && i.type === "equipment").length})
            </h4>
            <div style={{ "margin-bottom": "2rem" }}>
              <For each={currentInventory().filter((i: any) => !i.equipped && i.slot && i.slot !== "weapon" && i.type === "equipment")}>
                {(invItem: any) => {
                  const canSell = invItem.value && invItem.value > 0;
                  const isSelected = selectedItems().has(invItem.id);
                  
                  return (
                    <div 
                      style={{
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "center",
                        padding: "0.75rem 1rem",
                        background: isSelected ? "rgba(251, 191, 36, 0.1)" : "var(--bg-light)",
                        "border-radius": "6px",
                        "margin-bottom": "0.5rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: isSelected ? "1px solid var(--warning)" : "1px solid transparent"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-dark)";
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-light)";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                      onClick={() => {
                        if (selectionMode() && canSell) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <Show when={selectionMode()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!canSell}
                            style={{ width: "18px", height: "18px", cursor: canSell ? "pointer" : "not-allowed" }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => canSell && toggleItemSelection(invItem.id)}
                          />
                        </Show>
                        <div style={{ flex: 1, opacity: selectionMode() && !canSell ? 0.5 : 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{invItem.name}</div>
                          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                            {invItem.slot && `${invItem.slot} • `}
                            <Show when={invItem.armor}>🛡️ {invItem.armor} Armor</Show>
                            <Show when={selectionMode() && invItem.value}>
                               • {Math.floor(invItem.value * 0.4 * invItem.quantity)}g
                            </Show>
                          </div>
                        </div>
                        <Show when={invItem.quantity > 1}>
                          <div style={{ "font-weight": "bold", color: "var(--accent)" }}>x{invItem.quantity}</div>
                        </Show>
                      </div>
                      <Show when={!selectionMode()}>
                        <div style={{ color: "var(--text-secondary)", "font-size": "1.25rem" }}>›</div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
          
          <Show when={currentInventory().filter((i: any) => !i.equipped && i.type === "scroll").length > 0}>
            <h4 style={{ "margin-bottom": "0.75rem", color: "var(--accent)", display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "1.1rem" }}>
              📜 Scrolls ({currentInventory().filter((i: any) => !i.equipped && i.type === "scroll").length})
            </h4>
            <div style={{ "margin-bottom": "2rem" }}>
              <For each={currentInventory().filter((i: any) => !i.equipped && i.type === "scroll")}>
                {(invItem: any) => {
                  const scrollStatus = getScrollAbilityStatus(invItem);
                  const canSell = invItem.value && invItem.value > 0;
                  const isSelected = selectedItems().has(invItem.id);
                  
                  return (
                    <div 
                      style={{
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "center",
                        padding: "0.75rem 1rem",
                        background: isSelected ? "rgba(251, 191, 36, 0.1)" : "var(--bg-light)",
                        "border-radius": "6px",
                        "margin-bottom": "0.5rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: isSelected ? "1px solid var(--warning)" : "1px solid transparent"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-dark)";
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-light)";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                      onClick={() => {
                        if (selectionMode() && canSell) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <Show when={selectionMode()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!canSell}
                            style={{ width: "18px", height: "18px", cursor: canSell ? "pointer" : "not-allowed" }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => canSell && toggleItemSelection(invItem.id)}
                          />
                        </Show>
                        <div style={{ flex: 1, opacity: selectionMode() && !canSell ? 0.5 : 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{invItem.name}</div>
                          <div style={{ "font-size": "0.875rem", color: scrollStatus.alreadyLearned ? "var(--success)" : scrollStatus.hasBetter ? "var(--warning)" : "var(--text-secondary)" }}>
                            {scrollStatus.alreadyLearned ? "✓ Already Learned" : scrollStatus.hasBetter ? "⚠ You have better" : "Ability Scroll"}
                            <Show when={selectionMode() && invItem.value}>
                               • {Math.floor(invItem.value * 0.4 * invItem.quantity)}g
                            </Show>
                          </div>
                        </div>
                        <Show when={invItem.quantity > 1}>
                          <div style={{ "font-weight": "bold", color: "var(--accent)" }}>x{invItem.quantity}</div>
                        </Show>
                      </div>
                      <Show when={!selectionMode()}>
                        <div style={{ color: "var(--text-secondary)", "font-size": "1.25rem" }}>›</div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
          
          <Show when={currentInventory().filter((i: any) => !i.equipped && i.type === "consumable").length > 0}>
            <h4 style={{ "margin-bottom": "0.75rem", color: "var(--accent)", display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "1.1rem" }}>
              🧪 Consumables ({currentInventory().filter((i: any) => !i.equipped && i.type === "consumable").length})
            </h4>
            <div style={{ "margin-bottom": "2rem" }}>
              <For each={currentInventory().filter((i: any) => !i.equipped && i.type === "consumable")}>
                {(invItem: any) => {
                  const canSell = invItem.value && invItem.value > 0;
                  const isSelected = selectedItems().has(invItem.id);
                  
                  return (
                    <div 
                      style={{
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "center",
                        padding: "0.75rem 1rem",
                        background: isSelected ? "rgba(251, 191, 36, 0.1)" : "var(--bg-light)",
                        "border-radius": "6px",
                        "margin-bottom": "0.5rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: isSelected ? "1px solid var(--warning)" : "1px solid transparent"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-dark)";
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--bg-light)";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                      onClick={() => {
                        if (selectionMode() && canSell) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <Show when={selectionMode()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!canSell}
                            style={{ width: "18px", height: "18px", cursor: canSell ? "pointer" : "not-allowed" }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => canSell && toggleItemSelection(invItem.id)}
                          />
                        </Show>
                        <div style={{ flex: 1, opacity: selectionMode() && !canSell ? 0.5 : 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{invItem.name}</div>
                          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                            <Show when={invItem.health_restore}>❤️ +{invItem.health_restore} HP</Show>
                            <Show when={invItem.health_restore && invItem.mana_restore}> • </Show>
                            <Show when={invItem.mana_restore}>✨ +{invItem.mana_restore} MP</Show>
                            <Show when={selectionMode() && invItem.value}>
                               • {Math.floor(invItem.value * 0.4 * invItem.quantity)}g
                            </Show>
                          </div>
                        </div>
                        <Show when={invItem.quantity > 1}>
                          <div style={{ "font-weight": "bold", color: "var(--accent)" }}>x{invItem.quantity}</div>
                        </Show>
                      </div>
                      <Show when={!selectionMode()}>
                        <div style={{ color: "var(--text-secondary)", "font-size": "1.25rem" }}>›</div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </Show>
        
        {/* Filtered View */}
        <Show when={inventoryFilter() !== "all"}>
          <div>
            <For each={currentInventory().filter((i: any) => {
              if (i.equipped) return false;
              if (inventoryFilter() === "weapons") return i.slot === "weapon";
              if (inventoryFilter() === "armor") return i.slot && i.slot !== "weapon" && i.type === "equipment";
              if (inventoryFilter() === "scrolls") return i.type === "scroll";
              if (inventoryFilter() === "consumables") return i.type === "consumable";
              return false;
            })}>
              {(invItem: any) => {
                const scrollStatus = invItem.type === "scroll" ? getScrollAbilityStatus(invItem) : { alreadyLearned: false, hasBetter: false };
                const canSell = invItem.value && invItem.value > 0;
                const isSelected = selectedItems().has(invItem.id);
                
                return (
                  <div 
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      padding: "0.75rem 1rem",
                      background: isSelected ? "rgba(251, 191, 36, 0.1)" : "var(--bg-light)",
                      "border-radius": "6px",
                      "margin-bottom": "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: isSelected ? "1px solid var(--warning)" : "1px solid transparent"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "var(--bg-dark)";
                        e.currentTarget.style.borderColor = "var(--accent)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "var(--bg-light)";
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }}
                    onClick={() => {
                      if (selectionMode() && canSell) {
                        toggleItemSelection(invItem.id);
                      } else if (!selectionMode()) {
                        handleViewItem(invItem, false);
                      }
                    }}
                  >
                    <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                      <Show when={selectionMode()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!canSell}
                          style={{ width: "18px", height: "18px", cursor: canSell ? "pointer" : "not-allowed" }}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => canSell && toggleItemSelection(invItem.id)}
                        />
                      </Show>
                      <div style={{ flex: 1, opacity: selectionMode() && !canSell ? 0.5 : 1 }}>
                        <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{invItem.name}</div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                          <Show when={invItem.slot}>
                            {invItem.slot}
                            <Show when={invItem.damage_min}> • ⚔️ {invItem.damage_min}-{invItem.damage_max} Dmg</Show>
                            <Show when={invItem.armor}> • 🛡️ {invItem.armor} Armor</Show>
                          </Show>
                          <Show when={invItem.type === "scroll"}>
                            <span style={{ color: scrollStatus.alreadyLearned ? "var(--success)" : scrollStatus.hasBetter ? "var(--warning)" : "var(--text-secondary)" }}>
                              {scrollStatus.alreadyLearned ? "✓ Already Learned" : scrollStatus.hasBetter ? "⚠ You have better" : "Ability Scroll"}
                            </span>
                          </Show>
                          <Show when={invItem.type === "consumable"}>
                            <Show when={invItem.health_restore}>❤️ +{invItem.health_restore} HP</Show>
                            <Show when={invItem.health_restore && invItem.mana_restore}> • </Show>
                            <Show when={invItem.mana_restore}>✨ +{invItem.mana_restore} MP</Show>
                          </Show>
                          <Show when={selectionMode() && invItem.value}>
                             • {Math.floor(invItem.value * 0.4 * invItem.quantity)}g
                          </Show>
                        </div>
                      </div>
                      <Show when={invItem.quantity > 1}>
                        <div style={{ "font-weight": "bold", color: "var(--accent)" }}>x{invItem.quantity}</div>
                      </Show>
                    </div>
                    <Show when={!selectionMode()}>
                      <div style={{ color: "var(--text-secondary)", "font-size": "1.25rem" }}>›</div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </div>

      {/* Item Detail Modal */}
      <Show when={showItemDetailModal() && selectedItem()}>
        <ItemDetailModal
          item={selectedItem()}
          isOpen={showItemDetailModal()}
          onClose={() => {
            setShowItemDetailModal(false);
            setSelectedItem(null);
          }}
          meetsRequirements={meetsRequirements}
          formatRequirements={formatRequirements}
          getScrollAbilityStatus={getScrollAbilityStatus}
          getEquipmentComparison={getEquipmentComparison}
          onEquip={(id) => handleEquip(id, false)}
          onSell={handleSell}
          onLearnAbility={handleLearnAbility}
          onDrop={handleDropClick}
          isMerchantItem={selectedItemIsMerchant()}
        />
      </Show>

      {/* Bulk Sell Modal */}
      <Show when={showBulkSellModal()}>
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
          onClick={() => setShowBulkSellModal(false)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "500px",
              width: "100%",
              background: "var(--bg-dark)",
              border: "2px solid var(--warning)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ "margin-bottom": "1rem" }}>Sell Items</h2>
            
            <div style={{ "margin-bottom": "1rem" }}>
              <p style={{ color: "var(--text-secondary)", "margin-bottom": "1rem" }}>
                You are about to sell {selectedItems().size} item{selectedItems().size !== 1 ? 's' : ''}:
              </p>
              
              <div style={{ 
                "max-height": "200px", 
                "overflow-y": "auto",
                background: "var(--bg-light)",
                "border-radius": "6px",
                padding: "0.75rem",
                "margin-bottom": "1rem"
              }}>
                <For each={currentInventory().filter((i: any) => selectedItems().has(i.id))}>
                  {(item: any) => (
                    <div style={{ 
                      display: "flex", 
                      "justify-content": "space-between",
                      padding: "0.5rem 0",
                      "border-bottom": "1px solid var(--bg-dark)"
                    }}>
                      <span>{item.name}</span>
                      <span style={{ color: "var(--warning)" }}>{Math.floor((item.value || 0) * 0.4)}g</span>
                    </div>
                  )}
                </For>
              </div>
              
              <div style={{ 
                padding: "1rem",
                background: "var(--warning)",
                color: "var(--bg-dark)",
                "border-radius": "6px",
                "text-align": "center",
                "font-weight": "bold",
                "font-size": "1.25rem"
              }}>
                Total: {calculateBulkSellValue()} Gold
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                class="button secondary"
                onClick={() => setShowBulkSellModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                class="button"
                onClick={handleBulkSell}
                style={{ flex: 1, background: "var(--warning)", color: "var(--bg-dark)" }}
              >
                Sell Items
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Drop Confirmation Modal */}
      <Show when={showDropModal() && dropItemData()}>
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
          onClick={() => setShowDropModal(false)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "450px",
              width: "100%",
              background: "var(--bg-dark)",
              border: "2px solid var(--danger)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ "margin-bottom": "1rem", color: "var(--danger)" }}>⚠️ Drop Item</h2>
            
            <div style={{ "margin-bottom": "1.5rem" }}>
              <p style={{ color: "var(--text-secondary)", "margin-bottom": "1rem" }}>
                Are you sure you want to drop this item? This action cannot be undone.
              </p>
              
              <div style={{ 
                padding: "1rem",
                background: "var(--bg-light)",
                "border-radius": "6px",
                "margin-bottom": "1rem"
              }}>
                <div style={{ 
                  "font-weight": "bold",
                  "font-size": "1.1rem",
                  "margin-bottom": "0.5rem"
                }}>
                  {dropItemData()?.itemName}
                </div>
                <Show when={dropItemData()?.quantity && dropItemData()!.quantity > 1}>
                  <div style={{ color: "var(--text-secondary)", "font-size": "0.875rem" }}>
                    Quantity: {dropItemData()?.quantity}
                  </div>
                </Show>
              </div>
              
              <div style={{ 
                padding: "0.75rem",
                background: "rgba(239, 68, 68, 0.1)",
                "border-radius": "6px",
                "border-left": "4px solid var(--danger)",
                "font-size": "0.875rem",
                color: "var(--danger)"
              }}>
                <strong>Warning:</strong> Dropped items are permanently deleted and cannot be recovered.
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                class="button secondary"
                onClick={() => {
                  setShowDropModal(false);
                  setDropItemData(null);
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                class="button danger"
                onClick={handleDropConfirm}
                style={{ flex: 1 }}
              >
                Drop Item
              </button>
            </div>
          </div>
        </div>
      </Show>
      </Show>
      </Suspense>
    </GameLayout>
  );
}
