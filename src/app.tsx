import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createSignal, Show } from "solid-js";
import { CharacterProvider } from "~/lib/CharacterContext";
import { ActiveEffectsProvider } from "~/lib/ActiveEffectsContext";
import "./styles/global.css";

// Global loading indicator component
function GlobalLoadingIndicator() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, var(--accent), var(--success), var(--accent))",
      "background-size": "200% 100%",
      animation: "shimmer 2s infinite",
      "z-index": 9999,
      "box-shadow": "0 0 10px rgba(59, 130, 246, 0.5)"
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <CharacterProvider>
            <ActiveEffectsProvider>
              <Suspense fallback={<GlobalLoadingIndicator />}>
                {props.children}
              </Suspense>
            </ActiveEffectsProvider>
          </CharacterProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
