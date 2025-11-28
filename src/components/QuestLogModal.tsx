import { createSignal, createResource, For, Show } from "solid-js";
import { useCharacter } from "~/lib/CharacterContext";

type QuestLogModalProps = {
  onClose: () => void;
};

type Quest = {
  id: number;
  name: string;
  description: string;
  region_id: number;
  min_level: number;
  character_status: string | null;
  current_objective: number | null;
};

type QuestObjective = {
  id: number;
  objective_order: number;
  type: string;
  description: string;
  required_count: number;
  current_count: number;
  completed: number;
  mob_name?: string;
  item_name?: string;
  region_name?: string;
  sub_area_name?: string;
  target_mob_id?: number;
  target_region_id?: number;
};

type QuestDetails = Quest & {
  objectives: QuestObjective[];
  rewards: any[];
};

async function fetchActiveQuests(characterId: number): Promise<QuestDetails[]> {
  const response = await fetch(`/api/game/quests?active=true`, {
    headers: {
      'x-character-id': characterId.toString(),
    },
  });
  const data = await response.json();
  const quests = data.quests || [];
  
  // Fetch details for each active quest
  const questsWithDetails = await Promise.all(
    quests.map(async (quest: Quest) => {
      const detailsResponse = await fetch(`/api/game/quest/${quest.id}`, {
        headers: {
          'x-character-id': characterId.toString(),
        },
      });
      const detailsData = await detailsResponse.json();
      return detailsData.quest;
    })
  );
  
  return questsWithDetails;
}

async function fetchAvailableQuests(characterId: number, regionId: number) {
  const response = await fetch(`/api/game/quests?regionId=${regionId}`, {
    headers: {
      'x-character-id': characterId.toString(),
    },
  });
  const data = await response.json();
  return data.quests || [];
}

async function fetchQuestDetails(characterId: number, questId: number): Promise<QuestDetails | null> {
  const response = await fetch(`/api/game/quest/${questId}`, {
    headers: {
      'x-character-id': characterId.toString(),
    },
  });
  const data = await response.json();
  return data.quest || null;
}

