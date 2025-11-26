import { createSignal, Show } from "solid-js";
import { useNavigate, redirect, createAsync } from "@solidjs/router";
import { getUser } from "~/lib/auth";

async function checkAuth() {
  "use server";
  const user = await getUser();
  if (!user) throw redirect("/");
  return user;
}

export default function CreateCharacter() {
  const user = createAsync(() => checkAuth());
  const navigate = useNavigate();

  const BASE_STATS = 10;
  const POINTS_TO_ASSIGN = 15;

  const [name, setName] = createSignal("");
  const [strength, setStrength] = createSignal(BASE_STATS);
  const [dexterity, setDexterity] = createSignal(BASE_STATS);
  const [constitution, setConstitution] = createSignal(BASE_STATS);
  const [intelligence, setIntelligence] = createSignal(BASE_STATS);
  const [wisdom, setWisdom] = createSignal(BASE_STATS);
  const [charisma, setCharisma] = createSignal(BASE_STATS);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const pointsUsed = () =>
    strength() +
    dexterity() +
    constitution() +
    intelligence() +
    wisdom() +
    charisma() -
    BASE_STATS * 6;

  const pointsRemaining = () => POINTS_TO_ASSIGN - pointsUsed();

  const canIncrease = (value: number) => value < 25 && pointsRemaining() > 0;
  const canDecrease = (value: number) => value > 5;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (pointsRemaining() !== 0) {
      setError("You must assign all stat points");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name(),
          strength: strength(),
          dexterity: dexterity(),
          constitution: constitution(),
          intelligence: intelligence(),
          wisdom: wisdom(),
          charisma: charisma(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        navigate('/game');
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div class="header">
        <div class="header-content">
          <h1 class="title">Create Character</h1>
          <button class="button secondary" onClick={() => navigate("/character-select")}>
            Back
          </button>
        </div>
      </div>

      <div class="container">
        <div style={{ "max-width": "800px", margin: "0 auto" }}>
          <Show when={error()}>
            <div class="error">{error()}</div>
          </Show>

          <form onSubmit={handleSubmit}>
            <div class="card">
              <h3 style={{ "margin-bottom": "1rem" }}>Character Name</h3>
              <input
                type="text"
                name="name"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                required
                placeholder="Enter character name"
                minLength={3}
                maxLength={20}
                disabled={loading()}
              />
            </div>

            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1.5rem" }}>
                <h3>Assign Stats</h3>
                <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: pointsRemaining() === 0 ? "var(--success)" : "var(--accent)" }}>
                  Points Remaining: {pointsRemaining()}
                </div>
              </div>

              <p style={{ color: "var(--text-secondary)", "margin-bottom": "1.5rem" }}>
                Distribute {POINTS_TO_ASSIGN} points among your stats. Each stat affects different aspects of gameplay.
              </p>

              {/* Strength */}
              <div style={{ "margin-bottom": "1.5rem" }}>
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <div>
                    <strong>Strength</strong> - Increases melee damage
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setStrength(Math.max(5, strength() - 1))}
                      disabled={!canDecrease(strength()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      -
                    </button>
                    <span style={{ "font-size": "1.5rem", "font-weight": "bold", "min-width": "3rem", "text-align": "center" }}>
                      {strength()}
                    </span>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setStrength(Math.min(25, strength() + 1))}
                      disabled={!canIncrease(strength()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Dexterity */}
              <div style={{ "margin-bottom": "1.5rem" }}>
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <div>
                    <strong>Dexterity</strong> - Improves agility and reflexes
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setDexterity(Math.max(5, dexterity() - 1))}
                      disabled={!canDecrease(dexterity()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      -
                    </button>
                    <span style={{ "font-size": "1.5rem", "font-weight": "bold", "min-width": "3rem", "text-align": "center" }}>
                      {dexterity()}
                    </span>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setDexterity(Math.min(25, dexterity() + 1))}
                      disabled={!canIncrease(dexterity()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Constitution */}
              <div style={{ "margin-bottom": "1.5rem" }}>
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <div>
                    <strong>Constitution</strong> - Increases health
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setConstitution(Math.max(5, constitution() - 1))}
                      disabled={!canDecrease(constitution()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      -
                    </button>
                    <span style={{ "font-size": "1.5rem", "font-weight": "bold", "min-width": "3rem", "text-align": "center" }}>
                      {constitution()}
                    </span>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setConstitution(Math.min(25, constitution() + 1))}
                      disabled={!canIncrease(constitution()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Intelligence */}
              <div style={{ "margin-bottom": "1.5rem" }}>
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <div>
                    <strong>Intelligence</strong> - Increases mana and spell power
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setIntelligence(Math.max(5, intelligence() - 1))}
                      disabled={!canDecrease(intelligence()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      -
                    </button>
                    <span style={{ "font-size": "1.5rem", "font-weight": "bold", "min-width": "3rem", "text-align": "center" }}>
                      {intelligence()}
                    </span>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setIntelligence(Math.min(25, intelligence() + 1))}
                      disabled={!canIncrease(intelligence()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Wisdom */}
              <div style={{ "margin-bottom": "1.5rem" }}>
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <div>
                    <strong>Wisdom</strong> - Enhances healing and perception
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setWisdom(Math.max(5, wisdom() - 1))}
                      disabled={!canDecrease(wisdom()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      -
                    </button>
                    <span style={{ "font-size": "1.5rem", "font-weight": "bold", "min-width": "3rem", "text-align": "center" }}>
                      {wisdom()}
                    </span>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setWisdom(Math.min(25, wisdom() + 1))}
                      disabled={!canIncrease(wisdom()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Charisma */}
              <div style={{ "margin-bottom": "1.5rem" }}>
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <div>
                    <strong>Charisma</strong> - Affects luck and fortune
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setCharisma(Math.max(5, charisma() - 1))}
                      disabled={!canDecrease(charisma()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      -
                    </button>
                    <span style={{ "font-size": "1.5rem", "font-weight": "bold", "min-width": "3rem", "text-align": "center" }}>
                      {charisma()}
                    </span>
                    <button
                      type="button"
                      class="button secondary"
                      onClick={() => setCharisma(Math.min(25, charisma() + 1))}
                      disabled={!canIncrease(charisma()) || loading()}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="button"
              style={{ width: "100%" }}
              disabled={pointsRemaining() !== 0 || !name() || loading()}
            >
              {loading() ? "Creating..." : "Create Character"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
