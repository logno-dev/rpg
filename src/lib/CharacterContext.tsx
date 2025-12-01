import { createContext, useContext, ParentComponent, createEffect, createMemo } from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { Character, Item, Region, Ability } from "~/lib/db";

// Types
export type InventoryItem = {
  id: number;
  character_id: number;
  item_id: number;
  quantity: number;
  equipped: number;
  name: string;
  description: string | null;
  type: string;
  slot: string | null;
  rarity: string;
  strength_bonus: number;
  dexterity_bonus: number;
  constitution_bonus: number;
  intelligence_bonus: number;
  wisdom_bonus: number;
  charisma_bonus: number;
  damage_min: number;
  damage_max: number;
  armor: number;
  attack_speed: number;
  value: number;
  stackable: number;
  health_restore: number;
  mana_restore: number;
  teaches_ability_id: number | null;
};

type AbilityWithCooldown = Ability & {
  last_used_at: number;
};

type Merchant = {
  id: number;
  name: string;
  region_id: number;
  description: string | null;
};

type Dungeon = {
  id: number;
  name: string;
  region_id: number;
  description: string | null;
  boss_mob_id: number;
  required_level: number;
  boss_name?: string;
  boss_title?: string;
  boss_level?: number;
};

type HotbarSlot = {
  slot: number;
  type?: 'ability' | 'consumable';
  ability_id?: number;
  item_id?: number;
  ability_name?: string;
  item_name?: string;
  ability_description?: string;
  item_description?: string;
  mana_cost?: number;
  cooldown?: number;
  health_restore?: number;
  mana_restore?: number;
  item_quantity?: number;
  // Full ability/item data for combat use
  abilityData?: AbilityWithCooldown;
  itemData?: InventoryItem;
};

export type DungeonSession = {
  id: number;
  dungeon_id: number;
  current_encounter: number;
  total_encounters: number;
  session_health: number;
  session_mana: number;
  boss_mob_id: number;
  dungeon_name: string;
};

type CharacterStore = {
  character: Character | null;
  inventory: InventoryItem[];
  abilities: AbilityWithCooldown[];
  hotbar: HotbarSlot[];
  regions: Region[];
  currentRegion: Region | null;
  currentSubArea: number | null;
  merchants: Merchant[];
  dungeons: Dungeon[];
  dungeonSession: DungeonSession | null;
  isLoading: boolean;
  hasCompletableQuests: boolean;
};

type CharacterContextValue = [
  store: CharacterStore,
  actions: {
    setCharacter: (character: Character) => void;
    setInventory: (inventory: InventoryItem[]) => void;
    setAbilities: (abilities: AbilityWithCooldown[]) => void;
    setHotbar: (hotbar: HotbarSlot[]) => void;
    setRegions: (regions: Region[]) => void;
    setCurrentRegion: (region: Region) => void;
    setCurrentSubArea: (subAreaId: number | null) => void;
    setMerchants: (merchants: Merchant[]) => void;
    setDungeons: (dungeons: Dungeon[]) => void;
    setDungeonSession: (session: DungeonSession | null) => void;
    updateDungeonHealth: (health: number, mana: number) => void;
    updateDungeonEncounter: (encounterNumber: number, health: number, mana: number) => void;
    updateHealth: (health: number, mana?: number) => void;
    updateGold: (gold: number) => void;
    updateExperience: (exp: number) => void;
    updateStats: (stats: Partial<Character>) => void;
    addItemToInventory: (item: InventoryItem) => void;
    removeItemFromInventory: (inventoryItemId: number) => void;
    updateItemQuantity: (inventoryItemId: number, quantity: number) => void;
    equipItem: (inventoryItemId: number) => void;
    unequipItem: (inventoryItemId: number) => void;
    addAbility: (ability: AbilityWithCooldown) => void;
    removeAbility: (abilityId: number) => void;
    setLoading: (loading: boolean) => void;
    setHasCompletableQuests: (hasCompletable: boolean) => void;
    reset: () => void;
  },
  computed: {
    maxHealth: () => number;
    maxMana: () => number;
    totalStats: () => {
      constitution: number;
      intelligence: number;
      wisdom: number;
      strength: number;
      dexterity: number;
      charisma: number;
    };
  }
];

const CharacterContext = createContext<CharacterContextValue>();

