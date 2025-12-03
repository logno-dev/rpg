import { createAsync, A } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import WikiLayout from "~/components/WikiLayout";
import { db } from "~/lib/db";

// Server function to fetch crafting data
const getCraftingData = async () => {
  "use server";
  
  // Get all crafting materials
  const materials = await db.execute(`
    SELECT id, name, description, rarity
    FROM crafting_materials
    ORDER BY 
      CASE rarity 
        WHEN 'common' THEN 1 
        WHEN 'uncommon' THEN 2 
        WHEN 'rare' THEN 3 
      END,
      name
  `);
  
  // Get special materials with what they unlock
  const materialUnlocks = await db.execute(`
    SELECT 
      cm.id,
      cm.name as material_name,
      cm.rarity as material_rarity,
      i.id as item_id,
      i.name as item_name,
      i.rarity as item_rarity,
      rg.name as recipe_name,
      rg.min_level,
      rg.max_level
    FROM crafting_materials cm
    JOIN recipe_outputs ro ON cm.id = ro.requires_rare_material_id
    JOIN items i ON ro.item_id = i.id
    JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
    WHERE cm.id >= 28
    ORDER BY cm.id, rg.min_level, i.name
  `);
  
  // Get recipe groups with their materials
  const recipeGroups = await db.execute(`
    SELECT 
      rg.id,
      rg.name,
      rg.profession_type,
      rg.category,
      rg.min_level,
      rg.max_level,
      rg.craft_time_seconds,
      rg.base_experience
    FROM recipe_groups rg
    ORDER BY rg.profession_type, rg.min_level
  `);
  
  // Get materials for each recipe group
  const recipeMaterialsQuery = await db.execute(`
    SELECT 
      rgm.recipe_group_id,
      cm.name as material_name,
      cm.rarity as material_rarity,
      rgm.quantity
    FROM recipe_group_materials rgm
    JOIN crafting_materials cm ON rgm.material_id = cm.id
    ORDER BY rgm.recipe_group_id, cm.name
  `);
  
  // Get outputs for each recipe group
  const recipeOutputsQuery = await db.execute(`
    SELECT 
      ro.recipe_group_id,
      i.id as item_id,
      i.name as item_name,
      i.rarity as item_rarity,
      i.required_level as item_level,
      i.slot,
      i.type,
      ro.min_profession_level,
      ro.base_weight,
      ro.weight_per_level,
      ro.quality_bonus_weight,
      ro.is_named,
      cm.id as required_material_id,
      cm.name as required_material,
      cm.rarity as material_rarity
    FROM recipe_outputs ro
    JOIN items i ON ro.item_id = i.id
    LEFT JOIN crafting_materials cm ON ro.requires_rare_material_id = cm.id
    ORDER BY ro.recipe_group_id, ro.min_profession_level, ro.base_weight DESC
  `);
  
  // Organize materials by recipe group
  const materialsByGroup: Record<number, any[]> = {};
  recipeMaterialsQuery.rows.forEach((row: any) => {
    if (!materialsByGroup[row.recipe_group_id]) {
      materialsByGroup[row.recipe_group_id] = [];
    }
    materialsByGroup[row.recipe_group_id].push(row);
  });
  
  // Organize outputs by recipe group
  const outputsByGroup: Record<number, any[]> = {};
  recipeOutputsQuery.rows.forEach((row: any) => {
    if (!outputsByGroup[row.recipe_group_id]) {
      outputsByGroup[row.recipe_group_id] = [];
    }
    outputsByGroup[row.recipe_group_id].push(row);
  });
  
  // Organize unlocks by material
  const unlocksByMaterial: Record<number, any[]> = {};
  materialUnlocks.rows.forEach((row: any) => {
    if (!unlocksByMaterial[row.id]) {
      unlocksByMaterial[row.id] = [];
    }
    unlocksByMaterial[row.id].push(row);
  });
  
  return {
    materials: materials.rows,
    recipeGroups: recipeGroups.rows.map((rg: any) => ({
      ...rg,
      materials: materialsByGroup[rg.id] || [],
      outputs: outputsByGroup[rg.id] || []
    })),
    materialUnlocks: unlocksByMaterial
  };
};

