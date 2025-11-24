import { createAsync, useParams, redirect, revalidate } from "@solidjs/router";
import { createSignal, Show, For, createEffect, onCleanup, createMemo, on, onMount } from "solid-js";
import { getUser } from "~/lib/auth";
import { getCharacter, getInventory, getAllRegions, getRegion, getCharacterAbilities, getMerchantsInRegion, getDungeonsInRegion, getActiveDungeon, getHotbar, getAbilitiesWithEffects } from "~/lib/game";
import { db, type Mob, type Item, type Region, type NamedMob } from "~/lib/db";
import { CombatEngine } from "~/components/CombatEngine";
import { HealthRegen } from "~/components/HealthRegen";
import { ActiveEffectsDisplay } from "~/components/ActiveEffectsDisplay";
import { HotbarManager } from "~/components/HotbarManager";
import { useCharacter } from "~/lib/CharacterContext";
import { useActiveEffects } from "~/lib/ActiveEffectsContext";

async function getGameData(characterId: number) {
  "use server";
  const user = await getUser();
  if (!user) throw redirect("/");

  const character = await getCharacter(characterId);
  if (!character || character.user_id !== user.id) {
    throw redirect("/character-select");
  }

  const inventory = await getInventory(characterId);
  const regions = await getAllRegions(character.level, characterId);
  const abilities = await getAbilitiesWithEffects(characterId);
  const hotbar = await getHotbar(characterId);
  
  // Ensure character has a current region set (default to 1 if null)
  const regionId = character.current_region ?? 1;
  const currentRegion = await getRegion(regionId);
  const merchants = await getMerchantsInRegion(regionId);
  const dungeons = await getDungeonsInRegion(regionId);
  const activeDungeonProgress = await getActiveDungeon(characterId);
  
  if (!currentRegion) {
    // Fallback to first region if somehow the region doesn't exist
    const fallbackRegion = regions[0];
    return { character, inventory, regions, currentRegion: fallbackRegion, abilities, merchants: [], dungeons: [], activeDungeonProgress: null, hotbar: [] };
  }

  return { character, inventory, regions, currentRegion, abilities, merchants, dungeons, activeDungeonProgress, hotbar };
}

