import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { DOORS, DOOR_STYLES } from "../data/doors";

/**
 * GalleryView — Card carousel per gallery_ideal_look.png
 *
 * Each card is a LAYERED composition:
 *   - Bottom layer: door photo (portaX.png) filling the black area
 *   - Top layer: card PNG template (cardX.png) with pre-designed layout
 *
 * Navigation: raw keylock_icon.png on each side, no frame, subtle glow on hover.
 * Filter: small color dots top-left corner.
 * Two modes switchable via subtle button.
 *
 * Motion: smooth spring-based offset animation when navigating.
 */

const VISIBLE = 5;
const CARD_W = 220; // px per card
const CARD_GAP = -8; // slight overlap
const CARD_H_RATIO = 1.77; // card aspect ratio (3865/2181)

export default function GalleryView({ onOpenDoor, onNavigate }) {
  const { localize } = useLanguage();
  const [viewMode, setViewMode] = useState("cards");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comingSoon, setComingSoon] = useState(null);
  // Smooth animation offset
  const [animOffset, setAnimOffset] = useState(0);
  const animRef = useRef(null);

  const filteredDoors = activeFilter === "all"
    ? DOORS
    : DOORS.filter(d => d.style === activeFilter);

  const maxStart = Math.max(0, filteredDoors.length - VISIBLE);

  const animateTo = useCallback((targetIndex) => {
    const from = currentIndex;
    const to = Math.max(0, Math.min(maxStart, targetIndex));
    if (from === to) return;

    const diff = to - from;
    let progress = 0;
    cancelAnimationFrame(animRef.current);

    const step = () => {
      progress += 0.06;
      // spring easing
      const ease = 1 - Math.pow(1 - progress, 3);
      if (progress >= 1) {
        setAnimOffset(0);
        setCurrentIndex(to);
        return;
      }
      setAnimOffset(-diff * ease);
      animRef.current = requestAnimationFrame(step);
    };
    setCurrentIndex(to);
    setAnimOffset(diff); // start from old position
    animRef.current = requestAnimationFrame(step);
  }, [currentIndex, maxStart]);

  const goLeft = () => animateTo(currentIndex - 1);
  const goRight = () => animateTo(currentIndex + 1);

  const handleDoorClick = useCallback((door) => {
    if (!door.hasProductPage) {
      setComingSoon(door);
      setTimeout(() => setComingSoon(null), 1800);
      return;
    }
    onOpenDoor(door);
  }, [onOpenDoor]);

  const visibleDoors = filteredDoors.slice(
    Math.max(0, currentIndex),
    currentIndex + VISIBLE
  );

  if (viewMode === "menu") {
    return (
      <GalleryMenuMode
        doors={filteredDoors}
        onOpenDoor={handleDoorClick}
        onSwitch={() => setViewMode("cards")}
        localize={localize}
      />
    );
  }

  const cardH = CARD_W * CARD_H_RATIO;

  return (
    <div style={{
      width: "100vw", height: "100vh",
      overflow: "hidden", position: "relative",
      background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* ── Filter dots — top left ── */}
      <div style={{
        position: "absolute", top: "14px", left: "14px",
        zIndex: 20, display: "flex", gap: "6px", alignItems: "center",
      }}>
        <FilterDot
          color="#fff"
          active={activeFilter === "all"}
          onClick={() => { setActiveFilter("all"); setCurrentIndex(0); }}
        />
        {Object.entries(DOOR_STYLES).map(([key, val]) => (
          <FilterDot
            key={key}
            color={val.color}
            active={activeFilter === key}
            onClick={() => { setActiveFilter(key); setCurrentIndex(0); }}
          />
        ))}
      </div>

      {/* ── View mode toggle ── */}
      <button
        onClick={() => setViewMode("menu")}
        style={{
          position: "absolute", top: "14px", right: "14px",
          zIndex: 20,
          background: "none", border: "none",
          color: "rgba(255,255,255,0.2)",
          fontFamily: "'Helvetica Neue', sans-serif",
          fontSize: "14px", fontWeight: 300,
          cursor: "pointer", transition: "color 0.3s",
          padding: "4px 12px",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
      >
        ☰
      </button>

      {/* ── Left keylock arrow — raw icon, no frame ── */}
      <div style={{
        position: "absolute", left: "24px", top: "50%",
        transform: "translateY(-50%)", zIndex: 20,
      }}>
        <KeylockBtn
          direction="left"
          disabled={currentIndex === 0}
          onClick={goLeft}
        />
      </div>

      {/* ── Card carousel ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: `${CARD_GAP}px`,
        transform: `translateX(${animOffset * (CARD_W + CARD_GAP)}px)`,
        transition: "none", // animation handled in JS
      }}>
        {visibleDoors.map((door, i) => (
          <GalleryCard
            key={door.id}
            door={door}
            index={i}
            cardW={CARD_W}
            cardH={cardH}
            onClick={() => handleDoorClick(door)}
            localize={localize}
          />
        ))}
      </div>

      {/* ── Right keylock arrow — raw icon, no frame ── */}
      <div style={{
        position: "absolute", right: "24px", top: "50%",
        transform: "translateY(-50%)", zIndex: 20,
      }}>
        <KeylockBtn
          direction="right"
          disabled={currentIndex >= maxStart}
          onClick={goRight}
        />
      </div>

      {/* ── "Coming Soon" toast ── */}
      {comingSoon && (
        <div className="fade-in" style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", zIndex: 50,
          background: "rgba(0,0,0,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 32px", backdropFilter: "blur(14px)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "16px", fontWeight: 300, color: "#fff", marginBottom: "6px",
            letterSpacing: "1px",
          }}>
            Coming Soon
          </div>
          <div style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.3)",
          }}>
            {localize(comingSoon.name)}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Gallery card — ORIGINAL working approach:
 *   1. Door photo (bottom) fills the entire card area
 *   2. Card PNG (top) as transparent overlay/frame on top
 *
 * The card PNG is 82% transparent — only the frame, text, borders
 * are opaque. The door photo shows through the transparent areas.
 */
function GalleryCard({ door, index, cardW, cardH, onClick, localize }) {
  const [hover, setHover] = useState(false);
  const hasCard = door.card;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: `${cardW}px`,
        height: `${cardH}px`,
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: "12px",
        transform: hover ? "translateY(-10px) scale(1.03)" : "translateY(0) scale(1)",
        transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s",
        boxShadow: hover ? "0 20px 50px rgba(0,0,0,0.7)" : "0 4px 20px rgba(0,0,0,0.4)",
        zIndex: hover ? 20 : index,
        background: "#000",
      }}
    >
      {/* Bottom layer: door photo fills the entire card */}
      <img
        src={`/media/doors/${door.photo}`}
        alt={localize(door.name)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 1,
        }}
        draggable={false}
      />

      {/* Top layer: card PNG as transparent overlay frame */}
      {hasCard && (
        <img
          src={`/media/cards/${door.card}`}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "fill",
            zIndex: 2,
            pointerEvents: "none",
          }}
          draggable={false}
        />
      )}

      {/* Coming soon overlay for doors 11-13 */}
      {!door.hasProductPage && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "10px", fontWeight: 300, letterSpacing: "2px",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
          }}>
            Coming Soon
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Keylock navigation button — raw icon, no frame ── */
function KeylockBtn({ direction, disabled, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: "8px",
        opacity: disabled ? 0.15 : (hover ? 0.9 : 0.4),
        transition: "opacity 0.3s, filter 0.3s",
        filter: hover && !disabled ? "drop-shadow(0 0 8px rgba(255,255,255,0.4))" : "none",
      }}
    >
      <img
        src="/icons/keylock_icon.png"
        alt={direction === "left" ? "Previous" : "Next"}
        style={{
          width: "32px", height: "32px",
          filter: "invert(1)",
          transform: direction === "left" ? "scaleX(-1)" : "none",
        }}
        draggable={false}
      />
    </button>
  );
}