export default function CraftingWiki() {
  const data = createAsync(() => getCraftingData());
  const [selectedProfession, setSelectedProfession] = createSignal("all");
  const [selectedRarity, setSelectedRarity] = createSignal("all");
  
  const professions = [
    { value: "all", label: "All Professions" },
    { value: "blacksmithing", label: "Blacksmithing" },
    { value: "tailoring", label: "Tailoring" },
    { value: "leatherworking", label: "Leatherworking" },
    { value: "fletching", label: "Fletching" },
    { value: "alchemy", label: "Alchemy" },
  ];
  
  const rarities = [
    { value: "all", label: "All Rarities" },
    { value: "common", label: "Common" },
    { value: "uncommon", label: "Uncommon" },
    { value: "rare", label: "Rare" },
  ];
  
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return '#9d9d9d';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      default: return '#ffffff';
    }
  };
  
  const filteredMaterials = () => {
    const mats = data()?.materials || [];
    if (selectedRarity() === "all") return mats;
    return mats.filter((m: any) => m.rarity === selectedRarity());
  };
  
  const filteredRecipeGroups = () => {
    const groups = data()?.recipeGroups || [];
    if (selectedProfession() === "all") return groups;
    return groups.filter((g: any) => g.profession_type === selectedProfession());
  };

  return (
    <WikiLayout>
      <div>
        <h1>Crafting System</h1>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Overview</h2>
          <p>
            Crafting in Morthvale allows you to create powerful equipment, consumables, and items. Each crafting 
            profession has its own recipe groups that produce different types of items. Success in crafting depends 
            on your profession level and the quality of materials you use.
          </p>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>How Crafting Works</h2>
          <ol>
            <li><strong>Select a Recipe Group:</strong> Choose what category of item you want to craft</li>
            <li><strong>Gather Materials:</strong> Collect the required crafting materials</li>
            <li><strong>Craft the Item:</strong> Use the crafting interface to create items</li>
            <li><strong>Quality Matters:</strong> Higher quality crafts have better chances of producing rare outcomes</li>
          </ol>
          
          <h3>Profession Levels</h3>
          <p>
            Your profession level equals your character level. As you gain character levels, your crafting professions 
            automatically scale with you. Each recipe has a minimum level requirement - you must be at least that level 
            to access the recipe.
          </p>
          <ul>
            <li><strong>Simple Recipes (Level 1-15):</strong> Craft basic equipment and consumables</li>
            <li><strong>Moderate Recipes (Level 15-30):</strong> Craft improved gear for mid-level characters</li>
            <li><strong>Advanced Recipes (Level 30-50):</strong> Craft powerful endgame equipment</li>
            <li><strong>Specialty Recipes:</strong> Some recipes span wide level ranges and unlock better outputs as you level</li>
          </ul>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Probability System</h2>
          <p>
            When you craft an item, the specific outcome is determined by a weighted random system. Each possible 
            item in a recipe group has a base weight that determines its probability of being crafted.
          </p>
          
          <h3>How Weights Work</h3>
          <ul>
            <li><strong>Base Weight:</strong> The starting probability for each item</li>
            <li><strong>Level Bonus:</strong> Your profession level increases weights by weight_per_level × your level</li>
            <li><strong>Quality Bonus:</strong> Higher quality crafts add quality_bonus_weight × quality level</li>
            <li><strong>Total Weight:</strong> Base + Level Bonus + Quality Bonus</li>
          </ul>
          
          <div style={{ 
            background: "rgba(59, 130, 246, 0.1)", 
            border: "1px solid rgba(59, 130, 246, 0.3)",
            padding: "1rem",
            "border-radius": "6px",
            "margin-top": "1rem"
          }}>
            <h4 style={{ "margin-top": "0" }}>Example</h4>
            <p style={{ "margin-bottom": "0.5rem" }}>
              If a recipe group has three possible outcomes:
            </p>
            <ul style={{ "margin-bottom": "0" }}>
              <li>Common Sword: Base Weight 100 → 50% chance</li>
              <li>Uncommon Sword: Base Weight 75 → 37.5% chance</li>
              <li>Rare Sword: Base Weight 25 → 12.5% chance</li>
            </ul>
            <p style={{ "margin-top": "1rem", "margin-bottom": "0" }}>
              As your profession level increases and you achieve higher quality crafts, the weights shift to favor 
              better outcomes!
            </p>
          </div>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Understanding Material Types</h2>
          
          <h3>Basic Materials</h3>
          <p>
            Basic materials (Iron Ore, Linen Cloth, Rough Leather, etc.) are the foundation of all recipes. 
            These are REQUIRED to craft any recipe and are easily obtained from enemies and gathering.
          </p>
          
          <h3>Special Materials (OPTIONAL)</h3>
          <p>
            Special materials are <strong>optional components</strong> that unlock access to better crafting outcomes. 
            When you have a special material in your inventory, you'll be prompted during crafting whether to use it. 
            Using it gives you access to rare/epic items that wouldn't otherwise be available.
          </p>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Recipe Groups</h2>
          
          <div style={{ 
            background: "rgba(59, 130, 246, 0.1)", 
            border: "1px solid rgba(59, 130, 246, 0.3)",
            padding: "1rem",
            "border-radius": "6px",
            "margin-bottom": "1rem"
          }}>
            <h4 style={{ "margin-top": "0" }}>How Recipe Progression Works</h4>
            <p style={{ "margin-top": "0.5rem", "margin-bottom": "0.75rem" }}>
              <strong>NOT all outputs are available immediately!</strong> Each recipe has multiple possible items that 
              progressively unlock as you level up. Higher-level items only become craftable once you reach the 
              required profession level.
            </p>
            <ul style={{ "margin-bottom": "0", "font-size": "0.95rem" }}>
              <li><strong>Recipe Unlocks At:</strong> The minimum level to access the recipe (shown in green)</li>
              <li><strong>Item Lv:</strong> The character level required to equip the crafted item</li>
              <li><strong>Unlocks At:</strong> Your profession level must reach this to have a chance at crafting this specific item</li>
              <li><strong>Example:</strong> Dual Daggers recipe unlocks at level 20, but Celestial Dual Daggers (level 42 item) only become craftable at profession level 31</li>
            </ul>
          </div>
          
          <div style={{ "margin-bottom": "1rem", display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
            <For each={professions}>
              {(prof) => (
                <button
                  class={`button ${selectedProfession() === prof.value ? "" : "secondary"}`}
                  onClick={() => setSelectedProfession(prof.value)}
                >
                  {prof.label}
                </button>
              )}
            </For>
          </div>
          
          <Show when={data()}>
            <For each={filteredRecipeGroups()}>
              {(group: any) => (
                <div class="card" style={{ 
                  "margin-bottom": "1.5rem",
                  background: "var(--bg-light)",
                  border: "1px solid var(--bg-medium)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    "justify-content": "space-between", 
                    "align-items": "start",
                    "flex-wrap": "wrap",
                    gap: "1rem"
                  }}>
                    <div>
                      <h3 style={{ "margin-top": "0", "margin-bottom": "0.5rem" }}>
                        {group.name}
                      </h3>
                      <div style={{ 
                        display: "flex", 
                        gap: "1rem", 
                        "font-size": "0.9rem", 
                        color: "var(--text-secondary)",
                        "flex-wrap": "wrap"
                      }}>
                        <span style={{ "text-transform": "capitalize" }}>
                          {group.profession_type}
                        </span>
                        <span>•</span>
                        <span>{group.category}</span>
                        <span>•</span>
                        <span style={{ 
                          color: "var(--success)", 
                          "font-weight": "bold" 
                        }}>
                          Unlocks at Level {group.min_level}
                        </span>
                        <span>•</span>
                        <span>{group.craft_time_seconds}s craft time</span>
                        <span>•</span>
                        <span>{group.base_experience} base XP</span>
                      </div>
                    </div>
                  </div>
                  
                  <Show when={group.materials.length > 0}>
                    <div style={{ "margin-top": "1rem" }}>
                      <h4 style={{ "margin-bottom": "0.5rem", "font-size": "1rem" }}>Required Materials</h4>
                      <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
                        <For each={group.materials}>
                          {(mat: any) => (
                            <span style={{ 
                              display: "inline-block",
                              padding: "0.25rem 0.75rem",
                              background: "var(--bg-dark)",
                              "border-radius": "4px",
                              "font-size": "0.9rem",
                              color: getRarityColor(mat.material_rarity)
                            }}>
                              {mat.material_name} x{mat.quantity}
                            </span>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                  
                  <Show when={group.outputs.length > 0}>
                    <div style={{ "margin-top": "1rem" }}>
                      <h4 style={{ "margin-bottom": "0.5rem", "font-size": "1rem" }}>Possible Outcomes</h4>
                      <div style={{ "overflow-x": "auto" }}>
                        <table class="wiki-table" style={{ "font-size": "0.9rem" }}>
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Item Lv</th>
                              <th>Unlocks At</th>
                              <th>Rarity</th>
                              <th>Special Material</th>
                              <th>Base Weight</th>
                              <th>Level Bonus</th>
                              <th>Quality Bonus</th>
                            </tr>
                          </thead>
                          <tbody>
                            <For each={group.outputs}>
                              {(output: any) => (
                                <tr>
                                  <td style={{ 
                                    color: getRarityColor(output.item_rarity),
                                    "font-weight": output.is_named ? "bold" : "normal"
                                  }}>
                                    <A 
                                      href={`/wiki/equipment/${output.item_id}`}
                                      style={{ 
                                        color: getRarityColor(output.item_rarity),
                                        "text-decoration": "none"
                                      }}
                                    >
                                      {output.item_name}
                                    </A> {output.is_named ? "★" : ""}
                                  </td>
                                  <td style={{ color: "var(--text-secondary)" }}>
                                    {output.item_level}
                                  </td>
                                  <td style={{ 
                                    color: output.min_profession_level > group.min_level 
                                      ? "var(--warning)" 
                                      : "var(--text-secondary)"
                                  }}>
                                    {output.min_profession_level > group.min_level 
                                      ? `Level ${output.min_profession_level}` 
                                      : "Immediately"}
                                  </td>
                                  <td style={{ 
                                    color: getRarityColor(output.item_rarity),
                                    "text-transform": "capitalize"
                                  }}>
                                    {output.item_rarity}
                                  </td>
                                  <td style={{ 
                                    "font-style": output.required_material ? "normal" : "italic"
                                  }}>
                                    <Show 
                                      when={output.required_material}
                                      fallback={<span style={{ color: "var(--text-secondary)" }}>Always available</span>}
                                    >
                                      <A 
                                        href={`/wiki/material/${output.required_material_id}`}
                                        style={{ 
                                          color: getRarityColor(output.material_rarity),
                                          "text-decoration": "none"
                                        }}
                                      >
                                        {output.required_material}
                                      </A>
                                    </Show>
                                  </td>
                                  <td>{output.base_weight}</td>
                                  <td>+{output.weight_per_level}/level</td>
                                  <td>+{output.quality_bonus_weight}/quality</td>
                                </tr>
                              )}
                            </For>
                          </tbody>
                        </table>
                      </div>
                      <div style={{ 
                        "font-size": "0.85rem", 
                        color: "var(--text-secondary)",
                        "margin-top": "0.5rem",
                        "margin-bottom": "0"
                      }}>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>★</strong> = Named item (unique equipment with special properties)
                        </p>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>"Always available"</strong> = Can be crafted without special materials
                        </p>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>Colored material names</strong> = Must have this special material in inventory to unlock this outcome
                        </p>
                      </div>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </Show>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Crafting Materials</h2>
          
          <p>
            Many special materials can be obtained through repeatable quests with short cooldowns (30min-2hr).
          </p>
          
          <div style={{ 
            background: "rgba(59, 130, 246, 0.1)", 
            border: "1px solid rgba(59, 130, 246, 0.3)",
            padding: "1rem",
            "border-radius": "6px",
            "margin-bottom": "1rem"
          }}>
            <h4 style={{ "margin-top": "0" }}>Material Rarity</h4>
            <ul style={{ "margin-bottom": "0" }}>
              <li><strong>Common:</strong> Basic materials dropped by most enemies</li>
              <li><strong>Uncommon:</strong> Special materials from specific enemies or quests</li>
              <li><strong>Rare:</strong> Valuable materials from elite enemies, bosses, or repeatable quests</li>
            </ul>
          </div>
          
          <div style={{ "margin-bottom": "1rem", display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
            <For each={rarities}>
              {(rarity) => (
                <button
                  class={`button ${selectedRarity() === rarity.value ? "" : "secondary"}`}
                  onClick={() => setSelectedRarity(rarity.value)}
                >
                  {rarity.label}
                </button>
              )}
            </For>
          </div>
          
          <Show when={data()}>
            <div style={{ "overflow-x": "auto" }}>
              <table class="wiki-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Rarity</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={filteredMaterials()}>
                    {(material: any) => (
                      <tr>
                        <td style={{ "font-weight": "bold" }}>
                          <A 
                            href={`/wiki/material/${material.id}`}
                            style={{ 
                              color: getRarityColor(material.rarity),
                              "text-decoration": "none"
                            }}
                          >
                            {material.name}
                          </A>
                        </td>
                        <td style={{ 
                          color: getRarityColor(material.rarity),
                          "text-transform": "capitalize"
                        }}>
                          {material.rarity}
                        </td>
                        <td>{material.description}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Special Materials - OPTIONAL Upgrades</h2>
          <p>
            Special materials are <strong>OPTIONAL</strong> components that unlock access to better crafting outcomes! 
            When you have special materials in your inventory, you'll be prompted to use them for a chance at 
            rare, epic, or legendary items.
          </p>
          
          <h3>How Special Materials Work</h3>
          <ul>
            <li><strong>Optional, Not Required:</strong> You can craft recipes with just basic materials (Iron Ore, Linen Cloth, etc.)</li>
            <li><strong>Unlock Better Outcomes:</strong> Having special materials in your inventory unlocks access to rare/epic outputs</li>
            <li><strong>You Choose:</strong> When starting a craft, if you have special materials, you'll be prompted whether to use them</li>
            <li><strong>Material Consumed:</strong> If you choose to use a special material, it's consumed during the craft</li>
            <li><strong>Not Guaranteed:</strong> Using a special material gives you a CHANCE at the rare outcome, based on your level and quality</li>
          </ul>
          
          <div style={{ 
            background: "rgba(245, 158, 11, 0.1)", 
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "1rem",
            "border-radius": "6px",
            "margin-top": "1rem"
          }}>
            <h4 style={{ "margin-top": "0" }}>Example: Simple Sword Crafting</h4>
            <p style={{ "margin-bottom": "0.5rem" }}>
              <strong>Basic Craft (no special materials):</strong>
            </p>
            <ul>
              <li>Requires: 3x Iron Ore</li>
              <li>Possible outcomes: Rusty Sword, Iron Sword, Iron Longsword (common/uncommon)</li>
            </ul>
            <p style={{ "margin-top": "1rem", "margin-bottom": "0.5rem" }}>
              <strong>With Hardened Leather Strip:</strong>
            </p>
            <ul style={{ "margin-bottom": "0" }}>
              <li>Requires: 3x Iron Ore</li>
              <li>Optional: 1x Hardened Leather Strip</li>
              <li>Unlocks access to: Steel Sword (uncommon) - much better than basic outcomes!</li>
            </ul>
            <p style={{ "margin-top": "1rem", "font-style": "italic", "margin-bottom": "0" }}>
              The game will prompt you: "You have Hardened Leather Strip. Use it for a chance at better outcomes?"
            </p>
          </div>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>What Each Special Material Unlocks</h2>
          <p>
            Below is a complete list of special materials and exactly which items they unlock. Each special 
            material typically unlocks 3 different items across various recipe groups.
          </p>
          
          <Show when={data()}>
            <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
              <For each={filteredMaterials()}>
                {(material: any) => {
                  const unlocks = data()?.materialUnlocks?.[material.id] || [];
                  
                  return (
                    <Show when={unlocks.length > 0}>
                      <div style={{ 
                        border: "1px solid var(--bg-medium)",
                        padding: "1rem",
                        "border-radius": "6px",
                        background: "var(--bg-light)"
                      }}>
                        <h4 style={{ 
                          "margin-top": "0",
                          "margin-bottom": "0.5rem",
                          color: getRarityColor(material.rarity)
                        }}>
                          {material.name} ({material.rarity})
                        </h4>
                        <p style={{ 
                          "font-size": "0.9rem", 
                          color: "var(--text-secondary)",
                          "margin-bottom": "0.75rem"
                        }}>
                          {material.description}
                        </p>
                        <div style={{ "font-size": "0.9rem" }}>
                          <strong>Unlocks:</strong>
                          <ul style={{ "margin-top": "0.5rem", "margin-bottom": "0" }}>
                            <For each={unlocks}>
                              {(unlock: any) => (
                                <li style={{ color: getRarityColor(unlock.item_rarity) }}>
                                  <A 
                                    href={`/wiki/equipment/${unlock.item_id}`}
                                    style={{ 
                                      color: getRarityColor(unlock.item_rarity),
                                      "text-decoration": "none",
                                      "font-weight": "bold"
                                    }}
                                  >
                                    {unlock.item_name}
                                  </A> ({unlock.item_rarity}) 
                                  <span style={{ color: "var(--text-secondary)" }}>
                                    {' '}in {unlock.recipe_name} (Level {unlock.min_level}-{unlock.max_level})
                                  </span>
                                </li>
                              )}
                            </For>
                          </ul>
                        </div>
                      </div>
                    </Show>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem" }}>
          <h2>Special Material Strategy</h2>
          <p>
            Special materials are valuable and shouldn't be wasted! Here's how to use them effectively:
          </p>
          
          <h3>When to Use Special Materials</h3>
          <ul>
            <li><strong>High Profession Level:</strong> Your profession level increases the weight of rare outcomes</li>
            <li><strong>High Quality Crafts:</strong> Focus on getting perfect quality crafts when using special materials</li>
            <li><strong>Right Recipe Group:</strong> Use appropriate materials for your level range (don't waste epic materials on simple recipes)</li>
          </ul>
          
          <h3>Material Tiers</h3>
          <ul>
            <li><strong>Uncommon Materials (Level 1-30):</strong> Iron Rivets, Hardened Leather Strip, Polished Stone, Silver Thread, etc.</li>
            <li><strong>Rare Materials (Level 10-40):</strong> Tempered Steel Bar, Blessed Oak, Moonstone Shard, Alchemical Resin</li>
            <li><strong>Epic Materials (Level 25+):</strong> Titanium Ore, Phoenix Feather, Void Crystal, Essence of Fire/Ice, Demon Horn</li>
          </ul>
        </div>

        <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <h3>Crafting Tips</h3>
          <ul style={{ "margin-bottom": "0" }}>
            <li>Level up your profession to increase your chances of crafting higher rarity items</li>
            <li>Higher quality crafts significantly improve your odds of getting rare outcomes</li>
            <li>Special materials are OPTIONAL but unlock access to much better items!</li>
            <li>Save special materials for when you can achieve high-quality crafts</li>
            <li>Named items (★) are unique equipment pieces with special properties</li>
            <li>Complete repeatable material quests (30min-2hr cooldowns) to farm special materials</li>
            <li>The craft time and base experience vary by recipe group complexity</li>
            <li>Each special material unlocks 3 different rare outputs per recipe group</li>
          </ul>
        </div>
      </div>
    </WikiLayout>
  );
}
