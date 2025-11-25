import { A } from "@solidjs/router";
import { Swords, Backpack, TrendingUp, Grid3x3, User, Hammer } from "lucide-solid";

export function GameNavigation() {
  return (
    <>
      {/* Desktop Navigation */}
      <div class="header desktop-nav">
        <div class="header-content">
          <h1 class="title">Fantasy RPG</h1>
          <div class="button-group">
            <A href="/game" class="button" activeClass="active" end>
              <Swords size={18} style={{ "margin-right": "0.5rem" }} />
              Adventure
            </A>
            <A href="/game/inventory" class="button" activeClass="active">
              <Backpack size={18} style={{ "margin-right": "0.5rem" }} />
              Inventory
            </A>
            <A href="/game/stats" class="button" activeClass="active">
              <TrendingUp size={18} style={{ "margin-right": "0.5rem" }} />
              Stats
            </A>
            <A href="/game/hotbar" class="button" activeClass="active">
              <Grid3x3 size={18} style={{ "margin-right": "0.5rem" }} />
              Hotbar
            </A>
            <A href="/game/crafting" class="button" activeClass="active">
              <Hammer size={18} style={{ "margin-right": "0.5rem" }} />
              Crafting
            </A>
          </div>
          <A href="/character-select" class="button secondary">
            <User size={18} style={{ "margin-right": "0.5rem" }} />
            Character Select
          </A>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav class="mobile-nav">
        <A href="/game" class="nav-item" activeClass="active" end>
          <Swords size={24} />
          <span>Adventure</span>
        </A>
        <A href="/game/inventory" class="nav-item" activeClass="active">
          <Backpack size={24} />
          <span>Inventory</span>
        </A>
        <A href="/game/stats" class="nav-item" activeClass="active">
          <TrendingUp size={24} />
          <span>Stats</span>
        </A>
        <A href="/game/hotbar" class="nav-item" activeClass="active">
          <Grid3x3 size={24} />
          <span>Hotbar</span>
        </A>
        <A href="/game/crafting" class="nav-item" activeClass="active">
          <Hammer size={24} />
          <span>Crafting</span>
        </A>
        <A href="/character-select" class="nav-item" activeClass="active">
          <User size={24} />
          <span>Character</span>
        </A>
      </nav>
    </>
  );
}