export const CharacterProvider: ParentComponent<{ initialData?: Partial<CharacterStore> }> = (props) => {
  const [store, setStore] = createStore<CharacterStore>({
    character: props.initialData?.character || null,
    inventory: props.initialData?.inventory || [],
    abilities: props.initialData?.abilities || [],
    hotbar: props.initialData?.hotbar || [],
    regions: props.initialData?.regions || [],
    currentRegion: props.initialData?.currentRegion || null,
    currentSubArea: props.initialData?.currentSubArea || null,
    merchants: props.initialData?.merchants || [],
    dungeons: props.initialData?.dungeons || [],
    dungeonSession: null,
    isLoading: false,
    hasCompletableQuests: false,
  });

  const actions = {
    setCharacter: (character: Character) => {
      setStore("character", character);
    },

    setInventory: (inventory: InventoryItem[]) => {
      setStore("inventory", inventory);
    },

    setAbilities: (abilities: AbilityWithCooldown[]) => {
      setStore("abilities", abilities);
    },

    setHotbar: (hotbar: HotbarSlot[]) => {
      setStore("hotbar", hotbar);
    },

    setRegions: (regions: Region[]) => {
      setStore("regions", regions);
    },

    setCurrentRegion: (region: Region) => {
      setStore("currentRegion", region);
    },

    setCurrentSubArea: (subAreaId: number | null) => {
      setStore("currentSubArea", subAreaId);
    },

    setMerchants: (merchants: Merchant[]) => {
      setStore("merchants", merchants);
    },

    setDungeons: (dungeons: Dungeon[]) => {
      setStore("dungeons", dungeons);
    },

    setDungeonSession: (session: DungeonSession | null) => {
      setStore("dungeonSession", session);
    },

    updateDungeonHealth: (health: number, mana: number) => {
      setStore("dungeonSession", (session) => {
        if (!session) return session;
        return { ...session, session_health: health, session_mana: mana };
      });
    },

    updateDungeonEncounter: (encounterNumber: number, health: number, mana: number) => {
      if (!store.dungeonSession) return; // Guard against null session
      setStore("dungeonSession", "current_encounter", encounterNumber);
      setStore("dungeonSession", "session_health", health);
      setStore("dungeonSession", "session_mana", mana);
    },

    updateHealth: (health: number, mana?: number) => {
      if (!store.character) return; // Guard against null character
      setStore("character", "current_health", health);
      if (mana !== undefined) {
        setStore("character", "current_mana", mana);
      }
    },

    updateGold: (gold: number) => {
      if (!store.character) return; // Guard against null character
      setStore("character", "gold", gold);
    },

    updateExperience: (exp: number) => {
      if (!store.character) return; // Guard against null character
      setStore("character", "experience", exp);
    },

    updateStats: (stats: Partial<Character>) => {
      setStore("character", produce((char) => {
        if (!char) return;
        Object.assign(char, stats);
      }));
    },

    addItemToInventory: (item: InventoryItem) => {
      setStore("inventory", (inv) => {
        // Check if item is stackable and already exists
        const existingIndex = inv.findIndex(
          (i) => i.item_id === item.item_id && item.stackable === 1
        );
        
        if (existingIndex >= 0) {
          // Update existing stack
          const newInv = [...inv];
          newInv[existingIndex] = {
            ...newInv[existingIndex],
            quantity: newInv[existingIndex].quantity + item.quantity,
          };
          return newInv;
        } else {
          // Add new item
          return [...inv, item];
        }
      });
    },

    removeItemFromInventory: (inventoryItemId: number) => {
      setStore("inventory", (inv) => inv.filter((i) => i.id !== inventoryItemId));
    },

    updateItemQuantity: (inventoryItemId: number, quantity: number) => {
      setStore("inventory", (inv) => {
        const index = inv.findIndex((i) => i.id === inventoryItemId);
        if (index === -1) return inv;
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          return inv.filter((i) => i.id !== inventoryItemId);
        }
        
        const newInv = [...inv];
        newInv[index] = { ...newInv[index], quantity };
        return newInv;
      });
    },

    equipItem: (inventoryItemId: number) => {
      setStore("inventory", produce((inv) => {
        const itemToEquip = inv.find((i) => i.id === inventoryItemId);
        if (!itemToEquip || !itemToEquip.slot) return;

        // Unequip items in the same slot
        inv.forEach((i) => {
          if (i.slot === itemToEquip.slot && i.equipped === 1) {
            i.equipped = 0;
          }
        });

        // Equip the new item
        const item = inv.find((i) => i.id === inventoryItemId);
        if (item) {
          item.equipped = 1;
        }
      }));
    },

    unequipItem: (inventoryItemId: number) => {
      setStore("inventory", produce((inv) => {
        const item = inv.find((i) => i.id === inventoryItemId);
        if (item) {
          item.equipped = 0;
        }
      }));
    },

    addAbility: (ability: AbilityWithCooldown) => {
      setStore("abilities", produce((abilities) => {
        // Check if ability with same base_id exists (for auto-upgrade)
        if (ability.base_id) {
          const existingIndex = abilities.findIndex(
            (a) => a.base_id === ability.base_id && a.level < ability.level
          );
          
          if (existingIndex >= 0) {
            // Replace lower tier ability
            abilities[existingIndex] = ability;
            return;
          }
        }
        
        // Check if already learned
        const alreadyLearned = abilities.some((a) => a.id === ability.id);
        if (!alreadyLearned) {
          abilities.push(ability);
        }
      }));
    },

    removeAbility: (abilityId: number) => {
      setStore("abilities", (abilities) => abilities.filter((a) => a.id !== abilityId));
    },

    setLoading: (loading: boolean) => {
      setStore("isLoading", loading);
    },

    setHasCompletableQuests: (hasCompletable: boolean) => {
      setStore("hasCompletableQuests", hasCompletable);
    },

    reset: () => {
      setStore({
        character: null,
        inventory: [],
        abilities: [],
        hotbar: [],
        regions: [],
        currentRegion: null,
        currentSubArea: null,
        merchants: [],
        dungeons: [],
        dungeonSession: null,
        isLoading: false,
        hasCompletableQuests: false,
      });
    },
  };

  // Computed values - create memos separately to avoid circular dependencies
  const equipmentBonuses = createMemo(() => {
    const bonuses = {
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      strength: 0,
      dexterity: 0,
      charisma: 0,
    };

    store.inventory.forEach((item) => {
      if (item.equipped === 1) {
        bonuses.constitution += item.constitution_bonus || 0;
        bonuses.intelligence += item.intelligence_bonus || 0;
        bonuses.wisdom += item.wisdom_bonus || 0;
        bonuses.strength += item.strength_bonus || 0;
        bonuses.dexterity += item.dexterity_bonus || 0;
        bonuses.charisma += item.charisma_bonus || 0;
      }
    });

    return bonuses;
  });

  // Total stats (base + equipment)
  const totalStats = createMemo(() => {
    const char = store.character;
    const equipBonus = equipmentBonuses();
    
    if (!char) {
      return {
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        strength: 10,
        dexterity: 10,
        charisma: 10,
      };
    }

    return {
      constitution: char.constitution + equipBonus.constitution,
      intelligence: char.intelligence + equipBonus.intelligence,
      wisdom: char.wisdom + equipBonus.wisdom,
      strength: char.strength + equipBonus.strength,
      dexterity: char.dexterity + equipBonus.dexterity,
      charisma: char.charisma + equipBonus.charisma,
    };
  });

  // Max Health: Base + (Level × 20) + (CON - 10) × 8
  const maxHealth = createMemo(() => {
    const char = store.character;
    if (!char) return 100;

    const stats = totalStats();
    const baseHealth = 100;
    const levelBonus = char.level * 20;
    const constitutionBonus = (stats.constitution - 10) * 8;

    return baseHealth + levelBonus + constitutionBonus;
  });

  // Max Mana: Base + (Level × 20) + (INT - 10) × 5
  const maxMana = createMemo(() => {
    const char = store.character;
    if (!char) return 100;

    const stats = totalStats();
    const baseMana = 100;
    const levelBonus = char.level * 20;
    const intelligenceBonus = (stats.intelligence - 10) * 5;

    return baseMana + levelBonus + intelligenceBonus;
  });

  const computed = {
    maxHealth,
    maxMana,
    totalStats,
  };

  return (
    <CharacterContext.Provider value={[store, actions, computed]}>
      {props.children}
    </CharacterContext.Provider>
  );
};

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
}
