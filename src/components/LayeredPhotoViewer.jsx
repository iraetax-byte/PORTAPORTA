import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";

/**
 * LayeredPhotoViewer — Composición interactiva de capas PNG.
 *
 * Pixel-accurate hover detection via canvas 256×256 alpha maps.
 * One layer is active at a time (topmost with alpha > threshold at cursor).
 *
 * Animation types:
 *   "doorknob"  — elastic rotation + return, replays on each new hover (dual-keyframe trick)
 *   "spin"      — continuous slow 360° while hovered
 *   "fullspin"  — single full 360° on hover axis (cerrojo / lock)
 *   "sticker"   — click to attach to cursor, click again to place within bounds
 *
 * Video trigger (config.video present):
 *   Overlays and plays video when cursor crosses the horizontal centre of the viewer.
 *   Pauses / hides when cursor returns to upper half or leaves.
 */

const ALPHA_RES = 256;
const ALPHA_MIN = 15;

/* ── Canvas alpha analysis → alpha map + weighted centroid ── */
function analyzeImage(img) {
  try {
    const cv = document.createElement("canvas");
    cv.width = ALPHA_RES; cv.height = ALPHA_RES;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0, ALPHA_RES, ALPHA_RES);
    const { data } = ctx.getImageData(0, 0, ALPHA_RES, ALPHA_RES);

    let total = 0, sx = 0, sy = 0;
    for (let y = 0; y < ALPHA_RES; y++) {
      for (let x = 0; x < ALPHA_RES; x++) {
        const a = data[(y * ALPHA_RES + x) * 4 + 3];
        if (a > ALPHA_MIN) { total += a; sx += x * a; sy += y * a; }
      }
    }
    return {
      data,
      cx: total > 0 ? sx / total / ALPHA_RES * 100 : 50,
      cy: total > 0 ? sy / total / ALPHA_RES * 100 : 50,
    };
  } catch {
    return null;
  }
}

/* ── Sample alpha at cursor position from 256×256 map ── */
function sampleAlpha(meta, mx, my, containerW, containerH) {
  if (!meta) return 0;
  const px = Math.round(mx / containerW * ALPHA_RES);
  const py = Math.round(my / containerH * ALPHA_RES);
  if (px < 0 || py < 0 || px >= ALPHA_RES || py >= ALPHA_RES) return 0;
  return meta.data[(py * ALPHA_RES + px) * 4 + 3];
}

/* ── CSS keyframes ── */
const KEYFRAMES = `
  /* Doorknob — two identical variants to allow CSS animation replay without remount */
  @keyframes pp-knob-a {
    0%   { transform: rotate(0deg); }
    20%  { transform: rotate(22deg); }
    40%  { transform: rotate(-6deg); }
    62%  { transform: rotate(12deg); }
    78%  { transform: rotate(-3deg); }
    90%  { transform: rotate(5deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes pp-knob-b {
    0%   { transform: rotate(0deg); }
    20%  { transform: rotate(22deg); }
    40%  { transform: rotate(-6deg); }
    62%  { transform: rotate(12deg); }
    78%  { transform: rotate(-3deg); }
    90%  { transform: rotate(5deg); }
    100% { transform: rotate(0deg); }
  }

  /* Continuous slow spin */
  @keyframes pp-spin-cw {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Single full 360° rotation — fullspin (cerrojo) — two variants for replay */
  @keyframes pp-fullspin-a {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pp-fullspin-b {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /*
   * Fall — chapa metálica que se desprende y cae.
   * transform-origin se fija en el TOPE de la chapa (52.8% 48.2%).
   * Fases:
   *   0–63%  → despegue lento + caída con gravedad → opacidad 0
   *   63–65% → reset invisible (transform vuelve a origin, opacidad 0)
   *   65–100%→ fade-in lento de vuelta a posición original
   * Dos variantes (a/b) para poder relanzar la animación sin remount.
   */
  @keyframes pp-fall-a {
    0%   { transform: rotate(0deg)    translateY(0);    opacity: 1; }
    5%   { transform: rotate(1.5deg)  translateY(0.1%); opacity: 1;
           animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1); }
    14%  { transform: rotate(-0.6deg) translateY(0.1%); opacity: 1; }
    28%  { transform: rotate(7deg)    translateY(1.2%); opacity: 1;
           animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
    45%  { transform: rotate(22deg)   translateY(5%);   opacity: 0.9; }
    57%  { transform: rotate(42deg)   translateY(13%);  opacity: 0.3; }
    63%  { transform: rotate(54deg)   translateY(20%);  opacity: 0; }
    64%  { transform: rotate(0deg)    translateY(0);    opacity: 0; }
    100% { transform: rotate(0deg)    translateY(0);    opacity: 1;
           animation-timing-function: cubic-bezier(0, 0, 0.35, 1); }
  }
  @keyframes pp-fall-b {
    0%   { transform: rotate(0deg)    translateY(0);    opacity: 1; }
    5%   { transform: rotate(1.5deg)  translateY(0.1%); opacity: 1;
           animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1); }
    14%  { transform: rotate(-0.6deg) translateY(0.1%); opacity: 1; }
    28%  { transform: rotate(7deg)    translateY(1.2%); opacity: 1;
           animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
    45%  { transform: rotate(22deg)   translateY(5%);   opacity: 0.9; }
    57%  { transform: rotate(42deg)   translateY(13%);  opacity: 0.3; }
    63%  { transform: rotate(54deg)   translateY(20%);  opacity: 0; }
    64%  { transform: rotate(0deg)    translateY(0);    opacity: 0; }
    100% { transform: rotate(0deg)    translateY(0);    opacity: 1;
           animation-timing-function: cubic-bezier(0, 0, 0.35, 1); }
  }
`;

