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
  const [completionData, setCompletionData] = createSignal<any>(null);
  const [abandonConfirm, setAbandonConfirm] = createSignal<{ questId: number; questName: string } | null>(null);
  
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
          margin: 0,
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button in top right corner */}
        <button
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            width: "32px",
            height: "32px",
            "border-radius": "50%",
            background: "var(--bg-light)",
            border: "1px solid var(--text-secondary)",
            color: "var(--text)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            cursor: "pointer",
            "font-size": "1.25rem",
            "line-height": "1",
            padding: "0",
            transition: "all 0.2s ease",
            "z-index": 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger)";
            e.currentTarget.style.borderColor = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-light)";
            e.currentTarget.style.borderColor = "var(--text-secondary)";
          }}
          onClick={props.onClose}
        >
          ✕
        </button>

        <h2 style={{ "margin-bottom": "1.5rem", "padding-right": "2.5rem" }}>Quest Log</h2>
        
        <div>
          {/* Tab Navigation */}
          <div class="button-group" style={{ "margin-bottom": "1rem", "flex-direction": "row" }}>
            <button 
              class={`button ${selectedTab() === 'active' ? '' : 'secondary'}`}
              onClick={() => setSelectedTab('active')}
              style={{ flex: "1" }}
            >
              Active
            </button>
            <button 
              class={`button ${selectedTab() === 'available' ? '' : 'secondary'}`}
              onClick={() => setSelectedTab('available')}
              style={{ flex: "1" }}
            >
              Available
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
                            {/* Quest header with title and badge */}
                            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "0.75rem" }}>
                              <h3 style={{ margin: 0, color: "var(--accent)" }}>{quest.name}</h3>
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
                            
                            {/* Objectives spanning full width */}
                            <div style={{ "margin-bottom": "0.75rem" }}>
                              <For each={quest.objectives}>
                                {(objective: QuestObjective) => (
                                  <div style={{ 
                                    padding: "0.5rem",
                                    background: objective.completed ? "rgba(34, 197, 94, 0.1)" : "var(--bg-medium)",
                                    border: `1px solid ${objective.completed ? 'var(--success)' : 'var(--border)'}`,
                                    "border-radius": "0.375rem",
                                    "margin-bottom": "0.375rem",
                                    "font-size": "0.875rem"
                                  }}>
                                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                                      <div style={{ flex: 1 }}>
                                        {objective.description}
                                      </div>
                                      <div style={{ 
                                        "font-weight": "bold",
                                        "margin-left": "0.75rem",
                                        color: objective.completed ? "var(--success)" : "var(--text-primary)"
                                      }}>
                                        {objective.current_count}/{objective.required_count}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </For>
                            </div>
                            
                            {/* Footer info */}
                            <div style={{ 
                              display: "flex", 
                              gap: "1rem", 
                              "font-size": "0.75rem", 
                              color: "var(--text-secondary)"
                            }}>
                              <span>Level {quest.min_level}+</span>
                              <span>{isExpanded() ? '▼ Hide details' : '▶ Show details'}</span>
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          <Show when={isExpanded()}>
                            <div style={{ 
                              "margin-top": "1rem",
                              "padding-top": "1rem",
                              "border-top": "1px solid var(--border)"
                            }}>
                              {/* Show description in expanded details */}
                              <div style={{ 
                                "margin-bottom": "1rem",
                                padding: "0.75rem",
                                background: "var(--bg-medium)",
                                "border-radius": "0.5rem",
                                "font-size": "0.875rem",
                                color: "var(--text-secondary)"
                              }}>
                                {quest.description}
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
                                         <Show when={reward.reward_type === 'xp'}>
                                           • {reward.reward_amount} XP
                                         </Show>
                                         <Show when={reward.reward_type === 'gold'}>
                                           • {reward.reward_amount} Gold
                                         </Show>
                                         <Show when={reward.item_name}>
                                           • {reward.item_name} {reward.reward_amount > 1 ? `x${reward.reward_amount}` : ''}
                                         </Show>
                                         <Show when={reward.material_name}>
                                           • {reward.material_name} {reward.reward_amount > 1 ? `x${reward.reward_amount}` : ''}
                                         </Show>
                                       </div>
                                     )}
                                   </For>
                                 </div>
                               </Show>
                               
                               {/* Quest Actions */}
                               <div style={{ "margin-top": "1rem", display: "flex", gap: "0.5rem" }}>
                                 {/* Turn In Button - Show when all objectives complete */}
                                 <Show when={quest.objectives.every((obj: QuestObjective) => obj.completed)}>
                                   <button 
                                     class="button"
                                     style={{ flex: 1 }}
                                     onClick={async () => {
                                       try {
                                         const charId = store.character?.id;
                                         if (!charId) return;
                                         
                                         const response = await fetch('/api/game/quest/turnin', {
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
                                           const data = await response.json();
                                           
                                           // Show completion modal
                                           setCompletionData({
                                             questName: quest.name,
                                             rewards: data.rewards
                                           });
                                           
                                           // Refresh quest lists
                                           refetchActive();
                                           refetchAvailable();
                                         } else {
                                           const error = await response.json();
                                           alert(error.error || 'Failed to turn in quest');
                                         }
                                       } catch (err) {
                                         console.error('Failed to turn in quest:', err);
                                       }
                                     }}
                                   >
                                     ✓ Turn In Quest
                                   </button>
                                 </Show>
                                 
                                 {/* Abandon Button - Always available */}
                                 <button 
                                   class="button secondary"
                                   style={{ flex: 1 }}
                                   onClick={() => {
                                     setAbandonConfirm({ questId: quest.id, questName: quest.name });
                                   }}
                                 >
                                   ✕ Abandon Quest
                                 </button>
                               </div>
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
                    {(quest: Quest) => {
                      // Calculate cooldown remaining
                      const questAny = quest as any;
                      const isCompleted = questAny.character_status === 'completed';
                      const isOnCooldown = isCompleted && questAny.repeatable && questAny.last_completion_at && questAny.cooldown_hours;
                      let cooldownRemaining = 0;
                      
                      if (isOnCooldown) {
                        // Parse timestamp as UTC by appending 'Z' to force UTC interpretation
                        const lastCompletion = new Date(questAny.last_completion_at + 'Z').getTime();
                        const cooldownMs = questAny.cooldown_hours * 60 * 60 * 1000;
                        const now = Date.now();
                        const timeRemaining = (lastCompletion + cooldownMs) - now;
                        cooldownRemaining = Math.max(0, Math.ceil(timeRemaining / (60 * 60 * 1000))); // Hours remaining
                      }
                      
                      return (<div 
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
                          <div style={{ 
                            display: "flex", 
                            "flex-direction": "column",
                            gap: "1rem",
                            "margin-bottom": "1rem"
                          }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", "align-items": "center", gap: "0.5rem", "margin-bottom": "0.5rem" }}>
                              <h3 style={{ margin: 0, color: "var(--accent)" }}>{quest.name}</h3>
                              <Show when={isCompleted && cooldownRemaining > 0}>
                                <span style={{
                                  padding: "0.125rem 0.5rem",
                                  background: "rgba(59, 130, 246, 0.15)",
                                  border: "1px solid rgba(59, 130, 246, 0.5)",
                                  "border-radius": "0.25rem",
                                  "font-size": "0.625rem",
                                  "font-weight": "600",
                                  color: "rgba(59, 130, 246, 1)",
                                  "text-transform": "uppercase",
                                  "letter-spacing": "0.05em"
                                }}>
                                  Repeatable
                                </span>
                              </Show>
                            </div>
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
                              <Show when={isCompleted && cooldownRemaining > 0}>
                                <span style={{ color: "rgba(59, 130, 246, 1)" }}>⏱ Cooldown: {cooldownRemaining}h remaining</span>
                              </Show>
                            </div>
                            
                            {/* Rewards preview */}
                            <Show when={(quest as any).rewards && (quest as any).rewards.length > 0}>
                              <div style={{
                                "margin-top": "0.75rem",
                                padding: "0.5rem",
                                background: "var(--bg-medium)",
                                "border-radius": "0.375rem",
                                "font-size": "0.75rem"
                              }}>
                                <div style={{ "font-weight": "600", "margin-bottom": "0.25rem", color: "var(--text-primary)" }}>
                                  Rewards:
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem", "flex-wrap": "wrap" }}>
                                  <For each={(quest as any).rewards}>
                                    {(reward: any) => (
                                      <>
                                        <Show when={reward.reward_type === 'xp'}>
                                          <span style={{ color: "var(--success)" }}>+{reward.reward_amount} XP</span>
                                        </Show>
                                         <Show when={reward.reward_type === 'gold'}>
                                           <span style={{ color: "#fbbf24" }}>+{reward.reward_amount} Gold</span>
                                         </Show>
                                         <Show when={reward.reward_type === 'item' && reward.item_name}>
                                           <span style={{ color: "var(--accent)" }}>{reward.item_name} x{reward.reward_amount}</span>
                                         </Show>
                                         <Show when={reward.reward_type === 'crafting_material' && reward.material_name}>
                                           <span style={{ color: "var(--accent)" }}>{reward.material_name} x{reward.reward_amount}</span>
                                         </Show>
                                      </>
                                    )}
                                  </For>
                                </div>
                              </div>
                            </Show>
                          </div>
                          <button 
                            class="button"
                            style={{ 
                              "white-space": "nowrap", 
                              "font-size": "0.875rem",
                              width: "100%"
                            }}
                            disabled={cooldownRemaining > 0}
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
                            {cooldownRemaining > 0 ? `Cooldown: ${cooldownRemaining}h` : 'Accept'}
                          </button>
                        </div>
                      </div>
                      );
                    }}
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
      
      {/* Quest Completion Modal */}
      <Show when={completionData()}>
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0, 0, 0, 0.9)", 
            display: "flex", 
            "align-items": "center", 
            "justify-content": "center",
            "z-index": 1001,
            padding: "1rem"
          }}
          onClick={() => setCompletionData(null)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "500px",
              width: "100%",
              "text-align": "center",
              margin: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ "font-size": "3rem", "margin-bottom": "1rem" }}>✨</div>
            <h2 style={{ "margin-bottom": "0.5rem", color: "var(--success)" }}>Quest Complete!</h2>
            <h3 style={{ "margin-bottom": "1.5rem", color: "var(--text-secondary)", "font-weight": "normal" }}>
              {completionData()?.questName}
            </h3>
            
            <div style={{ 
              "margin-bottom": "1.5rem",
              padding: "1rem",
              background: "var(--bg-light)",
              "border-radius": "0.5rem"
            }}>
              <h4 style={{ "margin-bottom": "0.75rem", "font-size": "1rem", color: "var(--text-primary)" }}>
                Rewards Received:
              </h4>
              <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
                <Show when={completionData()?.rewards?.xp}>
                  <div style={{ 
                    padding: "0.5rem",
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid var(--success)",
                    "border-radius": "0.375rem",
                    "font-weight": "600",
                    color: "var(--success)"
                  }}>
                    +{completionData()?.rewards?.xp} Experience
                  </div>
                </Show>
                <Show when={completionData()?.rewards?.gold}>
                  <div style={{ 
                    padding: "0.5rem",
                    background: "rgba(251, 191, 36, 0.15)",
                    border: "1px solid #fbbf24",
                    "border-radius": "0.375rem",
                    "font-weight": "600",
                    color: "#fbbf24"
                  }}>
                    +{completionData()?.rewards?.gold} Gold
                  </div>
                </Show>
                <Show when={completionData()?.rewards?.items?.length > 0}>
                  <For each={completionData()?.rewards?.items}>
                    {(item: any) => (
                      <div style={{ 
                        padding: "0.5rem",
                        background: "var(--bg-medium)",
                        border: "1px solid var(--border)",
                        "border-radius": "0.375rem",
                        color: "var(--text-primary)"
                      }}>
                        {item.name || 'Item'} x{item.quantity}
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={completionData()?.rewards?.materials?.length > 0}>
                  <For each={completionData()?.rewards?.materials}>
                    {(mat: any) => (
                      <div style={{ 
                        padding: "0.5rem",
                        background: "var(--bg-medium)",
                        border: "1px solid var(--border)",
                        "border-radius": "0.375rem",
                        color: "var(--text-primary)"
                      }}>
                        {mat.name || 'Material'} x{mat.quantity}
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
            
            <button 
              class="button"
              style={{ width: "100%" }}
              onClick={() => setCompletionData(null)}
            >
              Continue
            </button>
          </div>
        </div>
      </Show>
      
      {/* Quest Abandon Confirmation Modal */}
      <Show when={abandonConfirm()}>
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0, 0, 0, 0.9)", 
            display: "flex", 
            "align-items": "center", 
            "justify-content": "center",
            "z-index": 1001,
            padding: "1rem"
          }}
          onClick={() => setAbandonConfirm(null)}
        >
          <div 
            class="card"
            style={{ 
              "max-width": "500px",
              width: "100%",
              margin: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ "font-size": "3rem", "text-align": "center", "margin-bottom": "1rem" }}>⚠️</div>
            <h2 style={{ "margin-bottom": "0.5rem", color: "var(--warning)", "text-align": "center" }}>
              Abandon Quest?
            </h2>
            <h3 style={{ 
              "margin-bottom": "1.5rem", 
              color: "var(--text-secondary)", 
              "font-weight": "normal",
              "text-align": "center"
            }}>
              {abandonConfirm()?.questName}
            </h3>
            
            <div style={{ 
              "margin-bottom": "1.5rem",
              padding: "1rem",
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid var(--warning)",
              "border-radius": "0.5rem",
              "text-align": "center"
            }}>
              <p style={{ margin: 0, color: "var(--text-primary)" }}>
                All quest progress will be lost. Quest items will be removed from your inventory.
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                class="button secondary"
                style={{ flex: 1 }}
                onClick={() => setAbandonConfirm(null)}
              >
                Cancel
              </button>
              <button 
                class="button"
                style={{ 
                  flex: 1,
                  background: "var(--danger)",
                  "border-color": "var(--danger)"
                }}
                onClick={async () => {
                  const confirm = abandonConfirm();
                  if (!confirm) return;
                  
                  try {
                    const charId = store.character?.id;
                    if (!charId) return;
                    
                    const response = await fetch('/api/game/quest/abandon', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'x-character-id': charId.toString()
                      },
                      body: JSON.stringify({ 
                        questId: confirm.questId
                      })
                    });
                    
                    if (response.ok) {
                      // Close modal
                      setAbandonConfirm(null);
                      // Refresh quest lists
                      refetchActive();
                      refetchAvailable();
                    } else {
                      const error = await response.json();
                      alert(error.error || 'Failed to abandon quest');
                      setAbandonConfirm(null);
                    }
                  } catch (err) {
                    console.error('Failed to abandon quest:', err);
                    setAbandonConfirm(null);
                  }
                }}
              >
                Abandon Quest
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
