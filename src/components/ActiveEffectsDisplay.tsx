import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useActiveEffects } from "~/lib/ActiveEffectsContext";
import type { ActiveEffect } from "~/lib/db";

type ActiveEffectsDisplayProps = {
  combatHots?: ActiveEffect[];
  combatThorns?: { name: string; reflectPercent: number; duration: number; expiresAt: number } | null;
};

export function ActiveEffectsDisplay(props: ActiveEffectsDisplayProps = {}) {
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
      <h4 style={{ "margin-bottom": "0.5rem", "font-size": "0.8rem", color: "var(--text-secondary)" }}>
        Active Effects
      </h4>
      <div style={{ 
        display: "flex", 
        gap: "0.35rem", 
        "flex-wrap": "wrap",
        "min-height": "52px", // Match hotbar fixed height
        "align-items": "flex-start"
      }}>
        <Show 
          when={effectsStore.effects.length > 0 || (props.combatHots && props.combatHots.length > 0) || (props.combatThorns && Date.now() < props.combatThorns.expiresAt)}
          fallback={
            <div style={{ 
              color: "var(--text-secondary)", 
              "font-style": "italic",
              "font-size": "0.75rem",
              padding: "0.35rem",
              "align-self": "center"
            }}>
              No active effects
            </div>
          }
        >
          {/* Stat Buffs */}
          <For each={effectsStore.effects}>
            {(effect) => {
              const timeRemaining = () => Math.max(0, Math.ceil((effect.expiresAt - currentTime()) / 1000));
              const progressPercent = () => ((effect.expiresAt - currentTime()) / (effect.duration * 1000)) * 100;
              
              return (
                <div
                  style={{
                    padding: "0.35rem 0.5rem",
                    background: "var(--accent)",
                    color: "var(--bg-dark)",
                    "border-radius": "4px",
                    "font-size": "0.75rem",
                    "font-weight": "600",
                    position: "relative",
                    overflow: "hidden",
                    "min-width": "100px",
                    height: "52px", // Match hotbar height
                    display: "flex",
                    "flex-direction": "column",
                    "justify-content": "center"
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
                  <div style={{ position: "relative", "z-index": 1, "line-height": "1.2" }}>
                    <div style={{ "white-space": "nowrap", overflow: "hidden", "text-overflow": "ellipsis" }}>
                      {effect.name}
                    </div>
                    <div style={{ "font-size": "0.65rem", opacity: 0.9, "margin-top": "0.1rem" }}>
                      <Show when={effect.stat && effect.amount} fallback={
                        <span>{timeRemaining()}s</span>
                      }>
                        +{effect.amount} {effect.stat} · {timeRemaining()}s
                      </Show>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
          
          {/* HOTs from Combat */}
          <For each={props.combatHots || []}>
            {(hot) => {
              const timeRemaining = () => Math.max(0, Math.ceil((hot.expires_at - currentTime()) / 1000));
              const progressPercent = () => ((hot.expires_at - currentTime()) / (hot.duration * 1000)) * 100;
              
              return (
                <div
                  style={{
                    padding: "0.35rem 0.5rem",
                    background: "var(--success)",
                    color: "white",
                    "border-radius": "4px",
                    "font-size": "0.75rem",
                    "font-weight": "600",
                    position: "relative",
                    overflow: "hidden",
                    "min-width": "100px",
                    height: "52px", // Match hotbar height
                    display: "flex",
                    "flex-direction": "column",
                    "justify-content": "center"
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
                  <div style={{ position: "relative", "z-index": 1, "line-height": "1.2" }}>
                    <div style={{ "white-space": "nowrap", overflow: "hidden", "text-overflow": "ellipsis" }}>
                      {hot.name}
                    </div>
                    <div style={{ "font-size": "0.65rem", opacity: 0.9, "margin-top": "0.1rem" }}>
                      {hot.ticks_remaining} tick{hot.ticks_remaining !== 1 ? 's' : ''} · {timeRemaining()}s
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
          
          {/* Thorns from Combat */}
          <Show when={props.combatThorns && Date.now() < props.combatThorns.expiresAt}>
            <div
              style={{
                padding: "0.35rem 0.5rem",
                background: "var(--accent)",
                color: "white",
                "border-radius": "4px",
                "font-size": "0.75rem",
                "font-weight": "600",
                position: "relative",
                overflow: "hidden",
                "min-width": "100px",
                height: "52px", // Match hotbar height
                display: "flex",
                "flex-direction": "column",
                "justify-content": "center"
              }}
            >
              {/* Background progress bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${props.combatThorns ? ((props.combatThorns.expiresAt - currentTime()) / (props.combatThorns.duration * 1000)) * 100 : 0}%`,
                  background: "rgba(255, 255, 255, 0.2)",
                  transition: "width 0.1s linear",
                }}
              />
              
              {/* Content */}
              <div style={{ position: "relative", "z-index": 1, "line-height": "1.2" }}>
                <div style={{ "white-space": "nowrap", overflow: "hidden", "text-overflow": "ellipsis" }}>
                  {props.combatThorns!.name}
                </div>
                <div style={{ "font-size": "0.65rem", opacity: 0.9, "margin-top": "0.1rem" }}>
                  {props.combatThorns!.reflectPercent}% · {Math.max(0, Math.ceil((props.combatThorns!.expiresAt - currentTime()) / 1000))}s
                </div>
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}
