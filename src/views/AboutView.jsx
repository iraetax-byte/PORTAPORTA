import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { DOORS, DOOR_STYLES } from "../data/doors";

/**
 * AboutView — Manifesto editorial reimaginado.
 *
 * Layout arquitectónico de tres zonas:
 *  • Hero — frase principal en tipografía de display gran escala
 *  • Body — dos columnas de texto con separador central
 *  • Stats — números oversized + leyenda de estilos
 *
 * Elementos decorativos: líneas de medición técnica, grid sutil,
 * número watermark giratorio, label vertical.
 */

const NUM_STYLES = Object.keys(DOOR_STYLES).length;

export default function AboutView() {
  const { t, localize } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={scrollRef}
      style={{
        width: "100%",
        height: "100vh",
        paddingTop: "var(--header-h)",
        overflowY: "auto",
        background: "var(--pp-black)",
        position: "relative",
      }}
    >
      <style>{`
        .about-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent);
        }
        .about-tick::before {
          content: "";
          position: absolute;
          top: -4px;
          left: 0;
          width: 1px;
          height: 8px;
          background: rgba(255,255,255,0.08);
        }
        @keyframes about-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Architectural grid background ── */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        opacity: 1 - scrollY / 400,
      }} />

      {/* ── Vertical label — left edge ── */}
      <div style={{
        position: "fixed",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%) rotate(-90deg)",
        transformOrigin: "center center",
        fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: "10px",
        fontWeight: 300,
        letterSpacing: "4px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.15)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 1,
      }}>
        {t("about.theProject")} · Barcelona
      </div>

      {/* ── Main content ── */}
      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "960px",
        margin: "0 auto",
        padding: "60px 80px 100px",
      }}>

        {/* ── Section 1: Hero headline ── */}
        <div style={{ marginBottom: "72px" }}>

          {/* Label + rule */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
            <span style={{
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontWeight: 300,
            }}>
              {t("about.theProject")}
            </span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
            <span style={{
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: "11px",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.2)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontWeight: 300,
            }}>
              {new Date().getFullYear()}
            </span>
          </div>

          {/* Main headline */}
          <div style={{ position: "relative" }}>
            <h1 style={{
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              margin: 0,
              maxWidth: "82%",
            }}>
              {t("about.headline")}
            </h1>

            {/* Watermark door count — top right of headline */}
            <div style={{
              position: "absolute",
              top: "-10px",
              right: 0,
              fontFamily: "'Helvetica Neue', sans-serif",
              fontSize: "clamp(80px, 14vw, 180px)",
              fontWeight: 200,
              color: "rgba(255,255,255,0.03)",
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
              animation: "about-spin-slow 60s linear infinite",
              transformOrigin: "center center",
            }}>
              {String(DOORS.length).padStart(2, "0")}
            </div>
          </div>

          {/* Measurement line below headline */}
          <div style={{ marginTop: "32px", position: "relative" }}>
            <div className="about-rule" />
            {[0, 25, 50, 75, 100].map((pct) => (
              <div key={pct} style={{
                position: "absolute",
                top: 0,
                left: `${pct}%`,
                width: "1px",
                height: "6px",
                background: "rgba(255,255,255,0.08)",
                transform: "translateX(-50%)",
              }} />
            ))}
          </div>
        </div>

        {/* ── Section 2: Two-column body text ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2px 1fr",
          gap: "48px",
          marginBottom: "72px",
          alignItems: "start",
        }}>
          <p style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "14px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.8,
            margin: 0,
          }}>
            {t("about.body1")}
          </p>

          {/* Central separator */}
          <div style={{
            width: "1px",
            alignSelf: "stretch",
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)",
          }} />

          <p style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "14px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.8,
            margin: 0,
          }}>
            {t("about.body2")}
          </p>
        </div>

        {/* ── Section 3: Stats ── */}
        <div style={{ marginBottom: "60px" }}>
          <div className="about-rule" style={{ marginBottom: "44px" }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0",
          }}>
            {/* Stat: Doors */}
            <StatBlock
              number={DOORS.length}
              label={t("about.doorsCatalogued")}
              accent="rgba(255,255,255,0.8)"
              border="right"
            />
            {/* Stat: Styles */}
            <StatBlock
              number={NUM_STYLES}
              label="architectural styles"
              accent="rgba(255,255,255,0.6)"
              border="right"
            />
            {/* Stat: City */}
            <StatBlock
              number="BCN"
              label="Barcelona · Catalunya"
              accent="rgba(255,255,255,0.4)"
              border="none"
              large={false}
            />
          </div>

          <div className="about-rule" style={{ marginTop: "44px" }} />
        </div>

        {/* ── Section 4: Style legend ── */}
        <div>
          <div style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "11px",
            fontWeight: 300,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
            marginBottom: "28px",
          }}>
            {t("about.network")} · {t("about.doorsCatalogued").toUpperCase()}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${NUM_STYLES}, 1fr)`,
            gap: "0",
          }}>
            {Object.entries(DOOR_STYLES).map(([key, val], i) => {
              const doorsInStyle = DOORS.filter(d => d.style === key).length;
              return (
                <div key={key} style={{
                  padding: "20px 16px",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  position: "relative",
                }}>
                  {/* Color bar top — only small accent allowed for style identification */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "2px",
                    background: val.color,
                    opacity: 0.5,
                  }} />

                  {/* Count */}
                  <div style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontSize: "28px",
                    fontWeight: 200,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}>
                    {doorsInStyle}
                  </div>

                  {/* Style name */}
                  <div style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontSize: "11px",
                    fontWeight: 300,
                    letterSpacing: "1.5px",
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}>
                    {localize(val.label).split("/")[0].trim()}
                  </div>

                  {/* Years */}
                  <div style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontSize: "11px",
                    fontWeight: 300,
                    letterSpacing: "1px",
                    color: "rgba(255,255,255,0.15)",
                  }}>
                    {val.years}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ number, label, accent, border, large = true }) {
  return (
    <div style={{
      padding: "0 40px 0 0",
      borderRight: border === "right" ? "1px solid rgba(255,255,255,0.06)" : "none",
      marginRight: border === "right" ? "40px" : 0,
    }}>
      <div style={{
        fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: large ? "clamp(48px, 7vw, 80px)" : "clamp(36px, 5vw, 56px)",
        fontWeight: 200,
        color: accent,
        lineHeight: 1,
        marginBottom: "10px",
        letterSpacing: "-1px",
      }}>
        {number}
      </div>
      <div style={{
        fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: "11px",
        fontWeight: 300,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
      }}>
        {label}
      </div>
    </div>
  );
}
