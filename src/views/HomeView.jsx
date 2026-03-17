import { useState, useRef, useCallback, useEffect } from "react";

/**
 * HomeView — Fence struggle intro (hover only, no clicks).
 *
 * fenceleft.png (2000x1001) — gate ironwork on the RIGHT side of the image.
 * fencelright.png (2000x1001) — gate ironwork on the LEFT side (mirror).
 *
 * Both images placed so the gate halves OVERLAP at center screen.
 * The images are wider than half the screen, so when overlapping they form
 * a complete ornamental gate.
 *
 * Hover the center seam → 3 trembles → gate opens → title.png → map.
 */

export default function HomeView({ onNavigate }) {
  const [phase, setPhase] = useState("closed");
  const [trembleOffset, setTrembleOffset] = useState(0);
  const trembleTimer = useRef(null);
  const shakeAnim = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const handleSeamEnter = useCallback(() => {
    if (phaseRef.current !== "closed") return;
    setPhase("trembling");
    runTrembleSequence();
  }, []);

  const handleSeamLeave = useCallback(() => {
    if (phaseRef.current !== "trembling") return;
    clearTimeout(trembleTimer.current);
    cancelAnimationFrame(shakeAnim.current);
    setTrembleOffset(0);
    setPhase("closed");
  }, []);

  const runTrembleSequence = useCallback(() => {
    const doShake = (intensity, duration, onDone) => {
      const t0 = performance.now();
      const tick = (now) => {
        const elapsed = now - t0;
        if (elapsed >= duration) {
          setTrembleOffset(0);
          onDone?.();
          return;
        }
        const p = elapsed / duration;
        const decay = 1 - p;
        const freq = 14 + intensity * 3;
        setTrembleOffset(Math.sin(p * freq * Math.PI) * intensity * decay);
        shakeAnim.current = requestAnimationFrame(tick);
      };
      shakeAnim.current = requestAnimationFrame(tick);
    };

    // 3 trembles of increasing intensity
    doShake(4, 400, () => {
      trembleTimer.current = setTimeout(() => {
        doShake(8, 500, () => {
          trembleTimer.current = setTimeout(() => {
            doShake(14, 600, () => {
              openGate();
            });
          }, 200);
        });
      }, 250);
    });
  }, []);

  const openGate = useCallback(() => {
    setPhase("opening");
    setTrembleOffset(0);
    setTimeout(() => setPhase("revealed"), 800);
    setTimeout(() => {
      setPhase("transitioning");
      setTimeout(() => onNavigate("map"), 600);
    }, 2300);
  }, [onNavigate]);

  useEffect(() => () => {
    clearTimeout(trembleTimer.current);
    cancelAnimationFrame(shakeAnim.current);
  }, []);

  const isOpen = phase === "opening" || phase === "revealed" || phase === "transitioning";

  // Each fence image is placed so it covers from center outward.
  // "right: 50%" for left fence means its RIGHT edge starts at center.
  // "left: 50%" for right fence means its LEFT edge starts at center.
  // This makes them overlap at center, forming the full gate.
  const leftTransform = isOpen
    ? "translateX(-120%)"
    : `translateX(${trembleOffset}px)`;
  const rightTransform = isOpen
    ? "translateX(120%)"
    : `translateX(${-trembleOffset}px)`;

  const fenceTransition = isOpen
    ? "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    : "none";

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#000", overflow: "hidden",
      position: "relative",
    }}>
      {/* title.png revealed behind fences */}
      <img
        src="/media/title.png"
        alt="Porta Porta"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "contain", objectPosition: "center",
          zIndex: 1,
          opacity: (phase === "revealed" || phase === "transitioning") ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
        draggable={false}
      />

      {/* Left fence — anchored to bottom, right edge at screen center */}
      <img
        src="/fenceleft.png"
        alt=""
        style={{
          position: "absolute",
          bottom: 0,
          right: "50%",
          height: "auto",
          width: "60vw",
          minHeight: "50vh",
          zIndex: 10,
          pointerEvents: "none",
          transform: leftTransform,
          transition: fenceTransition,
        }}
        draggable={false}
      />

      {/* Right fence — anchored to bottom, left edge at screen center */}
      <img
        src="/fencelright.png"
        alt=""
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          height: "auto",
          width: "60vw",
          minHeight: "50vh",
          zIndex: 10,
          pointerEvents: "none",
          transform: rightTransform,
          transition: fenceTransition,
        }}
        draggable={false}
      />

      {/* Invisible seam zone for hover trigger */}
      {(phase === "closed" || phase === "trembling") && (
        <div
          onMouseEnter={handleSeamEnter}
          onMouseLeave={handleSeamLeave}
          style={{
            position: "absolute",
            left: "calc(50% - 120px)",
            top: 0,
            width: "240px",
            height: "100%",
            zIndex: 20,
            cursor: "ew-resize",
          }}
        />
      )}

      {/* Fade to black */}
      {phase === "transitioning" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 30,
          background: "#000",
          animation: "homeBlackFade 0.6s ease forwards",
        }} />
      )}

      <style>{`
        @keyframes homeBlackFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
