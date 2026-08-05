import * as THREE from "three";

// Procedurally generates an equirectangular Earth-like texture on a canvas so
// the app doesn't depend on a missing external image asset. Oceans are deep
// blue; landmasses are drawn as soft green/brown blobs; a faint night-side
// city-light emissive feel comes from the emissive map usage in the scenes.
let cached: THREE.CanvasTexture | null = null;

export function getEarthTexture(): THREE.CanvasTexture {
  if (cached) return cached;

  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Ocean base — vertical gradient deep blue
  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, "#0a1f3d");
  ocean.addColorStop(0.5, "#0d2a52");
  ocean.addColorStop(1, "#0a1f3d");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  // Pseudo-random seeded helper
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Draw ~40 landmass blobs across the map to approximate continents
  const landColors = ["#1f5a3d", "#2d6b4a", "#3a7a55", "#4a8a4a", "#5a7a3a"];
  for (let i = 0; i < 40; i++) {
    const cx = rand() * w;
    const cy = h * 0.2 + rand() * h * 0.6;
    const rx = 30 + rand() * 120;
    const ry = 20 + rand() * 70;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = landColors[Math.floor(rand() * landColors.length)];
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    // Sub-blobs for irregular coastlines
    for (let j = 0; j < 5; j++) {
      ctx.beginPath();
      ctx.ellipse(
        cx + (rand() - 0.5) * rx * 1.5,
        cy + (rand() - 0.5) * ry * 1.5,
        rx * (0.3 + rand() * 0.4),
        ry * (0.3 + rand() * 0.4),
        rand() * Math.PI,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // Ice caps — white near poles
  const polar = ctx.createLinearGradient(0, 0, 0, h);
  polar.addColorStop(0, "rgba(255,255,255,0.85)");
  polar.addColorStop(0.12, "rgba(255,255,255,0)");
  polar.addColorStop(0.88, "rgba(255,255,255,0)");
  polar.addColorStop(1, "rgba(255,255,255,0.85)");
  ctx.fillStyle = polar;
  ctx.fillRect(0, 0, w, h);

  // Faint city-light speckles on land (warm dots)
  for (let i = 0; i < 600; i++) {
    const x = rand() * w;
    const y = h * 0.2 + rand() * h * 0.6;
    ctx.fillStyle = `rgba(255,220,140,${0.15 + rand() * 0.25})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cached = tex;
  return tex;
}
