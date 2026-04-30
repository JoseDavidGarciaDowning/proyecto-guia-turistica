export class MapTooltip {
  constructor(map) {
    this.map = map;
    this._activePin = null;
    this._ttTimer = null;
    this._ttTransitionHandler = null;
  }

  close() {
    const R = this.map.shadowRoot;
    const tt = R.getElementById('tt');
    const bd = R.getElementById('tt-backdrop');
    if (tt) tt.classList.remove('visible');
    if (bd) bd.classList.remove('visible');
    
    if (this._activePin) {
      R.querySelector(`.pin[data-id="${this._activePin}"]`)?.classList.remove('active');
      this._activePin = null;
    }
  }

  handleMarkerClick(destino) {
    try { this.focusMarker(destino); } catch(err) { console.error(err); }
  }

  focusMarker(destino) {
    const R   = this.map.shadowRoot;
    const vp  = R.getElementById('vp');
    const cam = R.getElementById('cam');

    const vpW = vp.clientWidth;
    const vpH = vp.clientHeight;
    const s   = this.map.camera.s;

    // Convert SVG viewBox coords → unscaled cam-space pixels
    const pinCamX = destino.cx / 1000 * vpW;
    const pinCamY = destino.cy / 560  * vpH;

    // 1. Pan to center the marker
    const targetX = vpW * 0.5 / s - pinCamX;
    const targetY = vpH * 0.55 / s - pinCamY;

    const prevX = this.map.camera.x;
    const prevY = this.map.camera.y;

    this.map.camera.x = targetX;
    this.map.camera.y = targetY;
    this.map.camera.clamp();

    const camMoved = Math.abs(this.map.camera.x - prevX) > 0.5 ||
                     Math.abs(this.map.camera.y - prevY) > 0.5;

    this.map.camera.apply(true);   // always animate

    // 2. Mark active pin
    R.querySelectorAll('.pin').forEach(el => el.classList.remove('active'));
    R.querySelector(`.pin[data-id="${destino.id}"]`)?.classList.add('active');
    this._activePin = destino.id;

    // 3. Hide current tooltip immediately
    R.getElementById('tt').classList.remove('visible');

    // 4. Show tooltip
    if (this._ttTimer) { clearTimeout(this._ttTimer); this._ttTimer = null; }
    if (this._ttTransitionHandler) {
      cam.removeEventListener('transitionend', this._ttTransitionHandler);
      this._ttTransitionHandler = null;
    }

    R.getElementById('tt-img').src  = destino.imagen_portada || '';
    R.getElementById('tt-img').alt  = destino.nombre;
    R.getElementById('tt-name').textContent   = destino.nombre;
    R.getElementById('tt-region').textContent =
      this.map._provincias[destino.region]?.nombre || destino.region;

    const showTooltip = () => this.show(destino, pinCamX, pinCamY);

    if (camMoved) {
      this._ttTransitionHandler = (ev) => {
        if (ev.propertyName !== 'transform') return;
        cam.removeEventListener('transitionend', this._ttTransitionHandler);
        this._ttTransitionHandler = null;
        if (this._ttTimer) { clearTimeout(this._ttTimer); this._ttTimer = null; }
        showTooltip();
      };
      cam.addEventListener('transitionend', this._ttTransitionHandler);
      this._ttTimer = setTimeout(() => {
        if (this._ttTransitionHandler) {
          cam.removeEventListener('transitionend', this._ttTransitionHandler);
          this._ttTransitionHandler = null;
        }
        showTooltip();
      }, 450);
    } else {
      showTooltip();
    }
  }

  show(destino, pinCamX, pinCamY) {
    const R  = this.map.shadowRoot;
    const vp = R.getElementById('vp');
    const tt = R.getElementById('tt');
    
    const vpW = vp.clientWidth;
    const vpH = vp.clientHeight;
    const s   = this.map.camera.s;

    const ttW = tt.offsetWidth  || 200;
    const ttH = tt.offsetHeight || 155;
    const GAP = 16;

    const pinSX = s * (this.map.camera.x + pinCamX);
    const pinSY = s * (this.map.camera.y + pinCamY);

    let left = pinSX - ttW / 2;
    let top  = pinSY - ttH - GAP;

    const MARGIN = 8;
    left = Math.max(MARGIN, Math.min(vpW - ttW - MARGIN, left));

    if (top < MARGIN) top = pinSY + GAP + 14;
    top = Math.min(vpH - ttH - MARGIN, top);

    tt.style.left = `${left}px`;
    tt.style.top  = `${top}px`;

    tt.classList.add('visible');
    R.getElementById('tt-backdrop').classList.add('visible');
  }

  getActivePin() {
    return this._activePin;
  }
}