export default function GamePage() {
  const params = useParams();
  const characterId = () => parseInt(params.id);
  const data = createAsync(() => getGameData(characterId()));
  const [store, actions] = useCharacter();
  const [effectsStore, effectsActions] = useActiveEffects();

  const [view, setView] = createSignal<"adventure" | "inventory" | "stats" | "hotbar">("adventure");
  const [availableMobs, setAvailableMobs] = createSignal<Mob[]>([]);
  const [activeMob, setActiveMob] = createSignal<Mob | null>(null);
  const [activeNamedMobId, setActiveNamedMobId] = createSignal<number | null>(null);
  const [combatLog, setCombatLog] = createSignal<string[]>([]);
  const [isRoaming, setIsRoaming] = createSignal(false);
  const [isTraveling, setIsTraveling] = createSignal(false);
  
  // Sticky header state
  const [isScrolled, setIsScrolled] = createSignal(false);
  
  // Combat log auto-scroll state
  let adventureLogRef: HTMLDivElement | undefined;
  const [adventureLogUserScrolledUp, setAdventureLogUserScrolledUp] = createSignal(false);
  
  // Death modal state
  const [showDeathModal, setShowDeathModal] = createSignal(false);
  const [deathData, setDeathData] = createSignal<{expLost: number, goldLost: number} | null>(null);
  
  // Victory modal state
  const [showVictoryModal, setShowVictoryModal] = createSignal(false);
  const [victoryData, setVictoryData] = createSignal<{
    expGained: number;
    goldGained: number;
    loot: Array<{name: string, quantity: number}>;
    levelUp: boolean;
    newLevel?: number;
  } | null>(null);
  
  // Travel modal state
  const [showTravelModal, setShowTravelModal] = createSignal(false);
  
  // Sell confirmation modal state
  const [showSellModal, setShowSellModal] = createSignal(false);
  const [sellItemData, setSellItemData] = createSignal<{
    inventoryItemId: number;
    itemName: string;
    value: number;
    quantity: number;
    maxQuantity: number;
  } | null>(null);
  const [sellQuantity, setSellQuantity] = createSignal(1);
  
  // Drop confirmation modal state
  const [showDropModal, setShowDropModal] = createSignal(false);
  const [dropItemData, setDropItemData] = createSignal<{
    inventoryItemId: number;
    itemName: string;
    quantity: number;
    maxQuantity: number;
  } | null>(null);
  const [dropQuantity, setDropQuantity] = createSignal(1);
  
  // Learn ability modal state
  const [showLearnModal, setShowLearnModal] = createSignal(false);
  const [learnAbilityData, setLearnAbilityData] = createSignal<{
    abilityName: string;
    message: string;
  } | null>(null);
  
  // Active HOTs from combat (for Active Effects display)
  const [combatHots, setCombatHots] = createSignal<any[]>([]);
  
  // Active Thorns from combat (for Active Effects display)
  const [combatThorns, setCombatThorns] = createSignal<any>(null);
  
  // Merchant modal state
  const [showMerchantModal, setShowMerchantModal] = createSignal(false);
  const [activeMerchant, setActiveMerchant] = createSignal<any | null>(null);
  const [merchantInventory, setMerchantInventory] = createSignal<any[]>([]);
  const [merchantDiscountPercent, setMerchantDiscountPercent] = createSignal(0);
  
  // Equipment loading state
  const [isEquipping, setIsEquipping] = createSignal(false);
  
  // Dungeon state
  const [activeDungeon, setActiveDungeon] = createSignal<any | null>(null);
  const [namedMobEncounter, setNamedMobEncounter] = createSignal<NamedMob | null>(null);
  // Derived from dungeonSession - if we have a session, we're in a dungeon
  const isDungeonCombat = () => !!store.dungeonSession;
  
  // Track if we're actively in dungeon flow (to prevent interruption modal between battles)
  const [isInActiveDungeonFlow, setIsInActiveDungeonFlow] = createSignal(false);
  const [dungeonProgress, setDungeonProgress] = createSignal<{current: number, total: number} | null>(null);
  
  // Debug dungeonProgress changes
  createEffect(() => {
    console.log('[DUNGEON PROGRESS] Current value:', dungeonProgress());
  });
  
  // Regional data from context store
  const currentMerchants = () => store.merchants;
  const currentDungeons = () => store.dungeons;
  // Read from CharacterContext (single source of truth)
  const currentCharacter = () => store.character;
  const currentGold = () => store.character?.gold ?? 0;
  
  // Read from CharacterContext (single source of truth)
  const currentRegion = () => store.currentRegion;
  const currentInventory = () => store.inventory;
  const currentAbilities = () => store.abilities;
  const currentHotbar = () => store.hotbar;
  
  // Initialize CharacterContext from server data
  createEffect(() => {
    const gameData = data();
    if (gameData) {
      console.log('[DATA] Server data updated - initializing CharacterContext', {
        hasActiveDungeon: !!gameData.activeDungeonProgress,
        currentIsDungeonCombat: isDungeonCombat()
      });
      
      // Preserve current health/mana if we already have a character
      const existingChar = store.character;
      const character = { ...gameData.character };
      
      // Always preserve health/mana if we have existing values (client-side regen is authoritative)
      // The server only updates HP/mana when we explicitly sync via syncHealthToServer
      // Also preserve exp, level, gold, and available_points if we have newer values from combat
      if (existingChar) {
        character.current_health = existingChar.current_health;
        character.current_mana = existingChar.current_mana;
        
        // Preserve combat-updated stats if they're newer (higher values)
        // This prevents stale cached route data from overwriting fresh combat results
        if (existingChar.experience > gameData.character.experience) {
          character.experience = existingChar.experience;
        }
        if (existingChar.level > gameData.character.level) {
          character.level = existingChar.level;
        }
        if (existingChar.gold > gameData.character.gold) {
          character.gold = existingChar.gold;
        }
        if (existingChar.available_points > gameData.character.available_points) {
          character.available_points = existingChar.available_points;
        }
      }
      
      // Initialize ALL CharacterContext data from server
      actions.setCharacter(character);
      actions.setInventory(gameData.inventory);
      actions.setAbilities(gameData.abilities);
      actions.setHotbar(gameData.hotbar || []);
      actions.setRegions(gameData.regions);
      actions.setCurrentRegion(gameData.currentRegion);
      actions.setMerchants(gameData.merchants || []);
      actions.setDungeons(gameData.dungeons || []);
      
      // Set active dungeon if there is one
      if (gameData.activeDungeonProgress) {
        setActiveDungeon(gameData.activeDungeonProgress);
        
        // Set dungeon session in CharacterContext (source of truth for HP/mana)
        actions.setDungeonSession({
          id: gameData.activeDungeonProgress.id,
          dungeon_id: gameData.activeDungeonProgress.dungeon_id,
          current_encounter: gameData.activeDungeonProgress.current_encounter,
          total_encounters: gameData.activeDungeonProgress.total_encounters,
          session_health: gameData.activeDungeonProgress.session_health,
          session_mana: gameData.activeDungeonProgress.session_mana,
          boss_mob_id: gameData.activeDungeonProgress.boss_mob_id,
          dungeon_name: gameData.activeDungeonProgress.dungeon_name
        });
        
        // Set dungeon progress for UI
        if (gameData.activeDungeonProgress.total_encounters) {
          setDungeonProgress({
            current: gameData.activeDungeonProgress.current_encounter,
            total: gameData.activeDungeonProgress.total_encounters
          });
        }
      } else if (!activeMob()) {
        // Only clear dungeon state when NOT in active combat
        // This prevents race conditions when data refetches during dungeon combat
        setActiveDungeon(null);
        // Only clear session if server says no active dungeon (handles abandon case)
        if (!gameData.activeDungeonProgress) {
          actions.setDungeonSession(null);
        }
      }
      
      console.log('[DATA] CharacterContext initialized:', {
        character: gameData.character.name,
        health: gameData.character.current_health,
        mana: gameData.character.current_mana,
        inventory: gameData.inventory.length,
        abilities: gameData.abilities.length
      });
    }
  });
  
  // Read health/mana from CharacterContext
  // When in dungeon, use dungeon session as source of truth
  const currentHealth = () => {
    if (store.dungeonSession) {
      return store.dungeonSession.session_health;
    }
    return store.character?.current_health ?? 0;
  };
  
  const currentMana = () => {
    if (store.dungeonSession) {
      return store.dungeonSession.session_mana;
    }
    return store.character?.current_mana ?? 0;
  };
  
  // Legacy no-op functions (to be removed - all updates should use actions directly)
  const setOptimisticHealth = (health: number) => actions.updateHealth(health, currentMana());
  const setOptimisticMana = (mana: number) => actions.updateHealth(currentHealth(), mana);
  const setOptimisticGold = (gold: number) => actions.updateGold(gold);
  const setOptimisticInventory = (inventory: any[] | null) => {
    if (inventory) actions.setInventory(inventory);
  };
  
  // Server sync: Automatically sync CharacterContext changes to server with debouncing
  let lastSyncedHealthValue = 0;
  let lastSyncedManaValue = 0;
  const [syncTimer, setSyncTimer] = createSignal<number | null>(null);
  let isSyncing = false;

  // Watch for health/mana changes and sync to server with debouncing
  // Use on() to explicitly track only these values
  createEffect(on(
    () => [store.character?.current_health, store.character?.current_mana] as const,
    ([health, mana]) => {
      // Prevent recursion during sync
      if (isSyncing) return;
      
      // Skip if undefined
      if (health === undefined || mana === undefined) return;
      
      // Skip if values haven't changed
      if (health === lastSyncedHealthValue && mana === lastSyncedManaValue) return;
      
      // Skip initial load
      if (lastSyncedHealthValue === 0 && lastSyncedManaValue === 0) {
        lastSyncedHealthValue = health;
        lastSyncedManaValue = mana;
        return;
      }
      
      // Clear existing timer
      const timer = syncTimer();
      if (timer) clearTimeout(timer);
      
      // Debounce: sync after 2 seconds of no changes
      const newTimer = window.setTimeout(() => {
        syncHealthToServer(health, mana);
      }, 2000);
      
      setSyncTimer(newTimer);
    },
    { defer: true }
  ));

  // Stat assignment
  const [assigningStats, setAssigningStats] = createSignal(false);
  const [pendingStats, setPendingStats] = createSignal<Record<string, number>>({});


  
  const refetchData = async () => {
    console.log('[REFETCH] Refetching game data...', new Error().stack);
    // Force a fresh fetch by revalidating all keys
    // This will refetch the game data with the current characterId
    revalidate();
    // Small delay to ensure refetch happens
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const equippedWeapon = () => {
    return data()?.inventory.find((i: any) => i.slot === 'weapon' && i.equipped);
  };

  const equippedArmor = () => {
    // Return all equipped armor pieces as an array
    return data()?.inventory.filter((i: any) => i.equipped && i.armor > 0) || [];
  };

  // Calculate equipment bonuses
  const equipmentBonuses = createMemo(() => {
    const equipped = currentInventory().filter((i: any) => i.equipped === 1);
    const bonuses = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };

    equipped.forEach((item: any) => {
      if (item.strength_bonus) bonuses.strength += item.strength_bonus;
      if (item.dexterity_bonus) bonuses.dexterity += item.dexterity_bonus;
      if (item.constitution_bonus) bonuses.constitution += item.constitution_bonus;
      if (item.intelligence_bonus) bonuses.intelligence += item.intelligence_bonus;
      if (item.wisdom_bonus) bonuses.wisdom += item.wisdom_bonus;
      if (item.charisma_bonus) bonuses.charisma += item.charisma_bonus;
    });

    return bonuses;
  });

  // Convert hotbar to combat-ready hotbar actions
  const hotbarActions = createMemo(() => {
    const hotbar = currentHotbar();
    const abilities = currentAbilities();
    const inventory = currentInventory();
    
    return hotbar
      .filter((slot: any) => slot.type) // Only include assigned slots
      .map((slot: any) => {
        if (slot.type === 'ability' && slot.ability_id) {
          const ability = abilities.find((a: any) => a.ability_id === slot.ability_id || a.id === slot.ability_id);
          
          // Only log if ability is missing effects
          if (ability && (!ability.effects || ability.effects.length === 0)) {
            console.warn('[hotbarActions] Ability missing effects:', ability.name, ability);
          }
          
          return {
            slot: slot.slot,
            type: 'ability' as const,
            ability: ability || null,
          };
        } else if (slot.type === 'consumable' && slot.item_id) {
          const item = inventory.find((i: any) => i.item_id === slot.item_id);
          return {
            slot: slot.slot,
            type: 'consumable' as const,
            item: item ? {
              id: item.id,
              name: item.name,
              health_restore: item.health_restore || 0,
              mana_restore: item.mana_restore || 0,
              quantity: item.quantity || 0,
            } : null,
          };
        }
        return null;
      })
      .filter((action: any) => action && (action.ability || action.item)) as any[];
  });

  // Calculate total stats including equipment
  const totalStats = createMemo(() => {
    const char = currentCharacter();
    const bonuses = equipmentBonuses();
    
    // Return default values if character or bonuses not loaded yet
    if (!char || !bonuses) {
      return {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      };
    }
    
    // Include active effect bonuses
    const conBonus = effectsActions.getTotalStatBonus('constitution');
    const strBonus = effectsActions.getTotalStatBonus('strength');
    const dexBonus = effectsActions.getTotalStatBonus('dexterity');
    const intBonus = effectsActions.getTotalStatBonus('intelligence');
    const wisBonus = effectsActions.getTotalStatBonus('wisdom');
    const chaBonus = effectsActions.getTotalStatBonus('charisma');
    
    return {
      strength: char.strength + bonuses.strength + strBonus,
      dexterity: char.dexterity + bonuses.dexterity + dexBonus,
      constitution: char.constitution + bonuses.constitution + conBonus,
      intelligence: char.intelligence + bonuses.intelligence + intBonus,
      wisdom: char.wisdom + bonuses.wisdom + wisBonus,
      charisma: char.charisma + bonuses.charisma + chaBonus,
    };
  });

  // Calculate max health and mana with equipment bonuses
  const currentMaxHealth = createMemo(() => {
    const char = currentCharacter();
    const stats = totalStats();
    if (!char) return 100;
    
    // New formula: Base + (Level × 20) + (CON - 10) × 8
    // This scales health with both level progression and constitution
    // Example: Level 15, 33 CON = 100 + 300 + 184 = 584 HP
    const baseHealth = 100;
    const levelBonus = char.level * 20;
    const constitutionBonus = (stats.constitution - 10) * 8;
    
    return baseHealth + levelBonus + constitutionBonus;
  });

  const currentMaxMana = createMemo(() => {
    const char = currentCharacter();
    const stats = totalStats();
    if (!char) return 100;
    
    // New formula: Base + (Level × 20) + (INT - 10) × 5
    // This scales mana aggressively with level progression and intelligence (same rate as health)
    // Example: Level 8, 31 INT = 100 + 160 + 105 = 365 Mana
    const baseMana = 100;
    const levelBonus = char.level * 20;
    const intelligenceBonus = (stats.intelligence - 10) * 5;
    
    return baseMana + levelBonus + intelligenceBonus;
  });

  // Track previous constitution bonus to detect changes (outside combat)
  const [prevConBonusOutsideCombat, setPrevConBonusOutsideCombat] = createSignal(0);
  
  // Watch for constitution buff changes outside combat and adjust health accordingly
  createEffect(() => {
    // Only run this effect when NOT in combat (CombatEngine handles in-combat changes)
    if (activeMob()) return;
    
    const currentConBonus = effectsActions.getTotalStatBonus('constitution');
    const previousBonus = prevConBonusOutsideCombat();
    
    // Initialize on first run
    if (previousBonus === 0 && currentConBonus === 0 && effectsStore.effects.length === 0) {
      setPrevConBonusOutsideCombat(0);
      return;
    }
    
    if (currentConBonus !== previousBonus) {
      const bonusChange = currentConBonus - previousBonus;
      const healthChange = bonusChange * 5; // Each point of CON = 5 HP
      
      const currentH = currentHealth();
      const newMaxHealth = currentMaxHealth();
      let newHealth = currentH;
      
      if (bonusChange > 0) {
        // Buff added: increase current health by the same amount
        newHealth = currentH + healthChange;
        console.log('[BUFF OUT] Constitution increased by', bonusChange, '-> Health increased by', healthChange, `(${currentH} -> ${newHealth})`);
      } else if (bonusChange < 0) {
        // Buff expired: cap health at new max if it exceeds
        newHealth = Math.min(currentH, newMaxHealth);
        console.log('[BUFF OUT] Constitution decreased by', Math.abs(bonusChange), '-> Health capped at', newMaxHealth, `(${currentH} -> ${newHealth})`);
      }
      
      // Update health state
      setOptimisticHealth(newHealth);
      
      // Sync to server
      syncHealthToServer(newHealth, currentMana());
      
      setPrevConBonusOutsideCombat(currentConBonus);
    }
  });

  const handleTravel = async (regionId: number) => {
    setIsTraveling(true);
    try {
      const response = await fetch('/api/game/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), regionId }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to travel');
      }
      
      console.log('[TRAVEL] Traveled to:', result.region.name);
      
      // Preserve current health/mana (don't let server overwrite regen progress)
      const currentHP = currentHealth();
      const currentMP = currentMana();
      
      // Update CharacterContext immediately
      if (result.character) {
        // Preserve the current health/mana values
        result.character.current_health = currentHP;
        result.character.current_mana = currentMP;
        actions.setCharacter(result.character);
      }
      
      // Update current region immediately
      if (result.region) {
        actions.setCurrentRegion(result.region);
      }
      
      // Update regions list if provided (in case one was unlocked)
      if (result.regions) {
        actions.setRegions(result.regions);
      }
      
      // Clear any active encounters
      setAvailableMobs([]);
      setCombatLog([]);
      setNamedMobEncounter(null);
      
      // Close travel modal
      setShowTravelModal(false);
      
      // Refetch in background to sync (health/mana already preserved above)
      await refetchData();
      
      // Manually fetch merchants and dungeons for the new region
      const gameData = await getGameData(characterId());
      if (gameData) {
        actions.setMerchants(gameData.merchants || []);
        actions.setDungeons(gameData.dungeons || []);
      }
    } catch (error: any) {
      alert(error.message);
      console.error('Travel error:', error);
    }
    setIsTraveling(false);
  };

  const handleRoam = async () => {
    setIsRoaming(true);
    setCombatLog([]);
    setAvailableMobs([]);
    try {
      const response = await fetch('/api/game/roam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId() }),
      });

      const result = await response.json();
      
      // Check if a named mob spawned
      if (result.namedMob) {
        setNamedMobEncounter(result.namedMob);
        const title = result.namedMob.title ? ` ${result.namedMob.title}` : '';
        setCombatLog([
          ...combatLog(),
          `⚠️ A legendary creature appears: ${result.namedMob.name}${title}!`,
          `The creature watches you but does not attack...`
        ]);
      } else {
        setNamedMobEncounter(null);
      }
      
      if (result.initiated && result.aggroMob) {
        setCombatLog([`A wild ${result.aggroMob.name} appears and attacks!`]);
        setActiveMob(result.aggroMob);
      } else {
        setAvailableMobs(result.mobs || []);
        const mobCount = result.mobs?.length || 0;
        if (mobCount === 1) {
          setCombatLog([`You encounter a ${result.mobs[0].name} in the area.`]);
        } else if (mobCount > 1) {
          setCombatLog([`You encounter ${mobCount} creatures in the area.`]);
        }
      }
    } catch (error: any) {
      setCombatLog([`Error: ${error.message}`]);
    }
    setIsRoaming(false);
  };

  const handleStartCombat = async (mob: Mob) => {
    // Sync current health to DB before entering combat
    const currentH = currentHealth();
    const currentM = currentMana();
    
    if (currentH !== data()?.character.current_health || currentM !== data()?.character.current_mana) {
      await syncHealthToServer(currentH, currentM);
    }
    
    setAvailableMobs([]);
    setActiveMob(mob);
    // Initialize optimistic health with current values
    setOptimisticHealth(currentH);
    setOptimisticMana(currentM);
  };

  const handleHealthChange = (health: number, mana: number) => {
    console.log('[HEALTH CHANGE]', { health, mana, inDungeon: !!store.dungeonSession });
    // If in dungeon, update dungeon session; otherwise update character
    if (store.dungeonSession) {
      actions.updateDungeonHealth(health, mana);
    } else {
      actions.updateHealth(health, mana);
    }
    // Sync will happen automatically via the createEffect watching currentHealth/currentMana
  };

  const handleRegenTick = (health: number, mana: number) => {
    // If in dungeon, update dungeon session; otherwise update character
    if (store.dungeonSession) {
      actions.updateDungeonHealth(health, mana);
    } else {
      actions.updateHealth(health, mana);
    }
    // Sync will happen automatically via the createEffect with debouncing
  };

  const syncHealthToServer = async (health: number, mana: number) => {
    try {
      isSyncing = true;
      await fetch('/api/game/update-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), health, mana }),
      });
      // Track what we just synced to avoid sync loops
      lastSyncedHealthValue = health;
      lastSyncedManaValue = mana;
    } catch (error) {
      console.error('Failed to sync health:', error);
    } finally {
      isSyncing = false;
    }
  };

  // Sync on component unmount if there are pending changes
  onCleanup(() => {
    const timer = syncTimer();
    if (timer) {
      clearTimeout(timer);
      // Sync immediately on unmount
      const health = currentHealth();
      const mana = currentMana();
      if (health !== lastSyncedHealthValue || mana !== lastSyncedManaValue) {
        const data = JSON.stringify({ characterId: characterId(), health, mana });
        navigator.sendBeacon('/api/game/update-health', data);
      }
    }
  });

  const handleCombatEnd = async (result: 'victory' | 'defeat', finalState: any) => {
    try {
      const response = await fetch('/api/game/finish-combat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: characterId(),
          mobId: activeNamedMobId() ? undefined : activeMob()?.id,
          namedMobId: activeNamedMobId(),
          result,
          finalHealth: finalState.characterHealth,
          finalMana: currentMana(),
        }),
      });

      const responseData = await response.json();

      // Clear any pending sync timers FIRST
      const timer = syncTimer();
      if (timer) {
        clearTimeout(timer);
        setSyncTimer(null);
      }

      // Update CharacterContext with values from server response
      if (responseData.character) {
        console.log('[COMBAT END] Updating CharacterContext:', {
          exp: responseData.character.experience,
          level: responseData.character.level,
          gold: responseData.character.gold,
          health: responseData.character.current_health,
          mana: responseData.character.current_mana,
          isDungeon: !!store.dungeonSession
        });
        // Update character in store (but not HP/mana if in dungeon - use session instead)
        actions.setCharacter(responseData.character);
        
        // If in dungeon, update session HP/mana from combat result
        if (store.dungeonSession) {
          actions.updateDungeonHealth(finalState.characterHealth, currentMana());
          console.log('[COMBAT END] Updated dungeon session HP/mana:', finalState.characterHealth, currentMana());
        }
      }

      if (responseData.result === 'victory') {
        // Keep the combat log visible in background
        setCombatLog([...finalState.log, `Victory! You defeated ${activeMob()?.name}!`]);
        
        // Wait a moment before clearing combat
        setTimeout(() => {
          setActiveMob(null);
          setActiveNamedMobId(null);
          setCombatHots([]); // Clear HOTs when combat ends
          setCombatThorns(null); // Clear Thorns when combat ends
        }, 100);

        // Update inventory in CharacterContext from server response
        if (responseData.inventory) {
          console.log('[COMBAT END] Updating inventory with', responseData.inventory.length, 'items');
          actions.setInventory(responseData.inventory);
        } else {
          console.log('[COMBAT END] WARNING: No inventory in response!');
        }

        // No need to refetch - we already have fresh data from finish-combat response
        // Refetching would pull stale cached data that overwrites our correct values
        setTimeout(() => {
          // Show victory modal with rewards
          setVictoryData({
            expGained: responseData.expGained,
            goldGained: responseData.goldGained,
            loot: responseData.loot || [],
            levelUp: responseData.levelUp,
            newLevel: responseData.newLevel
          });
          setShowVictoryModal(true);
        }, 200);
      } else if (responseData.result === 'defeat') {
        // Keep the combat log visible in background
        setCombatLog([...finalState.log, 'You have been defeated...']);
        
        // Wait a moment before clearing combat
        setTimeout(() => {
          setActiveMob(null);
          setActiveNamedMobId(null);
          setCombatHots([]); // Clear HOTs when combat ends
          setCombatThorns(null); // Clear Thorns when combat ends
        }, 100);

        // Update inventory optimistically from server response
        if (responseData.inventory) {
          setOptimisticInventory(responseData.inventory);
        }

        // Refetch data in background to ensure everything is synced
        setTimeout(async () => {
          await refetchData();
          
          // Don't clear optimistic states - let them persist until next update
          // The refetch will update data() and the memos will use whichever is newer
          
          // Show death modal with exact losses
          setDeathData({
            expLost: responseData.expLost,
            goldLost: responseData.goldLost
          });
          setShowDeathModal(true);
        }, 200);
      }
    } catch (error: any) {
      console.error('Combat end error:', error);
    }
  };



  const handleUseItem = async (inventoryItemId: number, itemName: string, healthRestore: number, manaRestore: number) => {
    try {
      console.log('[USE ITEM] Using:', itemName);
      
      // Optimistic update - restore health/mana immediately in CharacterContext
      const currentH = currentHealth();
      const currentM = currentMana();
      
      const newHealth = Math.min(currentMaxHealth(), currentH + healthRestore);
      const newMana = Math.min(currentMaxMana(), currentM + manaRestore);
      
      actions.updateHealth(newHealth, newMana);
      
      // Optimistically update inventory
      const currentInv = currentInventory();
      const newInventory = currentInv.map((i: any) => {
        if (i.id === inventoryItemId) {
          if (i.quantity > 1) {
            return { ...i, quantity: i.quantity - 1 };
          }
          return null; // Will be filtered out
        }
        return i;
      }).filter(Boolean) as any[];
      
      actions.setInventory(newInventory);
      
      const response = await fetch('/api/game/use-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), inventoryItemId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to use item');
      }
      
      const result = await response.json();
      
      console.log('[USE ITEM] Restored', result.healthRestored, 'HP and', result.manaRestored, 'mana');
      
      // Use server-confirmed data
      actions.setInventory(result.inventory);
      actions.updateHealth(result.character.current_health, result.character.current_mana);
      
    } catch (error: any) {
      console.error('[USE ITEM] Error:', error);
      alert('Failed to use item: ' + error.message);
      // Revert by refetching from server
      const gameData = await getGameData(characterId());
      actions.setCharacter(gameData.character);
      actions.setInventory(gameData.inventory);
    }
  };

  const handleLearnAbility = async (inventoryItemId: number, itemName: string) => {
    try {
      console.log('[LEARN ABILITY] Learning from:', itemName);
      
      // Optimistically remove scroll from inventory (use current inventory)
      const baseInventory = currentInventory();
      const newInventory = baseInventory.filter((i: any) => i.id !== inventoryItemId);
      setOptimisticInventory(newInventory);
      
      const response = await fetch('/api/game/learn-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), inventoryItemId }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to learn ability');
      }
      
      const result = await response.json();
      
      console.log('[LEARN ABILITY] Learned:', result.ability.name);
      
      // Use server-confirmed inventory data immediately
      setOptimisticInventory(result.inventory);
      actions.setInventory(result.inventory);
      
      // Add the newly learned ability directly to context
      actions.addAbility({
        ...result.ability,
        last_used_at: 0,
      });
      
      console.log('[LEARN ABILITY] Ability added to context');
      
      // Show success modal
      setLearnAbilityData({
        abilityName: result.ability.name,
        message: result.message
      });
      setShowLearnModal(true);
      
    } catch (error: any) {
      console.error('[LEARN ABILITY] Error:', error);
      // Show error modal
      setLearnAbilityData({
        abilityName: 'Error',
        message: error.message
      });
      setShowLearnModal(true);
      // Revert optimistic updates
      setOptimisticInventory(null);
    }
  };

  const handleSellClick = (inventoryItemId: number, itemName: string, value: number, quantity: number) => {
    setSellItemData({ inventoryItemId, itemName, value, quantity, maxQuantity: quantity });
    setSellQuantity(quantity); // Default to selling all
    setShowSellModal(true);
  };
  
  const handleDropClick = (inventoryItemId: number, itemName: string, quantity: number) => {
    setDropItemData({ inventoryItemId, itemName, quantity, maxQuantity: quantity });
    setDropQuantity(quantity); // Default to dropping all
    setShowDropModal(true);
  };

  const handleSellConfirm = async () => {
    const sellData = sellItemData();
    if (!sellData) return;
    
    const quantityToSell = sellQuantity();
    setShowSellModal(false);
    
    try {
      console.log('[SELL] Selling item:', sellData.itemName, 'quantity:', quantityToSell);
      
      // Use CURRENT inventory (optimistic if available, otherwise server)
      const baseInventory = currentInventory();
      const newInventory = baseInventory
        .map((i: any) => {
          if (i.id === sellData.inventoryItemId) {
            const remainingQty = i.quantity - quantityToSell;
            if (remainingQty <= 0) return null; // Will be filtered out
            return { ...i, quantity: remainingQty };
          }
          return i;
        })
        .filter(Boolean); // Remove nulls
      setOptimisticInventory(newInventory);
      
      // Use CURRENT gold (optimistic if available, otherwise server)
      const goldGained = sellData.value * quantityToSell;
      setOptimisticGold(currentGold() + goldGained);
      
      const response = await fetch('/api/game/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId: sellData.inventoryItemId, 
          quantity: quantityToSell 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sell item');
      }
      
      const result = await response.json();
      
      console.log('[SELL] Sold for', result.goldGained, 'gold. Server returned', result.inventory.length, 'items');
      
      // Update CharacterContext with server-confirmed data
      actions.setCharacter(result.character);
      actions.setInventory(result.inventory);
      
      setSellItemData(null);
      setSellQuantity(1);
      
      // Don't clear optimistic states - they persist until next update
      
    } catch (error: any) {
      console.error('[SELL] Error:', error);
      alert('Failed to sell item: ' + error.message);
      setOptimisticInventory(null);
      setOptimisticGold(null);
    }
  };
  
  const handleDropConfirm = async () => {
    const dropData = dropItemData();
    if (!dropData) return;
    
    const quantityToDrop = dropQuantity();
    setShowDropModal(false);
    
    try {
      console.log('[DROP] Dropping item:', dropData.itemName, 'quantity:', quantityToDrop);
      
      // Optimistically update inventory
      const baseInventory = currentInventory();
      const newInventory = baseInventory
        .map((i: any) => {
          if (i.id === dropData.inventoryItemId) {
            const remainingQty = i.quantity - quantityToDrop;
            if (remainingQty <= 0) return null; // Will be filtered out
            return { ...i, quantity: remainingQty };
          }
          return i;
        })
        .filter(Boolean); // Remove nulls
      setOptimisticInventory(newInventory);
      
      const response = await fetch('/api/game/drop-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          inventoryItemId: dropData.inventoryItemId, 
          quantity: quantityToDrop 
        }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to drop item');
      }
      
      const result = await response.json();
      
      console.log('[DROP] Dropped', quantityToDrop, 'x', dropData.itemName);
      
      // Use server-confirmed inventory
      setOptimisticInventory(result.inventory);
      
      setDropItemData(null);
      setDropQuantity(1);
      
    } catch (error: any) {
      console.error('[DROP] Error:', error);
      alert('Failed to drop item: ' + error.message);
      setOptimisticInventory(null);
    }
  };

  const handleEquip = async (inventoryItemId: number, equipped: boolean) => {
    // Prevent multiple simultaneous equips
    if (isEquipping()) {
      console.log('[EQUIP] Already equipping, ignoring');
      return;
    }
    
    setIsEquipping(true);
    
    try {
      // Use CURRENT inventory (optimistic if available, otherwise server)
      const baseInventory = currentInventory();
      const item = baseInventory.find((i: any) => i.id === inventoryItemId);
      
      if (!item) {
        console.log('[EQUIP] Item not found:', inventoryItemId);
        setIsEquipping(false);
        return;
      }
      
      console.log('[EQUIP] Starting equip for:', item.name, 'Currently equipped:', equipped);
      
      // Create new optimistic state
      const newInventory = baseInventory.map((invItem: any) => {
        // If this is the item being toggled
        if (invItem.id === inventoryItemId) {
          const newEquipped = equipped ? 0 : 1;
          console.log('[EQUIP] Toggling item:', invItem.name, 'from', invItem.equipped, 'to', newEquipped);
          return { ...invItem, equipped: newEquipped };
        }
        // If equipping a new item, unequip any item in the same slot
        if (!equipped && invItem.slot === item.slot && invItem.equipped === 1) {
          console.log('[EQUIP] Auto-unequipping:', invItem.name, 'from slot:', item.slot);
          return { ...invItem, equipped: 0 };
        }
        return invItem;
      });
      
      console.log('[EQUIP] Setting optimistic inventory, total items:', newInventory.length);
      
      // Set optimistic state immediately
      setOptimisticInventory(newInventory);
      
      // Make API call
      const response = await fetch('/api/game/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), inventoryItemId, equipped }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to equip item');
      }
      
      const result = await response.json();
      
      console.log('[EQUIP] API returned updated inventory with', result.inventory.length, 'items');
      console.log('[EQUIP] Server confirms equipped:', result.inventory.filter((i: any) => i.equipped).map((i: any) => i.name));
      
      // Use the server's confirmed inventory data
      // Keep it as optimistic until next full refetch
      setOptimisticInventory(result.inventory);
      
      setIsEquipping(false);
      
      console.log('[EQUIP] Complete - using server-confirmed inventory');
      
      // Don't clear optimistic state - it persists until next update
      
    } catch (error: any) {
      console.error('[EQUIP] Error:', error);
      // Revert optimistic update on error
      setOptimisticInventory(null);
      setIsEquipping(false);
    }
  };

  const handleAssignStats = async () => {
    const stats = pendingStats();
    if (Object.keys(stats).length === 0) return;

    setAssigningStats(true);
    try {
      const character = data()?.character;
      if (!character) return;
      
      // Optimistically update character stats in store
      const updatedStats: any = { ...character };
      Object.entries(stats).forEach(([stat, value]) => {
        updatedStats[stat] = character[stat] + value;
      });
      
      updatedStats.available_points = character.available_points - totalPendingPoints();
      
      // Recalculate derived stats if constitution or intelligence changed
      if (stats.constitution) {
        // Calculate total constitution including equipment and buffs
        const equipBonuses = equipmentBonuses();
        const effectBonus = effectsActions.getTotalStatBonus('constitution');
        const totalConstitution = updatedStats.constitution + equipBonuses.constitution + effectBonus;
        
        // Calculate new max health with all bonuses using new formula
        const baseHealth = 100;
        const levelBonus = updatedStats.level * 20;
        const constitutionBonus = (totalConstitution - 10) * 8;
        updatedStats.max_health = baseHealth + levelBonus + constitutionBonus;
        
        // Update current health proportionally
        const healthPercent = character.current_health / character.max_health;
        updatedStats.current_health = Math.ceil(updatedStats.max_health * healthPercent);
      }
      
      if (stats.intelligence) {
        // Calculate total intelligence including equipment and buffs
        const equipBonuses = equipmentBonuses();
        const effectBonus = effectsActions.getTotalStatBonus('intelligence');
        const totalIntelligence = updatedStats.intelligence + equipBonuses.intelligence + effectBonus;
        
        // Calculate new max mana with all bonuses using new formula
        // Mana: Base + (Level × 10) + (INT - 10) × 5
        const baseMana = 50;
        const levelBonus = updatedStats.level * 10;
        const intelligenceBonus = (totalIntelligence - 10) * 5;
        updatedStats.max_mana = baseMana + levelBonus + intelligenceBonus;
        
        // Update current mana proportionally
        const manaPercent = character.current_mana / character.max_mana;
        updatedStats.current_mana = Math.ceil(updatedStats.max_mana * manaPercent);
      }
      
      // Update CharacterContext optimistically
      actions.setCharacter(updatedStats);
      setPendingStats({});
      
      const response = await fetch('/api/game/assign-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), stats }),
      });
      
      const result = await response.json();
      
      // Preserve current health/mana (don't let server overwrite regen progress)
      const currentHP = currentHealth();
      const currentMP = currentMana();
      
      // Use server-confirmed data
      if (result.character) {
        console.log('[ASSIGN STATS] Server returned character with available_points:', result.character.available_points);
        // Preserve the current health/mana values
        result.character.current_health = currentHP;
        result.character.current_mana = currentMP;
        actions.setCharacter(result.character);
      }
      
      // Don't refetch - we already have the updated character from the server response
      // Refetching might get stale cached data
      
    } catch (error: any) {
      console.error('Assign stats error:', error);
      // Revert on error by refetching
      await refetchData();
      setPendingStats({});
    } finally {
      setAssigningStats(false);
    }
  };

  const adjustPendingStat = (stat: string, amount: number) => {
    console.log('[STAT ADJUST] Adjusting', stat, 'by', amount);
    const current = pendingStats()[stat] || 0;
    const newValue = current + amount;
    
    console.log('[STAT ADJUST] Current:', current, 'New:', newValue);
    
    if (newValue < 0) return; // Can't reduce below 0
    
    const newStats = { ...pendingStats(), [stat]: newValue };
    console.log('[STAT ADJUST] New pendingStats:', newStats);
    setPendingStats(newStats);
  };

  const totalPendingPoints = () => {
    return Object.values(pendingStats()).reduce((sum, val) => sum + val, 0);
  };

  const availablePoints = () => {
    return (currentCharacter()?.available_points || 0) - totalPendingPoints();
  };

  // Helper to check if requirements are met (uses BASE stats)
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

  // Helper to format requirements
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

  const handleOpenMerchant = async (merchant: any) => {
    setActiveMerchant(merchant);
    try {
      const response = await fetch(`/api/game/merchant-inventory?merchantId=${merchant.id}&characterId=${characterId()}`);
      if (!response.ok) {
        throw new Error('Failed to load merchant inventory');
      }
      const result = await response.json();
      setMerchantInventory(result.inventory);
      setMerchantDiscountPercent(result.discountPercent || 0);
      setShowMerchantModal(true);
    } catch (error: any) {
      console.error('[MERCHANT] Error loading inventory:', error);
      alert('Failed to load merchant inventory');
    }
  };

  const handleBuyItem = async (itemId: number, itemName: string, price: number) => {
    const merchant = activeMerchant();
    if (!merchant) return;

    if (currentGold() < price) {
      alert(`Not enough gold! Need ${price}g, have ${currentGold()}g`);
      return;
    }

    try {
      console.log('[BUY] Purchasing:', itemName, 'for', price, 'gold');

      // Optimistically update gold
      setOptimisticGold(currentGold() - price);

      const response = await fetch('/api/game/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: characterId(),
          merchantId: merchant.id,
          itemId,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to purchase item');
      }

      const result = await response.json();

      console.log('[BUY] Purchased:', result.itemName, 'for', result.price, 'gold');

      // Use server-confirmed inventory and gold
      setOptimisticInventory(result.inventory);
      setOptimisticGold(result.character.gold);

      // Reload merchant inventory to update stock and prices
      const inventoryResponse = await fetch(`/api/game/merchant-inventory?merchantId=${merchant.id}&characterId=${characterId()}`);
      if (inventoryResponse.ok) {
        const inventoryResult = await inventoryResponse.json();
        setMerchantInventory(inventoryResult.inventory);
      }

    } catch (error: any) {
      console.error('[BUY] Error:', error);
      alert('Failed to purchase item: ' + error.message);
      setOptimisticGold(null);
    }
  };

  // Dungeon handlers
  const handleStartDungeon = async (dungeonId: number) => {
    try {
      setCombatLog(['Entering the dungeon...']);
      
      const response = await fetch('/api/game/start-dungeon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId(), dungeonId }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      console.log('[DUNGEON START] Result:', result);

      // Mark as actively in dungeon flow
      setIsInActiveDungeonFlow(true);
      
      // Set dungeon progress
      if (result.dungeonProgress) {
        setActiveDungeon(result.dungeonProgress);
        
        // Set dungeon session in CharacterContext
        actions.setDungeonSession({
          id: result.dungeonProgress.id,
          dungeon_id: result.dungeonProgress.dungeon_id,
          current_encounter: result.dungeonProgress.current_encounter || 1,
          total_encounters: result.encounterProgress?.total || 0,
          session_health: result.dungeonProgress.session_health || currentHealth(),
          session_mana: result.dungeonProgress.session_mana || currentMana(),
          boss_mob_id: result.dungeonProgress.boss_mob_id || result.dungeon?.boss_mob_id,
          dungeon_name: result.dungeon?.name || 'Unknown Dungeon'
        });
      }
      
      // Set encounter progress for UI
      if (result.encounterProgress) {
        console.log('[DUNGEON] Setting encounter progress:', result.encounterProgress);
        setDungeonProgress(result.encounterProgress);
      } else {
        console.log('[DUNGEON] No encounterProgress in result');
      }
      
      // Set active mob from result
      if (result.mob) {
        setActiveMob(result.mob);
        const dungeonName = result.dungeon?.name || 'the dungeon';
        if (result.isBoss && result.namedMob) {
          setActiveNamedMobId(result.namedMob.id); // Track named mob ID for boss loot
          const title = result.namedMob?.title ? ` ${result.namedMob.title}` : '';
          setCombatLog([`Entered ${dungeonName}!`, `You face the boss: ${result.mob.name}${title}!`]);
        } else {
          setActiveNamedMobId(null); // Regular dungeon mob
          setCombatLog([`Entered ${dungeonName}!`, `${result.mob.name} attacks!`]);
        }
      }
    } catch (error: any) {
      console.error('Start dungeon error:', error);
      alert('Failed to start dungeon: ' + error.message);
    }
  };

  const handleAdvanceDungeon = async () => {
    try {
      // Get current health/mana to save in dungeon session
      const currentH = currentHealth();
      const currentM = currentMana();
      
      const response = await fetch('/api/game/advance-dungeon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(),
          currentHealth: currentH,
          currentMana: currentM
        }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      console.log('[DUNGEON ADVANCE] Result:', result);

      if (result.completed) {
        // Dungeon complete!
        setActiveDungeon(null);
        actions.setDungeonSession(null);
        setDungeonProgress(null);
        setIsInActiveDungeonFlow(false);
        setCombatLog([...combatLog(), '🎉 Dungeon completed! The boss has been defeated!']);
        await refetchData();
        return { completed: true };
      } else {
        // Start next encounter immediately
        if (result.combat && result.mob) {
          console.log('[DUNGEON ADVANCE] Starting next encounter:', result.mob.name);
          setActiveMob(result.mob);
          
          // Update dungeon session encounter count
          if (store.dungeonSession && result.progress) {
            actions.setDungeonSession({
              ...store.dungeonSession,
              current_encounter: result.progress.current,
              total_encounters: result.progress.total
            });
          }
          
          // Update encounter progress for UI
          if (result.progress) {
            console.log('[DUNGEON ADVANCE] Setting progress from result.progress:', result.progress);
            setDungeonProgress(result.progress);
          } else if (result.encounterProgress) {
            console.log('[DUNGEON ADVANCE] Setting progress from result.encounterProgress:', result.encounterProgress);
            setDungeonProgress(result.encounterProgress);
          } else {
            console.warn('[DUNGEON ADVANCE] No progress data in result!');
          }
          
          if (result.isBoss && result.namedMob) {
            setActiveNamedMobId(result.namedMob.id); // Track boss ID for loot
            const title = result.namedMob?.title ? ` ${result.namedMob.title}` : '';
            setCombatLog([`The final boss appears!`, `${result.mob.name}${title} blocks your path!`]);
          } else {
            setActiveNamedMobId(null); // Regular dungeon mob
            setCombatLog([`Next encounter!`, `${result.mob.name} attacks!`]);
          }
          
          return { completed: false };
        } else {
          console.error('[DUNGEON ADVANCE] Missing combat or mob data:', result);
          alert('Error: Failed to start next encounter - missing data');
          return { completed: false, error: true };
        }
      }
    } catch (error: any) {
      console.error('Advance dungeon error:', error);
      alert('Failed to advance dungeon: ' + error.message);
      return { completed: false, error: true };
    }
  };

  const handleStartNamedMobCombat = async (namedMob: NamedMob) => {
    try {
      // Sync current health to DB before entering combat
      const currentH = currentHealth();
      const currentM = currentMana();
      
      if (currentH !== data()?.character.current_health || currentM !== data()?.character.current_mana) {
        await syncHealthToServer(currentH, currentM);
      }
      
      const response = await fetch('/api/game/start-combat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(), 
          namedMobId: namedMob.id 
        }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setAvailableMobs([]);
      setNamedMobEncounter(null);
      setActiveMob({ ...namedMob, id: result.combatId } as any);
      setActiveNamedMobId(namedMob.id); // Track the original named mob ID for loot drops
      setOptimisticHealth(currentH);
      setOptimisticMana(currentM);
      
      const title = namedMob.title ? ` ${namedMob.title}` : '';
      setCombatLog([`You engage ${namedMob.name}${title} in combat!`]);
    } catch (error: any) {
      console.error('Start named mob combat error:', error);
      alert('Failed to start combat: ' + error.message);
    }
  };

  const handleAbandonDungeon = async () => {
    if (!confirm('Are you sure you want to abandon this dungeon? You will lose all progress.')) {
      return;
    }

    try {
      const response = await fetch('/api/game/abandon-dungeon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId() }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      // Clear client-side dungeon state immediately
      setActiveDungeon(null);
      actions.setDungeonSession(null);
      setDungeonProgress(null);
      setIsInActiveDungeonFlow(false);
      setActiveMob(null);
      setActiveNamedMobId(null);
      
      // Reload the page to get fresh server data (this ensures cache is cleared)
      window.location.reload();
    } catch (error: any) {
      console.error('Abandon dungeon error:', error);
      alert('Failed to abandon dungeon: ' + error.message);
    }
  };

  const handleContinueDungeon = async () => {
    if (!store.dungeonSession) return;

    // Mark as actively in dungeon flow
    setIsInActiveDungeonFlow(true);

    try {
      // Fetch the current encounter for this dungeon
      const response = await fetch('/api/game/get-dungeon-encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId() }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      // Set up dungeon progress UI
      if (result.progress) {
        setDungeonProgress(result.progress);
      }

      // Start combat with the current encounter mob
      if (result.mob) {
        setActiveMob(result.mob);
        
        if (result.isBoss && result.namedMob) {
          setActiveNamedMobId(result.namedMob.id);
          const title = result.namedMob?.title ? ` ${result.namedMob.title}` : '';
          setCombatLog([`Resuming dungeon...`, `${result.mob.name}${title} blocks your path!`]);
        } else {
          setActiveNamedMobId(null);
          setCombatLog([`Resuming dungeon...`, `${result.mob.name} attacks!`]);
        }
      }
    } catch (error: any) {
      console.error('Continue dungeon error:', error);
      alert('Failed to continue dungeon: ' + error.message);
    }
  };

  // Auto-scroll adventure combat log
  createEffect(() => {
    const log = combatLog(); // Track log changes
    
    if (adventureLogRef && !adventureLogUserScrolledUp() && log.length > 0) {
      setTimeout(() => {
        if (adventureLogRef) {
          adventureLogRef.scrollTop = adventureLogRef.scrollHeight;
        }
      }, 0);
    }
  });

  const handleAdventureLogScroll = () => {
    if (!adventureLogRef) return;
    
    const { scrollTop, scrollHeight, clientHeight } = adventureLogRef;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    setAdventureLogUserScrolledUp(!isAtBottom);
  };

  // Scroll detection for sticky header
  onMount(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling down 200px
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <div>
      <div class="header">
        <div class="header-content">
          <h1 class="title">Fantasy RPG</h1>
          <a href="/character-select" class="button secondary">
            Character Select
          </a>
        </div>
      </div>

      {/* Sticky Character Stats Header */}
      <Show when={isScrolled() && data()}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "var(--bg-dark)",
          "border-bottom": "2px solid var(--accent)",
          "z-index": 999,
          padding: "0.75rem 1rem",
          "box-shadow": "0 2px 10px rgba(0, 0, 0, 0.5)",
          animation: "slideDown 0.3s ease-out"
        }}>
          <div style={{
            "max-width": "1200px",
            margin: "0 auto",
            display: "grid",
            "grid-template-columns": "auto 1fr 1fr auto",
            gap: "1rem",
            "align-items": "center"
          }}>
            {/* Character Name & Level */}
            <div style={{ 
              "white-space": "nowrap",
              "font-weight": "bold"
            }}>
              {currentCharacter()?.name} <span style={{ color: "var(--text-secondary)" }}>Lv.{currentCharacter()?.level}</span>
            </div>

            {/* Health Bar */}
            <div>
              <div style={{ 
                "font-size": "0.75rem", 
                color: "var(--text-secondary)", 
                "margin-bottom": "0.25rem",
                display: "flex",
                "justify-content": "space-between"
              }}>
                <span>HP</span>
                <span>{currentHealth()}/{currentMaxHealth()}</span>
              </div>
              <div class="progress-bar" style={{ height: "8px" }}>
                <div
                  class="progress-fill health"
                  style={{ width: `${(currentHealth() / currentMaxHealth()) * 100}%` }}
                />
              </div>
            </div>

            {/* Mana Bar */}
            <div>
              <div style={{ 
                "font-size": "0.75rem", 
                color: "var(--text-secondary)", 
                "margin-bottom": "0.25rem",
                display: "flex",
                "justify-content": "space-between"
              }}>
                <span>MP</span>
                <span>{currentMana()}/{currentMaxMana()}</span>
              </div>
              <div class="progress-bar" style={{ height: "8px" }}>
                <div
                  class="progress-fill mana"
                  style={{ width: `${(currentMana() / currentMaxMana()) * 100}%` }}
                />
              </div>
            </div>

            {/* Gold */}
            <div style={{ 
              "white-space": "nowrap",
              "font-weight": "bold",
              color: "var(--warning)"
            }}>
              💰 {currentGold()}
            </div>
          </div>
        </div>
      </Show>

      <Show when={data()}>
        <div class="container">
          {/* Passive Health/Mana Regeneration */}
          <HealthRegen
            maxHealth={currentMaxHealth}
            maxMana={currentMaxMana}
            currentHealth={currentHealth}
            currentMana={currentMana}
            constitution={() => totalStats().constitution}
            wisdom={() => totalStats().wisdom}
            isInCombat={() => !!activeMob() || !!activeDungeon()}
            onRegenTick={handleRegenTick}
            onRegenComplete={(health, mana) => {
              // Update store, sync will happen automatically
              actions.updateHealth(health, mana);
            }}
          />
            {/* Character Info Panel */}
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "flex-wrap": "wrap", gap: "1rem" }}>
                <div style={{ flex: 1, "min-width": "250px" }}>
                  <h2>{currentCharacter()?.name}</h2>
                  <p style={{ color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                    Level {currentCharacter()?.level} | {currentGold()} Gold
                  </p>
                  {/* XP Progress Bar */}
                  <div>
                    <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                      <span>Experience</span>
                      <span>{currentCharacter()?.experience}/{(currentCharacter()?.level || 1) * 125} XP</span>
                    </div>
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        style={{ 
                          width: `${((currentCharacter()?.experience || 0) / ((currentCharacter()?.level || 1) * 125)) * 100}%`,
                          background: "linear-gradient(90deg, var(--warning), var(--accent))"
                        }}
                      />
                    </div>
                  </div>
                </div>
                <Show when={currentCharacter()?.available_points > 0}>
                  <div style={{ padding: "0.5rem 1rem", background: "var(--warning)", color: "var(--bg-dark)", "border-radius": "6px", "font-weight": "bold" }}>
                    {currentCharacter()?.available_points} Stat Points Available!
                  </div>
                </Show>
              </div>

              <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", "margin-top": "1rem" }}>
                <div>
                  <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                    <span>
                      Health
                      <Show when={activeMob()}> (Combat)</Show>
                      <Show when={!activeMob() && currentHealth() < currentMaxHealth()}> (Regenerating)</Show>
                    </span>
                    <span>{currentHealth()}/{currentMaxHealth()}</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill health"
                      style={{ width: `${(currentHealth() / currentMaxHealth()) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                    <span>
                      Mana
                      <Show when={activeMob()}> (Combat)</Show>
                      <Show when={!activeMob() && currentMana() < currentMaxMana()}> (Regenerating)</Show>
                    </span>
                    <span>{currentMana()}/{currentMaxMana()}</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill mana"
                      style={{ width: `${(currentMana() / currentMaxMana()) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div class="card">
              <div class="button-group">
                <button
                  class={view() === "adventure" ? "button" : "button secondary"}
                  onClick={() => setView("adventure")}
                >
                  Adventure
                </button>
                <button
                  class={view() === "inventory" ? "button" : "button secondary"}
                  onClick={() => setView("inventory")}
                >
                  Inventory
                </button>
                <button
                  class={view() === "stats" ? "button" : "button secondary"}
                  onClick={() => setView("stats")}
                >
                  Stats
                </button>
                <button
                  class={view() === "hotbar" ? "button" : "button secondary"}
                  onClick={() => setView("hotbar")}
                >
                  Hotbar
                </button>
              </div>
            </div>

            {/* Active Effects */}
            <ActiveEffectsDisplay combatHots={combatHots()} combatThorns={combatThorns()} />

            {/* Combat Engine - Always mounted but hidden when not in use */}
            <Show when={activeMob()}>
              <div style={{ display: view() === "adventure" ? "block" : "none" }}>
                {/* Dungeon Progress Bar - Show during dungeon combat */}
                <Show when={isDungeonCombat() && dungeonProgress()}>
                  <div class="card" style={{ 
                    "margin-bottom": "1rem",
                    border: "2px solid var(--accent)",
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))"
                  }}>
                    <div style={{ 
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      "margin-bottom": "0.75rem"
                    }}>
                      <div style={{ 
                        "font-size": "1rem",
                        "font-weight": "bold",
                        color: "var(--accent)"
                      }}>
                        🏰 Dungeon Progress
                      </div>
                      <div style={{ 
                        "font-size": "0.875rem",
                        color: "var(--text-secondary)"
                      }}>
                        Encounter {dungeonProgress()!.current}/{dungeonProgress()!.total}
                      </div>
                    </div>
                    <div style={{ 
                      background: "var(--bg-dark)",
                      height: "8px",
                      "border-radius": "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{ 
                        background: "var(--accent)",
                        height: "100%",
                        width: `${(dungeonProgress()!.current / dungeonProgress()!.total) * 100}%`,
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                  </div>
                </Show>

                <CombatEngine
                  character={data()!.character}
                  mob={activeMob()!}
                  equippedWeapon={equippedWeapon()}
                  equippedArmor={equippedArmor()}
                  currentHealth={currentHealth()}
                  currentMana={currentMana()}
                  hotbarActions={hotbarActions()}
                  onCombatEnd={handleCombatEnd}
                  onHealthChange={handleHealthChange}
                  onActiveHotsChange={setCombatHots}
                  onThornsChange={setCombatThorns}
                  onUseConsumable={async (itemId) => {
                    const item = currentInventory().find((i: any) => i.id === itemId);
                    if (item) {
                      await handleUseItem(itemId, item.name, item.health_restore || 0, item.mana_restore || 0);
                    }
                  }}
                />
              </div>
            </Show>

            {/* Adventure View */}
            <Show when={view() === "adventure" && !activeMob()}>
                {/* Current Region & Actions */}
                <div class="card">
                  <h3 style={{ "margin-bottom": "0.5rem" }}>Current Location</h3>
                  <Show when={currentRegion()}>
                    {(region) => (
                      <div style={{ 
                        padding: "1rem", 
                        background: "var(--bg-light)", 
                        "border-radius": "6px",
                        "margin-bottom": "1rem"
                      }}>
                        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "flex-wrap": "wrap", gap: "0.5rem" }}>
                          <div>
                            <h4 style={{ "margin-bottom": "0.25rem" }}>{region().name}</h4>
                            <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin": "0" }}>
                              {region().description}
                            </p>
                          </div>
                          <div style={{ 
                            padding: "0.5rem 1rem", 
                            background: "var(--accent)", 
                            color: "var(--bg-dark)", 
                            "border-radius": "6px",
                            "font-weight": "bold",
                            "font-size": "0.875rem"
                          }}>
                            Levels {region().min_level}-{region().max_level}
                          </div>
                        </div>
                      </div>
                    )}
                  </Show>

                  <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "1rem" }}>
                    <button class="button" onClick={handleRoam} disabled={isRoaming()} style={{ width: "100%" }}>
                      {isRoaming() ? "Roaming..." : "Roam Area"}
                    </button>
                    <button class="button secondary" onClick={() => setShowTravelModal(true)} style={{ width: "100%" }}>
                      Travel
                    </button>
                  </div>

                  <Show when={availableMobs().length > 0}>
                    <div style={{ "margin-top": "1.5rem" }}>
                      <div style={{ 
                        display: "flex", 
                        "justify-content": "space-between", 
                        "align-items": "center",
                        "margin-bottom": "0.75rem"
                      }}>
                        <h4 style={{ margin: 0 }}>Encountered Creatures</h4>
                        <div style={{ 
                          "font-size": "0.875rem", 
                          color: "var(--text-secondary)",
                          background: "var(--bg-light)",
                          padding: "0.25rem 0.75rem",
                          "border-radius": "12px"
                        }}>
                          {availableMobs().length} creature{availableMobs().length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ 
                        display: "grid",
                        "grid-template-columns": "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "0.75rem",
                        "margin-top": "1rem"
                      }}>
                        <For each={availableMobs()}>
                          {(mob) => (
                            <button
                              class="button secondary"
                              onClick={() => handleStartCombat(mob)}
                              style={{
                                display: "flex",
                                "flex-direction": "column",
                                "align-items": "start",
                                padding: "0.75rem",
                                "text-align": "left",
                                gap: "0.25rem"
                              }}
                            >
                              <div style={{ 
                                "font-weight": "bold",
                                "font-size": "0.95rem"
                              }}>
                                {mob.aggressive === 1 ? '⚔️ ' : ''}{mob.name}
                              </div>
                              <div style={{ 
                                "font-size": "0.75rem", 
                                color: "var(--text-secondary)",
                                display: "flex",
                                gap: "0.5rem"
                              }}>
                                <span>Lvl {mob.level}</span>
                                <span>•</span>
                                <span>{mob.max_health} HP</span>
                              </div>
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Named Mob Encounter */}
                  <Show when={namedMobEncounter()}>
                    {(mob) => (
                      <div style={{ 
                        "margin-top": "1.5rem",
                        padding: "1rem",
                        background: "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.1))",
                        border: "2px solid var(--danger)",
                        "border-radius": "8px",
                        "box-shadow": "0 0 20px rgba(220, 38, 38, 0.3)"
                      }}>
                        <h4 style={{ 
                          color: "var(--danger)", 
                          "margin-bottom": "0.5rem",
                          "font-size": "1.25rem"
                        }}>
                          ⚔️ Legendary Encounter!
                        </h4>
                        <div style={{ "margin-bottom": "0.75rem" }}>
                          <div style={{ 
                            "font-size": "1.125rem",
                            "font-weight": "bold",
                            color: "var(--text)"
                          }}>
                            {mob().name} {mob().title}
                          </div>
                          <div style={{ 
                            "font-size": "0.875rem",
                            color: "var(--text-secondary)",
                            "margin-top": "0.25rem"
                          }}>
                            Level {mob().level} • {mob().max_health} HP
                          </div>
                        </div>
                        <Show when={mob().description}>
                          <p style={{ 
                            "font-size": "0.875rem",
                            color: "var(--text-secondary)",
                            "margin-bottom": "1rem",
                            "font-style": "italic"
                          }}>
                            {mob().description}
                          </p>
                        </Show>
                        <button
                          class="button"
                          style={{ 
                            width: "100%",
                            background: "var(--danger)",
                            "border-color": "var(--danger)"
                          }}
                          onClick={() => handleStartNamedMobCombat(mob())}
                        >
                          Challenge {mob().name}
                        </button>
                      </div>
                    )}
                  </Show>

                  <Show when={combatLog()?.length > 0}>
                    <div 
                      ref={adventureLogRef}
                      class="combat-log" 
                      style={{ 
                        "margin-top": "1rem",
                        "max-height": "120px",
                        "overflow-y": "auto",
                        "scroll-behavior": "smooth"
                      }}
                      onScroll={handleAdventureLogScroll}
                    >
                      <For each={combatLog()}>{(log) => <p>{log}</p>}</For>
                    </div>
                  </Show>
                </div>

                {/* Dungeons */}
                <Show when={currentDungeons().length > 0 && !activeDungeon()}>
                  <div class="card">
                    <h3 style={{ "margin-bottom": "1rem" }}>Dungeons</h3>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      <For each={currentDungeons()}>
                        {(dungeon) => (
                          <div style={{ 
                            padding: "1rem",
                            background: "var(--bg-light)",
                            "border-radius": "6px",
                            border: "2px solid var(--accent)"
                          }}>
                            <div style={{ 
                              display: "flex",
                              "justify-content": "space-between",
                              "align-items": "start",
                              "margin-bottom": "0.5rem"
                            }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ "margin-bottom": "0.25rem" }}>{dungeon.name}</h4>
                                <p style={{ 
                                  "font-size": "0.875rem",
                                  color: "var(--text-secondary)",
                                  margin: "0.25rem 0"
                                }}>
                                  {dungeon.description}
                                </p>
                                <div style={{ 
                                  "font-size": "0.875rem",
                                  color: "var(--danger)",
                                  "font-weight": "bold",
                                  "margin-top": "0.5rem"
                                }}>
                                  Boss: {dungeon.boss_name} {dungeon.boss_title} (Lvl {dungeon.boss_level})
                                </div>
                              </div>
                            </div>
                            <button
                              class="button"
                              style={{ width: "100%", "margin-top": "0.5rem" }}
                              onClick={() => handleStartDungeon(dungeon.id)}
                              disabled={data()!.character.level < dungeon.required_level}
                            >
                              {data()!.character.level < dungeon.required_level
                                ? `Requires Level ${dungeon.required_level}`
                                : "Enter Dungeon"}
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>

                {/* Dungeon Progress Indicator */}
                <Show when={activeDungeon()}>
                  <div class="card" style={{ 
                    border: "2px solid var(--accent)",
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))"
                  }}>
                    <h3 style={{ color: "var(--accent)", "margin-bottom": "0.5rem" }}>
                      🏰 Active Dungeon
                    </h3>
                    <div style={{ 
                      "font-size": "1.125rem",
                      "font-weight": "bold",
                      "margin-bottom": "0.25rem"
                    }}>
                      {activeDungeon().dungeon_name}
                    </div>
                    <Show when={dungeonProgress()}>
                      <div style={{ 
                        "font-size": "0.875rem",
                        color: "var(--text-secondary)",
                        "margin-bottom": "0.75rem"
                      }}>
                        Encounter {dungeonProgress()!.current}/{dungeonProgress()!.total}
                      </div>
                      <div style={{ 
                        background: "var(--bg-dark)",
                        height: "8px",
                        "border-radius": "4px",
                        overflow: "hidden"
                      }}>
                        <div style={{ 
                          background: "var(--accent)",
                          height: "100%",
                          width: `${(dungeonProgress()!.current / dungeonProgress()!.total) * 100}%`,
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                    </Show>
                    <Show when={!dungeonProgress()}>
                      <div style={{ 
                        "font-size": "0.875rem",
                        color: "var(--text-secondary)"
                      }}>
                        In Progress...
                      </div>
                    </Show>
                    <div style={{ 
                      "margin-top": "1rem",
                      padding: "0.75rem",
                      background: "var(--bg-dark)",
                      "border-radius": "6px",
                      "text-align": "center",
                      color: "var(--warning)",
                      "font-weight": "bold"
                    }}>
                      ⚠️ Defeat all enemies to complete the dungeon!
                    </div>
                    <button
                      class="button secondary"
                      style={{ width: "100%", "margin-top": "1rem" }}
                      onClick={handleAbandonDungeon}
                    >
                      Abandon Dungeon
                    </button>
                  </div>
                </Show>

                {/* Merchants */}
                <Show when={currentMerchants().length > 0}>
                  <div class="card">
                    <h3 style={{ "margin-bottom": "1rem" }}>Merchants</h3>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      <For each={currentMerchants()}>
                        {(merchant) => (
                          <div style={{
                            padding: "1rem",
                            background: "var(--bg-light)",
                            "border-radius": "6px",
                            display: "flex",
                            "justify-content": "space-between",
                            "align-items": "center",
                            gap: "1rem"
                          }}>
                            <div>
                              <h4 style={{ "margin-bottom": "0.25rem" }}>{merchant.name}</h4>
                              <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                                {merchant.description}
                              </p>
                            </div>
                            <button
                              class="button"
                              onClick={() => handleOpenMerchant(merchant)}
                              style={{ "white-space": "nowrap" }}
                            >
                              Browse Wares
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
            </Show>

            {/* Inventory View */}
            <Show when={view() === "inventory"}>
              {/* Equipment Slots */}
              <div class="card">
                <h3 style={{ "margin-bottom": "1rem" }}>Equipment</h3>
                <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <For each={["weapon", "head", "chest", "hands", "feet"]}>
                    {(slotName) => {
                      // Make the equippedItem reactive by wrapping in a memo
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
                                  {/* Item Stats */}
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
                <h3 style={{ "margin-bottom": "1rem" }}>Inventory</h3>
                <div class="item-grid">
                  <For each={currentInventory().filter((i: any) => !i.equipped)}>
                    {(invItem: any) => (
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

                        {/* Requirements */}
                        <Show when={formatRequirements(invItem).length > 0}>
                          <div style={{ 
                            "font-size": "0.75rem", 
                            "margin-bottom": "0.5rem",
                            padding: "0.5rem",
                            background: meetsRequirements(invItem) ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            "border-radius": "4px",
                            border: `1px solid ${meetsRequirements(invItem) ? "var(--success)" : "var(--danger)"}`
                          }}>
                            <div style={{ 
                              color: meetsRequirements(invItem) ? "var(--success)" : "var(--danger)",
                              "font-weight": "bold",
                              "margin-bottom": "0.25rem"
                            }}>
                              {meetsRequirements(invItem) ? "✓ Requirements Met" : "✗ Requirements Not Met"}
                            </div>
                            <div style={{ color: "var(--text-secondary)" }}>
                              Requires: {formatRequirements(invItem).join(', ')}
                            </div>
                          </div>
                        </Show>

                        <div style={{ display: "flex", gap: "0.5rem", "margin-top": "0.5rem", "flex-wrap": "wrap" }}>
                          <Show when={(invItem.type === 'consumable' || invItem.type === 'scroll') && invItem.teaches_ability_id}>
                            <button
                              class="button"
                              style={{ 
                                flex: 1, 
                                "min-width": "100px", 
                                background: meetsRequirements(invItem) ? "var(--accent)" : "var(--bg-light)", 
                                color: meetsRequirements(invItem) ? "var(--bg-dark)" : "var(--text-secondary)",
                                opacity: meetsRequirements(invItem) ? 1 : 0.5,
                                cursor: meetsRequirements(invItem) ? "pointer" : "not-allowed"
                              }}
                              onClick={() => handleLearnAbility(invItem.id, invItem.name)}
                              disabled={!meetsRequirements(invItem)}
                            >
                              {meetsRequirements(invItem) ? "Learn" : "Can't Learn"}
                            </button>
                          </Show>
                          <Show when={invItem.type === 'consumable' && (invItem.health_restore || invItem.mana_restore)}>
                            <button
                              class="button success"
                              style={{ flex: 1, "min-width": "100px" }}
                              onClick={() => handleUseItem(invItem.id, invItem.name, invItem.health_restore || 0, invItem.mana_restore || 0)}
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
                                opacity: meetsRequirements(invItem) ? 1 : 0.5,
                                cursor: meetsRequirements(invItem) ? "pointer" : "not-allowed"
                              }}
                              onClick={() => handleEquip(invItem.id, false)}
                              disabled={!meetsRequirements(invItem)}
                            >
                              {meetsRequirements(invItem) ? "Equip" : "Can't Equip"}
                            </button>
                          </Show>
                          <Show when={invItem.value && invItem.value > 0}>
                            <button
                              class="button secondary"
                              style={{ flex: 1, "min-width": "120px" }}
                              onClick={() => handleSellClick(invItem.id, invItem.name, invItem.value, invItem.quantity)}
                            >
                              Sell ({Math.floor(invItem.value * 0.4) * invItem.quantity}g)
                            </button>
                          </Show>
                          <Show when={!invItem.value || invItem.value === 0}>
                            <button
                              class="button danger"
                              style={{ flex: 1, "min-width": "100px" }}
                              onClick={() => handleDropClick(invItem.id, invItem.name, invItem.quantity)}
                            >
                              Drop
                            </button>
                          </Show>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Stats View */}
            <Show when={view() === "stats"}>
              <div class="card">
                <h3 style={{ "margin-bottom": "1rem" }}>Character Stats</h3>
                
                <Show when={currentCharacter()?.available_points > 0}>
                  <div style={{ 
                    padding: "1rem", 
                    background: "var(--warning)", 
                    color: "var(--bg-dark)", 
                    "border-radius": "6px",
                    "margin-bottom": "1.5rem",
                    "text-align": "center",
                    "font-weight": "bold"
                  }}>
                    {availablePoints()} Stat Points Available
                  </div>
                </Show>

                {/* Stats Legend */}
                <div style={{ 
                  display: "grid", 
                  "grid-template-columns": "1fr auto auto auto", 
                  gap: "0.5rem",
                  padding: "0.75rem",
                  background: "var(--bg-dark)",
                  "border-radius": "6px",
                  "margin-bottom": "1rem",
                  "font-size": "0.875rem",
                  "font-weight": "bold",
                  color: "var(--text-secondary)"
                }}>
                  <div>Attribute</div>
                  <div style={{ "text-align": "center" }}>Base</div>
                  <div style={{ "text-align": "center" }}>Equipment</div>
                  <div style={{ "text-align": "center" }}>Total</div>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <For each={[
                    { key: 'strength', name: 'Strength', emoji: '💪', desc: 'Increases melee damage' },
                    { key: 'dexterity', name: 'Dexterity', emoji: '🏃', desc: 'Increases attack speed' },
                    { key: 'constitution', name: 'Constitution', emoji: '❤️', desc: 'Increases max health & HP regen' },
                    { key: 'intelligence', name: 'Intelligence', emoji: '🧠', desc: 'Increases max mana & spell power' },
                    { key: 'wisdom', name: 'Wisdom', emoji: '✨', desc: 'Increases mana regen & healing' },
                    { key: 'charisma', name: 'Charisma', emoji: '💫', desc: 'Affects luck & fortune' },
                  ]}>
                    {(stat) => {
                      const character = currentCharacter();
                      if (!character) return null;
                      
                      const baseStat = () => character[stat.key];
                      const equipBonus = () => equipmentBonuses()[stat.key];
                      const pending = () => pendingStats()[stat.key] || 0;
                      const total = () => baseStat() + equipBonus() + pending();
                      
                      return (
                        <div style={{ 
                          padding: "1rem", 
                          background: "var(--bg-light)", 
                          "border-radius": "6px"
                        }}>
                          <div style={{ 
                            display: "grid", 
                            "grid-template-columns": "1fr auto auto auto auto", 
                            gap: "1rem",
                            "align-items": "center"
                          }}>
                            <div>
                              <div style={{ "font-weight": "bold", "font-size": "1.1rem" }}>{stat.emoji} {stat.name}</div>
                              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                {stat.desc}
                              </div>
                            </div>
                            <div style={{ "text-align": "center", "font-size": "1.25rem" }}>
                              {baseStat()}
                              <Show when={pending() > 0}>
                                <span style={{ color: "var(--success)", "font-size": "0.875rem", "margin-left": "0.25rem" }}>
                                  +{pending()}
                                </span>
                              </Show>
                            </div>
                            <div style={{ "text-align": "center", "font-size": "1.25rem", color: equipBonus() > 0 ? "var(--success)" : "var(--text-secondary)" }}>
                              {equipBonus() > 0 ? `+${equipBonus()}` : "—"}
                            </div>
                            <div style={{ "text-align": "center", "font-size": "1.5rem", "font-weight": "bold", color: "var(--accent)" }}>
                              {total()}
                            </div>
                            <Show when={currentCharacter()?.available_points > 0}>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                  class="button secondary"
                                  onClick={() => adjustPendingStat(stat.key as any, -1)}
                                  disabled={pending() === 0}
                                  style={{ padding: "0.5rem 0.75rem", "font-size": "0.875rem" }}
                                >
                                  −
                                </button>
                                <button
                                  class="button"
                                  onClick={() => adjustPendingStat(stat.key as any, 1)}
                                  disabled={availablePoints() === 0}
                                  style={{ padding: "0.5rem 0.75rem", "font-size": "0.875rem" }}
                                >
                                  +
                                </button>
                              </div>
                            </Show>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>

                <Show when={totalPendingPoints() > 0}>
                  <div style={{ "margin-top": "1.5rem", display: "flex", gap: "1rem" }}>
                    <button
                      class="button success"
                      onClick={handleAssignStats}
                      disabled={assigningStats()}
                      style={{ flex: 1 }}
                    >
                      {assigningStats() ? "Assigning..." : `Assign ${totalPendingPoints()} Points`}
                    </button>
                    <button
                      class="button secondary"
                      onClick={() => setPendingStats({})}
                      disabled={assigningStats()}
                    >
                      Reset
                    </button>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Hotbar View */}
            <Show when={view() === "hotbar"}>
              <HotbarManager
                characterId={characterId()}
                abilities={currentAbilities()}
                consumables={currentInventory().filter((i: any) => 
                  i.type === 'consumable' && 
                  (i.health_restore > 0 || i.mana_restore > 0) &&
                  !i.teaches_ability_id
                )}
                hotbar={currentHotbar()}
                onHotbarChange={async () => {
                  console.log('[Game] Hotbar changed, updating context...');
                  // Fetch updated hotbar
                  try {
                    const response = await fetch(`/api/game/get-hotbar?characterId=${characterId()}`);
                    const result = await response.json();
                    if (result.hotbar) {
                      actions.setHotbar(result.hotbar);
                      console.log('[Game] Hotbar updated in context');
                    }
                  } catch (error) {
                    console.error('[Game] Failed to update hotbar:', error);
                  }
                }}
              />
            </Show>

            {/* Victory Modal */}
            <Show when={showVictoryModal() && victoryData()}>
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
                    "z-index": 1000,
                    padding: "1rem"
                  }}
                  onClick={() => {
                    setShowVictoryModal(false);
                    setVictoryData(null);
                  }}
                >
                  <div 
                    class="card"
                    style={{ 
                      "max-width": "500px",
                      width: "100%",
                      background: "var(--bg-dark)",
                      border: "2px solid var(--success)",
                      "box-shadow": "0 0 30px rgba(34, 197, 94, 0.3)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 style={{ 
                      color: "var(--success)", 
                      "text-align": "center",
                      "font-size": "2rem",
                      "margin-bottom": "1rem"
                    }}>
                      {data().levelUp ? "🎉 LEVEL UP! 🎉" : "⚔️ VICTORY! ⚔️"}
                    </h2>
                    
                    <Show when={data().levelUp}>
                      <div style={{ 
                        "text-align": "center",
                        "margin-bottom": "1.5rem",
                        padding: "1rem",
                        background: "rgba(34, 197, 94, 0.1)",
                        "border-radius": "6px",
                        border: "2px solid var(--success)"
                      }}>
                        <div style={{ 
                          "font-size": "1.5rem",
                          "font-weight": "bold",
                          color: "var(--success)",
                          "margin-bottom": "0.5rem"
                        }}>
                          You reached Level {data().newLevel}!
                        </div>
                        <div style={{ color: "var(--text-secondary)" }}>
                          You have 3 stat points to assign
                        </div>
                      </div>
                    </Show>

                    <div style={{ 
                      display: "flex", 
                      "flex-direction": "column", 
                      gap: "1rem",
                      "margin-bottom": "2rem"
                    }}>
                      <div style={{ 
                        padding: "1rem",
                        background: "var(--bg-light)",
                        "border-radius": "6px",
                        "border-left": "4px solid var(--accent)"
                      }}>
                        <div style={{ 
                          "font-size": "0.875rem", 
                          color: "var(--text-secondary)",
                          "margin-bottom": "0.25rem"
                        }}>
                          Experience Gained
                        </div>
                        <div style={{ 
                          "font-size": "1.5rem",
                          "font-weight": "bold",
                          color: "var(--accent)"
                        }}>
                          +{data().expGained} XP
                        </div>
                      </div>

                      <div style={{ 
                        padding: "1rem",
                        background: "var(--bg-light)",
                        "border-radius": "6px",
                        "border-left": "4px solid var(--warning)"
                      }}>
                        <div style={{ 
                          "font-size": "0.875rem", 
                          color: "var(--text-secondary)",
                          "margin-bottom": "0.25rem"
                        }}>
                          Gold Earned
                        </div>
                        <div style={{ 
                          "font-size": "1.5rem",
                          "font-weight": "bold",
                          color: "var(--warning)"
                        }}>
                          💰 {data().goldGained}
                        </div>
                      </div>

                      <Show when={data().loot.length > 0}>
                        <div style={{ 
                          padding: "1rem",
                          background: "var(--bg-light)",
                          "border-radius": "6px",
                          "border-left": "4px solid var(--success)"
                        }}>
                          <div style={{ 
                            "font-size": "0.875rem", 
                            color: "var(--text-secondary)",
                            "margin-bottom": "0.5rem"
                          }}>
                            Loot Acquired
                          </div>
                          <For each={data().loot}>
                            {(item) => (
                              <div style={{ 
                                "font-size": "1rem",
                                "font-weight": "bold",
                                color: "var(--success)",
                                "margin-bottom": "0.25rem"
                              }}>
                                📦 {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                              </div>
                            )}
                          </For>
                        </div>
                      </Show>

                      <Show when={data().loot.length === 0}>
                        <div style={{ 
                          padding: "1rem",
                          background: "var(--bg-light)",
                          "border-radius": "6px",
                          "text-align": "center",
                          color: "var(--text-secondary)",
                          "font-style": "italic"
                        }}>
                          No items dropped
                        </div>
                      </Show>
                    </div>

                    <button
                      class="button success"
                      style={{ width: "100%" }}
                      onClick={async () => {
                        // If in a dungeon, handle dungeon advancement
                        if (isDungeonCombat() && activeDungeon()) {
                          const result = await handleAdvanceDungeon();
                          if (result?.completed) {
                            // Dungeon complete! Close modal and refetch to update regions
                            setShowVictoryModal(false);
                            setVictoryData(null);
                            await refetchData();
                            const gameData = await getGameData(characterId());
                            if (gameData) {
                              actions.setMerchants(gameData.merchants || []);
                              actions.setDungeons(gameData.dungeons || []);
                            }
                          } else if (!result?.error) {
                            // Next combat started, close modal and combat UI shows
                            setShowVictoryModal(false);
                            setVictoryData(null);
                            return;
                          }
                        } else {
                          // Normal combat, just close modal
                          setShowVictoryModal(false);
                          setVictoryData(null);
                        }
                      }}
                    >
                      {isDungeonCombat() && activeDungeon() && dungeonProgress() && dungeonProgress()!.current < dungeonProgress()!.total 
                        ? "Next Encounter →" 
                        : isDungeonCombat() && activeDungeon()
                        ? "Complete Dungeon 🎉"
                        : "Continue Adventure"}
                    </button>
                  </div>
                </div>
              )}
            </Show>

            {/* Death Modal */}
            <Show when={showDeathModal()}>
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
                  setShowDeathModal(false);
                  setDeathData(null);
                }}
              >
                <div 
                  class="card"
                  style={{ 
                    "max-width": "500px",
                    width: "100%",
                    background: "var(--bg-dark)",
                    border: "2px solid var(--danger)",
                    "box-shadow": "0 0 30px rgba(220, 38, 38, 0.3)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 style={{ 
                    color: "var(--danger)", 
                    "text-align": "center",
                    "font-size": "2rem",
                    "margin-bottom": "1rem"
                  }}>
                    YOU HAVE DIED
                  </h2>
                  
                  <div style={{ 
                    "text-align": "center",
                    "margin-bottom": "2rem",
                    color: "var(--text-secondary)"
                  }}>
                    You have been defeated in battle and must face the consequences...
                  </div>

                  <Show when={deathData()}>
                    {(data) => (
                      <div style={{ 
                        display: "flex", 
                        "flex-direction": "column", 
                        gap: "1rem",
                        "margin-bottom": "2rem"
                      }}>
                        <div style={{ 
                          padding: "1rem",
                          background: "var(--bg-light)",
                          "border-radius": "6px",
                          "border-left": "4px solid var(--danger)"
                        }}>
                          <div style={{ 
                            "font-size": "0.875rem", 
                            color: "var(--text-secondary)",
                            "margin-bottom": "0.25rem"
                          }}>
                            Experience Lost
                          </div>
                          <div style={{ 
                            "font-size": "1.5rem",
                            "font-weight": "bold",
                            color: "var(--danger)"
                          }}>
                            -{data().expLost} XP
                          </div>
                          <Show when={data().expLost > 0}>
                            <div style={{ 
                              "font-size": "0.75rem",
                              color: "var(--text-secondary)",
                              "margin-top": "0.25rem"
                            }}>
                              25% of your current experience
                            </div>
                          </Show>
                        </div>

                        <div style={{ 
                          padding: "1rem",
                          background: "var(--bg-light)",
                          "border-radius": "6px",
                          "border-left": "4px solid var(--warning)"
                        }}>
                          <div style={{ 
                            "font-size": "0.875rem", 
                            color: "var(--text-secondary)",
                            "margin-bottom": "0.25rem"
                          }}>
                            Gold Lost
                          </div>
                          <div style={{ 
                            "font-size": "1.5rem",
                            "font-weight": "bold",
                            color: "var(--warning)"
                          }}>
                            -{data().goldLost} Gold
                          </div>
                          <Show when={data().goldLost > 0}>
                            <div style={{ 
                              "font-size": "0.75rem",
                              color: "var(--text-secondary)",
                              "margin-top": "0.25rem"
                            }}>
                              10% of your gold
                            </div>
                          </Show>
                        </div>

                        <div style={{ 
                          padding: "1rem",
                          background: "rgba(220, 38, 38, 0.1)",
                          "border-radius": "6px",
                          "text-align": "center",
                          color: "var(--danger)"
                        }}>
                          Your health has been set to 1 HP. You must fully recover before continuing your adventure.
                        </div>
                      </div>
                    )}
                  </Show>

                  <button
                    class="button"
                    style={{ width: "100%" }}
                    onClick={() => {
                      setShowDeathModal(false);
                      setDeathData(null);
                    }}
                  >
                    Accept Your Fate
                  </button>
                </div>
              </div>
            </Show>

            {/* Interrupted Dungeon Modal - Blocks all actions until resolved */}
            <Show when={store.dungeonSession && !activeMob() && !isInActiveDungeonFlow()}>
              <div 
                style={{ 
                  position: "fixed", 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  background: "rgba(0, 0, 0, 0.95)", 
                  display: "flex", 
                  "align-items": "center", 
                  "justify-content": "center",
                  "z-index": 2000,
                  padding: "1rem"
                }}
              >
                <div 
                  class="card"
                  style={{ 
                    "max-width": "500px",
                    width: "100%",
                    border: "2px solid var(--accent)",
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))"
                  }}
                >
                  <div style={{ 
                    "text-align": "center",
                    "margin-bottom": "1.5rem"
                  }}>
                    <div style={{ 
                      "font-size": "3rem",
                      "margin-bottom": "0.5rem"
                    }}>
                      🏰
                    </div>
                    <h2 style={{ 
                      "font-size": "1.5rem",
                      "margin-bottom": "0.5rem",
                      color: "var(--accent)"
                    }}>
                      Dungeon In Progress
                    </h2>
                    <p style={{ 
                      color: "var(--text-secondary)",
                      "font-size": "0.875rem"
                    }}>
                      You have an active dungeon session
                    </p>
                  </div>

                  <div style={{ 
                    background: "var(--bg-dark)",
                    padding: "1rem",
                    "border-radius": "8px",
                    "margin-bottom": "1.5rem"
                  }}>
                    <div style={{ 
                      display: "grid",
                      "grid-template-columns": "1fr 1fr",
                      gap: "1rem",
                      "margin-bottom": "1rem"
                    }}>
                      <div>
                        <div style={{ 
                          "font-size": "0.75rem",
                          color: "var(--text-secondary)",
                          "margin-bottom": "0.25rem"
                        }}>
                          Dungeon
                        </div>
                        <div style={{ 
                          "font-weight": "bold",
                          color: "var(--accent)"
                        }}>
                          {store.dungeonSession?.dungeon_name}
                        </div>
                      </div>
                      <div>
                        <div style={{ 
                          "font-size": "0.75rem",
                          color: "var(--text-secondary)",
                          "margin-bottom": "0.25rem"
                        }}>
                          Progress
                        </div>
                        <div style={{ "font-weight": "bold" }}>
                          Encounter {store.dungeonSession?.current_encounter}/{store.dungeonSession?.total_encounters}
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      display: "grid",
                      "grid-template-columns": "1fr 1fr",
                      gap: "1rem"
                    }}>
                      <div>
                        <div style={{ 
                          "font-size": "0.75rem",
                          color: "var(--text-secondary)",
                          "margin-bottom": "0.25rem"
                        }}>
                          Health
                        </div>
                        <div style={{ color: "var(--success)" }}>
                          {store.dungeonSession?.session_health} HP
                        </div>
                      </div>
                      <div>
                        <div style={{ 
                          "font-size": "0.75rem",
                          color: "var(--text-secondary)",
                          "margin-bottom": "0.25rem"
                        }}>
                          Mana
                        </div>
                        <div style={{ color: "var(--info)" }}>
                          {store.dungeonSession?.session_mana} MP
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: "var(--warning)",
                    color: "var(--bg-dark)",
                    padding: "0.75rem",
                    "border-radius": "6px",
                    "margin-bottom": "1.5rem",
                    "text-align": "center",
                    "font-size": "0.875rem"
                  }}>
                    ⚠️ You must complete or abandon this dungeon before taking other actions
                  </div>

                  <div style={{ 
                    display: "flex",
                    gap: "1rem"
                  }}>
                    <button
                      class="button danger"
                      style={{ flex: 1 }}
                      onClick={handleAbandonDungeon}
                    >
                      Abandon Dungeon
                    </button>
                    <button
                      class="button success"
                      style={{ flex: 1 }}
                      onClick={handleContinueDungeon}
                    >
                      Continue Dungeon →
                    </button>
                  </div>
                </div>
              </div>
            </Show>

            {/* Travel Modal */}
            <Show when={showTravelModal()}>
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
                  padding: "3rem 1rem"
                }}
                onClick={() => setShowTravelModal(false)}
              >
                <div 
                  class="card"
                  style={{ 
                    "max-width": "600px",
                    width: "100%",
                    "max-height": "calc(100vh - 6rem)",
                    display: "flex",
                    "flex-direction": "column",
                    overflow: "hidden"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Fixed Header */}
                  <div style={{ 
                    position: "relative",
                    padding: "1.5rem",
                    "padding-bottom": "1rem",
                    "border-bottom": "2px solid var(--bg-light)",
                    "flex-shrink": 0,
                    background: "var(--bg-dark)"
                  }}>
                    {/* Close button in top right corner */}
                    <button
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        width: "32px",
                        height: "32px",
                        "border-radius": "50%",
                        background: "var(--bg-light)",
                        border: "1px solid var(--text-secondary)",
                        color: "var(--text)",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        cursor: "pointer",
                        "font-size": "1.25rem",
                        "line-height": "1",
                        padding: "0",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--danger)";
                        e.currentTarget.style.borderColor = "var(--danger)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-light)";
                        e.currentTarget.style.borderColor = "var(--text-secondary)";
                      }}
                      onClick={() => setShowTravelModal(false)}
                    >
                      ✕
                    </button>
                    
                    {/* Title spans full width */}
                    <h2 style={{ margin: 0, "padding-right": "2.5rem" }}>Travel to a Region</h2>
                  </div>

                  {/* Scrollable Content */}
                  <div style={{ 
                    "overflow-y": "auto",
                    padding: "1.5rem",
                    flex: "1"
                  }}>
                  
                  <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
                    <For each={data()!.regions}>
                      {(region) => {
                        const isCurrent = region.id === currentCharacter()?.current_region;
                        const isLocked = region.locked === 1;
                        
                        return (
                          <div style={{ 
                            padding: "1rem", 
                            background: isCurrent ? "var(--accent)" : isLocked ? "var(--bg-dark)" : "var(--bg-light)", 
                            "border-radius": "6px",
                            border: isCurrent ? "2px solid var(--accent)" : isLocked ? "2px solid #555" : "none",
                            opacity: isLocked ? 0.6 : 1,
                            position: "relative"
                          }}>
                            <Show when={isLocked}>
                              <div style={{
                                position: "absolute",
                                top: "0.5rem",
                                right: "0.5rem",
                                padding: "0.25rem 0.5rem",
                                background: "#555",
                                "border-radius": "4px",
                                "font-size": "0.75rem",
                                "font-weight": "bold"
                              }}>
                                🔒 LOCKED
                              </div>
                            </Show>
                            
                            <div style={{ 
                              "font-weight": "bold", 
                              "font-size": "1.1rem",
                              color: isCurrent ? "var(--bg-dark)" : "inherit",
                              "margin-bottom": "0.5rem"
                            }}>
                              {region.name}
                              <Show when={isCurrent}>
                                <span style={{ "margin-left": "0.5rem", "font-size": "0.875rem" }}>(Current Location)</span>
                              </Show>
                            </div>
                            
                            <div style={{ 
                              "font-size": "0.875rem", 
                              color: isCurrent ? "var(--bg-dark)" : "var(--text-secondary)",
                              "margin-bottom": "0.5rem"
                            }}>
                              {region.description}
                            </div>
                            
                            <div style={{ 
                              "font-size": "0.875rem",
                              "font-weight": "bold",
                              color: isCurrent ? "var(--bg-dark)" : "var(--warning)",
                              "margin-bottom": "0.75rem"
                            }}>
                              Recommended: Levels {region.min_level}-{region.max_level}
                            </div>

                            <Show when={isLocked && region.unlock_requirement}>
                              <div style={{
                                padding: "0.5rem",
                                background: "rgba(0, 0, 0, 0.3)",
                                "border-radius": "4px",
                                "font-size": "0.875rem",
                                "margin-bottom": "0.75rem",
                                color: "var(--warning)"
                              }}>
                                🔑 Unlock Requirement: {region.unlock_requirement}
                              </div>
                            </Show>

                            <Show when={!isCurrent && !isLocked}>
                              <button
                                class="button"
                                onClick={async () => {
                                  await handleTravel(region.id);
                                  setShowTravelModal(false);
                                }}
                                disabled={isTraveling()}
                                style={{ width: "100%" }}
                              >
                                {isTraveling() ? "Traveling..." : "Travel Here"}
                              </button>
                            </Show>

                            <Show when={isCurrent}>
                              <div style={{
                                padding: "0.75rem",
                                background: "rgba(0, 0, 0, 0.2)",
                                "border-radius": "4px",
                                "text-align": "center",
                                "font-weight": "bold"
                              }}>
                                You are already here
                              </div>
                            </Show>

                            <Show when={isLocked}>
                              <button
                                class="button secondary"
                                disabled={true}
                                style={{ width: "100%", opacity: 0.5, cursor: "not-allowed" }}
                              >
                                Locked
                              </button>
                            </Show>
                          </div>
                        );
                      }}
                    </For>
                  </div>
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
                    "z-index": 1000,
                    padding: "1rem"
                  }}
                  onClick={() => {
                    setShowSellModal(false);
                    setSellItemData(null);
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
                      <div style={{ 
                        "font-size": "0.875rem", 
                        color: "var(--text-secondary)",
                        "margin-bottom": "1rem"
                      }}>
                        {data().maxQuantity > 1 ? `Available: ${data().maxQuantity}` : 'This action cannot be undone'}
                      </div>
                      
                      <Show when={data().maxQuantity > 1}>
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
                            onClick={() => setSellQuantity(Math.min(data().maxQuantity, sellQuantity() + 1))}
                            disabled={sellQuantity() >= data().maxQuantity}
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

            {/* Drop Confirmation Modal */}
            <Show when={showDropModal() && dropItemData()}>
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
                    "z-index": 1000,
                    padding: "1rem"
                  }}
                  onClick={() => {
                    setShowDropModal(false);
                    setDropItemData(null);
                  }}
                >
                  <div 
                    class="card"
                    style={{ 
                      "max-width": "400px",
                      width: "100%",
                      background: "var(--bg-dark)",
                      border: "2px solid var(--danger)",
                      "box-shadow": "0 0 20px rgba(220, 38, 38, 0.3)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 style={{ 
                      color: "var(--danger)", 
                      "text-align": "center",
                      "font-size": "1.5rem",
                      "margin-bottom": "1rem"
                    }}>
                      Drop Item?
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
                      <div style={{ 
                        "font-size": "0.875rem", 
                        color: "var(--text-secondary)",
                        "margin-bottom": "1rem"
                      }}>
                        {data().maxQuantity > 1 ? `Available: ${data().maxQuantity}` : 'This action cannot be undone'}
                      </div>
                      
                      <Show when={data().maxQuantity > 1}>
                        <div style={{
                          display: "flex",
                          "align-items": "center",
                          "justify-content": "center",
                          gap: "1rem",
                          "margin-bottom": "1rem"
                        }}>
                          <button
                            class="button secondary"
                            onClick={() => setDropQuantity(Math.max(1, dropQuantity() - 1))}
                            disabled={dropQuantity() <= 1}
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
                            {dropQuantity()}
                          </div>
                          <button
                            class="button secondary"
                            onClick={() => setDropQuantity(Math.min(data().maxQuantity, dropQuantity() + 1))}
                            disabled={dropQuantity() >= data().maxQuantity}
                            style={{ padding: "0.5rem 1rem", "font-size": "1.25rem" }}
                          >
                            +
                          </button>
                        </div>
                      </Show>
                      
                      <div style={{
                        padding: "1rem",
                        background: "rgba(220, 38, 38, 0.1)",
                        "border-radius": "6px",
                        border: "1px solid var(--danger)"
                      }}>
                        <div style={{ 
                          "font-size": "0.875rem", 
                          color: "var(--danger)",
                          "font-weight": "bold"
                        }}>
                          ⚠️ This item will be permanently destroyed
                        </div>
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
                        Drop
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Show>

            {/* Learn Ability Modal */}
            <Show when={showLearnModal() && learnAbilityData()}>
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
                    "z-index": 1000,
                    padding: "1rem"
                  }}
                  onClick={() => {
                    setShowLearnModal(false);
                    setLearnAbilityData(null);
                  }}
                >
                  <div 
                    class="card"
                    style={{ 
                      "max-width": "500px",
                      width: "100%",
                      background: "var(--bg-dark)",
                      border: "2px solid var(--accent)",
                      "box-shadow": "0 0 30px rgba(96, 165, 250, 0.3)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 style={{ 
                      color: "var(--accent)", 
                      "text-align": "center",
                      "font-size": "2rem",
                      "margin-bottom": "1rem"
                    }}>
                      ✨ Ability Learned! ✨
                    </h2>
                    
                    <div style={{ 
                      "text-align": "center",
                      "margin-bottom": "1.5rem",
                      padding: "1.5rem",
                      background: "rgba(96, 165, 250, 0.1)",
                      "border-radius": "6px",
                      border: "2px solid var(--accent)"
                    }}>
                      <div style={{ 
                        "font-size": "1.5rem",
                        "font-weight": "bold",
                        color: "var(--accent)",
                        "margin-bottom": "0.5rem"
                      }}>
                        {data().abilityName}
                      </div>
                      <div style={{ 
                        "font-size": "1rem",
                        color: "var(--text-secondary)"
                      }}>
                        {data().message}
                      </div>
                    </div>

                    <button
                      class="button"
                      onClick={() => {
                        setShowLearnModal(false);
                        setLearnAbilityData(null);
                      }}
                      style={{ 
                        width: "100%",
                        background: "var(--accent)"
                      }}
                    >
                      Awesome!
                    </button>
                  </div>
                </div>
              )}
            </Show>

            {/* Merchant Modal */}
            <Show when={showMerchantModal() && activeMerchant()}>
              {(merchant) => (
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
                    padding: "3rem 1rem"
                  }}
                  onClick={() => {
                    setShowMerchantModal(false);
                    setActiveMerchant(null);
                    setMerchantInventory([]);
                  }}
                >
                  <div 
                    class="card"
                    style={{ 
                      "max-width": "900px",
                      width: "100%",
                      background: "var(--bg-dark)",
                      border: "2px solid var(--warning)",
                      "box-shadow": "0 0 30px rgba(251, 191, 36, 0.3)",
                      "max-height": "calc(100vh - 6rem)",
                      margin: "auto",
                      display: "flex",
                      "flex-direction": "column",
                      overflow: "hidden"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Fixed Header */}
                    <div style={{ 
                      position: "relative",
                      padding: "1.5rem",
                      "padding-bottom": "1rem",
                      "border-bottom": "2px solid var(--bg-light)",
                      "flex-shrink": 0,
                      background: "var(--bg-dark)"
                    }}>
                      {/* Close button in top right corner */}
                      <button
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          right: "0.75rem",
                          width: "32px",
                          height: "32px",
                          "border-radius": "50%",
                          background: "var(--bg-light)",
                          border: "1px solid var(--text-secondary)",
                          color: "var(--text)",
                          display: "flex",
                          "align-items": "center",
                          "justify-content": "center",
                          cursor: "pointer",
                          "font-size": "1.25rem",
                          "line-height": "1",
                          padding: "0",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--danger)";
                          e.currentTarget.style.borderColor = "var(--danger)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--bg-light)";
                          e.currentTarget.style.borderColor = "var(--text-secondary)";
                        }}
                        onClick={() => {
                          setShowMerchantModal(false);
                          setActiveMerchant(null);
                          setMerchantInventory([]);
                        }}
                      >
                        ✕
                      </button>
                      
                      {/* Content spans full width */}
                      <div style={{ "padding-right": "2.5rem" }}>
                        <h2 style={{ 
                          color: "var(--warning)", 
                          "font-size": "1.75rem",
                          "margin-bottom": "0.25rem"
                        }}>
                          {merchant().name}
                        </h2>
                        <p style={{ 
                          color: "var(--text-secondary)", 
                          margin: 0,
                          "font-size": "0.875rem"
                        }}>
                          {merchant().description}
                        </p>
                        <Show when={merchantDiscountPercent() > 0}>
                          <div style={{ 
                            "margin-top": "0.5rem",
                            padding: "0.5rem",
                            background: "rgba(34, 197, 94, 0.1)",
                            "border-radius": "4px",
                            border: "1px solid var(--success)",
                            "font-size": "0.875rem",
                            color: "var(--success)"
                          }}>
                            💫 {merchantDiscountPercent()}% Charisma Discount Active!
                          </div>
                        </Show>
                        <div style={{ 
                          "margin-top": "0.75rem",
                          "font-size": "1.25rem", 
                          "font-weight": "bold",
                          color: "var(--warning)"
                        }}>
                          💰 {currentGold()} Gold
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div style={{ 
                      "overflow-y": "auto",
                      padding: "1.5rem",
                      flex: "1"
                    }}>

                    <div class="item-grid">
                      <For each={merchantInventory()}>
                        {(item) => (
                          <div class={`item-card ${item.rarity}`}>
                            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "margin-bottom": "0.5rem" }}>
                              <div>
                                <h4 style={{ "margin-bottom": "0.25rem" }}>{item.name}</h4>
                                <p style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "text-transform": "uppercase" }}>
                                  {item.type} {item.slot && `• ${item.slot}`}
                                </p>
                              </div>
                              <Show when={item.stock !== -1}>
                                <div style={{ 
                                  "font-size": "0.75rem",
                                  color: item.stock > 5 ? "var(--success)" : item.stock > 0 ? "var(--warning)" : "var(--danger)"
                                }}>
                                  {item.stock > 0 ? `Stock: ${item.stock}` : 'OUT OF STOCK'}
                                </div>
                              </Show>
                            </div>

                            <Show when={item.description}>
                              <p style={{ "font-size": "0.875rem", "margin-bottom": "0.5rem", color: "var(--text-secondary)" }}>
                                {item.description}
                              </p>
                            </Show>

                            {/* Item Stats */}
                            <div style={{ "font-size": "0.875rem", "margin-bottom": "0.5rem" }}>
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
                            </div>

                            {/* Requirements */}
                            <Show when={formatRequirements(item).length > 0}>
                              <div style={{ 
                                "font-size": "0.75rem", 
                                "margin-bottom": "0.5rem",
                                padding: "0.5rem",
                                background: meetsRequirements(item) ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                "border-radius": "4px",
                                border: `1px solid ${meetsRequirements(item) ? "var(--success)" : "var(--danger)"}`
                              }}>
                                <div style={{ 
                                  color: meetsRequirements(item) ? "var(--success)" : "var(--danger)",
                                  "font-weight": "bold",
                                  "margin-bottom": "0.25rem"
                                }}>
                                  {meetsRequirements(item) ? "✓ Can Use" : "✗ Cannot Use"}
                                </div>
                                <div style={{ color: "var(--text-secondary)" }}>
                                  Requires: {formatRequirements(item).join(', ')}
                                </div>
                              </div>
                            </Show>

                            <div style={{ "font-size": "0.875rem", "margin-bottom": "0.5rem", "text-align": "center" }}>
                              <Show when={item.base_price && item.base_price > item.merchant_price}>
                                <div style={{ 
                                  color: "var(--text-secondary)", 
                                  "text-decoration": "line-through" 
                                }}>
                                  {item.base_price}g
                                </div>
                              </Show>
                              <div style={{ 
                                "font-size": "1.25rem",
                                "font-weight": "bold",
                                color: "var(--warning)"
                              }}>
                                {item.merchant_price}g
                              </div>
                              <Show when={item.base_price && item.base_price > item.merchant_price}>
                                <div style={{ color: "var(--success)", "font-size": "0.75rem" }}>
                                  Save {item.base_price - item.merchant_price}g!
                                </div>
                              </Show>
                            </div>

                            <button
                              class="button"
                              style={{ 
                                width: "100%",
                                background: currentGold() >= item.merchant_price ? "var(--warning)" : "var(--bg-light)",
                                color: currentGold() >= item.merchant_price ? "var(--bg-dark)" : "var(--text-secondary)",
                                cursor: (currentGold() >= item.merchant_price && (item.stock === -1 || item.stock > 0)) ? "pointer" : "not-allowed"
                              }}
                              disabled={currentGold() < item.merchant_price || (item.stock !== -1 && item.stock <= 0)}
                              onClick={() => handleBuyItem(item.id, item.name, item.merchant_price)}
                            >
                              {currentGold() >= item.merchant_price ? "Buy Now" : `Need ${item.merchant_price}g`}
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                    </div>
                  </div>
                </div>
              )}
            </Show>
          </div>
      </Show>
    </div>
  );
}
