import WikiLayout from "~/components/WikiLayout";

export default function CombatWiki() {
  return (
    <WikiLayout>
      <div>
        <h1>Combat System</h1>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Overview</h2>
        <p>
          Combat in Morthvale is a turn-based system where timing, strategy, and character build all play
          crucial roles in determining victory or defeat.
        </p>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Combat Mechanics</h2>
        
        <h3>Attack Speed</h3>
        <p>
          Attack speed determines how quickly you can perform actions in combat. A higher attack speed
          means more frequent attacks. Attack speed is influenced by:
        </p>
        <ul>
          <li>Your weapon's base attack speed</li>
          <li>Dexterity stat bonuses</li>
          <li>Equipment and buff effects</li>
        </ul>

        <h3>Damage Calculation</h3>
        <p>
          Damage dealt to enemies is calculated based on several factors:
        </p>
        <ul>
          <li><strong>Base Damage:</strong> From your weapon or ability</li>
          <li><strong>Stat Scaling:</strong> Primary stats (STR, DEX, INT, etc.) increase damage</li>
          <li><strong>Critical Hits:</strong> Chance to deal extra damage</li>
          <li><strong>Enemy Defense:</strong> Reduces incoming damage</li>
        </ul>

        <h3>Evasion</h3>
        <p>
          Evasiveness determines your chance to dodge incoming attacks. High dexterity characters
          can build around evasion to avoid damage entirely.
        </p>

        <h3>Defense & Armor</h3>
        <p>
          Armor reduces the amount of physical damage you take from attacks. Heavy armor provides
          more protection but may have stat requirements.
        </p>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Combat Stats</h2>
        <p>Understanding your combat stats is essential for success:</p>
        
        <h3>Primary Stats</h3>
        <ul>
          <li><strong>Strength (STR):</strong> Increases melee physical damage</li>
          <li><strong>Dexterity (DEX):</strong> Increases ranged damage, attack speed, and evasion</li>
          <li><strong>Constitution (CON):</strong> Increases maximum health and health regeneration</li>
          <li><strong>Intelligence (INT):</strong> Increases spell damage and maximum mana</li>
          <li><strong>Wisdom (WIS):</strong> Increases healing power and mana regeneration</li>
          <li><strong>Charisma (CHA):</strong> Increases bard song effects and buff duration</li>
        </ul>

        <h3>Secondary Stats</h3>
        <ul>
          <li><strong>Health:</strong> Your life total - reaching 0 means defeat</li>
          <li><strong>Mana:</strong> Resource for casting spells and abilities</li>
          <li><strong>Attack Speed:</strong> Time between attacks</li>
          <li><strong>Evasiveness:</strong> Chance to dodge attacks</li>
        </ul>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Combat Types</h2>
        
        <h3>Roaming Combat</h3>
        <p>
          When roaming a region or sub-area, you'll encounter random mobs. These fights are typically
          shorter and allow you to rest between encounters.
        </p>

        <h3>Named Mob Combat</h3>
        <p>
          Rare named mobs are more challenging than regular enemies and drop better loot. They may
          have special abilities or higher stats.
        </p>

        <h3>Dungeon Combat</h3>
        <p>
          Dungeons feature sequential encounters with increasing difficulty, culminating in a boss fight.
          You cannot rest between dungeon encounters, so resource management is critical.
        </p>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Status Effects</h2>
        <p>
          Combat includes various status effects that can turn the tide of battle:
        </p>
        <ul>
          <li><strong>Buffs:</strong> Temporary stat increases (e.g., increased strength, faster attacks)</li>
          <li><strong>Debuffs:</strong> Temporary stat decreases on enemies</li>
          <li><strong>Damage over Time (DoT):</strong> Periodic damage effects like poison or burning</li>
          <li><strong>Healing over Time (HoT):</strong> Periodic healing effects like regeneration</li>
          <li><strong>Shields:</strong> Absorb incoming damage before affecting health</li>
        </ul>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Combat Strategy</h2>
        
        <h3>Resource Management</h3>
        <p>
          Managing your health and mana is crucial, especially in dungeons where you cannot rest
          between fights. Use consumables wisely and don't waste mana on weak enemies.
        </p>

        <h3>Ability Rotation</h3>
        <p>
          Develop an effective rotation of abilities to maximize damage and efficiency. Consider
          cooldowns and mana costs when planning your attacks.
        </p>

        <h3>Build Synergy</h3>
        <p>
          Choose abilities and equipment that complement your character's stats and playstyle.
          A focused build is often more effective than spreading stats too thin.
        </p>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
        <h3>Combat Tips</h3>
        <ul style={{ "margin-bottom": "0" }}>
          <li>Always keep health potions in your inventory</li>
          <li>Use your hotbar to quickly access abilities mid-combat</li>
          <li>Pay attention to enemy attack speeds - faster enemies require different strategies</li>
          <li>Don't engage in combat when low on health unless you have healing abilities ready</li>
          <li>Rest frequently when roaming to regenerate health and mana</li>
        </ul>
      </div>
      </div>
    </WikiLayout>
  );
}
