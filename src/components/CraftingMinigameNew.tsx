import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";

type CraftingMinigameProps = {
  characterId: number;
  profession: "blacksmithing" | "leatherworking" | "tailoring" | "fletching" | "alchemy";
  recipeName: string;
  recipeId: number;
  professionLevel: number;
  recipeLevel: number;
  onComplete: (success: boolean, quality?: string) => Promise<any>;
  onCancel: () => void;
};

type Stage = {
  name: string;
  description: string;
};

const PROFESSION_STAGES: Record<string, Stage[]> = {
  blacksmithing: [
    { name: "Heat", description: "Bring metal to temperature" },
    { name: "Shape", description: "Hammer into form" },
    { name: "Temper", description: "Cool and harden" }
  ],
  leatherworking: [
    { name: "Cut", description: "Slice the leather" },
    { name: "Soften", description: "Work the material" },
    { name: "Stitch", description: "Bind it together" }
  ],
  tailoring: [
    { name: "Measure", description: "Size the pattern" },
    { name: "Weave", description: "Work the fabric" },
    { name: "Sew", description: "Stitch the seams" }
  ],
  fletching: [
    { name: "Carve", description: "Shape the shaft" },
    { name: "Align", description: "Balance the pieces" },
    { name: "Fletch", description: "Attach the feathers" }
  ],
  alchemy: [
    { name: "Measure", description: "Portion ingredients" },
    { name: "Mix", description: "Combine reagents" },
    { name: "Infuse", description: "Add essence" }
  ]
};

const PROFESSION_COLORS = {
  blacksmithing: { primary: "#ef4444", secondary: "#fca5a5", accent: "#dc2626" },
  leatherworking: { primary: "#92400e", secondary: "#d97706", accent: "#b45309" },
  tailoring: { primary: "#7c3aed", secondary: "#a78bfa", accent: "#6d28d9" },
  fletching: { primary: "#059669", secondary: "#34d399", accent: "#047857" },
  alchemy: { primary: "#8b5cf6", secondary: "#c4b5fd", accent: "#7c3aed" }
};

