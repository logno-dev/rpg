/**
 * Shared game helper functions used across multiple game routes
 */

/**
 * Get the currently selected character ID from localStorage
 */
export function getSelectedCharacterId(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('selectedCharacterId');
  return stored ? parseInt(stored) : null;
}

export function getEquipmentComparison(item: any, currentInventory: any[]) {
  if (!item.slot) return null; // Not equipment
  
  const equippedItem = currentInventory.find((i: any) => i.slot === item.slot && i.equipped === 1);
  if (!equippedItem) return null; // No item equipped in this slot
  
  const comparisons: Array<{stat: string, current: number, new: number, diff: number}> = [];
  
  // Compare damage
  if (item.damage_min || item.damage_max) {
    const newAvg = ((item.damage_min || 0) + (item.damage_max || 0)) / 2;
    const currentAvg = ((equippedItem.damage_min || 0) + (equippedItem.damage_max || 0)) / 2;
    if (newAvg > 0 || currentAvg > 0) {
      comparisons.push({
        stat: 'Damage',
        current: currentAvg,
        new: newAvg,
        diff: newAvg - currentAvg
      });
    }
  }
  
  // Compare armor
  if (item.armor || equippedItem.armor) {
    comparisons.push({
      stat: 'Armor',
      current: equippedItem.armor || 0,
      new: item.armor || 0,
      diff: (item.armor || 0) - (equippedItem.armor || 0)
    });
  }
  
  // Compare attack speed (lower is better - inverted for display)
  if (item.attack_speed && item.attack_speed !== 1 || equippedItem.attack_speed && equippedItem.attack_speed !== 1) {
    const currentSpeed = equippedItem.attack_speed || 1;
    const newSpeed = item.attack_speed || 1;
    // Invert the diff since lower attack speed is better
    const diff = currentSpeed - newSpeed; // Positive means improvement
    comparisons.push({
      stat: 'Attack Speed',
      current: currentSpeed,
      new: newSpeed,
      diff: diff
    });
  }
  
  // Compare stat bonuses
  const stats = [
    { key: 'strength_bonus', label: 'Strength' },
    { key: 'dexterity_bonus', label: 'Dexterity' },
    { key: 'constitution_bonus', label: 'Constitution' },
    { key: 'intelligence_bonus', label: 'Intelligence' },
    { key: 'wisdom_bonus', label: 'Wisdom' },
    { key: 'charisma_bonus', label: 'Charisma' }
  ];
  
  stats.forEach(({ key, label }) => {
    const newValue = item[key] || 0;
    const currentValue = equippedItem[key] || 0;
    if (newValue > 0 || currentValue > 0) {
      comparisons.push({
        stat: label,
        current: currentValue,
        new: newValue,
        diff: newValue - currentValue
      });
    }
  });
  
  return {
    equippedItem,
    comparisons: comparisons.filter(c => c.diff !== 0) // Only show differences
  };
}

export function calculateBulkSellValue(selectedItemIds: Set<number>, inventory: any[]) {
  return inventory
    .filter((i: any) => selectedItemIds.has(i.id))
    .reduce((total: number, item: any) => {
      return total + (Math.floor(item.value * 0.4) * item.quantity);
    }, 0);
}

export function meetsItemRequirements(item: any, character: any) {
  if (!character) return false;
  
  const requirements = [
    { key: 'required_level', stat: 'level', label: 'Level' },
    { key: 'required_strength', stat: 'strength', label: 'Strength' },
    { key: 'required_dexterity', stat: 'dexterity', label: 'Dexterity' },
    { key: 'required_constitution', stat: 'constitution', label: 'Constitution' },
    { key: 'required_intelligence', stat: 'intelligence', label: 'Intelligence' },
    { key: 'required_wisdom', stat: 'wisdom', label: 'Wisdom' },
    { key: 'required_charisma', stat: 'charisma', label: 'Charisma' }
  ];
  
  return requirements.every(({ key, stat }) => {
    const required = item[key];
    if (!required || required === 0) return true;
    return character[stat] >= required;
  });
}

export function formatItemRequirements(item: any): string[] {
  const requirements: string[] = [];
  
  if (item.required_level) requirements.push(`Level ${item.required_level}`);
  if (item.required_strength) requirements.push(`${item.required_strength} STR`);
  if (item.required_dexterity) requirements.push(`${item.required_dexterity} DEX`);
  if (item.required_constitution) requirements.push(`${item.required_constitution} CON`);
  if (item.required_intelligence) requirements.push(`${item.required_intelligence} INT`);
  if (item.required_wisdom) requirements.push(`${item.required_wisdom} WIS`);
  if (item.required_charisma) requirements.push(`${item.required_charisma} CHA`);
  
  return requirements;
}

export function calculateEquipmentBonuses(inventory: any[]) {
  const equipped = inventory.filter((i: any) => i.equipped === 1);
  
  return {
    strength: equipped.reduce((sum: number, i: any) => sum + (i.strength_bonus || 0), 0),
    dexterity: equipped.reduce((sum: number, i: any) => sum + (i.dexterity_bonus || 0), 0),
    constitution: equipped.reduce((sum: number, i: any) => sum + (i.constitution_bonus || 0), 0),
    intelligence: equipped.reduce((sum: number, i: any) => sum + (i.intelligence_bonus || 0), 0),
    wisdom: equipped.reduce((sum: number, i: any) => sum + (i.wisdom_bonus || 0), 0),
    charisma: equipped.reduce((sum: number, i: any) => sum + (i.charisma_bonus || 0), 0),
  };
}

export function calculateMaxHealth(character: any, equipmentBonuses: any, effectBonus: number = 0) {
  const totalConstitution = character.constitution + equipmentBonuses.constitution + effectBonus;
  const baseHealth = 100;
  const levelBonus = character.level * 20;
  const constitutionBonus = (totalConstitution - 10) * 8;
  return baseHealth + levelBonus + constitutionBonus;
}

export function calculateMaxMana(character: any, equipmentBonuses: any, effectBonus: number = 0) {
  const totalIntelligence = character.intelligence + equipmentBonuses.intelligence + effectBonus;
  const baseMana = 100;
  const levelBonus = character.level * 20;
  const intelligenceBonus = (totalIntelligence - 10) * 5;
  return baseMana + levelBonus + intelligenceBonus;
}
