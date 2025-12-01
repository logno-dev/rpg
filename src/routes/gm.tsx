import { createSignal, Show, For, onMount } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { getUser } from "~/lib/auth";
import { isGM, getAllPlayers, getAllMobs, getAllItems, getAllRegions, getAllAbilities, getAllMerchants, updateMob, deleteMob, createMob, updateItem, deleteItem, createItem, getAllMobLoot, getAllRegionRareLoot, createMobLoot, updateMobLoot, deleteMobLoot, createRegionRareLoot, updateRegionRareLoot, deleteRegionRareLoot, createAbility, updateAbility, deleteAbility, createRegion, updateRegion, deleteRegion, createMerchant, updateMerchant, deleteMerchant, getAllRegionMobs, createRegionMob, updateRegionMob, deleteRegionMob, getAllMerchantInventory, createMerchantInventory, updateMerchantInventory, deleteMerchantInventory, getAbilityEffects, createAbilityEffect, updateAbilityEffect, deleteAbilityEffect, getCharacter, updateCharacter, getCharacterInventory, getCharacterAbilities, addItemToCharacter, removeItemFromCharacter, updateCharacterInventoryItem, addAbilityToCharacter, removeAbilityFromCharacter, getCharacterRegionUnlocks, unlockRegionForCharacter, lockRegionForCharacter } from "~/lib/gm";

