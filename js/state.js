/**
 * Reactive Application State
 * Central repository for drawing modes, active colors, themes, grid dimensions, and cursor tracking.
 */

export const state = {
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
