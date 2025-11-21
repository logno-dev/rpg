import { createSignal, onMount, onCleanup, For, Show, createEffect, onCleanup as onCleanupEffect } from "solid-js";
import type { Character, Mob, Item, Ability, AbilityEffect, ActiveEffect } from "~/lib/db";
import { useActiveEffects } from "~/lib/ActiveEffectsContext";
import { EffectProcessor } from "~/lib/EffectProcessor";

type CombatState = {
  characterHealth: number;
  mobHealth: number;
  characterTicks: number;
  mobTicks: number;
  characterAttackTicks: number;
  mobAttackTicks: number;
  log: string[];
  isActive: boolean;
  result?: 'victory' | 'defeat';
};

type AbilityWithCooldown = Ability & {
  last_used_at: number;
  effects?: AbilityEffect[]; // Preloaded effects
};

type HotbarAction = {
  slot: number;
  type: 'ability' | 'consumable';
  ability?: AbilityWithCooldown;
  item?: {
    id: number;
    name: string;
    health_restore: number;
    mana_restore: number;
    quantity: number;
  };
};

type CombatEngineProps = {
  character: Character;
  mob: Mob;
  equippedWeapon?: Item;
  equippedArmor: Item[];
  currentHealth: number; // External health state (from potions, etc.)
  currentMana: number; // External mana state
  hotbarActions: HotbarAction[]; // Hotbar configured actions (abilities + consumables)
  onCombatEnd: (result: 'victory' | 'defeat', finalState: CombatState) => void;
  onHealthChange: (health: number, mana: number) => void;
  onUseConsumable?: (itemId: number) => Promise<void>;
};

const TICK_INTERVAL = 100; // 100ms per tick
const BASE_ATTACK_TICKS = 70; // Base 70 ticks = 7 seconds at dex 10, weapon speed 1.0