export function CraftingMinigameNew(props: CraftingMinigameProps) {
  const [currentStage, setCurrentStage] = createSignal(0);
  const [barPosition, setBarPosition] = createSignal(0);
  const [barDirection, setBarDirection] = createSignal(1); // 1 = right, -1 = left
  const [isActive, setIsActive] = createSignal(true);
  const [stageResults, setStageResults] = createSignal<("perfect" | "good" | "miss")[]>([]);
  const [showResult, setShowResult] = createSignal(false);
  const [craftResult, setCraftResult] = createSignal<any>(null);
  const [animatingHit, setAnimatingHit] = createSignal(false);
  const [lastHitQuality, setLastHitQuality] = createSignal<"perfect" | "good" | "miss" | null>(null);

  let animationFrame: number | undefined;
  const BAR_SPEED = 1.2; // pixels per frame (slightly slower)
  // Perfect zone is at the peak of the sine wave (center at 50%)
  // Wave starts at bottom (0%), peaks at center (50%), ends at bottom (100%)
  const PERFECT_ZONE_START = 45;
  const PERFECT_ZONE_END = 55;
  const GOOD_ZONE_START = 35;
  const GOOD_ZONE_END = 65;

  // Sine wave calculation helper - shifted so peak is at center
  const getSineY = (x: number) => {
    // Shift the wave by -π/2 so it starts at bottom, peaks at center, ends at bottom
    // x=0 -> bottom, x=50 -> peak (top), x=100 -> bottom
    const radians = ((x / 100) * Math.PI * 2) - (Math.PI / 2);
    // Sin returns -1 to 1, we want 0-100 inverted (peak at top)
    // At x=0: sin(-π/2) = -1 -> y = 50-(-35) = 85 (bottom)
    // At x=50: sin(π/2) = 1 -> y = 50-(35) = 15 (top)
    // At x=100: sin(3π/2) = -1 -> y = 50-(-35) = 85 (bottom)
    return 50 - (Math.sin(radians) * 35); // 35 = amplitude (keeps dot within bounds)
  };

  const stages = () => PROFESSION_STAGES[props.profession];
  const colors = () => PROFESSION_COLORS[props.profession];

  // Animate the bar back and forth
  createEffect(() => {
    if (!isActive()) return;

    const animate = () => {
      setBarPosition(pos => {
        const newPos = pos + (barDirection() * BAR_SPEED);
        
        // Bounce at edges
        if (newPos >= 100) {
          setBarDirection(-1);
          return 100;
        }
        if (newPos <= 0) {
          setBarDirection(1);
          return 0;
        }
        
        return newPos;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
  });

  // Keyboard support (spacebar)
  createEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    onCleanup(() => window.removeEventListener("keydown", handleKeyPress));
  });

  onCleanup(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });

  const handleClick = async () => {
    if (!isActive() || animatingHit()) return;

    const pos = barPosition();
    let quality: "perfect" | "good" | "miss";

    // Determine hit quality
    if (pos >= PERFECT_ZONE_START && pos <= PERFECT_ZONE_END) {
      quality = "perfect";
    } else if (pos >= GOOD_ZONE_START && pos <= GOOD_ZONE_END) {
      quality = "good";
    } else {
      quality = "miss";
    }

    // Show hit animation
    setLastHitQuality(quality);
    setAnimatingHit(true);
    
    // Add result to array
    setStageResults([...stageResults(), quality]);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 400));
    setAnimatingHit(false);
    setLastHitQuality(null);

    // Move to next stage or finish
    const nextStage = currentStage() + 1;
    if (nextStage >= stages().length) {
      await finishCraft();
    } else {
      setCurrentStage(nextStage);
      setBarPosition(0);
      setBarDirection(1);
    }
  };

  const finishCraft = async () => {
    setIsActive(false);
    if (animationFrame) cancelAnimationFrame(animationFrame);

    // Calculate level difference bonus
    // Higher level crafter = better base success rate
    const levelDiff = props.professionLevel - props.recipeLevel;
    const levelBonus = Math.max(0, Math.min(40, levelDiff * 5)); // +5% per level over, max +40%
    
    // Calculate success based on hits
    const results = stageResults();
    let totalScore = 30 + levelBonus; // Base chance increases with skill
    
    results.forEach(result => {
      if (result === "perfect") totalScore += 25;
      else if (result === "good") totalScore += 15;
      // miss adds nothing
    });

    const success = totalScore >= 60; // Need at least 60% to succeed
    
    // Determine quality tier
    const quality = totalScore >= 100 ? "masterwork" :
                    totalScore >= 86 ? "superior" :
                    totalScore >= 61 ? "fine" : "common";

    // Call completion handler with success AND quality
    const result = await props.onComplete(success, quality);
    
    if (result) {
      setCraftResult({
        ...result,
        totalScore,
        quality,
        levelBonus // For display if needed
      });
    }
    
    setShowResult(true);
  };

  const getQualityColor = (quality: "perfect" | "good" | "miss") => {
    switch (quality) {
      case "perfect": return "#22c55e";
      case "good": return "#3b82f6";
      case "miss": return "#ef4444";
    }
  };

  const getQualityText = (quality: "perfect" | "good" | "miss") => {
    switch (quality) {
      case "perfect": return "Perfect";
      case "good": return "Good";
      case "miss": return "Miss";
    }
  };

  return (
    <div class="modal-overlay" onClick={showResult() ? undefined : props.onCancel}>
      <div 
        class="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          "max-width": "500px",
          "min-width": "min(90vw, 400px)"
        }}
      >
        <Show when={!showResult()} fallback={
          <div style={{ padding: "1.5rem" }}>
            <div style={{ 
              "text-align": "center",
              "margin-bottom": "1.5rem"
            }}>
              <div style={{ 
                "font-size": "3rem", 
                "margin-bottom": "0.5rem",
                color: craftResult()?.craftSuccess ? "var(--success)" : "var(--danger)"
              }}>
                {craftResult()?.craftSuccess ? "Success" : "Failed"}
              </div>
              <h2 style={{ "margin-bottom": "0.25rem" }}>
                {craftResult()?.craftSuccess ? "Crafting Success!" : "Crafting Failed"}
              </h2>
              
              {craftResult()?.quality && craftResult()?.quality !== "common" && (
                <div style={{
                  "font-size": "1.1rem",
                  "font-weight": "600",
                  color: craftResult()?.quality === "masterwork" ? "var(--legendary)" :
                         craftResult()?.quality === "superior" ? "var(--epic)" :
                         "var(--rare)"
                }}>
                  {craftResult()?.quality === "masterwork" && "⭐ Masterwork Quality ⭐"}
                  {craftResult()?.quality === "superior" && "Superior Quality"}
                  {craftResult()?.quality === "fine" && "Fine Quality"}
                </div>
              )}
            </div>

            {/* Show crafted item card */}
            <Show when={craftResult()?.craftSuccess && craftResult()?.fullItem}>
              <div style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border)",
                "border-radius": "6px",
                padding: "1rem",
                "margin-bottom": "1rem"
              }}>
                <h3 style={{ "margin-bottom": "0.75rem" }}>
                  <Show when={craftResult()?.quality && craftResult()?.quality !== "common"}>
                    <span style={{
                      color: craftResult()?.quality === "masterwork" ? "var(--legendary)" :
                             craftResult()?.quality === "superior" ? "var(--epic)" :
                             "var(--rare)",
                      "margin-right": "0.5rem"
                    }}>
                      {craftResult()?.quality.charAt(0).toUpperCase() + craftResult()?.quality.slice(1)}
                    </span>
                  </Show>
                  {craftResult()?.fullItem?.name}
                </h3>
                
                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.75rem" }}>
                  {craftResult()?.fullItem?.type}
                  <Show when={craftResult()?.fullItem?.slot}>
                    {" • "}{craftResult()?.fullItem?.slot}
                  </Show>
                </div>

                {/* Stats */}
                <div style={{ 
                  display: "flex", 
                  "flex-direction": "column", 
                  gap: "0.25rem",
                  "font-size": "0.9rem"
                }}>
                  <Show when={craftResult()?.fullItem?.damage_min && craftResult()?.fullItem?.damage_max}>
                    <div>Damage: {craftResult()?.fullItem?.damage_min}-{craftResult()?.fullItem?.damage_max}</div>
                  </Show>
                  <Show when={craftResult()?.fullItem?.armor}>
                    <div>Armor: {craftResult()?.fullItem?.armor}</div>
                  </Show>
                  <Show when={craftResult()?.fullItem?.strength_bonus}>
                    <div>Strength: +{craftResult()?.fullItem?.strength_bonus}</div>
                  </Show>
                  <Show when={craftResult()?.fullItem?.dexterity_bonus}>
                    <div>Dexterity: +{craftResult()?.fullItem?.dexterity_bonus}</div>
                  </Show>
                  <Show when={craftResult()?.fullItem?.constitution_bonus}>
                    <div>Constitution: +{craftResult()?.fullItem?.constitution_bonus}</div>
                  </Show>
                  <Show when={craftResult()?.fullItem?.intelligence_bonus}>
                    <div>Intelligence: +{craftResult()?.fullItem?.intelligence_bonus}</div>
                  </Show>
                  <Show when={craftResult()?.fullItem?.wisdom_bonus}>
                    <div>Wisdom: +{craftResult()?.fullItem?.wisdom_bonus}</div>
                  </Show>
                  <Show when={craftResult()?.fullItem?.charisma_bonus}>
                    <div>Charisma: +{craftResult()?.fullItem?.charisma_bonus}</div>
                  </Show>
                </div>
              </div>
            </Show>

            {/* XP and Level */}
            <div class="stat-grid" style={{ "margin-bottom": "1.5rem" }}>
              <div class="stat-item">
                <div class="stat-label">Experience</div>
                <div class="stat-value">+{craftResult()?.xpGained}</div>
              </div>
              {craftResult()?.levelUp && (
                <div class="stat-item">
                  <div class="stat-label">Level Up!</div>
                  <div class="stat-value" style={{ color: "var(--accent)" }}>
                    {craftResult()?.newLevel}
                  </div>
                </div>
              )}
            </div>

            <button 
              class="button primary" 
              onClick={props.onCancel}
              style={{ width: "100%" }}
            >
              Continue
            </button>
          </div>
        }>
          <div>
            <h2 style={{ "margin-bottom": "0.25rem" }}>{props.recipeName}</h2>
            <p style={{ color: "var(--text-secondary)", "font-size": "0.875rem", "margin-bottom": "1.5rem" }}>
              Hit the zones to craft successfully
            </p>

            {/* Progress Dots - Minimal */}
            <div style={{
              display: "flex",
              gap: "0.5rem",
              "justify-content": "center",
              "margin-bottom": "1.5rem"
            }}>
              <For each={stages()}>
                {(stage, index) => (
                  <div style={{
                    width: "12px",
                    height: "12px",
                    "border-radius": "50%",
                    background: index() < currentStage() 
                      ? stageResults()[index()] === "perfect" ? "var(--success)" :
                        stageResults()[index()] === "good" ? "var(--text-secondary)" : "var(--danger)"
                      : index() === currentStage() 
                      ? "var(--accent)"
                      : "var(--bg-light)",
                    border: "2px solid var(--border)",
                    transition: "all 0.3s ease"
                  }} />
                )}
              </For>
            </div>

            {/* Stage Name */}
            <div style={{
              "text-align": "center",
              "margin-bottom": "1rem"
            }}>
              <div style={{ 
                "font-size": "0.75rem",
                color: "var(--text-secondary)",
                "text-transform": "uppercase",
                "letter-spacing": "0.05em",
                "margin-bottom": "0.25rem"
              }}>
                Stage {currentStage() + 1} of {stages().length}
              </div>
              <div style={{ 
                "font-weight": "600", 
                "font-size": "1.25rem",
                color: "var(--text-primary)"
              }}>
                {stages()[currentStage()].name}
              </div>
            </div>

            {/* The Bar - Sine Wave */}
            <div style={{
              position: "relative",
              height: "120px",
              background: "var(--bg-light)",
              "border-radius": "6px",
              "margin-bottom": "1rem",
              overflow: "hidden",
              border: "1px solid var(--border)"
            }}>
              {/* Draw the sine wave path using SVG */}
              <svg 
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  "pointer-events": "none"
                }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Sine wave path */}
                <path
                  d={(() => {
                    let path = "M 0," + getSineY(0);
                    for (let x = 1; x <= 100; x++) {
                      path += ` L ${x},${getSineY(x)}`;
                    }
                    return path;
                  })()}
                  stroke="var(--border)"
                  stroke-width="0.5"
                  fill="none"
                  opacity="0.5"
                />
                
                {/* Perfect zone highlight (around the peak) */}
                <rect
                  x={PERFECT_ZONE_START}
                  y="0"
                  width={PERFECT_ZONE_END - PERFECT_ZONE_START}
                  height="100"
                  fill="var(--success)"
                  opacity="0.1"
                />
              </svg>

              {/* Moving Dot */}
              <div style={{
                position: "absolute",
                left: `${barPosition()}%`,
                top: `${getSineY(barPosition())}%`,
                width: "16px",
                height: "16px",
                background: "var(--accent)",
                "border-radius": "50%",
                transform: "translate(-50%, -50%)",
                "z-index": "10",
                "box-shadow": "0 2px 8px rgba(0,0,0,0.3)"
              }} />

              {/* Hit Feedback */}
              <Show when={animatingHit() && lastHitQuality()}>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  "font-size": "1rem",
                  "font-weight": "600",
                  color: lastHitQuality() === "perfect" ? "var(--success)" : 
                         lastHitQuality() === "good" ? "var(--text-primary)" : 
                         "var(--danger)",
                  animation: "fadeInOut 0.4s ease",
                  "z-index": "20"
                }}>
                  {getQualityText(lastHitQuality()!)}
                </div>
              </Show>
            </div>

            {/* Strike Button */}
            <button
              class="button primary"
              onMouseDown={(e) => {
                e.preventDefault();
                handleClick();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleClick();
              }}
              disabled={animatingHit()}
              style={{
                width: "100%",
                "font-size": "1rem",
                padding: "1rem",
                "margin-bottom": "1rem"
              }}
            >
              Strike
            </button>

            {/* Hint */}
            <div style={{
              "text-align": "center",
              "font-size": "0.75rem",
              color: "var(--text-secondary)",
              "margin-bottom": "1rem"
            }}>
              or press SPACE
            </div>

            {/* Cancel Button */}
            <button 
              class="button secondary" 
              onClick={props.onCancel} 
              style={{ width: "100%" }}
            >
              Cancel Crafting
            </button>
          </div>
        </Show>
      </div>

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }

        kbd {
          font-family: monospace;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
}
