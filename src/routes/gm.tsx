import { createSignal, Show, For, onMount } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { getUser } from "~/lib/auth";
import { isGM, getAllPlayers, getAllMobs, getAllItems, getAllRegions, getAllAbilities, getAllMerchants, updateMob, deleteMob, createMob, updateItem, deleteItem, createItem, getAllMobLoot, getAllRegionRareLoot, createMobLoot, updateMobLoot, deleteMobLoot, createRegionRareLoot, updateRegionRareLoot, deleteRegionRareLoot, createAbility, updateAbility, deleteAbility } from "~/lib/gm";

export default function GMPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = createSignal<string>("players");
  const [loading, setLoading] = createSignal(true);
  const [authorized, setAuthorized] = createSignal(false);
  
  const [players, setPlayers] = createSignal<any[]>([]);
  const [mobs, setMobs] = createSignal<any[]>([]);
  const [items, setItems] = createSignal<any[]>([]);
  const [regions, setRegions] = createSignal<any[]>([]);
  const [abilities, setAbilities] = createSignal<any[]>([]);
  const [merchants, setMerchants] = createSignal<any[]>([]);
  const [mobLoot, setMobLoot] = createSignal<any[]>([]);
  const [regionRareLoot, setRegionRareLoot] = createSignal<any[]>([]);
  
  // Edit modal state
  const [editingMob, setEditingMob] = createSignal<any | null>(null);
  const [editingItem, setEditingItem] = createSignal<any | null>(null);
  const [editingMobLoot, setEditingMobLoot] = createSignal<any | null>(null);
  const [editingRegionLoot, setEditingRegionLoot] = createSignal<any | null>(null);
  const [editingAbility, setEditingAbility] = createSignal<any | null>(null);
  const [showMobModal, setShowMobModal] = createSignal(false);
  const [showItemModal, setShowItemModal] = createSignal(false);
  const [showMobLootModal, setShowMobLootModal] = createSignal(false);
  const [showRegionLootModal, setShowRegionLootModal] = createSignal(false);
  const [showAbilityModal, setShowAbilityModal] = createSignal(false);
  const [calcLevel, setCalcLevel] = createSignal(1);
  const [selectedMobForLoot, setSelectedMobForLoot] = createSignal<number | null>(null);
  const [selectedRegionForLoot, setSelectedRegionForLoot] = createSignal<number | null>(null);
  
  // Helper to check if XP is balanced
  const getXPStatus = (mobLevel: number, xp: number) => {
    const xpNeeded = mobLevel * 125;
    const recommended = Math.ceil(xpNeeded / 10); // 10 kills per level (medium)
    const min = Math.ceil(xpNeeded / 15); // 15 kills per level (slow)
    const max = Math.ceil(xpNeeded / 5); // 5 kills per level (fast)
    
    if (xp < min) return { status: 'low', color: 'var(--danger)', text: `Low (${Math.ceil(xpNeeded / xp)} kills/lvl)` };
    if (xp > max) return { status: 'high', color: 'var(--warning)', text: `High (${Math.ceil(xpNeeded / xp)} kills/lvl)` };
    return { status: 'good', color: 'var(--success)', text: `Good (${Math.ceil(xpNeeded / xp)} kills/lvl)` };
  };
  
  // Helper to reload data
  const reloadMobs = async () => {
    const mobsData = await getAllMobs();
    setMobs(mobsData as any);
  };
  
  const reloadItems = async () => {
    const itemsData = await getAllItems();
    setItems(itemsData as any);
  };
  
  const reloadMobLoot = async () => {
    const lootData = await getAllMobLoot();
    setMobLoot(lootData as any);
  };
  
  const reloadRegionLoot = async () => {
    const lootData = await getAllRegionRareLoot();
    setRegionRareLoot(lootData as any);
  };
  
  const reloadAbilities = async () => {
    const abilitiesData = await getAllAbilities();
    setAbilities(abilitiesData as any);
  };
  
  // Handle mob edit/delete
  const handleEditMob = (mob: any) => {
    setEditingMob(mob);
    setShowMobModal(true);
  };
  
  const handleDeleteMob = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mob?')) return;
    try {
      await deleteMob(id);
      await reloadMobs();
    } catch (err) {
      console.error('Error deleting mob:', err);
      alert('Failed to delete mob');
    }
  };
  
  const handleSaveMob = async (e: Event) => {
    e.preventDefault();
    const mob = editingMob();
    if (!mob) return;
    
    try {
      if (mob.id) {
        await updateMob(mob.id, mob);
      } else {
        await createMob(mob);
      }
      setShowMobModal(false);
      setEditingMob(null);
      await reloadMobs();
    } catch (err) {
      console.error('Error saving mob:', err);
      alert('Failed to save mob');
    }
  };
  
  // Handle item edit/delete
  const handleEditItem = (item: any) => {
    setEditingItem({...item});
    setShowItemModal(true);
  };
  
  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      await reloadItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };
  
  const handleSaveItem = async (e: Event) => {
    e.preventDefault();
    const item = editingItem();
    if (!item) return;
    
    try {
      if (item.id) {
        await updateItem(item.id, item);
      } else {
        await createItem(item);
      }
      setShowItemModal(false);
      setEditingItem(null);
      await reloadItems();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item');
    }
  };
  
  // Handle mob loot edit/delete
  const handleEditMobLoot = (loot: any) => {
    setEditingMobLoot(loot);
    setShowMobLootModal(true);
  };
  
  const handleDeleteMobLoot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this loot entry?')) return;
    try {
      await deleteMobLoot(id);
      await reloadMobLoot();
    } catch (err) {
      console.error('Error deleting loot:', err);
      alert('Failed to delete loot');
    }
  };
  
  const handleSaveMobLoot = async (e: Event) => {
    e.preventDefault();
    const loot = editingMobLoot();
    if (!loot) return;
    
    try {
      if (loot.id) {
        await updateMobLoot(loot.id, loot);
      } else {
        await createMobLoot(loot);
      }
      setShowMobLootModal(false);
      setEditingMobLoot(null);
      await reloadMobLoot();
    } catch (err) {
      console.error('Error saving loot:', err);
      alert('Failed to save loot');
    }
  };
  
  // Handle region rare loot edit/delete
  const handleEditRegionLoot = (loot: any) => {
    setEditingRegionLoot(loot);
    setShowRegionLootModal(true);
  };
  
  const handleDeleteRegionLoot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rare loot entry?')) return;
    try {
      await deleteRegionRareLoot(id);
      await reloadRegionLoot();
    } catch (err) {
      console.error('Error deleting rare loot:', err);
      alert('Failed to delete rare loot');
    }
  };
  
  const handleSaveRegionLoot = async (e: Event) => {
    e.preventDefault();
    const loot = editingRegionLoot();
    if (!loot) return;
    
    try {
      if (loot.id) {
        await updateRegionRareLoot(loot.id, loot);
      } else {
        await createRegionRareLoot(loot);
      }
      setShowRegionLootModal(false);
      setEditingRegionLoot(null);
      await reloadRegionLoot();
    } catch (err) {
      console.error('Error saving rare loot:', err);
      alert('Failed to save rare loot');
    }
  };
  
  // Handle ability edit/delete
  const handleEditAbility = (ability: any) => {
    setEditingAbility({...ability});
    setShowAbilityModal(true);
  };
  
  const handleDeleteAbility = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ability?')) return;
    try {
      await deleteAbility(id);
      await reloadAbilities();
    } catch (err) {
      console.error('Error deleting ability:', err);
      alert('Failed to delete ability');
    }
  };
  
  const handleSaveAbility = async (e: Event) => {
    e.preventDefault();
    const ability = editingAbility();
    if (!ability) return;
    
    try {
      if (ability.id) {
        await updateAbility(ability.id, ability);
      } else {
        await createAbility(ability);
      }
      setShowAbilityModal(false);
      setEditingAbility(null);
      await reloadAbilities();
    } catch (err) {
      console.error('Error saving ability:', err);
      alert('Failed to save ability');
    }
  };
  
  onMount(async () => {
    try {
      // Check if user is logged in
      const user = await getUser();
      if (!user) {
        navigate("/");
        return;
      }
      
      // Check if user is GM
      const gmStatus = await isGM();
      if (!gmStatus) {
        navigate("/");
        return;
      }
      
      // User is authorized, load data
      setAuthorized(true);
      
      const [playersData, mobsData, itemsData, regionsData, abilitiesData, merchantsData, mobLootData, regionLootData] = await Promise.all([
        getAllPlayers(),
        getAllMobs(),
        getAllItems(),
        getAllRegions(),
        getAllAbilities(),
        getAllMerchants(),
        getAllMobLoot(),
        getAllRegionRareLoot(),
      ]);
      
      setPlayers(playersData as any);
      setMobs(mobsData as any);
      setItems(itemsData as any);
      setRegions(regionsData as any);
      setAbilities(abilitiesData as any);
      setMerchants(merchantsData as any);
      setMobLoot(mobLootData as any);
      setRegionRareLoot(regionLootData as any);
    } catch (err) {
      console.error('GM page error:', err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  });
  
  return (
    <div style={{ padding: "2rem", "max-width": "1400px", margin: "0 auto" }}>
      <Show when={loading()}>
        <div class="card">
          <p>Loading GM Panel...</p>
        </div>
      </Show>
      <Show when={!loading() && authorized()}>
        <div>
          <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "2rem" }}>
            <h1>Game Master Control Panel</h1>
            <A href="/" class="button secondary">Back to Game</A>
          </div>
          
          {/* Tabs */}
          <div style={{ 
            display: "flex", 
            gap: "0.5rem", 
            "margin-bottom": "2rem", 
            "flex-wrap": "wrap",
            "border-bottom": "2px solid var(--bg-light)",
            "padding-bottom": "0.5rem"
          }}>
            <button
              class={activeTab() === "players" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("players")}
            >
              Players
            </button>
            <button
              class={activeTab() === "mobs" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("mobs")}
            >
              Mobs
            </button>
            <button
              class={activeTab() === "items" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("items")}
            >
              Items
            </button>
            <button
              class={activeTab() === "abilities" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("abilities")}
            >
              Abilities
            </button>
            <button
              class={activeTab() === "regions" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("regions")}
            >
              Regions
            </button>
            <button
              class={activeTab() === "merchants" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("merchants")}
            >
              Merchants
            </button>
            <button
              class={activeTab() === "loot" ? "button primary" : "button secondary"}
              onClick={() => setActiveTab("loot")}
            >
              Loot Tables
            </button>
          </div>
          
          {/* Players Tab */}
          <Show when={activeTab() === "players"}>
            <div class="card">
              <h2>Players</h2>
              <Show when={players()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>User</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Character</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Level</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Gold</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>HP</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Mana</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Region</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>GM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={players()}>
                        {(player: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{player.username}</td>
                            <td style={{ padding: "0.5rem" }}>{player.character_name || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{player.level || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{player.gold || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              {player.current_health ? `${player.current_health}/${player.max_health}` : "-"}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              {player.current_mana ? `${player.current_mana}/${player.max_mana}` : "-"}
                            </td>
                            <td style={{ padding: "0.5rem" }}>{player.current_region || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              {player.is_gm ? "✓" : ""}
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Mobs Tab */}
          <Show when={activeTab() === "mobs"}>
            <div class="card" style={{ "margin-bottom": "1rem" }}>
              <h3 style={{ "margin-bottom": "1rem" }}>Experience Calculator</h3>
              <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", "margin-bottom": "1rem" }}>
                <div style={{ padding: "0.75rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>XP Formula</div>
                  <div style={{ "font-weight": "bold" }}>Level × 125</div>
                </div>
                <div style={{ padding: "0.75rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Stat Points/Level</div>
                  <div style={{ "font-weight": "bold" }}>3 points</div>
                </div>
                <div style={{ padding: "0.75rem", background: "var(--bg-light)", "border-radius": "4px" }}>
                  <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Death Penalty</div>
                  <div style={{ "font-weight": "bold" }}>-25% XP, -10% Gold</div>
                </div>
              </div>
              <div style={{ padding: "1rem", background: "var(--bg-light)", "border-radius": "8px" }}>
                <h4 style={{ "margin-bottom": "1rem" }}>XP Calculator</h4>
                <div style={{ display: "grid", "grid-template-columns": "200px 1fr", gap: "1rem", "align-items": "start" }}>
                  <div>
                    <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Character Level</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={calcLevel()} 
                      onInput={(e) => setCalcLevel(parseInt(e.currentTarget.value) || 1)}
                      style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                    />
                  </div>
                  <div>
                    <div style={{ "margin-bottom": "0.5rem" }}>
                      <strong>XP Needed for Level {calcLevel()} → {calcLevel() + 1}:</strong> {calcLevel() * 125} XP
                    </div>
                    <div style={{ display: "grid", "grid-template-columns": "repeat(3, 1fr)", gap: "1rem", "margin-top": "1rem" }}>
                      <div style={{ padding: "1rem", background: "var(--bg-dark)", "border-radius": "4px", border: "2px solid var(--warning)" }}>
                        <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Fast (5 kills)</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--warning)" }}>{Math.ceil((calcLevel() * 125) / 5)} XP</div>
                        <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>per mob</div>
                      </div>
                      <div style={{ padding: "1rem", background: "var(--bg-dark)", "border-radius": "4px", border: "2px solid var(--success)" }}>
                        <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Medium (10 kills)</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--success)" }}>{Math.ceil((calcLevel() * 125) / 10)} XP</div>
                        <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>per mob</div>
                      </div>
                      <div style={{ padding: "1rem", background: "var(--bg-dark)", "border-radius": "4px", border: "2px solid var(--accent)" }}>
                        <div style={{ "font-size": "0.85rem", color: "var(--text-secondary)", "margin-bottom": "0.25rem" }}>Slow (15 kills)</div>
                        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "var(--accent)" }}>{Math.ceil((calcLevel() * 125) / 15)} XP</div>
                        <div style={{ "font-size": "0.75rem", color: "var(--text-secondary)", "margin-top": "0.25rem" }}>per mob</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Mobs</h2>
                <button class="button primary" onClick={() => {
                  setEditingMob({
                    name: '', level: 1, area: '', max_health: 100,
                    attack: 10, defense: 5, experience: 10,
                    gold_min: 1, gold_max: 5, attack_speed: 1.0, region_id: 1
                  });
                  setShowMobModal(true);
                }}>
                  Add Mob
                </button>
              </div>
              <Show when={mobs()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>HP</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Atk</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Def</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>XP</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Gold</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Region</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={mobs()}>
                        {(mob: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{mob.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{mob.level}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{mob.max_health}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{mob.attack}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{mob.defense}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>
                              <div style={{ display: "flex", "align-items": "center", "justify-content": "flex-end", gap: "0.5rem" }}>
                                <span>{mob.experience}</span>
                                <span style={{ 
                                  "font-size": "0.7rem", 
                                  padding: "0.1rem 0.3rem", 
                                  "border-radius": "3px",
                                  background: getXPStatus(mob.level, mob.experience).color,
                                  color: "#fff"
                                }} title={getXPStatus(mob.level, mob.experience).text}>
                                  {getXPStatus(mob.level, mob.experience).status === 'low' ? '↓' : 
                                   getXPStatus(mob.level, mob.experience).status === 'high' ? '↑' : '✓'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>
                              {mob.gold_min}-{mob.gold_max}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{mob.region_id || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button secondary" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                onClick={() => handleEditMob(mob)}
                              >
                                Edit
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleDeleteMob(mob.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Items Tab */}
          <Show when={activeTab() === "items"}>
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Items ({items()?.length || 0})</h2>
                <button class="button primary" onClick={() => {
                  setEditingItem({
                    name: '', description: '', type: 'weapon', slot: 'weapon',
                    rarity: 'common', level: 1, value: 1, damage: 0, armor: 0,
                    strength_bonus: 0, dexterity_bonus: 0, constitution_bonus: 0,
                    intelligence_bonus: 0, wisdom_bonus: 0, charisma_bonus: 0,
                    attack_speed: 1.0, stackable: 0
                  });
                  setShowItemModal(true);
                }}>
                  Add Item
                </button>
              </div>
              <Show when={items()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.85rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Value</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Dmg</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Armor</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Stats</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={items()}>
                        {(item: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{item.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{item.type}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{item.level}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{item.value}g</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{item.damage || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{item.armor || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center", "font-size": "0.75rem" }}>
                              {[
                                item.strength_bonus ? `STR+${item.strength_bonus}` : null,
                                item.dexterity_bonus ? `DEX+${item.dexterity_bonus}` : null,
                                item.constitution_bonus ? `CON+${item.constitution_bonus}` : null,
                                item.intelligence_bonus ? `INT+${item.intelligence_bonus}` : null,
                                item.wisdom_bonus ? `WIS+${item.wisdom_bonus}` : null,
                                item.charisma_bonus ? `CHA+${item.charisma_bonus}` : null,
                              ].filter(Boolean).join(", ") || "-"}
                            </td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button secondary" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                onClick={() => handleEditItem(item)}
                              >
                                Edit
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Abilities Tab */}
          <Show when={activeTab() === "abilities"}>
            <div class="card">
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
                <h2>Abilities ({abilities()?.length || 0})</h2>
                <button class="button primary" onClick={() => {
                  setEditingAbility({
                    name: '', description: '', type: 'damage', category: 'combat',
                    required_level: 1, mana_cost: 0, cooldown: 0, primary_stat: null
                  });
                  setShowAbilityModal(true);
                }}>
                  Add Ability
                </button>
              </div>
              <Show when={abilities()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Category</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Lvl Req</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Mana</th>
                        <th style={{ padding: "0.5rem", "text-align": "right" }}>Cooldown</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Primary Stat</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={abilities()}>
                        {(ability: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{ability.name}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.type}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.category}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.required_level}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{ability.mana_cost || 0}</td>
                            <td style={{ padding: "0.5rem", "text-align": "right" }}>{ability.cooldown}s</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{ability.primary_stat || "-"}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>
                              <button 
                                class="button secondary" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                onClick={() => handleEditAbility(ability)}
                              >
                                Edit
                              </button>
                              <button 
                                class="button" 
                                style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                onClick={() => handleDeleteAbility(ability.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Regions Tab */}
          <Show when={activeTab() === "regions"}>
            <div class="card">
              <h2>Regions</h2>
              <Show when={regions()}>
                <div style={{ display: "grid", gap: "1rem", overflow: "auto", "max-height": "600px" }}>
                  <For each={regions()}>
                    {(region: any) => (
                      <div style={{ 
                        padding: "1rem", 
                        background: "var(--bg-light)", 
                        "border-radius": "8px",
                        border: "2px solid var(--accent)"
                      }}>
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>{region.name}</h3>
                        <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-secondary)" }}>
                          {region.description}
                        </p>
                        <div style={{ display: "flex", gap: "2rem", "font-size": "0.9rem" }}>
                          <div>
                            <strong>Level Range:</strong> {region.min_level}-{region.max_level}
                          </div>
                          <div>
                            <strong>Unlock Requirement:</strong> {region.unlock_requirement || "None"}
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Loot Tables Tab */}
          <Show when={activeTab() === "loot"}>
            <div class="card" style={{ "margin-bottom": "1rem" }}>
              <h2 style={{ "margin-bottom": "1rem" }}>Mob Loot Tables</h2>
              <div style={{ display: "grid", "grid-template-columns": "1fr auto", gap: "1rem", "margin-bottom": "1rem", "align-items": "end" }}>
                <div>
                  <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Select Mob</label>
                  <select 
                    value={selectedMobForLoot() || ''} 
                    onChange={(e) => setSelectedMobForLoot(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                    style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                  >
                    <option value="">-- Select a mob to edit loot --</option>
                    <For each={mobs().sort((a: any, b: any) => a.level - b.level || a.name.localeCompare(b.name))}>
                      {(mob: any) => (
                        <option value={mob.id}>
                          {mob.name} (Lvl {mob.level}) - {mobLoot().filter((l: any) => l.mob_id === mob.id).length} items
                        </option>
                      )}
                    </For>
                  </select>
                </div>
                <Show when={selectedMobForLoot()}>
                  <button class="button primary" onClick={() => {
                    setEditingMobLoot({
                      mob_id: selectedMobForLoot()!,
                      item_id: items()[0]?.id || 1,
                      drop_chance: 0.1,
                      min_quantity: 1,
                      max_quantity: 1
                    });
                    setShowMobLootModal(true);
                  }}>
                    Add Item to Loot Table
                  </button>
                </Show>
              </div>
              
              <Show when={selectedMobForLoot()}>
                <Show 
                  when={mobLoot().filter((l: any) => l.mob_id === selectedMobForLoot()).length > 0}
                  fallback={
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      <p>This mob has no loot configured.</p>
                      <p style={{ "font-size": "0.9rem", "margin-top": "0.5rem" }}>Click "Add Item to Loot Table" to add drops.</p>
                    </div>
                  }
                >
                  <div style={{ overflow: "auto", "max-height": "600px" }}>
                    <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                        <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                          <th style={{ padding: "0.5rem", "text-align": "left" }}>Item</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Rarity</th>
                          <th style={{ padding: "0.5rem", "text-align": "right" }}>Drop %</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Quantity</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={mobLoot().filter((l: any) => l.mob_id === selectedMobForLoot())}>
                          {(loot: any) => (
                            <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                              <td style={{ padding: "0.5rem" }}>{loot.item_name}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{loot.item_type}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <span style={{ 
                                  padding: "0.2rem 0.4rem", 
                                  "border-radius": "3px",
                                  background: loot.item_rarity === 'legendary' ? 'var(--legendary)' :
                                             loot.item_rarity === 'epic' ? 'var(--epic)' :
                                             loot.item_rarity === 'rare' ? 'var(--rare)' :
                                             loot.item_rarity === 'uncommon' ? 'var(--uncommon)' :
                                             'var(--common)',
                                  color: '#fff',
                                  "font-size": "0.75rem"
                                }}>
                                  {loot.item_rarity}
                                </span>
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "right" }}>
                                {(loot.drop_chance * 100).toFixed(1)}%
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                {loot.min_quantity === loot.max_quantity ? loot.min_quantity : `${loot.min_quantity}-${loot.max_quantity}`}
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <button 
                                  class="button secondary" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                  onClick={() => handleEditMobLoot(loot)}
                                >
                                  Edit
                                </button>
                                <button 
                                  class="button" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                  onClick={() => handleDeleteMobLoot(loot.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </Show>
              
              <Show when={!selectedMobForLoot()}>
                <div style={{ padding: "3rem", "text-align": "center", color: "var(--text-secondary)" }}>
                  <p style={{ "font-size": "1.1rem" }}>Select a mob from the dropdown above to view and edit its loot table.</p>
                </div>
              </Show>
            </div>
            
            <div class="card">
              <h2 style={{ "margin-bottom": "1rem" }}>Region Rare Loot</h2>
              <div style={{ display: "grid", "grid-template-columns": "1fr auto", gap: "1rem", "margin-bottom": "1rem", "align-items": "end" }}>
                <div>
                  <label style={{ display: "block", "margin-bottom": "0.5rem", "font-weight": "bold" }}>Select Region</label>
                  <select 
                    value={selectedRegionForLoot() || ''} 
                    onChange={(e) => setSelectedRegionForLoot(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                    style={{ width: "100%", padding: "0.5rem", "font-size": "1rem" }}
                  >
                    <option value="">-- Select a region to edit rare loot --</option>
                    <For each={regions()}>
                      {(region: any) => (
                        <option value={region.id}>
                          {region.name} - {regionRareLoot().filter((l: any) => l.region_id === region.id).length} rare items
                        </option>
                      )}
                    </For>
                  </select>
                </div>
                <Show when={selectedRegionForLoot()}>
                  <button class="button primary" onClick={() => {
                    setEditingRegionLoot({
                      region_id: selectedRegionForLoot()!,
                      item_id: items()[0]?.id || 1,
                      drop_chance: 0.001,
                      min_level: 1
                    });
                    setShowRegionLootModal(true);
                  }}>
                    Add Rare Item
                  </button>
                </Show>
              </div>
              
              <Show when={selectedRegionForLoot()}>
                <Show 
                  when={regionRareLoot().filter((l: any) => l.region_id === selectedRegionForLoot()).length > 0}
                  fallback={
                    <div style={{ padding: "2rem", "text-align": "center", color: "var(--text-secondary)" }}>
                      <p>This region has no rare loot configured.</p>
                      <p style={{ "font-size": "0.9rem", "margin-top": "0.5rem" }}>Click "Add Rare Item" to add region-wide rare drops.</p>
                    </div>
                  }
                >
                  <div style={{ overflow: "auto", "max-height": "600px" }}>
                    <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.9rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                        <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                          <th style={{ padding: "0.5rem", "text-align": "left" }}>Item</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Type</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Rarity</th>
                          <th style={{ padding: "0.5rem", "text-align": "right" }}>Drop %</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Min Level</th>
                          <th style={{ padding: "0.5rem", "text-align": "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={regionRareLoot().filter((l: any) => l.region_id === selectedRegionForLoot())}>
                          {(loot: any) => (
                            <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                              <td style={{ padding: "0.5rem" }}>{loot.item_name}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{loot.item_type}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <span style={{ 
                                  padding: "0.2rem 0.4rem", 
                                  "border-radius": "3px",
                                  background: loot.item_rarity === 'legendary' ? 'var(--legendary)' :
                                             loot.item_rarity === 'epic' ? 'var(--epic)' :
                                             loot.item_rarity === 'rare' ? 'var(--rare)' :
                                             loot.item_rarity === 'uncommon' ? 'var(--uncommon)' :
                                             'var(--common)',
                                  color: '#fff',
                                  "font-size": "0.75rem"
                                }}>
                                  {loot.item_rarity}
                                </span>
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "right" }}>
                                {(loot.drop_chance * 100).toFixed(3)}%
                              </td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>{loot.min_level}</td>
                              <td style={{ padding: "0.5rem", "text-align": "center" }}>
                                <button 
                                  class="button secondary" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", "margin-right": "0.25rem" }}
                                  onClick={() => handleEditRegionLoot(loot)}
                                >
                                  Edit
                                </button>
                                <button 
                                  class="button" 
                                  style={{ padding: "0.25rem 0.5rem", "font-size": "0.8rem", background: "var(--danger)" }}
                                  onClick={() => handleDeleteRegionLoot(loot.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                      </table>
                  </div>
                </Show>
              </Show>
              
              <Show when={!selectedRegionForLoot()}>
                <div style={{ padding: "3rem", "text-align": "center", color: "var(--text-secondary)" }}>
                  <p style={{ "font-size": "1.1rem" }}>Select a region from the dropdown above to view and edit its rare loot.</p>
                </div>
              </Show>
            </div>
          </Show>
          
          {/* Merchants Tab */}
          <Show when={activeTab() === "merchants"}>
            <div class="card">
              <h2>Merchants</h2>
              <Show when={merchants()}>
                <div style={{ overflow: "auto", "max-height": "600px" }}>
                  <table style={{ width: "100%", "border-collapse": "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)" }}>
                      <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Name</th>
                        <th style={{ padding: "0.5rem", "text-align": "left" }}>Description</th>
                        <th style={{ padding: "0.5rem", "text-align": "center" }}>Region</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={merchants()}>
                        {(merchant: any) => (
                          <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                            <td style={{ padding: "0.5rem" }}>{merchant.name}</td>
                            <td style={{ padding: "0.5rem" }}>{merchant.description}</td>
                            <td style={{ padding: "0.5rem", "text-align": "center" }}>{merchant.region_name}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
      
      {/* Mob Edit Modal */}
      <Show when={showMobModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowMobModal(false)}>
          <div class="card" style={{ "max-width": "600px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingMob()?.id ? 'Edit Mob' : 'Create Mob'}</h2>
              <button onClick={() => setShowMobModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveMob}>
              <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr" }}>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Name</label>
                  <input type="text" value={editingMob()?.name || ''} 
                         onInput={(e) => setEditingMob({...editingMob()!, name: e.currentTarget.value})} required />
                </div>
                <div>
                  <label>Level</label>
                  <input type="number" value={editingMob()?.level || 1} 
                         onInput={(e) => setEditingMob({...editingMob()!, level: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Max Health</label>
                  <input type="number" value={editingMob()?.max_health || 100} 
                         onInput={(e) => setEditingMob({...editingMob()!, max_health: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Attack</label>
                  <input type="number" value={editingMob()?.attack || 10} 
                         onInput={(e) => setEditingMob({...editingMob()!, attack: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Defense</label>
                  <input type="number" value={editingMob()?.defense || 5} 
                         onInput={(e) => setEditingMob({...editingMob()!, defense: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Experience</label>
                  <input type="number" value={editingMob()?.experience || 10} 
                         onInput={(e) => setEditingMob({...editingMob()!, experience: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Gold Min</label>
                  <input type="number" value={editingMob()?.gold_min || 1} 
                         onInput={(e) => setEditingMob({...editingMob()!, gold_min: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Gold Max</label>
                  <input type="number" value={editingMob()?.gold_max || 5} 
                         onInput={(e) => setEditingMob({...editingMob()!, gold_max: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Attack Speed</label>
                  <input type="number" step="0.1" value={editingMob()?.attack_speed || 1.0} 
                         onInput={(e) => setEditingMob({...editingMob()!, attack_speed: parseFloat(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Region ID <span style={{ "font-size": "0.8rem", color: "var(--warning)" }}>(controls rare loot)</span></label>
                  <input type="number" value={editingMob()?.region_id || 1} 
                         onInput={(e) => setEditingMob({...editingMob()!, region_id: parseInt(e.currentTarget.value)})} />
                </div>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Area <span style={{ "font-size": "0.8rem", color: "var(--text-secondary)" }}>(description only, not used for spawning)</span></label>
                  <input type="text" value={editingMob()?.area || ''} 
                         onInput={(e) => setEditingMob({...editingMob()!, area: e.currentTarget.value})} 
                         placeholder="e.g., 'Forest', 'Cave', 'Mountains'" />
                </div>
              </div>
              <div style={{ 
                "margin-top": "1rem", 
                padding: "0.75rem", 
                background: "var(--bg-light)", 
                "border-radius": "4px",
                "font-size": "0.85rem",
                color: "var(--text-secondary)",
                border: "1px solid var(--accent)"
              }}>
                <div style={{ "margin-bottom": "0.5rem" }}>
                  <strong style={{ color: "var(--accent)" }}>Spawning:</strong> Controlled by the <strong>region_mobs</strong> table, not region_id. 
                  Add this mob to region_mobs with a spawn_weight to make it appear in a region.
                </div>
                <div>
                  <strong style={{ color: "var(--warning)" }}>Region ID:</strong> Determines which region rare loot this mob can drop (from region_rare_loot table).
                </div>
                <div style={{ "margin-top": "0.5rem" }}>
                  <strong style={{ color: "var(--text-secondary)" }}>Area:</strong> Description only, not used by game logic.
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowMobModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Mob Loot Edit Modal */}
      <Show when={showMobLootModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowMobLootModal(false)}>
          <div class="card" style={{ "max-width": "500px", width: "90%" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingMobLoot()?.id ? 'Edit Mob Loot' : 'Add Mob Loot'}</h2>
              <button onClick={() => setShowMobLootModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveMobLoot}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Mob</label>
                  <select value={editingMobLoot()?.mob_id || ''} 
                          onChange={(e) => setEditingMobLoot({...editingMobLoot()!, mob_id: parseInt(e.currentTarget.value)})} required>
                    <For each={mobs()}>
                      {(mob: any) => <option value={mob.id}>{mob.name} (Lvl {mob.level})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Item</label>
                  <select value={editingMobLoot()?.item_id || ''} 
                          onChange={(e) => setEditingMobLoot({...editingMobLoot()!, item_id: parseInt(e.currentTarget.value)})} required>
                    <For each={items()}>
                      {(item: any) => <option value={item.id}>{item.name} ({item.rarity})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Drop Chance (0-1, e.g. 0.05 = 5%)</label>
                  <input type="number" step="0.001" min="0" max="1" value={editingMobLoot()?.drop_chance || 0.1} 
                         onInput={(e) => setEditingMobLoot({...editingMobLoot()!, drop_chance: parseFloat(e.currentTarget.value)})} required />
                </div>
                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label>Min Quantity</label>
                    <input type="number" min="1" value={editingMobLoot()?.min_quantity || 1} 
                           onInput={(e) => setEditingMobLoot({...editingMobLoot()!, min_quantity: parseInt(e.currentTarget.value)})} required />
                  </div>
                  <div>
                    <label>Max Quantity</label>
                    <input type="number" min="1" value={editingMobLoot()?.max_quantity || 1} 
                           onInput={(e) => setEditingMobLoot({...editingMobLoot()!, max_quantity: parseInt(e.currentTarget.value)})} required />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowMobLootModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Region Rare Loot Edit Modal */}
      <Show when={showRegionLootModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowRegionLootModal(false)}>
          <div class="card" style={{ "max-width": "500px", width: "90%" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingRegionLoot()?.id ? 'Edit Region Rare Loot' : 'Add Region Rare Loot'}</h2>
              <button onClick={() => setShowRegionLootModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveRegionLoot}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label>Region</label>
                  <select value={editingRegionLoot()?.region_id || ''} 
                          onChange={(e) => setEditingRegionLoot({...editingRegionLoot()!, region_id: parseInt(e.currentTarget.value)})} required>
                    <For each={regions()}>
                      {(region: any) => <option value={region.id}>{region.name}</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Item</label>
                  <select value={editingRegionLoot()?.item_id || ''} 
                          onChange={(e) => setEditingRegionLoot({...editingRegionLoot()!, item_id: parseInt(e.currentTarget.value)})} required>
                    <For each={items()}>
                      {(item: any) => <option value={item.id}>{item.name} ({item.rarity})</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label>Drop Chance (0-1, e.g. 0.001 = 0.1%)</label>
                  <input type="number" step="0.0001" min="0" max="1" value={editingRegionLoot()?.drop_chance || 0.001} 
                         onInput={(e) => setEditingRegionLoot({...editingRegionLoot()!, drop_chance: parseFloat(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Minimum Mob Level</label>
                  <input type="number" min="1" value={editingRegionLoot()?.min_level || 1} 
                         onInput={(e) => setEditingRegionLoot({...editingRegionLoot()!, min_level: parseInt(e.currentTarget.value)})} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowRegionLootModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Item Edit Modal */}
      <Show when={showItemModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowItemModal(false)}>
          <div class="card" style={{ "max-width": "800px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingItem()?.id ? 'Edit Item' : 'Create Item'}</h2>
              <button onClick={() => setShowItemModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr" }}>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Name</label>
                  <input type="text" value={editingItem()?.name || ''} 
                         onInput={(e) => setEditingItem({...editingItem()!, name: e.currentTarget.value})} required />
                </div>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Description</label>
                  <textarea value={editingItem()?.description || ''} rows={2}
                            onInput={(e) => setEditingItem({...editingItem()!, description: e.currentTarget.value})} />
                </div>
                <div>
                  <label>Type</label>
                  <select value={editingItem()?.type || 'weapon'} 
                          onChange={(e) => setEditingItem({...editingItem()!, type: e.currentTarget.value})} required>
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="consumable">Consumable</option>
                    <option value="scroll">Scroll</option>
                    <option value="misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label>Rarity</label>
                  <select value={editingItem()?.rarity || 'common'} 
                          onChange={(e) => setEditingItem({...editingItem()!, rarity: e.currentTarget.value})} required>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div>
                  <label>Level Requirement</label>
                  <input type="number" min="1" value={editingItem()?.level || 1} 
                         onInput={(e) => setEditingItem({...editingItem()!, level: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Value (Gold)</label>
                  <input type="number" min="0" value={editingItem()?.value || 1} 
                         onInput={(e) => setEditingItem({...editingItem()!, value: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Damage</label>
                  <input type="number" min="0" value={editingItem()?.damage || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, damage: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>Armor</label>
                  <input type="number" min="0" value={editingItem()?.armor || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, armor: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>STR Bonus</label>
                  <input type="number" value={editingItem()?.strength_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, strength_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>DEX Bonus</label>
                  <input type="number" value={editingItem()?.dexterity_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, dexterity_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>CON Bonus</label>
                  <input type="number" value={editingItem()?.constitution_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, constitution_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>INT Bonus</label>
                  <input type="number" value={editingItem()?.intelligence_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, intelligence_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>WIS Bonus</label>
                  <input type="number" value={editingItem()?.wisdom_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, wisdom_bonus: parseInt(e.currentTarget.value)})} />
                </div>
                <div>
                  <label>CHA Bonus</label>
                  <input type="number" value={editingItem()?.charisma_bonus || 0} 
                         onInput={(e) => setEditingItem({...editingItem()!, charisma_bonus: parseInt(e.currentTarget.value)})} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowItemModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
      
      {/* Ability Edit Modal */}
      <Show when={showAbilityModal()}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          "align-items": "center", "justify-content": "center", "z-index": 1000
        }} onClick={() => setShowAbilityModal(false)}>
          <div class="card" style={{ "max-width": "600px", width: "90%", "max-height": "90vh", overflow: "auto" }} 
               onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
              <h2>{editingAbility()?.id ? 'Edit Ability' : 'Create Ability'}</h2>
              <button onClick={() => setShowAbilityModal(false)} style={{ background: "none", border: "none", "font-size": "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveAbility}>
              <div style={{ display: "grid", gap: "1rem", "grid-template-columns": "1fr 1fr" }}>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Name</label>
                  <input type="text" value={editingAbility()?.name || ''} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, name: e.currentTarget.value})} required />
                </div>
                <div style={{ "grid-column": "1 / -1" }}>
                  <label>Description</label>
                  <textarea value={editingAbility()?.description || ''} rows={2}
                            onInput={(e) => setEditingAbility({...editingAbility()!, description: e.currentTarget.value})} />
                </div>
                <div>
                  <label>Type</label>
                  <select value={editingAbility()?.type || 'damage'} 
                          onChange={(e) => setEditingAbility({...editingAbility()!, type: e.currentTarget.value})} required>
                    <option value="damage">Damage</option>
                    <option value="heal">Heal</option>
                    <option value="buff">Buff</option>
                    <option value="debuff">Debuff</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
                <div>
                  <label>Category</label>
                  <select value={editingAbility()?.category || 'combat'} 
                          onChange={(e) => setEditingAbility({...editingAbility()!, category: e.currentTarget.value})} required>
                    <option value="combat">Combat</option>
                    <option value="magic">Magic</option>
                    <option value="healing">Healing</option>
                    <option value="defense">Defense</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
                <div>
                  <label>Level Requirement</label>
                  <input type="number" min="1" value={editingAbility()?.required_level || 1} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, required_level: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Mana Cost</label>
                  <input type="number" min="0" value={editingAbility()?.mana_cost || 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, mana_cost: parseInt(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Cooldown (seconds)</label>
                  <input type="number" min="0" step="0.1" value={editingAbility()?.cooldown || 0} 
                         onInput={(e) => setEditingAbility({...editingAbility()!, cooldown: parseFloat(e.currentTarget.value)})} required />
                </div>
                <div>
                  <label>Primary Stat (optional)</label>
                  <select value={editingAbility()?.primary_stat || ''} 
                          onChange={(e) => setEditingAbility({...editingAbility()!, primary_stat: e.currentTarget.value || null})}>
                    <option value="">None</option>
                    <option value="strength">Strength</option>
                    <option value="dexterity">Dexterity</option>
                    <option value="constitution">Constitution</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="charisma">Charisma</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", "margin-top": "1.5rem" }}>
                <button type="submit" class="button primary" style={{ flex: 1 }}>Save</button>
                <button type="button" class="button secondary" style={{ flex: 1 }} onClick={() => setShowAbilityModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
}
