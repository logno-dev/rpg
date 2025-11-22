import { createEffect, onCleanup } from "solid-js";

type HealthRegenProps = {
  maxHealth: () => number;
  maxMana: () => number;
  currentHealth: () => number;
  currentMana: () => number;
  constitution: () => number;
  wisdom: () => number;
  isInCombat: () => boolean;
  onRegenTick: (health: number, mana: number) => void;
};

const REGEN_TICK_INTERVAL = 1000; // 1 second

// Out of combat regen rates
const BASE_HP_REGEN_OUT_OF_COMBAT = 2;
const BASE_MANA_REGEN_OUT_OF_COMBAT = 3;

// In combat regen rates
const BASE_HP_REGEN_IN_COMBAT = 0.1;
const BASE_MANA_REGEN_IN_COMBAT = 0.2;

export function HealthRegen(props: HealthRegenProps) {
  let healthIntervalId: number | undefined;
  let manaIntervalId: number | undefined;

  // Separate effect for HEALTH regen
  createEffect(() => {
    const currentH = props.currentHealth();
    const maxH = props.maxHealth();
    const inCombat = props.isInCombat();
    
    // Clear existing health interval
    if (healthIntervalId !== undefined) {
      clearInterval(healthIntervalId);
      healthIntervalId = undefined;
    }
    
    // Check if we need health regen
    if (currentH >= maxH) {
      return;
    }

    healthIntervalId = window.setInterval(() => {
      const currentHealth = props.currentHealth();
      const maxHealth = props.maxHealth();
      const constitution = props.constitution();
      const isInCombat = props.isInCombat();
      const currentMana = props.currentMana();

      // Stop if health is full
      if (currentHealth >= maxHealth) {
        if (healthIntervalId !== undefined) {
          clearInterval(healthIntervalId);
          healthIntervalId = undefined;
        }
        return;
      }

      // Calculate health regen
      const baseHealthRegen = isInCombat ? BASE_HP_REGEN_IN_COMBAT : BASE_HP_REGEN_OUT_OF_COMBAT;
      const constitutionBonusMultiplier = isInCombat ? 0.01 : 0.2;
      const constitutionBonus = (constitution - 10) * constitutionBonusMultiplier;
      const healthRegenRate = baseHealthRegen + constitutionBonus;

      const newHealth = Math.min(maxHealth, currentHealth + healthRegenRate);

      // Update health (keep mana the same)
      props.onRegenTick(Math.round(newHealth), currentMana);
    }, REGEN_TICK_INTERVAL);
  });

  // Separate effect for MANA regen
  createEffect(() => {
    const currentM = props.currentMana();
    const maxM = props.maxMana();
    const inCombat = props.isInCombat();
    
    // Clear existing mana interval
    if (manaIntervalId !== undefined) {
      clearInterval(manaIntervalId);
      manaIntervalId = undefined;
    }
    
    // Check if we need mana regen (only out of combat)
    if (currentM >= maxM || inCombat) {
      return;
    }

    manaIntervalId = window.setInterval(() => {
      const currentMana = props.currentMana();
      const maxMana = props.maxMana();
      const wisdom = props.wisdom();
      const isInCombat = props.isInCombat();
      const currentHealth = props.currentHealth();

      // Stop if mana is full or entered combat
      if (currentMana >= maxMana || isInCombat) {
        if (manaIntervalId !== undefined) {
          clearInterval(manaIntervalId);
          manaIntervalId = undefined;
        }
        return;
      }

      // Calculate mana regen (only out of combat)
      const baseManaRegen = BASE_MANA_REGEN_OUT_OF_COMBAT;
      const wisdomBonusMultiplier = 0.3;
      const wisdomBonus = (wisdom - 10) * wisdomBonusMultiplier;
      const manaRegenRate = baseManaRegen + wisdomBonus;

      const newMana = Math.min(maxMana, currentMana + manaRegenRate);

      // Update mana (keep health the same)
      props.onRegenTick(currentHealth, Math.round(newMana));
    }, REGEN_TICK_INTERVAL);
  });

  onCleanup(() => {
    if (healthIntervalId !== undefined) {
      clearInterval(healthIntervalId);
      healthIntervalId = undefined;
    }
    if (manaIntervalId !== undefined) {
      clearInterval(manaIntervalId);
      manaIntervalId = undefined;
    }
  });

  return null;
}
