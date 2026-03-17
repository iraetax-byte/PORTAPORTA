import { useState, useRef } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { DOOR_STYLES } from "../data/doors";
import { INTERACTIVE_LAYERS } from "../data/interactiveLayers";
import LayeredPhotoViewer from "./LayeredPhotoViewer";

/**
 * DoorViewer — Point-and-click interactive door photo.
 * Displays the door photo with interactive hotspots.
 * Hovering over hotspots makes detail elements shift/float like point-and-click adventure games.
 * Clicking a hotspot shows the detail image in an overlay.
 */
export default function DoorViewer({ door }) {
  const { localize } = useLanguage();
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [detailView, setDetailView] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  if (!door) return null;

  const accentColor = DOOR_STYLES[door.style]?.color || "#c4897a";

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Parallax offset based on mouse position
  const parallaxX = (mousePos.x - 50) * 0.08;
  const parallaxY = (mousePos.y - 50) * 0.08;

  return (
    <div
      ref={containerRef}
      className="cursor-explore"
      onMouseMove={handleMouseMove}
      style={{
        position: "relative", width: "100%", height: "100%",
        overflow: "hidden", background: "var(--pp-black)",
      }}
    >
      {/* Background subtle vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,9,8,0.7) 100%)",
        pointerEvents: "none",
      }} />

      {/* Door photograph with subtle parallax */}
      <div style={{
        position: "absolute", inset: "-3%",
        transition: "transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
        transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.04)`,
      }}>
        <img
          src={`/media/doors/${door.photo}`}
          alt={localize(door.name)}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            filter: "brightness(0.75) contrast(1.05) saturate(0.9)",
          }}
          draggable={false}
        />
      </div>

      {/* Hotspot overlays */}
      {door.hotspots?.map((hotspot) => {
        const isActive = activeHotspot === hotspot.id;
        // Hotspot elements shift when hovered — point-and-click feel
        const shiftX = isActive ? (Math.random() > 0.5 ? 3 : -3) : 0;
        const shiftY = isActive ? -4 : 0;

        return (
          <div
            key={hotspot.id}
            onMouseEnter={() => setActiveHotspot(hotspot.id)}
            onMouseLeave={() => setActiveHotspot(null)}
            onClick={() => {
                const detailKey = hotspot.detail?.replace(/\.(jpg|png|jpeg)$/i, "");
                const layerConfig = INTERACTIVE_LAYERS[detailKey];
                setDetailView({ ...hotspot, layerConfig: layerConfig || null });
              }}
            data-cursor="key"
            style={{
              position: "absolute", zIndex: 10, cursor: "pointer",
              left: `${hotspot.x}%`, top: `${hotspot.y}%`,
              width: `${hotspot.w}%`, height: `${hotspot.h}%`,
              border: isActive ? `1px solid ${accentColor}88` : "1px solid transparent",
              background: isActive ? `${accentColor}0d` : "transparent",
              transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
              transform: `translate(${shiftX}px, ${shiftY}px)`,
              borderRadius: "2px",
            }}
          >
            {/* Hotspot indicator dot */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: isActive ? "10px" : "6px",
              height: isActive ? "10px" : "6px",
              borderRadius: "50%",
              background: accentColor,
              opacity: isActive ? 0.9 : 0.5,
              transition: "all 0.3s",
              boxShadow: isActive ? `0 0 16px ${accentColor}66` : "none",
            }} />

            {/* Label on hover */}
            {isActive && (
              <div className="fade-in" style={{
                position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
                transform: "translateX(-50%)", whiteSpace: "nowrap",
                fontFamily: "var(--font-ui)", fontSize: "8px",
                letterSpacing: "2.5px", textTransform: "uppercase",
                color: accentColor, background: "rgba(10,9,8,0.85)",
                padding: "5px 10px", border: `1px solid ${accentColor}33`,
                backdropFilter: "blur(8px)",
              }}>
                {localize(hotspot.label)}
              </div>
            )}
          </div>
        );
      })}

      {/* Detail overlay when hotspot is clicked */}
      {detailView && (
        detailView.layerConfig
          /* ── Layered interactive view ── */
          ? <LayeredPhotoViewer
              config={detailView.layerConfig}
              accentColor={accentColor}
              onClose={() => setDetailView(null)}
            />
          /* ── Flat image fallback ── */
          : <div
              onClick={() => setDetailView(null)}
              style={{
                position: "absolute", inset: 0, zIndex: 50,
                background: "rgba(10,9,8,0.88)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", backdropFilter: "blur(6px)",
              }}
            >
              <div className="fade-in" style={{ maxWidth: "70%", maxHeight: "70%", position: "relative" }}>
                <img
                  src={`/media/details/${detailView.detail}`}
                  alt={localize(detailView.label)}
                  style={{
                    maxWidth: "100%", maxHeight: "60vh", objectFit: "contain",
                    border: `1px solid ${accentColor}33`,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accentColor}11`,
                  }}
                />
                <div style={{
                  marginTop: "12px", textAlign: "center",
                  fontFamily: "var(--font-ui)", fontSize: "9px",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: accentColor,
                }}>
                  {localize(detailView.label)}
                </div>
              </div>
            </div>
      )}

      {/* Bottom gradient fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "120px", zIndex: 5,
        background: "linear-gradient(transparent, var(--pp-black))",
        pointerEvents: "none",
      }} />

      {/* Top-left hint label */}
      <div className="fade-in stagger-3" style={{
        position: "absolute", bottom: "20px", left: "20px", zIndex: 10,
        fontFamily: "var(--font-ui)", fontSize: "8px",
        letterSpacing: "3px", textTransform: "uppercase",
        color: "var(--pp-dim)", opacity: 0.6,
      }}>
        ● {door.hotspots?.length || 0} interactive details
      </div>
    </div>
  );
}
