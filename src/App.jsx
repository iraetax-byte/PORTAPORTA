import { useState, useCallback, useEffect, useRef } from "react";
import { LanguageProvider } from "./utils/LanguageContext";
import Header from "./components/Header";
import CustomCursor from "./components/CustomCursor";
import HomeView from "./views/HomeView";
import MapView from "./views/MapView";
import GalleryView from "./views/GalleryView";
import ProductView from "./views/ProductView";
import AboutView from "./views/AboutView";
import AdminView from "./views/AdminView";
import GalleryAdminView from "./views/GalleryAdminView";

/**
 * PortaPorta — Main Shell (v2).
 * Smooth crossfade transitions between all views.
 */
export default function App() {
  const [view, setView] = useState("home");
  const [productDoor, setProductDoor] = useState(null);
  const [selectedMapDoor, setSelectedMapDoor] = useState(null);
  const [prevView, setPrevView] = useState("map");

  // Transition state
  const [transitioning, setTransitioning] = useState(false);
  const [displayView, setDisplayView] = useState("home");
  const pendingNav = useRef(null);

  const doTransition = useCallback((targetView, callback) => {
    setTransitioning(true);
    setTimeout(() => {
      if (callback) callback();
      setDisplayView(targetView);
      setView(targetView);
      setTimeout(() => setTransitioning(false), 50);
    }, 300); // fade-out duration
  }, []);

  const navigate = useCallback((target, doorData) => {
    if (target === "product" && doorData) {
      doTransition("product", () => {
        setPrevView(view);
        setProductDoor(doorData);
      });
      return;
    }
    if (target === "map" && doorData) {
      doTransition("map", () => setSelectedMapDoor(doorData));
      return;
    }
    doTransition(target);
  }, [view, doTransition]);

  const openDoor = useCallback((door) => {
    if (door.hasProductPage) {
      doTransition("product", () => {
        setPrevView(view);
        setProductDoor(door);
      });
    }
  }, [view, doTransition]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "A") {
      setView(v => v === "admin" ? "home" : "admin");
      setDisplayView(v => v === "admin" ? "home" : "admin");
    }
    if (e.ctrlKey && e.shiftKey && e.key === "G") {
      setView(v => v === "gallery-admin" ? "gallery" : "gallery-admin");
      setDisplayView(v => v === "gallery-admin" ? "gallery" : "gallery-admin");
    }
  }, []);

  const isAdminMode = view === "admin" || view === "gallery-admin";

  return (
    <LanguageProvider>
      <CustomCursor />
      <div
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ width: "100vw", height: "100vh", outline: "none", background: "#000" }}
      >
        {/* Header visible on all views except home splash */}
        {displayView !== "home" && (
          <Header currentView={displayView} onNavigate={navigate} onOpenDoor={openDoor} />
        )}

        {isAdminMode && (
          <div style={{
            position: "fixed", top: "52px", left: 0, right: 0,
            height: "2px", zIndex: 99,
            background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0.3))",
          }} />
        )}

        {/* ── View container with crossfade ── */}
        <div style={{
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.3s ease",
          width: "100%", height: "100%",
        }}>
          {displayView === "home" && (
            <HomeView onNavigate={navigate} />
          )}
          {displayView === "map" && (
            <MapView
              onOpenDoor={openDoor}
              selectedDoor={selectedMapDoor}
              onNavigate={navigate}
            />
          )}
          {displayView === "gallery" && (
            <GalleryView onOpenDoor={openDoor} onNavigate={navigate} />
          )}
          {displayView === "product" && productDoor && (
            <ProductView
              door={productDoor}
              onNavigate={navigate}
              onBack={() => doTransition(prevView)}
            />
          )}
          {displayView === "about" && <AboutView />}
          {displayView === "admin" && <AdminView />}
          {displayView === "gallery-admin" && <GalleryAdminView />}
        </div>
      </div>
    </LanguageProvider>
  );
}
