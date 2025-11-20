import { createAsync, useParams, redirect, action, revalidate } from "@solidjs/router";
import { createSignal, Show, For, createEffect } from "solid-js";
import { getUser } from "~/lib/auth";
import {
  getCharacter,
  roamField,
  getMobsInArea,
  startCombat,
  processCombatRound,
  getActiveCombat,
  getInventory,
  equipItem,
  unequipItem,
  restCharacter,
  assignStatPoints,
} from "~/lib/game";
import { db, type Character, type Mob } from "~/lib/db";

async function getGameData(characterId: number) {
  "use server";
  const user = await getUser();
  if (!user) throw redirect("/");

  const character = await getCharacter(characterId);
  if (!character || character.user_id !== user.id) {
    throw redirect("/character-select");
  }

  const activeCombat = await getActiveCombat(characterId);
  const inventory = await getInventory(characterId);

  let mob = null;
  if (activeCombat) {
    const mobResult = await db.execute({
      sql: "SELECT * FROM mobs WHERE id = ?",
      args: [activeCombat.mob_id],
    });
    mob = mobResult.rows[0] as Mob;
  }

  return { character, activeCombat, mob, inventory };
}

const roamAction = action(async (characterId: number, area: string) => {
  "use server";
  return await roamField(characterId, area);
});

const startCombatAction = action(async (characterId: number, mobId: number) => {
  "use server";
  await startCombat(characterId, mobId);
  revalidate(getGameData.key);
});

const attackAction = action(async (combatId: number, abilityId?: number) => {
  "use server";
  return await processCombatRound(combatId, abilityId);
});

const restAction = action(async (characterId: number) => {
  "use server";
  await restCharacter(characterId);
  revalidate(getGameData.key);
});

const equipAction = action(async (characterId: number, inventoryItemId: number) => {
  "use server";
  await equipItem(characterId, inventoryItemId);
  revalidate(getGameData.key);
});

const unequipAction = action(async (inventoryItemId: number) => {
  "use server";
  await unequipItem(inventoryItemId);
  revalidate(getGameData.key);
});

const assignStatsAction = action(async (characterId: number, stats: any) => {
  "use server";
  await assignStatPoints(characterId, stats);
  revalidate(getGameData.key);
});

