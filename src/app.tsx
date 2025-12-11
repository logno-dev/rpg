import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createSignal, Show, ErrorBoundary } from "solid-js";
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
              <ErrorBoundary
                fallback={(err, reset) => {
                  // Log error details for debugging
                  console.error("[App ErrorBoundary]", err);
                  
                  return (
                    <div style={{
                      padding: "2rem",
                      "text-align": "center",
                      "max-width": "600px",
                      margin: "2rem auto"
                    }}>
                      <div class="card">
                        <h2 style={{ color: "var(--danger)" }}>Something went wrong</h2>
                        <p style={{ color: "var(--text-secondary)", "margin": "1rem 0" }}>
                          An error occurred while loading this page. Please try refreshing.
                        </p>
                        <details style={{ "margin-top": "1rem", "text-align": "left" }}>
                          <summary style={{ cursor: "pointer", "margin-bottom": "0.5rem" }}>
                            Error Details
                          </summary>
                          <pre style={{ 
                            "background": "var(--bg-dark)", 
                            padding: "1rem", 
                            "border-radius": "4px",
                            "overflow-x": "auto",
                            "font-size": "0.875rem"
                          }}>
                            {err?.toString()}
                          </pre>
                        </details>
                        <button 
                          class="button primary" 
                          onClick={() => window.location.reload()}
                          style={{ "margin-top": "1rem" }}
                        >
                          Reload Page
                        </button>
                      </div>
                    </div>
                  );
                }}
              >
                <Suspense fallback={<GlobalLoadingIndicator />}>
                  {props.children}
                </Suspense>
              </ErrorBoundary>
            </ActiveEffectsProvider>
          </CharacterProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
