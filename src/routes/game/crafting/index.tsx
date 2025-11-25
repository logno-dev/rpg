import { createSignal, Show, For, createEffect } from "solid-js";
import { GameLayout } from "~/components/GameLayout";
import { CraftingMinigame } from "~/components/CraftingMinigame";
import { useCharacter } from "~/lib/CharacterContext";
import { useBasicCharacterData } from "~/lib/game-helpers";

type Profession = "blacksmithing" | "leatherworking" | "tailoring" | "fletching" | "alchemy";

type ProfessionData = {
  type: Profession;
  level: number;
  experience: number;
};

type Material = {
  id: number;
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare";
  quantity: number;
};

type Recipe = {
  id: number;
  name: string;
  profession_type: Profession;
  level_required: number;
  craft_time_seconds: number;
  base_experience: number;
  materials: {
    material_id: number;
    material_name: string;
    quantity: number;
  }[];
};

const PROFESSION_INFO = {
  blacksmithing: {
    name: "Blacksmithing",
    description: "Forge weapons, plate armor, and chain mail",
    icon: "⚒️"
  },
  leatherworking: {
    name: "Leatherworking",
    description: "Craft leather armor and accessories",
    icon: "🦌"
  },
  tailoring: {
    name: "Tailoring",
    description: "Weave cloth armor and robes",
    icon: "🧵"
  },
  fletching: {
    name: "Fletching",
    description: "Create bows and ranged weapons",
    icon: "🏹"
  },
  alchemy: {
    name: "Alchemy",
    description: "Brew potions and elixirs",
    icon: "⚗️"
  }
};