export function CombatEngine(props: CombatEngineProps) {
  const [effectsStore, effectsActions] = useActiveEffects();
  
  // Calculate actual max health including constitution bonus, equipment, AND active effects
  const getActualMaxHealth = () => {
    // Get base constitution
    let totalConstitution = props.character.constitution;
    
    // Add equipment bonuses
    if (Array.isArray(props.equippedArmor)) {
      props.equippedArmor.forEach((item: any) => {
        if (item.constitution_bonus) {
          totalConstitution += item.constitution_bonus;
        }
      });
    }
    
    // Also check weapon for constitution bonus
    if (props.equippedWeapon?.constitution_bonus) {
      totalConstitution += props.equippedWeapon.constitution_bonus;
    }
    
    // Add active effect bonuses
    const effectBonus = effectsActions.getTotalStatBonus('constitution');
    totalConstitution += effectBonus;
    
    // New formula: Base + (Level × 20) + (CON - 10) × 8
    const baseHealth = 100;
    const levelBonus = props.character.level * 20;
    const constitutionBonus = (totalConstitution - 10) * 8;
    
    return baseHealth + levelBonus + constitutionBonus;
  };
  
  // Calculate attack speed in ticks
  const calculateAttackTicks = (baseSpeed: number, dexterity: number): number => {
    // Dexterity is the primary factor, weapon speed is secondary
    // Higher dexterity = faster attacks
    const dexModifier = 1 + ((dexterity - 10) * 0.05); // +5% per point above 10, -5% per point below
    const weaponModifier = baseSpeed || 1.0; // Weapon speed multiplier
    const attacksPerSecond = dexModifier * weaponModifier;
    const ticksPerAttack = BASE_ATTACK_TICKS / attacksPerSecond;
    
    // Add 15% random variance for unpredictability
    const variance = ticksPerAttack * 0.15 * (Math.random() - 0.5) * 2;
    return Math.max(10, Math.round(ticksPerAttack + variance));
  };

  // Calculate initial attack ticks once
  const weaponSpeed = props.equippedWeapon?.attack_speed || 1.0;
  const initialCharacterAttackTicks = calculateAttackTicks(weaponSpeed, props.character.dexterity);
  const initialMobAttackTicks = calculateAttackTicks(props.mob.attack_speed, 10);



  const [state, setState] = createSignal<CombatState>({
    characterHealth: props.currentHealth,
    mobHealth: props.mob.max_health,
    characterTicks: 0,
    mobTicks: 0,
    characterAttackTicks: initialCharacterAttackTicks,
    mobAttackTicks: initialMobAttackTicks,
    log: [`Combat started against ${props.mob.name}!`],
    isActive: true,
  });

  // Track ability cooldowns in combat (in seconds)
  const [abilityCooldowns, setAbilityCooldowns] = createSignal<Map<number, number>>(new Map());
  const [currentMana, setCurrentMana] = createSignal(props.currentMana);
  
  // Track active combat effects (DOTs, HOTs, debuffs on enemy)
  const [activeDots, setActiveDots] = createSignal<ActiveEffect[]>([]);
  const [activeHots, setActiveHots] = createSignal<ActiveEffect[]>([]);
  const [activeDebuffs, setActiveDebuffs] = createSignal<ActiveEffect[]>([]);
  
  // Flag to prevent sync loops when we update health internally
  let isInternalHealthUpdate = false;
  
  // Sync external mana changes
  createEffect(() => {
    setCurrentMana(props.currentMana);
  });
  
  // Track previous constitution bonus to detect changes
  const [prevConBonus, setPrevConBonus] = createSignal(0);
  
  // Watch for constitution buff changes and adjust health accordingly
  createEffect(() => {
    const currentConBonus = effectsActions.getTotalStatBonus('constitution');
    const previousBonus = prevConBonus();
    
    if (currentConBonus !== previousBonus) {
      const bonusChange = currentConBonus - previousBonus;
      const healthChange = bonusChange * 5; // Each point of CON = 5 HP
      
      setState((currentState) => {
        if (!currentState.isActive) return currentState;
        
        const newMaxHealth = getActualMaxHealth();
        let newHealth = currentState.characterHealth;
        
        if (bonusChange > 0) {
          // Buff added: increase current health by the same amount
          newHealth = currentState.characterHealth + healthChange;
          console.log('[BUFF] Constitution increased by', bonusChange, '-> Health increased by', healthChange);
        } else if (bonusChange < 0) {
          // Buff expired: cap health at new max if it exceeds
          newHealth = Math.min(currentState.characterHealth, newMaxHealth);
          console.log('[BUFF] Constitution decreased by', Math.abs(bonusChange), '-> Health capped at', newMaxHealth);
        }
        
        // Notify parent of health change
        isInternalHealthUpdate = true;
        props.onHealthChange(newHealth, currentMana());
        
        return {
          ...currentState,
          characterHealth: newHealth
        };
      });
      
      setPrevConBonus(currentConBonus);
    }
  });
  
  // Combat log ref and auto-scroll state
  let logContainerRef: HTMLDivElement | undefined;
  const [userScrolledUp, setUserScrolledUp] = createSignal(false);

  // Sync external health/mana changes (from potions, abilities, etc.)
  createEffect(() => {
    const externalHealth = props.currentHealth;
    const currentState = state();
    
    // Only update if external health is different and combat is active
    // AND we didn't just update it internally (prevent sync loops)
    if (currentState.isActive && externalHealth !== currentState.characterHealth && !isInternalHealthUpdate) {
      console.log('[COMBAT] Syncing external health change:', currentState.characterHealth, '->', externalHealth);
      setState({
        ...currentState,
        characterHealth: externalHealth
      });
    }
    
    // Reset flag after effect runs
    if (isInternalHealthUpdate) {
      isInternalHealthUpdate = false;
    }
  });

  // Auto-scroll combat log when new messages arrive (if user hasn't scrolled up)
  createEffect(() => {
    const log = state().log; // Track log changes
    
    if (logContainerRef && !userScrolledUp()) {
      // Wait for DOM to update, then scroll to bottom
      setTimeout(() => {
        if (logContainerRef) {
          logContainerRef.scrollTop = logContainerRef.scrollHeight;
        }
      }, 0);
    }
  });

  // Handle scroll events to detect if user scrolled up
  const handleLogScroll = () => {
    if (!logContainerRef) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10; // 10px threshold
    
    // If user scrolls to bottom, resume auto-scroll
    // If user scrolls up, disable auto-scroll
    setUserScrolledUp(!isAtBottom);
  };

  const calculateDamage = (
    damageMin: number,
    damageMax: number,
    attackerStrength: number,
    defenderArmor: number
  ): number => {
    const baseDamage = Math.floor(Math.random() * (damageMax - damageMin + 1)) + damageMin;
    const strengthBonus = Math.floor((attackerStrength - 10) / 2);
    const totalDamage = Math.max(1, baseDamage + strengthBonus - defenderArmor);
    return totalDamage;
  };

  const getTotalArmor = (): number => {
    if (!Array.isArray(props.equippedArmor)) return 0;
    return props.equippedArmor.reduce((sum, item) => sum + (item.armor || 0), 0);
  };

  // Check if ability can be used
  const canUseAbility = (ability: AbilityWithCooldown): { canUse: boolean; reason?: string } => {
    // Check mana cost
    if (ability.type === 'spell' && currentMana() < ability.mana_cost) {
      return { canUse: false, reason: `Need ${ability.mana_cost} mana` };
    }
    
    // Check cooldown
    const cooldownRemaining = abilityCooldowns().get(ability.id) || 0;
    if (cooldownRemaining > 0) {
      return { canUse: false, reason: `${cooldownRemaining.toFixed(1)}s` };
    }
    
    return { canUse: true };
  };

  // Use an ability
  const useAbility = (ability: AbilityWithCooldown) => {
    const check = canUseAbility(ability);
    if (!check.canUse) return;

    let updatedHealth: number | null = null;
    let didHeal = false;

    setState((currentState) => {
      let newState = { ...currentState };
      const newLog = [...currentState.log];

      // NEW EFFECT SYSTEM: Process if effects are loaded
      if (ability.effects && ability.effects.length > 0) {
        console.log(`[useAbility] Processing ${ability.effects.length} effects for ${ability.name}`);
        
        ability.effects.forEach((effect: AbilityEffect) => {
          const result = EffectProcessor.processInstantEffect(effect, props.character, props.mob.defense);
          
          // Apply instant damage
          if (result.damage) {
            newState.mobHealth = Math.max(0, newState.mobHealth - result.damage);
            newLog.push(`You cast ${ability.name} for ${result.damage} damage!`);
            
            if (newState.mobHealth <= 0) {
              newState.isActive = false;
              newState.result = 'victory';
              newLog.push(`Victory! You defeated ${props.mob.name}!`);
              setTimeout(() => props.onCombatEnd('victory', newState), 0);
            }
          }
          
          // Apply instant healing
          if (result.healing) {
            const oldHealth = newState.characterHealth;
            const maxHealth = getActualMaxHealth();
            const newHealth = Math.min(maxHealth, oldHealth + result.healing);
            const actualHealing = newHealth - oldHealth;
            
            newState.characterHealth = newHealth;
            updatedHealth = newHealth;
            didHeal = true;
            newLog.push(`You cast ${ability.name} and restore ${actualHealing} HP!`);
          }
          
          // Create active effects (DOT, HOT, buff, debuff)
          const activeEffect = EffectProcessor.createActiveEffect(effect, ability.name, props.character);
          if (activeEffect) {
            if (activeEffect.effect_type === 'dot') {
              setActiveDots(EffectProcessor.addOrStackEffect(activeDots(), activeEffect));
              newLog.push(`Applied ${ability.name} DOT!`);
            } else if (activeEffect.effect_type === 'hot') {
              setActiveHots(EffectProcessor.addOrStackEffect(activeHots(), activeEffect));
              newLog.push(`Applied ${ability.name} HoT!`);
            } else if (activeEffect.effect_type === 'buff') {
              effectsActions.addEffect({
                name: activeEffect.name,
                stat: activeEffect.stat!,
                amount: activeEffect.amount!,
                duration: activeEffect.duration,
              });
              newLog.push(`${ability.name}: +${activeEffect.amount} ${activeEffect.stat} for ${activeEffect.duration}s`);
            } else if (activeEffect.effect_type === 'debuff') {
              setActiveDebuffs(EffectProcessor.addOrStackEffect(activeDebuffs(), activeEffect));
              newLog.push(`${ability.name}: Debuff applied!`);
            }
          }
        });
      } 
      // LEGACY SYSTEM: Fallback for abilities without effects loaded
      else if (ability.category === 'damage') {
        // Calculate damage with stat scaling
        const baseDamage = Math.floor(Math.random() * (ability.damage_max - ability.damage_min + 1)) + ability.damage_min;
        const statValue = ability.primary_stat ? props.character[ability.primary_stat as keyof Character] as number : 10;
        const statBonus = Math.floor((statValue - 10) * ability.stat_scaling);
        const totalDamage = Math.max(1, baseDamage + statBonus - props.mob.defense);

        newState.mobHealth = Math.max(0, currentState.mobHealth - totalDamage);
        newLog.push(`You cast ${ability.name} for ${totalDamage} damage!`);

        // Check if mob is defeated
        if (newState.mobHealth <= 0) {
          newState.isActive = false;
          newState.result = 'victory';
          newLog.push(`Victory! You defeated ${props.mob.name}!`);
          setTimeout(() => props.onCombatEnd('victory', newState), 0);
        }
      } else if (ability.category === 'heal') {
        // Calculate healing with stat scaling
        const baseHealing = Math.abs(Number(ability.healing) || 30); // Force positive, default 30
        const rawStatValue = ability.primary_stat ? props.character[ability.primary_stat as keyof Character] : 10;
        const statValue = Math.max(1, Number(rawStatValue) || 10); // Clamp to at least 1
        const statBonus = Math.floor((statValue - 10) * Math.abs(Number(ability.stat_scaling) || 0));
        const totalHealing = Math.max(1, baseHealing + statBonus); // Ensure at least 1 HP healing
        
        const oldHealth = currentState.characterHealth;
        const maxHealth = getActualMaxHealth();
        
        // Calculate new health after healing
        const healedAmount = oldHealth + totalHealing;
        const newHealth = Math.min(maxHealth, healedAmount);
        const actualHealing = newHealth - oldHealth;

        console.log('[HEAL DEBUG]', {
          abilityName: ability.name,
          abilityHealing: ability.healing,
          abilityHealingType: typeof ability.healing,
          baseHealing,
          primaryStat: ability.primary_stat,
          statValue,
          statBonus,
          totalHealing,
          oldHealth,
          maxHealth,
          newHealth,
          actualHealing,
          calculation: `${oldHealth} + ${totalHealing} = ${oldHealth + totalHealing}, capped at ${maxHealth}`
        });

        if (actualHealing <= 0) {
          console.error('[HEAL ERROR] Healing resulted in negative or zero!', {
            ability,
            character: props.character
          });
        }

        newState.characterHealth = newHealth;
        updatedHealth = newHealth; // Store for parent notification
        didHeal = true;
        newLog.push(`You cast ${ability.name} and restore ${actualHealing} HP!`);
      } else if (ability.category === 'buff') {
        // Apply buff effect
        if (ability.buff_stat && ability.buff_amount && ability.buff_duration) {
          effectsActions.addEffect({
            name: ability.name,
            stat: ability.buff_stat,
            amount: ability.buff_amount,
            duration: ability.buff_duration,
          });
          newLog.push(`You cast ${ability.name}! +${ability.buff_amount} ${ability.buff_stat} for ${ability.buff_duration}s`);
        }
      }

      newState.log = newLog;
      return newState;
    });

    // Consume mana and update parent
    const newMana = ability.type === 'spell' ? currentMana() - ability.mana_cost : currentMana();
    if (ability.type === 'spell') {
      setCurrentMana(newMana);
    }
    
    // Always notify parent of state changes (use updated health from healing or current state)
    // IMPORTANT: For healing, we must use updatedHealth, not state().characterHealth
    // because setState is async and state() may not have updated yet!
    const healthToReport = didHeal && updatedHealth !== null ? updatedHealth : state().characterHealth;
    
    console.log('[ABILITY] Notifying parent:', { didHeal, updatedHealth, stateHealth: state().characterHealth, reporting: healthToReport });
    
    // Set flag to prevent sync loop
    isInternalHealthUpdate = true;
    props.onHealthChange(healthToReport, newMana);

    // Set cooldown (only for abilities with cooldown > 0)
    if (ability.cooldown > 0 || ability.type === 'ability') {
      const cooldownSeconds = ability.cooldown || 10; // Default 10s for abilities without explicit cooldown
      setAbilityCooldowns((prev) => {
        const newMap = new Map(prev);
        newMap.set(ability.id, cooldownSeconds);
        return newMap;
      });
    }
  };

  // Cooldown timer (runs every second)
  let cooldownIntervalId: number;
  onMount(() => {
    // Initialize previous constitution bonus
    setPrevConBonus(effectsActions.getTotalStatBonus('constitution'));
    
    cooldownIntervalId = window.setInterval(() => {
      setAbilityCooldowns((prev) => {
        const newMap = new Map(prev);
        let hasChanges = false;
        
        for (const [abilityId, remaining] of newMap.entries()) {
          if (remaining > 0) {
            const newRemaining = Math.max(0, remaining - 1);
            newMap.set(abilityId, newRemaining);
            hasChanges = true;
          }
        }
        
        return hasChanges ? newMap : prev;
      });
    }, 1000); // Every second
  });

  // Main combat loop
  let intervalId: number;
  
  // Track ticks for regeneration (regen every 100 ticks = 10 seconds)
  const [regenTicks, setRegenTicks] = createSignal(0);
  const REGEN_TICK_INTERVAL = 100; // Regenerate every 10 seconds in combat

  onMount(() => {
    intervalId = window.setInterval(() => {
      setState((currentState) => {
        if (!currentState.isActive) {
          clearInterval(intervalId);
          return currentState;
        }

        let newCharTicks = currentState.characterTicks + 1;
        let newMobTicks = currentState.mobTicks + 1;
        let newState = { ...currentState };

        // Handle in-combat regeneration (slower than out of combat)
        const currentRegenTicks = regenTicks() + 1;
        setRegenTicks(currentRegenTicks);
        
        if (currentRegenTicks >= REGEN_TICK_INTERVAL) {
          setRegenTicks(0);
          
          // In-combat health regeneration (much slower than out of combat)
          // Base: 0.5% of max health every 10 seconds, scaled by constitution
          const maxHealth = getActualMaxHealth();
          const baseHealthRegen = Math.max(1, Math.floor(maxHealth * 0.005));
          const conBonus = Math.floor((props.character.constitution - 10) * 0.2);
          const healthRegen = Math.max(1, baseHealthRegen + conBonus);
          
          const newHealth = Math.min(maxHealth, currentState.characterHealth + healthRegen);
          if (newHealth > currentState.characterHealth) {
            newState.characterHealth = newHealth;
          }
          
          // In-combat mana regeneration (slower than out of combat)
          // Base: 1% of max mana every 10 seconds, scaled by wisdom
          const baseMaxMana = 100 + (props.character.intelligence * 5);
          const baseManaRegen = Math.max(1, Math.floor(baseMaxMana * 0.01));
          const wisBonus = Math.floor((props.character.wisdom - 10) * 0.3);
          const manaRegen = Math.max(1, baseManaRegen + wisBonus);
          
          const newMana = Math.min(baseMaxMana, currentMana() + manaRegen);
          if (newMana > currentMana()) {
            setCurrentMana(newMana);
            // Notify parent of mana change
            props.onHealthChange(newState.characterHealth, newMana);
          }
        }

        // Process active DOTs/HOTs/Debuffs
        const processedDots = EffectProcessor.updateActiveEffects(activeDots(), (effect, tickDamage) => {
          // Apply DOT tick damage to mob
          const actualDamage = Math.max(1, tickDamage);
          newState.mobHealth = Math.max(0, newState.mobHealth - actualDamage);
          newState.log = [...newState.log, `🔥 ${effect.name} deals ${actualDamage} damage!`];
          
          // Check if mob died from DOT
          if (newState.mobHealth <= 0) {
            newState.isActive = false;
            newState.result = 'victory';
            newState.log = [...newState.log, `Victory! You defeated ${props.mob.name}!`];
            setTimeout(() => props.onCombatEnd('victory', newState), 0);
            clearInterval(intervalId);
          }
        });
        setActiveDots(processedDots);

        const processedHots = EffectProcessor.updateActiveEffects(activeHots(), (effect, tickHealing) => {
          // Apply HOT tick healing to character
          const maxHealth = getActualMaxHealth();
          const actualHealing = Math.max(1, tickHealing);
          const newHealth = Math.min(maxHealth, newState.characterHealth + actualHealing);
          const healingApplied = newHealth - newState.characterHealth;
          
          if (healingApplied > 0) {
            newState.characterHealth = newHealth;
            newState.log = [...newState.log, `💚 ${effect.name} restores ${healingApplied} HP!`];
            props.onHealthChange(newHealth, currentMana());
          }
        });
        setActiveHots(processedHots);

        const processedDebuffs = EffectProcessor.updateActiveEffects(activeDebuffs(), () => {});
        setActiveDebuffs(processedDebuffs);

        // Check if character should attack
        if (newCharTicks >= currentState.characterAttackTicks) {
          const weaponDamageMin = props.equippedWeapon?.damage_min || 1;
          const weaponDamageMax = props.equippedWeapon?.damage_max || 3;
          
          const damage = calculateDamage(
            weaponDamageMin,
            weaponDamageMax,
            props.character.strength,
            props.mob.defense
          );

          const newMobHealth = Math.max(0, currentState.mobHealth - damage);
          const weaponSpeed = props.equippedWeapon?.attack_speed || 1.0;
          const nextAttackTicks = calculateAttackTicks(weaponSpeed, props.character.dexterity);

          newState.mobHealth = newMobHealth;
          newState.log = [...currentState.log, `You attack for ${damage} damage!`];
          newState.characterTicks = 0;
          newState.characterAttackTicks = nextAttackTicks;

          if (newMobHealth <= 0) {
            newState.isActive = false;
            newState.result = 'victory';
            newState.log = [...newState.log, `Victory! You defeated ${props.mob.name}!`];
            setTimeout(() => props.onCombatEnd('victory', newState), 0);
            clearInterval(intervalId);
            return newState;
          }
        } else {
          newState.characterTicks = newCharTicks;
        }

        // Check if mob should attack
        if (newMobTicks >= currentState.mobAttackTicks) {
          const totalArmor = getTotalArmor();
          
          const damage = calculateDamage(
            props.mob.damage_min,
            props.mob.damage_max,
            10,
            totalArmor
          );

          const newCharHealth = Math.max(0, currentState.characterHealth - damage);
          const nextAttackTicks = calculateAttackTicks(props.mob.attack_speed, 10);

          newState.characterHealth = newCharHealth;
          newState.log = [...newState.log, `${props.mob.name} attacks for ${damage} damage!`];
          newState.mobTicks = 0;
          newState.mobAttackTicks = nextAttackTicks;

          // Update parent component with new health (preserve current mana)
          props.onHealthChange(newCharHealth, currentMana());

          if (newCharHealth <= 0) {
            newState.isActive = false;
            newState.result = 'defeat';
            newState.log = [...newState.log, `Defeat! You were slain by ${props.mob.name}...`];
            setTimeout(() => props.onCombatEnd('defeat', newState), 0);
            clearInterval(intervalId);
            return newState;
          }
        } else {
          newState.mobTicks = newMobTicks;
        }

        return newState;
      });
    }, TICK_INTERVAL);
  });

  // Keyboard shortcuts for hotbar (1-8)
  onMount(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if combat is active and not typing in an input
      if (!state().isActive) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = parseInt(e.key);
      if (key >= 1 && key <= 8) {
        e.preventDefault();
        const action = props.hotbarActions.find(a => a.slot === key);
        if (action) {
          if (action.type === 'ability' && action.ability) {
            const check = canUseAbility(action.ability);
            if (check.canUse) {
              useAbility(action.ability);
            }
          } else if (action.type === 'consumable' && action.item && props.onUseConsumable) {
            if (action.item.quantity > 0) {
              props.onUseConsumable(action.item.id);
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyPress);
    });
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (cooldownIntervalId) {
      clearInterval(cooldownIntervalId);
    }
  });

  const healthPercent = () => (state().characterHealth / getActualMaxHealth()) * 100;
  const mobHealthPercent = () => (state().mobHealth / props.mob.max_health) * 100;

  return (
    <div class="card">
      <h3 style={{ "margin-bottom": "1rem" }}>
        Combat vs {props.mob.name}! {state().isActive ? "" : state().result === 'victory' ? "🎉" : "💀"}
      </h3>

      {/* Mob Health */}
      <div style={{ "margin-bottom": "1rem" }}>
        <div style={{ display: "flex", "justify-content": "space-between", "margin-bottom": "0.25rem" }}>
          <strong>{props.mob.name} (Level {props.mob.level})</strong>
          <span>{state().mobHealth}/{props.mob.max_health} ({Math.round(mobHealthPercent())}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill danger" style={{ width: `${mobHealthPercent()}%` }} />
        </div>
        
        {/* Active DOTs on Enemy */}
        <Show when={activeDots().length > 0}>
          <div style={{ 
            "margin-top": "0.5rem", 
            display: "flex", 
            gap: "0.5rem", 
            "flex-wrap": "wrap" 
          }}>
            <For each={activeDots()}>
              {(dot) => (
                <span style={{ 
                  "font-size": "0.75rem",
                  padding: "0.25rem 0.5rem",
                  background: "rgba(220, 38, 38, 0.2)",
                  border: "1px solid var(--danger)",
                  "border-radius": "4px",
                  color: "var(--danger)"
                }}>
                  🔥 {dot.name} ({dot.ticks_remaining} ticks)
                </span>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Attack Timers */}
      <Show when={state().isActive}>
        <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "1rem", "margin-bottom": "1rem" }}>
          <div style={{ padding: "0.5rem", background: "var(--bg-light)", "border-radius": "4px" }}>
            <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)" }}>Your next attack</div>
            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
              {((state().characterAttackTicks - state().characterTicks) * TICK_INTERVAL / 1000).toFixed(1)}s
            </div>
          </div>
          <div style={{ padding: "0.5rem", background: "var(--bg-light)", "border-radius": "4px" }}>
            <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)" }}>Enemy attack</div>
            <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--danger)" }}>
              {((state().mobAttackTicks - state().mobTicks) * TICK_INTERVAL / 1000).toFixed(1)}s
            </div>
          </div>
        </div>
      </Show>

      {/* Hotbar Actions */}
      <Show when={props.hotbarActions.length > 0 && state().isActive}>
        <div style={{ "margin-bottom": "1rem" }}>
          <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
            Action Bar (Press 1-8)
          </div>
          <div style={{ 
            display: "grid", 
            "grid-template-columns": "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.5rem"
          }}>
            <For each={props.hotbarActions}>
              {(action) => {
                // Handle abilities
                const isAbility = () => action.type === 'ability' && action.ability;
                const check = () => isAbility() ? canUseAbility(action.ability!) : { canUse: true };
                const cooldown = () => isAbility() ? (abilityCooldowns().get(action.ability!.id) || 0) : 0;
                const isDisabled = () => {
                  if (action.type === 'consumable') {
                    return !action.item || action.item.quantity === 0;
                  }
                  return !check().canUse;
                };
                
                // Determine action color based on type
                const getActionColor = () => {
                  if (action.type === 'consumable') return 'var(--success)';
                  if (action.ability?.category === 'damage') return 'var(--danger)';
                  if (action.ability?.category === 'heal') return 'var(--success)';
                  return 'var(--accent)';
                };
                
                const handleClick = async () => {
                  if (action.type === 'ability' && action.ability) {
                    useAbility(action.ability);
                  } else if (action.type === 'consumable' && action.item && props.onUseConsumable) {
                    await props.onUseConsumable(action.item.id);
                  }
                };
                
                const name = () => action.type === 'ability' ? action.ability?.name : action.item?.name;
                const description = () => action.type === 'ability' ? action.ability?.description : '';
                
                return (
                  <button
                    class="button"
                    onClick={handleClick}
                    disabled={isDisabled()}
                    style={{
                      position: "relative",
                      padding: "0.75rem",
                      width: "100%",
                      background: isDisabled() ? "var(--bg-light)" : getActionColor(),
                      opacity: isDisabled() ? 0.5 : 1,
                      cursor: isDisabled() ? "not-allowed" : "pointer",
                      "font-size": "0.875rem",
                      display: "flex",
                      "flex-direction": "column",
                      "align-items": "center",
                      gap: "0.25rem",
                      "min-height": "80px"
                    }}
                    title={`${name()}\n${description() || ''}\n\n${
                      action.type === 'ability' && action.ability ? (
                        action.ability.category === 'damage' 
                          ? `Damage: ${action.ability.damage_min}-${action.ability.damage_max}` 
                          : action.ability.category === 'heal'
                          ? `Healing: ${action.ability.healing}`
                          : ''
                      ) : action.type === 'consumable' && action.item ? (
                        `HP: +${action.item.health_restore || 0} MP: +${action.item.mana_restore || 0}`
                      ) : ''
                    }\n${
                      action.type === 'ability' && action.ability ? (
                        action.ability.type === 'spell' ? `Mana: ${action.ability.mana_cost}` : `Cooldown: ${action.ability.cooldown}s`
                      ) : action.type === 'consumable' && action.item ? (
                        `Quantity: ${action.item.quantity}`
                      ) : ''
                    }${
                      action.type === 'ability' && action.ability?.primary_stat && action.ability.stat_scaling > 0
                        ? `\nScales with ${action.ability.primary_stat} (${Math.floor(action.ability.stat_scaling * 100)}%)`
                        : ''
                    }`}
                  >
                    {/* Slot number badge */}
                    <div style={{
                      position: "absolute",
                      top: "4px",
                      left: "4px",
                      width: "18px",
                      height: "18px",
                      background: "var(--bg-dark)",
                      "border-radius": "3px",
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "center",
                      "font-size": "0.7rem",
                      "font-weight": "bold"
                    }}>
                      {action.slot}
                    </div>
                    
                    <div style={{ "font-weight": "bold" }}>{name()}</div>
                    
                    <Show when={action.type === 'ability' && action.ability?.type === 'spell'}>
                      <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)" }}>
                        {action.ability?.mana_cost} mana
                      </div>
                    </Show>
                    
                    <Show when={action.type === 'ability' && action.ability?.type === 'ability' && cooldown() === 0}>
                      <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)" }}>
                        {action.ability?.cooldown}s cooldown
                      </div>
                    </Show>
                    
                    <Show when={action.type === 'consumable' && action.item}>
                      <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)" }}>
                        x{action.item?.quantity || 0}
                      </div>
                    </Show>
                    
                    <Show when={cooldown() > 0}>
                      <div style={{ 
                        "font-size": "1rem", 
                        "font-weight": "bold",
                        color: "var(--warning)"
                      }}>
                        {Math.ceil(cooldown())}s
                      </div>
                    </Show>
                    
                    <Show when={!check().canUse && !cooldown() && check().reason}>
                      <div style={{ "font-size": "0.75rem", color: "var(--danger)" }}>
                        {check().reason}
                      </div>
                    </Show>
                  </button>
                );
              }}
            </For>
          </div>
        </div>
      </Show>

      {/* Combat Log */}
      <div 
        ref={logContainerRef}
        class="combat-log" 
        style={{ 
          "max-height": "120px", // ~5 lines of text
          "overflow-y": "auto",
          "scroll-behavior": "smooth"
        }}
        onScroll={handleLogScroll}
      >
        <For each={state().log}>
          {(logEntry) => <p>{logEntry}</p>}
        </For>
      </div>
    </div>
  );
}
