/**
 * Image Export & Download Engine
 * Renders the DOM grid state onto a high-resolution 1024x1024 HTML5 Canvas and exports synchronously.
 */

import { state } from './state.js';
import { dom } from './dom.js';

/**
 * Save the current sketch as a high-quality JPG image to local disk
 * Executed synchronously within the user gesture to prevent browser download/popup blockers
 */
export function saveSketch(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!dom.saveBtn || !dom.screen) return;

  // Visual feedback on button
  const btnTextEl = dom.saveBtn.querySelector('.btn-text');
  const originalText = btnTextEl ? btnTextEl.textContent : 'Save Sketch (JPG)';
  if (btnTextEl) btnTextEl.textContent = 'Saving...';
  dom.saveBtn.classList.add('saved-feedback');

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const exportSize = 1024; // 1024x1024 resolution
    canvas.width = exportSize;
    canvas.height = exportSize;

    // 1. Fill background based on active theme
    const isNeon = state.theme === 'neon';
    ctx.fillStyle = isNeon ? '#111317' : '#dcdad5';
    ctx.fillRect(0, 0, exportSize, exportSize);

    // 2. Draw subtle background grid dot pattern
    const gridSize = state.size;
    const tileSize = exportSize / gridSize;

    ctx.fillStyle = isNeon ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const centerX = x * tileSize + tileSize / 2;
        const centerY = y * tileSize + tileSize / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Draw each colored tile fast by checking inline style or dataset
    const tiles = dom.screen.children;
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const bgColor = tile.style.backgroundColor;
      if (bgColor || tile.dataset.darkness) {
        const x = i % gridSize;
        const y = Math.floor(i / gridSize);

        const opacity = parseFloat(tile.style.opacity || '1');

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = bgColor || (isNeon ? '#111317' : '#1a1a1a');

        if (isNeon && bgColor) {
          ctx.shadowColor = bgColor;
          ctx.shadowBlur = 12;
        }

        // Draw tile cell with slight overlap to prevent gaps
        ctx.fillRect(
          x * tileSize,
          y * tileSize,
          Math.ceil(tileSize),
          Math.ceil(tileSize)
        );
        ctx.restore();
      }
    }

    // 4. Draw branding watermark at bottom right
    ctx.save();
    ctx.font = '600 22px Outfit, sans-serif';
    ctx.fillStyle = isNeon ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)';
    ctx.textAlign = 'right';
    ctx.fillText('Etch a Sketch PRO', exportSize - 28, exportSize - 28);
    ctx.restore();

    // 5. Export as JPG and trigger download synchronously within the active user gesture
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `etch-a-sketch-${timestamp}.jpg`;
    link.href = dataUrl;
    link.target = '_blank'; // Fallback for WebViews or browsers where download attribute needs tab opening
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) document.body.removeChild(link);
    }, 100);

    if (btnTextEl) btnTextEl.textContent = 'Saved! ✓';
  } catch (err) {
    console.error('Failed to save sketch:', err);
    if (btnTextEl) btnTextEl.textContent = 'Error Saving';
  } finally {
    setTimeout(() => {
      if (btnTextEl) btnTextEl.textContent = originalText;
      dom.saveBtn.classList.remove('saved-feedback');
    }, 2000);
  }
}
