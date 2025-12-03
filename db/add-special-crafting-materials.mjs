import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Special crafting materials distributed across level ranges
// Note: crafting_materials table only allows common/uncommon/rare
const specialMaterials = [
  // Level 1-15 (Common/Uncommon)
  { name: 'Hardened Leather Strip', description: 'A reinforced strip of leather used for binding armor', rarity: 'uncommon' },
  { name: 'Polished Stone', description: 'A smooth stone suitable for enchantments', rarity: 'uncommon' },
  { name: 'Silver Thread', description: 'Fine thread woven with silver for magical garments', rarity: 'uncommon' },
  { name: 'Iron Rivets', description: 'Small metal fasteners used in armor crafting', rarity: 'common' },
  
  // Level 10-30 (Uncommon/Rare)
  { name: 'Blessed Oak', description: 'Wood from a sacred grove, ideal for staves and instruments', rarity: 'rare' },
  { name: 'Moonstone Shard', description: 'A fragment of moonstone radiating faint magic', rarity: 'rare' },
  { name: 'Alchemical Resin', description: 'Sticky resin used to enhance potion potency', rarity: 'rare' },
  { name: 'Tempered Steel Bar', description: 'High-quality steel suitable for superior weapons', rarity: 'uncommon' },
  { name: 'Thick Hide', description: 'Durable hide from larger beasts', rarity: 'uncommon' },
  
  // Level 25-50 (Rare)
  { name: 'Phoenix Feather', description: 'A feather from a legendary phoenix, warm to the touch', rarity: 'rare' },
  { name: 'Void Crystal', description: 'A dark crystal pulsing with otherworldly energy', rarity: 'rare' },
  { name: 'Essence of Fire', description: 'Elemental essence captured from a fire elemental', rarity: 'rare' },
  { name: 'Runestone Fragment', description: 'Ancient stone inscribed with powerful runes', rarity: 'rare' },
  { name: 'Titanium Ore', description: 'Rare ore stronger than mithril', rarity: 'rare' },
  { name: 'Enchanted Ink', description: 'Magical ink that glows faintly when used', rarity: 'uncommon' },
  
  // Level 40-60 (Rare)
  { name: 'Celestial Fabric', description: 'Cloth woven from starlight itself', rarity: 'rare' },
  { name: 'Demon Horn', description: 'A horn from a powerful demon, radiating dark power', rarity: 'rare' },
  { name: 'Prismatic Gem', description: 'A gem that refracts light into all colors', rarity: 'rare' },
  { name: 'Essence of Ice', description: 'Elemental essence captured from an ice elemental', rarity: 'rare' },
  { name: 'Living Vine', description: 'A magical vine that never withers', rarity: 'rare' },
];

console.log('Adding special crafting materials...\n');

let added = 0;
let skipped = 0;

for (const material of specialMaterials) {
  try {
    await turso.execute({
      sql: `INSERT INTO crafting_materials (name, description, rarity)
            VALUES (?, ?, ?)`,
      args: [material.name, material.description, material.rarity]
    });
    console.log(`✓ Added ${material.rarity} material: ${material.name}`);
    added++;
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      console.log(`  Skipped (already exists): ${material.name}`);
      skipped++;
    } else {
      console.error(`✗ Error adding ${material.name}:`, error.message);
    }
  }
}

console.log(`\n✓ Added ${added} new materials, skipped ${skipped} existing`);

// Show summary
const summary = await turso.execute(`
  SELECT rarity, COUNT(*) as count 
  FROM crafting_materials 
  GROUP BY rarity 
  ORDER BY CASE rarity 
    WHEN 'common' THEN 1 
    WHEN 'uncommon' THEN 2 
    WHEN 'rare' THEN 3 
  END
`);

console.log('\nCrafting Materials Summary:');
summary.rows.forEach(row => {
  console.log(`  ${row.rarity}: ${row.count}`);
});
