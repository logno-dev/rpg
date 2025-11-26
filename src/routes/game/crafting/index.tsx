import { createSignal, Show, For, createEffect, createResource, createMemo, Suspense } from "solid-js";
import { GameLayout } from "~/components/GameLayout";
import { CraftingMinigameNew } from "~/components/CraftingMinigameNew";
import { useCharacter } from "~/lib/CharacterContext";
import { useBasicCharacterData } from "~/lib/game-helpers";
import { Hammer } from "lucide-solid";

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
  const [showMinigame, setShowMinigame] = createSignal(false);
  const [minigameData, setMinigameData] = createSignal<any>(null);
  const [crafting, setCrafting] = createSignal(false);
  const [expandedBrackets, setExpandedBrackets] = createSignal<Set<string>>(new Set());

  // Fetch basic crafting data (professions and materials only)
  const fetchBasicCraftingData = async (characterId: number | undefined) => {
    if (!characterId) return null;
    
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const response = await fetch(`/api/game/crafting/basic-data?characterId=${characterId}&t=${timestamp}`);
    const data = await response.json();
    return data;
  };

  // Fetch recipes for a specific profession
  const fetchProfessionRecipes = async (params: { characterId: number; profession: Profession } | undefined) => {
    if (!params) return [];
    
    const response = await fetch(`/api/game/crafting/recipes?characterId=${params.characterId}&profession=${params.profession}`);
    const data = await response.json();
    return data.recipes || [];
  };

  const [craftingData, { refetch: refetchBasicData, mutate: mutateBasicData }] = createResource(
    () => store.character?.id,
    fetchBasicCraftingData
  );

  const [recipes, { refetch: refetchRecipes, mutate: mutateRecipes }] = createResource(
    () => {
      const charId = store.character?.id;
      const prof = selectedProfession();
      return charId && prof ? { characterId: charId, profession: prof } : undefined;
    },
    fetchProfessionRecipes
  );

  const professions = createMemo(() => {
    const data = craftingData();
    if (!data) return [];
    return data.professions || [];
  });
  const materials = createMemo(() => {
    const data = craftingData();
    if (!data) return [];
    return data.materials || [];
  });

  const currentCharacter = () => store.character;
  const maxCraftingLevel = () => {
    const charLevel = currentCharacter()?.level || 1;
    // Level 1 characters can craft at level 1, otherwise level / 2
    return charLevel === 1 ? 1 : Math.floor(charLevel / 2);
  };

  // XP per level formula (matches character XP formula: level * base XP)
  const CRAFTING_XP_BASE = 125;

  // Refetch crafting data (forces fresh fetch by clearing cache first)
  const refetchCraftingData = () => {
    // Clear cached data to force refetch
    mutateBasicData(undefined);
    mutateRecipes(undefined);
    
    // Trigger refetch
    refetchBasicData();
    refetchRecipes();
  };

  // Get profession data
  const getProfession = (type: Profession) => {
    return professions().find((p: ProfessionData) => p.type === type) || { type, level: 1, experience: 0 };
  };

  // Calculate XP needed for next level (same formula as character XP: level * 125)
  const getXpForNextLevel = (currentLevel: number) => {
    return CRAFTING_XP_BASE * currentLevel;
  };

  // Calculate XP progress percentage
  const getXpProgress = (currentXp: number, currentLevel: number) => {
    const xpNeeded = getXpForNextLevel(currentLevel);
    return Math.min((currentXp / xpNeeded) * 100, 100);
  };

  // Filter recipes by selected profession
  const availableRecipes = () => {
    const profession = selectedProfession();
    if (!profession) return [];
    
    const profData = getProfession(profession);
    return recipes()?.filter((r: Recipe) => 
      r.profession_type === profession && 
      r.level_required <= profData.level
    ) || [];
  };

  // Group recipes by category (Weapons, Armor, Offhand, Consumables)
  const groupRecipesByCategory = () => {
    const recipeList = availableRecipes();
    const categories: Record<string, Recipe[]> = {};
    
    recipeList.forEach((recipe: any) => {
      const category = recipe.category || 'other';
      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1) + 's';
      
      if (!categories[categoryLabel]) {
        categories[categoryLabel] = [];
      }
      categories[categoryLabel].push(recipe);
    });
    
    // Sort categories and recipes within each category
    return Object.entries(categories)
      .sort((a, b) => {
        // Custom sort order
        const order = ['Weapons', 'Armors', 'Offhands', 'Consumables', 'Materials'];
        const aIndex = order.indexOf(a[0]);
        const bIndex = order.indexOf(b[0]);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
      .map(([category, recipes]) => [
        category,
        recipes.sort((a: any, b: any) => (a.min_level || a.level_required) - (b.min_level || b.level_required))
      ]);
  };

  // Toggle bracket expansion
  const toggleBracket = (key: string) => {
    const current = expandedBrackets();
    const newSet = new Set(current);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedBrackets(newSet);
  };

  // Auto-expand first category on profession selection
  const [initialExpansionDone, setInitialExpansionDone] = createSignal(false);
  
  createEffect(() => {
    const profession = selectedProfession();
    if (!profession) {
      setInitialExpansionDone(false);
      return;
    }
    
    // Only auto-expand once when profession is first selected
    if (!initialExpansionDone()) {
      const groups = groupRecipesByCategory();
      if (groups.length > 0) {
        const firstCategory = groups[0][0] as string;
        setExpandedBrackets(new Set([firstCategory]));
        setInitialExpansionDone(true);
      }
    }
  });

  // Check if player has enough materials for a recipe
  const canCraft = (recipe: Recipe) => {
    return recipe.materials.every(rm => {
      const material = materials().find((m: Material) => m.id === rm.material_id);
      return material && material.quantity >= rm.quantity;
    });
  };

  // Start crafting
  const startCraft = async (recipe: Recipe) => {
    if (crafting() || !currentCharacter()) return;

    const profession = selectedProfession();
    if (!profession) return;
    
    const profData = getProfession(profession);

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
        setMinigameData({
          ...data.session,
          professionLevel: profData.level,
          recipeLevel: recipe.level_required
        });
        setShowMinigame(true);
        // Don't refetch here - materials will update when modal closes
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
  const completeCraft = async (success: boolean, quality?: string) => {
    if (!currentCharacter()) return null;

    try {
      const response = await fetch("/api/game/crafting/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: currentCharacter()!.id,
          success,
          quality
        })
      });

      const data = await response.json();

      if (data.success) {
        // Return the result data to display in modal immediately
        // Materials will be refetched when modal closes via onCancel
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
        
        <Suspense fallback={
          <div class="card" style={{ padding: "2rem", "text-align": "center" }}>
            <div style={{ "font-size": "2rem", "margin-bottom": "1rem" }}>⚒️</div>
            <p>Loading crafting data...</p>
          </div>
        }>
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
                    const profData = createMemo(() => getProfession(profession));
                    
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
                          "margin-top": "1rem",
                          "padding-top": "1rem",
                          "border-top": "1px solid var(--border)",
                          "text-align": "center"
                        }}>
                          <span style={{ "font-weight": "bold", "font-size": "1.1rem" }}>Level {profData().level}</span>
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
                const profData = createMemo(() => getProfession(profession()));
                
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
                          <div style={{ "margin-top": "1rem" }}>
                            <div style={{ 
                              display: "flex", 
                              "justify-content": "space-between",
                              "align-items": "center",
                              "margin-bottom": "0.5rem"
                            }}>
                              <div>
                                <span style={{ "font-weight": "bold", "font-size": "1.1rem" }}>
                                  Level {profData().level}
                                </span>
                                <span style={{ color: "var(--text-secondary)", "margin-left": "0.5rem" }}>
                                  / {maxCraftingLevel()} max
                                </span>
                              </div>
                              <span style={{ color: "var(--text-secondary)", "font-size": "0.875rem" }}>
                                {profData().experience} / {getXpForNextLevel(profData().level)} XP
                              </span>
                            </div>
                            {/* XP Progress Bar */}
                            <div style={{ 
                              width: "100%", 
                              height: "8px", 
                              background: "var(--bg-dark)", 
                              "border-radius": "4px",
                              overflow: "hidden"
                            }}>
                              <div style={{ 
                                width: `${getXpProgress(profData().experience, profData().level)}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, var(--accent), var(--success))",
                                transition: "width 0.3s ease"
                              }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recipes - Accordion by Level */}
                    <div class="card">
                      <h3>Recipes</h3>
                      <Suspense fallback={
                        <div style={{ padding: "2rem", "text-align": "center" }}>
                          <div style={{ "font-size": "1.5rem", "margin-bottom": "0.5rem" }}>📜</div>
                          <p style={{ color: "var(--text-secondary)" }}>Loading recipes...</p>
                        </div>
                      }>
                        <Show when={availableRecipes().length === 0}>
                          <p style={{ color: "var(--text-secondary)", "text-align": "center", "margin-top": "1rem" }}>
                            No recipes available. Level up your {info.name} skill to unlock more recipes!
                          </p>
                        </Show>
                        
                        <div style={{ "margin-top": "1rem" }}>
                          <For each={groupRecipesByCategory()}>
                            {(entry) => {
                              const category = entry[0] as string;
                              const categoryRecipes = entry[1] as Recipe[];
                              const isExpanded = () => expandedBrackets().has(category as string);
                              
                              return (
                                <div style={{ "margin-bottom": "0.5rem" }}>
                                  {/* Category Header */}
                                  <button
                                    class="button secondary"
                                    onClick={() => toggleBracket(category as string)}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      "justify-content": "space-between",
                                      "align-items": "center",
                                      "text-align": "left",
                                      padding: "0.75rem 1rem"
                                    }}
                                  >
                                    <div>
                                      <span style={{ "font-weight": "600" }}>{category}</span>
                                      <span style={{ 
                                        "margin-left": "0.5rem",
                                        color: "var(--text-secondary)",
                                        "font-size": "0.875rem"
                                      }}>
                                        {(categoryRecipes as any[]).length} {(categoryRecipes as any[]).length === 1 ? 'recipe' : 'recipes'}
                                      </span>
                                    </div>
                                    <span>{isExpanded() ? '▼' : '▶'}</span>
                                  </button>

                                  {/* Category Content */}
                                  <Show when={isExpanded()}>
                                    <div style={{ 
                                      "margin-top": "0.5rem"
                                    }}>
                                      <For each={categoryRecipes as any[]}>
                                        {(recipe: Recipe) => {
                                          const hasMateriels = createMemo(() => canCraft(recipe));
                                          
                                          return (
                                            <details 
                                              style={{ 
                                                background: "var(--bg-medium)",
                                                "border-radius": "4px",
                                                "margin-bottom": "0.5rem",
                                                opacity: hasMateriels() ? 1 : 0.6,
                                                border: "1px solid var(--border)"
                                              }}
                                            >
                                              <summary style={{ 
                                                padding: "0.75rem 1rem",
                                                cursor: "pointer",
                                                "font-weight": "600",
                                                display: "flex",
                                                "justify-content": "space-between",
                                                "align-items": "center",
                                                "user-select": "none"
                                              }}>
                                                <span>{recipe.name}</span>
                                                <button 
                                                  class="button primary"
                                                  style={{ 
                                                    padding: "0.5rem",
                                                    "min-width": "auto",
                                                    width: "auto",
                                                    display: "flex",
                                                    "align-items": "center",
                                                    "justify-content": "center"
                                                  }}
                                                  disabled={!hasMateriels() || crafting()}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    startCraft(recipe);
                                                  }}
                                                  title="Craft"
                                                >
                                                  <Hammer size={18} />
                                                </button>
                                              </summary>

                                              <div style={{ 
                                                padding: "0 1rem 1rem 1rem",
                                                "border-top": "1px solid var(--border)"
                                              }}>
                                                {/* Level & XP */}
                                                <div style={{ 
                                                  "margin-top": "0.75rem",
                                                  "margin-bottom": "0.75rem",
                                                  "font-size": "0.9rem",
                                                  color: "var(--text-secondary)"
                                                }}>
                                                  Level {recipe.level_required} • {recipe.base_experience} XP
                                                </div>

                                                {/* Materials */}
                                                <div>
                                                  <div style={{ 
                                                    "font-weight": "600",
                                                    "margin-bottom": "0.5rem",
                                                    "font-size": "0.9rem"
                                                  }}>
                                                    Materials:
                                                  </div>
                                                  <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
                                                    <For each={recipe.materials}>
                                                      {(rm) => {
                                                        const material = createMemo(() => 
                                                          materials().find((m: Material) => m.id === rm.material_id)
                                                        );
                                                        const hasEnough = createMemo(() => {
                                                          const mat = material();
                                                          return mat && mat.quantity >= rm.quantity;
                                                        });
                                                        
                                                        return (
                                                          <div style={{ 
                                                            display: "flex",
                                                            "align-items": "center",
                                                            gap: "0.5rem",
                                                            padding: "0.375rem 0.75rem",
                                                            background: "var(--bg-dark)",
                                                            "border-radius": "4px",
                                                            "font-size": "0.875rem",
                                                            color: hasEnough() ? "inherit" : "var(--danger)"
                                                          }}>
                                                            <span>{rm.material_name}</span>
                                                            <span style={{ "font-weight": "600" }}>
                                                              {material()?.quantity || 0}/{rm.quantity}
                                                            </span>
                                                          </div>
                                                        );
                                                      }}
                                                    </For>
                                                  </div>
                                                </div>
                                              </div>
                                            </details>
                                          );
                                        }}
                                      </For>
                                    </div>
                                  </Show>
                                </div>
                              );
                            }}
                          </For>
                        </div>
                      </Suspense>
                    </div>

                    {/* Materials Inventory */}
                    <div class="card" style={{ "margin-top": "1rem" }}>
                      <h3>Materials</h3>
                      <div style={{ 
                        display: "grid", 
                        "grid-template-columns": "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "0.5rem",
                        "margin-top": "1rem"
                      }}>
                        <For each={materials().filter((m: Material) => m.quantity > 0)}>
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
                      <Show when={materials().filter((m: Material) => m.quantity > 0).length === 0}>
                        <p style={{ color: "var(--text-secondary)", "text-align": "center", "margin-top": "1rem" }}>
                          No materials yet. Defeat monsters to gather crafting supplies!
                        </p>
                      </Show>
                    </div>
                  </div>
                );
              }}
            </Show>
          </Show>
        </Suspense>
        
        {/* Crafting Minigame Modal */}
        <Show when={showMinigame() && minigameData() && currentCharacter()}>
          <CraftingMinigameNew
            characterId={currentCharacter()!.id}
            profession={minigameData()!.profession}
            recipeName={minigameData()!.recipeName}
            recipeId={minigameData()!.recipeId}
            professionLevel={minigameData()!.professionLevel}
            recipeLevel={minigameData()!.recipeLevel}
            onComplete={completeCraft}
            onCancel={async () => {
              // Close modal first
              setShowMinigame(false);
              setMinigameData(null);
              
              // Clear cache and force refetch
              mutateBasicData(undefined);
              await refetchBasicData();
            }}
          />
        </Show>
      </div>
    </GameLayout>
  );
}
