import { createAsync, useParams, useNavigate, redirect, revalidate } from "@solidjs/router";
import { createSignal, Show, For, createEffect, onCleanup, createMemo, onMount } from "solid-js";
import { getActiveDungeon, getCharacter, getInventory, getAbilitiesWithEffects, getHotbar } from "~/lib/game";
import { getUser, getSelectedCharacter as getSelectedCharacterFromSession } from "~/lib/auth";
import { CombatEngine } from "~/components/CombatEngine";
import { ActiveEffectsDisplay } from "~/components/ActiveEffectsDisplay";
import { useCharacter } from "~/lib/CharacterContext";
import { db } from "~/lib/db";

async function getDungeonData(dungeonId: number) {
  "use server";
  
  console.log('[getDungeonData] Starting fetch from session');
  
  // Verify user is logged in
  const user = await getUser();
  if (!user) {
    console.log('[getDungeonData] No user, redirecting to /');
    throw redirect("/");
  }
  
  // Get character ID from session
  const characterId = await getSelectedCharacterFromSession();
  console.log('[getDungeonData] Character ID from session:', characterId);
  
  if (!characterId) {
    console.log('[getDungeonData] No character selected, redirecting');
    throw redirect("/character-select");
  }
  
  // Verify character belongs to user
  const charResult = await db.execute({
    sql: "SELECT * FROM characters WHERE id = ? AND user_id = ?",
    args: [characterId, user.id]
  });
  const character = charResult.rows[0];
  if (!character) {
    console.log('[getDungeonData] Character not found or not owned, redirecting');
    throw redirect("/character-select");
  }
  
  // Get active dungeon progress
  const progressData = await getActiveDungeon(characterId);
  
  if (!progressData) {
    // No active dungeon, redirect back to game
    console.log('[getDungeonData] No active dungeon, redirecting to /game');
    throw redirect(`/game`);
  }
  
  // Verify this is the correct dungeon
  if (progressData.dungeon_id !== dungeonId) {
    // Wrong dungeon, redirect to correct one
    console.log('[getDungeonData] Wrong dungeon, redirecting to correct dungeon');
    throw redirect(`/game/dungeon/${progressData.dungeon_id}`);
  }
  
  // Fetch full dungeon info
  const dungeonResult = await db.execute({
    sql: `
      SELECT d.*, 
             COUNT(de.id) as total_encounters,
             (SELECT name FROM named_mobs WHERE id = d.boss_mob_id) as boss_name
      FROM dungeons d
      LEFT JOIN dungeon_encounters de ON de.dungeon_id = d.id
      WHERE d.id = ?
      GROUP BY d.id
    `,
    args: [dungeonId]
  });
  const dungeon = dungeonResult.rows[0] as any;
  
  if (!dungeon) {
    throw redirect(`/game`);
  }
  
  // Load character data for CharacterContext
  const characterData = await getCharacter(characterId);
  const inventory = await getInventory(characterId);
  const abilities = await getAbilitiesWithEffects(characterId);
  const hotbar = await getHotbar(characterId);
  
  return { 
    progress: progressData,
    dungeon,
    characterId,
    character: characterData,
    inventory,
    abilities,
    hotbar
  };
}

