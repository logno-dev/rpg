import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useActiveEffects } from "~/lib/ActiveEffectsContext";

export function ActiveEffectsDisplay() {
  const [effectsStore] = useActiveEffects();
  const [currentTime, setCurrentTime] = createSignal(Date.now());

  // Update current time every 100ms for smooth countdown
  let intervalId: number;
  onMount(() => {
    intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return (
    <div class="card" style={{ "margin-bottom": "1rem" }}>
      <h4 style={{ "margin-bottom": "0.75rem", "font-size": "0.875rem", color: "var(--text-secondary)" }}>
        🛡️ Active Effects
      </h4>
      <div style={{ 
        display: "flex", 
        gap: "0.5rem", 
        "flex-wrap": "wrap",
        "min-height": "60px", // Fixed height to prevent layout shift
        "align-items": "flex-start"
      }}>
        <Show 
          when={effectsStore.effects.length > 0}
          fallback={
            <div style={{ 
              color: "var(--text-secondary)", 
              "font-style": "italic",
              "font-size": "0.875rem",
              padding: "0.5rem",
              "align-self": "center"
            }}>
              No active effects
            </div>
          }
        >
          <For each={effectsStore.effects}>
            {(effect) => {
              const timeRemaining = () => Math.max(0, Math.ceil((effect.expiresAt - currentTime()) / 1000));
              const progressPercent = () => ((effect.expiresAt - currentTime()) / (effect.duration * 1000)) * 100;
              
              return (
                <div
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "var(--accent)",
                    color: "var(--bg-dark)",
                    "border-radius": "6px",
                    "font-size": "0.875rem",
                    "font-weight": "bold",
                    position: "relative",
                    overflow: "hidden",
                    "min-width": "120px",
                  }}
                >
                  {/* Background progress bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${progressPercent()}%`,
                      background: "rgba(255, 255, 255, 0.2)",
                      transition: "width 0.1s linear",
                    }}
                  />
                  
                  {/* Content */}
                  <div style={{ position: "relative", "z-index": 1 }}>
                    <div>{effect.name}</div>
                    <div style={{ "font-size": "0.75rem", opacity: 0.9 }}>
                      +{effect.amount} {effect.stat} · {timeRemaining()}s
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
}
