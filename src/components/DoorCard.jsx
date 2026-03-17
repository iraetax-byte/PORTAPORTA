import { useLanguage } from "../utils/LanguageContext";
import { DOOR_STYLES } from "../data/doors";

/**
 * DoorCard — The "open card" format.
 * Full detail panel for a selected door.
 * Shows: title, image, century, style, material, features, description.
 * Buttons: Go to Map, View on Timeline.
 */
export default function DoorCard({ door, onGoToMap, onClose }) {
  const { t, localize } = useLanguage();
  if (!door) return null;

  const style = DOOR_STYLES[door.style];
  const accentColor = style?.color || "var(--pp-gold)";

  return (
    <div className="fade-in" style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "var(--pp-panel)", overflow: "hidden",
    }}>
      {/* Accent line top */}
      <div style={{
        height: "2px", flexShrink: 0,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
      }} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px 20px" }}>
        {/* Style badge */}
        <div style={{
          fontFamily: "var(--font-ui)", fontSize: "9px",
          letterSpacing: "3.5px", textTransform: "uppercase",
          color: accentColor, marginBottom: "6px",
        }}>
          {localize(style?.label)} · {style?.years}
        </div>

        {/* Door name */}
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "28px",
          fontWeight: 300, fontStyle: "italic", color: "var(--pp-cream)",
          lineHeight: 1.15, marginBottom: "8px",
        }}>
          {localize(door.name)}
        </h2>

        {/* Address */}
        <div style={{
          fontFamily: "var(--font-ui)", fontSize: "10px",
          letterSpacing: "1.5px", color: "var(--pp-dim)",
          marginBottom: "20px",
        }}>
          {door.address}
        </div>

        {/* Divider */}
        <div style={{
          height: "1px", marginBottom: "20px",
          background: `linear-gradient(90deg, ${accentColor}33, transparent)`,
        }} />

        {/* Metadata grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "16px", marginBottom: "24px",
        }}>
          <MetaField label={t("door.century")} value={door.century} accent={accentColor} />
          <MetaField label={t("door.year")} value={door.year || "—"} accent={accentColor} />
          <MetaField label={t("door.architect")} value={door.architect || t("door.unknown")} accent={accentColor} />
          <MetaField label={t("door.style")} value={localize(style?.label)} accent={accentColor} />
        </div>

        {/* Materials */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            fontFamily: "var(--font-ui)", fontSize: "8px",
            letterSpacing: "3px", textTransform: "uppercase",
            color: "var(--pp-dim)", marginBottom: "6px",
          }}>
            {t("door.materials")}
          </div>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: "13px",
            fontStyle: "italic", color: "var(--pp-muted)", lineHeight: 1.6,
          }}>
            {localize(door.materials)}
          </div>
        </div>

        {/* Description */}
        <div style={{
          fontFamily: "var(--font-body)", fontSize: "14px",
          fontStyle: "italic", color: "var(--pp-muted)",
          lineHeight: 1.9, marginBottom: "28px",
        }}>
          {localize(door.description)}
        </div>

        {/* Century watermark */}
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "72px",
          fontWeight: 300, fontStyle: "italic",
          color: `${accentColor}08`, lineHeight: 1,
          textAlign: "right", marginBottom: "20px",
          userSelect: "none",
        }}>
          {door.century}
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        flexShrink: 0, padding: "16px 32px",
        borderTop: "1px solid var(--pp-border)",
        display: "flex", gap: "10px",
      }}>
        <ActionBtn label={t("door.viewOnMap")} accent={accentColor} onClick={() => onGoToMap?.(door)} />
        <ActionBtn label={t("door.viewTimeline")} accent={accentColor} muted onClick={() => {}} />
        {onClose && (
          <button onClick={onClose} style={{
            background: "none", border: "1px solid var(--pp-dim)",
            color: "var(--pp-dim)", fontFamily: "var(--font-ui)",
            fontSize: "13px", padding: "8px 12px", cursor: "pointer",
            transition: "all 0.2s",
          }}>✕</button>
        )}
      </div>

      {/* Accent line bottom */}
      <div style={{
        height: "2px", flexShrink: 0,
        background: `linear-gradient(90deg, transparent, ${accentColor}44, transparent)`,
      }} />
    </div>
  );
}

function MetaField({ label, value, accent }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-ui)", fontSize: "8px",
        letterSpacing: "3px", textTransform: "uppercase",
        color: "var(--pp-dim)", marginBottom: "4px",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "16px",
        fontWeight: 400, color: "var(--pp-cream-soft)",
      }}>
        {value}
      </div>
    </div>
  );
}

function ActionBtn({ label, accent, muted, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, background: "none", cursor: "pointer",
      border: `1px solid ${muted ? 'var(--pp-dim)' : accent + '55'}`,
      color: muted ? "var(--pp-dim)" : accent,
      fontFamily: "var(--font-ui)", fontSize: "8px",
      letterSpacing: "2.5px", textTransform: "uppercase",
      padding: "10px 8px", transition: "all 0.3s",
    }}
    onMouseEnter={e => {
      e.target.style.background = muted ? 'var(--pp-wood-dark)' : `${accent}11`;
      e.target.style.borderColor = muted ? 'var(--pp-muted)' : accent;
    }}
    onMouseLeave={e => {
      e.target.style.background = 'none';
      e.target.style.borderColor = muted ? 'var(--pp-dim)' : `${accent}55`;
    }}>
      {label}
    </button>
  );
}
