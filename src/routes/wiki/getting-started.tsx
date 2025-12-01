import { A } from "@solidjs/router";
import WikiLayout from "~/components/WikiLayout";

export default function GettingStarted() {
  return (
    <WikiLayout>
      <div>
        <h1>Getting Started</h1>

        <p>
          Welcome to Morthvale! This guide will help you get started on your adventure and
          understand the core mechanics of the game.
        </p>

        <h2>Creating Your Character</h2>

        <p>
          When you first enter Morthvale, you'll create a character with a unique name.
          Your character starts at level 1 in the <strong>Greenfield Plains</strong>, a
          beginner-friendly region perfect for learning the basics.
        </p>

        <h3>Starting Stats</h3>

        <p>
          Your character begins with base stats that will grow as you level up:
        </p>

        <ul>
          <li><strong>Strength (STR)</strong> - Increases melee damage</li>
          <li><strong>Dexterity (DEX)</strong> - Increases ranged damage, attack speed, and evasion</li>
          <li><strong>Constitution (CON)</strong> - Increases maximum health</li>
          <li><strong>Intelligence (INT)</strong> - Increases spell damage and maximum mana</li>
          <li><strong>Wisdom (WIS)</strong> - Increases healing power and mana regeneration</li>
          <li><strong>Charisma (CHA)</strong> - Increases bard song effects</li>
        </ul>

        <p>
          Each time you level up, you'll receive stat points that you can allocate to any
          of these attributes. Choose wisely based on your preferred playstyle!
        </p>

        <h2>Your First Steps</h2>

        <h3>1. Explore Your Surroundings</h3>

        <p>
          Start by roaming the Greenfield Plains to encounter basic enemies. This is a great
          way to learn combat mechanics and earn your first experience points and gold.
        </p>

        <h3>2. Complete Early Quests</h3>

        <p>
          Visit the quest board to find beginner quests. These provide excellent rewards and
          guide you through the early game. Look for quests marked for level 1-5 characters.
        </p>

        <h3>3. Upgrade Your Equipment</h3>

        <p>
          As you defeat enemies and complete quests, you'll acquire better equipment. Visit
          merchants to purchase weapons, armor, and consumables. Don't forget to equip your
          new gear from the inventory screen!
        </p>

        <h3>4. Learn Abilities</h3>

        <p>
          Abilities and spells can be learned from scrolls found as loot or purchased from
          merchants. Start with basic abilities and expand your repertoire as you level up.
        </p>

        <div class="card" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          <h3 style={{ "margin-top": "0" }}>Important Tips</h3>
          <ul style={{ "margin-bottom": "0" }}>
            <li>Always keep health potions in your inventory</li>
            <li>Rest frequently to regenerate health and mana</li>
            <li>Don't venture into higher-level areas until you're ready</li>
            <li>Save your gold for important equipment upgrades</li>
          </ul>
        </div>

        <h2>Understanding Combat</h2>

        <p>
          Combat in Morthvale is turn-based and influenced by your stats and equipment.
          Here are the basics:
        </p>

        <ul>
          <li><strong>Attack Speed</strong> determines how often you attack</li>
          <li><strong>Damage</strong> is calculated from your weapon and relevant stats</li>
          <li><strong>Defense</strong> from armor reduces incoming damage</li>
          <li><strong>Evasion</strong> gives you a chance to dodge attacks entirely</li>
        </ul>

        <p>
          For detailed combat mechanics, see the <A href="/wiki/combat">Combat System</A> guide.
        </p>

        <h2>Progression Path</h2>

        <h3>Levels 1-10: Greenfield Plains</h3>

        <p>
          Focus on learning the basics, completing early quests, and building your initial
          equipment set. This is your training ground.
        </p>

        <h3>Levels 10-20: Silverwood Forest</h3>

        <p>
          Once you've outgrown the plains, venture into the forest. Enemies here are tougher
          but offer better rewards. Consider specializing your character build.
        </p>

        <h3>Levels 20+: Beyond</h3>

        <p>
          Higher-level regions unlock as you progress. Each new area presents greater challenges
          and opportunities for advancement. Explore the <A href="/wiki/world">World</A> page
          to plan your journey.
        </p>

        <h2>Building Your Character</h2>

        <p>
          As you gain experience, you'll want to develop a focused character build. Here are
          some common archetypes:
        </p>

        <div style={{ 
          display: "grid", 
          "grid-template-columns": "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "1rem",
          "margin": "1.5rem 0"
        }}>
          <div class="card" style={{ background: "var(--bg-medium)" }}>
            <h4 style={{ "margin-top": "0", color: "var(--danger)" }}>Warrior</h4>
            <p style={{ "font-size": "0.9rem", "margin-bottom": "0" }}>
              Focus on STR and CON for high damage and survivability. Use heavy weapons and armor.
            </p>
          </div>

          <div class="card" style={{ background: "var(--bg-medium)" }}>
            <h4 style={{ "margin-top": "0", color: "var(--success)" }}>Ranger</h4>
            <p style={{ "font-size": "0.9rem", "margin-bottom": "0" }}>
              Build DEX for fast attacks and evasion. Rely on speed and precision over raw power.
            </p>
          </div>

          <div class="card" style={{ background: "var(--bg-medium)" }}>
            <h4 style={{ "margin-top": "0", color: "var(--accent)" }}>Mage</h4>
            <p style={{ "font-size": "0.9rem", "margin-bottom": "0" }}>
              Invest in INT and WIS for powerful spells. Master elemental magic and control the battlefield.
            </p>
          </div>
        </div>

        <h2>Essential Systems</h2>

        <h3>Crafting</h3>

        <p>
          Collect materials from defeated enemies and use them to craft powerful equipment.
          Crafting can produce items that rival or exceed dungeon loot!
        </p>

        <h3>Hotbar</h3>

        <p>
          Set up your hotbar with frequently-used abilities and consumables for quick access
          during combat. You can configure this from the Hotbar menu.
        </p>

        <h3>Quests</h3>

        <p>
          Quests provide experience, gold, and unique rewards. Check back regularly as new
          quests become available as you level up and explore new regions.
        </p>

        <div class="card" style={{ "margin-top": "2rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
          <h3 style={{ "margin-top": "0" }}>Next Steps</h3>
          <p>Now that you understand the basics, check out these guides:</p>
          <ul style={{ "margin-bottom": "0" }}>
            <li><A href="/wiki/combat">Combat System</A> - Master combat mechanics</li>
            <li><A href="/wiki/abilities">Abilities & Spells</A> - Learn powerful skills</li>
            <li><A href="/wiki/equipment">Equipment Guide</A> - Optimize your gear</li>
            <li><A href="/wiki/world">World Exploration</A> - Discover new regions</li>
          </ul>
        </div>

        <p style={{ "margin-top": "2rem", "font-style": "italic", color: "var(--text-secondary)" }}>
          Good luck on your adventures, and may fortune favor the bold!
        </p>
      </div>
    </WikiLayout>
  );
}
