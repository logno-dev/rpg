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
  const [cooldownRemaining, setCooldownRemaining] = createSignal(0);
  const [actionsPerformed, setActionsPerformed] = createSignal(0);
  const [lastActionButton, setLastActionButton] = createSignal<string | null>(null);
  const [lastActionResult, setLastActionResult] = createSignal<"success" | "fail" | null>(null);
  const [craftComplete, setCraftComplete] = createSignal(false);
  const [craftResult, setCraftResult] = createSignal<any>(null);

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
  let cooldownInterval: number | undefined;

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

    // Draw grid
    ctx.strokeStyle = "#2a2a3e";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // Draw center lines (axes)
    const centerX = size / 2;
    const centerY = size / 2;
    ctx.strokeStyle = "#4a4a5e";
    ctx.lineWidth = 2;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(size, centerY);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, size);
    ctx.stroke();

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

    // Draw pin (current position)
    const pinCanvasX = centerX + (pinX() * cellSize);
    const pinCanvasY = centerY - (pinY() * cellSize); // Invert Y for canvas
    
    ctx.fillStyle = "#8b5cf6";
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pinCanvasX, pinCanvasY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw coordinate labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`(${pinX()}, ${pinY()})`, pinCanvasX, pinCanvasY - 15);
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
    if (cooldownInterval) {
      clearInterval(cooldownInterval);
      cooldownInterval = undefined;
    }
    
    if (cooldownRemaining() > 0) {
      cooldownInterval = window.setInterval(() => {
        setCooldownRemaining(cd => {
          const newCd = cd - 0.1;
          if (newCd <= 0) {
            if (cooldownInterval) {
              clearInterval(cooldownInterval);
              cooldownInterval = undefined;
            }
            return 0;
          }
          return newCd;
        });
      }, 100);
    }
  });

  onCleanup(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (cooldownInterval) clearInterval(cooldownInterval);
  });

  const performAction = async (direction: "east" | "west" | "north" | "south") => {
    if (cooldownRemaining() > 0) return;

    // Start cooldown
    setCooldownRemaining(ACTION_COOLDOWN);
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
        // Action succeeded, move pin
        const newX = Math.max(GRID_MIN, Math.min(GRID_MAX, data.newX));
        const newY = Math.max(GRID_MIN, Math.min(GRID_MAX, data.newY));
        setPinX(newX);
        setPinY(newY);
        setLastActionResult("success");
        
        // Check if pin is now inside target circle
        const distance = Math.sqrt(
          Math.pow(newX - props.targetX, 2) + 
          Math.pow(newY - props.targetY, 2)
        );
        
        if (distance <= props.targetRadius) {
          // Success! Complete the craft immediately
          setTimeout(() => finishCraft(), 300); // Small delay for visual feedback
        }
      } else {
        // Action failed, pin doesn't move
        setLastActionResult("fail");
      }

      // Clear result after animation
      setTimeout(() => {
        setLastActionResult(null);
        setLastActionButton(null);
      }, 500);
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
    if (cooldownInterval) clearInterval(cooldownInterval);
    
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
              <Show when={craftResult()?.craftSuccess && craftResult()?.craftedItem}>
                <p style={{ "font-weight": "bold", color: "var(--text-primary)" }}>
                  Crafted: {craftResult()?.craftedItem?.name}
                </p>
              </Show>
              <p>+{craftResult()?.xpGained} XP</p>
              <Show when={craftResult()?.levelUp}>
                <p style={{ color: "var(--accent)", "font-weight": "bold" }}>
                  Level Up! Now level {craftResult()?.newLevel}
                </p>
              </Show>
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
          "grid-template-columns": "1fr 1fr 1fr",
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
          <div>
            <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)" }}>Cooldown</div>
            <div style={{ "font-size": "1.5rem", "font-weight": "bold" }}>
              {cooldownRemaining() > 0 ? cooldownRemaining().toFixed(1) : "Ready"}
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

        {/* Action Buttons */}
        <div style={{ 
          display: "grid", 
          "grid-template-columns": "1fr 1fr",
          "grid-template-rows": "1fr 1fr",
          gap: "0.5rem",
          "max-width": "400px",
          margin: "0 auto 1rem"
        }}>
          {/* North */}
          <button
            class="button primary"
            style={getButtonStyle("north", { "grid-column": "1 / -1" })}
            onClick={() => performAction("north")}
            disabled={cooldownRemaining() > 0}
          >
            ↑ {actions().north.name}
            <div style={{ "font-size": "0.75rem", opacity: 0.8 }}>
              {actions().north.description}
            </div>
          </button>
          
          {/* West */}
          <button
            class="button primary"
            style={getButtonStyle("west")}
            onClick={() => performAction("west")}
            disabled={cooldownRemaining() > 0}
          >
            ← {actions().west.name}
            <div style={{ "font-size": "0.75rem", opacity: 0.8 }}>
              {actions().west.description}
            </div>
          </button>
          
          {/* East */}
          <button
            class="button primary"
            style={getButtonStyle("east")}
            onClick={() => performAction("east")}
            disabled={cooldownRemaining() > 0}
          >
            {actions().east.name} →
            <div style={{ "font-size": "0.75rem", opacity: 0.8 }}>
              {actions().east.description}
            </div>
          </button>
          
          {/* South */}
          <button
            class="button primary"
            style={getButtonStyle("south", { "grid-column": "1 / -1" })}
            onClick={() => performAction("south")}
            disabled={cooldownRemaining() > 0}
          >
            ↓ {actions().south.name}
            <div style={{ "font-size": "0.75rem", opacity: 0.8 }}>
              {actions().south.description}
            </div>
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
