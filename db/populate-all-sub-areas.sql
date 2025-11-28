-- Populate sub-areas for regions 4-16

BEGIN TRANSACTION;

-- Region 4: Shadowdeep Dungeon (8-15)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(4, 'Crypts of the Damned', 'Ancient burial chambers filled with undead horrors. The air is thick with decay.', 8, 11),
(4, 'Shadow Halls', 'Corridors shrouded in impenetrable darkness where shadow creatures dwell.', 12, 14),
(4, 'The Void Chamber', 'The deepest, darkest part of the dungeon where reality itself seems twisted.', 14, 15);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Crypts of the Damned
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'Crypts of the Damned'), 134, 40, 1), -- Shambling Zombie
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'Crypts of the Damned'), 135, 35, 1), -- Flesh Ghoul
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'Crypts of the Damned'), 136, 25, 1), -- Lichling
-- Shadow Halls
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'Shadow Halls'), 136, 30, 1), -- Lichling
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'Shadow Halls'), 137, 40, 1), -- Shadow Abomination
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'Shadow Halls'), 138, 30, 1), -- Void Walker
-- The Void Chamber
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'The Void Chamber'), 137, 35, 1), -- Shadow Abomination
((SELECT id FROM sub_areas WHERE region_id = 4 AND name = 'The Void Chamber'), 138, 65, 1); -- Void Walker

-- Region 5: Scorched Badlands (13-18)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(5, 'Burning Wastes', 'Barren desert with rivers of lava and pools of molten rock.', 13, 15),
(5, 'Hellhound Territories', 'Hunting grounds of demonic beasts. The ground burns beneath your feet.', 15, 17),
(5, 'Infernal Depths', 'The hottest, most dangerous area where powerful fire demons reign.', 17, 18);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Burning Wastes
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Burning Wastes'), 157, 45, 1), -- Lesser Imp
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Burning Wastes'), 158, 35, 1), -- Ash Wraith
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Burning Wastes'), 159, 20, 1), -- Fire Elemental
-- Hellhound Territories
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Hellhound Territories'), 159, 25, 1), -- Fire Elemental
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Hellhound Territories'), 160, 45, 1), -- Hellhound
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Hellhound Territories'), 161, 30, 1), -- Flame Demon
-- Infernal Depths
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Infernal Depths'), 161, 40, 1), -- Flame Demon
((SELECT id FROM sub_areas WHERE region_id = 5 AND name = 'Infernal Depths'), 162, 60, 1); -- Ifrit

-- Region 6: Frostpeak Glaciers (16-22)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(6, 'Frozen Tundra', 'Endless fields of ice and snow. Freezing winds cut through armor.', 16, 18),
(6, 'Giant''s Domain', 'Territory of frost giants and trolls. Massive ice formations tower overhead.', 19, 21),
(6, 'Glacial Peaks', 'The highest, coldest peaks where only the strongest ice creatures survive.', 21, 22);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Frozen Tundra
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Frozen Tundra'), 163, 40, 1), -- Yeti
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Frozen Tundra'), 164, 35, 1), -- Ice Wolf
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Frozen Tundra'), 165, 25, 1), -- Ice Elemental
-- Giant's Domain
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Giant''s Domain'), 166, 30, 1), -- Snow Troll
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Giant''s Domain'), 167, 40, 1), -- Frost Giant
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Giant''s Domain'), 168, 30, 1), -- Ice Drake
-- Glacial Peaks
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Glacial Peaks'), 168, 45, 1), -- Ice Drake
((SELECT id FROM sub_areas WHERE region_id = 6 AND name = 'Glacial Peaks'), 169, 55, 1); -- Frost Mammoth

