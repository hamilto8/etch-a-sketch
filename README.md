# Etch a Sketch | Modern Pro Edition

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A premium, interactive, and high-performance web-based recreation of the classic mechanical drawing toy. Built from the ground up utilizing semantic HTML5, modern CSS3 (Custom Properties, Flexbox, Grid, Glassmorphism, Keyframes), and vanilla ES6+ JavaScript.

![Etch a Sketch Pro Screenshot](./images/etch.png) *(Note: Replace with your screenshot if desired)*

## 🌟 Features

* **Classic & Modern Casing Aesthetic:** A beautiful crimson/ruby Red casing complete with glossy highlights, gold brand lettering, and interactive rotating control knobs.
* **4 Drawing Modes:**
  * 🎨 **Color:** Draw with a custom solid color selected via a native high-precision color picker.
  * 🌈 **Rainbow:** Draw with cycling random HSL colors for vibrant, colorful sketches.
  * ✏️ **Shader:** A progressive graphite pencil shading mode where each pass darkens the tile by 10% (from 10% to 100% opacity).
  * 🧹 **Eraser:** Selectively wipe out lines, returning tiles back to the default canvas background.
* **Dynamic Grid Size Resolution:** Select between standard resolutions (`8x8`, `16x16`, `32x32`, `64x64`) or use the slider for a custom grid resolution anywhere between `4x4` and `64x64`.
* **Flexible Input Methods (Hover vs Drag):**
  * Toggle between classic **Hover Mode** (draws instantly as you move your pointer across the canvas) or **Click & Drag** (draws only when the pointer is pressed down).
* **High Performance Engine:** Utilizes JavaScript **Event Delegation** (one event handler on the parent grid instead of thousands on individual tiles) and **DocumentFragments** for instant grid regeneration.
* **Mobile & Touch Friendly:** Leverages CSS `touch-action: none` and modern **Pointer Events** for smooth drawing on touch screens.
* **Shake to Erase:** Click the **Shake & Clear** button to watch the entire Etch a Sketch shake with physics-based CSS keyframes as it wipes the canvas clean.

## 🚀 Getting Started

Since this is a client-side vanilla web application, there are no compilers, dependencies, or local build processes required. 

### Prerequisites

You only need a modern web browser (Chrome, Firefox, Safari, Edge).

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/hamilto8/etch-a-sketch.git
   ```
2. Navigate into the project directory:
   ```bash
   cd etch-a-sketch
   ```
3. Open `index.html` in your favorite web browser:
   * **macOS:** `open index.html`
   * **Windows:** `start index.html`
   * **Linux:** `xdg-open index.html`
   
Alternatively, you can run a local server (e.g., Live Server extension in VS Code, or using Python: `python3 -m http.server 8000`).

## 📁 Repository Structure

```text
etch-a-sketch/
├── images/
│   ├── etch.ico         # Favicon icon
│   └── etch.png         # Logo asset
├── index.html           # Semantic HTML5 layout and control structure
├── index.css            # Responsive CSS3 styles, layout systems, & animations
├── index.js             # High-performance event handlers & state management
└── README.md            # Project documentation (this file)
```

## 🛠️ Built With

* **Markup:** Semantic [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML) with descriptive ARIA structures.
* **Styling:** Custom CSS3 utilizing Flexbox, CSS Grid, custom HSL variables, and keyframe animations.
* **Interactivity:** Vanilla [JavaScript (ES6+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) utilizing event delegation and Pointer APIs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

* **Michael Hamilton** - [hamilto8](https://github.com/hamilto8)
