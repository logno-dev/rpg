import { A } from "@solidjs/router";
import { WikiData, RegionTable } from "~/components/WikiData";
import WikiLayout from "~/components/WikiLayout";

export default function WorldWiki() {
  return (
    <WikiLayout>
      <div>
        <h1>The World of Morthvale</h1>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Welcome to Morthvale</h2>
        <p>
          Morthvale is a vast fantasy realm filled with diverse regions, each with its own unique challenges,
          creatures, and treasures. As an adventurer, you'll explore these lands, grow stronger, and uncover
          the mysteries that lie within.
        </p>
        <p>
          Each region is designed for characters within a specific level range. As you grow stronger,
          new regions will become available to explore.
        </p>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Regions</h2>
        <p>
          Below is a comprehensive list of all regions in Morthvale. Plan your adventures wisely and
          ensure you're adequately prepared before venturing into higher-level areas.
        </p>
        
        <WikiData endpoint="regions">
          {(regions) => <RegionTable data={regions} />}
        </WikiData>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Exploration Tips</h2>
        <ul>
          <li><strong>Safe Zones:</strong> Towns and cities are safe zones where you can rest, trade, and accept quests</li>
          <li><strong>Sub-Areas:</strong> Each region contains multiple sub-areas with varying difficulty</li>
          <li><strong>Named Mobs:</strong> Powerful unique creatures spawn rarely - defeat them for special rewards</li>
          <li><strong>Dungeons:</strong> Instanced areas with multiple encounters leading to a boss fight</li>
        </ul>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Region Progression</h2>
        <p>
          Some regions are locked until you meet certain requirements, such as completing specific quests
          or defeating particular bosses. These locked regions contain the most challenging content and
          the greatest rewards.
        </p>
        <p>
          When exploring a new region for the first time, it's recommended to:
        </p>
        <ol>
          <li>Visit the safe zone first to stock up on supplies</li>
          <li>Accept regional quests to gain extra experience and rewards</li>
          <li>Start with the lowest-level sub-areas to gauge the difficulty</li>
          <li>Upgrade your equipment at regional merchants as needed</li>
        </ol>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.3)" }}>
        <h3>Warning</h3>
        <p style={{ "margin-bottom": "0" }}>
          Venturing into regions well above your level is extremely dangerous. Mobs in higher-level areas
          will quickly overwhelm unprepared adventurers. Always check the recommended level range before exploring.
        </p>
      </div>
      </div>
    </WikiLayout>
  );
}