export default function GamePage() {
  const params = useParams();
  const characterId = () => parseInt(params.id);
  const data = createAsync(() => getGameData(characterId()));

  const [view, setView] = createSignal<"adventure" | "inventory" | "stats">("adventure");
  const [selectedArea, setSelectedArea] = createSignal("plains");
  const [availableMobs, setAvailableMobs] = createSignal<Mob[]>([]);
  const [combatLog, setCombatLog] = createSignal<string[]>([]);
  const [isRoaming, setIsRoaming] = createSignal(false);

  const areas = ["plains", "forest", "mountains", "dungeon"];

  const handleRoam = async () => {
    setIsRoaming(true);
    setCombatLog([]);
    try {
      const result = await roamAction(characterId(), selectedArea());
      
      if (result.initiated) {
        setCombatLog([`A wild ${result.mob.name} appears and attacks!`]);
        await startCombatAction(characterId(), result.mob.id);
      } else {
        setAvailableMobs([result.mob]);
        setCombatLog([`You encounter a ${result.mob.name} in the area.`]);
      }
    } catch (error: any) {
      setCombatLog([`Error: ${error.message}`]);
    }
    setIsRoaming(false);
  };

  const handleAttack = async (abilityId?: number) => {
    const combat = data()?.activeCombat;
    if (!combat) return;

    try {
      const result = await attackAction(combat.id, abilityId);
      setCombatLog(result.log);

      if (result.result) {
        setAvailableMobs([]);
        setTimeout(() => {
          revalidate(getGameData.key);
        }, 2000);
      } else {
        revalidate(getGameData.key);
      }
    } catch (error: any) {
      setCombatLog([`Error: ${error.message}`]);
    }
  };

  const handleRest = async () => {
    await restAction(characterId());
    setCombatLog(["You rest and recover your health and mana."]);
  };

  const handleEquip = async (inventoryItemId: number, equipped: boolean) => {
    if (equipped) {
      await unequipAction(inventoryItemId);
    } else {
      await equipAction(characterId(), inventoryItemId);
    }
  };

  return (
    <div>
      <div class="header">
        <div class="header-content">
          <h1 class="title">Fantasy RPG</h1>
          <a href="/character-select" class="button secondary">
            Character Select
          </a>
        </div>
      </div>

      <Show when={data()}>
        {(gameData) => (
          <div class="container">
            {/* Character Info Panel */}
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "flex-wrap": "wrap", gap: "1rem" }}>
                <div>
                  <h2>{gameData().character.name}</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Level {gameData().character.level} | {gameData().character.gold} Gold | XP: {gameData().character.experience}
                  </p>
                </div>
                <Show when={gameData().character.available_points > 0}>
                  <div style={{ padding: "0.5rem 1rem", background: "var(--warning)", color: "var(--bg-dark)", "border-radius": "6px", "font-weight": "bold" }}>
                    {gameData().character.available_points} Stat Points Available!
                  </div>
                </Show>
              </div>

              <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", "margin-top": "1rem" }}>
                <div>
                  <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Health</div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill health"
                      style={{ width: `${(gameData().character.current_health / gameData().character.max_health) * 100}%` }}
                    >
                      {gameData().character.current_health}/{gameData().character.max_health}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>Mana</div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill mana"
                      style={{ width: `${(gameData().character.current_mana / gameData().character.max_mana) * 100}%` }}
                    >
                      {gameData().character.current_mana}/{gameData().character.max_mana}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div class="card">
              <div class="button-group">
                <button
                  class={view() === "adventure" ? "button" : "button secondary"}
                  onClick={() => setView("adventure")}
                >
                  Adventure
                </button>
                <button
                  class={view() === "inventory" ? "button" : "button secondary"}
                  onClick={() => setView("inventory")}
                >
                  Inventory
                </button>
                <button
                  class={view() === "stats" ? "button" : "button secondary"}
                  onClick={() => setView("stats")}
                >
                  Stats
                </button>
                <button class="button success" onClick={handleRest} disabled={!!gameData().activeCombat}>
                  Rest
                </button>
              </div>
            </div>

            {/* Adventure View */}
            <Show when={view() === "adventure"}>
              <Show
                when={!gameData().activeCombat}
                fallback={
                  <div class="card">
                    <h3 style={{ "margin-bottom": "1rem" }}>Combat!</h3>
                    <Show when={gameData().mob}>
                      <div style={{ "margin-bottom": "1rem" }}>
                        <h4>{gameData().mob!.name} (Level {gameData().mob!.level})</h4>
                        <div class="progress-bar">
                          <div
                            class="progress-fill danger"
                            style={{
                              width: `${(gameData().activeCombat!.mob_health / gameData().mob!.max_health) * 100}%`,
                            }}
                          >
                            {gameData().activeCombat!.mob_health}/{gameData().mob!.max_health}
                          </div>
                        </div>
                      </div>
                    </Show>

                    <div class="button-group">
                      <button class="button" onClick={() => handleAttack()}>
                        Attack
                      </button>
                      {/* Add abilities here if implemented */}
                    </div>

                    <Show when={combatLog().length > 0}>
                      <div class="combat-log" style={{ "margin-top": "1rem" }}>
                        <For each={combatLog()}>{(log) => <p>{log}</p>}</For>
                      </div>
                    </Show>
                  </div>
                }
              >
                <div class="card">
                  <h3 style={{ "margin-bottom": "1rem" }}>Explore the World</h3>

                  <div style={{ "margin-bottom": "1rem" }}>
                    <label>Select Area</label>
                    <select value={selectedArea()} onChange={(e) => setSelectedArea(e.currentTarget.value)}>
                      <For each={areas}>
                        {(area) => <option value={area}>{area.charAt(0).toUpperCase() + area.slice(1)}</option>}
                      </For>
                    </select>
                  </div>

                  <button class="button" onClick={handleRoam} disabled={isRoaming()}>
                    {isRoaming() ? "Roaming..." : "Roam the Field"}
                  </button>

                  <Show when={availableMobs().length > 0}>
                    <div style={{ "margin-top": "1.5rem" }}>
                      <h4>Encountered Creatures:</h4>
                      <div class="button-group" style={{ "margin-top": "1rem" }}>
                        <For each={availableMobs()}>
                          {(mob) => (
                            <button
                              class="button secondary"
                              onClick={() => startCombatAction(characterId(), mob.id)}
                            >
                              Fight {mob.name} (Lvl {mob.level})
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  <Show when={combatLog().length > 0}>
                    <div class="combat-log" style={{ "margin-top": "1rem" }}>
                      <For each={combatLog()}>{(log) => <p>{log}</p>}</For>
                    </div>
                  </Show>
                </div>
              </Show>
            </Show>

            {/* Inventory View */}
            <Show when={view() === "inventory"}>
              <div class="card">
                <h3 style={{ "margin-bottom": "1rem" }}>Inventory</h3>
                <div class="item-grid">
                  <For each={gameData().inventory}>
                    {(invItem: any) => (
                      <div class={`item-card ${invItem.rarity} ${invItem.equipped ? "equipped" : ""}`}>
                        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                          <div>
                            <h4>{invItem.name}</h4>
                            <p style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                              {invItem.type}
                            </p>
                          </div>
                          <Show when={invItem.quantity > 1}>
                            <div style={{ "font-weight": "bold" }}>x{invItem.quantity}</div>
                          </Show>
                        </div>

                        <Show when={invItem.description}>
                          <p style={{ "font-size": "0.875rem", "margin-top": "0.5rem" }}>
                            {invItem.description}
                          </p>
                        </Show>

                        <Show when={invItem.slot}>
                          <button
                            class={invItem.equipped ? "button danger" : "button"}
                            style={{ width: "100%", "margin-top": "0.5rem" }}
                            onClick={() => handleEquip(invItem.id, invItem.equipped)}
                          >
                            {invItem.equipped ? "Unequip" : "Equip"}
                          </button>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Stats View */}
            <Show when={view() === "stats"}>
              <div class="card">
                <h3 style={{ "margin-bottom": "1rem" }}>Character Stats</h3>
                <div class="stat-grid">
                  <div class="stat-item">
                    <div class="stat-label">Strength</div>
                    <div class="stat-value">{gameData().character.strength}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Dexterity</div>
                    <div class="stat-value">{gameData().character.dexterity}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Constitution</div>
                    <div class="stat-value">{gameData().character.constitution}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Intelligence</div>
                    <div class="stat-value">{gameData().character.intelligence}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Wisdom</div>
                    <div class="stat-value">{gameData().character.wisdom}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Charisma</div>
                    <div class="stat-value">{gameData().character.charisma}</div>
                  </div>
                </div>

                <Show when={gameData().character.available_points > 0}>
                  <div style={{ "margin-top": "2rem", padding: "1rem", background: "var(--bg-light)", "border-radius": "6px" }}>
                    <h4 style={{ "margin-bottom": "1rem" }}>
                      Assign Stat Points ({gameData().character.available_points} available)
                    </h4>
                    <p style={{ color: "var(--text-secondary)", "margin-bottom": "1rem" }}>
                      Click on a stat to assign points. You can implement a full point assignment UI here.
                    </p>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
