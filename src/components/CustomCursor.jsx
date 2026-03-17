import { useState, useEffect, useRef } from "react";

/**
 * CustomCursor — Cerrojo → Llave
 *
 * • mix-blend-mode: difference  → blanco invierte sobre fondos claros (negro)
 *   y se mantiene blanco sobre fondos oscuros. Contraste automático.
 *
 * • Imán fuerte: elementos ≥ 44px atraen el cursor con fuerza 0.38.
 *   Al magnetizarse, el cursor escala 1.25×.
 *
 * • Tamaño: 24×24 px.
 *
 * Arquitectura de dos capas:
 *   outerRef → translate3d vía RAF (sin conflicto con React state)
 *   innerDiv → scale vía React state + CSS transition
 */

const CURSOR_HALF = 12;       // 24×24 px
const LERP_SPEED  = 0.14;
const MAGNET_STR  = 0.38;
const MAGNET_MIN  = 44;
const MORPH_MS    = 115;

const INTERACTIVE = [
  "a", "button", '[role="button"]', "[data-door-marker]",
  "input[type=button]", "input[type=submit]", "label[for]",
  "select", "[data-cursor=key]",
].join(",");

function lerp(a, b, t) { return a + (b - a) * t; }

export default function CustomCursor() {
  const [visible,    setVisible]    = useState(false);
  const [isKey,      setIsKey]      = useState(false);
  const [morphing,   setMorphing]   = useState(false);
  const [magnetized, setMagnetized] = useState(false);

  const rawMouse  = useRef({ x: -200, y: -200 });
  const smoothPos = useRef({ x: -200, y: -200 });
  const outerRef  = useRef(null);   // solo traslación (RAF)
  const rafRef    = useRef(null);
  const morphTmr  = useRef(null);
  const prevKey   = useRef(false);
  const magnetEl  = useRef(null);

  /* 1 — Seguimiento del mouse */
  useEffect(() => {
    const onMove = (e) => {
      rawMouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    document.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [visible]);

  /* 2 — Detección de interactivos + imán */
  useEffect(() => {
    const onOver = (e) => {
      const el  = e.target.closest(INTERACTIVE);
      const hit = !!el;

      if (el) {
        const rect = el.getBoundingClientRect();
        const wide = rect.width >= MAGNET_MIN;
        magnetEl.current = wide ? el : null;
        setMagnetized(wide);
      } else {
        magnetEl.current = null;
        setMagnetized(false);
      }

      if (hit !== prevKey.current) {
        prevKey.current = hit;
        clearTimeout(morphTmr.current);
        setMorphing(true);
        morphTmr.current = setTimeout(() => {
          setIsKey(hit);
          setTimeout(() => setMorphing(false), MORPH_MS + 50);
        }, MORPH_MS);
      }
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => document.removeEventListener("mouseover", onOver);
  }, []);

  /* 3 — RAF: solo traslación en outerRef */
  useEffect(() => {
    const tick = () => {
      let tx = rawMouse.current.x;
      let ty = rawMouse.current.y;

      if (magnetEl.current) {
        const r = magnetEl.current.getBoundingClientRect();
        tx += (r.left + r.width  / 2 - tx) * MAGNET_STR;
        ty += (r.top  + r.height / 2 - ty) * MAGNET_STR;
      }

      smoothPos.current.x = lerp(smoothPos.current.x, tx, LERP_SPEED);
      smoothPos.current.y = lerp(smoothPos.current.y, ty, LERP_SPEED);

      if (outerRef.current) {
        outerRef.current.style.transform =
          `translate3d(${smoothPos.current.x - CURSOR_HALF}px,${smoothPos.current.y - CURSOR_HALF}px,0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const SIZE = CURSOR_HALF * 2;

  const baseFilter = "invert(1)";
  const blurFilter = "invert(1) blur(3px)";

  const iconStyle = (active) => ({
    position:   "absolute",
    inset:      0,
    width:      "100%",
    height:     "100%",
    objectFit:  "contain",
    userSelect: "none",
    filter:     morphing ? blurFilter : baseFilter,
    opacity:    active ? 1 : 0,
    transform:  active ? "scale(1)" : "scale(0.68)",
    transformOrigin: "center center",
    transition: [
      "opacity 0.2s ease",
      "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
      `filter ${MORPH_MS}ms ease`,
    ].join(", "),
  });

  return (
    /* outerRef: posición fija en (0,0) — la traslación la mueve el RAF */
    <div
      ref={outerRef}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         `${SIZE}px`,
        height:        `${SIZE}px`,
        pointerEvents: "none",
        zIndex:        100000,
        opacity:       visible ? 0.6 : 0,
        transition:    "opacity 0.28s ease",
        willChange:    "transform",
      }}
    >
      {/* innerDiv: solo escala (mix-blend-mode aquí para incluir el efecto) */}
      <div
        style={{
          position:     "absolute",
          inset:        0,
          mixBlendMode: "difference",
          transform:    magnetized ? "scale(1.25)" : "scale(1)",
          transformOrigin: "center center",
          transition:   "transform 0.35s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {/* ── CERROJO (standby) ── */}
        <img
          src="/cursor1.png"
          alt=""
          draggable={false}
          style={iconStyle(!isKey)}
        />

        {/* ── LLAVE (hover) ── */}
        <img
          src="/cursor2.png"
          alt=""
          draggable={false}
          style={iconStyle(isKey)}
        />
      </div>
    </div>
  );
}
