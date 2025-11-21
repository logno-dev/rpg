import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { CharacterProvider } from "~/lib/CharacterContext";
import { ActiveEffectsProvider } from "~/lib/ActiveEffectsContext";
import "./styles/global.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <CharacterProvider>
            <ActiveEffectsProvider>
              <Suspense>{props.children}</Suspense>
            </ActiveEffectsProvider>
          </CharacterProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
