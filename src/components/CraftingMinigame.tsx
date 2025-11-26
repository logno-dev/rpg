import { createSignal, createEffect, onCleanup, Show } from "solid-js";

type CraftingMinigameProps = {
  characterId: number;
  profession: "blacksmithing" | "leatherworking" | "tailoring" | "fletching" | "alchemy";
  recipeName: string;
  craftTimeSeconds: number;
  targetX: number;
  targetY: number;
  targetRadius: number;
  onComplete: (success: boolean) => Promise<any>;
  onCancel: () => void;
};

const PROFESSION_ACTIONS = {
  blacksmithing: {
    east: { name: "Smelt", description: "Heat the metal" },
    west: { name: "Quench", description: "Cool in water" },
    north: { name: "Hammer", description: "Shape the metal" },
    south: { name: "Sharpen", description: "Refine the edge" }
  },
  leatherworking: {
    east: { name: "Cut", description: "Cut the leather" },
    west: { name: "Soak", description: "Soften the material" },
    north: { name: "Stretch", description: "Expand and shape" },
    south: { name: "Stitch", description: "Sew pieces together" }
  },
  tailoring: {
    east: { name: "Weave", description: "Create fabric" },
    west: { name: "Dye", description: "Add color" },
    north: { name: "Measure", description: "Size the garment" },
    south: { name: "Sew", description: "Stitch together" }
  },
  fletching: {
    east: { name: "Carve", description: "Shape the wood" },
    west: { name: "String", description: "Add tension" },
    north: { name: "Align", description: "Balance the weapon" },
    south: { name: "Fletch", description: "Attach feathers" }
  },
  alchemy: {
    east: { name: "Boil", description: "Heat ingredients" },
    west: { name: "Distill", description: "Purify mixture" },
    north: { name: "Mix", description: "Combine reagents" },
    south: { name: "Infuse", description: "Add magical essence" }
  }
};

