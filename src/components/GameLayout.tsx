import { A } from "@solidjs/router";
import { createSignal, createMemo, onMount, Show } from "solid-js";
import { useCharacter } from "~/lib/CharacterContext";

type GameLayoutProps = {
  children: any;
};

export function GameLayout(props: GameLayoutProps) {
  const [store] = useCharacter();
  const [isScrolled, setIsScrolled] = createSignal(false);

  const currentCharacter = () => store.character;
  const currentGold = () => store.character?.gold || 0;

  // Calculate current health/mana from character or dungeon session
  const currentHealth = createMemo(() => {
    if (store.dungeonSession) {
      return store.dungeonSession.session_health;
    }
    return store.character?.current_health || 0;
  });

  const currentMana = createMemo(() => {
    if (store.dungeonSession) {
      return store.dungeonSession.session_mana;
    }
    return store.character?.current_mana || 0;
  });

  const currentMaxHealth = createMemo(() => {
    if (!currentCharacter()) return 1;
    const base = 50 + (currentCharacter()!.level - 1) * 10;
    const conBonus = currentCharacter()!.constitution * 5;
    return base + conBonus;
  });

  const currentMaxMana = createMemo(() => {
    if (!currentCharacter()) return 1;
    const base = 30 + (currentCharacter()!.level - 1) * 5;
    const intBonus = currentCharacter()!.intelligence * 3;
    return base + intBonus;
  });

  // Scroll detection for sticky header
  onMount(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <div>
      <div class="header">
        <div class="header-content">
          <h1 class="title">Fantasy RPG</h1>
          <div style={{ display: "flex", gap: "1rem", "align-items": "center" }}>
            <div class="button-group">
              <A href="/game" class="button" activeClass="active" end>
                Adventure
              </A>
              <A href="/game/inventory" class="button" activeClass="active">
                Inventory
              </A>
              <A href="/game/stats" class="button" activeClass="active">
                Stats
              </A>
              <A href="/game/hotbar" class="button" activeClass="active">
                Hotbar
              </A>
            </div>
            <A href="/character-select" class="button secondary">
              Character Select
            </A>
          </div>
        </div>
      </div>

      {/* Sticky Character Stats Header */}
      <Show when={isScrolled() && currentCharacter()}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "var(--bg-dark)",
          "border-bottom": "2px solid var(--accent)",
          "z-index": 999,
          padding: "0.75rem 1rem",
          "box-shadow": "0 2px 10px rgba(0, 0, 0, 0.5)",
          animation: "slideDown 0.3s ease-out"
        }}>
          <div style={{
            "max-width": "1200px",
            margin: "0 auto",
            display: "grid",
            "grid-template-columns": "auto 1fr 1fr auto",
            gap: "1rem",
            "align-items": "center"
          }}>
            {/* Character Name & Level */}
            <div style={{ 
              "white-space": "nowrap",
              "font-weight": "bold"
            }}>
              {currentCharacter()?.name} <span style={{ color: "var(--text-secondary)" }}>Lv.{currentCharacter()?.level}</span>
            </div>

            {/* Health Bar */}
            <div>
              <div style={{ 
                "font-size": "0.75rem", 
                color: "var(--text-secondary)", 
                "margin-bottom": "0.25rem",
                display: "flex",
                "justify-content": "space-between"
              }}>
                <span>HP</span>
                <span>{currentHealth()}/{currentMaxHealth()}</span>
              </div>
              <div class="progress-bar" style={{ height: "8px" }}>
                <div
                  class="progress-fill health"
                  style={{ width: `${(currentHealth() / currentMaxHealth()) * 100}%` }}
                />
              </div>
            </div>

            {/* Mana Bar */}
            <div>
              <div style={{ 
                "font-size": "0.75rem", 
                color: "var(--text-secondary)", 
                "margin-bottom": "0.25rem",
                display: "flex",
                "justify-content": "space-between"
              }}>
                <span>MP</span>
                <span>{currentMana()}/{currentMaxMana()}</span>
              </div>
              <div class="progress-bar" style={{ height: "8px" }}>
                <div
                  class="progress-fill mana"
                  style={{ width: `${(currentMana() / currentMaxMana()) * 100}%` }}
                />
              </div>
            </div>

            {/* Gold */}
            <div style={{ 
              "white-space": "nowrap",
              "font-weight": "bold",
              color: "var(--warning)"
            }}>
              💰 {currentGold()}
            </div>
          </div>
        </div>
      </Show>

      <Show when={currentCharacter()}>
        <div class="container">
          {/* Character Info Panel */}
          <div class="card">
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "flex-wrap": "wrap", gap: "1rem" }}>
              <div style={{ flex: 1, "min-width": "250px" }}>
                <h2>{currentCharacter()?.name}</h2>
                <p style={{ color: "var(--text-secondary)", "margin-bottom": "0.5rem" }}>
                  Level {currentCharacter()!.level} | {currentGold()} Gold
                </p>
                {/* XP Progress Bar */}
                <div>
                  <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                    <span>Experience</span>
                    <span>{currentCharacter()?.experience}/{(currentCharacter()?.level || 1) * 125} XP</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      style={{ 
                        width: `${((currentCharacter()?.experience || 0) / ((currentCharacter()?.level || 1) * 125)) * 100}%`,
                        background: "linear-gradient(90deg, var(--warning), var(--accent))"
                      }}
                    />
                  </div>
                </div>
              </div>
              <Show when={currentCharacter() && currentCharacter()!.available_points > 0}>
                <div style={{ padding: "0.5rem 1rem", background: "var(--warning)", color: "var(--bg-dark)", "border-radius": "6px", "font-weight": "bold" }}>
                  {currentCharacter()!.available_points} Stat Points Available!
                </div>
              </Show>
            </div>

            <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", "margin-top": "1rem" }}>
              <div>
                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                  <span>Health</span>
                  <span>{currentHealth()}/{currentMaxHealth()}</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill health"
                    style={{ width: `${(currentHealth() / currentMaxHealth()) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                  <span>Mana</span>
                  <span>{currentMana()}/{currentMaxMana()}</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill mana"
                    style={{ width: `${(currentMana() / currentMaxMana()) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          {props.children}
        </div>
      </Show>
    </div>
  );
}