export function QuestLogModal(props: QuestLogModalProps) {
  const [store] = useCharacter();
  const [selectedTab, setSelectedTab] = createSignal<'active' | 'available'>('active');
  const [expandedQuestId, setExpandedQuestId] = createSignal<number | null>(null);
  
  const [activeQuests, { refetch: refetchActive }] = createResource(
    () => store.character?.id,
    (id) => id ? fetchActiveQuests(id) : []
  );
  
  const [availableQuests, { refetch: refetchAvailable }] = createResource(
    () => ({ charId: store.character?.id, regionId: store.currentRegion?.id }),
    (params) => {
      if (!params.charId || !params.regionId) return [];
      return fetchAvailableQuests(params.charId, params.regionId);
    }
  );
  
  // Filter available quests to exclude active ones
  const filteredAvailableQuests = () => {
    const available = availableQuests() || [];
    const active = activeQuests() || [];
    const activeQuestIds = new Set(active.map((q: QuestDetails) => q.id));
    return available.filter((q: Quest) => !activeQuestIds.has(q.id));
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: "rgba(0, 0, 0, 0.85)", 
        display: "flex", 
        "align-items": "center", 
        "justify-content": "center",
        "z-index": 1000,
        padding: "1rem"
      }}
      onClick={props.onClose}
    >
      <div 
        class="card"
        style={{ 
          "max-width": "700px",
          width: "100%",
          "max-height": "90vh",
          overflow: "hidden",
          display: "flex",
          "flex-direction": "column",
          margin: 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ "margin-bottom": "1.5rem" }}>Quest Log</h2>
        
        <div>
          {/* Tab Navigation */}
          <div class="button-group" style={{ "margin-bottom": "1rem" }}>
            <button 
              class={`button ${selectedTab() === 'active' ? '' : 'secondary'}`}
              onClick={() => setSelectedTab('active')}
            >
              Active Quests
            </button>
            <button 
              class={`button ${selectedTab() === 'available' ? '' : 'secondary'}`}
              onClick={() => setSelectedTab('available')}
            >
              Available Quests
            </button>
          </div>

          {/* Quest List */}
          <div style={{ "max-height": "60vh", overflow: "auto" }}>
            <Show when={selectedTab() === 'active'}>
              <Show 
                when={!activeQuests.loading && activeQuests()} 
                fallback={<div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>Loading quests...</div>}
              >
                <Show 
                  when={(activeQuests() || []).length > 0}
                  fallback={
                    <div style={{ 
                      padding: "3rem 2rem", 
                      "text-align": "center", 
                      display: "flex",
                      "flex-direction": "column",
                      "align-items": "center",
                      gap: "1rem"
                    }}>
                      <div style={{ "font-size": "3rem" }}>📜</div>
                      <div>
                        <div style={{ "font-size": "1.125rem", "font-weight": "600", "margin-bottom": "0.5rem", color: "var(--text-primary)" }}>
                          No Active Quests
                        </div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                          Visit quest givers in different regions to find new quests!
                        </div>
                      </div>
                    </div>
                  }
                >
                  <For each={activeQuests()}>
                    {(quest: QuestDetails) => {
                      const isExpanded = () => expandedQuestId() === quest.id;
                      
                      return (
                        <div 
                          class="quest-card"
                          style={{
                            padding: "1rem",
                            "margin-bottom": "0.75rem",
                            background: "var(--bg-light)",
                            border: "1px solid var(--border)",
                            "border-radius": "0.5rem",
                            transition: "all 0.2s"
                          }}
                        >
                          <div 
                            style={{ cursor: "pointer" }}
                            onClick={() => setExpandedQuestId(isExpanded() ? null : quest.id)}
                            onMouseOver={(e) => {
                              e.currentTarget.parentElement!.style.background = "var(--bg-medium)";
                              e.currentTarget.parentElement!.style.borderColor = "var(--accent)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.parentElement!.style.background = "var(--bg-light)";
                              e.currentTarget.parentElement!.style.borderColor = "var(--border)";
                            }}
                          >
                            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                              <div>
                                <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--accent)" }}>{quest.name}</h3>
                                <p style={{ margin: "0 0 0.5rem 0", "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                                  {quest.description}
                                </p>
                                <div style={{ 
                                  display: "flex", 
                                  gap: "1rem", 
                                  "font-size": "0.75rem", 
                                  color: "var(--text-secondary)",
                                  "margin-top": "0.5rem"
                                }}>
                                  <span>Level {quest.min_level}+</span>
                                  <span>{isExpanded() ? '▼ Hide details' : '▶ Show details'}</span>
                                </div>
                              </div>
                              <div style={{ 
                                padding: "0.25rem 0.75rem", 
                                background: "rgba(34, 197, 94, 0.15)",
                                border: "1px solid var(--success)",
                                "border-radius": "0.25rem",
                                "font-size": "0.75rem",
                                "white-space": "nowrap",
                                color: "var(--success)"
                              }}>
                                In Progress
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          <Show when={isExpanded()}>
                            <div style={{ 
                              "margin-top": "1rem",
                              "padding-top": "1rem",
                              "border-top": "1px solid var(--border)"
                            }}>
                              <h4 style={{ "margin-bottom": "0.75rem", "font-size": "1rem" }}>Objectives:</h4>
                              <div style={{ "margin-bottom": "1rem" }}>
                                <For each={quest.objectives}>
                                  {(objective: QuestObjective) => (
                                    <div style={{ 
                                      padding: "0.75rem",
                                      background: objective.completed ? "rgba(34, 197, 94, 0.1)" : "var(--bg-medium)",
                                      border: `1px solid ${objective.completed ? 'var(--success)' : 'var(--border)'}`,
                                      "border-radius": "0.5rem",
                                      "margin-bottom": "0.5rem"
                                    }}>
                                      <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                                        <div>
                                          <div style={{ "font-size": "0.875rem", "margin-bottom": "0.25rem" }}>
                                            {objective.description}
                                          </div>
                                          <Show when={objective.type === 'kill'}>
                                            <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)" }}>
                                              Kill {objective.mob_name} 
                                              <Show when={objective.sub_area_name}>
                                                {" "}in {objective.sub_area_name}
                                              </Show>
                                            </div>
                                          </Show>
                                        </div>
                                        <div style={{ 
                                          "font-weight": "bold",
                                          color: objective.completed ? "var(--success)" : "var(--text-primary)"
                                        }}>
                                          {objective.current_count}/{objective.required_count}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </For>
                              </div>
                              
                              <Show when={quest.rewards && quest.rewards.length > 0}>
                                <h4 style={{ "margin-bottom": "0.75rem", "font-size": "1rem" }}>Rewards:</h4>
                                <div style={{ 
                                  padding: "0.75rem",
                                  background: "var(--bg-medium)",
                                  "border-radius": "0.5rem",
                                  "font-size": "0.875rem"
                                }}>
                                  <For each={quest.rewards}>
                                    {(reward: any) => (
                                      <div style={{ "margin-bottom": "0.25rem" }}>
                                        <Show when={reward.experience_reward}>
                                          • {reward.experience_reward} XP
                                        </Show>
                                        <Show when={reward.gold_reward}>
                                          • {reward.gold_reward} Gold
                                        </Show>
                                        <Show when={reward.item_name}>
                                          • {reward.item_name} {reward.reward_quantity > 1 ? `x${reward.reward_quantity}` : ''}
                                        </Show>
                                        <Show when={reward.material_name}>
                                          • {reward.material_name} {reward.reward_quantity > 1 ? `x${reward.reward_quantity}` : ''}
                                        </Show>
                                      </div>
                                    )}
                                  </For>
                                </div>
                              </Show>
                            </div>
                          </Show>
                        </div>
                      );
                    }}
                  </For>
                </Show>
              </Show>
            </Show>

            <Show when={selectedTab() === 'available'}>
              <Show 
                when={!availableQuests.loading && availableQuests()} 
                fallback={<div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>Loading quests...</div>}
              >
                <Show 
                  when={filteredAvailableQuests().length > 0}
                  fallback={
                    <div style={{ 
                      padding: "3rem 2rem", 
                      "text-align": "center", 
                      display: "flex",
                      "flex-direction": "column",
                      "align-items": "center",
                      gap: "1rem"
                    }}>
                      <div style={{ "font-size": "3rem" }}>🗺️</div>
                      <div>
                        <div style={{ "font-size": "1.125rem", "font-weight": "600", "margin-bottom": "0.5rem", color: "var(--text-primary)" }}>
                          No Available Quests
                        </div>
                        <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                          Check back later or explore other regions!
                        </div>
                      </div>
                    </div>
                  }
                >
                  <For each={filteredAvailableQuests()}>
                    {(quest: Quest) => (
                      <div 
                        class="quest-card"
                        style={{
                          padding: "1rem",
                          "margin-bottom": "0.75rem",
                          background: "var(--bg-light)",
                          border: "1px solid var(--border)",
                          "border-radius": "0.5rem",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "var(--bg-medium)";
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "var(--bg-light)";
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      >
                        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", "margin-bottom": "1rem" }}>
                          <div>
                            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--accent)" }}>{quest.name}</h3>
                            <p style={{ margin: "0 0 0.5rem 0", "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                              {quest.description}
                            </p>
                            <div style={{ 
                              display: "flex", 
                              gap: "1rem", 
                              "font-size": "0.75rem", 
                              color: "var(--text-secondary)",
                              "margin-top": "0.5rem"
                            }}>
                              <span>Level {quest.min_level}+</span>
                            </div>
                          </div>
                          <button 
                            class="button"
                            style={{ "white-space": "nowrap", "font-size": "0.875rem" }}
                            onClick={async () => {
                              try {
                                const charId = store.character?.id;
                                if (!charId) return;
                                
                                const response = await fetch('/api/game/quest/accept', {
                                  method: 'POST',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'x-character-id': charId.toString()
                                  },
                                  body: JSON.stringify({ 
                                    questId: quest.id
                                  })
                                });
                                
                                if (response.ok) {
                                  // Refresh quest lists
                                  refetchActive();
                                  refetchAvailable();
                                } else {
                                  const error = await response.json();
                                  console.error('Failed to accept quest:', error);
                                  alert(error.error || 'Failed to accept quest');
                                }
                              } catch (err) {
                                console.error('Failed to accept quest:', err);
                              }
                            }}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </Show>
            </Show>
          </div>
        </div>

        <div class="modal-footer">
          <button class="button secondary" onClick={props.onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
