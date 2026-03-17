import { useState, useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { DOORS, DOOR_STYLES } from "../data/doors";

/**
 * GalleryAdminView — Admin mode for the gallery.
 * Allows identifying, categorizing, and editing door metadata.
 * Layout: left = scrollable grid of all door photos,
 *         right = edit panel for selected door.
 * Persists edits to localStorage; can export as JSON.
 */

const STORAGE_KEY = "pp-door-edits";

function loadEdits() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveEdits(edits) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(edits)); } catch {}
}

/** Merge base door data with any saved edits */
function getMergedDoor(door, edits) {
  const e = edits[door.id];
  if (!e) return door;
  return { ...door, ...e };
}

const STATUS_OPTIONS = [
  { value: "identified", label: { en: "Identified", ca: "Identificada", es: "Identificada" }, color: "#8fa89c" },
  { value: "partial", label: { en: "Partial", ca: "Parcial", es: "Parcial" }, color: "#b8a87a" },
  { value: "unidentified", label: { en: "Unidentified", ca: "No identificada", es: "No identificada" }, color: "#c4897a" },
];

export default function GalleryAdminView() {
  const { localize, lang } = useLanguage();
  const [edits, setEdits] = useState(loadEdits);
  const [selectedId, setSelectedId] = useState(DOORS[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showExport, setShowExport] = useState(false);

  // Save on every edit change
  useEffect(() => { saveEdits(edits); }, [edits]);

  const updateField = (doorId, field, value) => {
    setEdits(prev => ({
      ...prev,
      [doorId]: { ...(prev[doorId] || {}), [field]: value }
    }));
  };

  const updateNestedField = (doorId, field, subField, value) => {
    setEdits(prev => {
      const doorEdit = prev[doorId] || {};
      const existing = doorEdit[field] || {};
      return {
        ...prev,
        [doorId]: { ...doorEdit, [field]: { ...existing, [subField]: value } }
      };
    });
  };

  const getStatus = (door) => {
    const merged = getMergedDoor(door, edits);
    const name = localize(merged.name);
    const hasName = name && !name.startsWith("Door ") && !name.startsWith("Porta ") && !name.startsWith("Puerta ");
    const hasStyle = !!merged.style;
    const hasAddress = merged.address && merged.address !== "—";
    if (hasName && hasStyle && hasAddress) return "identified";
    if (hasName || hasAddress) return "partial";
    return "unidentified";
  };

  const filteredDoors = filterStatus === "all"
    ? DOORS
    : DOORS.filter(d => getStatus(d) === filterStatus);

  const selectedDoor = DOORS.find(d => d.id === selectedId);
  const merged = selectedDoor ? getMergedDoor(selectedDoor, edits) : null;

  const exportAllData = () => {
    const allData = DOORS.map(d => {
      const m = getMergedDoor(d, edits);
      return {
        id: m.id,
        name: m.name,
        address: m.address,
        style: m.style,
        century: m.century,
        year: m.year,
        architect: m.architect,
        materials: m.materials,
        description: m.description,
        photo: m.photo,
        details: m.details,
        mapX: m.mapX,
        mapY: m.mapY,
        hotspots: m.hotspots,
        _status: getStatus(d),
      };
    });
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portaporta-doors-catalogue.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetDoor = (doorId) => {
    setEdits(prev => {
      const next = { ...prev };
      delete next[doorId];
      return next;
    });
  };

  const counts = {
    all: DOORS.length,
    identified: DOORS.filter(d => getStatus(d) === "identified").length,
    partial: DOORS.filter(d => getStatus(d) === "partial").length,
    unidentified: DOORS.filter(d => getStatus(d) === "unidentified").length,
  };

  return (
    <div style={{
      width: "100%", height: "100vh", paddingTop: "var(--header-h)",
      display: "flex", overflow: "hidden", background: "var(--pp-black)",
    }}>
      {/* ── LEFT: Photo Grid ── */}
      <div style={{
        width: "55%", display: "flex", flexDirection: "column",
        borderRight: "1px solid var(--pp-border)",
      }}>
        {/* Status bar */}
        <div style={{
          padding: "12px 20px", borderBottom: "1px solid var(--pp-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: "9px",
              letterSpacing: "3px", textTransform: "uppercase",
              color: "var(--pp-gold)",
            }}>
              Gallery Editor
            </span>
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: "8px",
              color: "var(--pp-dim)", letterSpacing: "1px",
            }}>
              — {counts.identified}/{counts.all} identified
            </span>
          </div>

          {/* Status filters */}
          <div style={{ display: "flex", gap: "4px" }}>
            {[
              { key: "all", label: `All (${counts.all})`, color: "var(--pp-cream-soft)" },
              ...STATUS_OPTIONS.map(s => ({
                key: s.value,
                label: `${localize(s.label)} (${counts[s.value]})`,
                color: s.color,
              }))
            ].map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{
                background: filterStatus === f.key ? `${f.color}18` : "none",
                border: `1px solid ${filterStatus === f.key ? f.color + '55' : 'var(--pp-border)'}`,
                color: filterStatus === f.key ? f.color : "var(--pp-dim)",
                fontFamily: "var(--font-ui)", fontSize: "7px",
                letterSpacing: "1.5px", textTransform: "uppercase",
                padding: "4px 8px", cursor: "pointer", transition: "all 0.2s",
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo grid */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px", alignContent: "start",
        }}>
          {filteredDoors.map(door => {
            const status = getStatus(door);
            const statusColor = STATUS_OPTIONS.find(s => s.value === status)?.color || "#555";
            const sc = DOOR_STYLES[door.style]?.color || "#555";
            const isSelected = door.id === selectedId;
            const m = getMergedDoor(door, edits);

            return (
              <div
                key={door.id}
                onClick={() => setSelectedId(door.id)}
                style={{
                  cursor: "pointer", position: "relative",
                  border: `2px solid ${isSelected ? sc : 'var(--pp-border)'}`,
                  background: isSelected ? `${sc}08` : "var(--pp-dark)",
                  transition: "all 0.25s",
                  outline: isSelected ? `1px solid ${sc}44` : "none",
                  outlineOffset: "2px",
                }}
              >
                {/* Photo */}
                <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                  <img
                    src={`/media/doors/${door.photo}`}
                    alt={`Door ${door.id}`}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover",
                      filter: isSelected ? "brightness(0.7)" : "brightness(0.5) saturate(0.7)",
                      transition: "filter 0.3s",
                    }}
                  />
                  {/* ID badge */}
                  <div style={{
                    position: "absolute", top: "6px", left: "6px",
                    background: "rgba(10,9,8,0.85)", padding: "3px 7px",
                    fontFamily: "var(--font-display)", fontSize: "14px",
                    fontStyle: "italic", color: sc, fontWeight: 400,
                  }}>
                    {String(door.id).padStart(2, "0")}
                  </div>
                  {/* Status dot */}
                  <div style={{
                    position: "absolute", top: "8px", right: "8px",
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: statusColor,
                    boxShadow: `0 0 6px ${statusColor}66`,
                  }} />
                  {/* Style badge */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(10,9,8,0.9))",
                    padding: "16px 8px 6px",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-ui)", fontSize: "7px",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: sc, marginBottom: "2px",
                    }}>
                      {localize(DOOR_STYLES[m.style]?.label) || "—"}
                    </div>
                  </div>
                </div>

                {/* Name below photo */}
                <div style={{
                  padding: "8px 8px 10px", background: "var(--pp-dark)",
                  borderTop: `1px solid ${sc}15`,
                }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "12px",
                    fontStyle: "italic", color: "var(--pp-cream-soft)",
                    lineHeight: 1.2, marginBottom: "3px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {localize(m.name)}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-ui)", fontSize: "7px",
                    color: "var(--pp-dim)", letterSpacing: "1px",
                  }}>
                    {m.address || "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom action bar */}
        <div style={{
          padding: "10px 20px", borderTop: "1px solid var(--pp-border)",
          display: "flex", gap: "8px", flexShrink: 0,
        }}>
          <button onClick={exportAllData} style={{
            flex: 1, background: "var(--pp-gold-ghost)",
            border: "1px solid var(--pp-gold-faint)",
            color: "var(--pp-gold)", fontFamily: "var(--font-ui)",
            fontSize: "8px", letterSpacing: "2.5px", textTransform: "uppercase",
            padding: "9px", cursor: "pointer", transition: "all 0.3s",
          }}>
            Export Full Catalogue (.json)
          </button>
        </div>
      </div>

      {/* ── RIGHT: Edit Panel ── */}
      <div style={{
        width: "45%", display: "flex", flexDirection: "column",
        background: "var(--pp-panel)", overflow: "hidden",
      }}>
        {merged ? (
          <>
            {/* Header with photo preview */}
            <div style={{
              height: "200px", position: "relative", flexShrink: 0,
              overflow: "hidden",
            }}>
              <img
                src={`/media/doors/${merged.photo}`}
                alt=""
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center 30%",
                  filter: "brightness(0.45)",
                }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(transparent 30%, var(--pp-panel) 100%)",
              }} />
              <div style={{
                position: "absolute", bottom: "16px", left: "24px", right: "24px",
              }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "8px",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: DOOR_STYLES[merged.style]?.color || "var(--pp-gold)",
                  marginBottom: "4px",
                }}>
                  Editing Door #{String(merged.id).padStart(2, "0")} — {merged.photo}
                </div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "24px",
                  fontWeight: 300, fontStyle: "italic",
                  color: "var(--pp-cream)",
                }}>
                  {localize(merged.name)}
                </div>
              </div>
              {/* Status badge */}
              <div style={{
                position: "absolute", top: "12px", right: "16px",
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(10,9,8,0.7)", padding: "5px 10px",
                border: `1px solid ${STATUS_OPTIONS.find(s => s.value === getStatus(selectedDoor))?.color}44`,
              }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: STATUS_OPTIONS.find(s => s.value === getStatus(selectedDoor))?.color,
                }} />
                <span style={{
                  fontFamily: "var(--font-ui)", fontSize: "7px",
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: STATUS_OPTIONS.find(s => s.value === getStatus(selectedDoor))?.color,
                }}>
                  {localize(STATUS_OPTIONS.find(s => s.value === getStatus(selectedDoor))?.label)}
                </span>
              </div>
            </div>

            {/* Scrollable form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {/* Name fields (trilingual) */}
              <FieldGroup label="Name">
                {["en", "ca", "es"].map(l => (
                  <LangInput
                    key={l}
                    lang={l}
                    value={(() => {
                      const nameObj = edits[merged.id]?.name || merged.name;
                      return (typeof nameObj === 'object' ? nameObj[l] : nameObj) || "";
                    })()}
                    onChange={(val) => updateNestedField(merged.id, "name", l, val)}
                    placeholder={`Name (${l.toUpperCase()})`}
                  />
                ))}
              </FieldGroup>

              {/* Style selector */}
              <FieldGroup label="Architectural Style">
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Object.entries(DOOR_STYLES).map(([key, val]) => {
                    const isActive = (edits[merged.id]?.style || merged.style) === key;
                    return (
                      <button
                        key={key}
                        onClick={() => updateField(merged.id, "style", key)}
                        style={{
                          background: isActive ? `${val.color}22` : "none",
                          border: `1px solid ${isActive ? val.color : 'var(--pp-border)'}`,
                          color: isActive ? val.color : "var(--pp-dim)",
                          fontFamily: "var(--font-ui)", fontSize: "8px",
                          letterSpacing: "1.5px", textTransform: "uppercase",
                          padding: "6px 12px", cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {localize(val.label)}
                      </button>
                    );
                  })}
                </div>
              </FieldGroup>

              {/* Address */}
              <FieldGroup label="Address">
                <EditInput
                  value={edits[merged.id]?.address ?? merged.address}
                  onChange={(val) => updateField(merged.id, "address", val)}
                  placeholder="Carrer de..., Barcelona"
                />
              </FieldGroup>

              {/* Century + Year */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FieldGroup label="Century">
                  <EditInput
                    value={edits[merged.id]?.century ?? merged.century}
                    onChange={(val) => updateField(merged.id, "century", val)}
                    placeholder="XIV, XVIII, XX..."
                  />
                </FieldGroup>
                <FieldGroup label="Year">
                  <EditInput
                    value={edits[merged.id]?.year ?? merged.year ?? ""}
                    onChange={(val) => updateField(merged.id, "year", val ? parseInt(val) || val : null)}
                    placeholder="1905"
                    type="text"
                  />
                </FieldGroup>
              </div>

              {/* Architect */}
              <FieldGroup label="Architect">
                <EditInput
                  value={edits[merged.id]?.architect ?? merged.architect ?? ""}
                  onChange={(val) => updateField(merged.id, "architect", val || null)}
                  placeholder="Antoni Gaudí, Domènech i Montaner..."
                />
              </FieldGroup>

              {/* Materials (trilingual) */}
              <FieldGroup label="Materials">
                {["en", "ca", "es"].map(l => (
                  <LangInput
                    key={l}
                    lang={l}
                    value={(() => {
                      const obj = edits[merged.id]?.materials || merged.materials;
                      return (typeof obj === 'object' ? obj[l] : obj) || "";
                    })()}
                    onChange={(val) => updateNestedField(merged.id, "materials", l, val)}
                    placeholder={`Materials (${l.toUpperCase()})`}
                  />
                ))}
              </FieldGroup>

              {/* Description (trilingual) */}
              <FieldGroup label="Description">
                {["en", "ca", "es"].map(l => (
                  <LangTextarea
                    key={l}
                    lang={l}
                    value={(() => {
                      const obj = edits[merged.id]?.description || merged.description;
                      return (typeof obj === 'object' ? obj[l] : obj) || "";
                    })()}
                    onChange={(val) => updateNestedField(merged.id, "description", l, val)}
                    placeholder={`Description (${l.toUpperCase()})`}
                  />
                ))}
              </FieldGroup>

              {/* Associated details */}
              <FieldGroup label={`Associated Details (${merged.details?.length || 0} files)`}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {merged.details?.length > 0 ? merged.details.map((d, i) => (
                    <div key={i} style={{
                      width: "64px", height: "64px", position: "relative",
                      border: "1px solid var(--pp-border)", overflow: "hidden",
                    }}>
                      <img
                        src={`/media/details/${d}`}
                        alt={d}
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover", filter: "brightness(0.7)",
                        }}
                      />
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "rgba(0,0,0,0.7)", padding: "2px 3px",
                        fontFamily: "var(--font-ui)", fontSize: "6px",
                        color: "var(--pp-cream-soft)", textAlign: "center",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {d}
                      </div>
                    </div>
                  )) : (
                    <span style={{
                      fontFamily: "var(--font-ui)", fontSize: "9px",
                      fontStyle: "italic", color: "var(--pp-dim)",
                    }}>
                      No detail photos linked
                    </span>
                  )}
                </div>
              </FieldGroup>

              {/* Photo filename (readonly) */}
              <FieldGroup label="Photo File">
                <div style={{
                  padding: "8px 12px", background: "var(--pp-wood-dark)",
                  border: "1px solid var(--pp-border)",
                  fontFamily: "var(--font-ui)", fontSize: "10px",
                  color: "var(--pp-dim)", letterSpacing: "0.5px",
                }}>
                  /media/doors/{merged.photo}
                </div>
              </FieldGroup>

              {/* Reset button */}
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--pp-border)" }}>
                <button
                  onClick={() => resetDoor(merged.id)}
                  style={{
                    background: "none", border: "1px solid var(--pp-dim)",
                    color: "var(--pp-dim)", fontFamily: "var(--font-ui)",
                    fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase",
                    padding: "8px 16px", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  Reset to Original Data
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "14px",
              fontStyle: "italic", color: "var(--pp-dim)",
            }}>
              Select a door to edit
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


