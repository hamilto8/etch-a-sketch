/**
 * Grid Rendering, Styling, & Interaction Engine
 * Manages DocumentFragment batch rendering, drawing tool logic, and stylus position indicators.
 */

import { state } from './state.js';
import { dom } from './dom.js';

/**
 * Retrieve the tile element at specified grid (x, y) coordinates
 */
export function getTileAt(x, y) {
  if (!dom.screen) return null;
  const index = y * state.size + x;
  return dom.screen.children[index] || null;
}

/**
 * Remove stylus visual indicator from current tile
 */
export function removeStylus() {
  if (!dom.screen) return;
  const currentStylus = dom.screen.querySelector('.tile.stylus-tip');
  if (currentStylus) {
    currentStylus.classList.remove('stylus-tip');
  }
}

/**
 * Add stylus visual indicator to the active tile
 */
export function updateStylus() {
  removeStylus();
  const activeTile = getTileAt(state.cursorX, state.cursorY);
  if (activeTile) {
    activeTile.classList.add('stylus-tip');
  }
}

/**
 * Initialize Grid with DocumentFragment for optimal O(1) DOM rendering performance
 */
export function createGrid(size) {
  if (!dom.screen) return;
  state.size = size;
  
  if (dom.gridSizeLabel) dom.gridSizeLabel.textContent = `${size} x ${size}`;
  if (dom.gridSlider) dom.gridSlider.value = size;

  // Reset stylus to center
  state.cursorX = Math.floor(size / 2);
  state.cursorY = Math.floor(size / 2);

  // Update active state on quick resolution buttons
  if (dom.sizeButtons) {
    dom.sizeButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.size, 10) === size);
    });
  }

  // Configure CSS Grid layout
  dom.screen.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  dom.screen.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  // Batch DOM insertion using DocumentFragment
  const fragment = document.createDocumentFragment();
  const totalTiles = size * size;

  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    fragment.appendChild(tile);
  }

  // Clean replacement of existing children
  dom.screen.replaceChildren(fragment);

  // Render initial stylus tip position
  updateStylus();
}

/**
 * Color application logic based on selected drawing mode
 */
export function applyColor(tile, syncCursor = true) {
  if (!tile || !tile.classList.contains('tile')) return;

  if (state.mode === 'eraser') {
    tile.style.removeProperty('background-color');
    tile.style.removeProperty('opacity');
    delete tile.dataset.darkness;
  } else if (state.mode === 'shader') {
    let currentDarkness = parseInt(tile.dataset.darkness || '0', 10);
    if (currentDarkness < 10) {
      currentDarkness += 1;
      tile.dataset.darkness = currentDarkness;
      tile.style.backgroundColor = state.color;
      tile.style.opacity = (currentDarkness * 0.1).toFixed(1);
    }
  } else if (state.mode === 'rainbow') {
    const randomHue = Math.floor(Math.random() * 360);
    tile.style.backgroundColor = `hsl(${randomHue}, 80%, 50%)`;
    tile.style.removeProperty('opacity');
    delete tile.dataset.darkness;
  } else {
    // Standard Solid Color Mode
    tile.style.backgroundColor = state.color;
    tile.style.removeProperty('opacity');
    delete tile.dataset.darkness;
  }

  // Sync state cursor position if drawing with pointer hover or click & drag
  if (syncCursor && dom.screen) {
    const index = Array.from(dom.screen.children).indexOf(tile);
    if (index !== -1) {
      state.cursorX = index % state.size;
      state.cursorY = Math.floor(index / state.size);
      updateStylus();
    }
  }
}

/**
 * Clear screen with physics-based CSS keyframe shake animation
 */
export function clearScreen() {
  if (!dom.screen || !dom.etchCasing) return;
  dom.etchCasing.classList.add('shake-animation');

  const tiles = dom.screen.children;
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.style.removeProperty('background-color');
    tile.style.removeProperty('opacity');
    delete tile.dataset.darkness;
  }

  // Reset stylus to center
  state.cursorX = Math.floor(state.size / 2);
  state.cursorY = Math.floor(state.size / 2);
  updateStylus();

  dom.etchCasing.addEventListener('animationend', () => {
    dom.etchCasing.classList.remove('shake-animation');
  }, { once: true });
}

/**
 * Setup global pointer and touch event delegation for drawing
 */
export function setupGridInteraction() {
  if (!dom.screen) return;

  // Global Pointer Down/Up tracking for Drag mode
  window.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#screen')) {
      state.isDrawing = true;
      applyColor(e.target);
    }
  });

  window.addEventListener('pointerup', () => {
    state.isDrawing = false;
  });

  // Pointer move / over for continuous drawing
  dom.screen.addEventListener('pointerover', (e) => {
    if (state.hoverMode || state.isDrawing) {
      applyColor(e.target);
    }
  });

  // Touch move support for tablet & mobile screens when drawing directly on canvas
  dom.screen.addEventListener('touchmove', (e) => {
    if (state.hoverMode || state.isDrawing) {
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.classList.contains('tile')) {
        applyColor(target);
      }
    }
  }, { passive: false });
}