-- Region 7: Elven Sanctum (20-26)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(7, 'Corrupted Gardens', 'Once beautiful gardens now twisted by dark magic. Thorns cover every surface.', 20, 22),
(7, 'Haunted Groves', 'Ancient trees whisper of betrayal. Elven spirits wander, lost and vengeful.', 23, 25),
(7, 'Heart of Darkness', 'The source of the corruption. Dark energy pulses from the ground.', 25, 26);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Corrupted Gardens
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Corrupted Gardens'), 170, 40, 1), -- Corrupted Guardian
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Corrupted Gardens'), 171, 35, 1), -- Wild Sprite
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Corrupted Gardens'), 172, 25, 1), -- Dark Centaur
-- Haunted Groves
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Haunted Groves'), 173, 35, 1), -- Elven Revenant
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Haunted Groves'), 174, 35, 1), -- Elven Shadow Archer
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Haunted Groves'), 175, 30, 1), -- Ancient Treeant
-- Heart of Darkness
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Heart of Darkness'), 175, 40, 1), -- Ancient Treeant
((SELECT id FROM sub_areas WHERE region_id = 7 AND name = 'Heart of Darkness'), 176, 60, 1); -- Corrupted Unicorn

-- Region 8: Dragon Aerie (24-30)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(8, 'Wyrmling Nests', 'Young dragons and wyverns make their homes in mountain caves.', 24, 26),
(8, 'Dragon Territories', 'Claimed lands of dragonkin warriors. Dragon scales litter the ground.', 27, 29),
(8, 'Ancient Dragon Lairs', 'The oldest and most powerful dragons dwell here. Treasure and danger abound.', 29, 30);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Wyrmling Nests
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Wyrmling Nests'), 177, 45, 1), -- Dragon Wyrmling
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Wyrmling Nests'), 178, 30, 1), -- Wyvern Matriarch
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Wyrmling Nests'), 179, 25, 1), -- Adult Wyvern
-- Dragon Territories
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Dragon Territories'), 180, 40, 1), -- Dragonkin Warrior
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Dragon Territories'), 181, 35, 1), -- Elder Wyrm
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Dragon Territories'), 182, 25, 1), -- Drake Guardian
-- Ancient Dragon Lairs
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Ancient Dragon Lairs'), 182, 35, 1), -- Drake Guardian
((SELECT id FROM sub_areas WHERE region_id = 8 AND name = 'Ancient Dragon Lairs'), 183, 65, 1); -- Ancient Dragon

-- Region 9: Abyssal Depths (28-34)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(9, 'Murky Trenches', 'Deep underwater chasms where light never reaches. Strange creatures lurk.', 28, 30),
(9, 'Leviathan''s Domain', 'Territory of massive sea monsters. The water pressure is crushing.', 31, 33),
(9, 'The Deepest Abyss', 'The bottom of the ocean where elder krakens reign supreme.', 33, 34);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Murky Trenches
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'Murky Trenches'), 184, 45, 1), -- Deep Lurker
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'Murky Trenches'), 185, 35, 1), -- Abyssal Serpent
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'Murky Trenches'), 186, 20, 1), -- Kraken Spawn
-- Leviathan's Domain
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'Leviathan''s Domain'), 187, 35, 1), -- Leviathan
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'Leviathan''s Domain'), 188, 35, 1), -- Tidecaller
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'Leviathan''s Domain'), 189, 30, 1), -- Abyssal Horror
-- The Deepest Abyss
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'The Deepest Abyss'), 189, 40, 1), -- Abyssal Horror
((SELECT id FROM sub_areas WHERE region_id = 9 AND name = 'The Deepest Abyss'), 190, 60, 1); -- Elder Kraken

