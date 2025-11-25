import { createAsync, useParams, redirect, useNavigate, cache } from "@solidjs/router";
import { createEffect } from "solid-js";
import { getUser } from "~/lib/auth";
import { getCharacter, getInventory, getAbilitiesWithEffects, getHotbar } from "~/lib/game";
import { GameLayout } from "~/components/GameLayout";
import { HotbarManager } from "~/components/HotbarManager";
import { useCharacter } from "~/lib/CharacterContext";
import { getSelectedCharacterId } from "~/lib/game-helpers";

const getHotbarData = cache(async (characterId: number | null) => {
  "use server";
  
  // Handle missing character ID (SSR or localStorage not set)
  if (!characterId) {
    throw redirect("/character-select");
  }
  
  let user;
  try {
    user = await getUser();
  } catch (error) {
    console.error("Error getting user:", error);
    throw redirect("/");
  }
  
  if (!user) throw redirect("/");

  const character = await getCharacter(characterId);
  if (!character || character.user_id !== user.id) {
    throw redirect("/character-select");
  }

  const inventory = await getInventory(characterId);
  const abilities = await getAbilitiesWithEffects(characterId);
  const hotbar = await getHotbar(characterId);
  
  return { character, inventory, abilities, hotbar };
}, "hotbar-data");

export default function HotbarPage() {
  const navigate = useNavigate();
  const characterId = () => getSelectedCharacterId();
  
  // Redirect if no character selected (client-side only)
  createEffect(() => {
    if (typeof window !== 'undefined' && !characterId()) {
      navigate('/character-select');
    }
  });
  
  // Only fetch data if we have a character ID
  const data = createAsync(() => {
    const id = characterId();
    // Don't call server function if no ID - will handle redirect in effect
    if (!id) return Promise.resolve(undefined);
    return getHotbarData(id);
  }, { deferStream: true });
  
  const [store, actions] = useCharacter();

  // Initialize store with fetched data
  createEffect(() => {
    const gameData = data();
    if (gameData && !store.character) {
      actions.setCharacter(gameData.character);
      actions.setInventory(gameData.inventory as any);
      actions.setAbilities(gameData.abilities);
      actions.setHotbar(gameData.hotbar);
    }
  });

  // Computed values
  const currentInventory = () => store.inventory || data()?.inventory || [];
  const currentAbilities = () => store.abilities || data()?.abilities || [];
  const currentHotbar = () => store.hotbar || data()?.hotbar || [];

  return (
    <GameLayout>
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
    </GameLayout>
  );
}
