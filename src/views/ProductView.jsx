import { useState, useRef, useCallback } from "react";
import { useLanguage } from "../utils/LanguageContext";
import LayeredPhotoViewer from "../components/LayeredPhotoViewer";
import { INTERACTIVE_LAYERS } from "../data/interactiveLayers";

/**
 * ProductView — Pure maquetación.
 *
 * Layer order:
 *   1. Black background
 *   2. Product PNG (z-index 1) — bottom frame with all text/design
 *   3. Door photo (z-index 2) — fills the black rectangle area ON TOP
 *   4. Interactive zone (z-index 3) — parallax mouse-tracking + point-and-click hotspots
 *
 * Product black rectangle: top=5.8%, left=3.2%, width=41.7%, height=88.4%
 *
 * The door photo has a parallax effect: moving the mouse inside the photo
 * causes a subtle shift emulating the viewer's gaze direction.
 * Clicking hotspot zones opens detail images from /details.
 */

export default function ProductView({ door, onNavigate, onBack }) {
  const { localize } = useLanguage();
  const [detailView, setDetailView] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const photoRef = useRef(null);

  if (!door) return null;

  // Parallax: track mouse position inside the door photo area
  const handlePhotoMouseMove = useCallback((e) => {
    const rect = photoRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  }, []);

  const handlePhotoMouseLeave = useCallback(() => {
    setMousePos({ x: 0.5, y: 0.5 });
  }, []);

  // Parallax offset: subtle shift based on mouse position
  const parallaxX = (mousePos.x - 0.5) * -12; // px
  const parallaxY = (mousePos.y - 0.5) * -12;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "#000",
      }}
    >
      {/* ── Product PNG — bottom layer frame with all pre-designed content ── */}
      <img
        src={`/media/products/product${door.id}.png`}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 1,
          pointerEvents: "none",
        }}
        draggable={false}
      />

      {/* ── Door photo — ON TOP in the black rectangle, with parallax ── */}
      <div
        ref={photoRef}
        onMouseMove={handlePhotoMouseMove}
        onMouseLeave={handlePhotoMouseLeave}
        style={{
          position: "absolute",
          left: "3.2%",
          top: "5.8%",
          width: "41.7%",
          height: "88.4%",
          zIndex: 2,
          overflow: "hidden",
          cursor: "crosshair",
        }}
      >
        <img
          src={`/media/doors/${door.photo}`}
          alt={localize(door.name)}
          style={{
            position: "absolute",
            /* Slightly oversized to allow parallax movement */
            top: `${parallaxY - 6}px`,
            left: `${parallaxX - 6}px`,
            width: "calc(100% + 12px)",
            height: "calc(100% + 12px)",
            objectFit: "cover",
            objectPosition: "center",
            transition: "top 0.15s ease-out, left 0.15s ease-out",
          }}
          draggable={false}
        />

        {/* ── Interactive hotspots over door photo ── */}
        {door.hotspots?.map((hotspot) => (
          <div
            key={hotspot.id}
            onClick={() => {
              const detailKey = hotspot.detail?.replace(/\.(jpg|png|jpeg)$/i, "");
              const layerConfig = INTERACTIVE_LAYERS[detailKey];
              setDetailView({ ...hotspot, layerConfig: layerConfig || null });
            }}
            style={{
              position: "absolute",
              left: `${hotspot.x}%`, top: `${hotspot.y}%`,
              width: `${hotspot.w}%`, height: `${hotspot.h}%`,
              cursor: "pointer",
              border: "1px solid transparent",
              transition: "all 0.3s",
              zIndex: 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.2)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = "1px solid transparent";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "5px", height: "5px", borderRadius: "50%",
              background: "rgba(255,255,255,0.5)", opacity: 0.4,
              boxShadow: "0 0 6px rgba(255,255,255,0.15)",
            }} />
          </div>
        ))}
      </div>

      {/* ── Back button — keylock icon bottom-left ── */}
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          bottom: "16px", left: "16px",
          zIndex: 10,
          background: "none", border: "none",
          cursor: "pointer", padding: "8px",
          opacity: 0.3,
          transition: "opacity 0.3s, filter 0.3s",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(255,255,255,0.4))"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.3; e.currentTarget.style.filter = "none"; }}
      >
        <img
          src="/icons/keylock_icon.png"
          alt="Back"
          style={{
            width: "28px", height: "28px",
            filter: "invert(1)",
            transform: "scaleX(-1)",
          }}
          draggable={false}
        />
      </button>

      {/* ── Detail overlay (hotspot clicked) ── */}
      {detailView && (
        detailView.layerConfig
          ? <LayeredPhotoViewer
              config={detailView.layerConfig}
              accentColor="rgba(255,255,255,0.5)"
              onClose={() => setDetailView(null)}
            />
          : <div
              onClick={() => setDetailView(null)}
              style={{
                position: "absolute", inset: 0, zIndex: 50,
                background: "rgba(0,0,0,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", backdropFilter: "blur(6px)",
              }}
            >
              <img
                src={`/media/details/${detailView.detail}`}
                alt=""
                style={{
                  maxWidth: "70%", maxHeight: "70vh", objectFit: "contain",
                }}
              />
            </div>
      )}
    </div>
  );
}
