/**
 * PortaPorta — Door Database (v2 — New content order)
 *
 * 10 main doors (porta1–porta10) with full product pages.
 * 3 extra doors (porta11–porta13) visible in gallery/map only → "coming soon".
 *
 * Asset naming:
 *   Door photo : /media/doors/portaX.png
 *   Card image : /media/cards/cardX.png
 *   Product bg : /media/products/productX.png
 *   Details    : /media/details/DetailX.png
 */

export const DOOR_STYLES = {
  modernisme: {
    id: "modernisme",
    label: { en: "Modernisme", ca: "Modernisme", es: "Modernismo" },
    years: "1885–1920",
    color: "#c4897a",
    description: {
      en: "Organic forms inspired by nature — flowers, leaves, waves. Wrought iron arabesques, stained glass, carved wood. The dominant style of the Eixample.",
      ca: "Formes orgàniques inspirades en la natura — flors, fulles, ones. Arabescos de ferro forjat, vitralls, fusta tallada. L'estil dominant de l'Eixample.",
      es: "Formas orgánicas inspiradas en la naturaleza — flores, hojas, olas. Arabescos de hierro forjado, vidrieras, madera tallada. El estilo dominante del Eixample."
    },
    icon: "modern.png"
  },
  gothic: {
    id: "gothic",
    label: { en: "Catalan Gothic", ca: "Gòtic Català", es: "Gótico Catalán" },
    years: "14th–15th c.",
    color: "#8fa89c",
    description: {
      en: "Large dark solid-wood doors, iron nail studs, pointed or rounded stone arches.",
      ca: "Grans portes de fusta massissa fosca, claus de ferro, arcs de pedra apuntats o arrodonits.",
      es: "Grandes puertas de madera maciza oscura, clavos de hierro, arcos de piedra apuntados."
    },
    icon: "gothic.png"
  },
  neoclassical: {
    id: "neoclassical",
    label: { en: "Neoclassical / Eclectic", ca: "Neoclàssic / Eclèctic", es: "Neoclásico / Ecléctico" },
    years: "1820–1900",
    color: "#b8a87a",
    description: {
      en: "Strict symmetry, straight moldings, triangular pediments, geometric paneling.",
      ca: "Simetria estricta, motllures rectes, frontons triangulars, panells geomètrics.",
      es: "Simetría estricta, molduras rectas, frontones triangulares, paneles geométricos."
    },
    icon: "neoclassical.png"
  },
  deco: {
    id: "deco",
    label: { en: "Art Déco / Sezession", ca: "Art Déco / Secessió", es: "Art Déco / Secesión" },
    years: "1900–1940",
    color: "#9ab0c4",
    description: {
      en: "Angular geometry, fan and sunburst motifs, black or gold lacquered iron, beveled glass.",
      ca: "Geometria angular, motius de ventall i raigs solars, ferro lacat negre o daurat, vidre bisellat.",
      es: "Geometría angular, motivos de abanico y rayos solares, hierro lacado negro o dorado, cristal biselado."
    },
    icon: "artdeco.png"
  },
  eclectic: {
    id: "eclectic",
    label: { en: "Eclecticism", ca: "Eclecticisme", es: "Eclecticismo" },
    years: "1850–1910",
    color: "#b49abf",
    description: {
      en: "Blending classical, Renaissance, and emerging modern influences into rich, detailed façades.",
      ca: "Barreja d'influències clàssiques, renaixentistes i modernes en façanes riques i detallades.",
      es: "Mezcla de influencias clásicas, renacentistas y modernas en fachadas ricas y detalladas."
    },
    icon: "renaixenca.png"
  }
};

