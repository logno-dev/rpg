import { createResource, Show, For } from "solid-js";
import { A } from "@solidjs/router";
import { db } from "~/lib/db";

interface WikiDataProps {
  endpoint: string;
  params?: Record<string, string>;
  children: (data: any[]) => any;
}

async function fetchWikiData(endpoint: string, params?: Record<string, string>) {
  "use server";
  
  try {
    if (endpoint === "regions") {
      const regions = await db.execute(
        `SELECT id, name, description, min_level, max_level, locked, unlock_requirement 
         FROM regions 
         ORDER BY min_level ASC`
      );
      return regions.rows;
    }
    
    if (endpoint === "abilities") {
      const type = params?.type;
      const category = params?.category;
      
      let query = `
        SELECT a.id, a.name, a.description, a.type, a.category, a.level, 
               a.mana_cost, a.cooldown, a.required_level,
               a.required_strength, a.required_dexterity, a.required_constitution,
               a.required_intelligence, a.required_wisdom, a.required_charisma
        FROM abilities a
        WHERE 1=1
      `;
      
      const args: any[] = [];
      
      if (type) {
        query += ` AND a.type = ?`;
        args.push(type);
      }
      
      if (category) {
        query += ` AND a.category = ?`;
        args.push(category);
      }
      
      query += ` ORDER BY a.level ASC, a.name ASC`;
      
      const abilities = await db.execute({ sql: query, args });
      return abilities.rows;
    }
    
    if (endpoint === "items") {
      const type = params?.type;
      const rarity = params?.rarity;
      
      let query = `
        SELECT id, name, description, type, slot, rarity,
               damage_min, damage_max, armor, attack_speed,
               strength_bonus, dexterity_bonus, constitution_bonus,
               intelligence_bonus, wisdom_bonus, charisma_bonus,
               health_restore, mana_restore, value,
               required_level, required_strength, required_dexterity,
               required_constitution, required_intelligence, required_wisdom, required_charisma
        FROM items
        WHERE 1=1
      `;
      
      const args: any[] = [];
      
      if (type) {
        query += ` AND type = ?`;
        args.push(type);
      }
      
      if (rarity) {
        query += ` AND rarity = ?`;
        args.push(rarity);
      }
      
      query += ` ORDER BY required_level ASC, name ASC`;
      
      const items = await db.execute({ sql: query, args });
      return items.rows;
    }
    
    if (endpoint === "mobs") {
      const area = params?.area;
      const minLevel = params?.minLevel;
      const maxLevel = params?.maxLevel;
      
      let query = `
        SELECT id, name, level, area, max_health, damage_min, damage_max,
               defense, attack_speed, evasiveness, experience_reward,
               gold_min, gold_max, aggressive
        FROM mobs
        WHERE 1=1
      `;
      
      const args: any[] = [];
      
      if (area) {
        query += ` AND area = ?`;
        args.push(area);
      }
      
      if (minLevel) {
        query += ` AND level >= ?`;
        args.push(parseInt(minLevel));
      }
      
      if (maxLevel) {
        query += ` AND level <= ?`;
        args.push(parseInt(maxLevel));
      }
      
      query += ` ORDER BY level ASC, name ASC`;
      
      const mobs = await db.execute({ sql: query, args });
      return mobs.rows;
    }
    
    if (endpoint === "quests") {
      const regionId = params?.regionId;
      const minLevel = params?.minLevel;
      const maxLevel = params?.maxLevel;
      
      let query = `
        SELECT q.id, q.name, q.description, q.min_level, q.repeatable, 
               r.name as region_name, r.id as region_id
        FROM quests q
        JOIN regions r ON q.region_id = r.id
        WHERE 1=1
      `;
      
      const args: any[] = [];
      
      if (regionId) {
        query += ` AND q.region_id = ?`;
        args.push(parseInt(regionId));
      }
      
      if (minLevel) {
        query += ` AND q.min_level >= ?`;
        args.push(parseInt(minLevel));
      }
      
      if (maxLevel) {
        query += ` AND q.min_level <= ?`;
        args.push(parseInt(maxLevel));
      }
      
      query += ` ORDER BY q.min_level ASC, q.name ASC`;
      
      const questsResult = await db.execute({ sql: query, args });
      const quests = questsResult.rows;
      
      // Fetch rewards for all quests
      for (const quest of quests) {
        const rewardsResult = await db.execute({
          sql: `SELECT qr.*, i.name as item_name, i.id as item_id, cm.name as material_name
                FROM quest_rewards qr
                LEFT JOIN items i ON qr.reward_item_id = i.id
                LEFT JOIN crafting_materials cm ON qr.reward_material_id = cm.id
                WHERE qr.quest_id = ?`,
          args: [quest.id]
        });
        (quest as any).rewards = rewardsResult.rows;
      }
      
      return quests;
    }
    
    return [];
  } catch (error: any) {
    console.error("Wiki data fetch error:", error);
    throw new Error(`Failed to fetch wiki data: ${error.message}`);
  }
}

export function WikiData(props: WikiDataProps) {
  const [data] = createResource(
    () => ({ endpoint: props.endpoint, params: props.params }),
    async ({ endpoint, params }) => {
      return await fetchWikiData(endpoint, params);
    }
  );

  return (
    <Show when={!data.loading} fallback={<div>Loading...</div>}>
      <Show when={!data.error} fallback={<div>Error loading data: {data.error?.message}</div>}>
        {props.children(data() || [])}
      </Show>
    </Show>
  );
}

interface RegionTableProps {
  data: any[];
}

