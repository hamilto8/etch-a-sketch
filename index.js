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
    theme: 'silver', // 'silver' | 'neon'
    cursorX: 8,
    cursorY: 8,
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
  const themeBtn = document.getElementById('themeBtn');
  const saveBtn = document.getElementById('saveBtn');
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
   * Helper to get a tile at specific coordinates (O(1) lookup)
   */
  function getTileAt(x, y) {
    if (x < 0 || x >= state.size || y < 0 || y >= state.size) return null;
    return screen.children[y * state.size + x];
  }

  /**
   * Remove stylus visual indicator from current tile
   */
  function removeStylus() {
    const currentStylus = screen.querySelector('.tile.stylus-tip');
    if (currentStylus) {
      currentStylus.classList.remove('stylus-tip');
    }
  }

  /**
   * Add stylus visual indicator to the active tile
   */
  function updateStylus() {
    removeStylus();
    const activeTile = getTileAt(state.cursorX, state.cursorY);
    if (activeTile) {
      activeTile.classList.add('stylus-tip');
    }
  }

  /**
   * Initialize Grid with DocumentFragment for optimal rendering performance
   */
  function createGrid(size) {
    state.size = size;
    gridSizeLabel.textContent = `${size} x ${size}`;
    gridSlider.value = size;

    // Reset stylus to center
    state.cursorX = Math.floor(size / 2);
    state.cursorY = Math.floor(size / 2);

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

    // Render stylus tip initial position
    updateStylus();
  }

  /**
   * Color application logic based on selected drawing mode
   */
  function applyColor(tile, syncCursor = true) {
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

    // Sync state cursor position if drawing with mouse/touch hover
    if (syncCursor) {
      const index = Array.from(screen.children).indexOf(tile);
      if (index !== -1) {
        state.cursorX = index % state.size;
        state.cursorY = Math.floor(index / state.size);
        updateStylus();
      }
    }
  }

  /**
   * Update accessibility ARIA attributes on knobs
   */
  function updateKnobAria(knobEl, angle) {
    if (!knobEl) return;
    const normalized = ((Math.round(angle) % 360) + 360) % 360;
    knobEl.setAttribute('aria-valuenow', normalized.toString());
  }

  /**
   * Rotate knobs slightly on draw actions to simulate physical mechanism
   */
  function rotateKnob(axis, direction = 1) {
    const delta = direction * 15;
    if (axis === 'x') {
      state.knobAngleX += delta;
      if (knobLeft) {
        knobLeft.style.transform = `rotate(${state.knobAngleX}deg)`;
        updateKnobAria(knobLeft, state.knobAngleX);
      }
    } else {
      state.knobAngleY += delta;
      if (knobRight) {
        knobRight.style.transform = `rotate(${state.knobAngleY}deg)`;
        updateKnobAria(knobRight, state.knobAngleY);
      }
    }
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

    // Keep stylus active at current spot
    updateStylus();

    etchCasing.addEventListener('animationend', () => {
      etchCasing.classList.remove('shake-animation');
    }, { once: true });
  }

  /**
   * Save the current sketch as a high-quality JPG image to local disk
   */
  function saveSketch() {
    if (!saveBtn) return;

    // Visual feedback on button
    const btnTextEl = saveBtn.querySelector('.btn-text');
    const originalText = btnTextEl ? btnTextEl.textContent : 'Save Sketch (JPG)';
    if (btnTextEl) btnTextEl.textContent = 'Saving...';
    saveBtn.classList.add('saved-feedback');

    setTimeout(() => {
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

        // 3. Draw each colored tile
        const tiles = screen.children;
        for (let i = 0; i < tiles.length; i++) {
          const tile = tiles[i];
          if (tile.style.backgroundColor || tile.dataset.darkness) {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);

            const computedStyle = window.getComputedStyle(tile);
            const bgColor = computedStyle.backgroundColor;
            const opacity = parseFloat(computedStyle.opacity || '1');

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = bgColor;

            if (isNeon) {
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

        // 5. Export as JPG and trigger download
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `etch-a-sketch-${timestamp}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (btnTextEl) btnTextEl.textContent = 'Saved! ✓';
      } catch (err) {
        console.error('Failed to save sketch:', err);
        if (btnTextEl) btnTextEl.textContent = 'Error Saving';
      } finally {
        setTimeout(() => {
          if (btnTextEl) btnTextEl.textContent = originalText;
          saveBtn.classList.remove('saved-feedback');
        }, 2000);
      }
    }, 50);
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

  // Touch move support for tablet & mobile screens when drawing directly on canvas
  screen.addEventListener('touchmove', (e) => {
    if (state.hoverMode || state.isDrawing) {
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.classList.contains('tile')) {
        applyColor(target);
      }
    }
  }, { passive: false });

  /* ==========================================================================
     Keyboard Controls (Arrow keys & WASD to draw)
     ========================================================================== */
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    let dx = 0;
    let dy = 0;
    let handled = false;

    if (key === 'arrowleft' || key === 'a') {
      dx = -1;
      rotateKnob('x', -1);
      handled = true;
    } else if (key === 'arrowright' || key === 'd') {
      dx = 1;
      rotateKnob('x', 1);
      handled = true;
    } else if (key === 'arrowup' || key === 'w') {
      dy = -1;
      rotateKnob('y', -1);
      handled = true;
    } else if (key === 'arrowdown' || key === 's') {
      dy = 1;
      rotateKnob('y', 1);
      handled = true;
    }

    if (handled) {
      e.preventDefault(); // Stop page scrolling
      
      state.cursorX = Math.max(0, Math.min(state.size - 1, state.cursorX + dx));
      state.cursorY = Math.max(0, Math.min(state.size - 1, state.cursorY + dy));
      
      updateStylus();
      
      const currentTile = getTileAt(state.cursorX, state.cursorY);
      if (currentTile) {
        applyColor(currentTile, false);
      }
    }
  });

  /* ==========================================================================
     Interactive Knobs (Drag / Rotate to Draw) - Tablet Multi-Touch Optimized
     ========================================================================== */
  function setupInteractiveKnob(knobEl, axis) {
    if (!knobEl) return;

    let isDragging = false;
    let activePointerId = null;
    let startAngle = 0;
    let currentRotation = 0;
    let accumulatedDelta = 0;

    // Prevent native iOS Safari scrolling/gestures when touching knobs on iPads/tablets
    knobEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    function getAngle(e) {
      const rect = knobEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    }

    knobEl.addEventListener('pointerdown', (e) => {
      // Prevent multi-touch interference on the same knob
      if (activePointerId !== null) return;
      activePointerId = e.pointerId;
      isDragging = true;
      knobEl.classList.add('dragging');
      try {
        knobEl.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback for environments without pointer capture support
      }
      startAngle = getAngle(e);
      currentRotation = axis === 'x' ? state.knobAngleX : state.knobAngleY;
      accumulatedDelta = 0;
      e.preventDefault();
    });

    knobEl.addEventListener('pointermove', (e) => {
      if (!isDragging || e.pointerId !== activePointerId) return;

      const currentAngle = getAngle(e);
      let angleDiff = currentAngle - startAngle;

      // Handle wrapping discontinuity
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      const newRotation = currentRotation + angleDiff;
      knobEl.style.transform = `rotate(${newRotation}deg)`;
      updateKnobAria(knobEl, newRotation);
      
      if (axis === 'x') {
        state.knobAngleX = newRotation;
      } else {
        state.knobAngleY = newRotation;
      }

      accumulatedDelta += angleDiff;
      startAngle = currentAngle;
      currentRotation = newRotation;

      // Dynamic threshold scaling: scales smoothly across 8x8 up to 64x64 grids
      const threshold = Math.max(5, Math.min(14, Math.round(200 / state.size)));

      // When rotation exceeds threshold, move drawing stylus
      if (Math.abs(accumulatedDelta) >= threshold) {
        const step = Math.sign(accumulatedDelta);
        accumulatedDelta -= step * threshold;

        if (axis === 'x') {
          state.cursorX = Math.max(0, Math.min(state.size - 1, state.cursorX + step));
        } else {
          // Downwards drag/clockwise moves stylus down (y increases)
          state.cursorY = Math.max(0, Math.min(state.size - 1, state.cursorY + step));
        }

        updateStylus();
        const activeTile = getTileAt(state.cursorX, state.cursorY);
        if (activeTile) {
          applyColor(activeTile, false);
        }
      }
    });

    const handleRelease = (e) => {
      if (!isDragging || e.pointerId !== activePointerId) return;
      isDragging = false;
      activePointerId = null;
      knobEl.classList.remove('dragging');
      try {
        if (knobEl.hasPointerCapture(e.pointerId)) {
          knobEl.releasePointerCapture(e.pointerId);
        }
      } catch (err) {
        // Fallback cleanup
      }
    };

    knobEl.addEventListener('pointerup', handleRelease);
    knobEl.addEventListener('pointercancel', handleRelease);
  }

  setupInteractiveKnob(knobLeft, 'x');
  setupInteractiveKnob(knobRight, 'y');

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

  // Canvas Theme Toggle
  themeBtn.addEventListener('click', () => {
    if (state.theme === 'silver') {
      state.theme = 'neon';
      themeBtn.textContent = 'Neon Midnight';
      themeBtn.classList.add('theme-neon');
      screen.classList.add('neon-midnight');
      themeBtn.dataset.theme = 'neon';

      // Automatically swap black lines to neon cyan for visibility on dark screen
      if (state.color === '#1a1a1a' || state.color === '#000000') {
        state.color = '#00f0ff';
        colorPicker.value = '#00f0ff';
        colorHex.textContent = '#00F0FF';
      }
    } else {
      state.theme = 'silver';
      themeBtn.textContent = 'Retro Silver';
      themeBtn.classList.remove('theme-neon');
      screen.classList.remove('neon-midnight');
      themeBtn.dataset.theme = 'silver';

      // Automatically restore dark color for light background
      if (state.color === '#00f0ff') {
        state.color = '#1a1a1a';
        colorPicker.value = '#1a1a1a';
        colorHex.textContent = '#1A1A1A';
      }
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

  // Action Buttons
  if (saveBtn) saveBtn.addEventListener('click', saveSketch);
  clearBtn.addEventListener('click', clearScreen);

  // Initialize Default Grid
  createGrid(state.size);
});