import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
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
}

loadEnv();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function calculateMaxHealth(level, constitution) {
  const baseHealth = 100;
  const levelBonus = level * 20;
  const constitutionBonus = (constitution - 10) * 8;
  return baseHealth + levelBonus + constitutionBonus;
}

function calculateMaxMana(intelligence) {
  return 50 + (intelligence - 10) * 3;
}

async function fixCharacterMaxHealth() {
  console.log('Updating all characters to use new health/mana formula...\n');
  
  // Get all characters
  const characters = await client.execute('SELECT * FROM characters');
  
  let updatedCount = 0;
  
  for (const char of characters.rows) {
    const oldMaxHealth = char.max_health;
    const oldMaxMana = char.max_mana;
    
    // Calculate new max health/mana
    const newMaxHealth = calculateMaxHealth(char.level, char.constitution);
    const newMaxMana = calculateMaxMana(char.intelligence);
    
    // Calculate how much to adjust current health/mana
    // If they were at full health, keep them at full
    // Otherwise, maintain the same percentage
    let newCurrentHealth = char.current_health;
    let newCurrentMana = char.current_mana;
    
    if (char.current_health >= oldMaxHealth) {
      // Was at full health, set to new full health
      newCurrentHealth = newMaxHealth;
    } else if (oldMaxHealth > 0) {
      // Maintain same percentage
      const healthPercent = char.current_health / oldMaxHealth;
      newCurrentHealth = Math.ceil(newMaxHealth * healthPercent);
    }
    
    if (char.current_mana >= oldMaxMana) {
      // Was at full mana, set to new full mana
      newCurrentMana = newMaxMana;
    } else if (oldMaxMana > 0) {
      // Maintain same percentage
      const manaPercent = char.current_mana / oldMaxMana;
      newCurrentMana = Math.ceil(newMaxMana * manaPercent);
    }
    
    // Update the character
    await client.execute({
      sql: `UPDATE characters 
            SET max_health = ?, current_health = ?, max_mana = ?, current_mana = ?
            WHERE id = ?`,
      args: [newMaxHealth, newCurrentHealth, newMaxMana, newCurrentMana, char.id]
    });
    
    console.log(`✅ ${char.name} (Lvl ${char.level}, ${char.constitution} CON)`);
    console.log(`   Max HP: ${oldMaxHealth} → ${newMaxHealth} (${newMaxHealth > oldMaxHealth ? '+' : ''}${newMaxHealth - oldMaxHealth})`);
    console.log(`   Current HP: ${char.current_health} → ${newCurrentHealth}`);
    console.log(`   Max Mana: ${oldMaxMana} → ${newMaxMana}`);
    console.log(`   Current Mana: ${char.current_mana} → ${newCurrentMana}`);
    console.log();
    
    updatedCount++;
  }
  
  console.log(`\n✨ Updated ${updatedCount} characters!`);
}

fixCharacterMaxHealth().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
