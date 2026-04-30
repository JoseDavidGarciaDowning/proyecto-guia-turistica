const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'antigravity/resources/mapa-interactivo-cr (1).html');
const destFile = path.join(__dirname, 'components/interactive-map.js');

let content = fs.readFileSync(srcFile, 'utf8');
let match = content.match(/<script>([\s\S]*?)<\/script>/);

if (match) {
    let js = match[1].trim();

    // 1. Remove the static `get destinos(){ ... }`
    js = js.replace(/get destinos\(\)\{return\[[\s\S]*?\]\}/, `
  get destinos() { return this._destinos; }
`);

    // 2. Make `connectedCallback` fetch data before doing anything
    js = js.replace('connectedCallback(){ this.shadowRoot.innerHTML = `<style>${this._css()}</style>${this._html()}`; this._bindAll(); }', `
  async connectedCallback() {
    this._destinos = [];
    try {
      const res = await fetch('./data/destinos.json');
      this._destinos = await res.json();
    } catch(e) { console.error('Error loading destinos', e); }
    this.shadowRoot.innerHTML = \`<style>\${this._css()}</style>\${this._html()}\`;
    this._bindAll();
  }
`);

    // 3. Bound the drag area in VP `pointermove`
    // Look for:
    // this._cam.x = this._drag.camStartX + dx / this._cam.s;
    // this._cam.y = this._drag.camStartY + dy / this._cam.s;
    js = js.replace(
      /this\._cam\.x = this\._drag\.camStartX \+ dx \/ this\._cam\.s;\s*this\._cam\.y = this\._drag\.camStartY \+ dy \/ this\._cam\.s;/,
      `
      let newX = this._drag.camStartX + dx / this._cam.s;
      let newY = this._drag.camStartY + dy / this._cam.s;
      
      // Keep map in view (clamping bounds)
      const vpW = this.shadowRoot.getElementById('vp').clientWidth;
      const vpH = this.shadowRoot.getElementById('vp').clientHeight;
      const mapW = 1000 * this._cam.s;
      const mapH = 560 * this._cam.s;
      
      // Calculate max and min translations loosely
      const minX = -1000 + (vpW / this._cam.s);
      const maxX = 1000;
      const minY = -560 + (vpH / this._cam.s);
      const maxY = 560;

      this._cam.x = Math.max(minX, Math.min(maxX, newX));
      this._cam.y = Math.max(minY, Math.min(maxY, newY));
      `
    );

    fs.writeFileSync(destFile, js, 'utf8');
    console.log('Successfully wrote interactive-map.js');
} else {
    console.log('Script tag not found.');
}
