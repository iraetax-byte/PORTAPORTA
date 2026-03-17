import { useState, useRef, useMemo } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { DOORS } from "../data/doors";
import logo from "../assets/logo/portaporta-logo.png";

/**
 * Header — Logo on the RIGHT.
 * Nav appears on hover/click with pomo knob animation.
 * Font: Helvetica Neue, white only, 12-14px legible.
 * No colors, no small caps. Clean black & white.
 */

const LANGS = ["CA", "EN", "ES"];

export default function Header({ currentView, onNavigate, onOpenDoor }) {
  const { t, lang, switchLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [knobKey, setKnobKey] = useState(0);
  const [langHover, setLangHover] = useState(false);
  const closeTimer = useRef(null);
  const langTimer = useRef(null);

  // "Door of the day" — deterministic based on day of year
  const doorOfTheDay = useMemo(() => {
    const mainDoors = DOORS.filter(d => d.hasProductPage);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return mainDoors[dayOfYear % mainDoors.length];
  }, []);

  const navItems = [
    { key: "home", label: t("nav.home") },
    { key: "map", label: t("nav.map") },
    { key: "gallery", label: t("nav.gallery") },
    { key: "about", label: t("nav.about") },
  ];

  const isActive = (key) => {
    if (key === "home" && (currentView === "home" || currentView === "product")) return true;
    return currentView === key;
  };

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    if (!isOpen) {
      setKnobKey((k) => k + 1);
      setIsOpen(true);
    }
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 180);
  };

  const handleNav = (key) => {
    onNavigate(key);
    setIsOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes pomo {
          0%   { transform: rotate(0deg) scale(1); }
          20%  { transform: rotate(26deg) scale(0.97); }
          42%  { transform: rotate(-7deg) scale(1.01); }
          60%  { transform: rotate(12deg) scale(0.99); }
          76%  { transform: rotate(-3deg) scale(1); }
          90%  { transform: rotate(5deg); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes navReveal {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: "52px",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        zIndex: 100,
        overflow: "visible",
        pointerEvents: "none",
      }}>
        {/* ── Language selector — top left ── */}
        <div
          style={{
            position: "absolute", left: "18px", top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "auto",
          }}
          onMouseEnter={() => { clearTimeout(langTimer.current); setLangHover(true); }}
          onMouseLeave={() => { langTimer.current = setTimeout(() => setLangHover(false), 120); }}
        >
          <div style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: "12px", fontWeight: 300,
            color: "rgba(255,255,255,0.35)",
            cursor: "default", userSelect: "none",
          }}>
            {lang.toUpperCase()}
          </div>
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)", left: 0,
            background: "rgba(0,0,0,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            overflow: "hidden",
            maxHeight: langHover ? "120px" : "0px",
            opacity: langHover ? 1 : 0,
            transition: "max-height 0.25s ease, opacity 0.2s ease",
            pointerEvents: langHover ? "auto" : "none",
          }}>
            {LANGS.map((code) => (
              <button
                key={code}
                onClick={() => { switchLang(code.toLowerCase()); setLangHover(false); }}
                style={{
                  display: "block", width: "100%",
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "12px", fontWeight: 300,
                  textAlign: "left", padding: "6px 14px",
                  color: lang.toUpperCase() === code
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.35)",
                  transition: "color 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color =
                    lang.toUpperCase() === code ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)";
                }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* ── Logo + Nav — RIGHT side ── */}
        <div
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{
            position: "absolute",
            right: "18px", top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            flexDirection: "row-reverse",
            pointerEvents: "auto",
          }}
        >
          {/* Logo with pomo animation */}
          <div style={{
            flexShrink: 0,
            transform: isOpen ? "translateX(4px) scale(1.06)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
            zIndex: 2,
          }}>
            <div
              key={knobKey}
              style={{
                animation: knobKey > 0
                  ? "pomo 0.44s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                  : "none",
                transformOrigin: "center center",
                display: "flex", alignItems: "center",
              }}
            >
              <img
                src={logo}
                alt="PortaPorta"
                onClick={() => {
                  if (onOpenDoor && doorOfTheDay) {
                    onOpenDoor(doorOfTheDay);
                  }
                }}
                style={{
                  height: "90px", width: "auto",
                  cursor: "pointer",
                  filter: "invert(1)",
                  opacity: 0.85,
                  userSelect: "none",
                  display: "block",
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Nav items — emerge to the LEFT of logo */}
          <div style={{
            display: "flex", alignItems: "center",
            maxWidth: isOpen ? "380px" : "0px",
            overflow: "hidden",
            transition: isOpen
              ? "max-width 0.45s cubic-bezier(0.23, 1, 0.32, 1) 0.03s"
              : "max-width 0.25s ease",
            pointerEvents: isOpen ? "auto" : "none",
            marginRight: isOpen ? "12px" : "0",
          }}>
            {navItems.map((item, i) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontSize: "13px",
                  fontWeight: isActive(item.key) ? 400 : 300,
                  color: isActive(item.key)
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.5)",
                  padding: "4px 14px",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s, opacity 0.2s",
                  animation: isOpen
                    ? `navReveal 0.3s ease ${0.05 + i * 0.04}s both`
                    : "none",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.95)"}
                onMouseLeave={e => {
                  e.currentTarget.style.color = isActive(item.key)
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.5)";
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
