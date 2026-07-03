/**
 * DOM Elements Cache & Initialization
 * Centralizes DOM references to avoid repeated queries and long parameter chains across modules.
 */

export const dom = {
  screen: null,
  etchCasing: null,
  gridSizeLabel: null,
  gridSlider: null,
  colorPicker: null,
  colorHex: null,
  drawModeBtn: null,
  themeBtn: null,
  saveBtn: null,
  clearBtn: null,
  knobLeft: null,
  knobRight: null,
  sizeButtons: null,
  modeButtons: null,
  yearSpan: null
};

/**
 * Query and populate all essential DOM elements once the document is ready
 */
export function initDom() {
  dom.screen = document.getElementById('screen');
  dom.etchCasing = document.getElementById('etchCasing');
  dom.gridSizeLabel = document.getElementById('gridSizeLabel');
  dom.gridSlider = document.getElementById('gridSlider');
  dom.colorPicker = document.getElementById('colorPicker');
  dom.colorHex = document.getElementById('colorHex');
  dom.drawModeBtn = document.getElementById('drawModeBtn');
  dom.themeBtn = document.getElementById('themeBtn');
  dom.saveBtn = document.getElementById('saveBtn');
  dom.clearBtn = document.getElementById('clearBtn');
  dom.knobLeft = document.getElementById('knobLeft');
  dom.knobRight = document.getElementById('knobRight');
  dom.sizeButtons = document.querySelectorAll('.size-btn');
  dom.modeButtons = document.querySelectorAll('.mode-btn');
  dom.yearSpan = document.getElementById('year');
}
