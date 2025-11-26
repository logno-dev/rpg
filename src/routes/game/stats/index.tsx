import { createSignal, Show, For, createEffect, Suspense } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useCharacter } from '~/lib/CharacterContext';
import { useActiveEffects } from '~/lib/ActiveEffectsContext';
import { GameLayout } from '~/components/GameLayout';
import { getSelectedCharacterId, useBasicCharacterData } from '~/lib/game-helpers';

export default function StatsRoute() {
  const navigate = useNavigate();
  
  // Use shared hook to initialize character context (uses server session!)
  // This will redirect server-side if no character is selected
  const basicData = useBasicCharacterData();
  
  const [store, actions] = useCharacter();
  const [effectsStore, effectsActions] = useActiveEffects();
  
  // Get character ID from context (falls back to localStorage for client-side calls)
  const characterId = () => store.character?.id || getSelectedCharacterId();

  // Redirect to active dungeon if one exists
  createEffect(() => {
    const data = basicData();
    if (data?.activeDungeonProgress) {
      console.log('[Stats] Active dungeon found, redirecting to:', data.activeDungeonProgress.dungeon_id);
      navigate(`/game/dungeon/${data.activeDungeonProgress.dungeon_id}`);
    }
  });

  // Initialize context with basic data when it arrives
  createEffect(() => {
    const data = basicData();
    if (data) {
      console.log('[Stats] basicData loaded:', {
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
      
      console.log('[Stats] Context updated');
    }
  });

  const [assigningStats, setAssigningStats] = createSignal(false);
  const [pendingStats, setPendingStats] = createSignal<Record<string, number>>({});

  const currentCharacter = () => store.character;
  
  const equipmentBonuses = () => {
    const character = currentCharacter();
    if (!character) return {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    };

    const bonuses = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    };

    const inventory = store.inventory || [];
    const equippedItems = inventory.filter((i: any) => i.equipped === 1);
    equippedItems.forEach((item: any) => {
      if (item.strength_bonus) bonuses.strength += item.strength_bonus;
      if (item.dexterity_bonus) bonuses.dexterity += item.dexterity_bonus;
      if (item.constitution_bonus) bonuses.constitution += item.constitution_bonus;
      if (item.intelligence_bonus) bonuses.intelligence += item.intelligence_bonus;
      if (item.wisdom_bonus) bonuses.wisdom += item.wisdom_bonus;
      if (item.charisma_bonus) bonuses.charisma += item.charisma_bonus;
    });

    return bonuses;
  };

  const totalPendingPoints = () => {
    return Object.values(pendingStats()).reduce((sum, val) => sum + val, 0);
  };

  const availablePoints = () => {
    return (currentCharacter()?.available_points || 0) - totalPendingPoints();
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

  const handleAssignStats = async () => {
    const stats = pendingStats();
    if (Object.keys(stats).length === 0) return;

    setAssigningStats(true);
    try {
      const character = currentCharacter();
      if (!character) return;
      
      // Optimistically update character stats in store
      const updatedStats: any = { ...character };
      Object.entries(stats).forEach(([stat, value]) => {
        const currentValue = character[stat as keyof typeof character];
        updatedStats[stat] = (typeof currentValue === 'number' ? currentValue : 0) + value;
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
        // Mana: Base + (Level × 20) + (INT - 10) × 5
        const baseMana = 100;
        const levelBonus = updatedStats.level * 20;
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
      
      // Use server-confirmed data
      if (result.character) {
        // Preserve the current health/mana values from optimistic update
        result.character.current_health = updatedStats.current_health;
        result.character.current_mana = updatedStats.current_mana;
        
        actions.setCharacter(result.character);
      }
      
    } catch (error: any) {
      console.error('Assign stats error:', error);
      setPendingStats({});
      // Refetch to get fresh data on error
      const response = await fetch(`/api/game/character-data?characterId=${characterId()}`);
      if (response.ok) {
        const freshData = await response.json();
        if (freshData.character) {
          actions.setCharacter(freshData.character);
        }
      }
    } finally {
      setAssigningStats(false);
    }
  };

  const LoadingSkeleton = () => (
    <div class="card">
      <div style={{ height: "400px", display: "flex", "align-items": "center", "justify-content": "center", "flex-direction": "column", gap: "1rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
        <div style={{ "font-size": "3rem" }}>📊</div>
        <div style={{ "font-size": "1.25rem", color: "var(--text-secondary)" }}>Loading stats...</div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );

  return (
    <GameLayout>
      <Suspense fallback={<LoadingSkeleton />}>
      <Show when={basicData() && currentCharacter()}>
      <div class="card">
        <h3 style={{ "margin-bottom": "1rem" }}>Character Stats</h3>
        
        <Show when={currentCharacter()!.available_points > 0}>
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
              
              const baseStat = () => character[stat.key as keyof typeof character] as number;
              const equipBonus = () => equipmentBonuses()[stat.key as keyof ReturnType<typeof equipmentBonuses>];
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
                    <Show when={currentCharacter()!.available_points > 0}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          class="button secondary"
                          onClick={() => adjustPendingStat(stat.key, -1)}
                          disabled={pending() === 0}
                          style={{ padding: "0.5rem 0.75rem", "font-size": "0.875rem" }}
                        >
                          −
                        </button>
                        <button
                          class="button"
                          onClick={() => adjustPendingStat(stat.key, 1)}
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
      </Suspense>
    </GameLayout>
  );
}
