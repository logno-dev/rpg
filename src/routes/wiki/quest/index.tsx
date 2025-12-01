import WikiLayout from "~/components/WikiLayout";
import { A } from "@solidjs/router";
import { WikiData, QuestTable } from "~/components/WikiData";

export default function QuestsWiki() {
  return (
    <WikiLayout>
      <div>
        <h1>Quests</h1>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Overview</h2>
          <p>
            Quests are structured missions that guide your journey through Morthvale, offering
            meaningful rewards and advancing the story of each region. They provide experience,
            gold, items, and crafting materials while teaching you about the world and its challenges.
          </p>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Finding Quests</h2>
          
          <h3>Quest Board</h3>
          <p>
            Access the quest board from the main game screen to see all available quests for your
            current region. Quests are organized by:
          </p>
          <ul>
            <li><strong>Available:</strong> Quests you can accept right now</li>
            <li><strong>Active:</strong> Quests you're currently working on</li>
            <li><strong>Completed:</strong> Quests ready to turn in for rewards</li>
          </ul>

          <h3>Level Requirements</h3>
          <p>
            Each quest has a minimum level requirement. Quests will display their required level,
            and you won't be able to accept quests that are above your current level. It's recommended
            to complete quests around your level for the best experience.
          </p>

          <h3>Quest Indicators</h3>
          <p>
            When you have active quests, you'll see indicators throughout the game:
          </p>
          <ul>
            <li><strong>Quest Log:</strong> Access your active quests at any time to review objectives</li>
            <li><strong>Progress Tracking:</strong> See your completion status for each objective</li>
            <li><strong>Turn In Ready:</strong> Clear notification when a quest is ready to complete</li>
          </ul>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Quest Types</h2>

          <h3>Story Quests</h3>
          <p>
            Main narrative quests that introduce you to each region and its unique challenges.
            These quests often unlock new areas, introduce important characters, or reveal lore
            about Morthvale.
          </p>

          <h3>Bounty Quests</h3>
          <p>
            Combat-focused quests that task you with eliminating specific creatures in certain areas.
            Perfect for gaining combat experience and earning rewards while exploring.
          </p>

          <h3>Collection Quests</h3>
          <p>
            Gather specific items or materials from the world. These quests encourage exploration
            and often provide crafting materials as rewards.
          </p>

          <h3>Training Quests</h3>
          <p>
            Learn new abilities and skills through dedicated training quests. These quests reward
            you with ability scrolls and teach you how to use your class's powers effectively.
          </p>

          <h3>Repeatable Quests</h3>
          <p>
            Some quests can be repeated after a cooldown period, allowing you to farm specific
            rewards or materials. These are marked as "Repeatable" in the quest description.
          </p>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Quest Objectives</h2>

          <h3>Kill Objectives</h3>
          <p>
            Defeat a specific number of creatures. These objectives track automatically as you
            battle enemies in the wild or in dungeons.
          </p>
          <ul>
            <li>Progress updates in real-time after each kill</li>
            <li>Must defeat the exact mob type specified</li>
            <li>Location matters - check which area the mobs spawn in</li>
          </ul>

          <h3>Collection Objectives</h3>
          <p>
            Gather items or crafting materials. Some items drop from specific enemies, while
            others may require crafting or purchasing.
          </p>
          <ul>
            <li>Items can be obtained through combat loot, crafting, or merchants</li>
            <li>Check your inventory to see current progress</li>
            <li>Items are consumed upon quest completion</li>
          </ul>

          <h3>Multi-Objective Quests</h3>
          <p>
            Many quests have multiple objectives that must be completed in order. Complete each
            objective before moving to the next.
          </p>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Quest Rewards</h2>

          <h3>Experience Points (XP)</h3>
          <p>
            All quests grant experience points to help you level up. Quest XP is often more
            efficient than pure grinding, making quests an excellent way to progress.
          </p>

          <h3>Gold</h3>
          <p>
            Most quests provide gold rewards that can be used to purchase equipment, consumables,
            or ability scrolls from merchants.
          </p>

          <h3>Items</h3>
          <p>
            Many quests reward you with equipment, consumables, or ability scrolls. Quest rewards
            are often guaranteed upgrades for your level, making them worth pursuing.
          </p>

          <h3>Crafting Materials</h3>
          <p>
            Some quests reward rare crafting materials that can be used to create powerful equipment
            through the crafting system. These materials are often difficult to obtain otherwise.
          </p>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Quest Progression</h2>

          <h3>Quest Chains</h3>
          <p>
            Some quests are part of chains where completing one unlocks the next. These chains
            tell a larger story and often lead to significant rewards or unlock new content.
          </p>

          <h3>Abandoning Quests</h3>
          <p>
            If you're stuck or want to pursue different content, you can abandon active quests
            from your quest log. You can always re-accept abandoned quests later.
          </p>
          <ul>
            <li>Progress is lost when you abandon a quest</li>
            <li>Quest items are not returned</li>
            <li>The quest will reappear in the available quests list</li>
          </ul>

          <h3>Quest Log Management</h3>
          <p>
            Keep track of your active quests through the quest log, accessible from the main menu.
            The quest log shows:
          </p>
          <ul>
            <li>All active quests and their objectives</li>
            <li>Current progress for each objective</li>
            <li>Quest descriptions and story context</li>
            <li>Reward previews</li>
          </ul>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <h3 style={{ "margin-top": "0" }}>Pro Tips</h3>
          <ul style={{ "margin-bottom": "0" }}>
            <li><strong>Quest Efficiency:</strong> Accept multiple quests in the same area to complete them simultaneously</li>
            <li><strong>Read Descriptions:</strong> Quest descriptions often hint at where to find objectives</li>
            <li><strong>Level Appropriate:</strong> Focus on quests at or near your level for the best rewards</li>
            <li><strong>Don't Hoard:</strong> Complete and turn in quests regularly to maintain inventory space</li>
            <li><strong>Ability Scrolls:</strong> Prioritize training quests early to build your combat toolkit</li>
            <li><strong>Repeatable Value:</strong> Repeatable quests are excellent for farming specific materials</li>
          </ul>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Regional Quests</h2>
          
          <p>
            Each region in Morthvale offers unique quests themed around its environment and challenges.
            As you explore new regions, you'll unlock access to their quest boards.
          </p>

          <h3>Greenfield Plains</h3>
          <p>
            The starting region offers beginner-friendly quests that teach core game mechanics.
            Expect bounties against common wildlife, training quests for basic abilities, and
            introductory story quests.
          </p>

          <h3>Higher Level Regions</h3>
          <p>
            As you venture into more dangerous regions, quests become more challenging and rewarding.
            Higher level quests often require completing dungeons, defeating elite creatures, or
            gathering rare materials.
          </p>

          <p style={{ "margin-top": "1.5rem" }}>
            For more information about specific regions, see the <A href="/wiki/world" style={{ color: "var(--accent)" }}>Regions & Areas</A> guide.
          </p>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Quest Database</h2>
          <p>
            Browse all available quests in Morthvale. This table shows quest details including
            level requirements, regions, and whether quests can be repeated.
          </p>
          
          <WikiData endpoint="quests">
            {(quests) => <QuestTable data={quests} />}
          </WikiData>
        </div>

        <div style={{ "margin-top": "3rem", padding: "1.5rem", background: "var(--bg-medium)", "border-radius": "8px", "border-left": "4px solid var(--accent)" }}>
          <p style={{ "margin": "0", "font-style": "italic" }}>
            "Every quest is an opportunity - for growth, for wealth, or for glory. Choose wisely,
            and let no challenge go unanswered."
          </p>
          <p style={{ "margin": "0.5rem 0 0 0", "font-size": "0.9rem", color: "var(--text-secondary)" }}>
            — Quest Master's Creed
          </p>
        </div>
      </div>
    </WikiLayout>
  );
}