export default function GMPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = createSignal<string>("players");
  const [loading, setLoading] = createSignal(true);
  const [authorized, setAuthorized] = createSignal(false);
  
  const [players, setPlayers] = createSignal<any[]>([]);
  const [mobs, setMobs] = createSignal<any[]>([]);
  const [items, setItems] = createSignal<any[]>([]);
  const [regions, setRegions] = createSignal<any[]>([]);
  const [abilities, setAbilities] = createSignal<any[]>([]);
  const [merchants, setMerchants] = createSignal<any[]>([]);
  const [mobLoot, setMobLoot] = createSignal<any[]>([]);
  const [regionRareLoot, setRegionRareLoot] = createSignal<any[]>([]);
  const [regionMobs, setRegionMobs] = createSignal<any[]>([]);
  const [merchantInventory, setMerchantInventory] = createSignal<any[]>([]);
  const [abilityEffects, setAbilityEffects] = createSignal<any[]>([]);
  
  // Edit modal state
  const [editingMob, setEditingMob] = createSignal<any | null>(null);
  const [editingItem, setEditingItem] = createSignal<any | null>(null);
  const [editingMobLoot, setEditingMobLoot] = createSignal<any | null>(null);
  const [editingRegionLoot, setEditingRegionLoot] = createSignal<any | null>(null);
  const [editingAbility, setEditingAbility] = createSignal<any | null>(null);
  const [editingRegion, setEditingRegion] = createSignal<any | null>(null);
  const [editingMerchant, setEditingMerchant] = createSignal<any | null>(null);
  const [editingRegionMob, setEditingRegionMob] = createSignal<any | null>(null);
  const [editingMerchantInv, setEditingMerchantInv] = createSignal<any | null>(null);
  const [editingAbilityEffect, setEditingAbilityEffect] = createSignal<any | null>(null);
  const [editingCharacter, setEditingCharacter] = createSignal<any | null>(null);
  const [characterInventory, setCharacterInventory] = createSignal<any[]>([]);
  const [characterAbilities, setCharacterAbilities] = createSignal<any[]>([]);
  const [characterRegionUnlocks, setCharacterRegionUnlocks] = createSignal<any[]>([]);
  const [selectedAbilityForEffects, setSelectedAbilityForEffects] = createSignal<number | null>(null);
  const [showMobModal, setShowMobModal] = createSignal(false);
  const [showItemModal, setShowItemModal] = createSignal(false);
  const [showMobLootModal, setShowMobLootModal] = createSignal(false);
  const [showRegionLootModal, setShowRegionLootModal] = createSignal(false);
  const [showAbilityModal, setShowAbilityModal] = createSignal(false);
  const [showRegionModal, setShowRegionModal] = createSignal(false);
  const [showMerchantModal, setShowMerchantModal] = createSignal(false);
  const [showRegionMobModal, setShowRegionMobModal] = createSignal(false);
  const [showMerchantInvModal, setShowMerchantInvModal] = createSignal(false);
  const [showAbilityEffectModal, setShowAbilityEffectModal] = createSignal(false);
  const [showCharacterModal, setShowCharacterModal] = createSignal(false);
  const [characterModalTab, setCharacterModalTab] = createSignal<'stats' | 'inventory' | 'abilities' | 'regions'>('stats');
  const [showAddItemModal, setShowAddItemModal] = createSignal(false);
  const [showAddAbilityModal, setShowAddAbilityModal] = createSignal(false);
  const [searchAddItem, setSearchAddItem] = createSignal("");
  const [searchAddAbility, setSearchAddAbility] = createSignal("");
  const [selectedItemToAdd, setSelectedItemToAdd] = createSignal<number | null>(null);
  const [selectedAbilityToAdd, setSelectedAbilityToAdd] = createSignal<number | null>(null);
  const [itemQuantityToAdd, setItemQuantityToAdd] = createSignal(1);
  const [calcLevel, setCalcLevel] = createSignal(1);
  const [selectedMobForLoot, setSelectedMobForLoot] = createSignal<number | null>(null);
  const [selectedRegionForLoot, setSelectedRegionForLoot] = createSignal<number | null>(null);
  const [selectedRegionForMobs, setSelectedRegionForMobs] = createSignal<number | null>(null);
  const [selectedMerchantForInv, setSelectedMerchantForInv] = createSignal<number | null>(null);
  
  // Search filters
  const [searchPlayers, setSearchPlayers] = createSignal("");
  const [searchMobs, setSearchMobs] = createSignal("");
  const [searchItems, setSearchItems] = createSignal("");
  const [searchRegions, setSearchRegions] = createSignal("");
  const [searchAbilities, setSearchAbilities] = createSignal("");
  const [searchMerchants, setSearchMerchants] = createSignal("");
  const [searchMobLoot, setSearchMobLoot] = createSignal("");
  const [searchRegionLoot, setSearchRegionLoot] = createSignal("");
  const [searchRegionMobs, setSearchRegionMobs] = createSignal("");
  const [searchMerchantInventory, setSearchMerchantInventory] = createSignal("");
  
  // Helper to check if XP is balanced
  const getXPStatus = (mobLevel: number, xp: number) => {
    const xpNeeded = mobLevel * 125;
    const recommended = Math.ceil(xpNeeded / 10); // 10 kills per level (medium)
    const min = Math.ceil(xpNeeded / 15); // 15 kills per level (slow)
    const max = Math.ceil(xpNeeded / 5); // 5 kills per level (fast)
    
    if (xp < min) return { status: 'low', color: 'var(--danger)', text: `Low (${Math.ceil(xpNeeded / xp)} kills/lvl)` };
    if (xp > max) return { status: 'high', color: 'var(--warning)', text: `High (${Math.ceil(xpNeeded / xp)} kills/lvl)` };
    return { status: 'good', color: 'var(--success)', text: `Good (${Math.ceil(xpNeeded / xp)} kills/lvl)` };
  };
  
  // Helper to reload data
  const reloadMobs = async () => {
    const mobsData = await getAllMobs();
    setMobs(mobsData as any);
  };
  
  const reloadItems = async () => {
    const itemsData = await getAllItems();
    setItems(itemsData as any);
  };
  
  const reloadMobLoot = async () => {
    const lootData = await getAllMobLoot();
    setMobLoot(lootData as any);
  };
  
  const reloadRegionLoot = async () => {
    const lootData = await getAllRegionRareLoot();
    setRegionRareLoot(lootData as any);
  };
  
  const reloadAbilities = async () => {
    const abilitiesData = await getAllAbilities();
    setAbilities(abilitiesData as any);
  };
  
  const reloadRegions = async () => {
    const regionsData = await getAllRegions();
    setRegions(regionsData as any);
  };
  
  const reloadMerchants = async () => {
    const merchantsData = await getAllMerchants();
    setMerchants(merchantsData as any);
  };
  
  // Handle mob edit/delete
  const handleEditMob = (mob: any) => {
    setEditingMob(mob);
    setShowMobModal(true);
  };
  
  const handleDeleteMob = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mob?')) return;
    try {
      await deleteMob(id);
      await reloadMobs();
    } catch (err) {
      console.error('Error deleting mob:', err);
      alert('Failed to delete mob');
    }
  };
  
  const handleSaveMob = async (e: Event) => {
    e.preventDefault();
    const mob = editingMob();
    if (!mob) return;
    
    try {
      if (mob.id) {
        await updateMob(mob.id, mob);
      } else {
        await createMob(mob);
      }
      setShowMobModal(false);
      setEditingMob(null);
      await reloadMobs();
    } catch (err) {
      console.error('Error saving mob:', err);
      alert('Failed to save mob');
    }
  };
  
  // Handle item edit/delete
  const handleEditItem = (item: any) => {
    setEditingItem({...item});
    setShowItemModal(true);
  };
  
  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      await reloadItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };
  
  const handleSaveItem = async (e: Event) => {
    e.preventDefault();
    const item = editingItem();
    if (!item) return;
    
    try {
      if (item.id) {
        await updateItem(item.id, item);
      } else {
        await createItem(item);
      }
      setShowItemModal(false);
      setEditingItem(null);
      await reloadItems();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item');
    }
  };
  
  // Handle mob loot edit/delete
  const handleEditMobLoot = (loot: any) => {
    setEditingMobLoot(loot);
    setShowMobLootModal(true);
  };
  
  const handleDeleteMobLoot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this loot entry?')) return;
    try {
      await deleteMobLoot(id);
      await reloadMobLoot();
    } catch (err) {
      console.error('Error deleting loot:', err);
      alert('Failed to delete loot');
    }
  };
  
  const handleSaveMobLoot = async (e: Event) => {
    e.preventDefault();
    const loot = editingMobLoot();
    if (!loot) return;
    
    try {
      if (loot.id) {
        await updateMobLoot(loot.id, loot);
      } else {
        await createMobLoot(loot);
      }
      setShowMobLootModal(false);
      setEditingMobLoot(null);
      await reloadMobLoot();
    } catch (err) {
      console.error('Error saving loot:', err);
      alert('Failed to save loot');
    }
  };
  
  // Handle region rare loot edit/delete
  const handleEditRegionLoot = (loot: any) => {
    setEditingRegionLoot(loot);
    setShowRegionLootModal(true);
  };
  
  const handleDeleteRegionLoot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rare loot entry?')) return;
    try {
      await deleteRegionRareLoot(id);
      await reloadRegionLoot();
    } catch (err) {
      console.error('Error deleting rare loot:', err);
      alert('Failed to delete rare loot');
    }
  };
  
  const handleSaveRegionLoot = async (e: Event) => {
    e.preventDefault();
    const loot = editingRegionLoot();
    if (!loot) return;
    
    try {
      if (loot.id) {
        await updateRegionRareLoot(loot.id, loot);
      } else {
        await createRegionRareLoot(loot);
      }
      setShowRegionLootModal(false);
      setEditingRegionLoot(null);
      await reloadRegionLoot();
    } catch (err) {
      console.error('Error saving rare loot:', err);
      alert('Failed to save rare loot');
    }
  };
  
  // Handle ability edit/delete
  const handleEditAbility = (ability: any) => {
    setEditingAbility({...ability});
    setShowAbilityModal(true);
  };
  
  const handleDeleteAbility = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ability?')) return;
    try {
      await deleteAbility(id);
      await reloadAbilities();
    } catch (err) {
      console.error('Error deleting ability:', err);
      alert('Failed to delete ability');
    }
  };
  
  const handleSaveAbility = async (e: Event) => {
    e.preventDefault();
    const ability = editingAbility();
    if (!ability) return;
    
    try {
      if (ability.id) {
        await updateAbility(ability.id, ability);
      } else {
        await createAbility(ability);
      }
      setShowAbilityModal(false);
      setEditingAbility(null);
      await reloadAbilities();
    } catch (err) {
      console.error('Error saving ability:', err);
      alert('Failed to save ability');
    }
  };
  
  // Handle ability effects edit/delete
  const handleEditAbilityEffect = (effect: any) => {
    setEditingAbilityEffect({...effect});
  };
  
  const handleDeleteAbilityEffect = async (id: number) => {
    if (!confirm('Are you sure you want to delete this effect?')) return;
    try {
      await deleteAbilityEffect(id);
      const abilityId = selectedAbilityForEffects();
      if (abilityId) {
        const effects = await getAbilityEffects(abilityId);
        setAbilityEffects(effects as any);
      }
    } catch (err) {
      console.error('Error deleting effect:', err);
      alert('Failed to delete effect');
    }
  };
  
  const handleSaveAbilityEffect = async (e: Event) => {
    e.preventDefault();
    const effect = editingAbilityEffect();
    if (!effect) return;
    
    try {
      if (effect.id) {
        await updateAbilityEffect(effect.id, effect);
      } else {
        const abilityId = selectedAbilityForEffects();
        if (!abilityId) return;
        effect.ability_id = abilityId;
        await createAbilityEffect(effect);
      }
      setEditingAbilityEffect(null);
      const abilityId = selectedAbilityForEffects();
      if (abilityId) {
        const effects = await getAbilityEffects(abilityId);
        setAbilityEffects(effects as any);
      }
    } catch (err) {
      console.error('Error saving effect:', err);
      alert('Failed to save effect');
    }
  };
  
  // Handle region edit/delete
  const handleEditRegion = (region: any) => {
    setEditingRegion({...region});
    setShowRegionModal(true);
  };
  
  const handleDeleteRegion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this region? This may break the game if characters are in this region.')) return;
    try {
      await deleteRegion(id);
      await reloadRegions();
    } catch (err) {
      console.error('Error deleting region:', err);
      alert('Failed to delete region');
    }
  };
  
  const handleSaveRegion = async (e: Event) => {
    e.preventDefault();
    const region = editingRegion();
    if (!region) return;
    
    try {
      if (region.id) {
        await updateRegion(region.id, region);
      } else {
        await createRegion(region);
      }
      setShowRegionModal(false);
      setEditingRegion(null);
      await reloadRegions();
    } catch (err) {
      console.error('Error saving region:', err);
      alert('Failed to save region');
    }
  };
  
  // Handle merchant edit/delete
  const handleEditMerchant = (merchant: any) => {
    setEditingMerchant({...merchant});
    setShowMerchantModal(true);
  };
  
  const handleDeleteMerchant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this merchant?')) return;
    try {
      await deleteMerchant(id);
      await reloadMerchants();
    } catch (err) {
      console.error('Error deleting merchant:', err);
      alert('Failed to delete merchant');
    }
  };
  
  const handleSaveMerchant = async (e: Event) => {
    e.preventDefault();
    const merchant = editingMerchant();
    if (!merchant) return;
    
    try {
      if (merchant.id) {
        await updateMerchant(merchant.id, merchant);
      } else {
        await createMerchant(merchant);
      }
      setShowMerchantModal(false);
      setEditingMerchant(null);
      await reloadMerchants();
    } catch (err) {
      console.error('Error saving merchant:', err);
      alert('Failed to save merchant');
    }
  };
  
  // Reload functions for new tables
  const reloadRegionMobs = async () => {
    const data = await getAllRegionMobs();
    setRegionMobs(data as any);
  };
  
  const reloadMerchantInventory = async () => {
    const data = await getAllMerchantInventory();
    setMerchantInventory(data as any);
  };
  
  // Handle region mob spawns edit/delete
  const handleEditRegionMob = (regionMob: any) => {
    setEditingRegionMob({...regionMob});
    setShowRegionMobModal(true);
  };
  
  const handleDeleteRegionMob = async (id: number) => {
    if (!confirm('Are you sure you want to remove this mob from the region?')) return;
    try {
      await deleteRegionMob(id);
      await reloadRegionMobs();
    } catch (err) {
      console.error('Error deleting region mob:', err);
      alert('Failed to delete region mob');
    }
  };
  
  const handleSaveRegionMob = async (e: Event) => {
    e.preventDefault();
    const regionMob = editingRegionMob();
    if (!regionMob) return;
    
    try {
      if (regionMob.id) {
        await updateRegionMob(regionMob.id, regionMob);
      } else {
        await createRegionMob(regionMob);
      }
      setShowRegionMobModal(false);
      setEditingRegionMob(null);
      await reloadRegionMobs();
    } catch (err) {
      console.error('Error saving region mob:', err);
      alert('Failed to save region mob');
    }
  };
  
  // Handle merchant inventory edit/delete
  const handleEditMerchantInv = (inv: any) => {
    setEditingMerchantInv({...inv});
    setShowMerchantInvModal(true);
  };
  
  const handleDeleteMerchantInv = async (id: number) => {
    if (!confirm('Are you sure you want to remove this item from the merchant?')) return;
    try {
      await deleteMerchantInventory(id);
      await reloadMerchantInventory();
    } catch (err) {
      console.error('Error deleting merchant inventory:', err);
      alert('Failed to delete merchant inventory');
    }
  };
  
  const handleSaveMerchantInv = async (e: Event) => {
    e.preventDefault();
    const inv = editingMerchantInv();
    if (!inv) return;
    
    try {
      if (inv.id) {
        await updateMerchantInventory(inv.id, inv);
      } else {
        await createMerchantInventory(inv);
      }
      setShowMerchantInvModal(false);
      setEditingMerchantInv(null);
      await reloadMerchantInventory();
    } catch (err) {
      console.error('Error saving merchant inventory:', err);
      alert('Failed to save merchant inventory');
    }
  };
  
  // Handle character editing
  const handleEditCharacter = async (player: any) => {
    if (!player.character_id) return;
    
    try {
      const charData = await getCharacter(player.character_id);
      const inventory = await getCharacterInventory(player.character_id);
      const abilities = await getCharacterAbilities(player.character_id);
      const regionUnlocks = await getCharacterRegionUnlocks(player.character_id);
      
      setEditingCharacter(charData);
      setCharacterInventory(inventory as any);
      setCharacterAbilities(abilities as any);
      setCharacterRegionUnlocks(regionUnlocks as any);
      setCharacterModalTab('stats');
      setShowCharacterModal(true);
    } catch (err) {
      console.error('Error loading character:', err);
      alert('Failed to load character');
    }
  };
  
  const handleSaveCharacter = async (e: Event) => {
    e.preventDefault();
    const char = editingCharacter();
    if (!char) return;
    
    try {
      await updateCharacter(char.id, char);
      setShowCharacterModal(false);
      setEditingCharacter(null);
      
      // Reload players
      const playersData = await getAllPlayers();
      setPlayers(playersData as any);
    } catch (err) {
      console.error('Error saving character:', err);
      alert('Failed to save character');
    }
  };
  
  const handleAddItemToCharacter = async () => {
    setSearchAddItem("");
    setSelectedItemToAdd(null);
    setItemQuantityToAdd(1);
    setShowAddItemModal(true);
  };
  
  const handleConfirmAddItem = async () => {
    const char = editingCharacter();
    const itemId = selectedItemToAdd();
    const quantity = itemQuantityToAdd();
    
    if (!char || !itemId || quantity <= 0) return;
    
    try {
      await addItemToCharacter(char.id, itemId, quantity);
      const inventory = await getCharacterInventory(char.id);
      setCharacterInventory(inventory as any);
      setShowAddItemModal(false);
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add item');
    }
  };
  
  const handleRemoveItemFromCharacter = async (inventoryId: number) => {
    if (!confirm('Remove this item from inventory?')) return;
    
    try {
      await removeItemFromCharacter(inventoryId);
      const char = editingCharacter();
      if (char) {
        const inventory = await getCharacterInventory(char.id);
        setCharacterInventory(inventory as any);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    }
  };
  
  const handleUpdateInventoryItem = async (inventoryId: number, quantity: number, equipped: number) => {
    try {
      await updateCharacterInventoryItem(inventoryId, quantity, equipped);
      const char = editingCharacter();
      if (char) {
        const inventory = await getCharacterInventory(char.id);
        setCharacterInventory(inventory as any);
      }
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item');
    }
  };
  
  const handleAddAbilityToCharacter = async () => {
    setSearchAddAbility("");
    setSelectedAbilityToAdd(null);
    setShowAddAbilityModal(true);
  };
  
  const handleConfirmAddAbility = async () => {
    const char = editingCharacter();
    const abilityId = selectedAbilityToAdd();
    
    if (!char || !abilityId) return;
    
    try {
      await addAbilityToCharacter(char.id, abilityId);
      const charAbilities = await getCharacterAbilities(char.id);
      setCharacterAbilities(charAbilities as any);
      setShowAddAbilityModal(false);
    } catch (err) {
      console.error('Error adding ability:', err);
      alert('Failed to add ability');
    }
  };
  
  const handleRemoveAbilityFromCharacter = async (characterAbilityId: number) => {
    if (!confirm('Remove this ability?')) return;
    
    try {
      await removeAbilityFromCharacter(characterAbilityId);
      const char = editingCharacter();
      if (char) {
        const charAbilities = await getCharacterAbilities(char.id);
        setCharacterAbilities(charAbilities as any);
      }
    } catch (err) {
      console.error('Error removing ability:', err);
      alert('Failed to remove ability');
    }
  };
  
  const handleToggleRegionUnlock = async (regionId: number, currentlyUnlocked: boolean) => {
    const char = editingCharacter();
    if (!char) return;
    
    try {
      if (currentlyUnlocked) {
        await lockRegionForCharacter(char.id, regionId);
      } else {
        await unlockRegionForCharacter(char.id, regionId);
      }
      
      // Reload region unlocks
      const regionUnlocks = await getCharacterRegionUnlocks(char.id);
      setCharacterRegionUnlocks(regionUnlocks as any);
    } catch (err) {
      console.error('Error toggling region unlock:', err);
      alert('Failed to toggle region unlock');
    }
  };

  onMount(async () => {
    try {
      // Check if user is logged in
      const user = await getUser();
      if (!user) {
        navigate("/");
        return;
      }
      
      // Check if user is GM
      const gmStatus = await isGM();
      if (!gmStatus) {
        navigate("/");
        return;
      }
      
      // User is authorized, load data
      setAuthorized(true);
      
      const [playersData, mobsData, itemsData, regionsData, abilitiesData, merchantsData, mobLootData, regionLootData, regionMobsData, merchantInvData] = await Promise.all([
        getAllPlayers(),
        getAllMobs(),
        getAllItems(),
        getAllRegions(),
        getAllAbilities(),
        getAllMerchants(),
        getAllMobLoot(),
        getAllRegionRareLoot(),
        getAllRegionMobs(),
        getAllMerchantInventory(),
      ]);
      
      setPlayers(playersData as any);
      setMobs(mobsData as any);
      setItems(itemsData as any);
      setRegions(regionsData as any);
      setAbilities(abilitiesData as any);
      setMerchants(merchantsData as any);
      setMobLoot(mobLootData as any);
      setRegionRareLoot(regionLootData as any);
      setRegionMobs(regionMobsData as any);
      setMerchantInventory(merchantInvData as any);
    } catch (err) {
      console.error('GM page error:', err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  });
  
  return (
    <div style={{ padding: "2rem", "max-width": "1400px", margin: "0 auto" }}>
      <Show when={loading()}>
        <div class="card">
          <p>Loading GM Panel...</p>
        </div>
      </Show>
      <Show when={!loading() && authorized()}>
        <div>
          <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "2rem" }}>
            <h1>Game Master Control Panel</h1>
            <A href="/" class="button secondary">Back to Game</A>
          </div>
          
          {/* Tabs */}
          <div style={{ 
            display: "flex", 
            gap: "0.5rem", 
            "margin-bottom": "2rem", 
            "flex-wrap": "wrap",
            "border-bottom": "2px solid var(--bg-light)",
            "padding-bottom": "0.5rem"
          }}>
            <button
              class={activeTab() === "players" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("players")}
            >
              Players
            </button>
            <button
              class={activeTab() === "mobs" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("mobs")}
            >
              Mobs
            </button>
            <button
              class={activeTab() === "items" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("items")}
            >
              Items
            </button>
            <button
              class={activeTab() === "abilities" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("abilities")}
            >
              Abilities
            </button>
            <button
              class={activeTab() === "regions" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("regions")}
            >
              Regions
            </button>
            <button
              class={activeTab() === "merchants" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("merchants")}
            >
              Merchants
            </button>
            <button
              class={activeTab() === "loot" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("loot")}
            >
              Loot Tables
            </button>
            <button
              class={activeTab() === "spawns" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("spawns")}
            >
              Mob Spawns
            </button>
            <button
              class={activeTab() === "inventory" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("inventory")}
            >
              Merchant Inventory
            </button>
          </div>
          
          {/* Players Tab */}
          <Show when={activeTab() === "players"}>
            <div class="card">
              <h2>Players & Characters</h2>
              <div style={{ "margin-bottom": "1rem" }}>
                <input 
                  type="text" 
                  placeholder="Search by username, character, or region..." 
                  value={searchPlayers()}
                  onInput={(e) => setSearchPlayers(e.currentTarget.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <Show when={players()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>User</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Character</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Level</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>XP</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Gold</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>HP</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Mana</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Region</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>GM</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={players().filter((p: any) => {
                        const search = searchPlayers().toLowerCase();
                        if (!search) return true;
                        return (
                          p.username?.toLowerCase().includes(search) ||
                          p.character_name?.toLowerCase().includes(search) ||
                          p.current_region?.toLowerCase().includes(search)
                        );
                      })}>
                        {(player: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{player.username}</td>
                            <td style={{ padding: "0.5rem" }}>{player.character_name || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{player.level || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{player.experience || "0"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{player.gold || "0"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              {player.current_health ? `${player.current_health}/${player.max_health}` : "-"}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              {player.current_mana ? `${player.current_mana}/${player.max_mana}` : "-"}
                            </td>
                            <td style={{ padding: "0.5rem" }}>{player.current_region || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              {player.is_gm ? "Yes" : ""}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <Show when={player.character_id}>
                                <button 
                                  class="button secondary" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem" }}
                                  onClick={() => handleEditCharacter(player)}
                                >
                                  Edit
                                </button>
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Mobs Tab */}
          <Show when={activeTab() === "mobs"}>
            <div class="card" style={{ "margin-bottom": "1rem" }}>
              <h3 style={{ "margin-bottom": "1rem" }}>Experience Calculator</h3>
              <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", "margin-bottom": "1rem" }}>
                <div style={{ padding: "0.75rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>XP Formula</div>
                  <div style={{ "font-weight": "bold" }}>Level × 125</div>
                </div>
                <div style={{ padding: "0.75rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Stat Points/Level</div>
                  <div style={{ "font-weight": "bold" }}>3 points</div>
                </div>
                <div style={{ padding: "0.75rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Death Penalty</div>
                  <div style={{ "font-weight": "bold" }}>-25% XP, -10% Gold</div>
                </div>
              </div>
              <div style={{ padding: "1rem", background: "var(--bg-light)", "border-radius": "8px" }}>
                <h4 style={{ "margin-bottom": "1rem" }}>XP Calculator</h4>
                <div style={{ display: "grid", "grid-template-columns": "200px 1fr", gap: "1rem", "align-items": "start" }}>
                  <div>
                    <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Character Level</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={calcLevel()} 
                      onInput={(e) => setCalcLevel(parseInt(e.currentTarget.value) || 1)}
                      style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                    />
                  </div>
                  <div>
                    <div style={{ "margin-bottom": "0.5rem" }}>
                      <strong>XP Needed for Level {calcLevel()} → {calcLevel() + 1}:</strong> {calcLevel() * 125} XP
                    </div>
                    <div style={{ display: "grid", "grid-template-columns": "repeat(3, 1fr)", gap: "1rem", "margin-top": "1rem" }}>
                      <div style={{ padding: "1rem", background: "var(--bg-dark)", "border-radius": "4px", border: "2px solid var(--warning)" }}>
                        <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Fast (5 kills)</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--warning)" }}>{Math.ceil((calcLevel() * 125) / 5)} XP</div>
                        <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>per mob</div>
                      </div>
                      <div style={{ padding: "1rem", background: "var(--bg-dark)", "border-radius": "4px", border: "2px solid var(--success)" }}>
                        <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Medium (10 kills)</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--success)" }}>{Math.ceil((calcLevel() * 125) / 10)} XP</div>
                        <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>per mob</div>
                      </div>
                      <div style={{ padding: "1rem", background: "var(--bg-dark)", "border-radius": "4px", border: "2px solid var(--accent)" }}>
                        <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Slow (15 kills)</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--accent)" }}>{Math.ceil((calcLevel() * 125) / 15)} XP</div>
                        <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>per mob</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Mobs</h2>
                <button class="button primary" onClick={() => {
                  setEditingMob({
                    name: '', level: 1, area: '', max_health: 100,
                    attack: 10, defense: 5, experience: 10,
                    gold_min: 1, gold_max: 5, attack_speed: 1.0, region_id: 1
                  });
                  setShowMobModal(true);
                }}>
                  Add Mob
                </button>
              </div>
              <div style={{ "margin-bottom": "1rem" }}>
                <input 
                  type="text" 
                  placeholder="Search by name, level, or region..." 
                  value={searchMobs()}
                  onInput={(e) => setSearchMobs(e.currentTarget.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <Show when={mobs()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>HP</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Atk</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Def</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>XP</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Gold</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Region</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={mobs().filter((m: any) => {
                        const search = searchMobs().toLowerCase();
                        if (!search) return true;
                        return (
                          m.name?.toLowerCase().includes(search) ||
                          m.level?.toString().includes(search) ||
                          m.region_id?.toString().includes(search)
                        );
                      })}>
                        {(mob: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{mob.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{mob.level}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{mob.max_health}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{mob.attack}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{mob.defense}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>
                              <div style={{ display: "flex", "align-items": "center", "justify-content": "flex-end", gap: "0.5rem" }}>
                                <span>{mob.experience}</span>
                                <span style={{ 
                                  "font-size": "0.7rem", 
                                  padding: "0.1rem 0.3rem", 
                                  "border-radius": "3px",
                                  background: getXPStatus(mob.level, mob.experience).color,
                                  color: "#fff"
                                }} title={getXPStatus(mob.level, mob.experience).text}>
                                  {getXPStatus(mob.level, mob.experience).status === 'low' ? '↓' : 
                                   getXPStatus(mob.level, mob.experience).status === 'high' ? 'High' : 'Yes'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>
                              {mob.gold_min}-{mob.gold_max}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{mob.region_id || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button secondary" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                onClick={() => handleEditMob(mob)}
                              >
                                Edit
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleDeleteMob(mob.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Items Tab */}
          <Show when={activeTab() === "items"}>
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Items ({items()?.length || 0})</h2>
                <button class="button primary" onClick={() => {
                  setEditingItem({
                    name: '', description: '', type: 'weapon', slot: 'weapon',
                    rarity: 'common', level: 1, value: 1, damage: 0, armor: 0,
                    strength_bonus: 0, dexterity_bonus: 0, constitution_bonus: 0,
                    intelligence_bonus: 0, wisdom_bonus: 0, charisma_bonus: 0,
                    attack_speed: 1.0, stackable: 0
                  });
                  setShowItemModal(true);
                }}>
                  Add Item
                </button>
              </div>
              <div style={{ "margin-bottom": "1rem" }}>
                <input 
                  type="text" 
                  placeholder="Search by ID, name, or type..." 
                  value={searchItems()}
                  onInput={(e) => setSearchItems(e.currentTarget.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <Show when={items()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.85rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>ID</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Value</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Dmg</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Armor</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Stats</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={items().filter((i: any) => {
                        const search = searchItems().toLowerCase();
                        if (!search) return true;
                        return (
                          i.name?.toLowerCase().includes(search) ||
                          i.type?.toLowerCase().includes(search) ||
                          i.id?.toString().includes(search)
                        );
                      })}>
                        {(item: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem", "text-align": "center", "font-weight": "bold", color: "var(--accent)" }}>{item.id}</td>
                            <td style={{ padding: "0.5rem" }}>{item.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{item.type}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{item.level}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{item.value}g</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{item.damage || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{item.armor || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center", "font-size": "0.75rem" }}>
                              {[
                                item.strength_bonus ? `STR+${item.strength_bonus}` : null,
                                item.dexterity_bonus ? `DEX+${item.dexterity_bonus}` : null,
                                item.constitution_bonus ? `CON+${item.constitution_bonus}` : null,
                                item.intelligence_bonus ? `INT+${item.intelligence_bonus}` : null,
                                item.wisdom_bonus ? `WIS+${item.wisdom_bonus}` : null,
                                item.charisma_bonus ? `CHA+${item.charisma_bonus}` : null,
                              ].filter(Boolean).join(", ") || "-"}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button secondary" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                onClick={() => handleEditItem(item)}
                              >
                                Edit
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Abilities Tab */}
          <Show when={activeTab() === "abilities"}>
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Abilities ({abilities()?.length || 0})</h2>
                <button class="button primary" onClick={() => {
                  setEditingAbility({
                    name: '', description: '', type: 'damage', category: 'combat',
                    required_level: 1, mana_cost: 0, cooldown: 0, primary_stat: null,
                    stat_scaling: 0,
                    required_strength: 0, required_dexterity: 0, required_constitution: 0,
                    required_intelligence: 0, required_wisdom: 0, required_charisma: 0
                  });
                  setShowAbilityModal(true);
                }}>
                  Add Ability
                </button>
              </div>
              <div style={{ "margin-bottom": "1rem" }}>
                <input 
                  type="text" 
                  placeholder="Search by ID, name, type, or category..." 
                  value={searchAbilities()}
                  onInput={(e) => setSearchAbilities(e.currentTarget.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <Show when={abilities()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>ID</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Category</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl Req</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Mana</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Cooldown</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Primary Stat</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Weapon Req</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Offhand Req</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={abilities().filter((a: any) => {
                        const search = searchAbilities().toLowerCase();
                        if (!search) return true;
                        return (
                          a.name?.toLowerCase().includes(search) ||
                          a.type?.toLowerCase().includes(search) ||
                          a.category?.toLowerCase().includes(search) ||
                          a.id?.toString().includes(search)
                        );
                      })}>
                        {(ability: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem", "text-align": "center", "font-weight": "bold", color: "var(--accent)" }}>{ability.id}</td>
                            <td style={{ padding: "0.5rem" }}>{ability.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.type}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.category}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.required_level}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{ability.mana_cost || 0}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{ability.cooldown}s</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.primary_stat || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center", "font-size": "0.85rem" }}>
                              {ability.weapon_type_requirement ? (
                                <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.25rem", "justify-content": "center" }}>
                                  <For each={ability.weapon_type_requirement.split(',')}>
                                    {(type: string) => (
                                      <span style={{ 
                                        padding: "0.2rem 0.4rem", 
                                        background: "var(--accent)", 
                                        "border-radius": "4px",
                                        color: "var(--bg-dark)",
                                        "font-weight": "600",
                                        "white-space": "nowrap"
                                      }}>
                                        {type}
                                      </span>
                                    )}
                                  </For>
                                </div>
                              ) : "-"}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center", "font-size": "0.85rem" }}>
                              {ability.offhand_type_requirement ? (
                                <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.25rem", "justify-content": "center" }}>
                                  <For each={ability.offhand_type_requirement.split(',')}>
                                    {(type: string) => (
                                      <span style={{ 
                                        padding: "0.2rem 0.4rem", 
                                        background: "var(--success)", 
                                        "border-radius": "4px",
                                        color: "var(--bg-dark)",
                                        "font-weight": "600",
                                        "white-space": "nowrap"
                                      }}>
                                        {type}
                                      </span>
                                    )}
                                  </For>
                                </div>
                              ) : "-"}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button secondary" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                onClick={() => handleEditAbility(ability)}
                              >
                                Edit
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--accent)", "margin-right": "0.25rem" }}
                                onClick={async () => {
                                  setSelectedAbilityForEffects(ability.id);
                                  const effects = await getAbilityEffects(ability.id);
                                  setAbilityEffects(effects as any);
                                  setShowAbilityEffectModal(true);
                                }}
                              >
                                Effects
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleDeleteAbility(ability.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Regions Tab */}
          <Show when={activeTab() === "regions"}>
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Regions ({regions()?.length || 0})</h2>
                <button class="button primary" onClick={() => {
                  setEditingRegion({
                    name: '', description: '', min_level: 1, max_level: 5,
                    locked: 0, unlock_requirement: null
                  });
                  setShowRegionModal(true);
                }}>
                  Add Region
                </button>
              </div>
              <div style={{ "margin-bottom": "1rem" }}>
                <input 
                  type="text" 
                  placeholder="Search by name or description..." 
                  value={searchRegions()}
                  onInput={(e) => setSearchRegions(e.currentTarget.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <Show when={regions()}>
                <div style={{ display: "grid", gap: "1rem", overflow: "auto", "max-height": "600px" }}>
                  <For each={regions().filter((r: any) => {
                    const search = searchRegions().toLowerCase();
                    if (!search) return true;
                    return (
                      r.name?.toLowerCase().includes(search) ||
                      r.description?.toLowerCase().includes(search)
                    );
                  })}>
                    {(region: any) => (
                      <div style={{ 
                        padding: "1rem", 
                        background: "var(--bg-light)", 
                        "border-radius": "8px",
                        border: "2px solid var(--accent)",
                        position: "relative"
                      }}>
                        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: "0 0 0.5rem 0" }}>
                              {region.name}
                              {region.locked === 1 && <span style={{ "margin-left": "0.5rem", "font-size": "0.8rem", color: "var(--warning)" }}>Locked</span>}
                            </h3>
                            <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-secondary)" }}>
                              {region.description}
                            </p>
                            <div style={{ display: "flex", gap: "2rem", "font-size": "0.9rem" }}>
                              <div>
                                <strong>Level Range:</strong> {region.min_level}-{region.max_level}
                              </div>
                              <div>
                                <strong>Unlock Requirement:</strong> {region.unlock_requirement || "None"}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", "margin-left": "1rem" }}>
                            <button 
                              class="button secondary" 
                              style={{ padding: "0.5rem 1rem", "font-size": "0.9rem" }}
                              onClick={() => handleEditRegion(region)}
                            >
                              Edit
                            </button>
                            <button 
                              class="button" 
                              style={{ padding: "0.5rem 1rem", "font-size": "0.9rem", background: "var(--danger)" }}
                              onClick={() => handleDeleteRegion(region.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Loot Tables Tab */}
          <Show when={activeTab() === "loot"}>
            <div class="card" style={{ "margin-bottom": "1rem" }}>
              <h2 style={{ "margin-bottom": "1rem" }}>Mob Loot Tables</h2>
              <div style={{ display: "grid", "grid-template-columns": "1fr auto", gap: "1rem", "margin-bottom": "1rem", "align-items": "end" }}>
                <div>
                  <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Select Mob</label>
                  <select 
                    value={selectedMobForLoot() || ''} 
                    onChange={(e) => setSelectedMobForLoot(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                    style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                  >
                    <option value="">-- Select a mob to edit loot --</option>
                    <For each={mobs().sort((a: any, b: any) => a.level - b.level || a.name.localeCompare(b.name))}>
                      {(mob: any) => (
                        <option value={mob.id}>
                          {mob.name} (Lvl {mob.level}) - {mobLoot().filter((l: any) => l.mob_id === mob.id).length} items
                        </option>
                      )}
                    </For>
                  </select>
                </div>
                <Show when={selectedMobForLoot()}>
                  <button class="button primary" onClick={() => {
                    setEditingMobLoot({
                      mob_id: selectedMobForLoot()!,
                      item_id: items()[0]?.id || 1,
                      drop_chance: 0.1,
                      min_quantity: 1,
                      max_quantity: 1
                    });
                    setShowMobLootModal(true);
                  }}>
                    Add Item to Loot Table
                  </button>
                </Show>
              </div>
              
              <Show when={selectedMobForLoot()}>
                <Show 
                  when={mobLoot().filter((l: any) => l.mob_id === selectedMobForLoot()).length > 0}
                  fallback={
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      <p>This mob has no loot configured.</p>
                      <p style={{ "font-size": "0.9rem", "margin-top": "0.5rem" }}>Click "Add Item to Loot Table" to add drops.</p>
                    </div>
                  }
                >
                  <div style={{ overflow: "auto", "max-height": "600px" }}>
                    <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                        <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                          <th style={{ padding: "0.5rem", "text-align": "left" }}>Item</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Rarity</th>
                          <th style={{ padding: "0.5rem", "text-align": "right" }}>Drop %</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Quantity</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={mobLoot().filter((l: any) => l.mob_id === selectedMobForLoot())}>
                          {(loot: any) => (
                            <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                              <td style={{ padding: "0.5rem" }}>{loot.item_name}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{loot.item_type}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <span style={{ 
                                  padding: "0.2rem 0.4rem", 
                                  "border-radius": "3px",
                                  background: loot.item_rarity === 'legendary' ? 'var(--legendary)' :
                                             loot.item_rarity === 'epic' ? 'var(--epic)' :
                                             loot.item_rarity === 'rare' ? 'var(--rare)' :
                                             loot.item_rarity === 'uncommon' ? 'var(--uncommon)' :
                                             'var(--common)',
                                  color: '#fff',
                                  "font-size": "0.75rem"
                                }}>
                                  {loot.item_rarity}
                                </span>
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "right" }}>
                                {(loot.drop_chance * 100).toFixed(1)}%
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                {loot.min_quantity === loot.max_quantity ? loot.min_quantity : `${loot.min_quantity}-${loot.max_quantity}`}
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <button 
                                  class="button secondary" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                  onClick={() => handleEditMobLoot(loot)}
                                >
                                  Edit
                                </button>
                                <button 
                                  class="button" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                  onClick={() => handleDeleteMobLoot(loot.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </Show>
              
              <Show when={!selectedMobForLoot()}>
                <div style={{ padding: "3rem", "text-align": "center", color: "var(--text-secondary)" }}>
                  <p style={{ "font-size": "1.1rem" }}>Select a mob from the dropdown above to view and edit its loot table.</p>
                </div>
              </Show>
            </div>
            
            <div class="card">
              <h2 style={{ "margin-bottom": "1rem" }}>Region Rare Loot</h2>
              <div style={{ display: "grid", "grid-template-columns": "1fr auto", gap: "1rem", "margin-bottom": "1rem", "align-items": "end" }}>
                <div>
                  <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Select Region</label>
                  <select 
                    value={selectedRegionForLoot() || ''} 
                    onChange={(e) => setSelectedRegionForLoot(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                    style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                  >
                    <option value="">-- Select a region to edit rare loot --</option>
                    <For each={regions()}>
                      {(region: any) => (
                        <option value={region.id}>
                          {region.name} - {regionRareLoot().filter((l: any) => l.region_id === region.id).length} rare items
                        </option>
                      )}
                    </For>
                  </select>
                </div>
                <Show when={selectedRegionForLoot()}>
                  <button class="button primary" onClick={() => {
                    setEditingRegionLoot({
                      region_id: selectedRegionForLoot()!,
                      item_id: items()[0]?.id || 1,
                      drop_chance: 0.001,
                      min_level: 1
                    });
                    setShowRegionLootModal(true);
                  }}>
                    Add Rare Item
                  </button>
                </Show>
              </div>
              
              <Show when={selectedRegionForLoot()}>
                <Show 
                  when={regionRareLoot().filter((l: any) => l.region_id === selectedRegionForLoot()).length > 0}
                  fallback={
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      <p>This region has no rare loot configured.</p>
                      <p style={{ "font-size": "0.9rem", "margin-top": "0.5rem" }}>Click "Add Rare Item" to add region-wide rare drops.</p>
                    </div>
                  }
                >
                  <div style={{ overflow: "auto", "max-height": "600px" }}>
                    <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                        <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                          <th style={{ padding: "0.5rem", "text-align": "left" }}>Item</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Rarity</th>
                          <th style={{ padding: "0.5rem", "text-align": "right" }}>Drop %</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Min Level</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={regionRareLoot().filter((l: any) => l.region_id === selectedRegionForLoot())}>
                          {(loot: any) => (
                            <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                              <td style={{ padding: "0.5rem" }}>{loot.item_name}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{loot.item_type}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <span style={{ 
                                  padding: "0.2rem 0.4rem", 
                                  "border-radius": "3px",
                                  background: loot.item_rarity === 'legendary' ? 'var(--legendary)' :
                                             loot.item_rarity === 'epic' ? 'var(--epic)' :
                                             loot.item_rarity === 'rare' ? 'var(--rare)' :
                                             loot.item_rarity === 'uncommon' ? 'var(--uncommon)' :
                                             'var(--common)',
                                  color: '#fff',
                                  "font-size": "0.75rem"
                                }}>
                                  {loot.item_rarity}
                                </span>
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "right" }}>
                                {(loot.drop_chance * 100).toFixed(3)}%
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{loot.min_level}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <button 
                                  class="button secondary" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                  onClick={() => handleEditRegionLoot(loot)}
                                >
                                  Edit
                                </button>
                                <button 
                                  class="button" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                  onClick={() => handleDeleteRegionLoot(loot.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                      </table>
                  </div>
                </Show>
              </Show>
              
              <Show when={!selectedRegionForLoot()}>
                <div style={{ padding: "3rem", "text-align": "center", color: "var(--text-secondary)" }}>
                  <p style={{ "font-size": "1.1rem" }}>Select a region from the dropdown above to view and edit its rare loot.</p>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Merchants Tab */}
          <Show when={activeTab() === "merchants"}>
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Merchants ({merchants()?.length || 0})</h2>
                <button class="button primary" onClick={() => {
                  setEditingMerchant({
                    name: '', description: '', region_id: 1
                  });
                  setShowMerchantModal(true);
                }}>
                  Add Merchant
                </button>
              </div>
              <div style={{ "margin-bottom": "1rem" }}>
                <input 
                  type="text" 
                  placeholder="Search by name, description, or region..." 
                  value={searchMerchants()}
                  onInput={(e) => setSearchMerchants(e.currentTarget.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <Show when={merchants()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Description</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Region</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={merchants().filter((m: any) => {
                        const search = searchMerchants().toLowerCase();
                        if (!search) return true;
                        return (
                          m.name?.toLowerCase().includes(search) ||
                          m.description?.toLowerCase().includes(search) ||
                          m.region_name?.toLowerCase().includes(search)
                        );
                      })}>
                        {(merchant: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{merchant.name}</td>
                            <td style={{ padding: "0.5rem" }}>{merchant.description}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{merchant.region_name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button secondary" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                onClick={() => handleEditMerchant(merchant)}
                              >
                                Edit
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleDeleteMerchant(merchant.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Mob Spawns Tab */}
          <Show when={activeTab() === "spawns"}>
            <div class="card">
              <h2 style={{ "margin-bottom": "1rem" }}>Region Mob Spawns</h2>
              <div style={{ display: "grid", "grid-template-columns": "1fr auto", gap: "1rem", "margin-bottom": "1rem", "align-items": "end" }}>
                <div>
                  <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Select Region</label>
                  <select 
                    value={selectedRegionForMobs() || ''} 
                    onChange={(e) => setSelectedRegionForMobs(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                    style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                  >
                    <option value="">-- Select a region --</option>
                    <For each={regions().sort((a: any, b: any) => a.min_level - b.min_level)}>
                      {(region: any) => (
                        <option value={region.id}>
                          {region.name} (Lvl {region.min_level}-{region.max_level}) - {regionMobs().filter((rm: any) => rm.region_id === region.id).length} mobs
                        </option>
                      )}
                    </For>
                  </select>
                </div>
                <Show when={selectedRegionForMobs()}>
                  <button class="button primary" onClick={() => {
                    setEditingRegionMob({
                      region_id: selectedRegionForMobs()!,
                      mob_id: mobs()[0]?.id || 1,
                      spawn_weight: 1
                    });
                    setShowRegionMobModal(true);
                  }}>
                    Add Mob Spawn
                  </button>
                </Show>
              </div>
              
              <Show when={selectedRegionForMobs()}>
                <Show 
                  when={regionMobs().filter((rm: any) => rm.region_id === selectedRegionForMobs()).length > 0}
                  fallback={
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      <p>No mobs spawn in this region.</p>
                      <p style={{ "font-size": "0.9rem", "margin-top": "0.5rem" }}>Click "Add Mob Spawn" to configure mob spawns.</p>
                    </div>
                  }
                >
                  <div style={{ overflow: "auto", "max-height": "600px" }}>
                    <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                        <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                          <th style={{ padding: "0.5rem", "text-align": "left" }}>Mob Name</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Level</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Spawn Weight</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={regionMobs().filter((rm: any) => rm.region_id === selectedRegionForMobs()).sort((a: any, b: any) => b.spawn_weight - a.spawn_weight)}>
                          {(regionMob: any) => (
                            <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                              <td style={{ padding: "0.5rem" }}>{regionMob.mob_name}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{regionMob.mob_level}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{regionMob.spawn_weight}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <button 
                                  class="button secondary" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                  onClick={() => handleEditRegionMob(regionMob)}
                                >
                                  Edit
                                </button>
                                <button 
                                  class="button" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                  onClick={() => handleDeleteRegionMob(regionMob.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </Show>
              
              <Show when={!selectedRegionForMobs()}>
                <div style={{ padding: "3rem", "text-align": "center", color: "var(--text-secondary)" }}>
                  <p style={{ "font-size": "1.1rem" }}>Select a region from the dropdown above to manage which mobs spawn there.</p>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Merchant Inventory Tab */}
          <Show when={activeTab() === "inventory"}>
            <div class="card">
              <h2 style={{ "margin-bottom": "1rem" }}>Merchant Inventory</h2>
              <div style={{ display: "grid", "grid-template-columns": "1fr auto", gap: "1rem", "margin-bottom": "1rem", "align-items": "end" }}>
                <div>
                  <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Select Merchant</label>
                  <select 
                    value={selectedMerchantForInv() || ''} 
                    onChange={(e) => setSelectedMerchantForInv(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                    style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                  >
                    <option value="">-- Select a merchant --</option>
                    <For each={merchants()}>
                      {(merchant: any) => (
                        <option value={merchant.id}>
                          {merchant.name} ({merchant.region_name}) - {merchantInventory().filter((mi: any) => mi.merchant_id === merchant.id).length} items
                        </option>
                      )}
                    </For>
                  </select>
                </div>
                <Show when={selectedMerchantForInv()}>
                  <button class="button primary" onClick={() => {
                    setEditingMerchantInv({
                      merchant_id: selectedMerchantForInv()!,
                      item_id: items()[0]?.id || 1,
                      stock: -1,
                      price_multiplier: 1.0
                    });
                    setShowMerchantInvModal(true);
                  }}>
                    Add Item
                  </button>
                </Show>
              </div>
              
              <Show when={selectedMerchantForInv()}>
                <Show 
                  when={merchantInventory().filter((mi: any) => mi.merchant_id === selectedMerchantForInv()).length > 0}
                  fallback={
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      <p>This merchant has no inventory.</p>
                      <p style={{ "font-size": "0.9rem", "margin-top": "0.5rem" }}>Click "Add Item" to add items to sell.</p>
                    </div>
                  }
                >
                  <div style={{ overflow: "auto", "max-height": "600px" }}>
                    <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                        <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                          <th style={{ padding: "0.5rem", "text-align": "left" }}>Item</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                          <th style={{ padding: "0.5rem", "text-align": "right" }}>Base Value</th>
                          <th style={{ padding: "0.5rem", "text-align": "right" }}>Price Mult</th>
                          <th style={{ padding: "0.5rem", "text-align": "right" }}>Final Price</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Stock</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={merchantInventory().filter((mi: any) => mi.merchant_id === selectedMerchantForInv()).sort((a: any, b: any) => a.item_name.localeCompare(b.item_name))}>
                          {(inv: any) => (
                            <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                              <td style={{ padding: "0.5rem" }}>{inv.item_name}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{inv.item_type}</td>
                              <td style={{ padding: "0.5rem", "text-align": "right" }}>{inv.base_value}g</td>
                              <td style={{ padding: "0.5rem", "text-align": "right" }}>{inv.price_multiplier}x</td>
                              <td style={{ padding: "0.5rem", "text-align": "right" }}>{Math.round(inv.base_value * inv.price_multiplier)}g</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{inv.stock === -1 ? "∞" : inv.stock}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <button 
                                  class="button secondary" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                  onClick={() => handleEditMerchantInv(inv)}
                                >
                                  Edit
                                </button>
                                <button 
                                  class="button" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                  onClick={() => handleDeleteMerchantInv(inv.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </Show>
              
              <Show when={!selectedMerchantForInv()}>
                <div style={{ padding: "3rem", "text-align": "center", color: "var(--text-secondary)" }}>
                  <p style={{ "font-size": "1.1rem" }}>Select a merchant from the dropdown above to manage their inventory.</p>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
      
      {/* Mob Edit Modal */}
      <Show when={showMobModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowMobModal(false)}>
          <div class="card" style={{ "max-width": "600px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingMob()?.id ? 'Edit Mob' : 'Create Mob'}</h2>
              <button onClick={() => setShowMobModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveMob}>
              <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr" }}>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Name</label>
                  <input type="text" value={editingMob()?.name || ''} 
                         onInput={(e) => setEditingMob({...editingMob()!, name: e.currentTarget.value})} required />
                </div>
                <div>
                  <label>Level</label>
                  <input type="number" value={editingMob()?.level || 1} 
                         onInput={(e) => setEditingMob({...editingMob()!, level: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Max Health</label>
                  <input type="number" value={editingMob()?.max_health || 100} 
                         onInput={(e) => setEditingMob({...editingMob()!, max_health: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Attack</label>
                  <input type="number" value={editingMob()?.attack || 10} 
                         onInput={(e) => setEditingMob({...editingMob()!, attack: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Defense</label>
                  <input type="number" value={editingMob()?.defense || 5} 
                         onInput={(e) => setEditingMob({...editingMob()!, defense: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Experience</label>
                  <input type="number" value={editingMob()?.experience || 10} 
                         onInput={(e) => setEditingMob({...editingMob()!, experience: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Gold Min</label>
                  <input type="number" value={editingMob()?.gold_min || 1} 
                         onInput={(e) => setEditingMob({...editingMob()!, gold_min: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Gold Max</label>
                  <input type="number" value={editingMob()?.gold_max || 5} 
                         onInput={(e) => setEditingMob({...editingMob()!, gold_max: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Attack Speed</label>
                  <input type="number" step="0.1" value={editingMob()?.attack_speed || 1.0} 
                         onInput={(e) => setEditingMob({...editingMob()!, attack_speed: parseFloat(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Region ID <span style={{ "font-size": "0.8rem", color: "var(--warning)" }}>(controls rare loot)</span></label>
                  <input type="number" value={editingMob()?.region_id || 1} 
                         onInput={(e) => setEditingMob({...editingMob()!, region_id: parseInt(e.currentTarget.value)})} />
                </div>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Area <span style={{ "font-size": "0.8rem", color: "var(--text-secondary)" }}>(description only, not used for spawning)</span></label>
                  <input type="text" value={editingMob()?.area || ''} 
                         onInput={(e) => setEditingMob({...editingMob()!, area: e.currentTarget.value})} 
                         placeholder="e.g., 'Forest', 'Cave', 'Mountains'" />
                </div>
              </div>
              <div style={{ 
                "margin-top": "1rem", 
                padding: "0.75rem", 
                background: "var(--bg-light)", 
                "border-radius": "4px",
                "font-size": "0.85rem",
                color: "var(--text-secondary)",
                border: "1px solid var(--accent)"
              }}>
                <div style={{ "margin-bottom": "0.5rem" }}>
                  <strong style={{ color: "var(--accent)" }}>Spawning:</strong> Controlled by the <strong>region_mobs</strong> table, not region_id. 
                  Add this mob to region_mobs with a spawn_weight to make it appear in a region.
                </div>
                <div>
                  <strong style={{ color: "var(--warning)" }}>Region ID:</strong> Determines which region rare loot this mob can drop (from region_rare_loot table).
                </div>
                <div style={{ "margin-top": "0.5rem" }}>
                  <strong style={{ color: "var(--text-secondary)" }}>Area:</strong> Description only, not used by game logic.
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowMobModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Mob Loot Edit Modal */}
      <Show when={showMobLootModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowMobLootModal(false)}>
          <div class="card" style={{ "max-width": "500px", width: "90%" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingMobLoot()?.id ? 'Edit Mob Loot' : 'Add Mob Loot'}</h2>
              <button onClick={() => setShowMobLootModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveMobLoot}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Mob</label>
                  <select value={editingMobLoot()?.mob_id || ''} 
                          onChange={(e) => setEditingMobLoot({...editingMobLoot()!, mob_id: parseInt(e.currentTarget.value)})} required>
                    <For each={mobs()}>
                      {(mob: any) => <option value={mob.id}>{mob.name} (Lvl {mob.level})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Item</label>
                  <select value={editingMobLoot()?.item_id || ''} 
                          onChange={(e) => setEditingMobLoot({...editingMobLoot()!, item_id: parseInt(e.currentTarget.value)})} required>
                    <For each={items()}>
                      {(item: any) => <option value={item.id}>{item.name} ({item.rarity})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Drop Chance (0-1, e.g. 0.05 = 5%)</label>
                  <input type="number" step="0.001" min="0" max="1" value={editingMobLoot()?.drop_chance || 0.1} 
                         onInput={(e) => setEditingMobLoot({...editingMobLoot()!, drop_chance: parseFloat(e.currentTarget.value)})} required />
                </div>
                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label>Min Quantity</label>
                    <input type="number" min="1" value={editingMobLoot()?.min_quantity || 1} 
                           onInput={(e) => setEditingMobLoot({...editingMobLoot()!, min_quantity: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Max Quantity</label>
                    <input type="number" min="1" value={editingMobLoot()?.max_quantity || 1} 
                           onInput={(e) => setEditingMobLoot({...editingMobLoot()!, max_quantity: parseInt(e.currentTarget.value)})} required />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowMobLootModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Region Rare Loot Edit Modal */}
      <Show when={showRegionLootModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowRegionLootModal(false)}>
          <div class="card" style={{ "max-width": "500px", width: "90%" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingRegionLoot()?.id ? 'Edit Region Rare Loot' : 'Add Region Rare Loot'}</h2>
              <button onClick={() => setShowRegionLootModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveRegionLoot}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Region</label>
                  <select value={editingRegionLoot()?.region_id || ''} 
                          onChange={(e) => setEditingRegionLoot({...editingRegionLoot()!, region_id: parseInt(e.currentTarget.value)})} required>
                    <For each={regions()}>
                      {(region: any) => <option value={region.id}>{region.name}</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Item</label>
                  <select value={editingRegionLoot()?.item_id || ''} 
                          onChange={(e) => setEditingRegionLoot({...editingRegionLoot()!, item_id: parseInt(e.currentTarget.value)})} required>
                    <For each={items()}>
                      {(item: any) => <option value={item.id}>{item.name} ({item.rarity})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Drop Chance (0-1, e.g. 0.001 = 0.1%)</label>
                  <input type="number" step="0.0001" min="0" max="1" value={editingRegionLoot()?.drop_chance || 0.001} 
                         onInput={(e) => setEditingRegionLoot({...editingRegionLoot()!, drop_chance: parseFloat(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Minimum Mob Level</label>
                  <input type="number" min="1" value={editingRegionLoot()?.min_level || 1} 
                         onInput={(e) => setEditingRegionLoot({...editingRegionLoot()!, min_level: parseInt(e.currentTarget.value)})} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowRegionLootModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Item Edit Modal */}
      <Show when={showItemModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowItemModal(false)}>
          <div class="card" style={{ "max-width": "800px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingItem()?.id ? 'Edit Item' : 'Create Item'}</h2>
              <button onClick={() => setShowItemModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr" }}>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Name</label>
                  <input type="text" value={editingItem()?.name || ''} 
                         onInput={(e) => setEditingItem({...editingItem()!, name: e.currentTarget.value})} required />
                </div>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Description</label>
                  <textarea value={editingItem()?.description || ''} rows={2}
                            onInput={(e) => setEditingItem({...editingItem()!, description: e.currentTarget.value})} />
                </div>
                <div>
                  <label>Type</label>
                  <select value={editingItem()?.type || 'weapon'} 
                          onChange={(e) => setEditingItem({...editingItem()!, type: e.currentTarget.value})} required>
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="consumable">Consumable</option>
                    <option value="scroll">Scroll</option>
                    <option value="misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label>Rarity</label>
                  <select value={editingItem()?.rarity || 'common'} 
                          onChange={(e) => setEditingItem({...editingItem()!, rarity: e.currentTarget.value})} required>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div>
                  <label>Level Requirement</label>
                  <input type="number" min="1" value={editingItem()?.level || 1} 
                         onInput={(e) => setEditingItem({...editingItem()!, level: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Value (Gold)</label>
                  <input type="number" min="0" value={editingItem()?.value || 1} 
                         onInput={(e) => setEditingItem({...editingItem()!, value: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Damage</label>
                  <input type="number" min="0" value={editingItem()?.damage || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, damage: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Armor</label>
                  <input type="number" min="0" value={editingItem()?.armor || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, armor: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>STR Bonus</label>
                  <input type="number" value={editingItem()?.strength_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, strength_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>DEX Bonus</label>
                  <input type="number" value={editingItem()?.dexterity_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, dexterity_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>CON Bonus</label>
                  <input type="number" value={editingItem()?.constitution_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, constitution_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>INT Bonus</label>
                  <input type="number" value={editingItem()?.intelligence_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, intelligence_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>WIS Bonus</label>
                  <input type="number" value={editingItem()?.wisdom_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, wisdom_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>CHA Bonus</label>
                  <input type="number" value={editingItem()?.charisma_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, charisma_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Equipment Properties</h4>
                </div>
                
                <div>
                  <label>Slot</label>
                  <select value={editingItem()?.slot || ''} 
                          onChange={(e) => setEditingItem({...editingItem()!, slot: e.currentTarget.value || null})}>
                    <option value="">None</option>
                    <option value="weapon">Weapon</option>
                    <option value="offhand">Offhand</option>
                    <option value="head">Head</option>
                    <option value="chest">Chest</option>
                    <option value="legs">Legs</option>
                    <option value="hands">Hands</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
                
                <div>
                  <label>Weapon Type</label>
                  <select value={editingItem()?.weapon_type || ''} 
                          onChange={(e) => setEditingItem({...editingItem()!, weapon_type: e.currentTarget.value || null})}>
                    <option value="">None</option>
                    <option value="sword">Sword (1H)</option>
                    <option value="axe">Axe (1H)</option>
                    <option value="dagger">Dagger (1H)</option>
                    <option value="mace">Mace (1H)</option>
                    <option value="staff">Staff (2H)</option>
                    <option value="bow">Bow (1H)</option>
                    <option value="greatsword">Greatsword (2H)</option>
                    <option value="greataxe">Greataxe (2H)</option>
                    <option value="dual_dagger">Dual Daggers (Offhand)</option>
                    <option value="dual_sword">Dual Swords (Offhand)</option>
                  </select>
                  <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    For weapon items only
                  </small>
                </div>
                
                <div>
                  <label>Offhand Type</label>
                  <select value={editingItem()?.offhand_type || ''} 
                          onChange={(e) => setEditingItem({...editingItem()!, offhand_type: e.currentTarget.value || null})}>
                    <option value="">None</option>
                    <option value="shield">Shield</option>
                    <option value="tome">Tome</option>
                    <option value="orb">Orb</option>
                    <option value="dual_dagger">Dual Daggers</option>
                    <option value="dual_sword">Dual Swords</option>
                  </select>
                  <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    For offhand items only
                  </small>
                </div>
                
                <div>
                  <label>Damage Min</label>
                  <input type="number" min="0" value={editingItem()?.damage_min || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, damage_min: parseInt(e.currentTarget.value)})} />
                </div>
                
                <div>
                  <label>Damage Max</label>
                  <input type="number" min="0" value={editingItem()?.damage_max || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, damage_max: parseInt(e.currentTarget.value)})} />
                </div>
                
                <div>
                  <label>Attack Speed</label>
                  <input type="number" step="0.1" min="0" value={editingItem()?.attack_speed || 1.0} 
                         onInput={(e) => setEditingItem({...editingItem()!, attack_speed: parseFloat(e.currentTarget.value)})} />
                  <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    Seconds between attacks (lower = faster)
                  </small>
                </div>
                
                <div>
                  <label>Two-Handed</label>
                  <select value={editingItem()?.is_two_handed || 0} 
                          onChange={(e) => setEditingItem({...editingItem()!, is_two_handed: parseInt(e.currentTarget.value)})}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                  <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    Auto-unequips offhand when equipped
                  </small>
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Stat Requirements</h4>
                  <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0" }}>
                    Character must meet these stats to equip this item
                  </p>
                </div>
                
                <div>
                  <label>Required STR</label>
                  <input type="number" min="0" value={editingItem()?.required_strength || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, required_strength: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required DEX</label>
                  <input type="number" min="0" value={editingItem()?.required_dexterity || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, required_dexterity: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required CON</label>
                  <input type="number" min="0" value={editingItem()?.required_constitution || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, required_constitution: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required INT</label>
                  <input type="number" min="0" value={editingItem()?.required_intelligence || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, required_intelligence: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required WIS</label>
                  <input type="number" min="0" value={editingItem()?.required_wisdom || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, required_wisdom: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required CHA</label>
                  <input type="number" min="0" value={editingItem()?.required_charisma || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, required_charisma: parseInt(e.currentTarget.value)})} />
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Consumable Settings</h4>
                </div>
                
                <div>
                  <label>Health Restore</label>
                  <input type="number" min="0" value={editingItem()?.health_restore || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, health_restore: parseInt(e.currentTarget.value)})} />
                  <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    HP restored when consumed (for potions)
                  </small>
                </div>
                
                <div>
                  <label>Mana Restore</label>
                  <input type="number" min="0" value={editingItem()?.mana_restore || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, mana_restore: parseInt(e.currentTarget.value)})} />
                  <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    MP restored when consumed (for potions)
                  </small>
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Scroll Settings</h4>
                </div>
                
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Teaches Ability (for scrolls)</label>
                  <select value={editingItem()?.teaches_ability_id || ''} 
                          onChange={(e) => setEditingItem({...editingItem()!, teaches_ability_id: e.currentTarget.value ? parseInt(e.currentTarget.value) : null})}>
                    <option value="">None - Not a scroll</option>
                    <For each={abilities().sort((a: any, b: any) => a.name.localeCompare(b.name))}>
                      {(ability: any) => (
                        <option value={ability.id}>{ability.name} (Lvl {ability.required_level})</option>
                      )}
                    </For>
                  </select>
                  <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    Set this to make the item a scroll that teaches an ability when used
                  </small>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowItemModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Ability Edit Modal */}
      <Show when={showAbilityModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowAbilityModal(false)}>
          <div class="card" style={{ "max-width": "600px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingAbility()?.id ? 'Edit Ability' : 'Create Ability'}</h2>
              <button onClick={() => setShowAbilityModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveAbility}>
              <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr" }}>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Name</label>
                  <input type="text" value={editingAbility()?.name || ''} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, name: e.currentTarget.value})} required />
                </div>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Description</label>
                  <textarea value={editingAbility()?.description || ''} rows={2}
                            onInput={(e) => setEditingAbility({...editingAbility()!, description: e.currentTarget.value})} />
                </div>
                <div>
                  <label>Type</label>
                  <select value={editingAbility()?.type || 'damage'} 
                          onChange={(e) => setEditingAbility({...editingAbility()!, type: e.currentTarget.value})} required>
                    <option value="ability">Ability</option>
                    <option value="active">Active</option>
                    <option value="buff">Buff</option>
                    <option value="damage">Damage</option>
                    <option value="debuff">Debuff</option>
                    <option value="heal">Heal</option>
                    <option value="magical">Magical</option>
                    <option value="spell">Spell</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
                <div>
                  <label>Category</label>
                  <select value={editingAbility()?.category || 'combat'} 
                          onChange={(e) => setEditingAbility({...editingAbility()!, category: e.currentTarget.value})} required>
                    <option value="buff">Buff</option>
                    <option value="combat">Combat</option>
                    <option value="damage">Damage</option>
                    <option value="defense">Defense</option>
                    <option value="heal">Heal</option>
                    <option value="healing">Healing</option>
                    <option value="magic">Magic</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h3 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Effect Values</h3>
                </div>
                
                <div style={{ "grid-column": "1 / -1", padding: "0.5rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <p style={{ margin: 0, "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                    INFO: Damage, healing, and stat scaling are now configured in the <strong>Ability Effects</strong> system below. The old damage_min, damage_max, healing, and stat_scaling fields have been removed.
                  </p>
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h3 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Buff/Debuff (if applicable)</h3>
                </div>
                
                <div style={{ "grid-column": "1 / -1", padding: "0.5rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <p style={{ margin: 0, "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                    INFO: Buff abilities now use the <strong>Ability Effects</strong> system below. The old buff_stat, buff_amount, and buff_duration fields are deprecated.
                  </p>
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h3 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Costs & Requirements</h3>
                </div>
                
                <div>
                  <label>Level Requirement</label>
                  <input type="number" min="1" value={editingAbility()?.required_level || 1} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_level: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Mana Cost</label>
                  <input type="number" min="0" value={editingAbility()?.mana_cost || 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, mana_cost: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Cooldown (seconds)</label>
                  <input type="number" step="0.01" min="0" value={editingAbility()?.cooldown || 0} 
                         onChange={(e) => setEditingAbility({...editingAbility()!, cooldown: parseFloat(e.currentTarget.value) || 0})} required />
                </div>
                <div>
                  <label>Primary Stat (for scaling)</label>
                  <select value={editingAbility()?.primary_stat || ''} 
                          onChange={(e) => setEditingAbility({...editingAbility()!, primary_stat: e.currentTarget.value || null})}>
                    <option value="">None</option>
                    <option value="strength">Strength</option>
                    <option value="dexterity">Dexterity</option>
                    <option value="constitution">Constitution</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="charisma">Charisma</option>
                  </select>
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h3 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Stat Requirements</h3>
                </div>
                
                <div>
                  <label>Required STR</label>
                  <input type="number" min="0" value={editingAbility()?.required_strength ?? 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_strength: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required DEX</label>
                  <input type="number" min="0" value={editingAbility()?.required_dexterity ?? 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_dexterity: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required CON</label>
                  <input type="number" min="0" value={editingAbility()?.required_constitution ?? 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_constitution: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required INT</label>
                  <input type="number" min="0" value={editingAbility()?.required_intelligence ?? 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_intelligence: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required WIS</label>
                  <input type="number" min="0" value={editingAbility()?.required_wisdom ?? 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_wisdom: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Required CHA</label>
                  <input type="number" min="0" value={editingAbility()?.required_charisma ?? 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_charisma: parseInt(e.currentTarget.value)})} />
                </div>
                
                <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                  <h3 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Equipment Requirements</h3>
                  <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0" }}>
                    Hold Ctrl/Cmd to select multiple weapon or offhand types
                  </p>
                </div>
                
                <div>
                  <label>Weapon Types Required</label>
                  <select 
                    multiple 
                    size="8"
                    onChange={(e) => {
                      const selected = Array.from(e.currentTarget.selectedOptions).map(opt => opt.value);
                      setEditingAbility({...editingAbility()!, weapon_type_requirement: selected.length > 0 ? selected.join(',') : null});
                    }}
                    style={{ width: "100%", padding: "0.5rem" }}
                  >
                    <option value="sword" selected={editingAbility()?.weapon_type_requirement?.includes('sword') && !editingAbility()?.weapon_type_requirement?.includes('dual_sword')}>Sword (1H)</option>
                    <option value="greatsword" selected={editingAbility()?.weapon_type_requirement?.includes('greatsword')}>Greatsword (2H)</option>
                    <option value="axe" selected={editingAbility()?.weapon_type_requirement?.includes('axe') && !editingAbility()?.weapon_type_requirement?.includes('greataxe')}>Axe (1H)</option>
                    <option value="greataxe" selected={editingAbility()?.weapon_type_requirement?.includes('greataxe')}>Greataxe (2H)</option>
                    <option value="mace" selected={editingAbility()?.weapon_type_requirement?.includes('mace')}>Mace (1H)</option>
                    <option value="dagger" selected={editingAbility()?.weapon_type_requirement?.includes('dagger') && !editingAbility()?.weapon_type_requirement?.includes('dual_dagger')}>Dagger (1H)</option>
                    <option value="dual_dagger" selected={editingAbility()?.weapon_type_requirement?.includes('dual_dagger')}>Dual Daggers</option>
                    <option value="dual_sword" selected={editingAbility()?.weapon_type_requirement?.includes('dual_sword')}>Dual Swords</option>
                    <option value="bow" selected={editingAbility()?.weapon_type_requirement?.includes('bow')}>Bow</option>
                    <option value="wand" selected={editingAbility()?.weapon_type_requirement?.includes('wand')}>Wand</option>
                    <option value="staff" selected={editingAbility()?.weapon_type_requirement?.includes('staff')}>Staff (2H)</option>
                    <option value="polearm" selected={editingAbility()?.weapon_type_requirement?.includes('polearm')}>Polearm</option>
                  </select>
                  <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    Selected: {editingAbility()?.weapon_type_requirement || 'None (Any Weapon)'}
                  </div>
                </div>
                
                <div>
                  <label>Offhand Types Required</label>
                  <select 
                    multiple 
                    size="8"
                    onChange={(e) => {
                      const selected = Array.from(e.currentTarget.selectedOptions).map(opt => opt.value);
                      setEditingAbility({...editingAbility()!, offhand_type_requirement: selected.length > 0 ? selected.join(',') : null});
                    }}
                    style={{ width: "100%", padding: "0.5rem" }}
                  >
                    <option value="shield" selected={editingAbility()?.offhand_type_requirement?.includes('shield')}>Shield</option>
                    <option value="orb" selected={editingAbility()?.offhand_type_requirement?.includes('orb')}>Orb</option>
                    <option value="tome" selected={editingAbility()?.offhand_type_requirement?.includes('tome')}>Tome</option>
                    <option value="focus" selected={editingAbility()?.offhand_type_requirement?.includes('focus')}>Focus</option>
                    <option value="quiver" selected={editingAbility()?.offhand_type_requirement?.includes('quiver')}>Quiver</option>
                    <option value="dual_dagger" selected={editingAbility()?.offhand_type_requirement?.includes('dual_dagger')}>Dual Daggers</option>
                    <option value="dual_sword" selected={editingAbility()?.offhand_type_requirement?.includes('dual_sword')}>Dual Swords</option>
                  </select>
                  <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>
                    Selected: {editingAbility()?.offhand_type_requirement || 'None (No Requirement)'}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowAbilityModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Ability Effects Modal */}
      <Show when={showAbilityEffectModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowAbilityEffectModal(false)}>
          <div class="card" style={{ "max-width": "900px", width: "95%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>Ability Effects - {abilities().find((a: any) => a.id === selectedAbilityForEffects())?.name}</h2>
              <button onClick={() => setShowAbilityEffectModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            {/* Add New Effect Button */}
            <button class="button primary" style={{ "margin-bottom": "1rem" }} onClick={() => {
              setEditingAbilityEffect({
                ability_id: selectedAbilityForEffects(),
                effect_order: (abilityEffects().length || 0) + 1,
                effect_type: 'damage',
                target: 'enemy',
                value_min: 0,
                value_max: 0,
                is_periodic: 0,
                tick_interval: 0,
                tick_count: 0,
                tick_value: 0,
                stat_affected: null,
                stat_scaling: null,
                scaling_factor: 0,
                chance: 1.0,
                duration: 0,
                shield_amount: 0,
                drain_percent: 0,
                stacks_max: 1
              });
            }}>
              Add New Effect
            </button>
            
            {/* Effects List */}
            <Show when={abilityEffects().length > 0}>
              <div style={{ "margin-bottom": "2rem" }}>
                <h3 style={{ "margin-bottom": "1rem" }}>Current Effects</h3>
                <For each={abilityEffects()}>
                  {(effect: any) => (
                    <div style={{ 
                      padding: "1rem", 
                      background: "var(--bg-light)", 
                      "border-radius": "8px",
                      "margin-bottom": "1rem"
                    }}>
                      <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ "font-weight": "bold", "margin-bottom": "0.5rem" }}>
                            Effect #{effect.effect_order}: {effect.effect_type?.toUpperCase() || 'UNKNOWN'} → {effect.target || 'N/A'}
                          </div>
                          <div style={{ "font-size": "0.9rem", color: "var(--text-secondary)" }}>
                            <Show when={effect.effect_type === 'damage' || effect.effect_type === 'heal'}>
                              <div>Value: {effect.value_min}-{effect.value_max}</div>
                            </Show>
                            <Show when={effect.is_periodic === 1}>
                              <div>Periodic: {effect.tick_value} per tick, every {effect.tick_interval}s for {effect.tick_count} ticks (Total: {effect.tick_interval * effect.tick_count}s)</div>
                            </Show>
                            <Show when={effect.stat_affected}>
                              <div>Stat: {effect.stat_affected}</div>
                            </Show>
                            <Show when={effect.duration > 0}>
                              <div>Duration: {effect.duration}s</div>
                            </Show>
                            <Show when={effect.stat_scaling}>
                              <div>Scaling: {effect.stat_scaling} × {effect.scaling_factor}</div>
                            </Show>
                            <Show when={effect.chance < 1.0}>
                              <div>Chance: {(effect.chance * 100).toFixed(0)}%</div>
                            </Show>
                            <Show when={effect.shield_amount > 0}>
                              <div>Shield: {effect.shield_amount}</div>
                            </Show>
                            <Show when={effect.drain_percent > 0}>
                              <div>Drain: {(effect.drain_percent * 100).toFixed(0)}%</div>
                            </Show>
                            <Show when={effect.stat_affected === 'thorns'}>
                              <div>Thorns: {effect.value_min}% reflect</div>
                            </Show>
                            <Show when={effect.stacks_max > 1}>
                              <div>Max Stacks: {effect.stacks_max}</div>
                            </Show>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button 
                            class="button secondary" 
                            style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem" }}
                            onClick={() => handleEditAbilityEffect(effect)}
                          >
                            Edit
                          </button>
                          <button 
                            class="button" 
                            style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                            onClick={() => handleDeleteAbilityEffect(effect.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
            
            {/* Effect Edit Form */}
            <Show when={editingAbilityEffect()}>
              <div style={{ padding: "1.5rem", background: "var(--bg-light)", "border-radius": "8px" }}>
                <h3 style={{ "margin-bottom": "1rem" }}>{editingAbilityEffect()?.id ? 'Edit Effect' : 'New Effect'}</h3>
                <form onSubmit={handleSaveAbilityEffect}>
                  <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr" }}>
                    <div>
                      <label>Effect Order</label>
                      <input type="number" min="1" value={editingAbilityEffect()?.effect_order || 1} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, effect_order: parseInt(e.currentTarget.value)})} required />
                    </div>
                    <div>
                      <label>Effect Type</label>
                      <select value={editingAbilityEffect()?.effect_type || 'damage'} 
                              onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, effect_type: e.currentTarget.value})} required>
                        <option value="damage">Damage</option>
                        <option value="heal">Heal</option>
                        <option value="buff">Buff</option>
                        <option value="debuff">Debuff</option>
                        <option value="dot">DOT (Damage Over Time)</option>
                        <option value="hot">HOT (Heal Over Time)</option>
                        <option value="drain">Drain</option>
                        <option value="shield">Shield</option>
                      </select>
                    </div>
                    <div>
                      <label>Target</label>
                      <select value={editingAbilityEffect()?.target || 'enemy'} 
                              onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, target: e.currentTarget.value})} required>
                        <option value="self">Self</option>
                        <option value="enemy">Enemy</option>
                        <option value="ally">Ally</option>
                      </select>
                    </div>
                    <div>
                      <label>Chance (0-1)</label>
                      <input type="number" step="0.01" min="0" max="1" value={editingAbilityEffect()?.chance ?? 1.0} 
                             onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, chance: parseFloat(e.currentTarget.value) || 1.0})} />
                    </div>
                    
                    <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                      <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Instant Values</h4>
                    </div>
                    
                    <div>
                      <label>Value Min</label>
                      <input type="number" min="0" value={editingAbilityEffect()?.value_min ?? 0} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, value_min: parseInt(e.currentTarget.value) || 0})} />
                    </div>
                    <div>
                      <label>Value Max</label>
                      <input type="number" min="0" value={editingAbilityEffect()?.value_max ?? 0} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, value_max: parseInt(e.currentTarget.value) || 0})} />
                    </div>
                    
                    <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                      <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Periodic Effects (DOT/HOT)</h4>
                    </div>
                    
                    <div>
                      <label>Is Periodic</label>
                      <select value={editingAbilityEffect()?.is_periodic ?? 0} 
                              onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, is_periodic: parseInt(e.currentTarget.value)})}>
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                      </select>
                    </div>
                    <div>
                      <label>Tick Value</label>
                      <input type="number" min="0" value={editingAbilityEffect()?.tick_value ?? 0} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, tick_value: parseInt(e.currentTarget.value) || 0})} />
                    </div>
                    <div>
                      <label>Tick Interval (seconds)</label>
                      <input type="number" min="0" value={editingAbilityEffect()?.tick_interval ?? 0} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, tick_interval: parseInt(e.currentTarget.value) || 0})} />
                    </div>
                    <div>
                      <label>Tick Count</label>
                      <input type="number" min="0" value={editingAbilityEffect()?.tick_count ?? 0} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, tick_count: parseInt(e.currentTarget.value) || 0})} />
                    </div>
                    
                    <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                      <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Buffs/Debuffs</h4>
                    </div>
                    
                    <div>
                      <label>Stat Affected</label>
                      <select value={editingAbilityEffect()?.stat_affected || ''} 
                              onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, stat_affected: e.currentTarget.value || null})}>
                        <option value="">None</option>
                        <option value="strength">Strength</option>
                        <option value="dexterity">Dexterity</option>
                        <option value="constitution">Constitution</option>
                        <option value="intelligence">Intelligence</option>
                        <option value="wisdom">Wisdom</option>
                        <option value="charisma">Charisma</option>
                        <option value="evasiveness">Evasiveness</option>
                        <option value="armor">Armor</option>
                        <option value="damage">Damage</option>
                        <option value="thorns">Thorns (Reflect Damage)</option>
                      </select>
                      <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>For Thorns, set value_min to reflect %</small>
                    </div>
                    <div>
                      <label>Duration (seconds)</label>
                      <input type="number" min="0" value={editingAbilityEffect()?.duration ?? 0} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, duration: parseInt(e.currentTarget.value) || 0})} />
                    </div>
                    
                    <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                      <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Scaling</h4>
                    </div>
                    
                    <div>
                      <label>Stat Scaling</label>
                      <select value={editingAbilityEffect()?.stat_scaling || ''} 
                              onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, stat_scaling: e.currentTarget.value || null})}>
                        <option value="">None</option>
                        <option value="strength">Strength</option>
                        <option value="dexterity">Dexterity</option>
                        <option value="constitution">Constitution</option>
                        <option value="intelligence">Intelligence</option>
                        <option value="wisdom">Wisdom</option>
                        <option value="charisma">Charisma</option>
                      </select>
                    </div>
                    <div>
                      <label>Scaling Factor</label>
                      <input type="number" step="0.1" min="0" value={editingAbilityEffect()?.scaling_factor ?? 0} 
                             onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, scaling_factor: parseFloat(e.currentTarget.value) || 0})} />
                    </div>
                    
                    <div style={{ "grid-column": "1 / -1", "margin-top": "0.5rem" }}>
                      <h4 style={{ "font-size": "1rem", "margin-bottom": "0.5rem", color: "var(--accent)" }}>Special Effects</h4>
                    </div>
                    
                    <div>
                      <label>Shield Amount</label>
                      <input type="number" min="0" value={editingAbilityEffect()?.shield_amount ?? 0} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, shield_amount: parseInt(e.currentTarget.value) || 0})} />
                    </div>
                    <div>
                      <label>Drain % (0-1)</label>
                      <input type="number" step="0.01" min="0" max="1" value={editingAbilityEffect()?.drain_percent ?? 0} 
                             onChange={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, drain_percent: parseFloat(e.currentTarget.value) || 0})} />
                    </div>
                    <div>
                      <label>Max Stacks</label>
                      <input type="number" min="1" value={editingAbilityEffect()?.stacks_max ?? 1} 
                             onInput={(e) => setEditingAbilityEffect({...editingAbilityEffect()!, stacks_max: parseInt(e.currentTarget.value) || 1})} />
                      <small style={{ display: "block", "font-size": "0.75rem", color: "var(--text-secondary)" }}>How many times this effect can stack</small>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                    <button type="submit" class="button primary" style={{ flex: 1 }}>Save Effect</button>
                    <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setEditingAbilityEffect(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </Show>
            
            <div style={{ "margin-top": "1.5rem" }}>
              <button class="button secondary" onClick={() => setShowAbilityEffectModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </Show>
      
      {/* Region Edit Modal */}
      <Show when={showRegionModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowRegionModal(false)}>
          <div class="card" style={{ "max-width": "600px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingRegion()?.id ? 'Edit Region' : 'Create Region'}</h2>
              <button onClick={() => setShowRegionModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveRegion}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Name</label>
                  <input type="text" value={editingRegion()?.name || ''} 
                         onInput={(e) => setEditingRegion({...editingRegion()!, name: e.currentTarget.value})} required />
                </div>
                <div>
                  <label>Description</label>
                  <textarea value={editingRegion()?.description || ''} rows={3}
                            onInput={(e) => setEditingRegion({...editingRegion()!, description: e.currentTarget.value})} />
                </div>
                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label>Min Level</label>
                    <input type="number" min="1" value={editingRegion()?.min_level || 1} 
                           onInput={(e) => setEditingRegion({...editingRegion()!, min_level: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Max Level</label>
                    <input type="number" min="1" value={editingRegion()?.max_level || 5} 
                           onInput={(e) => setEditingRegion({...editingRegion()!, max_level: parseInt(e.currentTarget.value)})} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
                    <input type="checkbox" checked={editingRegion()?.locked === 1} 
                           onChange={(e) => setEditingRegion({...editingRegion()!, locked: e.currentTarget.checked ? 1 : 0})} />
                    Locked (requires unlock requirement)
                  </label>
                </div>
                <div>
                  <label>Unlock Requirement (optional)</label>
                  <input type="text" value={editingRegion()?.unlock_requirement || ''} 
                         onInput={(e) => setEditingRegion({...editingRegion()!, unlock_requirement: e.currentTarget.value || null})}
                         placeholder="e.g., Complete Greenfield Quest" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowRegionModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Merchant Edit Modal */}
      <Show when={showMerchantModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowMerchantModal(false)}>
          <div class="card" style={{ "max-width": "600px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingMerchant()?.id ? 'Edit Merchant' : 'Create Merchant'}</h2>
              <button onClick={() => setShowMerchantModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveMerchant}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Name</label>
                  <input type="text" value={editingMerchant()?.name || ''} 
                         onInput={(e) => setEditingMerchant({...editingMerchant()!, name: e.currentTarget.value})} required />
                </div>
                <div>
                  <label>Description</label>
                  <textarea value={editingMerchant()?.description || ''} rows={2}
                            onInput={(e) => setEditingMerchant({...editingMerchant()!, description: e.currentTarget.value})} />
                </div>
                <div>
                  <label>Region</label>
                  <select value={editingMerchant()?.region_id || 1} 
                          onChange={(e) => setEditingMerchant({...editingMerchant()!, region_id: parseInt(e.currentTarget.value)})} required>
                    <For each={regions()}>
                      {(region: any) => <option value={region.id}>{region.name}</option>}
                    </For>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowMerchantModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Region Mob Spawn Modal */}
      <Show when={showRegionMobModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowRegionMobModal(false)}>
          <div class="card" style={{ "max-width": "500px", width: "90%"}} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingRegionMob()?.id ? 'Edit Mob Spawn' : 'Add Mob Spawn'}</h2>
              <button onClick={() => setShowRegionMobModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveRegionMob}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Region</label>
                  <select value={editingRegionMob()?.region_id || 1} 
                          onChange={(e) => setEditingRegionMob({...editingRegionMob()!, region_id: parseInt(e.currentTarget.value)})} required>
                    <For each={regions()}>
                      {(region: any) => <option value={region.id}>{region.name}</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Mob</label>
                  <select value={editingRegionMob()?.mob_id || 1} 
                          onChange={(e) => setEditingRegionMob({...editingRegionMob()!, mob_id: parseInt(e.currentTarget.value)})} required>
                    <For each={mobs().sort((a: any, b: any) => a.level - b.level || a.name.localeCompare(b.name))}>
                      {(mob: any) => <option value={mob.id}>{mob.name} (Lvl {mob.level})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Spawn Weight (higher = more common)</label>
                  <input type="number" min="1" value={editingRegionMob()?.spawn_weight || 1} 
                         onInput={(e) => setEditingRegionMob({...editingRegionMob()!, spawn_weight: parseInt(e.currentTarget.value)})} required />
                  <small style={{ display: "block", "margin-top": "0.25rem", color: "var(--text-secondary)" }}>
                    Relative spawn frequency. Higher numbers = spawns more often.
                  </small>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowRegionMobModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Merchant Inventory Modal */}
      <Show when={showMerchantInvModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowMerchantInvModal(false)}>
          <div class="card" style={{ "max-width": "500px", width: "90%" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingMerchantInv()?.id ? 'Edit Merchant Item' : 'Add Merchant Item'}</h2>
              <button onClick={() => setShowMerchantInvModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveMerchantInv}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Merchant</label>
                  <select value={editingMerchantInv()?.merchant_id || 1} 
                          onChange={(e) => setEditingMerchantInv({...editingMerchantInv()!, merchant_id: parseInt(e.currentTarget.value)})} required>
                    <For each={merchants()}>
                      {(merchant: any) => <option value={merchant.id}>{merchant.name} ({merchant.region_name})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Item</label>
                  <select value={editingMerchantInv()?.item_id || 1} 
                          onChange={(e) => setEditingMerchantInv({...editingMerchantInv()!, item_id: parseInt(e.currentTarget.value)})} required>
                    <For each={items().sort((a: any, b: any) => a.name.localeCompare(b.name))}>
                      {(item: any) => <option value={item.id}>{item.name} ({item.type})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Stock (-1 = infinite)</label>
                  <input type="number" min="-1" value={editingMerchantInv()?.stock ?? -1} 
                         onInput={(e) => setEditingMerchantInv({...editingMerchantInv()!, stock: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Price Multiplier</label>
                  <input type="number" step="0.1" min="0.1" value={editingMerchantInv()?.price_multiplier || 1.0} 
                         onInput={(e) => setEditingMerchantInv({...editingMerchantInv()!, price_multiplier: parseFloat(e.currentTarget.value)})} required />
                  <small style={{ display: "block", "margin-top": "0.25rem", color: "var(--text-secondary)" }}>
                    1.0 = normal price, 0.5 = half price, 2.0 = double price
                  </small>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowMerchantInvModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Character Edit Modal */}
      <Show when={showCharacterModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowCharacterModal(false)}>
          <div class="card" style={{ "max-width": "900px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>Edit Character: {editingCharacter()?.name}</h2>
              <button onClick={() => setShowCharacterModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: "0.5rem", "margin-bottom": "1rem", "border-bottom": "2px solid var(--bg-light)", "padding-bottom": "0.5rem" }}>
              <button
                class={characterModalTab() === "stats" ? "button primary" : "button secondary"}
                onClick={() => setCharacterModalTab("stats")}
                style={{ padding: "0.5rem 1rem" }}
              >
                Stats & Gold
              </button>
              <button
                class={characterModalTab() === "inventory" ? "button primary" : "button secondary"}
                onClick={() => setCharacterModalTab("inventory")}
                style={{ padding: "0.5rem 1rem" }}
              >
                Inventory ({characterInventory().length})
              </button>
              <button
                class={characterModalTab() === "abilities" ? "button primary" : "button secondary"}
                onClick={() => setCharacterModalTab("abilities")}
                style={{ padding: "0.5rem 1rem" }}
              >
                Abilities ({characterAbilities().length})
              </button>
              <button
                class={characterModalTab() === "regions" ? "button primary" : "button secondary"}
                onClick={() => setCharacterModalTab("regions")}
                style={{ padding: "0.5rem 1rem" }}
              >
                Region Unlocks
              </button>
            </div>
            
            {/* Stats Tab */}
            <Show when={characterModalTab() === "stats"}>
              <form onSubmit={handleSaveCharacter}>
                <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr 1fr" }}>
                  <div style={{ "grid-column": "1 / -1" }}>
                    <label>Character Name</label>
                    <input type="text" value={editingCharacter()?.name || ''} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, name: e.currentTarget.value})} required />
                  </div>
                  
                  <div style={{ "grid-column": "1 / -1", "margin-top": "1rem" }}>
                    <h3 style={{ "font-size": "1.1rem", color: "var(--accent)" }}>Level & Resources</h3>
                  </div>
                  
                  <div>
                    <label>Level</label>
                    <input type="number" min="1" value={editingCharacter()?.level || 1} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, level: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Experience</label>
                    <input type="number" min="0" value={editingCharacter()?.experience || 0} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, experience: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Gold</label>
                    <input type="number" min="0" value={editingCharacter()?.gold || 0} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, gold: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Available Stat Points</label>
                    <input type="number" min="0" value={editingCharacter()?.available_points || 0} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, available_points: parseInt(e.currentTarget.value)})} required />
                  </div>
                  
                  <div style={{ "grid-column": "1 / -1", "margin-top": "1rem" }}>
                    <h3 style={{ "font-size": "1.1rem", color: "var(--accent)" }}>Health & Mana</h3>
                  </div>
                  
                  <div>
                    <label>Current Health</label>
                    <input type="number" min="0" value={editingCharacter()?.current_health || 100} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, current_health: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Max Health</label>
                    <input type="number" min="1" value={editingCharacter()?.max_health || 100} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, max_health: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div></div>
                  <div>
                    <label>Current Mana</label>
                    <input type="number" min="0" value={editingCharacter()?.current_mana || 100} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, current_mana: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Max Mana</label>
                    <input type="number" min="1" value={editingCharacter()?.max_mana || 100} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, max_mana: parseInt(e.currentTarget.value)})} required />
                  </div>
                  
                  <div style={{ "grid-column": "1 / -1", "margin-top": "1rem" }}>
                    <h3 style={{ "font-size": "1.1rem", color: "var(--accent)" }}>Attributes</h3>
                  </div>
                  
                  <div>
                    <label>Strength</label>
                    <input type="number" min="1" value={editingCharacter()?.strength || 10} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, strength: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Dexterity</label>
                    <input type="number" min="1" value={editingCharacter()?.dexterity || 10} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, dexterity: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Constitution</label>
                    <input type="number" min="1" value={editingCharacter()?.constitution || 10} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, constitution: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Intelligence</label>
                    <input type="number" min="1" value={editingCharacter()?.intelligence || 10} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, intelligence: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Wisdom</label>
                    <input type="number" min="1" value={editingCharacter()?.wisdom || 10} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, wisdom: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Charisma</label>
                    <input type="number" min="1" value={editingCharacter()?.charisma || 10} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, charisma: parseInt(e.currentTarget.value)})} required />
                  </div>
                  
                  <div style={{ "grid-column": "1 / -1", "margin-top": "1rem" }}>
                    <h3 style={{ "font-size": "1.1rem", color: "var(--accent)" }}>Location</h3>
                  </div>
                  
                  <div>
                    <label>Current Region</label>
                    <select value={editingCharacter()?.current_region || 1} 
                            onChange={(e) => setEditingCharacter({...editingCharacter()!, current_region: parseInt(e.currentTarget.value)})}>
                      <For each={regions()}>
                        {(region: any) => <option value={region.id}>{region.name}</option>}
                      </For>
                    </select>
                  </div>
                  <div>
                    <label>Current Sub-Area (nullable)</label>
                    <input type="number" min="0" value={editingCharacter()?.current_sub_area || ''} 
                           onInput={(e) => setEditingCharacter({...editingCharacter()!, current_sub_area: e.currentTarget.value ? parseInt(e.currentTarget.value) : null})} 
                           placeholder="Leave empty for none" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                  <button type="submit" class="button primary" style={{ flex: 1 }}>Save Character</button>
                  <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowCharacterModal(false)}>Cancel</button>
                </div>
              </form>
            </Show>
            
            {/* Inventory Tab */}
            <Show when={characterModalTab() === "inventory"}>
              <div>
                <div style={{ "margin-bottom": "1rem" }}>
                  <button class="button primary" onClick={handleAddItemToCharacter}>Add Item</button>
                </div>
                <div style={{ overflow: "auto", "max-height": "500px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Item</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Rarity</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Quantity</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Equipped</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={characterInventory()}>
                        {(invItem: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{invItem.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{invItem.type}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{invItem.rarity}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <input 
                                type="number" 
                                min="1" 
                                value={invItem.quantity} 
                                style={{ width: "60px", padding: "0.25rem", "text-align": "center" }}
                                onChange={(e) => handleUpdateInventoryItem(invItem.inventory_id, parseInt(e.currentTarget.value), invItem.equipped)}
                              />
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <input 
                                type="checkbox" 
                                checked={invItem.equipped === 1}
                                onChange={(e) => handleUpdateInventoryItem(invItem.inventory_id, invItem.quantity, e.currentTarget.checked ? 1 : 0)}
                              />
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleRemoveItemFromCharacter(invItem.inventory_id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                  <Show when={characterInventory().length === 0}>
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      No items in inventory
                    </div>
                  </Show>
                </div>
              </div>
            </Show>
            
            {/* Abilities Tab */}
            <Show when={characterModalTab() === "abilities"}>
              <div>
                <div style={{ "margin-bottom": "1rem" }}>
                  <button class="button primary" onClick={handleAddAbilityToCharacter}>Add Ability</button>
                </div>
                <div style={{ overflow: "auto", "max-height": "500px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Ability</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Category</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Required Level</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={characterAbilities()}>
                        {(ability: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{ability.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.type}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.category}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.required_level}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleRemoveAbilityFromCharacter(ability.character_ability_id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                  <Show when={characterAbilities().length === 0}>
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      No abilities learned
                    </div>
                  </Show>
                </div>
              </div>
            </Show>
            
            {/* Regions Tab */}
            <Show when={characterModalTab() === "regions"}>
              <div>
                <div style={{ "margin-bottom": "1rem" }}>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Manage which regions this character has unlocked. Unlocked regions can be traveled to.
                  </p>
                </div>
                <div style={{ overflow: "auto", "max-height": "500px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Region</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Status</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={characterRegionUnlocks()}>
                        {(regionUnlock: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{regionUnlock.region_name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              {regionUnlock.unlocked === 1 ? (
                                <span style={{ color: "var(--success)" }}>Yes Unlocked</span>
                              ) : (
                                <span style={{ color: "var(--text-secondary)" }}>Locked</span>
                              )}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button" 
                                style={{ 
                                  padding: "0.25rem 0.75rem", 
                                  "font-size": "0.8rem", 
                                  background: regionUnlock.unlocked === 1 ? "var(--danger)" : "var(--success)" 
                                }}
                                onClick={() => handleToggleRegionUnlock(regionUnlock.region_id, regionUnlock.unlocked === 1)}
                              >
                                {regionUnlock.unlocked === 1 ? "Lock" : "Unlock"}
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
      
      {/* Add Item Modal */}
      <Show when={showAddItemModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1001
        }} onClick={() => setShowAddItemModal(false)}>
          <div class="card" style={{ "max-width": "700px", width: "90%", "max-height": "80vh", overflow: "hidden", display: "flex", "flex-direction": "column" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>Add Item to Inventory</h2>
              <button onClick={() => setShowAddItemModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            <div style={{ "margin-bottom": "1rem" }}>
              <input 
                type="text" 
                placeholder="Search items by ID, name, or type..." 
                value={searchAddItem()}
                onInput={(e) => setSearchAddItem(e.currentTarget.value)}
                style={{ width: "100%", padding: "0.75rem", "font-size": "1rem" }}
                autofocus
              />
            </div>
            
            <div style={{ flex: 1, overflow: "auto", "margin-bottom": "1rem" }}>
              <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                  <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Select</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>ID</th>
                    <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Rarity</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={items().filter((i: any) => {
                    const search = searchAddItem().toLowerCase();
                    if (!search) return true;
                    return (
                      i.id?.toString().includes(search) ||
                      i.name?.toLowerCase().includes(search) ||
                      i.type?.toLowerCase().includes(search)
                    );
                  })}>
                    {(item: any) => (
                      <tr 
                        style={{ 
                          "border-bottom": "1px solid var(--bg-light)",
                          background: selectedItemToAdd() === item.id ? "var(--bg-light)" : "transparent",
                          cursor: "pointer"
                        }}
                        onClick={() => setSelectedItemToAdd(item.id)}
                      >
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>
                          <input 
                            type="radio" 
                            checked={selectedItemToAdd() === item.id}
                            onChange={() => setSelectedItemToAdd(item.id)}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", "text-align": "center", "font-weight": "bold", color: "var(--accent)" }}>{item.id}</td>
                        <td style={{ padding: "0.5rem" }}>{item.name}</td>
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>{item.type}</td>
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>
                          <span style={{ 
                            padding: "0.2rem 0.4rem", 
                            "border-radius": "3px",
                            background: item.rarity === 'legendary' ? 'var(--legendary)' :
                                       item.rarity === 'epic' ? 'var(--epic)' :
                                       item.rarity === 'rare' ? 'var(--rare)' :
                                       item.rarity === 'uncommon' ? 'var(--uncommon)' :
                                       'var(--common)',
                            color: '#fff',
                            "font-size": "0.75rem"
                          }}>
                            {item.rarity}
                          </span>
                        </td>
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>{item.level}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            
            <div style={{ display: "flex", gap: "1rem", "align-items": "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", "margin-bottom": "0.25rem" }}>Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={itemQuantityToAdd()} 
                  onInput={(e) => setItemQuantityToAdd(parseInt(e.currentTarget.value) || 1)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <button 
                type="button" 
                class="button primary" 
                style={{ flex: 1 }}
                onClick={handleConfirmAddItem}
                disabled={!selectedItemToAdd()}
              >
                Add Item
              </button>
              <button 
                type="button" 
                class="button secondary" 
                style={{ flex: 1 }}
                onClick={() => setShowAddItemModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Show>
      
      {/* Add Ability Modal */}
      <Show when={showAddAbilityModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1001
        }} onClick={() => setShowAddAbilityModal(false)}>
          <div class="card" style={{ "max-width": "800px", width: "90%", "max-height": "80vh", overflow: "hidden", display: "flex", "flex-direction": "column" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>Add Ability to Character</h2>
              <button onClick={() => setShowAddAbilityModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            <div style={{ "margin-bottom": "1rem" }}>
              <input 
                type="text" 
                placeholder="Search abilities by ID, name, type, or category..." 
                value={searchAddAbility()}
                onInput={(e) => setSearchAddAbility(e.currentTarget.value)}
                style={{ width: "100%", padding: "0.75rem", "font-size": "1rem" }}
                autofocus
              />
            </div>
            
            <div style={{ flex: 1, overflow: "auto", "margin-bottom": "1rem" }}>
              <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                  <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Select</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>ID</th>
                    <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Category</th>
                    <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl Req</th>
                    <th style={{ padding: "0.5rem", "text-align": "right" }}>Mana</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={abilities().filter((a: any) => {
                    const search = searchAddAbility().toLowerCase();
                    if (!search) return true;
                    return (
                      a.id?.toString().includes(search) ||
                      a.name?.toLowerCase().includes(search) ||
                      a.type?.toLowerCase().includes(search) ||
                      a.category?.toLowerCase().includes(search)
                    );
                  })}>
                    {(ability: any) => (
                      <tr 
                        style={{ 
                          "border-bottom": "1px solid var(--bg-light)",
                          background: selectedAbilityToAdd() === ability.id ? "var(--bg-light)" : "transparent",
                          cursor: "pointer"
                        }}
                        onClick={() => setSelectedAbilityToAdd(ability.id)}
                      >
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>
                          <input 
                            type="radio" 
                            checked={selectedAbilityToAdd() === ability.id}
                            onChange={() => setSelectedAbilityToAdd(ability.id)}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", "text-align": "center", "font-weight": "bold", color: "var(--accent)" }}>{ability.id}</td>
                        <td style={{ padding: "0.5rem" }}>{ability.name}</td>
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.type}</td>
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.category}</td>
                        <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.required_level}</td>
                        <td style={{ padding: "0.5rem", "text-align": "right" }}>{ability.mana_cost || 0}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                type="button" 
                class="button primary" 
                style={{ flex: 1 }}
                onClick={handleConfirmAddAbility}
                disabled={!selectedAbilityToAdd()}
              >
                Add Ability
              </button>
              <button 
                type="button" 
                class="button secondary" 
                style={{ flex: 1 }}
                onClick={() => setShowAddAbilityModal(false)}
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
