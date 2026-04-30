export class MapCamera {
  constructor(map) {
    this.map = map;
    this.x = 0;
    this.y = 0;
    this.s = 1;
  }

  clamp() {
    const vp = this.map.shadowRoot.getElementById('vp');
    const cam = this.map.shadowRoot.getElementById('cam');
    if (!vp || !cam) return;

    const cW = vp.clientWidth;
    const cH = vp.clientHeight;
    const s  = this.s;

    // The SVG is styled width:100% height:100% inside .cam, so at scale=1
    // it fills the container exactly. Actual rendered map size = container * scale.
    const scaledW = cW * s;
    const scaledH = cH * s;

    // --- Horizontal axis ---
    if (scaledW <= cW) {
      // Map fits (or equals) container width — center and lock
      this.x = (cW - scaledW) / (2 * s);
    } else {
      // Map is wider than container: clamp so neither edge goes out of view
      const minX = (cW - scaledW) / s;
      const maxX = 0;
      this.x = Math.min(maxX, Math.max(minX, this.x));
    }

    // --- Vertical axis ---
    if (scaledH <= cH) {
      // Map fits (or equals) container height — center and lock
      this.y = (cH - scaledH) / (2 * s);
    } else {
      const minY = (cH - scaledH) / s;
      const maxY = 0;
      this.y = Math.min(maxY, Math.max(minY, this.y));
    }
  }

  apply(animate = true) {
    const cam = this.map.shadowRoot.getElementById('cam');
    if (!cam) return;
    
    if (!animate) cam.classList.add('no-transition');
    else cam.classList.remove('no-transition');
    
    // transform order: translate first (in unscaled space), then scale from origin
    cam.style.transform = `scale(${this.s}) translate(${this.x}px, ${this.y}px)`;
  }
}