export const DOORS = [
  /* ═══════════════════════════════════════════
     MAIN 10 DOORS — full product pages
     ═══════════════════════════════════════════ */
  {
    id: 1,
    name: { en: "Casa Jaume Salló", ca: "Casa Jaume Salló", es: "Casa Jaume Salló" },
    address: "Rambla de Catalunya, 61",
    style: "modernisme",
    year: 1901,
    architect: "Jaume Sanllehí Molist",
    location: "Rambla de Catalunya",
    materials: {
      en: "Sculpted stone portal, wrought-iron gate, integrated address ornament",
      ca: "Portal de pedra esculpida, reixa de ferro forjat, ornament d'adreça integrat",
      es: "Portal de piedra esculpida, reja de hierro forjado, ornamento de dirección integrado"
    },
    description: {
      en: "The entrance door of Casa Jaume Salló is a striking example of Barcelona's Modernisme architecture. Designed by Jaume Sanllehí Molist and completed in 1901, the building reflects the city's early 20th-century cultural and architectural flourishing. The doorway is framed by sculpted stone elements adorned with vegetal and flowing motifs. In 2021, the façade underwent a major restoration led by Antoni Castella's architectural studio.",
      ca: "La porta d'entrada de la Casa Jaume Salló és un exemple destacat de l'arquitectura modernista de Barcelona. Dissenyada per Jaume Sanllehí Molist i acabada el 1901, l'edifici reflecteix el floriment cultural i arquitectònic de la ciutat a principis del segle XX.",
      es: "La puerta de entrada de la Casa Jaume Salló es un ejemplo destacado de la arquitectura modernista de Barcelona. Diseñada por Jaume Sanllehí Molist y terminada en 1901, el edificio refleja el florecimiento cultural y arquitectónico de la ciudad a principios del siglo XX."
    },
    history: {
      en: "Casa Jaume Salló has witnessed more than a century of Barcelona's urban growth. In 2021, the façade underwent a major restoration led by Antoni Castella's architectural studio, carefully preserving the original details of the door and decorative elements. Today, the building accommodates offices, commercial spaces, and residences.",
      ca: "La Casa Jaume Salló ha estat testimoni de més d'un segle de creixement urbà de Barcelona. El 2021, la façana va ser restaurada per l'estudi d'Antoni Castella.",
      es: "La Casa Jaume Salló ha sido testigo de más de un siglo de crecimiento urbano de Barcelona. En 2021, la fachada fue restaurada por el estudio de Antoni Castella."
    },
    photo: "porta1.png",
    card: "card1.png",
    product: "product1.png",
    hasProductPage: true,
    details: [],
    mapX: 39.85, mapY: 14.22,
    hotspots: []
  },
  {
    id: 2,
    name: { en: "Casa Fargas", ca: "Casa Fargas", es: "Casa Fargas" },
    address: "Rambla de Catalunya, 47",
    style: "modernisme",
    year: 1904,
    architect: "Enric Sagnier i Villavecchia",
    location: "Rambla de Catalunya",
    materials: {
      en: "Sculpted stone portal, decorative iron gate, integrated architectural ornament",
      ca: "Portal de pedra esculpida, reixa de ferro decorativa, ornament arquitectònic integrat",
      es: "Portal de piedra esculpida, reja de hierro decorativa, ornamento arquitectónico integrado"
    },
    description: {
      en: "The entrance door of Casa Fargas is a refined example of early 20th-century Catalan Modernisme. Designed by Enric Sagnier i Villavecchia and completed between 1902 and 1904, the building reflects Barcelona's architectural transformation during the expansion of the Eixample district.",
      ca: "La porta d'entrada de la Casa Fargas és un exemple refinat del Modernisme català de principis del segle XX. Dissenyada per Enric Sagnier i Villavecchia.",
      es: "La puerta de entrada de la Casa Fargas es un ejemplo refinado del Modernismo catalán de principios del siglo XX. Diseñada por Enric Sagnier i Villavecchia."
    },
    history: {
      en: "Casa Fargas has been part of Barcelona's urban landscape for more than a century. Over time, the building has undergone modifications and restoration work to preserve its original decorative details. Today the building continues to serve residential and commercial functions.",
      ca: "La Casa Fargas forma part del paisatge urbà de Barcelona des de fa més d'un segle.",
      es: "La Casa Fargas forma parte del paisaje urbano de Barcelona desde hace más de un siglo."
    },
    photo: "porta2.png",
    card: "card2.png",
    product: "product2.png",
    hasProductPage: true,
    details: [],
    mapX: 39.85, mapY: 17.5,
    hotspots: []
  },
  {
    id: 3,
    name: { en: "Casa Bosch Alsina", ca: "Casa Bosch Alsina", es: "Casa Bosch Alsina" },
    address: "Plaça d'Antoni Maura, 1",
    style: "eclectic",
    year: 1892,
    architect: "Joan Baptista Pons i Trabal",
    location: "Plaça de Catalunya",
    materials: {
      en: "Decorative stone portal, carved wooden double doors, ornamental iron hardware",
      ca: "Portal de pedra decoratiu, portes dobles de fusta tallada, ferreria ornamental",
      es: "Portal de piedra decorativo, puertas dobles de madera tallada, herrería ornamental"
    },
    description: {
      en: "The entrance door of Casa Bosch Alsina belongs to a prominent late-19th-century residential and commercial building near the historic center. Commissioned by industrialist Ròmul Bosch Alsina and designed by Joan Baptista Pons i Trabal, it blends classical symmetry with ornamental elements.",
      ca: "La porta d'entrada de la Casa Bosch Alsina pertany a un edifici residencial i comercial prominent de finals del segle XIX.",
      es: "La puerta de entrada de la Casa Bosch Alsina pertenece a un edificio residencial y comercial prominente de finales del siglo XIX."
    },
    history: {
      en: "Casa Bosch Alsina remains an important historical building in Barcelona's city center. Restoration efforts have preserved the façade and entrance elements. Today the building continues to house offices and commercial spaces.",
      ca: "La Casa Bosch Alsina continua sent un edifici històric important al centre de Barcelona.",
      es: "La Casa Bosch Alsina sigue siendo un edificio histórico importante en el centro de Barcelona."
    },
    photo: "porta3.png",
    card: "card3.png",
    product: "product3.png",
    hasProductPage: true,
    details: [],
    mapX: 41.47, mapY: 44.97,
    hotspots: []
  },
  {
    id: 4,
    name: { en: "Casa Heribert Pons", ca: "Casa Heribert Pons", es: "Casa Heribert Pons" },
    address: "Rambla de Catalunya, 19–21",
    style: "modernisme",
    year: 1909,
    architect: "Alexandre Soler i March",
    location: "Rambla de Catalunya",
    materials: {
      en: "Stone portal with central column, decorative wooden and glass doors, Art Nouveau geometric patterns",
      ca: "Portal de pedra amb columna central, portes de fusta i vidre decoratives, patrons geomètrics Art Nouveau",
      es: "Portal de piedra con columna central, puertas de madera y vidrio decorativas, patrones geométricos Art Nouveau"
    },
    description: {
      en: "Located at Rambla de Catalunya 19–21, Casa Heribert Pons is a remarkable example of early 20th-century Catalan Modernisme. Designed for the textile industrialist Heribert Pons, the building stands out for its rich sculptural decoration and Gothic-inspired elements.",
      ca: "Situada a la Rambla de Catalunya 19–21, la Casa Heribert Pons és un exemple notable del Modernisme català de principis del segle XX.",
      es: "Situada en la Rambla de Catalunya 19–21, la Casa Heribert Pons es un ejemplo notable del Modernismo catalán de principios del siglo XX."
    },
    history: {
      en: "The façade and entrance elements have been preserved through restoration efforts. Today the building houses offices and commercial spaces while continuing to represent Barcelona's architectural heritage.",
      ca: "La façana i els elements d'entrada s'han preservat gràcies a treballs de restauració.",
      es: "La fachada y los elementos de entrada se han preservado gracias a trabajos de restauración."
    },
    photo: "porta4.png",
    card: "card4.png",
    product: "product4.png",
    hasProductPage: true,
    details: [],
    mapX: 39.85, mapY: 30.32,
    hotspots: []
  },
  {
    id: 5,
    name: { en: "Casa Agustí Manaut", ca: "Casa Agustí Manaut", es: "Casa Agustí Manaut" },
    address: "Rambla de Catalunya, 1",
    style: "eclectic",
    year: 1900,
    architect: "Enric Sagnier i Villavecchia",
    location: "Plaça de Catalunya",
    materials: {
      en: "Stone portal and central column, glass doors with black metal grilles, decorative ironwork",
      ca: "Portal de pedra i columna central, portes de vidre amb reixats metàl·lics negres, ferreria decorativa",
      es: "Portal de piedra y columna central, puertas de vidrio con rejas metálicas negras, herrería decorativa"
    },
    description: {
      en: "The entrance door of Casa Agustí Manaut, located near Plaça de Catalunya, belongs to a late 19th-century building designed by Enric Sagnier i Villavecchia. It illustrates the transitional moment between historicist architecture and the emerging influence of Catalan Modernisme.",
      ca: "La porta d'entrada de la Casa Agustí Manaut, situada prop de la Plaça de Catalunya, pertany a un edifici de finals del segle XIX.",
      es: "La puerta de entrada de la Casa Agustí Manaut, situada cerca de la Plaça de Catalunya, pertenece a un edificio de finales del siglo XIX."
    },
    history: {
      en: "Casa Agustí Manaut has remained part of Barcelona's central urban landscape for more than a century. Today, the ground floor hosts a pharmacy, reflecting the building's continued integration into everyday city life.",
      ca: "La Casa Agustí Manaut forma part del paisatge urbà central de Barcelona des de fa més d'un segle.",
      es: "La Casa Agustí Manaut forma parte del paisaje urbano central de Barcelona desde hace más de un siglo."
    },
    photo: "porta5.png",
    card: "card5.png",
    product: "product5.png",
    hasProductPage: true,
    details: [],
    mapX: 40.44, mapY: 43.39,
    hotspots: []
  },
  {
    id: 6,
    name: { en: "Casa Llimona", ca: "Casa Llimona", es: "Casa Llimona" },
    address: "Carrer de Mallorca, 140",
    style: "modernisme",
    year: 1904,
    architect: "Lluís Sagnier i Nadal",
    location: "Plaça de Catalunya",
    materials: {
      en: "Decorative stone portal, glass door with decorative ironwork, ornamental upper section",
      ca: "Portal de pedra decoratiu, porta de vidre amb ferreria decorativa, secció superior ornamental",
      es: "Portal de piedra decorativo, puerta de vidrio con herrería decorativa, sección superior ornamental"
    },
    description: {
      en: "The entrance door of Casa Llimona forms part of a residential building designed by Lluís Sagnier i Nadal in the early 20th century. Built during the flourishing period of Catalan Modernisme, the building reflects the artistic and architectural creativity that characterized Barcelona.",
      ca: "La porta d'entrada de la Casa Llimona forma part d'un edifici residencial dissenyat per Lluís Sagnier i Nadal a principis del segle XX.",
      es: "La puerta de entrada de la Casa Llimona forma parte de un edificio residencial diseñado por Lluís Sagnier i Nadal a principios del siglo XX."
    },
    history: {
      en: "The building has recently been transformed into the boutique hotel Casa Llimona Hotel Boutique, maintaining the historic façade and entrance features while accommodating contemporary hospitality functions.",
      ca: "L'edifici s'ha transformat recentment en l'hotel boutique Casa Llimona Hotel Boutique.",
      es: "El edificio se ha transformado recientemente en el hotel boutique Casa Llimona Hotel Boutique."
    },
    photo: "porta6.png",
    card: "card6.png",
    product: "product6.png",
    hasProductPage: true,
    details: [],
    mapX: 71.78, mapY: 27.3,
    hotspots: []
  },
  {
    id: 7,
    name: { en: "Casa Josep Planas", ca: "Casa Josep Planas", es: "Casa Josep Planas" },
    address: "Gran Via de les Corts Catalanes, 633",
    style: "modernisme",
    year: 1902,
    architect: "Josep Puig i Cadafalch",
    location: "Eixample",
    materials: {
      en: "Decorative stone surround, glass door with wrought ironwork, upper decorative section",
      ca: "Emmarcament de pedra decoratiu, porta de vidre amb ferro forjat, secció superior decorativa",
      es: "Encuadre de piedra decorativo, puerta de vidrio con hierro forjado, sección superior decorativa"
    },
    description: {
      en: "The entrance door of Casa Josep Planas, located in the Eixample district, is part of a private residence designed by Josep Puig i Cadafalch in the early 20th century. Constructed during the height of the Catalan Modernisme movement, the building exemplifies the artistic and decorative richness of the era.",
      ca: "La porta d'entrada de la Casa Josep Planas, situada al districte de l'Eixample, forma part d'una residència privada dissenyada per Josep Puig i Cadafalch.",
      es: "La puerta de entrada de la Casa Josep Planas, situada en el distrito del Eixample, forma parte de una residencia privada diseñada por Josep Puig i Cadafalch."
    },
    history: {
      en: "Casa Josep Planas has been preserved through careful restoration to ensure that original decorative elements remain intact. The entrance door continues to serve as a striking example of Catalan Modernisme.",
      ca: "La Casa Josep Planas s'ha preservat mitjançant una acurada restauració.",
      es: "La Casa Josep Planas se ha preservado mediante una cuidadosa restauración."
    },
    photo: "porta7.png",
    card: "card7.png",
    product: "product7.png",
    hasProductPage: true,
    details: [],
    mapX: 70.16, mapY: 31.61,
    hotspots: []
  },
  {
    id: 8,
    name: { en: "Casa Pia Batlló", ca: "Casa Pia Batlló", es: "Casa Pia Batlló" },
    address: "Rambla de Catalunya, 17",
    style: "eclectic",
    year: 1890,
    architect: "Josep Vilaseca i Casanovas",
    location: "Rambla de Catalunya",
    materials: {
      en: "Decorative stone portal, wooden door with wrought ironwork, upper decorative elements",
      ca: "Portal de pedra decoratiu, porta de fusta amb ferro forjat, elements decoratius superiors",
      es: "Portal de piedra decorativo, puerta de madera con hierro forjado, elementos decorativos superiores"
    },
    description: {
      en: "The entrance of Casa Pia Batlló, located at Rambla de Catalunya 17, forms part of a residential building designed by Josep Vilaseca i Casanovas. The building reflects the eclectic style popular in the late 19th century, combining classical, Renaissance, and early modernist influences.",
      ca: "L'entrada de la Casa Pia Batlló, situada a la Rambla de Catalunya 17, forma part d'un edifici residencial dissenyat per Josep Vilaseca i Casanovas.",
      es: "La entrada de la Casa Pia Batlló, situada en la Rambla de Catalunya 17, forma parte de un edificio residencial diseñado por Josep Vilaseca i Casanovas."
    },
    history: {
      en: "Casa Pia Batlló has preserved its historic entrance, reflecting the blend of architectural styles characteristic of the period. The door remains a focal point of the façade.",
      ca: "La Casa Pia Batlló ha preservat la seva entrada històrica.",
      es: "La Casa Pia Batlló ha preservado su entrada histórica."
    },
    photo: "porta8.png",
    card: "card8.png",
    product: "product8.png",
    hasProductPage: true,
    details: [],
    mapX: 39.7, mapY: 31.9,
    hotspots: []
  },
  {
    id: 9,
    name: { en: "Casa Pratsjusà", ca: "Casa Pratsjusà", es: "Casa Pratsjusà" },
    address: "Rambla de Catalunya, 25",
    style: "modernisme",
    year: 1894,
    architect: "Antoni Serra i Pujals",
    location: "Rambla de Catalunya",
    materials: {
      en: "Classical stone columns, carved wooden door with metal ornaments, rich façade composition",
      ca: "Columnes de pedra clàssiques, porta de fusta tallada amb ornaments metàl·lics",
      es: "Columnas de piedra clásicas, puerta de madera tallada con ornamentos metálicos"
    },
    description: {
      en: "The entrance of Casa Pratsjusà, located at Rambla de Catalunya 25, belongs to a historic residential building designed by Antoni Serra i Pujals. Completed around 1894, the building is a notable example of Catalan Modernisme.",
      ca: "L'entrada de la Casa Pratsjusà, situada a la Rambla de Catalunya 25, pertany a un edifici residencial històric dissenyat per Antoni Serra i Pujals.",
      es: "La entrada de la Casa Pratsjusà, situada en la Rambla de Catalunya 25, pertenece a un edificio residencial histórico diseñado por Antoni Serra i Pujals."
    },
    history: {
      en: "Casa Pratsjusà has retained its historic entrance through careful preservation. The doorway remains a key architectural element illustrating the integration of decorative arts and structural elegance.",
      ca: "La Casa Pratsjusà ha conservat la seva entrada històrica gràcies a una acurada preservació.",
      es: "La Casa Pratsjusà ha conservado su entrada histórica gracias a una cuidadosa preservación."
    },
    photo: "porta9.png",
    card: "card9.png",
    product: "product9.png",
    hasProductPage: true,
    details: [],
    mapX: 40.14, mapY: 28.88,
    hotspots: []
  },
  {
    id: 10,
    name: { en: "Casa Bernardí Montells", ca: "Casa Bernardí Montells", es: "Casa Bernardí Montells" },
    address: "Rambla de Catalunya, 15",
    style: "modernisme",
    year: 1900,
    architect: null,
    location: "Rambla de Catalunya",
    materials: {
      en: "Decorative stone portal, wooden door with wrought ironwork, upper decorative section",
      ca: "Portal de pedra decoratiu, porta de fusta amb ferro forjat, secció superior decorativa",
      es: "Portal de piedra decorativo, puerta de madera con hierro forjado, sección superior decorativa"
    },
    description: {
      en: "The entrance of Casa Bernardí Montells, located on Rambla de Catalunya, forms part of a distinguished residential building from the height of the Catalan Modernisme movement. The building reflects the artistic and architectural innovation of turn-of-the-century Barcelona.",
      ca: "L'entrada de la Casa Bernardí Montells, situada a la Rambla de Catalunya, forma part d'un distingit edifici residencial del Modernisme català.",
      es: "La entrada de la Casa Bernardí Montells, situada en la Rambla de Catalunya, forma parte de un distinguido edificio residencial del Modernismo catalán."
    },
    history: {
      en: "Casa Bernardí Montells has maintained its historic entrance through careful preservation. The doorway continues to reflect the craftsmanship, ornamental creativity, and aesthetic principles of Catalan Modernisme.",
      ca: "La Casa Bernardí Montells ha mantingut la seva entrada històrica gràcies a una acurada preservació.",
      es: "La Casa Bernardí Montells ha mantenido su entrada histórica gracias a una cuidadosa preservación."
    },
    photo: "porta10.png",
    card: "card10.png",
    product: "product10.png",
    hasProductPage: true,
    details: [],
    mapX: 39.7, mapY: 35.63,
    hotspots: []
  },

  /* ═══════════════════════════════════════════
     EXTRA 3 DOORS — gallery/map only, "coming soon"
     ═══════════════════════════════════════════ */
  {
    id: 11,
    name: { en: "Carrer de Bailèn, 159", ca: "Carrer de Bailèn, 159", es: "Calle de Bailén, 159" },
    address: "Carrer de Bailèn, 159",
    style: "eclectic",
    year: null,
    architect: null,
    location: "Eixample",
    materials: { en: "Arched wooden panels, classic stone frame", ca: "Panells de fusta en arc, marc de pedra clàssic", es: "Paneles de madera en arco, marco de piedra clásico" },
    description: {
      en: "A door characterized by its arched top and decorative wooden panels set within a classic stone frame.",
      ca: "Una porta caracteritzada pel seu cim en arc i panells de fusta decoratius.",
      es: "Una puerta caracterizada por su remate en arco y paneles de madera decorativos."
    },
    photo: "porta11.png",
    card: null,
    product: null,
    hasProductPage: false,
    details: [],
    mapX: 42.2, mapY: 22.41,
    hotspots: []
  },
  {
    id: 12,
    name: { en: "Carrer de Francisco Giner, 45", ca: "Carrer de Francisco Giner, 45", es: "Calle de Francisco Giner, 45" },
    address: "Carrer de Francisco Giner, 45",
    style: "modernisme",
    year: null,
    architect: null,
    location: "Gràcia",
    materials: { en: "Art Nouveau iron gate, floral metalwork, stone surround", ca: "Reixa Art Nouveau de ferro, ferreria floral, emmarcament de pedra", es: "Reja Art Nouveau de hierro, herrería floral, encuadre de piedra" },
    description: {
      en: "This entrance bears a strong visual resemblance to Art Nouveau iron gates associated with Virginio Colombo.",
      ca: "Aquesta entrada s'assembla visualment a les reixes Art Nouveau associades a Virginio Colombo.",
      es: "Esta entrada guarda un fuerte parecido con las rejas Art Nouveau asociadas a Virginio Colombo."
    },
    photo: "porta12.png",
    card: null,
    product: null,
    hasProductPage: false,
    details: [],
    mapX: 39.41, mapY: 8.91,
    hotspots: []
  },
  {
    id: 13,
    name: { en: "Casa Torres Germans", ca: "Casa Torres Germans", es: "Casa Torres Germans" },
    address: "Carrer de París, 182",
    style: "modernisme",
    year: null,
    architect: null,
    location: "Eixample",
    materials: { en: "Dark iron gate, geometric and floral Modernista ironwork", ca: "Reixa de ferro fosc, ferreria modernista", es: "Reja de hierro oscuro, herrería modernista" },
    description: {
      en: "A Modernista entrance featuring a dark iron gate with intricate geometric and floral patterns.",
      ca: "Una entrada modernista amb una reixa de ferro fosc amb patrons geomètrics i florals.",
      es: "Una entrada modernista con una reja de hierro oscuro con patrones geométricos y florales."
    },
    photo: "porta13.png",
    card: null,
    product: null,
    hasProductPage: false,
    details: [],
    mapX: 39.7, mapY: 6.18,
    hotspots: []
  }
];

export const MAP_REFERENCE_POINTS = [
  { name: "Passeig de Gràcia",    x: 52.06, y: 0     },
  { name: "Casa Batlló",          x: 49.71, y: 8.76  },
  { name: "Eixample",             x: 20.72, y: 11.93 },
  { name: "Plaça Universitat",    x: 26.46, y: 41.24 },
  { name: "Plaça Catalunya",      x: 45.00, y: 51.72 },
  { name: "Urquinaona",           x: 65.89, y: 52.73 },
  { name: "Catedral de Barcelona",x: 51.77, y: 76.58 },
  { name: "Gran Via",             x: 46.76, y: 32.76 },
  { name: "Liceu",                x: 27.49, y: 91.67 },
  { name: "Gòtic",                x: 48.68, y: 85.20 },
  { name: "Raval",                x:  3.35, y: 84.77 },
  { name: "Rambla de Catalunya",  x: 40.88, y: 25.00 },
];
