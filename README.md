# Fantasy RPG

A browser-based fantasy RPG game built with SolidStart, Turso DB, and deployed on Vercel.

## Features

- Email/password authentication
- Character creation with customizable stats (no classes)
- Roaming system with random mob encounters
- Auto-combat with ability system
- Item and equipment management
- Leveling system with stat point allocation
- Mobile and desktop responsive design

## Tech Stack

- **Framework**: SolidStart
- **Database**: Turso (LibSQL)
- **Authentication**: Email/Password with bcrypt
- **Deployment**: Vercel

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Turso Database

Create a Turso database:

```bash
# Install Turso CLI if you haven't
curl -sSfL https://get.tur.so/install.sh | bash

# Create a new database
turso db create fantasy-rpg

# Get the database URL
turso db show fantasy-rpg

# Create an auth token
turso db tokens create fantasy-rpg
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Turso credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
SESSION_SECRET=your-random-secret-here
```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

This will create all necessary tables and seed the database with starter items, mobs, and abilities.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Mechanics

### Character Creation

- Start with 6 base stats: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- Each stat starts at 10, and you have 15 points to distribute
- Stats range from 5 to 25
- Constitution affects max health
- Intelligence affects max mana

### Combat

- Click "Roam the Field" to explore different areas
- Aggressive mobs may initiate combat automatically
- Combat is turn-based but auto-executes
- Use abilities during combat (costs mana)
- Defeat enemies to gain XP, gold, and loot

### Leveling

- Gain experience by defeating mobs
- Level up to receive stat points
- Assign points in the Stats view

### Items & Equipment

- Equip weapons and armor to improve stats
- Items have different rarities (common, uncommon, rare, epic, legendary)
- Defeated mobs can drop loot

### Areas

- **Plains**: Low-level area (Giant Rats, Wild Boars)
- **Forest**: Medium-level area (Goblins, Wolves, Spiders)
- **Mountains**: Higher-level area (Orcs)
- **Dungeon**: Challenging area (Skeletons, Cave Trolls)

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Make sure to add your environment variables in the Vercel dashboard.

## Project Structure

```
rpg/
├── db/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_seed_data.sql
│   └── migrate.js
├── src/
│   ├── components/
│   ├── lib/
│   │   ├── auth.ts          # Authentication logic
│   │   ├── db.ts            # Database client & types
│   │   └── game.ts          # Game logic
│   ├── routes/
│   │   ├── index.tsx        # Login/Register
│   │   ├── character-select.tsx
│   │   ├── create-character.tsx
│   │   └── game/
│   │       └── [id].tsx     # Main game page
│   ├── styles/
│   │   └── global.css
│   ├── app.tsx
│   ├── entry-client.tsx
│   └── entry-server.tsx
├── app.config.ts
├── package.json
└── tsconfig.json
```

## Future Enhancements

- Abilities system UI
- Player vs Player combat
- Guilds and parties
- Crafting system
- Quest system
- Achievement system
- Character customization (appearance)
- Sound effects and music
- More areas and mobs
- Boss fights
- Trading system

## License

MIT
