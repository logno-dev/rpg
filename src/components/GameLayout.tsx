import { createSignal, createMemo, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useCharacter } from "~/lib/CharacterContext";
import { HealthRegen } from "~/components/HealthRegen";
import { GameNavigation } from "~/components/GameNavigation";
import { Coins } from "lucide-solid";

type GameLayoutProps = {
  children: any;
};

export function GameLayout(props: GameLayoutProps) {
  const [store, actions, computed] = useCharacter();
  const [isScrolled, setIsScrolled] = createSignal(false);
  const navigate = useNavigate();

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

  // Use computed values from context
  const currentMaxHealth = computed.maxHealth;
  const currentMaxMana = computed.maxMana;
  const totalStats = computed.totalStats;

  // Handle regen tick
  const handleRegenTick = async (health: number, mana: number) => {
    if (!currentCharacter()) return;
    
    // Update context optimistically
    actions.updateHealth(health, mana);
    
    // Sync to server in background (fire and forget)
    try {
      await fetch('/api/game/update-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: currentCharacter()!.id,
          health,
          mana,
        }),
      });
    } catch (error) {
      console.error('[HealthRegen] Failed to sync health/mana:', error);
    }
  };

  // Scroll detection for sticky header
  onMount(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <div style={{ "padding-bottom": "env(safe-area-inset-bottom, 0px)" }}>
      {/* Navigation */}
      <GameNavigation />

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
              color: "var(--warning)",
              display: "flex",
              "align-items": "center",
              gap: "0.5rem"
            }}>
              <Coins size={18} />
              {currentGold()}
            </div>
          </div>
        </div>
      </Show>

      <Show when={currentCharacter()}>
        {(character) => (
          <div class="container" style={{ "padding-bottom": "calc(5rem + env(safe-area-inset-bottom, 0px))" }}>
            {/* Passive Health/Mana Regeneration */}
            <HealthRegen
              maxHealth={currentMaxHealth}
              maxMana={currentMaxMana}
              currentHealth={currentHealth}
              currentMana={currentMana}
              constitution={() => totalStats().constitution}
              wisdom={() => totalStats().wisdom}
              isInCombat={() => false}
              onRegenTick={handleRegenTick}
            />
            
            {/* Mobile Title */}
            <h1 class="title mobile-title" style={{ 
              "text-align": "center", 
              "margin-bottom": "1rem",
              "font-size": "2rem"
            }}>
              Morthvale
            </h1>
            
            {/* Character Info Panel */}
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "flex-wrap": "wrap", gap: "1rem" }}>
                <div style={{ flex: 1, "min-width": "250px" }}>
                  <h2>{character().name}</h2>
                  <p style={{ color: "var(--text-secondary)", "margin-bottom": "0.5rem", display: "flex", "align-items": "center", gap: "0.5rem" }}>
                    <span>Level {character().level}</span>
                    <span>|</span>
                    <span style={{ display: "flex", "align-items": "center", gap: "0.25rem" }}>
                      <Coins size={16} /> {currentGold()} Gold
                    </span>
                  </p>
                  {/* XP Progress Bar */}
                  <div>
                    <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem", display: "flex", "justify-content": "space-between" }}>
                      <span>Experience</span>
                      <span>{character().experience}/{character().level * 125} XP</span>
                    </div>
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        style={{ 
                          width: `${(character().experience / (character().level * 125)) * 100}%`,
                          background: "linear-gradient(90deg, var(--warning), var(--accent))"
                        }}
                      />
                    </div>
                  </div>
                </div>
                <Show when={character().available_points > 0}>
                  <button 
                    style={{ 
                      padding: "0.5rem 1rem", 
                      background: "var(--warning)", 
                      color: "var(--bg-dark)", 
                      "border-radius": "6px", 
                      "font-weight": "bold",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => navigate('/game/stats')}
                  >
                    {character().available_points} Stat Points Available!
                  </button>
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
        )}
      </Show>
    </div>
  );
}