/* ─── Shared form components ─── */

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{
        fontFamily: "var(--font-ui)", fontSize: "8px",
        letterSpacing: "3px", textTransform: "uppercase",
        color: "var(--pp-dim)", marginBottom: "8px",
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function EditInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "9px 12px",
        background: "var(--pp-wood-dark)", color: "var(--pp-cream-soft)",
        border: "1px solid var(--pp-border)",
        fontFamily: "var(--font-body)", fontSize: "13px",
        fontStyle: "italic", outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) => e.target.style.borderColor = "var(--pp-gold-soft)"}
      onBlur={(e) => e.target.style.borderColor = "var(--pp-border)"}
    />
  );
}

function LangInput({ lang, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
      <span style={{
        fontFamily: "var(--font-ui)", fontSize: "7px",
        letterSpacing: "1.5px", color: "var(--pp-dim)",
        width: "20px", textAlign: "right", flexShrink: 0,
      }}>
        {lang.toUpperCase()}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, padding: "7px 10px",
          background: "var(--pp-wood-dark)", color: "var(--pp-cream-soft)",
          border: "1px solid var(--pp-border)",
          fontFamily: "var(--font-body)", fontSize: "12px",
          fontStyle: "italic", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--pp-gold-soft)"}
        onBlur={(e) => e.target.style.borderColor = "var(--pp-border)"}
      />
    </div>
  );
}

function LangTextarea({ lang, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
      <span style={{
        fontFamily: "var(--font-ui)", fontSize: "7px",
        letterSpacing: "1.5px", color: "var(--pp-dim)",
        width: "20px", textAlign: "right", flexShrink: 0,
        paddingTop: "8px",
      }}>
        {lang.toUpperCase()}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          flex: 1, padding: "7px 10px",
          background: "var(--pp-wood-dark)", color: "var(--pp-cream-soft)",
          border: "1px solid var(--pp-border)",
          fontFamily: "var(--font-body)", fontSize: "12px",
          fontStyle: "italic", outline: "none", resize: "vertical",
          lineHeight: 1.6, transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--pp-gold-soft)"}
        onBlur={(e) => e.target.style.borderColor = "var(--pp-border)"}
      />
    </div>
  );
}
