import { TrendingUp, Grid3x3, Users } from "lucide-solid";
import { A } from "@solidjs/router";

type CharacterModalProps = {
  onClose: () => void;
};

export function CharacterModal(props: CharacterModalProps) {
  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: "rgba(0, 0, 0, 0.85)", 
        display: "flex", 
        "align-items": "center", 
        "justify-content": "center",
        "z-index": 1000,
        padding: "1rem"
      }}
      onClick={props.onClose}
    >
      <div 
        class="card"
        style={{ 
          "max-width": "500px",
          width: "100%",
          "max-height": "90vh",
          overflow: "auto",
          margin: 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ "margin-bottom": "1.5rem" }}>Character Menu</h2>
        
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.75rem" }}>
          <A 
            href="/game/stats" 
            style={{ 
              display: "flex",
              "align-items": "center",
              padding: "1rem",
              background: "var(--bg-light)",
              "border-radius": "6px",
              border: "1px solid var(--border)",
              "text-decoration": "none",
              color: "var(--text-primary)",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--bg-light)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            onClick={props.onClose}
          >
            <TrendingUp size={24} style={{ "margin-right": "1rem", "flex-shrink": "0" }} />
            <div>
              <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Stats & Equipment</div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                View and manage your character
              </div>
            </div>
          </A>

          <A 
            href="/game/hotbar" 
            style={{ 
              display: "flex",
              "align-items": "center",
              padding: "1rem",
              background: "var(--bg-light)",
              "border-radius": "6px",
              border: "1px solid var(--border)",
              "text-decoration": "none",
              color: "var(--text-primary)",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--bg-light)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            onClick={props.onClose}
          >
            <Grid3x3 size={24} style={{ "margin-right": "1rem", "flex-shrink": "0" }} />
            <div>
              <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Hotbar Management</div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                Configure abilities and items
              </div>
            </div>
          </A>

          <A 
            href="/character-select" 
            style={{ 
              display: "flex",
              "align-items": "center",
              padding: "1rem",
              background: "var(--bg-light)",
              "border-radius": "6px",
              border: "1px solid var(--border)",
              "text-decoration": "none",
              color: "var(--text-primary)",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--bg-light)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            onClick={props.onClose}
          >
            <Users size={24} style={{ "margin-right": "1rem", "flex-shrink": "0" }} />
            <div>
              <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Character Select</div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                Switch to a different character
              </div>
            </div>
          </A>
        </div>
      </div>
    </div>
  );
}
