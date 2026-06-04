export class MapRenderer {
  constructor(map) {
    this.map = map;
  }

  render() {
    this.map.shadowRoot.setHTMLUnsafe(/*html*/`
      <style>${this._css()}</style>
      ${this._html()}
    `);
  }

  _html() {
    // Province path elements
    let provPaths = '';
    for (const [key, d] of Object.entries(this.map._svgPaths)) {
      if (d) provPaths += `<path class="prov" data-p="${key}" d="${d}"/>`;
    }

    // Province labels
    const labels = {
      CRG: [290, 175], CRA: [500, 150], CRH: [625, 178],
      CRSJ: [580, 295], CRC: [680, 270], CRL: [780, 280], CRP: [420, 400]
    };
    let provLabels = '';
    for (const [key, [x, y]] of Object.entries(labels)) {
      const p = this.map._provincias[key];
      if (p) provLabels += `<text class="pl" data-l="${key}" x="${x}" y="${y}">${p.nombre}</text>`;
    }

    // Pin markers
    let pins = this.map._destinos.map(d => {
      const c = this.map._provincias[d.region]?.color || '#a8d5a2';
      return /*html*/`
      <g class="pin" data-id="${d.id}" data-p="${d.region}">
        <circle class="pin-ring" cx="${d.cx}" cy="${d.cy}" r="12" stroke="${c}" style="animation-delay:${(Math.random()*2).toFixed(1)}s"/>
        <circle class="pin-dot" cx="${d.cx}" cy="${d.cy}" r="5" fill="${c}"/>
        <text class="pin-lbl" x="${d.cx}" y="${d.cy - 14}">${d.nombre}</text>
      </g>`;
    }).join('');

    return /*html*/`
      <div class="wrap">
        <div class="vp" id="vp">
          <div class="cam" id="cam">
            <svg id="m" viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg">
              <rect width="1000" height="560" fill="#0a1f14"/>
              <text class="ol" x="820" y="50">Mar Caribe</text>
              <text class="ol" x="60" y="540">Océano Pacífico</text>
              <g>${provPaths}</g>
              <g>${provLabels}</g>
              <g>${pins}</g>
            </svg>
          </div>
        </div>
        <div class="tt-backdrop" id="tt-backdrop"></div>
        <div class="tt" id="tt" role="dialog" aria-modal="true" aria-label="Destino">
          <button class="tt-close" id="tt-close" aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="tt-img-wrap">
            <img class="tt-img" id="tt-img" src="" alt="" loading="lazy"/>
            <div class="tt-img-overlay"></div>
          </div>
          <div class="tt-body">
            <p class="tt-name" id="tt-name"></p>
            <p class="tt-region" id="tt-region"></p>
            <button class="tt-more-btn" id="tt-more-btn">Ver más detalles</button>
          </div>
        </div>
      </div>
    `;
  }

  _css() {
    return /*css*/`
      :host { display: block; width: 100%; border-radius: var(--radius-xl, 16px); overflow: hidden; }
      .wrap { position: relative; width: 100%; height: min(560px, 56vw); min-height: 240px; background: #0a1f14; }
      @media (width <= 700px) { .wrap { height: min(400px, 75vw); } }
      .vp { width: 100%; height: 100%; cursor: grab; overflow: hidden; touch-action: none; user-select: none; }
      .vp.dragging { cursor: grabbing; }
      .cam { width: 100%; height: 100%; transform-origin: 0 0; transition: transform 0.4s ease; }
      .cam.no-transition { transition: none; }
      svg { width: 100%; height: 100%; display: block; }
      .prov { fill: #1e5a34; stroke: rgba(168,213,162,.2); stroke-width: 1; transition: fill .4s, stroke .4s; cursor: pointer; }
      @media (hover: hover) {
        .prov:hover { fill: #2a7a48; stroke: rgba(168,213,162,.45); }
      }
      .prov:focus  { outline: none; }
      .prov        { -webkit-tap-highlight-color: transparent; }
      .prov.active { stroke: rgba(94,196,160,.6); stroke-width: 2; filter: brightness(1.25) drop-shadow(0 0 12px rgba(94,196,160,.35)); }
      .pl { font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 600; fill: rgba(168,213,162,.35); pointer-events: none; text-anchor: middle; letter-spacing: .06em; text-transform: uppercase; transition: fill .4s; }
      .pl.active { fill: rgba(232,239,227,.85); }
      .ol { font-family: 'DM Sans', system-ui, sans-serif; font-size: 10px; font-weight: 500; fill: rgba(94,196,160,.12); letter-spacing: .25em; text-transform: uppercase; pointer-events: none; }
      .pin { cursor: pointer; -webkit-tap-highlight-color: transparent; }
      .pin-dot { stroke: #0a1f14; stroke-width: 1.5; transition: r .25s; }
      .pin-ring { fill: none; stroke-width: 1.5; opacity: 0; animation: rp 2.8s ease-in-out infinite; }
      @keyframes rp { 0%,100%{r:10;opacity:0} 40%{r:16;opacity:.35} 80%{r:22;opacity:0} }
      .pin-lbl { font-family: 'DM Sans', system-ui, sans-serif; font-size: 9.5px; font-weight: 500; fill: #e8efe3; text-anchor: middle; pointer-events: none; opacity: 0; transition: opacity .3s; paint-order: stroke; stroke: #0a1f14; stroke-width: 3px; }
      .pin:hover .pin-lbl, .pin.active .pin-lbl { opacity: 1; }
      .pin:hover .pin-dot, .pin.active .pin-dot { r: 7; }
      .pin.active .pin-ring { animation: none; opacity: .55; r: 16; }

      /* ── Backdrop ─────────────────────────────────────────── */
      .tt-backdrop {
        position: absolute; inset: 0;
        background: transparent;
        z-index: 9;
        display: none;
        pointer-events: none;
      }
      .tt-backdrop.visible { display: block; pointer-events: auto; }

      /* ── Tooltip card ─────────────────────────────────────── */
      .tt {
        position: absolute;
        z-index: 10;
        width: 200px;
        background: rgba(10, 24, 16, 0.92);
        backdrop-filter: blur(16px) saturate(1.5);
        -webkit-backdrop-filter: blur(16px) saturate(1.5);
        border: 1px solid rgba(94, 196, 160, 0.2);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,.55), 0 0 0 1px rgba(94,196,160,.08);
        opacity: 0;
        pointer-events: none;
        transform: translateY(6px) scale(0.96);
        transform-origin: bottom center;
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0, 0, 1);
      }
      .tt.visible {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      /* Close button */
      .tt-close {
        position: absolute;
        top: 8px; right: 8px;
        width: 28px; height: 28px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 14px;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        transition: transform 0.2s ease;
        z-index: 2;
        padding: 0;
      }
      .tt-close:hover { 
        transform: scale(1.1);
      }

      /* Image */
      .tt-img-wrap {
        position: relative;
        width: 100%; height: 110px;
        overflow: hidden;
        background: #0a1f14;
      }
      .tt-img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
        transition: transform .4s ease;
      }
      .tt:hover .tt-img { transform: scale(1.04); }
      .tt-img-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, transparent 50%, rgba(10,24,16,.8) 100%);
      }

      /* Body */
      .tt-body {
        padding: 8px 10px 10px;
      }
      .tt-name {
        margin: 0;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: #e8efe3;
        letter-spacing: .02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tt-region {
        margin: 3px 0 0;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 10px;
        font-weight: 500;
        color: rgba(94,196,160,.7);
        letter-spacing: .07em;
        text-transform: uppercase;
      }

      /* Tail / arrow pointing down to the marker */
      .tt::after {
        content: '';
        position: absolute;
        bottom: -7px;
        left: 50%;
        transform: translateX(-50%);
        width: 0; height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 7px solid rgba(94,196,160,.25);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,.4));
        pointer-events: none;
      }

      /* Ver mas btn */
      .tt-more-btn {
        margin-top: 8px;
        width: 100%;
        background: rgba(94,196,160,.1);
        color: var(--color-primary, #4de082);
        border: 1px solid rgba(94,196,160,.3);
        border-radius: 6px;
        padding: 6px;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
        text-transform: uppercase;
        letter-spacing: .05em;
      }
      .tt-more-btn:hover {
        background: rgba(94,196,160,.2);
      }
    `;
  }
}