/* ── Gallery Menu Mode (alternative view) ── */
function GalleryMenuMode({ doors, onOpenDoor, onSwitch, localize }) {
  const [menuIndex, setMenuIndex] = useState(0);
  const door = doors[menuIndex] || doors[0];
  if (!door) return null;

  return (
    <div style={{
      width: "100vw", height: "100vh",
      overflow: "hidden", position: "relative",
      background: "#000",
      display: "flex", alignItems: "center",
    }}>
      <button
        onClick={onSwitch}
        style={{
          position: "absolute", top: "14px", left: "50%",
          transform: "translateX(-50%)", zIndex: 20,
          background: "none", border: "none",
          color: "rgba(255,255,255,0.2)",
          fontFamily: "'Helvetica Neue', sans-serif",
          fontSize: "12px", fontWeight: 300,
          cursor: "pointer", transition: "color 0.3s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
      >
        ▦
      </button>

      {/* Left: list */}
      <div style={{
        width: "28%", height: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 20px",
        overflow: "auto",
      }}>
        {doors.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setMenuIndex(i)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left", padding: "6px 0",
              borderBottom: "1px solid rgba(255,255,255,0.03)",
              opacity: menuIndex === i ? 1 : 0.3,
              transition: "opacity 0.3s",
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: "13px", fontWeight: 300,
              color: "#fff",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => { if (menuIndex !== i) e.currentTarget.style.opacity = 0.3; }}
          >
            {localize(d.name)}
          </button>
        ))}
      </div>

      {/* Center: door photo */}
      <div style={{
        flex: 1, height: "80%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img
          src={`/media/doors/${door.photo}`}
          alt={localize(door.name)}
          onClick={() => onOpenDoor(door)}
          style={{
            maxWidth: "90%", maxHeight: "100%",
            objectFit: "contain",
            cursor: door.hasProductPage ? "pointer" : "default",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ── Filter dot ── */
function FilterDot({ color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: active ? "9px" : "6px",
        height: active ? "9px" : "6px",
        borderRadius: "50%",
        background: active ? color : "transparent",
        border: `1.5px solid ${color}`,
        cursor: "pointer",
        transition: "all 0.2s",
        padding: 0,
        opacity: active ? 1 : 0.4,
      }}
    />
  );
}
