import { A } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Swords, Backpack, ScrollText, Hammer, User } from "lucide-solid";
import { CharacterModal } from "./CharacterModal";
import { QuestLogModal } from "./QuestLogModal";
import { useCharacter } from "~/lib/CharacterContext";

export function GameNavigation() {
  const [store, actions] = useCharacter();
  const [showCharacterModal, setShowCharacterModal] = createSignal(false);
  const [showQuestLogModal, setShowQuestLogModal] = createSignal(false);
  
  const handleOpenQuestLog = () => {
    setShowQuestLogModal(true);
    // Clear the indicator when opening quest log
    actions.setHasCompletableQuests(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div class="header desktop-nav">
        <div class="header-content">
          <h1 class="title">Fantasy RPG</h1>
          <div class="button-group">
            <A href="/game" class="button" activeClass="active" end>
              <Swords size={18} style={{ "margin-right": "0.5rem" }} />
              Adventure
            </A>
            <A href="/game/inventory" class="button" activeClass="active">
              <Backpack size={18} style={{ "margin-right": "0.5rem" }} />
              Inventory
            </A>
            <button class="button" onClick={handleOpenQuestLog} style={{ position: "relative" }}>
              <ScrollText size={18} style={{ "margin-right": "0.5rem" }} />
              Quest Log
              <Show when={store.hasCompletableQuests}>
                <span style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "8px",
                  height: "8px",
                  "background-color": "#FFD700",
                  "border-radius": "50%",
                  "box-shadow": "0 0 4px rgba(255, 215, 0, 0.8)"
                }}>!</span>
              </Show>
            </button>
            <A href="/game/crafting" class="button" activeClass="active">
              <Hammer size={18} style={{ "margin-right": "0.5rem" }} />
              Crafting
            </A>
            <button class="button" onClick={() => setShowCharacterModal(true)}>
              <User size={18} style={{ "margin-right": "0.5rem" }} />
              Character
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav class="mobile-nav">
        <A href="/game" class="nav-item" activeClass="active" end>
          <Swords size={24} />
          <span>Adventure</span>
        </A>
        <A href="/game/inventory" class="nav-item" activeClass="active">
          <Backpack size={24} />
          <span>Inventory</span>
        </A>
        <button class="nav-item" onClick={handleOpenQuestLog} style={{ position: "relative" }}>
          <ScrollText size={24} />
          <span>Quests</span>
          <Show when={store.hasCompletableQuests}>
            <span style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "8px",
              height: "8px",
              "background-color": "#FFD700",
              "border-radius": "50%",
              "box-shadow": "0 0 4px rgba(255, 215, 0, 0.8)"
            }}>!</span>
          </Show>
        </button>
        <A href="/game/crafting" class="nav-item" activeClass="active">
          <Hammer size={24} />
          <span>Crafting</span>
        </A>
        <button class="nav-item" onClick={() => setShowCharacterModal(true)}>
          <User size={24} />
          <span>Character</span>
        </button>
      </nav>

      {/* Modals */}
      <Show when={showCharacterModal()}>
        <CharacterModal onClose={() => setShowCharacterModal(false)} />
      </Show>
      <Show when={showQuestLogModal()}>
        <QuestLogModal onClose={() => setShowQuestLogModal(false)} />
      </Show>
    </>
  );
}
