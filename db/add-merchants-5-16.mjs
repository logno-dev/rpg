import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnv();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🏪 Adding merchants for regions 5-16...\n');

const merchants = [
  {
    regionId: 5,
    name: 'Ignis the Flame Broker',
    description: 'A fire-resistant merchant who trades in heat-proof gear and flame-touched weapons'
  },
  {
    regionId: 6,
    name: 'Frostbeard the Frozen',
    description: 'A frost giant merchant offering cold-weather survival gear and ice-forged equipment'
  },
  {
    regionId: 7,
    name: 'Silvana Moonshade',
    description: 'A mysterious elven merchant dealing in ancient artifacts and enchanted equipment'
  },
  {
    regionId: 8,
    name: 'Drakthar Scaleheart',
    description: 'A dragonborn merchant specializing in dragon-slaying equipment and rare treasures'
  },
  {
    regionId: 9,
    name: 'Nautilus the Deep Trader',
    description: 'An aquatic merchant offering waterproof gear and abyssal equipment'
  },
  {
    regionId: 10,
    name: 'Seraphiel the Radiant',
    description: 'A celestial merchant providing blessed weapons and holy armor'
  },
  {
    regionId: 11,
    name: 'Mephistar the Damned',
    description: 'A fallen merchant dealing in cursed weapons and dark armor'
  },
  {
    regionId: 12,
    name: 'Chronos the Timeless',
    description: 'A temporal merchant offering reality-bending equipment and astral gear'
  },
  {
    regionId: 13,
    name: 'Elementus Prime',
    description: 'An elemental fusion merchant with chaotic and powerful equipment'
  },
  {
    regionId: 14,
    name: 'Voidseer Nullifax',
    description: 'A void-touched merchant trading in equipment that channels nothingness'
  },
  {
    regionId: 15,
    name: 'Titanforge Colossus',
    description: 'An ancient titan merchant offering legendary titan-forged equipment'
  },
  {
    regionId: 16,
    name: 'Omega the Final',
    description: 'The last merchant at the end of all things, trading in ultimate equipment'
  }
];

for (const merchant of merchants) {
  await db.execute({
    sql: 'INSERT INTO merchants (region_id, name, description) VALUES (?, ?, ?)',
    args: [merchant.regionId, merchant.name, merchant.description]
  });
  
  console.log(`✓ Region ${merchant.regionId}: ${merchant.name}`);
}

console.log('\n✅ All merchants added!');
console.log('\nNote: Merchants need inventory items to sell.');
console.log('Run a separate script to populate merchant_inventory table.');
