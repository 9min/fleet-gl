// ---------------------------------------------------------------------------
// Map Style Configuration
// ---------------------------------------------------------------------------
// Default: OpenFreeMap vector tiles with custom dark style + 3D buildings
// Fallback: V-World raster tiles when VITE_VWORLD_API_KEY is set
// ---------------------------------------------------------------------------

// -- Color palette (matches dashboard UI) ------------------------------------
const C = {
  bg: '#080E17',
  water: '#0A1525',
  waterway: '#0D1A2E',
  land: '#0C1420',
  landcoverGrass: '#0D1A1A',
  landcoverWood: '#0C1818',
  landuse: '#0E151F',
  park: '#0D1E1A',
  buildingFlat: '#131E2A',
  buildingLow: '#1A2A3D',
  buildingHigh: '#253B52',
  roadService: '#151E28',
  roadMinor: '#1A2535',
  roadMajor: '#1F2E42',
  roadHighway: '#243548',
  roadHighwayCasing: '#0E3A5C',
  railway: '#1A2535',
  boundary: '#1E3050',
  aeroway: '#1A2535',
  labelRoad: '#3A5068',
  labelTown: '#4A6580',
  labelCity: '#5A7A95',
  labelCountry: '#6A8DA8',
} as const;

// -- OpenFreeMap vector source -----------------------------------------------
const VECTOR_SOURCE = {
  openmaptiles: {
    type: 'vector' as const,
    url: 'https://tiles.openfreemap.org/planet',
  },
};

const GLYPHS =
  'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

// -- Text expression helpers -------------------------------------------------
const nameExpr: maplibregl.ExpressionSpecification = [
  'coalesce',
  ['get', 'name'],
  ['get', 'name:latin'],
];

// -- Layer definitions -------------------------------------------------------
const layers: maplibregl.LayerSpecification[] = [
  // 1. Background
  {
    id: 'background',
    type: 'background',
    paint: { 'background-color': C.bg },
  },

  // 2. Landcover (grass / wood)
  {
    id: 'landcover',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'landcover',
    paint: {
      'fill-color': [
        'match',
        ['get', 'class'],
        'grass',
        C.landcoverGrass,
        'wood',
        C.landcoverWood,
        C.land,
      ],
      'fill-opacity': 0.6,
    },
  },

  // 3. Landuse (residential / industrial / etc.)
  {
    id: 'landuse',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'landuse',
    paint: {
      'fill-color': C.landuse,
      'fill-opacity': 0.4,
    },
  },

  // 4. Park
  {
    id: 'park',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'park',
    paint: {
      'fill-color': C.park,
      'fill-opacity': 0.5,
    },
  },

  // 5. Water
  {
    id: 'water',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'water',
    paint: { 'fill-color': C.water },
  },

  // 6. Waterway
  {
    id: 'waterway',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'waterway',
    paint: {
      'line-color': C.waterway,
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2],
    },
  },

  // 7. Building 2D (flat fill below zoom 14 threshold for 3D)
  {
    id: 'building-2d',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'building',
    maxzoom: 14,
    paint: {
      'fill-color': C.buildingFlat,
      'fill-opacity': 0.6,
    },
  },

  // 8. Road — service / track
  {
    id: 'road-service',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: ['in', ['get', 'class'], ['literal', ['service', 'track']]],
    paint: {
      'line-color': C.roadService,
      'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 18, 3],
    },
  },

  // 9. Road — minor / tertiary
  {
    id: 'road-minor',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: ['in', ['get', 'class'], ['literal', ['minor', 'tertiary']]],
    paint: {
      'line-color': C.roadMinor,
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 18, 6],
    },
  },

  // 10. Road — primary / secondary
  {
    id: 'road-major',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary']]],
    paint: {
      'line-color': C.roadMajor,
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.8, 18, 10],
    },
  },

  // 11. Road — highway casing (glow effect)
  {
    id: 'road-highway-casing',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: ['==', ['get', 'class'], 'motorway'],
    paint: {
      'line-color': C.roadHighwayCasing,
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.5, 18, 18],
      'line-opacity': 0.4,
    },
  },

  // 12. Road — highway
  {
    id: 'road-highway',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: ['==', ['get', 'class'], 'motorway'],
    paint: {
      'line-color': C.roadHighway,
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 18, 12],
    },
  },

  // 13. Railway (dashed)
  {
    id: 'railway',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: ['==', ['get', 'class'], 'rail'],
    paint: {
      'line-color': C.railway,
      'line-width': 1,
      'line-dasharray': [3, 3],
    },
  },

  // 14. Administrative boundary
  {
    id: 'boundary-admin',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'boundary',
    filter: ['<=', ['get', 'admin_level'], 4],
    paint: {
      'line-color': C.boundary,
      'line-width': 1,
      'line-dasharray': [4, 2],
      'line-opacity': 0.5,
    },
  },

  // 15. Aeroway (runways)
  {
    id: 'aeroway',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'aeroway',
    paint: {
      'line-color': C.aeroway,
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 16, 6],
    },
  },

  // 16. Building 3D (fill-extrusion)
  {
    id: 'building-3d',
    type: 'fill-extrusion',
    source: 'openmaptiles',
    'source-layer': 'building',
    minzoom: 14,
    paint: {
      'fill-extrusion-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'render_height'], 12],
        0,
        C.buildingLow,
        40,
        C.buildingHigh,
      ],
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 12],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        14,
        0,
        14.5,
        0.7,
        16,
        0.8,
      ],
    },
  },

  // 17. Label — road names (zoom 15+)
  {
    id: 'label-road',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'transportation_name',
    minzoom: 15,
    layout: {
      'text-field': nameExpr,
      'text-font': ['Noto Sans Regular'],
      'text-size': 11,
      'symbol-placement': 'line',
      'text-rotation-alignment': 'map',
      'text-max-angle': 30,
    },
    paint: {
      'text-color': C.labelRoad,
      'text-halo-color': C.bg,
      'text-halo-width': 1,
    },
  },

  // 18. Label — towns (dong / eup / myeon)
  {
    id: 'label-place-town',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'place',
    filter: ['in', ['get', 'class'], ['literal', ['town', 'village', 'suburb', 'neighbourhood']]],
    minzoom: 12,
    layout: {
      'text-field': nameExpr,
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 14],
    },
    paint: {
      'text-color': C.labelTown,
      'text-halo-color': C.bg,
      'text-halo-width': 1,
    },
  },

  // 19. Label — cities (si / do)
  {
    id: 'label-place-city',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'place',
    filter: ['==', ['get', 'class'], 'city'],
    minzoom: 6,
    layout: {
      'text-field': nameExpr,
      'text-font': ['Noto Sans Bold'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 6, 12, 14, 20],
    },
    paint: {
      'text-color': C.labelCity,
      'text-halo-color': C.bg,
      'text-halo-width': 1.5,
    },
  },

  // 20. Label — country
  {
    id: 'label-country',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'place',
    filter: ['==', ['get', 'class'], 'country'],
    layout: {
      'text-field': nameExpr,
      'text-font': ['Noto Sans Bold'],
      'text-size': 14,
    },
    paint: {
      'text-color': C.labelCountry,
      'text-halo-color': C.bg,
      'text-halo-width': 2,
    },
  },
];

