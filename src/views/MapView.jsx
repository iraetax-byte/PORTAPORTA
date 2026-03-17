import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { DOORS, DOOR_STYLES, MAP_REFERENCE_POINTS } from "../data/doors";

/**
 * MapView — Barcelona map with door markers.
 *
 * Per map_ideal_look.png:
 *   - Dark map background
 *   - When a door marker is clicked, a SIDE CARD appears on the left
 *     with door name (script), building info, and a keylock icon at the bottom
 *     that acts as a "more details" button → navigates to ProductView
 *   - Keylock icon glows/spins like a doorknob when hovered
 *   - Filter by style via minimal color dots
 *   - Coming soon doors (11-13) show brief message instead of product link
 */

const INITIAL_ZOOM = 2.8;
const MIN_ZOOM = 1.8;
const MAX_ZOOM = 5;

function loadRefPoints() {
  try {
    const saved = localStorage.getItem("pp-reference-points");
    if (saved) return JSON.parse(saved);
  } catch {}
  return MAP_REFERENCE_POINTS;
}

export default function MapView({ onOpenDoor, selectedDoor, onNavigate }) {
  const { t, localize } = useLanguage();
  const [filters, setFilters] = useState(Object.keys(DOOR_STYLES));
  const [refPoints] = useState(loadRefPoints);
  const [activeDoor, setActiveDoor] = useState(selectedDoor || null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [keylockHover, setKeylockHover] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panAtDragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const mappedDoors = DOORS.filter(
    (d) => d.mapX !== null && d.mapY !== null && filters.includes(d.style)
  );

  const clamp = useCallback((newPan, currentZoom) => {
    if (!containerRef.current) return newPan;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const maxX = Math.max(0, (width * (currentZoom - 1)) / 2);
    const maxY = Math.max(0, (height * (currentZoom - 1)) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, newPan.x)),
      y: Math.max(-maxY, Math.min(maxY, newPan.y)),
    };
  }, []);

  useEffect(() => {
    if (selectedDoor && selectedDoor.mapX !== null) {
      setActiveDoor(selectedDoor);
    }
  }, [selectedDoor]);

  const toggleFilter = (style) => {
    setFilters((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom((z) => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta));
        setPan((p) => clamp(p, newZoom));
        return newZoom;
      });
    },
    [clamp]
  );

  const handleMouseDown = (e) => {
    if (e.target.closest("[data-door-marker]")) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panAtDragStartRef.current = pan;
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const raw = {
        x: panAtDragStartRef.current.x + dx,
        y: panAtDragStartRef.current.y + dy,
      };
      setPan(clamp(raw, zoom));
    },
    [isDragging, zoom, clamp]
  );

  const handleMouseUp = () => setIsDragging(false);

  // Touch support
  const lastTouchRef = useRef(null);
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      panAtDragStartRef.current = pan;
    }
  };
  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;
        setPan(clamp({ x: panAtDragStartRef.current.x + dx, y: panAtDragStartRef.current.y + dy }, zoom));
      }
    },
    [isDragging, zoom, clamp]
  );
  const handleTouchEnd = () => setIsDragging(false);

  const handleMarkerClick = (door) => {
    setActiveDoor(door);
  };

  const handleOpenProduct = () => {
    if (!activeDoor) return;
    if (!activeDoor.hasProductPage) return;
    onOpenDoor(activeDoor);
  };

  return (
    <div style={{
      width: "100%", height: "100vh",
      overflow: "hidden", position: "relative",
      background: "var(--pp-black)",
    }}>
      <style>{`
        @keyframes keylockGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(196,137,122,0.3)); }
          50% { filter: drop-shadow(0 0 12px rgba(196,137,122,0.6)); }
        }
        @keyframes keylockTurn {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(25deg); }
          60% { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ── Interactive map area ── */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%", height: "100%",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          position: "relative",
        }}
      >
        {/* Transformed inner world */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.18s ease-out",
            position: "relative",
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "90%", maxWidth: "800px" }}>
            <img
              src="/media/map/barcelona-map.jpg"
              alt="Barcelona"
              style={{
                width: "100%", display: "block",
                filter: "brightness(0.52) contrast(1.12) sepia(0.18) saturate(0.65)",
                borderRadius: "1px",
              }}
              draggable={false}
            />

            {/* Reference points */}
            {refPoints.map((pt, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${pt.x}%`, top: `${pt.y}%`,
                  width: 0, height: 0,
                  pointerEvents: "none",
                }}
              >
                <div style={{
                  position: "absolute",
                  width: 5, height: 5, borderRadius: "50%",
                  background: "rgba(255,255,255,0.4)",
                  boxShadow: "0 0 5px rgba(255,255,255,0.2)",
                  transform: "translate(-50%, -50%)",
                }} />
                <div style={{
                  position: "absolute", top: "5px", left: 0,
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-ui)", fontSize: "6px",
                  letterSpacing: "1.8px", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  textShadow: "0 1px 5px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)",
                }}>
                  {pt.name}
                </div>
              </div>
            ))}

            {/* Door markers */}
            {mappedDoors.map((door) => {
              const styleData = DOOR_STYLES[door.style];
              const isActive = activeDoor?.id === door.id;
              return (
                <div
                  key={door.id}
                  data-door-marker
                  onClick={() => handleMarkerClick(door)}
                  style={{
                    position: "absolute",
                    left: `${door.mapX}%`, top: `${door.mapY}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                    zIndex: isActive ? 30 : 10,
                  }}
                >
                  <div style={{
                    width: isActive ? "28px" : "18px",
                    height: isActive ? "28px" : "18px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isActive ? `${styleData.color}30` : "rgba(10,9,8,0.72)",
                    border: `1px solid ${isActive ? styleData.color : styleData.color + "44"}`,
                    borderRadius: "50%",
                    transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                    boxShadow: isActive
                      ? `0 0 18px ${styleData.color}40`
                      : `0 2px 8px rgba(0,0,0,0.5)`,
                  }}>
                    <img
                      src={`/icons/${styleData.icon}`}
                      alt=""
                      style={{
                        height: isActive ? "14px" : "10px",
                        width: "auto",
                        maxWidth: isActive ? "14px" : "10px",
                        objectFit: "contain",
                        filter: `brightness(0) invert(1) opacity(${isActive ? 1 : 0.55})`,
                        transition: "all 0.3s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vignette overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
          boxShadow: "inset 0 0 80px 45px var(--pp-black), inset 0 0 140px 60px rgba(10,9,8,0.7)",
        }} />
      </div>

      {/* ── Filter dots — top left ── */}
      <div style={{
        position: "absolute",
        top: "16px", left: "16px",
        zIndex: 20,
        display: "flex", gap: "6px", alignItems: "center",
      }}>
        {Object.entries(DOOR_STYLES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            title={localize(val.label)}
            style={{
              width: filters.includes(key) ? "9px" : "6px",
              height: filters.includes(key) ? "9px" : "6px",
              borderRadius: "50%",
              background: filters.includes(key) ? val.color : "transparent",
              border: `1.5px solid ${val.color}`,
              cursor: "pointer",
              transition: "all 0.2s",
              padding: 0,
              opacity: filters.includes(key) ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* ── Side card — card PNG frame + door photo in rectangle ── */}
      {activeDoor && (
        <div
          className="fade-in"
          style={{
            position: "absolute",
            left: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "220px",
            height: `${220 * 1.77}px`,
            zIndex: 30,
            cursor: "pointer",
          }}
          onClick={activeDoor.hasProductPage ? handleOpenProduct : undefined}
        >
          {/* Card PNG as bottom frame */}
          {activeDoor.card && (
            <img
              src={`/media/cards/${activeDoor.card}`}
              alt=""
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "fill",
                zIndex: 1,
              }}
              draggable={false}
            />
          )}

          {/* Door photo fills the black rectangle inside the card
              Card rect: top=11.2%, left=27.7%, width=44.6%, height=32.5% */}
          <img
            src={`/media/doors/${activeDoor.photo}`}
            alt={localize(activeDoor.name)}
            style={{
              position: "absolute",
              top: "11.2%",
              left: "27.7%",
              width: "44.6%",
              height: "32.5%",
              objectFit: "cover",
              objectPosition: "center",
              zIndex: 2,
            }}
            draggable={false}
          />

          {/* Keylock button at bottom center of card */}
          <div style={{
            position: "absolute",
            bottom: "4%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
          }}>
            {activeDoor.hasProductPage ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenProduct(); }}
                onMouseEnter={() => setKeylockHover(true)}
                onMouseLeave={() => setKeylockHover(false)}
                style={{
                  background: "none", border: "none",
                  cursor: "pointer", padding: "6px",
                }}
              >
                <img
                  src="/icons/keylock_icon.png"
                  alt="More details"
                  style={{
                    width: "24px", height: "24px",
                    filter: "invert(1)",
                    opacity: keylockHover ? 1 : 0.4,
                    animation: keylockHover ? "keylockTurn 0.5s ease forwards, keylockGlow 1.5s ease infinite" : "none",
                    transition: "opacity 0.3s",
                  }}
                />
              </button>
            ) : (
              <div style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "10px", fontWeight: 300,
                color: "rgba(255,255,255,0.2)", padding: "6px",
                letterSpacing: "1px",
              }}>
                Coming Soon
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setActiveDoor(null); }}
            style={{
              position: "absolute", top: "4px", right: "4px",
              background: "rgba(0,0,0,0.5)", border: "none",
              color: "rgba(255,255,255,0.3)", fontSize: "11px",
              cursor: "pointer", padding: "3px 7px", zIndex: 4,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function MapCardRow({ label, value }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "baseline", padding: "4px 0",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
    }}>
      <span style={{
        fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: "11px", fontWeight: 300,
        color: "rgba(255,255,255,0.3)",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: "12px", fontWeight: 400,
        color: "rgba(255,255,255,0.8)",
        textAlign: "right", maxWidth: "55%",
      }}>
        {value}
      </span>
    </div>
  );
}
