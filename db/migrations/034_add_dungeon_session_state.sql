-- Add HP/Mana tracking to dungeon progress for session persistence
ALTER TABLE character_dungeon_progress ADD COLUMN session_health INTEGER;
ALTER TABLE character_dungeon_progress ADD COLUMN session_mana INTEGER;
ALTER TABLE character_dungeon_progress ADD COLUMN boss_mob_id INTEGER;