-- Region 10: Celestial Spire (32-38)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(10, 'Sky Gardens', 'Floating gardens tended by celestial guardians. Clouds drift below.', 32, 34),
(10, 'Storm Peaks', 'Lightning crackles through the air. Storm phoenixes soar overhead.', 35, 37),
(10, 'Divine Sanctum', 'The highest reaches where divine avatars dwell in radiant glory.', 37, 38);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Sky Gardens
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Sky Gardens'), 191, 40, 1), -- Skyward Guardian
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Sky Gardens'), 192, 35, 1), -- Cloud Elemental
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Sky Gardens'), 193, 25, 1), -- Radiant Seraph
-- Storm Peaks
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Storm Peaks'), 194, 35, 1), -- Storm Phoenix
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Storm Peaks'), 195, 40, 1), -- Celestial Enforcer
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Storm Peaks'), 196, 25, 1), -- Archangel
-- Divine Sanctum
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Divine Sanctum'), 196, 45, 1), -- Archangel
((SELECT id FROM sub_areas WHERE region_id = 10 AND name = 'Divine Sanctum'), 197, 55, 1); -- Divine Avatar

-- Region 11: Demon Citadel (36-42)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(11, 'Hellfire Ramparts', 'Fortified walls patrolled by demonic knights. Flames burn eternally.', 36, 38),
(11, 'Demon Lord Chambers', 'Inner sanctums where demon lords plot and scheme.', 39, 41),
(11, 'Throne of Demons', 'The heart of demonic power. Greater demons command legions from here.', 41, 42);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Hellfire Ramparts
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Hellfire Ramparts'), 198, 40, 1), -- Pit Fiend
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Hellfire Ramparts'), 199, 35, 1), -- Hellknight
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Hellfire Ramparts'), 200, 25, 1), -- Shadow Demon
-- Demon Lord Chambers
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Demon Lord Chambers'), 201, 35, 1), -- Demon Lord
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Demon Lord Chambers'), 202, 35, 1), -- Balrog
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Demon Lord Chambers'), 203, 30, 1), -- Archdevil
-- Throne of Demons
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Throne of Demons'), 203, 40, 1), -- Archdevil
((SELECT id FROM sub_areas WHERE region_id = 11 AND name = 'Throne of Demons'), 204, 60, 1); -- Greater Demon

-- Region 12: Astral Plane (40-46)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(12, 'Shifting Boundaries', 'Reality bends and twists. Astral wanderers phase in and out of existence.', 40, 42),
(12, 'Reality Nexus', 'Where multiple dimensions converge. Reality weavers maintain the balance.', 43, 45),
(12, 'Void Between Worlds', 'The space between planes where voidborn titans lurk.', 45, 46);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Shifting Boundaries
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Shifting Boundaries'), 205, 40, 1), -- Astral Wanderer
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Shifting Boundaries'), 206, 35, 1), -- Phase Beast
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Shifting Boundaries'), 207, 25, 1), -- Dimension Hopper
-- Reality Nexus
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Reality Nexus'), 208, 35, 1), -- Reality Weaver
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Reality Nexus'), 209, 40, 1), -- Astral Dragon
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Reality Nexus'), 210, 25, 1), -- Planar Guardian
-- Void Between Worlds
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Void Between Worlds'), 210, 40, 1), -- Planar Guardian
((SELECT id FROM sub_areas WHERE region_id = 12 AND name = 'Void Between Worlds'), 211, 60, 1); -- Voidborn Titan

-- Region 13: Elemental Chaos (44-50)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(13, 'Primordial Battlefield', 'Elements clash in constant warfare. Fire meets ice, earth meets storm.', 44, 46),
(13, 'Titan Territories', 'Massive elemental titans wage war. The ground shakes with every step.', 47, 49),
(13, 'Eye of the Storm', 'The center of elemental chaos. Elemental overlords rule with absolute power.', 49, 50);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Primordial Battlefield
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Primordial Battlefield'), 212, 40, 1), -- Chaos Elemental
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Primordial Battlefield'), 213, 30, 1), -- Primordial Flame
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Primordial Battlefield'), 214, 30, 1), -- Storm Titan
-- Titan Territories
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Titan Territories'), 215, 30, 1), -- Earth Colossus
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Titan Territories'), 216, 35, 1), -- Magma Behemoth
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Titan Territories'), 217, 35, 1), -- Tsunami Lord
-- Eye of the Storm
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Eye of the Storm'), 217, 35, 1), -- Tsunami Lord
((SELECT id FROM sub_areas WHERE region_id = 13 AND name = 'Eye of the Storm'), 218, 65, 1); -- Elemental Overlord

