import { TrendingUp, Grid3x3, Users, LogOut, SquareArrowOutUpRight } from "lucide-solid";
import { A, useNavigate } from "@solidjs/router";

type CharacterModalProps = {
  onClose: () => void;
};

export function CharacterModal(props: CharacterModalProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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
          margin: 0,
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button in top right corner */}
        <button
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            width: "32px",
            height: "32px",
            "border-radius": "50%",
            background: "var(--bg-light)",
            border: "1px solid var(--text-secondary)",
            color: "var(--text)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            cursor: "pointer",
            "font-size": "1.25rem",
            "line-height": "1",
            padding: "0",
            transition: "all 0.2s ease",
            "z-index": 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger)";
            e.currentTarget.style.borderColor = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-light)";
            e.currentTarget.style.borderColor = "var(--text-secondary)";
          }}
          onClick={props.onClose}
        >
          ×
        </button>

        <h2 style={{ "margin-bottom": "1.5rem", "padding-right": "2.5rem" }}>Character Menu</h2>
        
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
              <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Character Stats</div>
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
              <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Abilities</div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                Configure abilities and items
              </div>
            </div>
          </A>

          <a 
            href="/wiki" 
            target="_blank"
            rel="noopener noreferrer"
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
          >
            <SquareArrowOutUpRight size={24} style={{ "margin-right": "1rem", "flex-shrink": "0" }} />
            <div>
              <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Morthvale Wiki</div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                Browse guides and game info
              </div>
            </div>
          </a>

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

          <button 
            style={{ 
              display: "flex",
              "align-items": "center",
              padding: "1rem",
              background: "var(--bg-light)",
              "border-radius": "6px",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              transition: "all 0.2s",
              cursor: "pointer",
              width: "100%"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--danger)";
              e.currentTarget.style.borderColor = "var(--danger)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--bg-light)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            onClick={handleSignOut}
          >
            <LogOut size={24} style={{ "margin-right": "1rem", "flex-shrink": "0" }} />
            <div style={{ "text-align": "left" }}>
              <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Sign Out</div>
              <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
                Log out of your account
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
