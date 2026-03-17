import { useState, useRef } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { DOORS, DOOR_STYLES, MAP_REFERENCE_POINTS } from "../data/doors";

const LS_MAPPINGS = "pp-door-mappings";
const LS_REFS     = "pp-reference-points";

function loadLS(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/**
 * AdminView — Hidden mapping tool (Ctrl+Shift+A).
 * Two tabs:
 *   PUERTAS    — click map to assign door coordinates
 *   REFERENCIAS — click map to add/move reference labels
 */
export default function AdminView() {
  const { localize } = useLanguage();
  const [tab, setTab]           = useState("doors"); // "doors" | "refs"
  const [selectedDoorId, setSelectedDoorId] = useState(null);
  const [mappings, setMappings] = useState(() => loadLS(LS_MAPPINGS, {}));
  const [refs, setRefs]         = useState(() =>
    loadLS(LS_REFS, MAP_REFERENCE_POINTS.map((r, i) => ({ ...r, id: `ref-${i}` })))
  );
  const [selectedRefId, setSelectedRefId] = useState(null);
  const [pendingRefName, setPendingRefName] = useState("");
  const [lastClick, setLastClick] = useState(null);
  const imgRef = useRef(null);

  /* ── coordinate from click ── */
  const coordsFromClick = (e) => {
    if (!imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();
    return {
      x: parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(2)),
      y: parseFloat(((e.clientY - rect.top)  / rect.height * 100).toFixed(2)),
    };
  };

  /* ── door mapping ── */
  const handleMapClickDoors = (e) => {
    if (!selectedDoorId) return;
    const c = coordsFromClick(e);
    if (!c) return;
    const next = { ...mappings, [selectedDoorId]: c };
    setMappings(next); saveLS(LS_MAPPINGS, next);
    setLastClick({ type: "door", doorId: selectedDoorId, ...c });
  };

  const resetMapping = (doorId) => {
    const next = { ...mappings }; delete next[doorId];
    setMappings(next); saveLS(LS_MAPPINGS, next);
  };

  /* ── reference points ── */
  const handleMapClickRefs = (e) => {
    const c = coordsFromClick(e);
    if (!c) return;
    if (selectedRefId) {
      // Move existing ref
      const next = refs.map(r => r.id === selectedRefId ? { ...r, ...c } : r);
      setRefs(next); saveLS(LS_REFS, next);
      setLastClick({ type: "ref", id: selectedRefId, ...c });
    } else if (pendingRefName.trim()) {
      // Add new ref
      const newRef = { id: `ref-${Date.now()}`, name: pendingRefName.trim(), ...c };
      const next = [...refs, newRef];
      setRefs(next); saveLS(LS_REFS, next);
      setPendingRefName("");
      setLastClick({ type: "ref", id: newRef.id, ...c });
    }
  };

  const deleteRef = (id) => {
    const next = refs.filter(r => r.id !== id);
    setRefs(next); saveLS(LS_REFS, next);
    if (selectedRefId === id) setSelectedRefId(null);
  };

  const renameRef = (id, name) => {
    const next = refs.map(r => r.id === id ? { ...r, name } : r);
    setRefs(next); saveLS(LS_REFS, next);
  };

  const resetRefsToDefault = () => {
    const next = MAP_REFERENCE_POINTS.map((r, i) => ({ ...r, id: `ref-${i}` }));
    setRefs(next); saveLS(LS_REFS, next); setSelectedRefId(null);
  };

  /* ── export ── */
  const exportData = () => {
    const data = {
      doorMappings: DOORS.map(d => ({
        id: d.id,
        name: localize(d.name),
        mapX: mappings[d.id]?.x ?? d.mapX,
        mapY: mappings[d.id]?.y ?? d.mapY,
      })),
      referencePoints: refs.map(({ id, ...r }) => r),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "portaporta-map-data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const mapCursor = tab === "doors"
    ? (selectedDoorId ? "crosshair" : "default")
    : (selectedRefId || pendingRefName.trim() ? "crosshair" : "default");

  /* ── shared label style ── */
  const lbl = { fontFamily: "var(--font-ui)", fontSize: "8px", letterSpacing: "2px",
                textTransform: "uppercase", color: "var(--pp-dim)" };

  return (
    <div style={{
      width: "100%", height: "100vh", paddingTop: "var(--header-h)",
      display: "flex", overflow: "hidden", background: "var(--pp-black)",
    }}>
      {/* ── Left panel ── */}
      <div style={{
        width: "300px", flexShrink: 0,
        borderRight: "1px solid var(--pp-border)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--pp-border)", flexShrink: 0 }}>
          {[["doors", "Puertas"], ["refs", "Referencias"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "12px", background: "none", border: "none",
              cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "8px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: tab === key ? "var(--pp-gold)" : "var(--pp-dim)",
              borderBottom: tab === key ? "1px solid var(--pp-gold)" : "1px solid transparent",
              marginBottom: "-1px", transition: "all 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>

          {/* ════ PUERTAS tab ════ */}
          {tab === "doors" && (<>
            <div style={{ ...lbl, color: "var(--pp-gold)", marginBottom: "6px" }}>
              Mapeado de puertas
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontStyle: "italic",
                          color: "var(--pp-dim)", marginBottom: "18px", lineHeight: 1.6 }}>
              Selecciona una puerta y haz click en el mapa para asignar su posición.
            </div>

            {DOORS.map(door => {
              const isMapped = mappings[door.id] || (door.mapX !== null);
              const isSel    = selectedDoorId === door.id;
              const sc       = DOOR_STYLES[door.style]?.color || "#c4897a";
              return (
                <div key={door.id} onClick={() => setSelectedDoorId(door.id)} style={{
                  padding: "9px 11px", marginBottom: "5px", cursor: "pointer",
                  border: `1px solid ${isSel ? sc : "var(--pp-border)"}`,
                  background: isSel ? `${sc}10` : "transparent", transition: "all 0.18s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "12px",
                                   fontStyle: "italic", color: "var(--pp-cream-soft)" }}>
                      {String(door.id).padStart(2,"0")}. {localize(door.name)}
                    </span>
                    <span style={{ ...lbl, fontSize: "7px", letterSpacing: "1px",
                                   color: isMapped ? "#8fa89c" : "var(--pp-dim)" }}>
                      {isMapped ? "✓" : "—"}
                    </span>
                  </div>
                  {mappings[door.id] && (
                    <div style={{ marginTop: "4px", display: "flex",
                                  justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ ...lbl, fontSize: "7px" }}>
                        x:{mappings[door.id].x}% y:{mappings[door.id].y}%
                      </span>
                      <button onClick={e => { e.stopPropagation(); resetMapping(door.id); }}
                        style={{ background: "none", border: "1px solid var(--pp-dim)",
                                 color: "var(--pp-dim)", fontSize: "7px",
                                 fontFamily: "var(--font-ui)", letterSpacing: "1px",
                                 padding: "2px 6px", cursor: "pointer" }}>
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </>)}

          {/* ════ REFERENCIAS tab ════ */}
          {tab === "refs" && (<>
            <div style={{ ...lbl, color: "var(--pp-gold)", marginBottom: "6px" }}>
              Puntos de referencia
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontStyle: "italic",
                          color: "var(--pp-dim)", marginBottom: "16px", lineHeight: 1.6 }}>
              Escribe un nombre y haz click en el mapa para añadir. Selecciona uno para moverlo.
            </div>

            {/* Add new */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ ...lbl, marginBottom: "6px" }}>Nuevo punto</div>
              <input
                value={pendingRefName}
                onChange={e => { setPendingRefName(e.target.value); setSelectedRefId(null); }}
                placeholder="Nombre del punto..."
                style={{
                  width: "100%", background: "var(--pp-panel)",
                  border: `1px solid ${pendingRefName ? "var(--pp-gold)" : "var(--pp-border)"}`,
                  color: "var(--pp-cream-soft)", fontFamily: "var(--font-ui)",
                  fontSize: "10px", letterSpacing: "1px",
                  padding: "8px 10px", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
              {pendingRefName.trim() && (
                <div style={{ ...lbl, fontSize: "7px", marginTop: "5px",
                              color: "var(--pp-gold)", letterSpacing: "1.5px" }}>
                  Haz click en el mapa para posicionar
                </div>
              )}
            </div>

            {/* Existing refs list */}
            {refs.map(ref => {
              const isSel = selectedRefId === ref.id;
              return (
                <div key={ref.id} style={{
                  padding: "8px 10px", marginBottom: "5px",
                  border: `1px solid ${isSel ? "var(--pp-gold)" : "var(--pp-border)"}`,
                  background: isSel ? "rgba(196,137,122,0.08)" : "transparent",
                  transition: "all 0.18s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <input
                      value={ref.name}
                      onChange={e => renameRef(ref.id, e.target.value)}
                      onClick={() => { setSelectedRefId(ref.id); setPendingRefName(""); }}
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        fontFamily: "var(--font-ui)", fontSize: "9px",
                        letterSpacing: "1.5px", color: "var(--pp-cream-soft)",
                        cursor: "pointer",
                      }}
                    />
                    <button onClick={() => deleteRef(ref.id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--pp-dim)", fontSize: "10px", padding: "0 2px",
                      flexShrink: 0,
                    }}>✕</button>
                  </div>
                  <div style={{ ...lbl, fontSize: "7px", marginTop: "3px" }}>
                    x:{ref.x}% y:{ref.y}%
                    {isSel && <span style={{ color: "var(--pp-gold)", marginLeft: "6px" }}>
                      ← click mapa para mover
                    </span>}
                  </div>
                </div>
              );
            })}

            {/* Reset to default */}
            <button onClick={resetRefsToDefault} style={{
              marginTop: "10px", width: "100%", background: "none",
              border: "1px solid var(--pp-dim)", color: "var(--pp-dim)",
              fontFamily: "var(--font-ui)", fontSize: "7px",
              letterSpacing: "2px", textTransform: "uppercase",
              padding: "8px", cursor: "pointer",
            }}>
              Restaurar originales
            </button>
          </>)}

        </div>

        {/* Export button */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--pp-border)", flexShrink: 0 }}>
          <button onClick={exportData} style={{
            width: "100%", background: "var(--pp-gold-ghost)",
            border: "1px solid var(--pp-gold-faint)", color: "var(--pp-gold)",
            fontFamily: "var(--font-ui)", fontSize: "8px",
            letterSpacing: "2.5px", textTransform: "uppercase",
            padding: "10px", cursor: "pointer",
          }}>
            Exportar datos del mapa
          </button>
        </div>
      </div>

      {/* ── Right: Map ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", position: "relative",
      }}>
        <div style={{ position: "relative", maxWidth: "100%", maxHeight: "100%" }}>
          <img
            ref={imgRef}
            src="/media/map/barcelona-map.jpg"
            alt="Barcelona Map"
            onClick={tab === "doors" ? handleMapClickDoors : handleMapClickRefs}
            style={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - var(--header-h) - 40px)",
              objectFit: "contain",
              cursor: mapCursor,
              filter: "brightness(0.6) contrast(1.1) sepia(0.1)",
            }}
          />

          {/* Door markers */}
          {tab === "doors" && Object.entries(mappings).map(([doorId, pos]) => {
            const door = DOORS.find(d => d.id === parseInt(doorId));
            if (!door) return null;
            const sc = DOOR_STYLES[door.style]?.color || "#c4897a";
            return (
              <div key={doorId} style={{
                position: "absolute",
                left: `${pos.x}%`, top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                width: "14px", height: "14px", borderRadius: "50%",
                background: `${sc}66`, border: `2px solid ${sc}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "7px", color: "#fff",
                fontFamily: "var(--font-ui)", pointerEvents: "none",
              }}>
                {door.id}
              </div>
            );
          })}

          {/* Reference point markers */}
          {tab === "refs" && refs.map(ref => {
            const isSel = selectedRefId === ref.id;
            return (
              <div
                key={ref.id}
                onClick={e => { e.stopPropagation(); setSelectedRefId(isSel ? null : ref.id); setPendingRefName(""); }}
                style={{
                  position: "absolute",
                  left: `${ref.x}%`, top: `${ref.y}%`,
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer", zIndex: 10,
                }}
              >
                <div style={{
                  width: isSel ? 10 : 6, height: isSel ? 10 : 6,
                  borderRadius: "50%",
                  background: isSel ? "var(--pp-gold)" : "rgba(255,255,255,0.5)",
                  boxShadow: isSel ? "0 0 10px var(--pp-gold)" : "none",
                  transition: "all 0.2s",
                }} />
                <div style={{
                  position: "absolute", top: "9px", left: 0,
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-ui)", fontSize: "6px",
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  color: isSel ? "var(--pp-gold)" : "rgba(255,255,255,0.6)",
                  textShadow: "0 1px 4px rgba(0,0,0,1)",
                  pointerEvents: "none",
                }}>
                  {ref.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Last action feedback */}
        {lastClick && (
          <div style={{
            position: "absolute", bottom: "20px", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,9,8,0.9)", border: "1px solid var(--pp-border)",
            padding: "8px 16px", fontFamily: "var(--font-ui)",
            fontSize: "9px", color: "var(--pp-cream-soft)", letterSpacing: "1px",
          }}>
            {lastClick.type === "door"
              ? `Puerta ${lastClick.doorId} → x:${lastClick.x}% y:${lastClick.y}%`
              : `Ref "${refs.find(r=>r.id===lastClick.id)?.name}" → x:${lastClick.x}% y:${lastClick.y}%`
            }
          </div>
        )}
      </div>
    </div>
  );
}
