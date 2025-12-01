import { WikiData, AbilityTable } from "~/components/WikiData";
import WikiLayout from "~/components/WikiLayout";

export default function AbilitiesWiki() {
  return (
    <WikiLayout>
      <div>
        <h1>Abilities & Spells</h1>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Overview</h2>
        <p>
          In Morthvale, characters can learn powerful abilities and spells to aid them in combat.
          Abilities are divided into two main types: <strong>Physical Abilities</strong> and <strong>Magical Spells</strong>.
        </p>
        <ul>
          <li><strong>Physical Abilities:</strong> Melee and ranged attacks that scale with physical stats (STR, DEX)</li>
          <li><strong>Magical Spells:</strong> Mystical powers that scale with magical stats (INT, WIS, CHA)</li>
        </ul>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Ability Tiers</h2>
        <p>
          Abilities are organized into three tiers, with each tier becoming more powerful:
        </p>
        <ul>
          <li><strong>Tier 1:</strong> Basic abilities available at lower levels</li>
          <li><strong>Tier 2:</strong> Intermediate abilities with enhanced effects</li>
          <li><strong>Tier 3:</strong> Advanced abilities with powerful effects and combos</li>
        </ul>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Physical Abilities</h2>
        <p>Master the art of physical combat with these powerful abilities:</p>
        
        <WikiData endpoint="abilities" params={{ type: "ability" }}>
          {(abilities) => <AbilityTable data={abilities} />}
        </WikiData>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Damage Spells</h2>
        <p>Harness the elements to unleash devastating magical attacks:</p>
        
        <WikiData endpoint="abilities" params={{ type: "spell", category: "damage" }}>
          {(abilities) => <AbilityTable data={abilities} />}
        </WikiData>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Healing Spells</h2>
        <p>Restore health and mana with restorative magic:</p>
        
        <WikiData endpoint="abilities" params={{ type: "spell", category: "heal" }}>
          {(abilities) => <AbilityTable data={abilities} />}
        </WikiData>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Buff Spells</h2>
        <p>Enhance your stats and capabilities with empowering magic:</p>
        
        <WikiData endpoint="abilities" params={{ type: "spell", category: "buff" }}>
          {(abilities) => <AbilityTable data={abilities} />}
        </WikiData>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
        <h3>Pro Tips</h3>
        <ul style={{ "margin-bottom": "0" }}>
          <li>Abilities can be learned from scrolls found as loot or purchased from merchants</li>
          <li>Higher tier abilities require higher character levels and stat requirements</li>
          <li>Manage your mana carefully - running out mid-combat can be deadly</li>
          <li>Use the hotbar system to quickly access your favorite abilities</li>
        </ul>
      </div>
      </div>
    </WikiLayout>
  );
}
