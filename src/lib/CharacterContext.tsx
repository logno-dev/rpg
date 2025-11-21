import { createContext, useContext, ParentComponent, createEffect } from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { Character, Item, Region, Ability } from "~/lib/db";

// Types
type InventoryItem = {
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

type CharacterStore = {
  character: Character | null;
  inventory: InventoryItem[];
  abilities: AbilityWithCooldown[];
  regions: Region[];
  currentRegion: Region | null;
  merchants: Merchant[];
  dungeons: Dungeon[];
  isLoading: boolean;
};

type CharacterContextValue = [
  store: CharacterStore,
  actions: {
    setCharacter: (character: Character) => void;
    setInventory: (inventory: InventoryItem[]) => void;
    setAbilities: (abilities: AbilityWithCooldown[]) => void;
    setRegions: (regions: Region[]) => void;
    setCurrentRegion: (region: Region) => void;
    setMerchants: (merchants: Merchant[]) => void;
    setDungeons: (dungeons: Dungeon[]) => void;
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
    reset: () => void;
  }
];

const CharacterContext = createContext<CharacterContextValue>();

export const CharacterProvider: ParentComponent<{ initialData?: Partial<CharacterStore> }> = (props) => {
  const [store, setStore] = createStore<CharacterStore>({
    character: props.initialData?.character || null,
    inventory: props.initialData?.inventory || [],
    abilities: props.initialData?.abilities || [],
    regions: props.initialData?.regions || [],
    currentRegion: props.initialData?.currentRegion || null,
    merchants: props.initialData?.merchants || [],
    dungeons: props.initialData?.dungeons || [],
    isLoading: false,
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

    setRegions: (regions: Region[]) => {
      setStore("regions", regions);
    },

    setCurrentRegion: (region: Region) => {
      setStore("currentRegion", region);
    },

    setMerchants: (merchants: Merchant[]) => {
      setStore("merchants", merchants);
    },

    setDungeons: (dungeons: Dungeon[]) => {
      setStore("dungeons", dungeons);
    },

    updateHealth: (health: number, mana?: number) => {
      setStore("character", (char) => {
        if (!char) return char;
        return {
          ...char,
          current_health: health,
          ...(mana !== undefined ? { current_mana: mana } : {}),
        };
      });
    },

    updateGold: (gold: number) => {
      setStore("character", (char) => {
        if (!char) return char;
        return { ...char, gold };
      });
    },

    updateExperience: (exp: number) => {
      setStore("character", (char) => {
        if (!char) return char;
        return { ...char, experience: exp };
      });
    },

    updateStats: (stats: Partial<Character>) => {
      setStore("character", (char) => {
        if (!char) return char;
        return { ...char, ...stats };
      });
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

    reset: () => {
      setStore({
        character: null,
        inventory: [],
        abilities: [],
        regions: [],
        currentRegion: null,
        merchants: [],
        dungeons: [],
        isLoading: false,
      });
    },
  };

  return (
    <CharacterContext.Provider value={[store, actions]}>
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
