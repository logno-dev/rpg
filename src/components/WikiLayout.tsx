import { createSignal, Show, For, JSX } from "solid-js";
import { A, useLocation } from "@solidjs/router";

interface WikiNavItem {
  title: string;
  href: string;
  children?: WikiNavItem[];
}

const wikiNavigation: WikiNavItem[] = [
  {
    title: "Getting Started",
    href: "/wiki/getting-started",
  },
  {
    title: "Game Mechanics",
    href: "/wiki#mechanics",
    children: [
      { title: "Combat System", href: "/wiki/combat" },
      { title: "Quests", href: "/wiki/quest" },
    ],
  },
  {
    title: "World",
    href: "/wiki#world",
    children: [
      { title: "Regions & Areas", href: "/wiki/world" },
    ],
  },
  {
    title: "Character Development",
    href: "/wiki#character",
    children: [
      { title: "Abilities & Spells", href: "/wiki/ability" },
      { title: "Equipment & Items", href: "/wiki/equipment" },
    ],
  },
];

interface WikiLayoutProps {
  children: JSX.Element;
}

export default function WikiLayout(props: WikiLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const NavItems = () => (
    <For each={wikiNavigation}>
      {(item) => (
        <div class="wiki-nav-section">
          <Show
            when={item.children && item.children.length > 0}
            fallback={
              <A
                href={item.href}
                class={`wiki-nav-link ${isActive(item.href) ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </A>
            }
          >
            <div class="wiki-nav-group-title">{item.title}</div>
            <div class="wiki-nav-group">
              <For each={item.children}>
                {(child) => (
                  <A
                    href={child.href}
                    class={`wiki-nav-link ${isActive(child.href) ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {child.title}
                  </A>
                )}
              </For>
            </div>
          </Show>
        </div>
      )}
    </For>
  );

  return (
    <div class="wiki-container">
      {/* Header */}
      <div class="wiki-header">
        <div class="wiki-header-content">
          <button
            class="wiki-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
          >
            <Show when={!mobileMenuOpen()} fallback={<span>×</span>}>
              <span>≡</span>
            </Show>
          </button>
          <A href="/wiki" class="wiki-title">
            Morthvale Wiki
          </A>
          <A href="/" class="button secondary wiki-home-button">
            ← Back to Game
          </A>
        </div>
      </div>

      <div class="wiki-layout">
        {/* Desktop Sidebar */}
        <aside class="wiki-sidebar desktop-only">
          <div class="wiki-sidebar-content">
            <A href="/wiki" class="wiki-nav-link wiki-home-link">
              Home
            </A>
            <NavItems />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <Show when={mobileMenuOpen()}>
          <div class="wiki-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <aside class="wiki-sidebar mobile-sidebar">
            <div class="wiki-sidebar-content">
              <A href="/wiki" class="wiki-nav-link wiki-home-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </A>
              <NavItems />
            </div>
          </aside>
        </Show>

        {/* Main Content */}
        <main class="wiki-main">
          <div class="wiki-content">
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}
