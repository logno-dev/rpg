import { useParams, A } from "@solidjs/router";
import { createResource, Show, For } from "solid-js";
import WikiLayout from "~/components/WikiLayout";
import { db } from "~/lib/db";

async function fetchQuest(id: string) {
  "use server";
  
  const questId = parseInt(id);
  if (isNaN(questId)) {
    throw new Error("Invalid quest ID");
  }
  
  // Fetch quest details with region info
  const questResult = await db.execute({
    sql: `SELECT q.*, r.name as region_name 
          FROM quests q 
          JOIN regions r ON q.region_id = r.id 
          WHERE q.id = ?`,
    args: [questId]
  });
  
  if (questResult.rows.length === 0) {
    throw new Error("Quest not found");
  }
  
  // Fetch quest objectives
  const objectivesResult = await db.execute({
    sql: `SELECT qo.*, 
                 m.name as mob_name, 
                 cm.name as material_name,
                 sa.name as sub_area_name
          FROM quest_objectives qo
          LEFT JOIN mobs m ON qo.target_mob_id = m.id
          LEFT JOIN crafting_materials cm ON qo.target_item_id = cm.id
          LEFT JOIN sub_areas sa ON qo.target_sub_area_id = sa.id
          WHERE qo.quest_id = ?
          ORDER BY qo.objective_order ASC`,
    args: [questId]
  });
  
  // Fetch quest rewards
  const rewardsResult = await db.execute({
    sql: `SELECT qr.*, 
                 i.name as item_name,
                 cm.name as material_name
          FROM quest_rewards qr
          LEFT JOIN items i ON qr.reward_item_id = i.id
          LEFT JOIN crafting_materials cm ON qr.reward_material_id = cm.id
          WHERE qr.quest_id = ?`,
    args: [questId]
  });
  
  return {
    quest: questResult.rows[0] as any,
    objectives: objectivesResult.rows as any[],
    rewards: rewardsResult.rows as any[]
  };
}

