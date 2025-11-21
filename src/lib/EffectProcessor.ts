import type { AbilityEffect, ActiveEffect, Character } from './db';

export class EffectProcessor {
  /**
   * Calculate the final value for an effect with stat scaling
   */
  static calculateEffectValue(
    effect: AbilityEffect,
    character: Character,
    useMin: boolean = false
  ): number {
    const baseValue = useMin ? effect.value_min : 
                     Math.floor(Math.random() * (effect.value_max - effect.value_min + 1)) + effect.value_min;
    
    if (!effect.stat_scaling || effect.scaling_factor === 0) {
      return baseValue;
    }
    
    const statValue = character[effect.stat_scaling as keyof Character] as number || 10;
    const statBonus = Math.floor((statValue - 10) * effect.scaling_factor);
    
    return Math.max(1, baseValue + statBonus);
  }

  /**
   * Check if an effect should trigger based on chance
   */
  static shouldTrigger(effect: AbilityEffect): boolean {
    return Math.random() <= effect.chance;
  }

  /**
   * Create an active effect from an ability effect
   */
  static createActiveEffect(
    effect: AbilityEffect,
    abilityName: string,
    character: Character
  ): ActiveEffect | null {
    // Check chance
    if (!this.shouldTrigger(effect)) {
      return null;
    }

    const now = Date.now();
    const id = `${effect.effect_type}-${effect.ability_id}-${now}`;

    // For DOT/HOT
    if (effect.is_periodic && effect.tick_count > 0) {
      const tickValue = effect.tick_value || this.calculateEffectValue(effect, character, true);
      
      return {
        id,
        name: abilityName,
        source: 'ability',
        effect_type: effect.effect_type as 'dot' | 'hot',
        target: effect.target as 'self' | 'enemy',
        tick_value: tickValue,
        tick_interval: effect.tick_interval,
        ticks_remaining: effect.tick_count,
        next_tick_at: now + (effect.tick_interval * 1000),
        duration: effect.tick_interval * effect.tick_count,
        expires_at: now + (effect.tick_interval * effect.tick_count * 1000),
        stacks: 1,
        stat_scaling: effect.stat_scaling || undefined,
        scaling_factor: effect.scaling_factor,
      };
    }

    // For buffs/debuffs
    if ((effect.effect_type === 'buff' || effect.effect_type === 'debuff') && effect.stat_affected) {
      const amount = this.calculateEffectValue(effect, character, true);
      
      return {
        id,
        name: abilityName,
        source: 'ability',
        effect_type: effect.effect_type,
        target: effect.target as 'self' | 'enemy',
        stat: effect.stat_affected,
        amount: amount,
        duration: effect.duration,
        expires_at: now + (effect.duration * 1000),
        stacks: 1,
      };
    }

    // For shields
    if (effect.effect_type === 'shield') {
      const shieldAmount = effect.shield_amount || this.calculateEffectValue(effect, character, true);
      
      return {
        id,
        name: abilityName,
        source: 'ability',
        effect_type: 'shield',
        target: effect.target as 'self' | 'enemy',
        shield_remaining: shieldAmount,
        duration: effect.duration,
        expires_at: now + (effect.duration * 1000),
        stacks: 1,
      };
    }

    return null;
  }

  /**
   * Process an instant effect (damage, heal, drain)
   */
  static processInstantEffect(
    effect: AbilityEffect,
    character: Character,
    mobDefense: number = 0
  ): { 
    damage?: number;
    healing?: number;
    description: string;
  } {
    const value = this.calculateEffectValue(effect, character);

    switch (effect.effect_type) {
      case 'damage':
        const damage = Math.max(1, value - mobDefense);
        return {
          damage,
          description: `${damage} damage`,
        };

      case 'heal':
        return {
          healing: value,
          description: `${value} HP restored`,
        };

      case 'drain':
        const drainDamage = Math.max(1, value - mobDefense);
        const drainHealing = Math.floor(drainDamage * (effect.drain_percent || 0));
        return {
          damage: drainDamage,
          healing: drainHealing,
          description: `${drainDamage} damage, ${drainHealing} HP drained`,
        };

      default:
        return { description: '' };
    }
  }

  /**
   * Update active effects, remove expired ones, process ticks
   */
  static updateActiveEffects(
    effects: ActiveEffect[],
    onTick: (effect: ActiveEffect, tickDamage: number) => void
  ): ActiveEffect[] {
    const now = Date.now();
    const updated: ActiveEffect[] = [];

    for (const effect of effects) {
      // Check if expired
      if (now >= effect.expires_at) {
        continue; // Remove expired effect
      }

      // Process ticks for DOT/HOT
      if ((effect.effect_type === 'dot' || effect.effect_type === 'hot') && 
          effect.next_tick_at && effect.ticks_remaining) {
        
        if (now >= effect.next_tick_at) {
          // Apply tick
          onTick(effect, effect.tick_value || 0);
          
          // Update effect
          effect.ticks_remaining--;
          if (effect.ticks_remaining > 0) {
            effect.next_tick_at = now + (effect.tick_interval! * 1000);
            updated.push(effect);
          }
          // else: don't add to updated, effect is done
        } else {
          updated.push(effect);
        }
      } else {
        // Buff/debuff/shield - just check expiration
        updated.push(effect);
      }
    }

    return updated;
  }

  /**
   * Get total stat bonus from active buffs/debuffs
   */
  static getTotalStatModifier(effects: ActiveEffect[], stat: string): number {
    return effects
      .filter(e => (e.effect_type === 'buff' || e.effect_type === 'debuff') && e.stat === stat)
      .reduce((total, e) => total + (e.amount || 0), 0);
  }

  /**
   * Stack or add an effect
   */
  static addOrStackEffect(
    existingEffects: ActiveEffect[],
    newEffect: ActiveEffect
  ): ActiveEffect[] {
    // Find existing effect with same name and type
    const existing = existingEffects.find(
      e => e.name === newEffect.name && e.effect_type === newEffect.effect_type
    );

    if (existing) {
      // Refresh duration
      existing.expires_at = newEffect.expires_at;
      existing.duration = newEffect.duration;
      
      // Reset ticks for DOT/HOT
      if (existing.effect_type === 'dot' || existing.effect_type === 'hot') {
        existing.ticks_remaining = newEffect.ticks_remaining;
        existing.next_tick_at = newEffect.next_tick_at;
      }
      
      return existingEffects;
    } else {
      return [...existingEffects, newEffect];
    }
  }
}
