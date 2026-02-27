export const exportMapScreenshot = async (): Promise<void> => {
  // Find map and deck.gl canvases
  const mapCanvas = document.querySelector('.maplibregl-canvas') as HTMLCanvasElement | null;
  const deckCanvas = document.querySelector('canvas[id^="deckgl-overlay"]') as HTMLCanvasElement | null
    ?? document.querySelector('.deck-canvas') as HTMLCanvasElement | null;

  if (!mapCanvas) {
    console.warn('Map canvas not found');
    return;
  }

  // Create composite canvas
  const width = mapCanvas.width;
  const height = mapCanvas.height;
  const composite = document.createElement('canvas');
  composite.width = width;
  composite.height = height;
  const ctx = composite.getContext('2d');
  if (!ctx) return;

  // Draw map first
  ctx.drawImage(mapCanvas, 0, 0);

  // Draw deck.gl overlay on top
  if (deckCanvas) {
    ctx.drawImage(deckCanvas, 0, 0, width, height);
  }

  // Add watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    `logi-twin | ${new Date().toLocaleString()}`,
    width - 16,
    height - 12,
  );

  // Download
  composite.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logi-twin-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
};