export function CraftingMinigame(props: CraftingMinigameProps) {
  const [pinX, setPinX] = createSignal(0);
  const [pinY, setPinY] = createSignal(0);
  const [timeRemaining, setTimeRemaining] = createSignal(props.craftTimeSeconds);
  const [cooldowns, setCooldowns] = createSignal({
    north: 0,
    south: 0,
    east: 0,
    west: 0
  });
  const [actionsPerformed, setActionsPerformed] = createSignal(0);
  const [lastActionButton, setLastActionButton] = createSignal<string | null>(null);
  const [lastActionResult, setLastActionResult] = createSignal<"success" | "fail" | null>(null);
  const [craftComplete, setCraftComplete] = createSignal(false);
  const [craftResult, setCraftResult] = createSignal<any>(null);
  const [craftSucceeded, setCraftSucceeded] = createSignal(false);
  const [isAnimatingMove, setIsAnimatingMove] = createSignal(false);
  const [animStartX, setAnimStartX] = createSignal(0);
  const [animStartY, setAnimStartY] = createSignal(0);
  const [animTargetX, setAnimTargetX] = createSignal(0);
  const [animTargetY, setAnimTargetY] = createSignal(0);
  const [animProgress, setAnimProgress] = createSignal(0);
  const [animatingPin, setAnimatingPin] = createSignal(false);
  const [pinAnimationProgress, setPinAnimationProgress] = createSignal(0);
  const [pinStartX, setPinStartX] = createSignal(0);
  const [pinStartY, setPinStartY] = createSignal(0);
  const [pinTargetX, setPinTargetX] = createSignal(0);
  const [pinTargetY, setPinTargetY] = createSignal(0);

  const GRID_SIZE = 21; // -10 to +10
  const GRID_MIN = -10;
  const GRID_MAX = 10;
  const ACTION_COOLDOWN = 1; // seconds
  
  // Responsive canvas size
  const getCanvasSize = () => {
    if (typeof window === 'undefined') return 400;
    return window.innerWidth < 768 ? Math.min(window.innerWidth - 60, 300) : 400;
  };
  
  const [canvasSize, setCanvasSize] = createSignal(getCanvasSize());
  const CELL_SIZE = () => canvasSize() / GRID_SIZE;
  const RIM_RADIUS = 9; // Place pin on rim (near edge of grid)

  let canvas: HTMLCanvasElement | undefined;
  let timerInterval: number | undefined;
  let cooldownIntervals: Record<string, number> = {};

  const actions = () => PROFESSION_ACTIONS[props.profession];

  // Initialize pin at random position on the rim of the circle
  createEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const x = Math.round(Math.cos(angle) * RIM_RADIUS);
    const y = Math.round(Math.sin(angle) * RIM_RADIUS);
    setPinX(x);
    setPinY(y);
  });

  // Handle window resize
  createEffect(() => {
    const handleResize = () => {
      setCanvasSize(getCanvasSize());
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      onCleanup(() => window.removeEventListener('resize', handleResize));
    }
  });

  // Draw the canvas
  createEffect(() => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvasSize();
    const cellSize = CELL_SIZE();

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;

    // Draw circular boundary
    ctx.strokeStyle = "#6a6a7e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2 - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Draw target circle (green)
    const targetCanvasX = centerX + (props.targetX * cellSize);
    const targetCanvasY = centerY - (props.targetY * cellSize); // Invert Y for canvas
    const targetCanvasRadius = props.targetRadius * cellSize;
    
    ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetCanvasX, targetCanvasY, targetCanvasRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw pin (current position with animation)
    let displayX = pinX();
    let displayY = pinY();
    
    // Apply animation interpolation if moving
    if (isAnimatingMove()) {
      const progress = animProgress();
      displayX = animStartX() + (animTargetX() - animStartX()) * progress;
      displayY = animStartY() + (animTargetY() - animStartY()) * progress;
    }
    
    const pinCanvasX = centerX + (displayX * cellSize);
    const pinCanvasY = centerY - (displayY * cellSize); // Invert Y for canvas
    
    // Color based on last action result
    let pinFillColor = "#8b5cf6";
    let pinStrokeColor = "#a78bfa";
    
    if (lastActionResult() === "success") {
      pinFillColor = "#22c55e";
      pinStrokeColor = "#4ade80";
    } else if (lastActionResult() === "fail") {
      pinFillColor = "#ef4444";
      pinStrokeColor = "#f87171";
    }
    
    ctx.fillStyle = pinFillColor;
    ctx.strokeStyle = pinStrokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pinCanvasX, pinCanvasY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Timer countdown
  createEffect(() => {
    timerInterval = window.setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 0) {
          finishCraft();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  });

  // Cooldown countdown
  createEffect(() => {
    const currentCooldowns = cooldowns();
    
    // Start/stop cooldown intervals for each action
    (['north', 'south', 'east', 'west'] as const).forEach(direction => {
      if (currentCooldowns[direction] > 0 && !cooldownIntervals[direction]) {
        cooldownIntervals[direction] = window.setInterval(() => {
          setCooldowns(cds => {
            const newCd = cds[direction] - 0.1;
            if (newCd <= 0) {
              clearInterval(cooldownIntervals[direction]);
              delete cooldownIntervals[direction];
              return { ...cds, [direction]: 0 };
            }
            return { ...cds, [direction]: newCd };
          });
        }, 100);
      }
    });
  });

  onCleanup(() => {
    if (timerInterval) clearInterval(timerInterval);
    Object.values(cooldownIntervals).forEach(interval => clearInterval(interval));
  });

  const performAction = async (direction: "east" | "west" | "north" | "south") => {
    if (cooldowns()[direction] > 0 || craftSucceeded()) return;

    // Start cooldown for this specific action
    setCooldowns(cds => ({ ...cds, [direction]: ACTION_COOLDOWN }));
    setActionsPerformed(a => a + 1);
    setLastActionButton(direction);

    // Call API to perform action (with success chance)
    try {
      const response = await fetch("/api/game/crafting/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: props.characterId,
          direction,
          currentX: pinX(),
          currentY: pinY()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Action succeeded, animate pin movement
        const newX = Math.max(GRID_MIN, Math.min(GRID_MAX, data.newX));
        const newY = Math.max(GRID_MIN, Math.min(GRID_MAX, data.newY));
        
        // Set up animation
        setAnimStartX(pinX());
        setAnimStartY(pinY());
        setAnimTargetX(newX);
        setAnimTargetY(newY);
        setIsAnimatingMove(true);
        setAnimProgress(0);
        setLastActionResult("success");
        
        // Animate the movement over 400ms
        const animationDuration = 400;
        const animationStart = Date.now();
        
        const animateMove = () => {
          const elapsed = Date.now() - animationStart;
          const progress = Math.min(elapsed / animationDuration, 1);
          
          // Easing function for smooth animation (ease-out)
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          setAnimProgress(easedProgress);
          
          if (progress < 1) {
            requestAnimationFrame(animateMove);
          } else {
            // Animation complete, set final position
            setPinX(newX);
            setPinY(newY);
            setIsAnimatingMove(false);
            
            // Check if pin is now inside target circle
            const distance = Math.sqrt(
              Math.pow(newX - props.targetX, 2) + 
              Math.pow(newY - props.targetY, 2)
            );
            
            if (distance <= props.targetRadius) {
              // Success! Mark as succeeded and complete the craft
              setCraftSucceeded(true);
              setTimeout(() => finishCraft(), 300);
            }
          }
        };
        
        requestAnimationFrame(animateMove);
      } else {
        // Action failed, pin doesn't move
        setLastActionResult("fail");
      }

      // Clear result after animation
      setTimeout(() => {
        setLastActionResult(null);
        setLastActionButton(null);
      }, 600);
    } catch (error) {
      console.error("[CraftingMinigame] Action failed:", error);
    }
  };

  const finishCraft = async () => {
    // Check if pin is within target circle
    const distance = Math.sqrt(
      Math.pow(pinX() - props.targetX, 2) + 
      Math.pow(pinY() - props.targetY, 2)
    );
    
    const success = distance <= props.targetRadius;
    
    // Stop timers
    if (timerInterval) clearInterval(timerInterval);
    Object.values(cooldownIntervals).forEach(interval => clearInterval(interval));
    
    // Call onComplete and get result data
    const result = await props.onComplete(success);
    
    // Show result screen
    setCraftResult(result);
    setCraftComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getButtonStyle = (direction: "east" | "west" | "north" | "south", baseStyle: any = {}) => {
    if (lastActionButton() === direction && lastActionResult()) {
      const color = lastActionResult() === "success" ? "#22c55e" : "#ef4444";
      return {
        ...baseStyle,
        background: color,
        "border-color": color,
        transition: "all 0.3s ease"
      };
    }
    return baseStyle;
  };

  return (
    <div class="modal-overlay" onClick={craftComplete() ? undefined : props.onCancel}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()} style={{ "max-width": "600px" }}>
        <Show when={!craftComplete()} fallback={
          <div style={{ "text-align": "center", padding: "2rem" }}>
            <div style={{ 
              "font-size": "4rem", 
              "margin-bottom": "1rem" 
            }}>
              {craftResult()?.craftSuccess ? "✓" : "✗"}
            </div>
            <h2 style={{ 
              color: craftResult()?.craftSuccess ? "#22c55e" : "#ef4444",
              "margin-bottom": "1rem"
            }}>
              {craftResult()?.craftSuccess ? "Crafting Success!" : "Crafting Failed"}
            </h2>
            <div style={{ 
              "font-size": "1.1rem", 
              "margin-bottom": "2rem",
              color: "var(--text-secondary)"
            }}>
              {craftResult()?.craftSuccess && craftResult()?.craftedItem && (
                <p style={{ "font-weight": "bold", color: "var(--text-primary)" }}>
                  Crafted: {craftResult()?.craftedItem?.name}
                </p>
              )}
              <p>+{craftResult()?.xpGained} XP</p>
              {craftResult()?.levelUp && (
                <p style={{ color: "var(--accent)", "font-weight": "bold" }}>
                  Level Up! Now level {craftResult()?.newLevel}
                </p>
              )}
            </div>
            <button 
              class="button primary" 
              onClick={props.onCancel}
              style={{ width: "100%", "font-size": "1.1rem" }}
            >
              Continue
            </button>
          </div>
        }>
          <h2>Crafting: {props.recipeName}</h2>
        
        {/* Stats Bar */}
        <div style={{ 
          display: "grid", 
          "grid-template-columns": "1fr 1fr",
          gap: "1rem",
          "margin-bottom": "1rem",
          "text-align": "center"
        }}>
          <div>
            <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)" }}>Time Remaining</div>
            <div style={{ "font-size": "1.5rem", "font-weight": "bold" }}>
              {formatTime(timeRemaining())}
            </div>
          </div>
          <div>
            <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)" }}>Actions</div>
            <div style={{ "font-size": "1.5rem", "font-weight": "bold" }}>
              {actionsPerformed()}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ 
          display: "flex", 
          "justify-content": "center", 
          "margin-bottom": "1rem",
          background: "var(--bg-dark)",
          padding: "1rem",
          "border-radius": "8px"
        }}>
          <canvas 
            ref={canvas!}
            width={canvasSize()} 
            height={canvasSize()}
            style={{ border: "2px solid var(--border)", "border-radius": "50%", "max-width": "100%" }}
          />
        </div>

        {/* Action Buttons - Circular Quadrant Layout */}
        <div style={{ 
          position: "relative",
          width: "300px",
          height: "300px",
          margin: "0 auto 1rem",
          "border-radius": "50%",
          overflow: "hidden"
        }}>
          {/* SVG borders between quadrants */}
          <svg style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            "pointer-events": "none",
            "z-index": "10"
          }} viewBox="0 0 300 300">
            {/* Diagonal line from top-left to center to bottom-right */}
            <line x1="0" y1="0" x2="150" y2="150" stroke="var(--bg-dark)" stroke-width="3" />
            <line x1="150" y1="150" x2="300" y2="300" stroke="var(--bg-dark)" stroke-width="3" />
            {/* Diagonal line from top-right to center to bottom-left */}
            <line x1="300" y1="0" x2="150" y2="150" stroke="var(--bg-dark)" stroke-width="3" />
            <line x1="150" y1="150" x2="0" y2="300" stroke="var(--bg-dark)" stroke-width="3" />
          </svg>
          {/* North Quadrant - Top pie slice */}
          <button
            class="button primary crafting-quadrant-button"
            style={{
              ...getButtonStyle("north"),
              position: "absolute",
              top: "0",
              left: "0",
              width: "300px",
              height: "300px",
              "clip-path": "polygon(50% 50%, 0% 0%, 100% 0%)",
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              "justify-content": "flex-start",
              "padding-top": "2rem",
              "border-radius": "0"
            }}
            onClick={() => performAction("north")}
            disabled={cooldowns().north > 0}
          >
            <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
              ↑ {actions().north.name}
            </div>
            <div style={{ "font-size": "0.7rem", opacity: 0.8 }}>
              {actions().north.description}
            </div>
            {cooldowns().north > 0 && (
              <div style={{ "font-size": "0.8rem", "margin-top": "0.25rem", color: "var(--accent)" }}>
                {cooldowns().north.toFixed(1)}s
              </div>
            )}
          </button>
          
          {/* East Quadrant - Right pie slice */}
          <button
            class="button primary crafting-quadrant-button"
            style={{
              ...getButtonStyle("east"),
              position: "absolute",
              top: "0",
              left: "0",
              width: "300px",
              height: "300px",
              "clip-path": "polygon(50% 50%, 100% 0%, 100% 100%)",
              display: "flex",
              "flex-direction": "column",
              "align-items": "flex-end",
              "justify-content": "center",
              "padding-right": "2rem",
              "border-radius": "0"
            }}
            onClick={() => performAction("east")}
            disabled={cooldowns().east > 0}
          >
            <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
              {actions().east.name} →
            </div>
            <div style={{ "font-size": "0.7rem", opacity: 0.8 }}>
              {actions().east.description}
            </div>
            {cooldowns().east > 0 && (
              <div style={{ "font-size": "0.8rem", "margin-top": "0.25rem", color: "var(--accent)" }}>
                {cooldowns().east.toFixed(1)}s
              </div>
            )}
          </button>
          
          {/* South Quadrant - Bottom pie slice */}
          <button
            class="button primary crafting-quadrant-button"
            style={{
              ...getButtonStyle("south"),
              position: "absolute",
              top: "0",
              left: "0",
              width: "300px",
              height: "300px",
              "clip-path": "polygon(50% 50%, 100% 100%, 0% 100%)",
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              "justify-content": "flex-end",
              "padding-bottom": "2rem",
              "border-radius": "0"
            }}
            onClick={() => performAction("south")}
            disabled={cooldowns().south > 0}
          >
            <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
              ↓ {actions().south.name}
            </div>
            <div style={{ "font-size": "0.7rem", opacity: 0.8 }}>
              {actions().south.description}
            </div>
            {cooldowns().south > 0 && (
              <div style={{ "font-size": "0.8rem", "margin-top": "0.25rem", color: "var(--accent)" }}>
                {cooldowns().south.toFixed(1)}s
              </div>
            )}
          </button>
          
          {/* West Quadrant - Left pie slice */}
          <button
            class="button primary crafting-quadrant-button"
            style={{
              ...getButtonStyle("west"),
              position: "absolute",
              top: "0",
              left: "0",
              width: "300px",
              height: "300px",
              "clip-path": "polygon(50% 50%, 0% 100%, 0% 0%)",
              display: "flex",
              "flex-direction": "column",
              "align-items": "flex-start",
              "justify-content": "center",
              "padding-left": "2rem",
              "border-radius": "0"
            }}
            onClick={() => performAction("west")}
            disabled={cooldowns().west > 0}
          >
            <div style={{ "font-weight": "bold", "margin-bottom": "0.25rem" }}>
              ← {actions().west.name}
            </div>
            <div style={{ "font-size": "0.7rem", opacity: 0.8 }}>
              {actions().west.description}
            </div>
            {cooldowns().west > 0 && (
              <div style={{ "font-size": "0.8rem", "margin-top": "0.25rem", color: "var(--accent)" }}>
                {cooldowns().west.toFixed(1)}s
              </div>
            )}
          </button>
        </div>

        {/* Cancel Button */}
        <button class="button secondary" onClick={props.onCancel} style={{ width: "100%" }}>
          Cancel Crafting
        </button>
        </Show>
      </div>
    </div>
  );
}
