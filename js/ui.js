/**
 * User Interface & Control Panel Event Handlers
 * Manages theme switching, drawing mode selection, resolution sliders, and action buttons.
 */

import { state } from './state.js';
import { dom } from './dom.js';
import { createGrid, clearScreen } from './grid.js';
import { saveSketch } from './export.js';

/**
 * Bind event listeners to all interactive UI controls
 */
export function setupUIListeners() {
  // Color Picker Input & Hex Display Synchronization
  if (dom.colorPicker) {
    dom.colorPicker.addEventListener('input', (e) => {
      state.color = e.target.value;
      if (dom.colorHex) dom.colorHex.textContent = state.color.toUpperCase();
      
      // If color picker is used while in Eraser or Rainbow mode, switch back to custom Color mode
      if (state.mode === 'eraser' || state.mode === 'rainbow') {
        state.mode = 'color';
        if (dom.modeButtons) {
          dom.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === 'color');
          });
        }
      }
    });

    dom.colorPicker.addEventListener('change', (e) => {
      state.color = e.target.value;
      if (dom.colorHex) dom.colorHex.textContent = state.color.toUpperCase();
    });
  }

  // Drawing Mode Selection (Color, Rainbow, Shader, Eraser)
  if (dom.modeButtons) {
    dom.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        dom.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Draw Mode Toggle (Hover Mode vs Click & Drag)
  if (dom.drawModeBtn) {
    dom.drawModeBtn.addEventListener('click', () => {
      state.hoverMode = !state.hoverMode;
      dom.drawModeBtn.setAttribute('aria-pressed', (!state.hoverMode).toString());
      
      const modeTextEl = dom.drawModeBtn.querySelector('.mode-text');
      if (state.hoverMode) {
        if (modeTextEl) modeTextEl.textContent = 'Hover Mode';
        dom.drawModeBtn.style.borderColor = 'var(--panel-border)';
        dom.drawModeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      } else {
        if (modeTextEl) modeTextEl.textContent = 'Click & Drag';
        dom.drawModeBtn.style.borderColor = 'var(--text-gold)';
        dom.drawModeBtn.style.background = 'rgba(255, 215, 0, 0.15)';
      }
    });
  }

  // Theme Toggle (Retro Silver vs Neon Midnight)
  if (dom.themeBtn && dom.screen && dom.colorPicker && dom.colorHex) {
    dom.themeBtn.addEventListener('click', () => {
      const currentTheme = dom.themeBtn.dataset.theme || 'silver';
      if (currentTheme === 'silver') {
        state.theme = 'neon';
        dom.screen.classList.add('neon-midnight');
        dom.themeBtn.dataset.theme = 'neon';

        // Automatically switch drawing color to Cyberpunk Cyan for high contrast on dark background
        if (state.color === '#1a1a1a') {
          state.color = '#00f0ff';
          dom.colorPicker.value = '#00f0ff';
          dom.colorHex.textContent = '#00F0FF';
        }
      } else {
        state.theme = 'silver';
        dom.screen.classList.remove('neon-midnight');
        dom.themeBtn.dataset.theme = 'silver';

        // Automatically restore dark color for light background
        if (state.color === '#00f0ff') {
          state.color = '#1a1a1a';
          dom.colorPicker.value = '#1a1a1a';
          dom.colorHex.textContent = '#1A1A1A';
        }
      }
    });
  }

  // Grid Resolution Slider
  if (dom.gridSlider && dom.gridSizeLabel) {
    dom.gridSlider.addEventListener('input', (e) => {
      const newSize = parseInt(e.target.value, 10);
      dom.gridSizeLabel.textContent = `${newSize} x ${newSize}`;
    });

    dom.gridSlider.addEventListener('change', (e) => {
      const newSize = parseInt(e.target.value, 10);
      createGrid(newSize);
    });
  }

  // Quick Resolution Buttons
  if (dom.sizeButtons) {
    dom.sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const newSize = parseInt(btn.dataset.size, 10);
        createGrid(newSize);
      });
    });
  }

  // Action Buttons
  if (dom.saveBtn) dom.saveBtn.addEventListener('click', saveSketch);
  if (dom.clearBtn) dom.clearBtn.addEventListener('click', clearScreen);
}