export default function DungeonRoute() {
  const params = useParams<{ dungeonId: string }>();
  const navigate = useNavigate();
  const dungeonId = () => parseInt(params.dungeonId!);
  
  const data = createAsync(() => getDungeonData(dungeonId()));
  
  // Get character ID from loaded data
  const characterId = () => data()?.characterId ?? null;
  const [store, actions] = useCharacter();
  
  const [currentEncounter, setCurrentEncounter] = createSignal<any>(null);
  const [activeMob, setActiveMob] = createSignal<any>(null);
  const [activeNamedMobId, setActiveNamedMobId] = createSignal<number | null>(null);
  const [combatLog, setCombatLog] = createSignal<string[]>([]);
  const [showAbandonModal, setShowAbandonModal] = createSignal(false);
  const [combatHots, setCombatHots] = createSignal<any[]>([]);
  const [combatThorns, setCombatThorns] = createSignal<any>(null);
  const [isScrolled, setIsScrolled] = createSignal(false);
  
  // Track combat HP/mana separately (updated by CombatEngine during combat)
  const [combatHealth, setCombatHealth] = createSignal<number | null>(null);
  const [combatMana, setCombatMana] = createSignal<number | null>(null);
  
  // Dungeon completion modal
  const [showCompletionModal, setShowCompletionModal] = createSignal(false);
  
  // Initialize CharacterContext and dungeon session when data loads
  createEffect(() => {
    const dungeonData = data();
    if (dungeonData) {
      // Initialize CharacterContext
      actions.setCharacter(dungeonData.character);
      actions.setInventory(dungeonData.inventory);
      actions.setAbilities(dungeonData.abilities);
      actions.setHotbar(dungeonData.hotbar);
      
      // Initialize dungeon session
      actions.setDungeonSession({
        id: dungeonData.progress.id,
        dungeon_id: dungeonData.progress.dungeon_id,
        current_encounter: dungeonData.progress.current_encounter,
        total_encounters: dungeonData.dungeon.total_encounters || 0,
        session_health: dungeonData.progress.session_health,
        session_mana: dungeonData.progress.session_mana,
        boss_mob_id: dungeonData.progress.boss_mob_id,
        dungeon_name: dungeonData.dungeon.name || 'Unknown Dungeon'
      });
    }
  });
  
  // Scroll detection for sticky header
  onMount(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    onCleanup(() => window.removeEventListener('scroll', handleScroll));
  });
  
  // Cleanup dungeon session when leaving
  onCleanup(() => {
    // Don't clear session here - let abandon handler do it
  });
  
  const handleStartEncounter = async () => {
    try {
      const currentHealth = store.dungeonSession?.session_health || store.character?.current_health || 100;
      const currentMana = store.dungeonSession?.session_mana || store.character?.current_mana || 0;
      
      const response = await fetch('/api/game/start-dungeon-encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: characterId(),
          dungeonId: dungeonId(),
          currentHealth,
          currentMana
        }),
      });
      
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Set current encounter
      setCurrentEncounter(result.encounter);
      setActiveMob(result.mob);
      
      if (result.isBoss && result.namedMob) {
        setActiveNamedMobId(result.namedMob.id);
        const title = result.namedMob?.title ? ` ${result.namedMob.title}` : '';
        setCombatLog([`Boss Fight!`, `${result.mob.name}${title} blocks your path!`]);
      } else {
        setActiveNamedMobId(null);
        setCombatLog([`Encounter ${progress()?.current_encounter}`, `${result.mob.name} attacks!`]);
      }
      
    } catch (error: any) {
      console.error('Failed to start encounter:', error);
      alert('Failed to start encounter: ' + error.message);
    }
  };
  
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
          finalMana: finalState.characterMana,
        }),
      });
      
      const responseData = await response.json();
      
      if (responseData.result === 'victory') {
        // Clear combat UI immediately
        setActiveMob(null);
        setActiveNamedMobId(null);
        setCombatHots([]);
        setCombatThorns(null);
        
        // Advance to next encounter or complete dungeon
        const advanceResponse = await fetch('/api/game/advance-dungeon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            characterId: characterId(),
            currentHealth: finalState.characterHealth,
            currentMana: finalState.characterMana
          }),
        });
        
        const advanceResult = await advanceResponse.json();
        
        if (advanceResult.completed) {
          // Dungeon complete! Update character HP/mana and clear session
          actions.updateHealth(finalState.characterHealth, finalState.characterMana);
          actions.setDungeonSession(null);
          
          // Clear combat signals
          setCombatHealth(null);
          setCombatMana(null);
          
          // Show completion modal instead of alert
          setShowCompletionModal(true);
        } else if (advanceResult.progress) {
          // Update dungeon session with new encounter number and HP/mana
          actions.updateDungeonEncounter(
            advanceResult.progress.current,
            finalState.characterHealth,
            finalState.characterMana
          );
          
          // Clear combat state signals AFTER store is updated to avoid showing stale values
          setCombatHealth(null);
          setCombatMana(null);
        }
      } else {
        // Defeat - abandon dungeon
        await handleAbandonDungeon();
        
        // Clear combat signals
        setCombatHealth(null);
        setCombatMana(null);
      }
      
    } catch (error: any) {
      console.error('Combat end error:', error);
      alert('Error ending combat: ' + error.message);
    }
  };
  
  const handleHealthChange = (health: number, mana: number) => {
    // During combat, DON'T update dungeon session here
    // The CombatEngine manages HP/mana internally and reports final values via onCombatEnd
    // This callback is only for tracking changes, not for syncing state during combat
    // The final HP/mana will be saved when combat ends via handleCombatEnd
  };
  
  const handleRegenTick = (health: number, mana: number) => {
    actions.updateDungeonHealth(health, mana);
  };
  
  const handleAbandonDungeon = async () => {
    try {
      const response = await fetch('/api/game/abandon-dungeon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: characterId() }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Clear dungeon session
        actions.setDungeonSession(null);
        
        // Navigate back to game
        navigate(`/game`);
      }
    } catch (error) {
      console.error('Failed to abandon dungeon:', error);
      alert('Failed to abandon dungeon');
    }
  };
  
  const dungeonData = () => data();
  const dungeon = () => dungeonData()?.dungeon;
  
  // Use dungeon session for current encounter (reactive to updates)
  const progress = () => {
    const session = store.dungeonSession;
    const initialProgress = dungeonData()?.progress;
    
    if (session) {
      return {
        ...initialProgress,
        current_encounter: session.current_encounter,
        session_health: session.session_health,
        session_mana: session.session_mana
      };
    }
    return initialProgress;
  };
  
  // Equipment helpers (defined before memos that use them)
  const equippedWeapon = () => {
    return (store.inventory || []).find((i: any) => i.equipped && i.slot === 'weapon');
  };
  
  const equippedArmor = () => {
    return (store.inventory || []).filter((i: any) => i.equipped && i.slot !== 'weapon');
  };
  
  const currentHealth = createMemo(() => {
    // During combat, use combat state; otherwise use store
    return combatHealth() ?? (store.dungeonSession?.session_health || store.character?.current_health || 0);
  });
  
  const currentMana = createMemo(() => {
    // During combat, use combat state; otherwise use store
    return combatMana() ?? (store.dungeonSession?.session_mana || store.character?.current_mana || 0);
  });
  
  // Calculate actual max health including equipment and active effects
  const currentMaxHealth = createMemo(() => {
    if (!store.character) return 100;
    
    // Get base constitution
    let totalConstitution = store.character.constitution;
    
    // Add equipment bonuses
    const armor = equippedArmor();
    if (Array.isArray(armor)) {
      armor.forEach((item: any) => {
        if (item.constitution_bonus) {
          totalConstitution += item.constitution_bonus;
        }
      });
    }
    
    // Check weapon for constitution bonus
    const weapon = equippedWeapon();
    if (weapon?.constitution_bonus) {
      totalConstitution += weapon.constitution_bonus;
    }
    
    // Formula: Base + (Level × 20) + (CON - 10) × 8
    const baseHealth = 100;
    const levelBonus = store.character.level * 20;
    const constitutionBonus = (totalConstitution - 10) * 8;
    
    return baseHealth + levelBonus + constitutionBonus;
  });
  
  // Calculate actual max mana including equipment and active effects
  const currentMaxMana = createMemo(() => {
    if (!store.character) return 100;
    
    // Get base intelligence
    let totalIntelligence = store.character.intelligence;
    
    // Add equipment bonuses
    const armor = equippedArmor();
    if (Array.isArray(armor)) {
      armor.forEach((item: any) => {
        if (item.intelligence_bonus) {
          totalIntelligence += item.intelligence_bonus;
        }
      });
    }
    
    // Check weapon for intelligence bonus
    const weapon = equippedWeapon();
    if (weapon?.intelligence_bonus) {
      totalIntelligence += weapon.intelligence_bonus;
    }
    
    // Formula: Base + (Level × 20) + (INT - 10) × 5
    const baseMana = 100;
    const levelBonus = store.character.level * 20;
    const intelligenceBonus = (totalIntelligence - 10) * 5;
    
    return baseMana + levelBonus + intelligenceBonus;
  });
  
  const hotbarActions = createMemo(() => {
    const hotbar = store.hotbar || [];
    const abilities = store.abilities || [];
    const inventory = store.inventory || [];
    
    return hotbar
      .filter((slot: any) => slot.type) // Only include assigned slots
      .map((slot: any) => {
        if (slot.type === 'ability' && slot.ability_id) {
          const ability = abilities.find((a: any) => a.ability_id === slot.ability_id || a.id === slot.ability_id);
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
              quantity: item.quantity || 1
            } : null,
          };
        }
        return null;
      })
      .filter((action: any) => action && (action.ability || action.item));
  });

  return (
    <div style={{ 
      "min-height": "100vh",
      background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
      padding: "2rem",
      color: "white"
    }}>
      {/* Sticky Header on Scroll */}
      <Show when={isScrolled() && store.character}>
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
            <div style={{ "white-space": "nowrap", "font-weight": "bold" }}>
              {store.character.name} <span style={{ color: "var(--text-secondary)" }}>Lv.{store.character.level}</span>
            </div>
            
            {/* Health Bar */}
            <div>
              <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                <span>HP</span>
                <span>{currentHealth()}/{currentMaxHealth()}</span>
              </div>
              <div class="progress-bar" style={{ height: "8px" }}>
                <div class="progress-fill health" style={{ width: `${(currentHealth() / currentMaxHealth()) * 100}%` }} />
              </div>
            </div>
            
            {/* Mana Bar */}
            <div>
              <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                <span>MP</span>
                <span>{currentMana()}/{currentMaxMana()}</span>
              </div>
              <div class="progress-bar" style={{ height: "8px" }}>
                <div class="progress-fill mana" style={{ width: `${(currentMana() / currentMaxMana()) * 100}%` }} />
              </div>
            </div>
            
            {/* Dungeon Progress */}
            <div style={{ "white-space": "nowrap", "font-weight": "bold", color: "var(--accent)" }}>
              🏰 {progress()?.current_encounter}/{dungeon()?.total_encounters}
            </div>
          </div>
        </div>
      </Show>
      
      <Show when={data()} fallback={
        <div style={{ 
          display: "flex", 
          "justify-content": "center", 
          "align-items": "center", 
          "min-height": "60vh" 
        }}>
          <div style={{ "text-align": "center" }}>
            <div style={{ "font-size": "3rem", "margin-bottom": "1rem" }}>🏰</div>
            <div>Loading dungeon...</div>
          </div>
        </div>
      }>
        {/* Character Info Panel */}
        <div class="card" style={{ "margin-bottom": "1rem" }}>
          <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "flex-wrap": "wrap", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <h2>{store.character?.name}</h2>
              <p style={{ color: "var(--text-secondary)", "margin-bottom": "0" }}>
                Level {store.character?.level}
              </p>
            </div>
          </div>
          
          <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", "margin-top": "1rem" }}>
            <div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                <span>
                  Health
                  <Show when={activeMob()}> (Combat)</Show>
                </span>
                <span>{currentHealth()}/{currentMaxHealth()}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill health" style={{ width: `${(currentHealth() / currentMaxHealth()) * 100}%` }} />
              </div>
            </div>
            <div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                <span>
                  Mana
                  <Show when={activeMob()}> (Combat)</Show>
                </span>
                <span>{currentMana()}/{currentMaxMana()}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill mana" style={{ width: `${(currentMana() / currentMaxMana()) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Header */}
        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
            <div>
              <h1 style={{ margin: 0, "margin-bottom": "0.5rem" }}>
                {dungeon()?.name || 'Dungeon'}
              </h1>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                {dungeon()?.description}
              </p>
            </div>
            <button 
              class="button" 
              style={{ background: "var(--danger)" }}
              onClick={() => setShowAbandonModal(true)}
            >
              Abandon Dungeon
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h3 style={{ "margin-bottom": "1rem" }}>Progress</h3>
          <div style={{ 
            display: "flex", 
            "flex-wrap": "wrap",
            gap: "0.5rem",
            "align-items": "center"
          }}>
            <For each={Array.from({ length: dungeon()?.total_encounters || 0 })}>
              {(_, index) => {
                const encounterNum = index() + 1;
                const totalEncounters = () => dungeon()?.total_encounters || 0;
                const currentEncounter = () => progress()?.current_encounter || 1;
                const isBoss = () => encounterNum === totalEncounters();
                const isCurrent = () => encounterNum === currentEncounter();
                const isComplete = () => encounterNum < currentEncounter();
                
                return (
                  <div style={{
                    flex: "1 1 auto",
                    "min-width": "80px",
                    height: "60px",
                    background: isComplete() ? "var(--success)" : isCurrent() ? "var(--accent)" : "var(--bg-light)",
                    "border-radius": "8px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-weight": "bold",
                    border: isCurrent() ? "3px solid var(--accent)" : "none",
                    position: "relative"
                  }}>
                    <div style={{ "text-align": "center" }}>
                      <div style={{ "font-size": "1.5rem" }}>
                        {isBoss() ? '👑' : isComplete() ? '✓' : encounterNum}
                      </div>
                      <div style={{ "font-size": "0.7rem", color: "var(--text-secondary)" }}>
                        {isBoss() ? 'Boss' : `Encounter ${encounterNum}`}
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        
        {/* Combat or Ready State */}
        <Show 
          when={activeMob()} 
          fallback={
            <div class="card" style={{ "text-align": "center", padding: "3rem" }}>
              <div style={{ "font-size": "4rem", "margin-bottom": "1rem" }}>⚔️</div>
              <h2 style={{ "margin-bottom": "1rem" }}>
                Ready for Encounter {progress()?.current_encounter}
              </h2>
              <p style={{ color: "var(--text-secondary)", "margin-bottom": "2rem" }}>
                {progress()?.current_encounter === dungeon()?.total_encounters 
                  ? "This is the final boss battle!" 
                  : "Click below to begin the encounter"}
              </p>
              <button 
                class="button primary" 
                style={{ "font-size": "1.2rem", padding: "1rem 2rem" }}
                onClick={handleStartEncounter}
              >
                {progress()?.current_encounter === dungeon()?.total_encounters 
                  ? "⚔️ Face the Boss" 
                  : "⚔️ Start Encounter"}
              </button>
            </div>
          }
        >
          <Show when={store.character && activeMob()}>
            <CombatEngine
                character={store.character!}
                mob={activeMob()!}
                equippedWeapon={equippedWeapon()}
                equippedArmor={equippedArmor()}
                currentHealth={currentHealth()}
                currentMana={currentMana()}
                hotbarActions={hotbarActions()}
                onCombatEnd={handleCombatEnd}
                onHealthChange={(health, mana) => {
                  // Update combat state signals so UI reflects combat changes
                  setCombatHealth(health);
                  setCombatMana(mana);
                }}
                onActiveHotsChange={setCombatHots}
                onThornsChange={setCombatThorns}
                onUseConsumable={async (itemId) => {
                  const item = store.inventory?.find((i: any) => i.id === itemId);
                  
                  // Update inventory via API
                  const response = await fetch('/api/game/use-item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ characterId: characterId(), inventoryItemId: itemId }),
                  });
                  const result = await response.json();
                  actions.setInventory(result.inventory);
                  
                  // Return restoration values so CombatEngine can apply them internally
                  if (item) {
                    return {
                      healthRestore: item.health_restore || 0,
                      manaRestore: item.mana_restore || 0
                    };
                  }
                }}
              />
          </Show>
        </Show>
        
        {/* Active Effects */}
        <ActiveEffectsDisplay combatHots={combatHots()} combatThorns={combatThorns()} />
      </Show>
      
      {/* Abandon Dungeon Modal */}
      <Show when={showAbandonModal()}>
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0, 0, 0, 0.9)", 
            display: "flex", 
            "align-items": "center", 
            "justify-content": "center",
            "z-index": 1000,
            padding: "1rem"
          }}
          onClick={() => setShowAbandonModal(false)}
        >
          <div 
            class="card" 
            style={{ 
              "max-width": "500px",
              width: "100%",
              padding: "2rem",
              "text-align": "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ "font-size": "3rem", "margin-bottom": "1rem" }}>⚠️</div>
            <h2 style={{ "margin-bottom": "1rem", color: "var(--danger)" }}>
              Abandon Dungeon?
            </h2>
            <p style={{ "font-size": "1rem", "margin-bottom": "2rem", color: "var(--text-secondary)" }}>
              Are you sure you want to abandon this dungeon? You will lose all progress and return to town.
            </p>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                class="button secondary" 
                style={{ flex: 1 }}
                onClick={() => setShowAbandonModal(false)}
              >
                Cancel
              </button>
              <button 
                class="button danger" 
                style={{ flex: 1 }}
                onClick={async () => {
                  setShowAbandonModal(false);
                  await handleAbandonDungeon();
                }}
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Dungeon Completion Modal */}
      <Show when={showCompletionModal()}>
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0, 0, 0, 0.9)", 
            display: "flex", 
            "align-items": "center", 
            "justify-content": "center",
            "z-index": 1000,
            padding: "1rem"
          }}
          onClick={() => {
            setShowCompletionModal(false);
            navigate(`/game`);
          }}
        >
          <div 
            class="card" 
            style={{ 
              "max-width": "500px",
              width: "100%",
              padding: "2rem",
              "text-align": "center",
              animation: "slideUp 0.3s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ "font-size": "4rem", "margin-bottom": "1rem" }}>🎉</div>
            <h2 style={{ "margin-bottom": "1rem", color: "var(--accent)" }}>
              Dungeon Complete!
            </h2>
            <p style={{ "font-size": "1.1rem", "margin-bottom": "2rem", color: "var(--text-secondary)" }}>
              You have defeated {dungeon()?.name} and emerged victorious!
            </p>
            
            <button 
              class="button primary" 
              style={{ width: "100%", "font-size": "1.1rem", padding: "1rem" }}
              onClick={() => {
                setShowCompletionModal(false);
                navigate(`/game`);
              }}
            >
              Return to Town
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