-- Region 14: Void Nexus (48-54)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(14, 'Entropic Wastes', 'Nothingness spreads. Void stalkers hunt in the darkness.', 48, 50),
(14, 'Realm of Oblivion', 'Where existence itself is uncertain. Oblivion walkers consume all.', 51, 53),
(14, 'Heart of Nothingness', 'The deepest void where nothingness itself takes form.', 53, 54);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Entropic Wastes
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Entropic Wastes'), 219, 40, 1), -- Void Stalker
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Entropic Wastes'), 220, 35, 1), -- Entropy Beast
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Entropic Wastes'), 221, 25, 1), -- Void Dragon
-- Realm of Oblivion
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Realm of Oblivion'), 222, 35, 1), -- Nihility
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Realm of Oblivion'), 223, 35, 1), -- Oblivion Walker
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Realm of Oblivion'), 224, 30, 1), -- Void Reaver
-- Heart of Nothingness
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Heart of Nothingness'), 224, 40, 1), -- Void Reaver
((SELECT id FROM sub_areas WHERE region_id = 14 AND name = 'Heart of Nothingness'), 225, 60, 1); -- Nothingness Incarnate

-- Region 15: Titan Halls (52-58)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(15, 'Guardian Chambers', 'Massive halls patrolled by titan guardians. Every surface is carved from stone.', 52, 54),
(15, 'War Halls', 'Battle arenas where war titans train and fight.', 55, 57),
(15, 'Throne of the Titan King', 'The seat of titan power. The king of all titans reigns here.', 57, 58);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Guardian Chambers
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'Guardian Chambers'), 226, 45, 1), -- Titan Guardian
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'Guardian Chambers'), 227, 30, 1), -- Stone Colossus
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'Guardian Chambers'), 228, 25, 1), -- War Titan
-- War Halls
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'War Halls'), 229, 35, 1), -- Titan Warlord
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'War Halls'), 230, 35, 1), -- Elder Titan
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'War Halls'), 231, 30, 1), -- Primordial Titan
-- Throne of the Titan King
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'Throne of the Titan King'), 231, 35, 1), -- Primordial Titan
((SELECT id FROM sub_areas WHERE region_id = 15 AND name = 'Throne of the Titan King'), 232, 65, 1); -- Titan King

-- Region 16: Eternity's End (56-60)
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(16, 'Gates of Eternity', 'The threshold between time and timelessness. Eternity guardians stand watch.', 56, 58),
(16, 'Cosmic Void', 'Where reality ends and cosmic horrors dwell in the darkness beyond.', 58, 60);

INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
-- Gates of Eternity
((SELECT id FROM sub_areas WHERE region_id = 16 AND name = 'Gates of Eternity'), 233, 50, 1), -- Eternity Guardian
((SELECT id FROM sub_areas WHERE region_id = 16 AND name = 'Gates of Eternity'), 234, 30, 1), -- Time Weaver
((SELECT id FROM sub_areas WHERE region_id = 16 AND name = 'Gates of Eternity'), 235, 20, 1), -- Fate Keeper
-- Cosmic Void
((SELECT id FROM sub_areas WHERE region_id = 16 AND name = 'Cosmic Void'), 235, 25, 1), -- Fate Keeper
((SELECT id FROM sub_areas WHERE region_id = 16 AND name = 'Cosmic Void'), 236, 40, 1), -- Cosmic Horror
((SELECT id FROM sub_areas WHERE region_id = 16 AND name = 'Cosmic Void'), 237, 35, 1); -- Harbinger of the End

COMMIT;