// -- Light palette -----------------------------------------------------------
const L = {
  bg: '#E8ECF0',
  water: '#B4D4E8',
  waterway: '#9EC5DB',
  land: '#F0F2F5',
  landcoverGrass: '#D4E8D4',
  landcoverWood: '#C8DCC8',
  landuse: '#E6E9ED',
  park: '#C8E0C8',
  buildingFlat: '#D8DCE2',
  buildingLow: '#CDD2D9',
  buildingHigh: '#B8BFC8',
  roadService: '#F5F5F5',
  roadMinor: '#FFFFFF',
  roadMajor: '#FFFFFF',
  roadHighway: '#FDE68A',
  roadHighwayCasing: '#F59E0B',
  railway: '#D1D5DB',
  boundary: '#9CA3AF',
  aeroway: '#D1D5DB',
  labelRoad: '#6B7280',
  labelTown: '#4B5563',
  labelCity: '#374151',
  labelCountry: '#1F2937',
} as const;

// -- Light map layers --------------------------------------------------------
const lightLayers: maplibregl.LayerSpecification[] = [
  { id: 'background', type: 'background', paint: { 'background-color': L.bg } },
  {
    id: 'landcover', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
    paint: { 'fill-color': ['match', ['get', 'class'], 'grass', L.landcoverGrass, 'wood', L.landcoverWood, L.land], 'fill-opacity': 0.6 },
  },
  { id: 'landuse', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse', paint: { 'fill-color': L.landuse, 'fill-opacity': 0.4 } },
  { id: 'park', type: 'fill', source: 'openmaptiles', 'source-layer': 'park', paint: { 'fill-color': L.park, 'fill-opacity': 0.5 } },
  { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water', paint: { 'fill-color': L.water } },
  { id: 'waterway', type: 'line', source: 'openmaptiles', 'source-layer': 'waterway', paint: { 'line-color': L.waterway, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2] } },
  { id: 'building-2d', type: 'fill', source: 'openmaptiles', 'source-layer': 'building', maxzoom: 14, paint: { 'fill-color': L.buildingFlat, 'fill-opacity': 0.6 } },
  { id: 'road-service', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['service', 'track']]], paint: { 'line-color': L.roadService, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 18, 3] } },
  { id: 'road-minor', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['minor', 'tertiary']]], paint: { 'line-color': L.roadMinor, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 18, 6] } },
  { id: 'road-major', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary']]], paint: { 'line-color': L.roadMajor, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.8, 18, 10] } },
  { id: 'road-highway-casing', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'motorway'], paint: { 'line-color': L.roadHighwayCasing, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.5, 18, 18], 'line-opacity': 0.3 } },
  { id: 'road-highway', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'motorway'], paint: { 'line-color': L.roadHighway, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 18, 12] } },
  { id: 'railway', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': L.railway, 'line-width': 1, 'line-dasharray': [3, 3] } },
  { id: 'boundary-admin', type: 'line', source: 'openmaptiles', 'source-layer': 'boundary', filter: ['<=', ['get', 'admin_level'], 4], paint: { 'line-color': L.boundary, 'line-width': 1, 'line-dasharray': [4, 2], 'line-opacity': 0.5 } },
  { id: 'aeroway', type: 'line', source: 'openmaptiles', 'source-layer': 'aeroway', paint: { 'line-color': L.aeroway, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 16, 6] } },
  {
    id: 'building-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 14,
    paint: {
      'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 12], 0, L.buildingLow, 40, L.buildingHigh],
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 12],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, 0.5, 16, 0.6],
    },
  },
  { id: 'label-road', type: 'symbol', source: 'openmaptiles', 'source-layer': 'transportation_name', minzoom: 15, layout: { 'text-field': nameExpr, 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'symbol-placement': 'line', 'text-rotation-alignment': 'map', 'text-max-angle': 30 }, paint: { 'text-color': L.labelRoad, 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 } },
  { id: 'label-place-town', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['town', 'village', 'suburb', 'neighbourhood']]], minzoom: 12, layout: { 'text-field': nameExpr, 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 14] }, paint: { 'text-color': L.labelTown, 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 } },
  { id: 'label-place-city', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place', filter: ['==', ['get', 'class'], 'city'], minzoom: 6, layout: { 'text-field': nameExpr, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 6, 12, 14, 20] }, paint: { 'text-color': L.labelCity, 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 } },
  { id: 'label-country', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place', filter: ['==', ['get', 'class'], 'country'], layout: { 'text-field': nameExpr, 'text-font': ['Noto Sans Bold'], 'text-size': 14 }, paint: { 'text-color': L.labelCountry, 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 } },
];

// -- Style builders ----------------------------------------------------------

const createDarkVectorStyle = (): maplibregl.StyleSpecification => ({
  version: 8,
  sources: VECTOR_SOURCE,
  glyphs: GLYPHS,
  layers,
  light: {
    anchor: 'viewport',
    color: '#ffffff',
    intensity: 0.2,
    position: [1.5, 90, 80],
  },
});

const createLightVectorStyle = (): maplibregl.StyleSpecification => ({
  version: 8,
  sources: VECTOR_SOURCE,
  glyphs: GLYPHS,
  layers: lightLayers,
  light: {
    anchor: 'viewport',
    color: '#ffffff',
    intensity: 0.4,
    position: [1.5, 90, 80],
  },
});

const VWORLD_SATELLITE_URL =
  'https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg';

const createRasterFallbackStyle = (
  apiKey: string,
): maplibregl.StyleSpecification => ({
  version: 8,
  sources: {
    'base-tiles': {
      type: 'raster',
      tiles: [`${VWORLD_SATELLITE_URL}?apikey=${apiKey}`],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.vworld.kr">V-World</a>',
    },
  },
  layers: [
    {
      id: 'base-tiles-layer',
      type: 'raster',
      source: 'base-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
});

// -- Public API --------------------------------------------------------------

export const getMapStyle = (theme: 'dark' | 'light' = 'dark'): maplibregl.StyleSpecification => {
  const vworldKey = import.meta.env.VITE_VWORLD_API_KEY as string | undefined;
  if (vworldKey) {
    return createRasterFallbackStyle(vworldKey);
  }
  return theme === 'light' ? createLightVectorStyle() : createDarkVectorStyle();
};
