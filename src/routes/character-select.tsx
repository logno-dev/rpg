import { createAsync, redirect, useNavigate, A } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import { getUser, setSelectedCharacter } from "~/lib/auth";
import { getCharactersByUser } from "~/lib/game";

async function getUserCharacters() {
  "use server";
  const user = await getUser();
  if (!user) {
    throw redirect("/");
  }

  const characters = await getCharactersByUser(user.id);
  return { user, characters };
}

export default function CharacterSelect() {
  const data = createAsync(() => getUserCharacters());
  const navigate = useNavigate();
  const [deletingCharacter, setDeletingCharacter] = createSignal<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [characterToDelete, setCharacterToDelete] = createSignal<{ id: number; name: string } | null>(null);

  const handleSelectCharacter = async (characterId: number) => {
    console.log('[CharacterSelect] Selecting character:', characterId);
    
    // Save to server session
    try {
      await setSelectedCharacter(characterId);
      console.log('[CharacterSelect] Character saved to session');
      navigate('/game');
    } catch (error) {
      console.error('[CharacterSelect] Error saving character:', error);
    }
  };

  const openDeleteModal = (characterId: number, characterName: string) => {
    setCharacterToDelete({ id: characterId, name: characterName });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCharacterToDelete(null);
  };

  const confirmDelete = async () => {
    const char = characterToDelete();
    if (!char) return;

    setDeletingCharacter(char.id);
    
    try {
      const response = await fetch('/api/character/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId: char.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete character');
      }

      // Refresh the page to update the character list
      window.location.reload();
    } catch (error: any) {
      console.error('Delete character error:', error);
      alert(error.message || 'Failed to delete character');
      setDeletingCharacter(null);
      closeDeleteModal();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      <div class="header">
        <div class="header-content">
          <h1 class="title">Morthvale</h1>
          <button class="button secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div class="container">
        <Show when={data()}>
          <h2 style={{ "margin-bottom": "1.5rem" }}>Select Your Character</h2>

          <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "repeat(auto-fill, minmax(300px, 1fr))" }}>
            <For each={data()!.characters}>
              {(character) => (
                <div class="card" style={{ position: "relative" }}>
                  <div onClick={() => handleSelectCharacter(character.id)} style={{ cursor: "pointer" }}>
                    <h3 style={{ "margin-bottom": "0.5rem" }}>{character.name}</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Level {character.level} - {character.gold} Gold
                    </p>
                    <div class="stat-grid" style={{ "margin-top": "1rem" }}>
                      <div class="stat-item">
                        <div class="stat-label">HP</div>
                        <div class="stat-value" style={{ "font-size": "1rem" }}>
                          {character.current_health}/{character.max_health}
                        </div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">MP</div>
                        <div class="stat-value" style={{ "font-size": "1rem" }}>
                          {character.current_mana}/{character.max_mana}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    class="button secondary"
                    style={{ 
                      "margin-top": "1rem", 
                      width: "100%",
                      "background-color": "var(--danger, #dc3545)",
                      "border-color": "var(--danger, #dc3545)"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(character.id, character.name);
                    }}
                    disabled={deletingCharacter() === character.id}
                  >
                    {deletingCharacter() === character.id ? "Deleting..." : "Delete Character"}
                  </button>
                </div>
              )}
            </For>

            <A href="/create-character" class="card" style={{ 
              cursor: "pointer", 
              "text-decoration": "none", 
              color: "inherit",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "min-height": "200px",
              border: "2px dashed var(--border)"
            }}>
              <div style={{ "text-align": "center" }}>
                <div style={{ "font-size": "3rem", "margin-bottom": "0.5rem" }}>+</div>
                <div style={{ "font-size": "1.25rem", "font-weight": "500" }}>Create New Character</div>
              </div>
            </A>
          </div>
        </Show>
      </div>

      {/* Delete Confirmation Modal */}
      <Show when={showDeleteModal()}>
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            "background-color": "rgba(0, 0, 0, 0.7)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            "z-index": 1000,
          }}
          onClick={closeDeleteModal}
        >
          <div 
            class="card"
            style={{
              "max-width": "500px",
              width: "90%",
              margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ "margin-bottom": "1rem", color: "var(--danger, #dc3545)" }}>
              Delete Character
            </h2>
            <p style={{ "margin-bottom": "1.5rem", "font-size": "1.1rem" }}>
              Are you sure you want to delete <strong>{characterToDelete()?.name}</strong>?
            </p>
            <p style={{ "margin-bottom": "1.5rem", color: "var(--text-secondary)" }}>
              This action cannot be undone. All character data including inventory, abilities, and progress will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: "1rem", "justify-content": "flex-end" }}>
              <button
                class="button secondary"
                onClick={closeDeleteModal}
                disabled={deletingCharacter() !== null}
              >
                Cancel
              </button>
              <button
                class="button"
                style={{
                  "background-color": "var(--danger, #dc3545)",
                  "border-color": "var(--danger, #dc3545)",
                }}
                onClick={confirmDelete}
                disabled={deletingCharacter() !== null}
              >
                {deletingCharacter() !== null ? "Deleting..." : "Delete Character"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
