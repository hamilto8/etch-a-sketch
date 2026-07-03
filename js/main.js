/**
 * Etch a Sketch PRO - Modern ES6+ Modular Edition
 * Application Entry Point: Bootstraps DOM initialization, state, drawing engine, and UI handlers.
 */

import { initDom, dom } from './dom.js';
import { state } from './state.js';
import { createGrid, setupGridInteraction } from './grid.js';
import { setupInteractiveKnob, setupKeyboardControls } from './knobs.js';
import { setupUIListeners } from './ui.js';
import { initShakeToErase } from './motion.js';

/**
 * Initialize all application subsystems once the document is ready
 */
function initApp() {
  // 1. Cache DOM references
  initDom();

  // 2. Set dynamic footer copyright year
  if (dom.yearSpan) {
    dom.yearSpan.textContent = new Date().getFullYear();
  }

  // 3. Initialize grid drawing interaction (Pointer & Touch delegation)
  setupGridInteraction();

  // 4. Initialize physical interactive knobs (X and Y axes)
  setupInteractiveKnob(dom.knobLeft, 'x');
  setupInteractiveKnob(dom.knobRight, 'y');

  // 5. Initialize keyboard navigation (Arrow keys & WASD)
  setupKeyboardControls();

  // 6. Bind control panel UI event listeners
  setupUIListeners();

  // 7. Initialize mobile accelerometer shake-to-erase detection
  initShakeToErase();

  // 8. Render initial canvas grid resolution
  createGrid(state.size);
}

// Bootstrap application on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
