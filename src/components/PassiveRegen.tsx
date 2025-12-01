import { createSignal, onCleanup, Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { HealthRegen } from "~/components/HealthRegen";
import { useCharacter } from "~/lib/CharacterContext";
import { hasSavedCombatState } from "~/lib/combatStorage";

/**
 * Passive regeneration component that can be added to any route.
 * Automatically pauses when combat is stored in localStorage.
 * Only use this on NON-GAME routes (inventory, crafting, etc.)
 */
export function PassiveRegen() {
  const [store, actions] = useCharacter();
  const location = useLocation();
  const [isRegenPaused, setIsRegenPaused] = createSignal(false);

  // Check for saved combat state periodically
  const checkPausedState = () => {
    setIsRegenPaused(hasSavedCombatState());
  };
  
  // Check immediately
  checkPausedState();
  
  // Check every 2 seconds in case combat state changes
  const intervalId = setInterval(checkPausedState, 2000);
  
  // Clean up interval on unmount
  onCleanup(() => {
    clearInterval(intervalId);
  });

  const currentMaxHealth = () => {
    const character = store.character;
    if (!character) return 100;
    
    const baseHealth = 100;
    const conBonus = (character.constitution - 10) * 10;
    return baseHealth + conBonus;
  };

  const currentMaxMana = () => {
    const character = store.character;
    if (!character) return 0;
    
    const baseMana = character.intelligence * 5;
    return baseMana;
  };

  const currentHealth = () => store.character?.current_health ?? 100;
  const currentMana = () => store.character?.current_mana ?? 0;

  const handleRegenTick = (health: number, mana: number) => {
    // Double-check character still exists before updating
    if (!store.character) return;
    actions.updateHealth(health, mana);
  };

  // Use Show to conditionally render - prevents accessing null properties
  return (
    <Show when={store.character}>
      <HealthRegen
        maxHealth={currentMaxHealth}
        maxMana={currentMaxMana}
        currentHealth={currentHealth}
        currentMana={currentMana}
        constitution={() => store.character?.constitution || 10}
        wisdom={() => store.character?.wisdom || 10}
        isInCombat={() => false} // Never in combat on sub-routes
        isPaused={isRegenPaused}
        onRegenTick={handleRegenTick}
      />
    </Show>
  );
}
