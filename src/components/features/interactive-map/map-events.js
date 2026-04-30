export class MapEvents {
  constructor(map) {
    this.map = map;
    this.CLICK_THRESHOLD = 8;
    this._drag = { active: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0, moved: false };
    this._pinch = { active: false, dist: 0, midX: 0, midY: 0, camStartX: 0, camStartY: 0, startS: 1 };
    this.touch1 = { active: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0 };
    this.postPinchGuard = false;
  }

  bindAll() {
    const R = this.map.shadowRoot;
    const vp = R.getElementById('vp');

    this._bindPointer(vp);
    this._bindWheel(vp);
    this._bindTouch(vp);
    this._bindPinsAndProvinces(R);
    this._bindTooltip(R);
  }

  _bindPointer(vp) {
    const R = this.map.shadowRoot;
    vp.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      this._drag = {
        active:    true,
        startX:    e.clientX,
        startY:    e.clientY,
        camStartX: this.map.camera.x,
        camStartY: this.map.camera.y,
        moved:     false,
        dist:      0,
      };
      vp.classList.add('dragging');
      vp.setPointerCapture(e.pointerId);
      R.getElementById('cam').classList.add('no-transition');
    });

    vp.addEventListener('pointermove', e => {
      if (!this._drag.active) return;
      const dx = e.clientX - this._drag.startX;
      const dy = e.clientY - this._drag.startY;
      this._drag.dist = Math.sqrt(dx * dx + dy * dy);
      if (this._drag.dist > this.CLICK_THRESHOLD) this._drag.moved = true;
      this.map.camera.x = this._drag.camStartX + dx / this.map.camera.s;
      this.map.camera.y = this._drag.camStartY + dy / this.map.camera.s;
      this.map.camera.clamp();
      this.map.camera.apply(false);
    });

    vp.addEventListener('pointerup', e => {
      this._drag.active = false;
      vp.classList.remove('dragging');
      vp.releasePointerCapture(e.pointerId);
      R.getElementById('cam').classList.remove('no-transition');
      requestAnimationFrame(() => { this._drag.moved = false; });
    });
  }

  _bindWheel(vp) {
    const R = this.map.shadowRoot;
    vp.addEventListener('wheel', e => {
      e.preventDefault();
      const oldS = this.map.camera.s;
      const newS = e.deltaY > 0 ? Math.max(1, oldS * 0.88) : Math.min(6, oldS * 1.14);
      if (newS === oldS) return;

      const rect = vp.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const mapX = mouseX / oldS - this.map.camera.x;
      const mapY = mouseY / oldS - this.map.camera.y;

      this.map.camera.x = mouseX / newS - mapX;
      this.map.camera.y = mouseY / newS - mapY;
      this.map.camera.s = newS;

      this.map.camera.clamp();
      this.map.camera.apply(false);
      setTimeout(() => R.getElementById('cam').classList.remove('no-transition'), 100);
    }, { passive: false });
  }

  _getTouchDist(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _getTouchMid(t1, t2, rect) {
    return {
      x: ((t1.clientX + t2.clientX) / 2) - rect.left,
      y: ((t1.clientY + t2.clientY) / 2) - rect.top,
    };
  }

  _bindTouch(vp) {
    const R = this.map.shadowRoot;
    
    vp.addEventListener('touchstart', e => {
      if (e.touches.length === 1 && !this._pinch.active) {
        const t = e.touches[0];
        this.touch1 = {
          active:    true,
          startX:    t.clientX,
          startY:    t.clientY,
          camStartX: this.map.camera.x,
          camStartY: this.map.camera.y,
        };
        this.postPinchGuard       = false;
        this._drag.moved          = false;
        R.getElementById('cam').classList.add('no-transition');

      } else if (e.touches.length === 2) {
        this.touch1.active = false;
        this.postPinchGuard = false;

        const t1 = e.touches[0], t2 = e.touches[1];
        const rect = vp.getBoundingClientRect();
        const mid  = this._getTouchMid(t1, t2, rect);

        this._pinch = {
          active:    true,
          dist:      this._getTouchDist(t1, t2),
          midX:      mid.x,
          midY:      mid.y,
          camStartX: this.map.camera.x,
          camStartY: this.map.camera.y,
          startS:    this.map.camera.s,
        };
        this._drag.active = false;
        vp.classList.remove('dragging');
        R.getElementById('cam').classList.add('no-transition');
        e.preventDefault();
      }
    }, { passive: false });

    vp.addEventListener('touchmove', e => {
      e.preventDefault();
      if (this._pinch.active && e.touches.length >= 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const rect = vp.getBoundingClientRect();

        const newDist = this._getTouchDist(t1, t2);
        const ratio   = newDist / this._pinch.dist;
        const newS    = Math.min(6, Math.max(1, this._pinch.startS * ratio));

        const mid  = this._getTouchMid(t1, t2, rect);
        const mapX = this._pinch.midX / this._pinch.startS - this._pinch.camStartX;
        const mapY = this._pinch.midY / this._pinch.startS - this._pinch.camStartY;

        this.map.camera.x = mid.x / newS - mapX;
        this.map.camera.y = mid.y / newS - mapY;
        this.map.camera.s = newS;

        this.map.camera.clamp();
        this.map.camera.apply(false);
        return;
      }

      if (this.postPinchGuard || !this.touch1.active || e.touches.length !== 1) return;

      const t  = e.touches[0];
      const dx = t.clientX - this.touch1.startX;
      const dy = t.clientY - this.touch1.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._drag.moved = true;

      this.map.camera.x = this.touch1.camStartX + dx / this.map.camera.s;
      this.map.camera.y = this.touch1.camStartY + dy / this.map.camera.s;

      this.map.camera.clamp();
      this.map.camera.apply(false);
    }, { passive: false });

    vp.addEventListener('touchend', e => {
      if (e.touches.length < 2 && this._pinch.active) {
        this._pinch.active = false;
        this.touch1.active      = false;
        this.postPinchGuard     = true;
        R.getElementById('cam').classList.remove('no-transition');
      }
      if (e.touches.length === 0) {
        this.touch1.active = false;
        R.getElementById('cam').classList.remove('no-transition');
      }
    }, { passive: true });

    vp.addEventListener('touchcancel', () => {
      this._pinch.active = false;
      this.touch1.active      = false;
      this.postPinchGuard     = true;
      R.getElementById('cam').classList.remove('no-transition');
    }, { passive: true });
  }

  _bindPinsAndProvinces(R) {
    R.querySelectorAll('.prov').forEach(p => {
      p.addEventListener('click', () => {
        if (this._drag.moved) return;
        const id = p.dataset.p;
        R.querySelectorAll('.prov').forEach(el => {
          el.classList.toggle('active', el.dataset.p === id);
        });
        R.querySelectorAll('.pl').forEach(l => l.classList.toggle('active', l.dataset.l === id));
        this.map.dispatchEvent(new CustomEvent('region-selected', { detail: { region: id }, bubbles: true, composed: true }));
      });
    });

    R.querySelectorAll('.pin').forEach(pin => {
      let startX = 0, startY = 0;

      pin.addEventListener('pointerdown', e => {
        e.stopPropagation();
        startX = e.clientX;
        startY = e.clientY;
      });

      pin.addEventListener('pointerup', e => {
        e.stopPropagation();
        const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
        
        if (dist < 5) {
          const id = pin.dataset.id;
          const destino = this.map._destinos.find(d => d.id === id);
          if (destino) this.map.tooltip.handleMarkerClick(destino);
        }
      });

      pin.addEventListener('click', e => { e.stopPropagation(); });
    });
    
    R.getElementById('m').addEventListener('click', e => {
      if (this._drag.moved) return;
      if (!e.target.closest('.prov')) {
        R.querySelectorAll('.prov').forEach(el => el.classList.remove('active'));
        R.querySelectorAll('.pl').forEach(l => l.classList.remove('active'));
        this.map.tooltip.close();
      }
    });
  }

  _bindTooltip(R) {
    R.getElementById('tt-close').addEventListener('click', e => {
      e.stopPropagation();
      this.map.tooltip.close();
    });

    R.getElementById('tt-more-btn').addEventListener('click', e => {
      e.stopPropagation();
      const activePin = this.map.tooltip.getActivePin();
      if (activePin) {
        const destino = this.map._destinos.find(d => d.id === activePin);
        if (destino) {
          this.map.dispatchEvent(new CustomEvent('show-destination-details', { 
            detail: { destino }, 
            bubbles: true, 
            composed: true 
          }));
          this.map.tooltip.close();
        }
      }
    });

    R.getElementById('tt-backdrop').addEventListener('click', () => this.map.tooltip.close());
  }
}
