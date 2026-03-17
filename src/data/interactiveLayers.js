/**
 * INTERACTIVE_LAYERS
 * Maps a detail key (filename without extension) to a layered composition config.
 *
 * base    — static background PNG (same canvas size as originals)
 * video   — optional: video file that plays when cursor enters lower half of viewer
 * layers  — array of interactive PNG overlays, each with:
 *   file       — filename in /public/interactivephotos/
 *   animation  — "doorknob" | "spin" | "fullspin" | "sticker"
 *   origin     — CSS transform-origin fallback (overridden by computed centroid)
 *   label      — optional tooltip {en, ca, es}
 *
 * Animation types:
 *   doorknob  — quick elastic rotation and return (pomo de puerta)
 *   spin      — continuous slow rotation while hovered
 *   fullspin  — single full 360° rotation on hover (cerrojo)
 *   sticker   — click-to-attach to cursor, click again to place (draggable sticker)
 *
 * video trigger (wood6):
 *   When a "video" key is present, LayeredPhotoViewer overlays the video
 *   and plays it when the cursor crosses the horizontal center threshold.
 */
export const INTERACTIVE_LAYERS = {
  wood2: {
    base: "wood2hot1.png",
    layers: [
      {
        file: "wood2det1.png",
        animation: "doorknob",
        origin: "center center",
        label: { en: "Handle", ca: "Maneta", es: "Manilla" },
      },
      {
        file: "wood2det2.png",
        animation: "spin",
        origin: "center center",
        label: { en: "Detail", ca: "Detall", es: "Detalle" },
      },
    ],
  },

  wood4: {
    base: "wood4hot1.png",
    layers: [
      {
        file: "wood4det1.png",
        animation: "doorknob",
        origin: "center center",
        label: { en: "Handle", ca: "Pom", es: "Pomo" },
      },
      {
        file: "wood4det2.png",
        animation: "fullspin",
        origin: "center center",
        label: { en: "Lock", ca: "Cerrojo", es: "Cerrojo" },
      },
    ],
  },

  // wood1det1.png must be exported from wood1det1.psd and placed in /public/interactivephotos/
  wood1: {
    base: "wood1hot1.png",
    layers: [
      {
        file: "wood1det1.png",
        animation: "sticker",
        origin: "center center",
        label: { en: "Lift & place", ca: "Desplaça", es: "Arrastra" },
      },
    ],
  },

  wood6: {
    base: "wood6hot1.png",
    video: "wood6det1.mp4",
    layers: [],
  },

  /**
   * metal1 — chapa metálica en la puerta.
   *
   * animation: "fall"
   *   • La capa pivota desde el tope de la chapa (origin: 52.8% 48.2%).
   *   • Al entrar el ratón se despega lento, cae y desaparece.
   *   • Luego hace un fade-in lento de vuelta a su posición original.
   *   • Solo dispara una vez por hover (no se repite mientras vuelve).
   *
   * zoomCx / zoomCy / zoomScale
   *   • Al hacer clic en la chapa se activa una vista zoom centrada en ella.
   *   • El contenido escala dentro de los bordes del visor (overflow: hidden).
   */
  metal1: {
    base: "metal1hot1.png",
    layers: [
      {
        file: "metal1det1.png",
        animation: "fall",
        origin: "52.8% 48.2%",   // tope-centro de la chapa = eje de pivote
        zoomCx: 52.8,             // centro horizontal de la chapa (%)
        zoomCy: 56.4,             // centro vertical de la chapa (%)
        zoomScale: 6,             // factor de zoom
        label: { en: "Metal plate", ca: "Xapa metàl·lica", es: "Chapa metálica" },
      },
    ],
  },
};
