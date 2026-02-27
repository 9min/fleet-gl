const VWORLD_SATELLITE_URL =
  'https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg';

const OSM_RASTER_URL =
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const getMapStyle = (): maplibregl.StyleSpecification => {
  const useVworld = !!import.meta.env.VITE_VWORLD_API_KEY;

  const tileUrl = useVworld
    ? `${VWORLD_SATELLITE_URL}?apikey=${import.meta.env.VITE_VWORLD_API_KEY}`
    : OSM_RASTER_URL;

  return {
    version: 8,
    sources: {
      'base-tiles': {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: useVworld
          ? '&copy; <a href="https://www.vworld.kr">V-World</a>'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
  };
};