export default function QuestDetailPage() {
  const params = useParams();
  const [data] = createResource(() => params.id, fetchQuest);

  return (
    <WikiLayout>
      <div>
        <div style={{ "margin-bottom": "1rem" }}>
          <A href="/wiki/quest" style={{ color: "var(--accent)" }}>
            ← Back to Quests
          </A>
        </div>

        <Show when={!data.loading} fallback={<div class="card">Loading quest details...</div>}>
          <Show when={!data.error} fallback={<div class="card">Error: {data.error?.message}</div>}>
            <Show when={data()}>
              {(questData) => (
                <div>
                  <h1>{questData().quest.name}</h1>
                  
                  <div class="card" style={{ "margin-bottom": "2rem" }}>
                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start", gap: "2rem", "flex-wrap": "wrap" }}>
                      <div style={{ flex: 1, "min-width": "300px" }}>
                        <h2 style={{ "margin-top": "0" }}>Quest Information</h2>
                        
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          <div>
                            <strong>Region:</strong> {questData().quest.region_name}
                          </div>
                          
                          <div>
                            <strong>Minimum Level:</strong> {questData().quest.min_level}
                          </div>
                          
                          <div>
                            <strong>Type:</strong> {questData().quest.repeatable ? "Repeatable" : "One-time"}
                          </div>
                          
                          {questData().quest.repeatable && questData().quest.cooldown_hours > 0 && (
                            <div>
                              <strong>Cooldown:</strong> {questData().quest.cooldown_hours} hours
                            </div>
                          )}
                          
                          {questData().quest.chain_id && (
                            <div>
                              <strong>Quest Chain:</strong> Part {questData().quest.chain_order || 1}
                            </div>
                          )}
                        </div>
                      </div>

                      {questData().quest.description && (
                        <div style={{ flex: 1, "min-width": "300px" }}>
                          <h2 style={{ "margin-top": "0" }}>Description</h2>
                          <p style={{ color: "var(--text-secondary)" }}>
                            {questData().quest.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Objectives */}
                  <Show when={questData().objectives && questData().objectives.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem" }}>
                      <h2>Objectives</h2>
                      <div style={{ display: "grid", gap: "1rem" }}>
                        <For each={questData().objectives}>
                          {(objective, index) => (
                            <div style={{ 
                              padding: "1rem", 
                              background: "var(--bg-light)", 
                              "border-radius": "6px",
                              "border-left": "4px solid var(--accent)"
                            }}>
                              <div style={{ "font-weight": "bold", "margin-bottom": "0.5rem" }}>
                                Objective {index() + 1}
                              </div>
                              
                              <div style={{ "margin-bottom": "0.5rem" }}>
                                {objective.description}
                              </div>
                              
                              <div style={{ display: "grid", gap: "0.25rem", "font-size": "0.9rem", color: "var(--text-secondary)" }}>
                                <div>
                                  <strong>Type:</strong> {objective.type}
                                </div>
                                
                                {objective.required_count > 1 && (
                                  <div>
                                    <strong>Required:</strong> {objective.required_count}
                                  </div>
                                )}
                                
                                {objective.mob_name && (
                                  <div>
                                    <strong>Target Mob:</strong> {objective.mob_name}
                                  </div>
                                )}
                                
                                {objective.material_name && (
                                  <div>
                                    <strong>Item:</strong> {objective.material_name}
                                  </div>
                                )}
                                
                                {objective.sub_area_name && (
                                  <div>
                                    <strong>Location:</strong> {objective.sub_area_name}
                                  </div>
                                )}
                                
                                {objective.auto_complete === 1 && (
                                  <div style={{ color: "var(--success)" }}>
                                    Auto-completes when count is reached
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Rewards */}
                  <Show when={questData().rewards && questData().rewards.length > 0}>
                    <div class="card" style={{ "margin-bottom": "2rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                      <h2 style={{ "margin-top": "0" }}>Rewards</h2>
                      <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <For each={questData().rewards}>
                          {(reward) => (
                            <div style={{ 
                              padding: "1rem", 
                              background: "var(--bg-dark)", 
                              "border-radius": "6px"
                            }}>
                              <div style={{ "font-weight": "bold", "margin-bottom": "0.5rem", "text-transform": "capitalize" }}>
                                {reward.reward_type}
                              </div>
                              
                              <div style={{ "font-size": "1.25rem", "font-weight": "bold", color: "var(--success)" }}>
                                {reward.reward_type === 'xp' && `${reward.reward_amount} XP`}
                                {reward.reward_type === 'gold' && `${reward.reward_amount} Gold`}
                                {reward.reward_type === 'item' && (
                                  <>
                                    <A href={`/wiki/equipment/${reward.reward_item_id}`} style={{ color: "var(--success)", "text-decoration": "underline" }}>
                                      {reward.item_name}
                                    </A>
                                    {reward.reward_amount > 1 && ` x${reward.reward_amount}`}
                                  </>
                                )}
                                {reward.reward_type === 'crafting_material' && (
                                  <>
                                    {reward.material_name}
                                    {reward.reward_amount > 1 && ` x${reward.reward_amount}`}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Tips */}
                  <div class="card" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                    <h3 style={{ "margin-top": "0" }}>Quest Tips</h3>
                    <ul style={{ "margin-bottom": "0" }}>
                      <li>Make sure you meet the minimum level requirement before attempting this quest</li>
                      {questData().objectives.some((o: any) => o.type === 'kill') && (
                        <li>Kill objectives track automatically - just defeat the required enemies</li>
                      )}
                      {questData().objectives.some((o: any) => o.type === 'collect') && (
                        <li>Collection items can be obtained from mob drops, crafting, or merchants</li>
                      )}
                      {questData().quest.repeatable && (
                        <li>This quest can be repeated - great for farming specific rewards!</li>
                      )}
                      {questData().quest.chain_id && (
                        <li>This quest is part of a chain - completing it may unlock the next quest</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </Show>
          </Show>
        </Show>
      </div>
    </WikiLayout>
  );
}