export default function LayeredPhotoViewer({ config, accentColor = "#c4897a", onClose }) {
  const { localize } = useLanguage();

  /* ── Alpha maps & centroid per layer index ── */
  const [metas, setMetas]           = useState({});
  const [activeIdx, setActiveIdx]   = useState(null);

  /* ── Doorknob replay: alternates "a"/"b" to restart animation ── */
  const [knobVariant, setKnobVariant] = useState({});
  /* ── Fullspin replay: same trick ── */
  const [spinVariant, setSpinVariant] = useState({});

  /* ── Fall animation state per layer ── */
  /* fallPhase[idx]: 'idle' | 'falling'  (animating) */
  const [fallPhase, setFallPhase]   = useState({});
  /* fallVariant[idx]: 'a'|'b' — alternates to allow replay via CSS trick */
  const [fallVariant, setFallVariant] = useState({});
  const fallTimers  = useRef({});

  /* ── Zoom state (for layers with zoomCx/zoomCy/zoomScale) ── */
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomLayer, setZoomLayer]   = useState(null); // layer config when zoom is on

  /* ── Sticker state ── */
  const [stickerAttached, setStickerAttached] = useState(false);
  const [stickerPos, setStickerPos]           = useState({ x: 0, y: 0 }); // % relative to container
  const [cursorPos, setCursorPos]             = useState({ x: 0, y: 0 }); // absolute px in container

  /* ── Video state ── */
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef  = useRef(null);

  const containerRef = useRef(null);

  /* ── Layer image load → analyse alpha + centroid ── */
  const onLayerLoad = useCallback((idx, e) => {
    const meta = analyzeImage(e.currentTarget);
    if (meta) setMetas(prev => ({ ...prev, [idx]: meta }));
  }, []);

  /* ── Mouse move: detect active layer + sticker + video threshold ── */
  const onMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    setCursorPos({ x: mx, y: my });

    // Video threshold — plays when cursor in lower half
    if (config.video) {
      const inLowerHalf = my > rect.height / 2;
      setVideoVisible(inLowerHalf);
    }

    // If sticker is attached to cursor, no layer hover needed
    if (stickerAttached) return;

    // Top-down alpha scan for active layer
    let found = null;
    for (let i = config.layers.length - 1; i >= 0; i--) {
      if (sampleAlpha(metas[i], mx, my, rect.width, rect.height) > ALPHA_MIN) {
        found = i;
        break;
      }
    }

    if (found !== activeIdx) {
      if (found !== null) {
        const anim = config.layers[found].animation;
        if (anim === "doorknob") {
          setKnobVariant(prev => ({ ...prev, [found]: prev[found] === "a" ? "b" : "a" }));
        }
        if (anim === "fullspin") {
          setSpinVariant(prev => ({ ...prev, [found]: prev[found] === "a" ? "b" : "a" }));
        }
        if (anim === "fall") {
          // Only trigger if currently idle (not mid-fall or returning)
          setFallPhase(prev => {
            if ((prev[found] || "idle") !== "idle") return prev;
            // Flip variant to restart animation, mark as falling
            setFallVariant(pv => ({ ...pv, [found]: pv[found] === "a" ? "b" : "a" }));
            // After total animation duration (6s), reset to idle so it can re-trigger
            clearTimeout(fallTimers.current[found]);
            fallTimers.current[found] = setTimeout(() => {
              setFallPhase(pp => ({ ...pp, [found]: "idle" }));
            }, 6200);
            return { ...prev, [found]: "falling" };
          });
        }
      }
      setActiveIdx(found);
    }
  }, [config.layers, config.video, metas, activeIdx, stickerAttached]);

  const onMouseLeave = useCallback(() => {
    setActiveIdx(null);
    setVideoVisible(false);
  }, []);

  /* ── Video play/pause control ── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (videoVisible) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [videoVisible]);

  /* ── Click handler: sticker placement + zoom toggle ── */
  const handleContainerClick = useCallback((e) => {
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // ── Zoom toggle: click on a fall layer → zoom in/out ──
    if (activeIdx !== null) {
      const layer = config.layers[activeIdx];
      if (layer?.animation === "fall" && layer.zoomCx != null) {
        setZoomActive(prev => {
          if (!prev) setZoomLayer(layer);
          return !prev;
        });
        return;
      }
    }
    // Exit zoom if clicking while zoomed (no active layer)
    if (zoomActive) {
      setZoomActive(false);
      return;
    }

    // ── Sticker placement ──
    if (activeIdx === null && !stickerAttached) return;

    const stickerIdx = config.layers.findIndex(l => l.animation === "sticker");
    if (stickerIdx < 0) return;

    if (!stickerAttached) {
      if (sampleAlpha(metas[stickerIdx], mx, my, rect.width, rect.height) > ALPHA_MIN) {
        setStickerAttached(true);
        setActiveIdx(null);
      }
    } else {
      const px = Math.max(0, Math.min(100, mx / rect.width * 100));
      const py = Math.max(0, Math.min(100, my / rect.height * 100));
      setStickerPos({ x: px, y: py });
      setStickerAttached(false);
    }
  }, [activeIdx, stickerAttached, zoomActive, config.layers, metas]);

  /* ── transform-origin: computed centroid or fallback ── */
  const getOrigin = (idx) => {
    const m = metas[idx];
    if (m) return `${m.cx.toFixed(1)}% ${m.cy.toFixed(1)}%`;
    return config.layers[idx].origin || "center center";
  };

  /* ── CSS animation value per layer ── */
  const getAnim = (idx) => {
    const layer = config.layers[idx];
    if (layer.animation === "sticker") return "none";

    const type = layer.animation;

    // Fall: animation runs regardless of activeIdx (once triggered by state machine)
    if (type === "fall") {
      const phase = fallPhase[idx] || "idle";
      if (phase === "falling") {
        const v = fallVariant[idx] || "a";
        // 6s total: ~3.8s fall, ~0.1s invisible reset, ~2.1s fade-back
        return `pp-fall-${v} 6s linear forwards`;
      }
      return "none";
    }

    if (activeIdx !== idx) return "none";

    if (type === "doorknob") {
      const v = knobVariant[idx] || "a";
      return `pp-knob-${v} 0.44s cubic-bezier(0.34, 1.3, 0.64, 1) forwards`;
    }
    if (type === "spin") return "pp-spin-cw 1.6s linear infinite";
    if (type === "fullspin") {
      const v = spinVariant[idx] || "a";
      return `pp-fullspin-${v} 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    }
    return "none";
  };

  if (!config) return null;

  /* ── Sticker layer index (if any) ── */
  const stickerIdx = config.layers.findIndex(l => l.animation === "sticker");
  const hasSticker = stickerIdx >= 0;

  /* ── Zoom values from active layer or last zoom target ── */
  const activeZoomLayer = zoomActive ? (zoomLayer || config.layers.find(l => l.zoomCx != null)) : null;
  const zCx    = activeZoomLayer?.zoomCx    ?? 50;
  const zCy    = activeZoomLayer?.zoomCy    ?? 50;
  const zScale = activeZoomLayer?.zoomScale ?? 4;

  /* ── Fall layer uses its own separate renderering path ── */
  const fallLayerIndices = config.layers
    .map((l, i) => l.animation === "fall" ? i : -1)
    .filter(i => i >= 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "rgba(8,7,6,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out", backdropFilter: "blur(8px)",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/*
        ── Composition container ──
        overflow: hidden clips the zoom effect.
        Sizing comes from the base image inside the zoom wrapper (normal flow).
      */}
      <div
        ref={containerRef}
        data-cursor={activeIdx !== null ? "key" : undefined}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={handleContainerClick}
        style={{
          position: "relative",
          maxWidth: "min(72vw, 560px)",
          maxHeight: "72vh",
          overflow: "hidden",          /* clips zoomed content */
          cursor: stickerAttached
            ? "none"
            : activeIdx !== null
            ? "pointer"
            : "default",
          border: `1px solid ${accentColor}22`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${accentColor}0a`,
        }}
      >
        {/*
          ── Zoom wrapper ──
          Normal flow (not absolute) so it gives the container its natural size.
          transform: scale zooms content; overflow clipped by parent.
        */}
        <div style={{
          position: "relative",        /* layers inside use absolute, inset: 0 */
          display: "block",
          transform: zoomActive
            ? `scale(${zScale})`
            : "scale(1)",
          transformOrigin: `${zCx}% ${zCy}%`,
          transition: "transform 0.75s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "transform",
        }}>
          {/* Base image — block element, gives zoom wrapper its natural height */}
          <img
            src={`/interactivephotos/${config.base}`}
            alt="base"
            draggable={false}
            style={{
              display: "block",
              width: "100%",
              maxHeight: "72vh",
              objectFit: "contain",
              userSelect: "none",
            }}
          />

          {/* Interactive layers (non-sticker, non-fall) */}
          {config.layers.map((layer, idx) => {
            if (layer.animation === "sticker") return null;
            if (layer.animation === "fall") return null; // rendered separately below
            return (
              <div
                key={idx}
                style={{
                  position: "absolute", inset: 0,
                  transformOrigin: getOrigin(idx),
                  animation: getAnim(idx),
                  pointerEvents: "none",
                }}
              >
                <img
                  src={`/interactivephotos/${layer.file}`}
                  onLoad={e => onLayerLoad(idx, e)}
                  draggable={false}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "contain", userSelect: "none",
                    filter: activeIdx === idx
                      ? `drop-shadow(0 0 10px ${accentColor}99)`
                      : "none",
                    transition: "filter 0.18s ease",
                  }}
                />
              </div>
            );
          })}

          {/* ── Fall layers — pivot desde el tope de la chapa ── */}
          {fallLayerIndices.map(idx => {
            const layer = config.layers[idx];
            return (
              <div
                key={`fall-${idx}`}
                style={{
                  position: "absolute", inset: 0,
                  transformOrigin: layer.origin || getOrigin(idx),
                  animation: getAnim(idx),
                  pointerEvents: "none",
                  // drop-shadow sutil cuando activo
                  filter: activeIdx === idx
                    ? `drop-shadow(0 0 8px ${accentColor}88)`
                    : "none",
                }}
              >
                <img
                  src={`/interactivephotos/${layer.file}`}
                  onLoad={e => onLayerLoad(idx, e)}
                  draggable={false}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "contain", userSelect: "none",
                  }}
                />
              </div>
            );
          })}
        </div>{/* end zoom+clip wrapper */}

        {/* ── Sticker layer ── */}
        {hasSticker && (
          <img
            src={`/interactivephotos/${config.layers[stickerIdx].file}`}
            onLoad={e => onLayerLoad(stickerIdx, e)}
            draggable={false}
            alt="sticker"
            style={{
              position: "absolute",
              // Placed mode: at stickerPos (percentage). Attached mode: follows cursor.
              left: stickerAttached
                ? `${cursorPos.x}px`
                : `${stickerPos.x}%`,
              top: stickerAttached
                ? `${cursorPos.y}px`
                : `${stickerPos.y}%`,
              // Use px-based transform when attached (cursor center), % when placed
              transform: "translate(-50%, -50%)",
              width: "100%", height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
              filter: stickerAttached
                ? `drop-shadow(0 0 14px ${accentColor}bb)`
                : activeIdx === stickerIdx
                ? `drop-shadow(0 0 8px ${accentColor}88)`
                : "none",
              transition: stickerAttached ? "none" : "filter 0.18s ease",
              // Use separate positioned div for placed vs attached
            }}
          />
        )}

        {/* ── Video overlay ── */}
        {config.video && (
          <video
            ref={videoRef}
            src={`/interactivephotos/${config.video}`}
            loop
            muted
            playsInline
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              opacity: videoVisible ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
          />
        )}

        {/* ── Video threshold indicator ── */}
        {config.video && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0, right: 0,
              height: "1px",
              background: videoVisible
                ? `${accentColor}55`
                : `${accentColor}18`,
              pointerEvents: "none",
              transition: "background 0.3s ease",
            }}
          />
        )}

        {/* ── Zoom active: hint to exit ── */}
        {zoomActive && (
          <div
            className="fade-in"
            style={{
              position: "absolute", bottom: "10px", left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-ui)", fontSize: "7px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: accentColor,
              background: "rgba(8,7,6,0.88)", padding: "4px 10px",
              border: `1px solid ${accentColor}33`,
              pointerEvents: "none",
            }}
          >
            click to exit zoom
          </div>
        )}

        {/* ── Fall layer: zoom hint when hovering ── */}
        {!zoomActive && activeIdx !== null && config.layers[activeIdx]?.animation === "fall" && config.layers[activeIdx]?.zoomCx != null && (
          <div
            className="fade-in"
            style={{
              position: "absolute", bottom: "10px", left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-ui)", fontSize: "7px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: `${accentColor}99`,
              background: "rgba(8,7,6,0.8)", padding: "4px 10px",
              border: `1px solid ${accentColor}22`,
              pointerEvents: "none",
            }}
          >
            click to zoom
          </div>
        )}

        {/* ── Active layer tooltip ── */}
        {activeIdx !== null && !stickerAttached && config.layers[activeIdx]?.label && (
          <div
            className="fade-in"
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)", left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-ui)", fontSize: "8px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: accentColor,
              background: "rgba(8,7,6,0.9)", padding: "5px 10px",
              border: `1px solid ${accentColor}33`,
              backdropFilter: "blur(8px)", pointerEvents: "none",
            }}
          >
            {localize(config.layers[activeIdx].label)}
          </div>
        )}

        {/* ── Sticker tooltip when hovering and not yet attached ── */}
        {hasSticker && activeIdx === stickerIdx && !stickerAttached && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)", left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-ui)", fontSize: "8px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: accentColor,
              background: "rgba(8,7,6,0.9)", padding: "5px 10px",
              border: `1px solid ${accentColor}33`,
              backdropFilter: "blur(8px)", pointerEvents: "none",
            }}
          >
            {localize(config.layers[stickerIdx].label)} — click to lift
          </div>
        )}

        {/* ── Sticker "place" hint when attached ── */}
        {stickerAttached && (
          <div
            style={{
              position: "absolute",
              bottom: "8px", left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-ui)", fontSize: "7px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: accentColor,
              background: "rgba(8,7,6,0.85)", padding: "4px 10px",
              border: `1px solid ${accentColor}33`,
              pointerEvents: "none",
            }}
          >
            click to place
          </div>
        )}

        {/* ── Video: lower-half hint ── */}
        {config.video && !videoVisible && (
          <div
            style={{
              position: "absolute",
              bottom: "8px", left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-ui)", fontSize: "7px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: `${accentColor}88`,
              pointerEvents: "none",
            }}
          >
            hover lower half to reveal
          </div>
        )}
      </div>

      {/* ── Close hint ── */}
      <div style={{
        position: "absolute", bottom: "20px", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "var(--font-ui)", fontSize: "7px",
        letterSpacing: "3px", textTransform: "uppercase",
        color: "rgba(255,255,255,0.18)", pointerEvents: "none",
      }}>
        click outside to close
      </div>
    </div>
  );
}