export function RegionTable(props: RegionTableProps) {
  return (
    <table class="wiki-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Level Range</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <For each={props.data}>
          {(region) => (
            <tr>
              <td><strong>{region.name}</strong></td>
              <td>Level {region.min_level} - {region.max_level}</td>
              <td>{region.description || "No description available"}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

interface AbilityTableProps {
  data: any[];
}

export function AbilityTable(props: AbilityTableProps) {
  return (
    <table class="wiki-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Category</th>
          <th>Tier</th>
          <th>Mana</th>
          <th>Cooldown</th>
          <th>Requirements</th>
        </tr>
      </thead>
      <tbody>
        <For each={props.data}>
          {(ability) => (
            <tr>
              <td>
                <A href={`/wiki/ability/${ability.id}`} style={{ color: "var(--accent)", "font-weight": "bold" }}>
                  {ability.name}
                </A>
              </td>
              <td>{ability.type}</td>
              <td>{ability.category}</td>
              <td>{ability.level}</td>
              <td>{ability.mana_cost}</td>
              <td>{ability.cooldown}s</td>
              <td>
                Lvl {ability.required_level}
                {ability.required_strength > 0 && `, STR ${ability.required_strength}`}
                {ability.required_dexterity > 0 && `, DEX ${ability.required_dexterity}`}
                {ability.required_intelligence > 0 && `, INT ${ability.required_intelligence}`}
                {ability.required_wisdom > 0 && `, WIS ${ability.required_wisdom}`}
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

interface ItemTableProps {
  data: any[];
}

export function ItemTable(props: ItemTableProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary": return "#ff8000";
      case "epic": return "#a335ee";
      case "rare": return "#0070dd";
      case "uncommon": return "#1eff00";
      default: return "#9d9d9d";
    }
  };

  return (
    <table class="wiki-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Rarity</th>
          <th>Stats</th>
          <th>Requirements</th>
        </tr>
      </thead>
      <tbody>
        <For each={props.data}>
          {(item) => (
            <tr>
              <td>
                <A href={`/wiki/equipment/${item.id}`} style={{ color: getRarityColor(item.rarity), "font-weight": "bold" }}>
                  {item.name}
                </A>
              </td>
              <td>{item.type} {item.slot ? `(${item.slot})` : ""}</td>
              <td style={{ color: getRarityColor(item.rarity) }}>{item.rarity}</td>
              <td style={{ "font-size": "0.9em" }}>
                {item.damage_min > 0 && `DMG: ${item.damage_min}-${item.damage_max} `}
                {item.armor > 0 && `ARM: ${item.armor} `}
                {item.strength_bonus > 0 && `+${item.strength_bonus} STR `}
                {item.dexterity_bonus > 0 && `+${item.dexterity_bonus} DEX `}
                {item.constitution_bonus > 0 && `+${item.constitution_bonus} CON `}
                {item.intelligence_bonus > 0 && `+${item.intelligence_bonus} INT `}
                {item.wisdom_bonus > 0 && `+${item.wisdom_bonus} WIS `}
                {item.charisma_bonus > 0 && `+${item.charisma_bonus} CHA `}
              </td>
              <td>Lvl {item.required_level}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

interface MobTableProps {
  data: any[];
}

export function MobTable(props: MobTableProps) {
  return (
    <table class="wiki-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Level</th>
          <th>Health</th>
          <th>Damage</th>
          <th>Defense</th>
          <th>Rewards</th>
        </tr>
      </thead>
      <tbody>
        <For each={props.data}>
          {(mob) => (
            <tr>
              <td><strong>{mob.name}</strong> {mob.aggressive ? "" : ""}</td>
              <td>{mob.level}</td>
              <td>{mob.max_health} HP</td>
              <td>{mob.damage_min}-{mob.damage_max}</td>
              <td>{mob.defense}</td>
              <td>
                {mob.experience_reward} XP, {mob.gold_min}-{mob.gold_max} Gold
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

interface QuestTableProps {
  data: any[];
}

export function QuestTable(props: QuestTableProps) {
  return (
    <table class="wiki-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Level</th>
          <th>Region</th>
          <th>Type</th>
          <th>Rewards</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <For each={props.data}>
          {(quest) => (
            <tr>
              <td>
                <A href={`/wiki/quest/${quest.id}`} style={{ color: "var(--accent)", "font-weight": "bold" }}>
                  {quest.name}
                </A>
              </td>
              <td>{quest.min_level}</td>
              <td>{quest.region_name}</td>
              <td>{quest.repeatable ? "Repeatable" : "One-time"}</td>
              <td style={{ "font-size": "0.85em" }}>
                <Show when={quest.rewards && quest.rewards.length > 0}>
                  <For each={quest.rewards}>
                    {(reward, index) => (
                      <>
                        {index() > 0 && ", "}
                        {reward.reward_type === 'xp' && `${reward.reward_amount} XP`}
                        {reward.reward_type === 'gold' && `${reward.reward_amount} Gold`}
                        {reward.reward_type === 'item' && reward.item_name && (
                          <>
                            <A href={`/wiki/equipment/${reward.item_id}`} style={{ color: "var(--accent)" }}>
                              {reward.item_name}
                            </A>
                            {reward.reward_amount > 1 && ` x${reward.reward_amount}`}
                          </>
                        )}
                        {reward.reward_type === 'crafting_material' && reward.material_name && (
                          <>
                            {reward.material_name}
                            {reward.reward_amount > 1 && ` x${reward.reward_amount}`}
                          </>
                        )}
                      </>
                    )}
                  </For>
                </Show>
              </td>
              <td style={{ "font-size": "0.9em" }}>{quest.description}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
