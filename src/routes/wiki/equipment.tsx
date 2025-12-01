import { WikiData, ItemTable } from "~/components/WikiData";
import { createSignal } from "solid-js";
import WikiLayout from "~/components/WikiLayout";

export default function EquipmentWiki() {
  const [selectedType, setSelectedType] = createSignal("weapon");

  const equipmentTypes = [
    { value: "weapon", label: "Weapons" },
    { value: "armor", label: "Armor" },
    { value: "accessory", label: "Accessories" },
  ];

  return (
    <WikiLayout>
      <div>
        <h1>Equipment & Items</h1>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Equipment System</h2>
        <p>
          Equipment in Morthvale comes in various types, rarities, and power levels. The right equipment
          can dramatically increase your effectiveness in combat.
        </p>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Rarity Tiers</h2>
        <p>Items are classified by rarity, which determines their power and availability:</p>
        <ul>
          <li style={{ color: "#9d9d9d" }}><strong>Common:</strong> Basic items with minimal bonuses</li>
          <li style={{ color: "#1eff00" }}><strong>Uncommon:</strong> Decent items with moderate bonuses</li>
          <li style={{ color: "#0070dd" }}><strong>Rare:</strong> Powerful items with significant bonuses</li>
          <li style={{ color: "#a335ee" }}><strong>Epic:</strong> Exceptional items with major bonuses</li>
          <li style={{ color: "#ff8000" }}><strong>Legendary:</strong> The most powerful items in the game</li>
        </ul>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Equipment Slots</h2>
        <p>Characters can equip items in the following slots:</p>
        <ul>
          <li><strong>Main Hand:</strong> Primary weapon for damage</li>
          <li><strong>Off Hand:</strong> Shield, secondary weapon, or caster focus</li>
          <li><strong>Head, Chest, Legs, Feet:</strong> Armor pieces for defense</li>
          <li><strong>Accessory Slots:</strong> Rings, amulets, and other special items</li>
        </ul>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Browse Equipment</h2>
        <div style={{ "margin-bottom": "1rem", display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          {equipmentTypes.map((type) => (
            <button
              class={`button ${selectedType() === type.value ? "" : "secondary"}`}
              onClick={() => setSelectedType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
        
        <WikiData endpoint="items" params={{ type: selectedType() }}>
          {(items) => <ItemTable data={items} />}
        </WikiData>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem" }}>
        <h2>Legendary Items</h2>
        <p>
          Legendary items are the pinnacle of equipment in Morthvale. These items have unique properties
          and powerful stat bonuses that can define your character's playstyle.
        </p>
        
        <WikiData endpoint="items" params={{ rarity: "legendary" }}>
          {(items) => <ItemTable data={items} />}
        </WikiData>
      </div>

      <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
        <h3>Equipment Tips</h3>
        <ul style={{ "margin-bottom": "0" }}>
          <li>Always check item requirements before purchasing or equipping</li>
          <li>Higher rarity items have better stats but also higher requirements</li>
          <li>Consider your build when choosing equipment - a balanced approach often works best</li>
          <li>Don't forget to upgrade your equipment as you level up</li>
          <li>Craft equipment can sometimes be more powerful than dropped loot</li>
        </ul>
      </div>
      </div>
    </WikiLayout>
  );
}
