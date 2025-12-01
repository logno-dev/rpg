import { A } from "@solidjs/router";
import WikiLayout from "~/components/WikiLayout";

export default function WikiHome() {
  return (
    <WikiLayout>
      <div>
        <h1>Welcome to the Morthvale Wiki</h1>
        
        <p>
          Welcome, adventurer! This wiki is your comprehensive guide to the world of Morthvale,
          a fantasy RPG filled with danger, adventure, and untold treasures.
        </p>

        <div class="card" style={{ "margin-top": "2rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
          <h2 style={{ "margin-top": "0" }}>New to Morthvale?</h2>
          <p>
            Start your journey here! Our getting started guide will walk you through character
            creation, basic mechanics, and your first steps in the world.
          </p>
          <A href="/wiki/getting-started" class="button" style={{ display: "inline-block", background: "var(--accent)", color: "white" }}>
            Getting Started Guide →
          </A>
        </div>

        <h2 style={{ "margin-top": "3rem" }}>Quick Navigation</h2>

        <div style={{ 
          display: "grid", 
          "grid-template-columns": "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "1rem",
          "margin-top": "1.5rem"
        }}>
          <div class="card">
            <h3 style={{ "margin-top": "0" }}>Combat</h3>
            <p style={{ "font-size": "0.95rem", "margin-bottom": "1rem" }}>
              Learn about the combat system, stats, and how to survive dangerous encounters.
            </p>
            <A href="/wiki/combat" class="button secondary" style={{ display: "inline-block", "font-size": "0.9rem" }}>
              View Combat Guide
            </A>
          </div>

          <div class="card">
            <h3 style={{ "margin-top": "0" }}>Quests</h3>
            <p style={{ "font-size": "0.95rem", "margin-bottom": "1rem" }}>
              Understand quest types, objectives, and rewards to maximize your adventure.
            </p>
            <A href="/wiki/quest" class="button secondary" style={{ display: "inline-block", "font-size": "0.9rem" }}>
              Quest Guide
            </A>
          </div>

          <div class="card">
            <h3 style={{ "margin-top": "0" }}>World</h3>
            <p style={{ "font-size": "0.95rem", "margin-bottom": "1rem" }}>
              Explore the regions, dungeons, and locations that make up the world of Morthvale.
            </p>
            <A href="/wiki/world" class="button secondary" style={{ display: "inline-block", "font-size": "0.9rem" }}>
              Explore Regions
            </A>
          </div>

          <div class="card">
            <h3 style={{ "margin-top": "0" }}>Abilities</h3>
            <p style={{ "font-size": "0.95rem", "margin-bottom": "1rem" }}>
              Master powerful abilities and spells to enhance your combat effectiveness.
            </p>
            <A href="/wiki/ability" class="button secondary" style={{ display: "inline-block", "font-size": "0.9rem" }}>
              Browse Abilities
            </A>
          </div>

          <div class="card">
            <h3 style={{ "margin-top": "0" }}>Equipment</h3>
            <p style={{ "font-size": "0.95rem", "margin-bottom": "1rem" }}>
              Discover weapons, armor, and items to strengthen your character.
            </p>
            <A href="/wiki/equipment" class="button secondary" style={{ display: "inline-block", "font-size": "0.9rem" }}>
              View Equipment
            </A>
          </div>
        </div>

        <h2 style={{ "margin-top": "3rem" }}>About This Wiki</h2>
        
        <p>
          This wiki combines hand-written guides with live data from the game database, ensuring
          you always have access to the most up-to-date information about Morthvale.
        </p>

        <p>
          Use the navigation menu on the left (or the menu button on mobile) to browse different
          sections of the wiki. Each page contains detailed information about specific game systems,
          mechanics, and content.
        </p>

        <div class="card" style={{ "margin-top": "2rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <h3 style={{ "margin-top": "0" }}>Tip</h3>
          <p style={{ "margin-bottom": "0" }}>
            Data tables throughout the wiki are pulled directly from the game database and update
            automatically. This means you're always seeing current stats, requirements, and rewards!
          </p>
        </div>

        <h2 style={{ "margin-top": "3rem" }}>Popular Pages</h2>
        
        <ul style={{ "line-height": "2" }}>
          <li><A href="/wiki/getting-started">Getting Started</A> - New player guide</li>
          <li><A href="/wiki/combat">Combat System</A> - How combat works</li>
          <li><A href="/wiki/quest">Quests</A> - Quest types and rewards</li>
          <li><A href="/wiki/world">Regions & Areas</A> - World exploration</li>
          <li><A href="/wiki/ability">Abilities & Spells</A> - Complete ability database</li>
          <li><A href="/wiki/equipment">Equipment & Items</A> - Gear and loot information</li>
        </ul>

        <div style={{ "margin-top": "3rem", padding: "1.5rem", background: "var(--bg-medium)", "border-radius": "8px", "border-left": "4px solid var(--accent)" }}>
          <p style={{ "margin": "0", "font-style": "italic" }}>
            "Knowledge is power. The more you understand about Morthvale, the better equipped
            you'll be to face its challenges and claim its rewards."
          </p>
          <p style={{ "margin": "0.5rem 0 0 0", "font-size": "0.9rem", color: "var(--text-secondary)" }}>
            — Unknown Adventurer
          </p>
        </div>
      </div>
    </WikiLayout>
  );
}
