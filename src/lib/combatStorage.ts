import type { Mob, ActiveEffect } from "~/lib/db";

const COMBAT_STORAGE_KEY = 'rpg_combat_state';

export type StoredCombatState = {
  // Core combat state
  characterHealth: number;
  characterMana: number;
  mobHealth: number;
  characterTicks: number;
  mobTicks: number;
  characterAttackTicks: number;
  mobAttackTicks: number;
  log: string[];
  
  // Combat context
  mob: Mob;
  timestamp: number; // When the state was saved
  
  // Active effects state (using ActiveEffect type from db)
  activeDots?: ActiveEffect[];
  activeHots?: ActiveEffect[];
  activeDebuffs?: ActiveEffect[];
  thornsEffect?: {
    name: string;
    reflectPercent: number;
    duration: number;
    expiresAt: number;
  } | null;
  
  // Ability cooldowns
  abilityCooldowns?: Record<number, number>; // ability_id -> remaining seconds
};

/**
 * Save combat state to localStorage
 */
export function saveCombatState(state: StoredCombatState): void {
  try {
    const stateWithTimestamp = {
      ...state,
      timestamp: Date.now(),
    };
    localStorage.setItem(COMBAT_STORAGE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('[CombatStorage] Failed to save combat state:', error);
  }
}

/**
 * Load combat state from localStorage
 * Returns null if no state exists or if state is expired
 */
export function loadCombatState(maxAgeMs: number = 30 * 60 * 1000): StoredCombatState | null {
  try {
    const stored = localStorage.getItem(COMBAT_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    
    const state = JSON.parse(stored) as StoredCombatState;
    
    // Check if state is too old (default: 30 minutes)
    const age = Date.now() - state.timestamp;
    if (age > maxAgeMs) {
      clearCombatState();
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('[CombatStorage] Failed to load combat state:', error);
    return null;
  }
}

/**
 * Clear combat state from localStorage
 */
export function clearCombatState(): void {
  try {
    localStorage.removeItem(COMBAT_STORAGE_KEY);
  } catch (error) {
    console.error('[CombatStorage] Failed to clear combat state:', error);
  }
}

/**
 * Check if there is a saved combat state
 */
export function hasSavedCombatState(): boolean {
  try {
    return localStorage.getItem(COMBAT_STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}
