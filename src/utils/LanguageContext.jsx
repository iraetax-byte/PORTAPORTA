import { createContext, useContext, useState, useCallback } from "react";
import translations from "../data/i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("pp-lang") || "en";
    } catch {
      return "en";
    }
  });

  const switchLang = useCallback((newLang) => {
    setLang(newLang);
    try { localStorage.setItem("pp-lang", newLang); } catch {}
  }, []);

  const t = useCallback((path) => {
    const keys = path.split(".");
    let result = translations[lang];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  }, [lang]);

  /** Get localized field from an object like { en: "...", ca: "...", es: "..." } */
  const localize = useCallback((obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || Object.values(obj)[0] || "";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
