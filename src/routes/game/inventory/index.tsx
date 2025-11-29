import { createAsync, useParams, redirect, useNavigate, cache } from "@solidjs/router";
import { createSignal, Show, For, createMemo, createEffect, Suspense } from "solid-js";
import { GameLayout } from "~/components/GameLayout";
import { ItemDetailModal } from "~/components/ItemDetailModal";
import { ToastContainer, type ToastMessage } from "~/components/Toast";
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
    if (data) {
      console.log('[Inventory] basicData loaded:', {
        character: data.character?.name,
        abilities: data.abilities?.length,
        hotbar: data.hotbar?.length,
        inventory: data.inventory?.length
      });
      
      // Only set character if not already set
      if (!store.character) {
        actions.setCharacter(data.character);
      }
      
      // Always sync abilities, hotbar, and inventory (they may have changed)
      actions.setInventory(data.inventory as any);
      actions.setAbilities(data.abilities);
      actions.setHotbar(data.hotbar);
      
      console.log('[Inventory] Context updated');
    }
  });

  // State signals
  const [inventoryFilter, setInventoryFilter] = createSignal<"all" | "weapons" | "armor" | "offhand" | "scrolls" | "consumables">("all");
  const [selectionMode, setSelectionMode] = createSignal(false);
  const [selectedItems, setSelectedItems] = createSignal<Set<number>>(new Set());
  const [showItemDetailModal, setShowItemDetailModal] = createSignal(false);
  const [selectedItem, setSelectedItem] = createSignal<any | null>(null);
  const [selectedItemIsMerchant, setSelectedItemIsMerchant] = createSignal(false);
  const [showBulkSellModal, setShowBulkSellModal] = createSignal(false);
  const [showDropModal, setShowDropModal] = createSignal(false);
  const [dropItemData, setDropItemData] = createSignal<{inventoryItemId: number, itemName: string, quantity: number} | null>(null);
  const [isEquipping, setIsEquipping] = createSignal(false);
  const [showLearnResultModal, setShowLearnResultModal] = createSignal(false);
  const [learnResultData, setLearnResultData] = createSignal<{success: boolean, message: string, abilityName?: string} | null>(null);
  const [showSalvageConfirmModal, setShowSalvageConfirmModal] = createSignal(false);
  const [salvageItemData, setSalvageItemData] = createSignal<{inventoryItemId: number, itemName: string} | null>(null);
  const [showSalvageResultModal, setShowSalvageResultModal] = createSignal(false);
  const [salvageResultData, setSalvageResultData] = createSignal<{itemName: string, materials: Array<{name: string, quantity: number}>} | null>(null);
  const [showBulkSalvageModal, setShowBulkSalvageModal] = createSignal(false);
  const [showSellModal, setShowSellModal] = createSignal(false);
  const [sellItemData, setSellItemData] = createSignal<{inventoryItemId: number, itemName: string, value: number, quantity: number} | null>(null);
  const [sellQuantity, setSellQuantity] = createSignal(1);
  const [showEquipConfirmModal, setShowEquipConfirmModal] = createSignal(false);
  const [equipConfirmData, setEquipConfirmData] = createSignal<{inventoryItemId: number, conflict: {name: string, slot: string}, message: string} | null>(null);
  
  // Toast notifications
  const [toasts, setToasts] = createSignal<ToastMessage[]>([]);
  let toastIdCounter = 0;
  
  const addToast = (message: string, type: "success" | "error" | "warning" | "info" = "info", duration = 3000) => {
    const id = toastIdCounter++;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // Loading states for actions
  const [isSelling, setIsSelling] = createSignal(false);
  const [isSalvaging, setIsSalvaging] = createSignal(false);

  // Computed values - use context as source of truth
  const currentInventory = () => store.inventory || [];
  const currentCharacter = () => store.character;
  const currentAbilities = () => store.abilities || [];

  // Handle equip/unequip
  const handleEquip = async (inventoryItemId: number, unequip: boolean = false, confirmed: boolean = false) => {
    if (isEquipping()) return;
    
    setIsEquipping(true);
    try {
      const response = await fetch("/api/game/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId, 
          equipped: unequip, // API expects 'equipped' (true=unequip, false=equip)
          confirm: confirmed 
        })
      });
      
      const result = await response.json();
      
      // If confirmation required, show modal
      if (result.requiresConfirmation) {
        setEquipConfirmData({
          inventoryItemId,
          conflict: result.conflict,
          message: result.message
        });
        setShowEquipConfirmModal(true);
        setIsEquipping(false);
        return;
      }
      
      // Success - update inventory
      if (result.success) {
        actions.setInventory(result.inventory);
        
        // Show toast notification if something was unequipped
        if (result.unequippedItem) {
          addToast(`Unequipped ${result.unequippedItem.name}`, "info");
        }
      }
    } catch (error) {
      console.error("Failed to equip item:", error);
    } finally {
      setIsEquipping(false);
    }
  };

  // Confirm equipment swap
  const handleEquipConfirm = async () => {
    const data = equipConfirmData();
    if (!data) return;
    
    setShowEquipConfirmModal(false);
    setEquipConfirmData(null);
    
    // Call handleEquip again with confirmed=true
    await handleEquip(data.inventoryItemId, false, true);
  };

  // Handle sell item
  // Open sell confirmation modal (don't sell immediately)
  const handleSell = (inventoryItemId: number, itemName: string, value: number, quantity: number) => {
    console.log('[INVENTORY] handleSell called - opening modal', { inventoryItemId, itemName, value, quantity });
    setSellItemData({ inventoryItemId, itemName, value, quantity });
    setSellQuantity(quantity); // Default to all
    setShowSellModal(true);
  };
  
  // Actually perform the sell after confirmation
  const handleSellConfirm = async () => {
    const data = sellItemData();
    if (!data) return;
    
    const quantityToSell = sellQuantity();
    setShowSellModal(false);
    setShowItemDetailModal(false);
    setSelectedItem(null);
    setIsSelling(true);
    
    try {
      const response = await fetch('/api/game/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId: data.inventoryItemId, 
          quantity: quantityToSell 
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
      
      setSellItemData(null);
      setSellQuantity(1);
    } catch (error) {
      console.error('Sell error:', error);
      alert('Failed to sell item');
    } finally {
      setIsSelling(false);
    }
  };

  // Handle salvage item click (show confirmation)
  const handleSalvageClick = (inventoryItemId: number, itemName: string) => {
    setSalvageItemData({ inventoryItemId, itemName });
    setShowSalvageConfirmModal(true);
  };

  // Handle salvage confirmation
  const handleSalvageConfirm = async () => {
    const data = salvageItemData();
    if (!data) return;

    setShowSalvageConfirmModal(false);
    setShowItemDetailModal(false);
    setSelectedItem(null);
    setIsSalvaging(true);

    try {
      const response = await fetch('/api/game/salvage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId: data.inventoryItemId 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || result.error) {
        // Show error in result modal
        setSalvageResultData({
          itemName: data.itemName,
          materials: []
        });
        setShowSalvageResultModal(true);
        return;
      }
      
      if (result.success) {
        actions.setInventory(result.inventory);
        
        // Show success modal with materials gained
        setSalvageResultData({
          itemName: data.itemName,
          materials: result.materialsGained
        });
        setShowSalvageResultModal(true);
      }
    } catch (error) {
      console.error('Salvage error:', error);
      setSalvageResultData({
        itemName: data.itemName,
        materials: []
      });
      setShowSalvageResultModal(true);
    } finally {
      setIsSalvaging(false);
    }
  };

  // Handle learn ability
  const handleLearnAbility = async (inventoryItemId: number, itemName: string) => {
    // Close the item detail modal first
    setShowItemDetailModal(false);
    setSelectedItem(null);
    
    try {
      const response = await fetch('/api/game/learn-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || result.error) {
        // Show error in modal
        setLearnResultData({
          success: false,
          message: result.error || 'Failed to learn ability'
        });
        setShowLearnResultModal(true);
        return;
      }
      
      if (result.success) {
        // Update inventory and abilities from API response
        actions.setInventory(result.inventory);
        actions.setAbilities(result.abilities);
        
        // Show success in modal
        setLearnResultData({
          success: true,
          message: result.message || `Learned ${result.ability?.name || 'ability'}!`,
          abilityName: result.ability?.name
        });
        setShowLearnResultModal(true);
      }
    } catch (error: any) {
      console.error('Learn ability error:', error);
      setLearnResultData({
        success: false,
        message: error.message || 'Failed to learn ability'
      });
      setShowLearnResultModal(true);
    }
  };

  // Handle use item
  const handleUseItem = async (inventoryItemId: number, itemName: string, healthRestore: number, manaRestore: number) => {
    try {
      const response = await fetch('/api/game/use-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || result.error) {
        console.error('Use item error:', result.error);
        return;
      }
      
      if (result.success) {
        // Update character and inventory from API response
        actions.setCharacter(result.character);
        actions.setInventory(result.inventory);
      }
    } catch (error: any) {
      console.error('Use item error:', error);
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
  // Helper to check if item can be selected (sellable or salvageable)
  const canSelectItem = (item: any) => {
    if (item.equipped) return false;
    // Sellable (has value) or Salvageable (armor/weapon)
    return (item.value && item.value > 0) || (item.type === 'armor' || item.type === 'weapon');
  };
  
  // Helper to create long press handlers for bulk select
  const createLongPressHandlers = (itemId: number, canSelect: boolean) => {
    let pressTimer: number | null = null;
    
    return {
      onTouchStart: (e: TouchEvent) => {
        if (!canSelect) return;
        pressTimer = window.setTimeout(() => {
          // Long press detected - enable selection mode and select this item
          if (!selectionMode()) {
            setSelectionMode(true);
            setSelectedItems(new Set([itemId]));
          }
        }, 500); // 500ms long press
      },
      onTouchEnd: () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      },
      onTouchMove: () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      }
    };
  };

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
    const selectableItems = currentInventory().filter(canSelectItem);
    
    if (selectedItems().size === selectableItems.length) {
      setSelectedItems(new Set<number>());
    } else {
      setSelectedItems(new Set<number>(selectableItems.map((i: any) => i.id)));
    }
  };

  // Get item rarity class for color coding
  const getItemRarityClass = (item: any) => {
    // Crafting materials - grey
    if (item.type === 'material' || item.name?.includes('Ore') || item.name?.includes('Leather') || item.name?.includes('Cloth')) {
      return 'rarity-material';
    }
    
    // Consumables (potions, food) - purple
    if (item.type === 'consumable' || item.name?.includes('Potion') || item.name?.includes('Elixir')) {
      return 'rarity-consumable';
    }
    
    // Equipment - color by rarity
    if (item.rarity) {
      switch (item.rarity.toLowerCase()) {
        case 'common': return 'rarity-common';
        case 'uncommon': return 'rarity-uncommon';
        case 'rare': return 'rarity-rare';
        case 'epic': return 'rarity-epic';
        case 'legendary': return 'rarity-legendary';
        default: return 'rarity-default';
      }
    }
    
    return 'rarity-default';
  };

  // Get quality-prefixed item name
  const getItemDisplayName = (item: any) => {
    if (!item.quality || item.quality === 'common') {
      return item.name;
    }
    
    const qualityLabel = item.quality.charAt(0).toUpperCase() + item.quality.slice(1);
    return `${qualityLabel} ${item.name}`;
  };

  // Get item class names for selection styling
  const getItemClassNames = (invItem: any) => {
    const classes = ['inventory-item'];
    const canSelect = canSelectItem(invItem);
    const isSelected = selectedItems().has(invItem.id);
    
    // Add rarity class for color coding
    classes.push(getItemRarityClass(invItem));
    
    // Add requirements check - subtle red tint if requirements not met
    if (hasRequirements(invItem) && !meetsRequirements(invItem)) {
      classes.push('requirements-not-met');
    }
    
    if (selectionMode()) {
      if (canSelect) {
        classes.push('selectable');
      } else {
        classes.push('not-selectable');
      }
    }
    
    if (isSelected) {
      classes.push('selected');
    }
    
    return classes.join(' ');
  };

  // Calculate bulk sell value
  const calculateBulkSellValue = () => {
    return currentInventory()
      .filter((i: any) => selectedItems().has(i.id))
      .reduce((total: number, item: any) => {
        return total + (Math.floor(item.value * 0.4) * item.quantity);
      }, 0);
  };

  // Count salvageable items
  const countSalvageableItems = () => {
    return currentInventory()
      .filter((i: any) => selectedItems().has(i.id))
      .filter((i: any) => !i.equipped && (i.type === 'armor' || i.type === 'weapon'))
      .length;
  };

  // Handle bulk salvage click
  const handleBulkSalvageClick = () => {
    const salvageableCount = countSalvageableItems();
    if (salvageableCount === 0) {
      alert('No salvageable items selected');
      return;
    }
    setShowBulkSalvageModal(true);
  };

  // Handle bulk salvage confirm
  const handleBulkSalvageConfirm = async () => {
    const itemIds = Array.from(selectedItems());
    const salvageableItems = currentInventory()
      .filter((i: any) => itemIds.includes(i.id))
      .filter((i: any) => !i.equipped && (i.type === 'armor' || i.type === 'weapon'));
    
    if (salvageableItems.length === 0) return;

    setShowBulkSalvageModal(false);
    setIsSalvaging(true);

    try {
      const response = await fetch('/api/game/bulk-salvage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          itemIds: salvageableItems.map((i: any) => i.id)
        })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setSalvageResultData({
          itemName: `${salvageableItems.length} items`,
          materials: []
        });
        setShowSalvageResultModal(true);
        return;
      }

      if (result.success) {
        actions.setInventory(result.inventory);
        
        // Clear selection
        setSelectedItems(new Set<number>());
        setSelectionMode(false);
        
        // Show result modal
        setSalvageResultData({
          itemName: `${result.totalSalvaged} items`,
          materials: result.materialsGained
        });
        setShowSalvageResultModal(true);
      }
    } catch (error) {
      console.error('Bulk salvage error:', error);
      setSalvageResultData({
        itemName: `${salvageableItems.length} items`,
        materials: []
      });
      setShowSalvageResultModal(true);
    } finally {
      setIsSalvaging(false);
    }
  };

  // Handle bulk sell
  const handleBulkSell = async () => {
    const itemIds = Array.from(selectedItems());
    if (itemIds.length === 0) return;

    setShowBulkSellModal(false);
    setIsSelling(true);

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
      } else {
        console.error('[BULK SELL] Error:', result.error);
        alert(result.error || 'Failed to sell items');
      }
    } catch (error) {
      console.error('Bulk sell error:', error);
      alert('Failed to sell items');
    } finally {
      setIsSelling(false);
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

  // Check if item has requirements
  const hasRequirements = (item: any) => {
    return (item.required_level && item.required_level > 1) || 
           item.required_strength || 
           item.required_dexterity || 
           item.required_constitution || 
           item.required_intelligence || 
           item.required_wisdom || 
           item.required_charisma;
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
          <For each={["weapon", "offhand", "head", "chest", "hands", "feet"]}>
            {(slotName) => {
              const equippedItem = createMemo(() => 
                currentInventory().find((i: any) => i.slot === slotName && i.equipped === 1)
              );
              
              // Check if offhand is blocked by 2H weapon
              const isOffhandBlocked = createMemo(() => {
                if (slotName !== 'offhand') return false;
                const weapon: any = currentInventory().find((i: any) => i.slot === 'weapon' && i.equipped === 1);
                return weapon?.is_two_handed === 1;
              });
              
              const blockedByWeapon = createMemo(() => {
                if (slotName !== 'offhand') return null;
                const weapon: any = currentInventory().find((i: any) => i.slot === 'weapon' && i.equipped === 1 && i.is_two_handed === 1);
                return weapon;
              });
              
              return (
                <div style={{
                  padding: "1rem",
                  background: isOffhandBlocked() ? "var(--bg-dark)" : "var(--bg-light)",
                  "border-radius": "6px",
                  border: equippedItem() ? "2px solid var(--accent)" : isOffhandBlocked() ? "2px solid #555" : "2px dashed #444",
                  "min-height": "120px",
                  display: "flex",
                  "flex-direction": "column",
                  "justify-content": "space-between",
                  opacity: isOffhandBlocked() ? 0.6 : 1
                }}>
                  <div>
                    <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "text-transform": "uppercase", "font-weight": "bold", "margin-bottom": "0.5rem" }}>
                      {slotName}
                    </div>
                    <Show when={isOffhandBlocked()}>
                      <div style={{ color: "#888", "font-style": "italic", "font-size": "0.875rem", "margin-bottom": "0.5rem" }}>
                        🔒 Blocked by 2H Weapon
                      </div>
                      <div style={{ "font-size": "0.75rem", color: "#666" }}>
                        {blockedByWeapon()?.name}
                      </div>
                    </Show>
                    <Show when={!isOffhandBlocked() && equippedItem()} fallback={
                      <Show when={!isOffhandBlocked()}>
                        <div style={{ color: "#666", "font-style": "italic", "font-size": "0.875rem" }}>Empty</div>
                      </Show>
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
        
        {/* Bulk Action Buttons - Always visible when in selection mode */}
        <Show when={selectionMode()}>
          <div style={{
            padding: "1rem",
            background: "var(--bg-light)",
            "border-radius": "6px",
            "margin-bottom": "1rem"
          }}>
            <div style={{ "margin-bottom": "0.75rem" }}>
              <div style={{ "font-weight": "bold" }}>
                {selectedItems().size > 0 
                  ? `${selectedItems().size} item${selectedItems().size !== 1 ? 's' : ''} selected`
                  : "No items selected"
                }
              </div>
              <Show when={selectedItems().size > 0}>
                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                  Total value: {calculateBulkSellValue()}g (at 40%)
                </div>
              </Show>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
              <button
                class="button secondary"
                onClick={toggleSelectAll}
                style={{ "font-size": "0.875rem", padding: "0.5rem 0.75rem", flex: "1 1 auto" }}
              >
                {selectedItems().size === currentInventory().filter(canSelectItem).length ? "Deselect All" : "Select All"}
              </button>
              <button
                class="button"
                onClick={() => setShowBulkSellModal(true)}
                disabled={selectedItems().size === 0}
                style={{ 
                  "font-size": "0.875rem", 
                  padding: "0.5rem 0.75rem", 
                  background: selectedItems().size === 0 ? "var(--bg-dark)" : "var(--warning)", 
                  color: selectedItems().size === 0 ? "var(--text-secondary)" : "var(--bg-dark)", 
                  flex: "1 1 auto",
                  opacity: selectedItems().size === 0 ? 0.5 : 1,
                  cursor: selectedItems().size === 0 ? "not-allowed" : "pointer"
                }}
              >
                Sell
              </button>
              <button
                class="button"
                onClick={handleBulkSalvageClick}
                disabled={countSalvageableItems() === 0}
                style={{ 
                  "font-size": "0.875rem", 
                  padding: "0.5rem 0.75rem", 
                  background: countSalvageableItems() === 0 ? "var(--bg-dark)" : "var(--accent)", 
                  color: countSalvageableItems() === 0 ? "var(--text-secondary)" : "var(--bg-dark)", 
                  flex: "1 1 auto",
                  opacity: countSalvageableItems() === 0 ? 0.5 : 1,
                  cursor: countSalvageableItems() === 0 ? "not-allowed" : "pointer"
                }}
              >
                ⚙️ Salvage {countSalvageableItems() > 0 ? `(${countSalvageableItems()})` : ""}
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
            class={inventoryFilter() === "offhand" ? "button" : "button secondary"}
            onClick={() => setInventoryFilter("offhand")}
            style={{ "font-size": "0.875rem", padding: "0.5rem 1rem" }}
          >
            🔮 Offhand
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
                  const canSelect = canSelectItem(invItem);
                  const longPressHandlers = createLongPressHandlers(invItem.id, canSelect);
                  
                  return (
                    <div 
                      class={getItemClassNames(invItem)}
                      onClick={() => {
                        if (selectionMode() && canSelect) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                      {...longPressHandlers}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{getItemDisplayName(invItem)}</div>
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
          
          <Show when={currentInventory().filter((i: any) => !i.equipped && i.slot === "offhand").length > 0}>
            <h4 style={{ "margin-bottom": "0.75rem", color: "var(--accent)", display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "1.1rem" }}>
              🔮 Offhand ({currentInventory().filter((i: any) => !i.equipped && i.slot === "offhand").length})
            </h4>
            <div style={{ "margin-bottom": "2rem" }}>
               <For each={currentInventory().filter((i: any) => !i.equipped && i.slot === "offhand")}>
                {(invItem: any) => {
                  const canSelect = canSelectItem(invItem);
                  const longPressHandlers = createLongPressHandlers(invItem.id, canSelect);
                  
                  return (
                    <div 
                      class={getItemClassNames(invItem)}
                      onClick={() => {
                        if (selectionMode() && canSelect) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                      {...longPressHandlers}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{getItemDisplayName(invItem)}</div>
                          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                            {invItem.slot && `${invItem.slot} • `}
                            <Show when={invItem.intelligence_bonus}>
                              🧠 +{invItem.intelligence_bonus} INT
                            </Show>
                            <Show when={invItem.wisdom_bonus}>
                              • 🦉 +{invItem.wisdom_bonus} WIS
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
          
          <Show when={currentInventory().filter((i: any) => !i.equipped && i.type === "armor" && i.slot !== "offhand").length > 0}>
            <h4 style={{ "margin-bottom": "0.75rem", color: "var(--accent)", display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "1.1rem" }}>
              🛡️ Armor ({currentInventory().filter((i: any) => !i.equipped && i.type === "armor" && i.slot !== "offhand").length})
            </h4>
            <div style={{ "margin-bottom": "2rem" }}>
              <For each={currentInventory().filter((i: any) => !i.equipped && i.type === "armor" && i.slot !== "offhand")}>
                {(invItem: any) => {
                  const canSelect = canSelectItem(invItem);
                  const longPressHandlers = createLongPressHandlers(invItem.id, canSelect);
                  
                  return (
                    <div 
                      class={getItemClassNames(invItem)}
                      onClick={() => {
                        if (selectionMode() && canSelect) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                      {...longPressHandlers}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{getItemDisplayName(invItem)}</div>
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
                  const canSelect = canSelectItem(invItem);
                  const longPressHandlers = createLongPressHandlers(invItem.id, canSelect);
                  
                  return (
                    <div 
                      class={getItemClassNames(invItem)}
                      onClick={() => {
                        if (selectionMode() && canSelect) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                      {...longPressHandlers}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{getItemDisplayName(invItem)}</div>
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
                  const canSelect = canSelectItem(invItem);
                  const longPressHandlers = createLongPressHandlers(invItem.id, canSelect);
                  
                  return (
                    <div 
                      class={getItemClassNames(invItem)}
                      onClick={() => {
                        if (selectionMode() && canSelect) {
                          toggleItemSelection(invItem.id);
                        } else if (!selectionMode()) {
                          handleViewItem(invItem, false);
                        }
                      }}
                      {...longPressHandlers}
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ "font-weight": "bold", "font-size": "1rem" }}>{getItemDisplayName(invItem)}</div>
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
              if (inventoryFilter() === "armor") return i.type === "armor" && i.slot !== "offhand";
              if (inventoryFilter() === "offhand") return i.slot === "offhand";
              if (inventoryFilter() === "scrolls") return i.type === "scroll";
              if (inventoryFilter() === "consumables") return i.type === "consumable";
              return false;
            })}>
              {(invItem: any) => {
                const scrollStatus = invItem.type === "scroll" ? getScrollAbilityStatus(invItem) : { alreadyLearned: false, hasBetter: false };
                const canSelect = canSelectItem(invItem);
                const longPressHandlers = createLongPressHandlers(invItem.id, canSelect);
                  
                return (
                  <div 
                    class={getItemClassNames(invItem)}
                    onClick={() => {
                      if (selectionMode() && canSelect) {
                        toggleItemSelection(invItem.id);
                      } else if (!selectionMode()) {
                        handleViewItem(invItem, false);
                      }
                    }}
                    {...longPressHandlers}
                  >
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem", flex: 1 }}>
                        <div style={{ flex: 1 }}>
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
          preventBackgroundClose={showSellModal() || showDropModal() || showEquipConfirmModal()}
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
          onSalvage={handleSalvageClick}
          onLearnAbility={handleLearnAbility}
          onUseItem={handleUseItem}
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
                      <span>{item.name}{item.quantity > 1 ? ` (x${item.quantity})` : ''}</span>
                      <span style={{ color: "var(--warning)" }}>{Math.floor((item.value || 0) * 0.4) * item.quantity}g</span>
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

      {/* Sell Confirmation Modal */}
      <Show when={showSellModal() && sellItemData()}>
        {(data) => (
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
              "z-index": 1001,
              padding: "1rem"
            }}
            onClick={() => {
              setShowSellModal(false);
              setSellItemData(null);
              setShowItemDetailModal(false);
              setSelectedItem(null);
            }}
          >
            <div 
              class="card"
              style={{ 
                "max-width": "400px",
                width: "100%",
                background: "var(--bg-dark)",
                border: "2px solid var(--warning)",
                "box-shadow": "0 0 20px rgba(251, 191, 36, 0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ 
                color: "var(--warning)", 
                "text-align": "center",
                "font-size": "1.5rem",
                "margin-bottom": "1rem"
              }}>
                Sell Item?
              </h2>
              
              <div style={{ 
                "text-align": "center",
                "margin-bottom": "1.5rem"
              }}>
                <div style={{ 
                  "font-size": "1.1rem",
                  "font-weight": "bold",
                  "margin-bottom": "0.5rem"
                }}>
                  {data().itemName}
                </div>
                
                <Show when={data().quantity > 1}>
                  <div style={{
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    gap: "1rem",
                    "margin-bottom": "1rem"
                  }}>
                    <button
                      class="button secondary"
                      onClick={() => setSellQuantity(Math.max(1, sellQuantity() - 1))}
                      disabled={sellQuantity() <= 1}
                      style={{ padding: "0.5rem 1rem", "font-size": "1.25rem" }}
                    >
                      −
                    </button>
                    <div style={{ 
                      "font-size": "1.5rem",
                      "font-weight": "bold",
                      "min-width": "80px",
                      "text-align": "center"
                    }}>
                      {sellQuantity()}
                    </div>
                    <button
                      class="button secondary"
                      onClick={() => setSellQuantity(Math.min(data().quantity, sellQuantity() + 1))}
                      disabled={sellQuantity() >= data().quantity}
                      style={{ padding: "0.5rem 1rem", "font-size": "1.25rem" }}
                    >
                      +
                    </button>
                  </div>
                </Show>
                
                <div style={{
                  padding: "1rem",
                  background: "var(--bg-light)",
                  "border-radius": "6px",
                  display: "inline-block"
                }}>
                  <div style={{ 
                    "font-size": "0.875rem", 
                    color: "var(--text-secondary)",
                    "margin-bottom": "0.25rem"
                  }}>
                    You will receive (40% of value)
                  </div>
                  <div style={{ 
                    "font-size": "2rem",
                    "font-weight": "bold",
                    color: "var(--warning)"
                  }}>
                    💰 {Math.floor(data().value * 0.4) * sellQuantity()}
                  </div>
                  <div style={{ 
                    "font-size": "1rem",
                    color: "var(--warning)"
                  }}>
                    Gold
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  class="button secondary"
                  onClick={() => {
                    setShowSellModal(false);
                    setSellItemData(null);
                    setShowItemDetailModal(false);
                    setSelectedItem(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  class="button"
                  onClick={handleSellConfirm}
                  style={{ 
                    flex: 1,
                    background: "var(--warning)",
                    color: "var(--bg-dark)"
                  }}
                >
                  Sell
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>

      {/* Equip Confirmation Modal */}
      <Show when={showEquipConfirmModal() && equipConfirmData()}>
        {(data) => (
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
              "z-index": 1001,
              padding: "1rem"
            }}
            onClick={() => {
              setShowEquipConfirmModal(false);
              setEquipConfirmData(null);
            }}
          >
            <div 
              class="card"
              style={{ 
                "max-width": "400px",
                width: "100%",
                background: "var(--bg-dark)",
                border: "2px solid var(--accent)",
                "box-shadow": "0 0 20px rgba(59, 130, 246, 0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ "margin-bottom": "1rem", color: "var(--accent)" }}>
                ⚔️ Confirm Equipment Change
              </h2>
              
              <p style={{ 
                "margin-bottom": "1.5rem", 
                "font-size": "1.125rem",
                "line-height": "1.6"
              }}>
                {data().message}
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  class="button secondary"
                  onClick={() => {
                    setShowEquipConfirmModal(false);
                    setEquipConfirmData(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  class="button"
                  onClick={handleEquipConfirm}
                  style={{ 
                    flex: 1,
                    background: "var(--accent)",
                    color: "white"
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
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

      {/* Learn Ability Result Modal */}
      <Show when={showLearnResultModal() && learnResultData()}>
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
            setShowLearnResultModal(false);
            setLearnResultData(null);
          }}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "450px",
              width: "100%",
              background: "var(--bg-dark)",
              border: `2px solid ${learnResultData()?.success ? "var(--success)" : "var(--danger)"}`,
              "text-align": "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              "font-size": "4rem", 
              "margin-bottom": "1rem" 
            }}>
              {learnResultData()?.success ? "✓" : "✗"}
            </div>
            
            <h2 style={{ 
              color: learnResultData()?.success ? "var(--success)" : "var(--danger)",
              "margin-bottom": "1rem"
            }}>
              {learnResultData()?.success ? "Ability Learned!" : "Learning Failed"}
            </h2>
            
            <p style={{ 
              "font-size": "1.1rem",
              "margin-bottom": "1.5rem",
              color: "var(--text-secondary)"
            }}>
              {learnResultData()?.message}
            </p>

            <Show when={learnResultData()?.success && learnResultData()?.abilityName}>
              <div style={{ 
                padding: "1rem",
                background: "rgba(34, 197, 94, 0.1)",
                "border-radius": "6px",
                "margin-bottom": "1.5rem",
                border: "1px solid var(--success)"
              }}>
                <div style={{ 
                  "font-size": "0.875rem", 
                  color: "var(--text-secondary)",
                  "margin-bottom": "0.25rem"
                }}>
                  New Ability
                </div>
                <div style={{ 
                  "font-size": "1.25rem",
                  "font-weight": "bold",
                  color: "var(--success)"
                }}>
                  {learnResultData()?.abilityName}
                </div>
              </div>
            </Show>

            <button
              class="button primary"
              onClick={() => {
                setShowLearnResultModal(false);
                setLearnResultData(null);
              }}
              style={{ width: "100%" }}
            >
              Continue
            </button>
          </div>
        </div>
      </Show>

      {/* Bulk Salvage Modal */}
      <Show when={showBulkSalvageModal()}>
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
          onClick={() => setShowBulkSalvageModal(false)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "450px",
              width: "100%",
              background: "var(--bg-dark)",
              border: "2px solid var(--warning)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ "margin-bottom": "1rem", color: "var(--warning)" }}>⚙️ Bulk Salvage</h2>
            
            <div style={{ "margin-bottom": "1.5rem" }}>
              <p style={{ "margin-bottom": "1rem" }}>
                Salvage <strong>{countSalvageableItems()} items</strong> for crafting materials?
              </p>
              
              <div style={{ 
                padding: "1rem",
                background: "var(--bg-light)",
                "border-radius": "6px",
                "border-left": "4px solid var(--warning)",
                "margin-bottom": "1rem"
              }}>
                <p style={{ color: "var(--warning)", "font-weight": "500" }}>
                  ⚠️ This action cannot be undone
                </p>
                <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-top": "0.5rem" }}>
                  Each item will be broken down into crafting materials based on its recipe or rarity. Equipped items and non-equipment will be skipped.
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                class="button secondary"
                style={{ flex: 1 }}
                onClick={() => setShowBulkSalvageModal(false)}
              >
                Cancel
              </button>
              <button
                class="button"
                style={{ 
                  flex: 1,
                  background: "var(--warning)",
                  color: "var(--bg-dark)"
                }}
                onClick={handleBulkSalvageConfirm}
              >
                Salvage All
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Salvage Confirmation Modal */}
      <Show when={showSalvageConfirmModal() && salvageItemData()}>
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
          onClick={() => setShowSalvageConfirmModal(false)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "450px",
              width: "100%",
              background: "var(--bg-dark)",
              border: "2px solid var(--warning)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ "margin-bottom": "1rem", color: "var(--warning)" }}>⚙️ Salvage Item</h2>
            
            <div style={{ "margin-bottom": "1.5rem" }}>
              <p style={{ "margin-bottom": "1rem" }}>
                Break down <strong>{salvageItemData()?.itemName}</strong> into crafting materials?
              </p>
              <div style={{ 
                padding: "1rem",
                background: "var(--bg-light)",
                "border-radius": "6px",
                "border-left": "4px solid var(--warning)"
              }}>
                <p style={{ color: "var(--warning)", "font-weight": "500" }}>
                  ⚠️ This action cannot be undone
                </p>
                <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-top": "0.5rem" }}>
                  You will receive crafting materials based on the item's recipe or rarity.
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                class="button secondary"
                style={{ flex: 1 }}
                onClick={() => setShowSalvageConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                class="button"
                style={{ 
                  flex: 1,
                  background: "var(--warning)",
                  color: "var(--bg-dark)"
                }}
                onClick={handleSalvageConfirm}
              >
                Salvage
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Salvage Result Modal */}
      <Show when={showSalvageResultModal() && salvageResultData()}>
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
            setShowSalvageResultModal(false);
            setSalvageResultData(null);
          }}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "450px",
              width: "100%",
              background: "var(--bg-dark)",
              border: `2px solid ${salvageResultData()?.materials.length ? "var(--success)" : "var(--danger)"}`,
              "text-align": "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              "font-size": "4rem", 
              "margin-bottom": "1rem" 
            }}>
              {salvageResultData()?.materials.length ? "⚙️" : "✗"}
            </div>
            
            <h2 style={{ 
              color: salvageResultData()?.materials.length ? "var(--success)" : "var(--danger)",
              "margin-bottom": "1rem"
            }}>
              {salvageResultData()?.materials.length ? "Item Salvaged!" : "Salvage Failed"}
            </h2>
            
            <Show when={salvageResultData()?.materials.length}>
              <div style={{ "margin-bottom": "1.5rem" }}>
                <p style={{ "margin-bottom": "1rem", color: "var(--text-secondary)" }}>
                  Salvaged <strong>{salvageResultData()?.itemName}</strong>
                </p>
                
                <div style={{ 
                  padding: "1rem",
                  background: "var(--bg-light)",
                  "border-radius": "6px",
                  "text-align": "left"
                }}>
                  <h3 style={{ "margin-bottom": "0.75rem", "font-size": "1rem", color: "var(--accent)" }}>
                    Materials Gained:
                  </h3>
                  <For each={salvageResultData()?.materials}>
                    {(material) => (
                      <div style={{ 
                        display: "flex", 
                        "justify-content": "space-between",
                        padding: "0.5rem",
                        "border-bottom": "1px solid var(--bg-dark)"
                      }}>
                        <span>{material.name}</span>
                        <span style={{ color: "var(--success)", "font-weight": "500" }}>
                          +{material.quantity}
                        </span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
            
            <Show when={!salvageResultData()?.materials.length}>
              <p style={{ "margin-bottom": "1.5rem", color: "var(--text-secondary)" }}>
                Failed to salvage <strong>{salvageResultData()?.itemName}</strong>
              </p>
            </Show>
            
            <button
              class="button"
              style={{ width: "100%" }}
              onClick={() => {
                setShowSalvageResultModal(false);
                setSalvageResultData(null);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </Show>
      </Show>
      </Suspense>
      
      {/* Loading Overlay */}
      <Show when={isSelling() || isSalvaging()}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "z-index": 9999,
          "backdrop-filter": "blur(4px)"
        }}>
          <div style={{
            background: "var(--bg-dark)",
            padding: "2rem 3rem",
            "border-radius": "12px",
            border: "2px solid var(--accent)",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            gap: "1rem",
            "box-shadow": "0 8px 32px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--bg-light)",
              "border-top-color": "var(--accent)",
              "border-radius": "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <div style={{
              "font-size": "1.25rem",
              "font-weight": "bold",
              color: "var(--accent)"
            }}>
              {isSelling() ? "Selling..." : "Salvaging..."}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Show>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts()} onRemove={removeToast} />
    </GameLayout>
  );
}

