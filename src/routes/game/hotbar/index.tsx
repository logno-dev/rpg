import { createAsync, useParams, redirect, useNavigate, cache } from "@solidjs/router";
import { createEffect, Show, For, Suspense } from "solid-js";
import { GameLayout } from "~/components/GameLayout";
import { HotbarManager } from "~/components/HotbarManager";
import { useCharacter } from "~/lib/CharacterContext";
import { getSelectedCharacterId, useBasicCharacterData } from "~/lib/game-helpers";

export default function HotbarPage() {
  const navigate = useNavigate();
  
  // Use shared hook to initialize character context (uses server session!)
  // This will redirect server-side if no character is selected
  const basicData = useBasicCharacterData();
  
  // Get character ID from localStorage (client-side only, for API calls)
  const characterId = () => getSelectedCharacterId();
  
  // Redirect to active dungeon if one exists
  createEffect(() => {
    const data = basicData();
    if (data?.activeDungeonProgress) {
      console.log('[Hotbar] Active dungeon found, redirecting to:', data.activeDungeonProgress.dungeon_id);
      navigate(`/game/dungeon/${data.activeDungeonProgress.dungeon_id}`);
    }
  });
  
  const [store, actions] = useCharacter();

  // Initialize context with basic data when it arrives
  createEffect(() => {
    const data = basicData();
    if (data && !store.character) {
      actions.setCharacter(data.character);
      actions.setInventory(data.inventory as any);
      actions.setAbilities(data.abilities);
      actions.setHotbar(data.hotbar);
    }
  });

  // Computed values - use context as source of truth
  const currentInventory = () => store.inventory || [];
  const currentAbilities = () => store.abilities || [];
  const currentHotbar = () => store.hotbar || [];

  const LoadingSkeleton = () => (
    <div class="card">
      <div style={{ height: "400px", display: "flex", "align-items": "center", "justify-content": "center", "flex-direction": "column", gap: "1rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
        <div style={{ "font-size": "3rem" }}>🎮</div>
        <div style={{ "font-size": "1.25rem", color: "var(--text-secondary)" }}>Loading hotbar...</div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );

  return (
    <GameLayout>
      <Suspense fallback={<LoadingSkeleton />}>
      <Show when={basicData()}>
      <HotbarManager
        characterId={characterId() || 0}
        abilities={currentAbilities()}
        consumables={currentInventory().filter((i: any) => 
          i.type === 'consumable' && 
          (i.health_restore > 0 || i.mana_restore > 0) &&
          !i.teaches_ability_id
        )}
        hotbar={currentHotbar()}
        onHotbarChange={async () => {
          console.log('[Game] Hotbar changed, updating context...');
          const id = characterId();
          if (!id) return;
          try {
            const response = await fetch(`/api/game/get-hotbar?characterId=${id}`);
            const result = await response.json();
            if (result.hotbar) {
              actions.setHotbar(result.hotbar);
              console.log('[Game] Hotbar updated in context');
            }
          } catch (error) {
            console.error('[Game] Failed to update hotbar:', error);
          }
        }}
      />
      </Show>
      </Suspense>
    </GameLayout>
  );
}
