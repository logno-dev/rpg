import type { Item } from "./db";

export type ItemQuality = "common" | "fine" | "superior" | "masterwork";

const QUALITY_MULTIPLIERS: Record<ItemQuality, number> = {
  common: 1.0,
  fine: 1.05,
  superior: 1.10,
  masterwork: 1.15,
};

export function getQualityMultiplier(quality?: string | null): number {
  if (!quality) return 1.0;
  return QUALITY_MULTIPLIERS[quality as ItemQuality] || 1.0;
}

export function applyQualityToStats(item: Item, quality?: string | null): Item {
  const multiplier = getQualityMultiplier(quality);
  
  if (multiplier === 1.0) {
    return item; // No modification for common quality
  }

  return {
    ...item,
    // Stat bonuses
    strength_bonus: Math.floor(item.strength_bonus * multiplier),
    dexterity_bonus: Math.floor(item.dexterity_bonus * multiplier),
    constitution_bonus: Math.floor(item.constitution_bonus * multiplier),
    intelligence_bonus: Math.floor(item.intelligence_bonus * multiplier),
    wisdom_bonus: Math.floor(item.wisdom_bonus * multiplier),
    charisma_bonus: Math.floor(item.charisma_bonus * multiplier),
    // Combat stats
    damage_min: Math.floor(item.damage_min * multiplier),
    damage_max: Math.floor(item.damage_max * multiplier),
    armor: Math.floor(item.armor * multiplier),
    // Note: Attack speed and value don't scale with quality
  };
}

export function getQualityColor(quality?: string | null): string {
  switch (quality) {
    case "masterwork":
      return "var(--legendary)"; // gold
    case "superior":
      return "var(--epic)"; // purple
    case "fine":
      return "var(--rare)"; // blue
    case "common":
    default:
      return "var(--text-primary)"; // white
  }
}

export function getQualityLabel(quality?: string | null): string | null {
  if (!quality || quality === "common") return null;
  return quality.charAt(0).toUpperCase() + quality.slice(1);
}
