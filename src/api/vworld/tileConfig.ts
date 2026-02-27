const VWORLD_SATELLITE_URL =
  'https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg';

const CARTO_DARK_URL =
  'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png';

export const getMapStyle = (): maplibregl.StyleSpecification => {
  const useVworld = !!import.meta.env.VITE_VWORLD_API_KEY;

  const tileUrl = useVworld
    ? `${VWORLD_SATELLITE_URL}?apikey=${import.meta.env.VITE_VWORLD_API_KEY}`
    : CARTO_DARK_URL;

  return {
    version: 8,
    sources: {
      'base-tiles': {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: useVworld ? 256 : 512,
        attribution: useVworld
          ? '&copy; <a href="https://www.vworld.kr">V-World</a>'
          : '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
