/**
 * Etch a Sketch PRO - Modern Alpha Edition
 * Built with ES6+ standards, Event Delegation, and High-Performance DOM Manipulation
 */

document.addEventListener('DOMContentLoaded', () => {
  // State Management
  const state = {
    size: 16,
    mode: 'color', // 'color' | 'rainbow' | 'shader' | 'eraser'
    color: '#1a1a1a',
    hoverMode: true,
    isDrawing: false,
    knobAngleX: 0,
    knobAngleY: 0
  };

  // DOM Elements
  const screen = document.getElementById('screen');
  const etchCasing = document.getElementById('etchCasing');
  const gridSizeLabel = document.getElementById('gridSizeLabel');
  const gridSlider = document.getElementById('gridSlider');
  const colorPicker = document.getElementById('colorPicker');
  const colorHex = document.getElementById('colorHex');
  const drawModeBtn = document.getElementById('drawModeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const knobLeft = document.getElementById('knobLeft');
  const knobRight = document.getElementById('knobRight');
  const yearSpan = document.getElementById('year');

  const toolButtons = document.querySelectorAll('.tool-btn');
  const sizeButtons = document.querySelectorAll('.size-btn');

  // Set current year in footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /**
   * Initialize Grid with DocumentFragment for optimal rendering performance
   */
  function createGrid(size) {
    state.size = size;
    gridSizeLabel.textContent = `${size} x ${size}`;
    gridSlider.value = size;

    // Update active state on quick buttons
    sizeButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.size, 10) === size);
    });

    // Configure CSS Grid
    screen.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    screen.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // Batch DOM insertion using DocumentFragment
    const fragment = document.createDocumentFragment();
    const totalTiles = size * size;

    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      fragment.appendChild(tile);
    }

    // Clean replacement of existing children
    screen.replaceChildren(fragment);
  }

  /**
   * Color application logic based on selected drawing mode
   */
  function applyColor(tile) {
    if (!tile || !tile.classList.contains('tile')) return;

    if (state.mode === 'eraser') {
      tile.style.removeProperty('background-color');
      tile.style.removeProperty('opacity');
      delete tile.dataset.darkness;
      return;
    }

    if (state.mode === 'shader') {
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

    animateKnobs();
  }

  /**
   * Rotate knobs slightly on each draw action to simulate physical mechanism
   */
  function animateKnobs() {
    state.knobAngleX += (Math.random() > 0.5 ? 8 : -8);
    state.knobAngleY += (Math.random() > 0.5 ? 8 : -8);
    
    if (knobLeft) knobLeft.style.transform = `rotate(${state.knobAngleX}deg)`;
    if (knobRight) knobRight.style.transform = `rotate(${state.knobAngleY}deg)`;
  }

  /**
   * Clear board with animated casing shake
   */
  function clearScreen() {
    if (etchCasing.classList.contains('shake-animation')) return;

    etchCasing.classList.add('shake-animation');

    // Remove background styles from all tiles cleanly
    const tiles = screen.children;
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].style.removeProperty('background-color');
      tiles[i].style.removeProperty('opacity');
      delete tiles[i].dataset.darkness;
    }

    etchCasing.addEventListener('animationend', () => {
      etchCasing.classList.remove('shake-animation');
    }, { once: true });
  }

  /* ==========================================================================
     Event Delegation for Grid Interaction (Supports Mouse & Touch/Pointer)
     ========================================================================== */

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
  screen.addEventListener('pointerover', (e) => {
    if (state.hoverMode || state.isDrawing) {
      applyColor(e.target);
    }
  });

  // Touch move support for mobile screens when in drag mode
  screen.addEventListener('touchmove', (e) => {
    if (!state.hoverMode) {
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.classList.contains('tile')) {
        applyColor(target);
      }
    }
  }, { passive: true });

  /* ==========================================================================
     UI Controls & Tool Event Listeners
     ========================================================================== */

  // Mode Selection Buttons
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toolButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
    });
  });

  // Color Picker & Hex Display
  colorPicker.addEventListener('input', (e) => {
    state.color = e.target.value;
    colorHex.textContent = e.target.value.toUpperCase();
    
    // Automatically switch to solid color mode when choosing a new color
    toolButtons.forEach(b => b.classList.remove('active'));
    const colorToolBtn = document.getElementById('colorBtn');
    if (colorToolBtn) colorToolBtn.classList.add('active');
    state.mode = 'color';
  });

  // Draw Mode Toggle (Hover vs Click & Drag)
  drawModeBtn.addEventListener('click', () => {
    state.hoverMode = !state.hoverMode;
    if (state.hoverMode) {
      drawModeBtn.textContent = 'Hover Mode';
      drawModeBtn.classList.remove('active-drag');
    } else {
      drawModeBtn.textContent = 'Click & Drag';
      drawModeBtn.classList.add('active-drag');
    }
  });

  // Grid Resolution Slider
  gridSlider.addEventListener('input', (e) => {
    const newSize = parseInt(e.target.value, 10);
    gridSizeLabel.textContent = `${newSize} x ${newSize}`;
  });

  gridSlider.addEventListener('change', (e) => {
    const newSize = parseInt(e.target.value, 10);
    createGrid(newSize);
  });

  // Quick Resolution Buttons
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const newSize = parseInt(btn.dataset.size, 10);
      createGrid(newSize);
    });
  });

  // Clear Action
  clearBtn.addEventListener('click', clearScreen);

  // Interactive Knob clicks (spin for fun)
  [knobLeft, knobRight].forEach(knob => {
    if (!knob) return;
    knob.addEventListener('click', () => {
      animateKnobs();
      animateKnobs();
    });
  });

  // Initialize Default Grid
  createGrid(state.size);
});