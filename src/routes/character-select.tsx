import { createAsync, redirect } from "@solidjs/router";
import { For, Show } from "solid-js";
import { getUser } from "~/lib/auth";
import { getCharactersByUser } from "~/lib/game";
import { A, useNavigate } from "@solidjs/router";

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
          <h1 class="title">Fantasy RPG</h1>
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
                <A href={`/game/${character.id}`} class="card" style={{ cursor: "pointer", "text-decoration": "none", color: "inherit" }}>
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
                </A>
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
    </div>
  );
}