export default function CraftingPage() {
  const basicData = useBasicCharacterData();
  const [store, actions] = useCharacter();
  
  // Initialize context with basic data
  createEffect(() => {
    const data = basicData();
    if (data) {
      if (!store.character) {
        actions.setCharacter(data.character);
      }
      actions.setInventory(data.inventory as any);
      actions.setAbilities(data.abilities);
      actions.setHotbar(data.hotbar);
    }
  });

  const [selectedProfession, setSelectedProfession] = createSignal<Profession | null>(null);
  const [professions, setProfessions] = createSignal<ProfessionData[]>([]);
  const [materials, setMaterials] = createSignal<Material[]>([]);
  const [recipes, setRecipes] = createSignal<Recipe[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [showMinigame, setShowMinigame] = createSignal(false);
  const [minigameData, setMinigameData] = createSignal<any>(null);
  const [crafting, setCrafting] = createSignal(false);

  // Fetch crafting data
  createEffect(async () => {
    const character = store.character;
    if (!character) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/game/crafting/data?characterId=${character.id}`);
      const data = await response.json();
      
      setProfessions(data.professions || []);
      setMaterials(data.materials || []);
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("[Crafting] Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  });

  const currentCharacter = () => store.character;
  const maxCraftingLevel = () => Math.floor((currentCharacter()?.level || 1) / 2);

  // Refetch crafting data
  const refetchCraftingData = async () => {
    const character = currentCharacter();
    if (!character) return;

    try {
      const response = await fetch(`/api/game/crafting/data?characterId=${character.id}`);
      const data = await response.json();
      
      setProfessions(data.professions || []);
      setMaterials(data.materials || []);
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("[Crafting] Failed to refetch data:", error);
    }
  };

  // Get profession data
  const getProfession = (type: Profession) => {
    return professions().find(p => p.type === type) || { type, level: 1, experience: 0 };
  };

  // Filter recipes by selected profession
  const availableRecipes = () => {
    const profession = selectedProfession();
    if (!profession) return [];
    
    const profData = getProfession(profession);
    return recipes().filter(r => 
      r.profession_type === profession && 
      r.level_required <= profData.level
    );
  };

  // Check if player has enough materials for a recipe
  const canCraft = (recipe: Recipe) => {
    return recipe.materials.every(rm => {
      const material = materials().find(m => m.id === rm.material_id);
      return material && material.quantity >= rm.quantity;
    });
  };

  // Start crafting
  const startCraft = async (recipe: Recipe) => {
    if (crafting() || !currentCharacter()) return;

    setCrafting(true);
    try {
      const response = await fetch("/api/game/crafting/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: currentCharacter()!.id,
          recipeId: recipe.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setMinigameData(data.session);
        setShowMinigame(true);
        
        // Deduct materials from local state
        recipe.materials.forEach(rm => {
          setMaterials(mats => mats.map(m => 
            m.id === rm.material_id 
              ? { ...m, quantity: m.quantity - rm.quantity }
              : m
          ));
        });
      } else {
        alert(data.error || "Failed to start crafting");
      }
    } catch (error) {
      console.error("[Crafting] Failed to start:", error);
      alert("Failed to start crafting");
    } finally {
      setCrafting(false);
    }
  };

  // Complete crafting
  const completeCraft = async (success: boolean) => {
    if (!currentCharacter()) return null;

    try {
      const response = await fetch("/api/game/crafting/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: currentCharacter()!.id,
          success
        })
      });

      const data = await response.json();

      if (data.success) {
        // Return the result data to display in modal immediately
        // Refetch will happen when modal closes
        return data;
      } else {
        alert(data.error || "Failed to complete crafting");
        return null;
      }
    } catch (error) {
      console.error("[Crafting] Failed to complete:", error);
      alert("Failed to complete crafting");
      return null;
    }
  };

  return (
    <GameLayout>
      <div class="page-container">
        <h1>Crafting</h1>
        
        <Show when={!loading()} fallback={<p>Loading crafting data...</p>}>
          <Show when={currentCharacter()}>
            <div style={{ "margin-bottom": "1rem", color: "var(--text-secondary)" }}>
              <p>Character Level: {currentCharacter()?.level} | Max Crafting Level: {maxCraftingLevel()}</p>
            </div>

            {/* Profession Selection */}
            <Show when={!selectedProfession()}>
              <div style={{ 
                display: "grid", 
                "grid-template-columns": "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
                "margin-bottom": "2rem"
              }}>
                <For each={Object.entries(PROFESSION_INFO)}>
                  {([key, info]) => {
                    const profession = key as Profession;
                    const profData = getProfession(profession);
                    
                    return (
                      <div 
                        class="card clickable"
                        onClick={() => setSelectedProfession(profession)}
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ "font-size": "2rem", "margin-bottom": "0.5rem" }}>
                          {info.icon}
                        </div>
                        <h3>{info.name}</h3>
                        <p style={{ color: "var(--text-secondary)", "font-size": "0.9rem", "margin": "0.5rem 0" }}>
                          {info.description}
                        </p>
                        <div style={{ 
                          display: "flex", 
                          "justify-content": "space-between", 
                          "margin-top": "1rem",
                          "padding-top": "1rem",
                          "border-top": "1px solid var(--border)"
                        }}>
                          <span>Level {profData.level}</span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {profData.experience} XP
                          </span>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>

            {/* Selected Profession View */}
            <Show when={selectedProfession()}>
              {(profession) => {
                const info = PROFESSION_INFO[profession()];
                const profData = getProfession(profession());
                
                return (
                  <div>
                    {/* Back Button */}
                    <button 
                      class="button secondary"
                      onClick={() => setSelectedProfession(null)}
                      style={{ "margin-bottom": "1rem" }}
                    >
                      ← Back to Professions
                    </button>

                    {/* Profession Header */}
                    <div class="card" style={{ "margin-bottom": "1rem" }}>
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
                        <div style={{ "font-size": "3rem" }}>{info.icon}</div>
                        <div style={{ flex: 1 }}>
                          <h2 style={{ margin: 0 }}>{info.name}</h2>
                          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0" }}>
                            {info.description}
                          </p>
                          <div style={{ display: "flex", gap: "2rem", "margin-top": "0.5rem" }}>
                            <span>Level: {profData.level} / {maxCraftingLevel()}</span>
                            <span>Experience: {profData.experience}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Materials Inventory */}
                    <div class="card" style={{ "margin-bottom": "1rem" }}>
                      <h3>Materials</h3>
                      <div style={{ 
                        display: "grid", 
                        "grid-template-columns": "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "0.5rem",
                        "margin-top": "1rem"
                      }}>
                        <For each={materials().filter(m => m.quantity > 0)}>
                          {(material) => (
                            <div style={{ 
                              padding: "0.5rem",
                              background: "var(--bg-light)",
                              "border-radius": "4px",
                              display: "flex",
                              "justify-content": "space-between",
                              "align-items": "center"
                            }}>
                              <span>{material.name}</span>
                              <span style={{ 
                                "font-weight": "bold",
                                color: material.rarity === "rare" ? "var(--accent)" : 
                                       material.rarity === "uncommon" ? "#4ade80" : "inherit"
                              }}>
                                {material.quantity}
                              </span>
                            </div>
                          )}
                        </For>
                      </div>
                      <Show when={materials().filter(m => m.quantity > 0).length === 0}>
                        <p style={{ color: "var(--text-secondary)", "text-align": "center", "margin-top": "1rem" }}>
                          No materials yet. Defeat monsters to gather crafting supplies!
                        </p>
                      </Show>
                    </div>

                    {/* Recipes */}
                    <div class="card">
                      <h3>Available Recipes</h3>
                      <div style={{ 
                        display: "grid", 
                        "grid-template-columns": "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                        "margin-top": "1rem"
                      }}>
                        <For each={availableRecipes()}>
                          {(recipe) => {
                            const hasMateriels = canCraft(recipe);
                            
                            return (
                              <div 
                                class="card"
                                style={{ 
                                  background: "var(--bg-medium)",
                                  opacity: hasMateriels ? 1 : 0.6
                                }}
                              >
                                <h4 style={{ margin: "0 0 0.5rem 0" }}>{recipe.name}</h4>
                                <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)" }}>
                                  <p>Level Required: {recipe.level_required}</p>
                                  <p>Craft Time: {recipe.craft_time_seconds}s</p>
                                  <p>Experience: {recipe.base_experience} XP</p>
                                </div>
                                <div style={{ "margin-top": "0.5rem" }}>
                                  <strong>Materials:</strong>
                                  <For each={recipe.materials}>
                                    {(rm) => {
                                      const material = materials().find(m => m.id === rm.material_id);
                                      const hasEnough = material && material.quantity >= rm.quantity;
                                      
                                      return (
                                        <div style={{ 
                                          display: "flex",
                                          "justify-content": "space-between",
                                          "margin-top": "0.25rem",
                                          color: hasEnough ? "inherit" : "var(--error)"
                                        }}>
                                          <span>{rm.material_name}</span>
                                          <span>{material?.quantity || 0} / {rm.quantity}</span>
                                        </div>
                                      );
                                    }}
                                  </For>
                                </div>
                                <button 
                                  class="button primary"
                                  style={{ "margin-top": "1rem", width: "100%" }}
                                  disabled={!hasMateriels || crafting()}
                                  onClick={() => startCraft(recipe)}
                                >
                                  {crafting() ? "Starting..." : "Craft"}
                                </button>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                      <Show when={availableRecipes().length === 0}>
                        <p style={{ color: "var(--text-secondary)", "text-align": "center", "margin-top": "1rem" }}>
                          No recipes available. Level up your {info.name} skill to unlock more recipes!
                        </p>
                      </Show>
                    </div>
                  </div>
                );
              }}
            </Show>
          </Show>
        </Show>
        
        {/* Crafting Minigame Modal */}
        <Show when={showMinigame() && minigameData() && currentCharacter()}>
          <CraftingMinigame
            characterId={currentCharacter()!.id}
            profession={minigameData()!.profession}
            recipeName={minigameData()!.recipeName}
            craftTimeSeconds={minigameData()!.craftTimeSeconds}
            targetX={minigameData()!.targetX}
            targetY={minigameData()!.targetY}
            targetRadius={minigameData()!.targetRadius}
            onComplete={completeCraft}
            onCancel={async () => {
              setShowMinigame(false);
              setMinigameData(null);
              // Refetch data after closing modal
              await refetchCraftingData();
            }}
          />
        </Show>
      </div>
    </GameLayout>
  );
}
