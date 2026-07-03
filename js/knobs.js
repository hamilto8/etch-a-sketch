/**
 * Interactive Knobs & Keyboard Rotational Controls
 * Encapsulates multi-touch tablet knob rotation physics, ARIA state updates, and keyboard navigation.
 */

import { state } from './state.js';
import { dom } from './dom.js';
import { updateStylus, applyColor, getTileAt } from './grid.js';

/**
 * Update accessibility ARIA attributes on knobs
 */
export function updateKnobAria(knobEl, angle) {
  if (!knobEl) return;
  const normalized = ((Math.round(angle) % 360) + 360) % 360;
  knobEl.setAttribute('aria-valuenow', normalized.toString());
}

/**
 * Rotate knobs slightly on draw actions to simulate physical mechanism
 */
export function rotateKnob(axis, direction = 1) {
  const delta = direction * 15;
  if (axis === 'x') {
    state.knobAngleX += delta;
    if (dom.knobLeft) {
      dom.knobLeft.style.transform = `rotate(${state.knobAngleX}deg)`;
      updateKnobAria(dom.knobLeft, state.knobAngleX);
    }
  } else {
    state.knobAngleY += delta;
    if (dom.knobRight) {
      dom.knobRight.style.transform = `rotate(${state.knobAngleY}deg)`;
      updateKnobAria(dom.knobRight, state.knobAngleY);
    }
  }
}

/**
 * Interactive Knobs (Drag / Rotate to Draw) - Tablet Multi-Touch Optimized
 */
export function setupInteractiveKnob(knobEl, axis) {
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

/**
 * Keyboard Controls (Arrow keys & WASD to draw)
 */
export function setupKeyboardControls() {
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
}
