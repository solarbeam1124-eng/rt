// Level definitions: spike maps, visual themes, audio, and FX
export const LEVELS = [
  {
    id: 1,
    name: "Level 1",
    audio: "level1.mp3",
    speed: 3.6,
    gravity: 0.6,
    jumpVel: -10.5,
    floorY: 420,
    // spike rects: {x, w, h}
    spikes: [
      { x: 500, w: 40, h: 60 },
      { x: 740, w: 40, h: 70 },
      { x: 980, w: 40, h: 80 },
      { x: 1300, w: 40, h: 60 },
      { x: 1600, w: 40, h: 90 },
      { x: 1900, w: 40, h: 70 }
    ],
    length: 2600,
    theme: {
      sky: ["#0a0c14", "#101630"],
      ground: "#18203a",
      accent: "#4db1ff",
      parallaxLayers: [
        { speed: 0.2, color: "#0f1325", height: 140 },
        { speed: 0.4, color: "#121a33", height: 100 }
      ],
      fx: { particles: true, glow: true }
    }
  },
  {
    id: 2,
    name: "Level 2",
    audio: "level2.mp3",
    speed: 3.9,
    gravity: 0.65,
    jumpVel: -11.0,
    floorY: 420,
    spikes: [
      { x: 450, w: 40, h: 80 },
      { x: 700, w: 40, h: 90 },
      { x: 860, w: 40, h: 70 },
      { x: 1100, w: 40, h: 90 },
      { x: 1380, w: 40, h: 100 },
      { x: 1660, w: 40, h: 80 },
      { x: 1940, w: 40, h: 110 }
    ],
    length: 2800,
    theme: {
      sky: ["#0a0c14", "#0e1430"],
      ground: "#202a48",
      accent: "#7ef5ff",
      parallaxLayers: [
        { speed: 0.25, color: "#111836", height: 140 },
        { speed: 0.5, color: "#162044", height: 100 }
      ],
      fx: { particles: true, glow: true, chroma: true }
    }
  },
  {
    id: 3,
    name: "Level 3",
    audio: "level3.mp3",
    speed: 4.2,
    gravity: 0.68,
    jumpVel: -11.2,
    floorY: 420,
    spikes: [
      { x: 520, w: 40, h: 90 },
      { x: 760, w: 40, h: 100 },
      { x: 1000, w: 40, h: 120 },
      { x: 1260, w: 40, h: 90 },
      { x: 1540, w: 40, h: 120 },
      { x: 1820, w: 40, h: 100 },
      { x: 2100, w: 40, h: 130 }
    ],
    length: 3200,
    theme: {
      sky: ["#0a0c14", "#0c143a"],
      ground: "#233057",
      accent: "#6ec8ff",
      parallaxLayers: [
        { speed: 0.3, color: "#141c42", height: 140 },
        { speed: 0.6, color: "#1a2552", height: 100 }
      ],
      fx: { particles: true, glow: true, chroma: true, scanlines: true }
    }
  },
  {
    id: 4,
    name: "Level 4",
    audio: "level4.mp3",
    speed: 4.5,
    gravity: 0.7,
    jumpVel: -11.8,
    floorY: 420,
    spikes: [
      { x: 480, w: 40, h: 120 },
      { x: 740, w: 40, h: 140 },
      { x: 1020, w: 40, h: 120 },
      { x: 1320, w: 40, h: 150 },
      { x: 1660, w: 40, h: 130 },
      { x: 1980, w: 40, h: 160 },
      { x: 2320, w: 40, h: 150 }
    ],
    length: 3600,
    theme: {
      sky: ["#0a0c14", "#0c1442"],
      ground: "#283665",
      accent: "#8cd5ff",
      parallaxLayers: [
        { speed: 0.35, color: "#172353", height: 150 },
        { speed: 0.7, color: "#1d2b66", height: 100 }
      ],
      fx: { particles: true, glow: true, chroma: true, scanlines: true, bloom: true }
    }
  },
  {
    id: 5,
    name: "Level 5",
    audio: "level5.mp3",
    speed: 4.8,
    gravity: 0.72,
    jumpVel: -12.2,
    floorY: 420,
    spikes: [
      { x: 520, w: 40, h: 160 },
      { x: 820, w: 40, h: 180 },
      { x: 1120, w: 40, h: 160 },
      { x: 1420, w: 40, h: 200 },
      { x: 1780, w: 40, h: 160 },
      { x: 2140, w: 40, h: 210 },
      { x: 2520, w: 40, h: 220 },
      { x: 2920, w: 40, h: 200 }
    ],
    length: 4200,
    theme: {
      sky: ["#0a0c14", "#0d1450"],
      ground: "#2c3b72",
      accent: "#a2e7ff",
      parallaxLayers: [
        { speed: 0.4, color: "#192863", height: 160 },
        { speed: 0.8, color: "#203079", height: 120 }
      ],
      fx: { particles: true, glow: true, chroma: true, scanlines: true, bloom: true, heat: true }
    }
  }
];
