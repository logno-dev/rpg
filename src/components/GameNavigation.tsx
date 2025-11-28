import { A } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Swords, Backpack, ScrollText, Hammer, User } from "lucide-solid";
import { CharacterModal } from "./CharacterModal";
import { QuestLogModal } from "./QuestLogModal";

export function GameNavigation() {
  const [showCharacterModal, setShowCharacterModal] = createSignal(false);
  const [showQuestLogModal, setShowQuestLogModal] = createSignal(false);

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
            <button class="button" onClick={() => setShowQuestLogModal(true)}>
              <ScrollText size={18} style={{ "margin-right": "0.5rem" }} />
              Quest Log
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
        <button class="nav-item" onClick={() => setShowQuestLogModal(true)}>
          <ScrollText size={24} />
          <span>Quests</span>
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
