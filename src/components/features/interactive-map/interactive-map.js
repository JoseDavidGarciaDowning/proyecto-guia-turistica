import { MapCamera } from './map-camera.js';
import { MapRenderer } from './map-renderer.js';
import { MapEvents } from './map-events.js';
import { MapTooltip } from './map-tooltip.js';

export default class InteractiveMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Shared Data State
    this._destinos = [];
    this._svgPaths = {};
    this._provincias = {
      CRG:  { nombre: 'Guanacaste', color: '#D4841A', cx: 300, cy: 180, zoom: 2.8 },
      CRA:  { nombre: 'Alajuela',   color: '#2E86DE', cx: 500, cy: 160, zoom: 3.0 },
      CRH:  { nombre: 'Heredia',    color: '#8E44AD', cx: 620, cy: 185, zoom: 4.5 },
      CRSJ: { nombre: 'San José',   color: '#27AE60', cx: 590, cy: 310, zoom: 3.5 },
      CRC:  { nombre: 'Cartago',    color: '#E85D4A', cx: 680, cy: 280, zoom: 4.0 },
      CRL:  { nombre: 'Limón',      color: '#1ABC9C', cx: 780, cy: 280, zoom: 2.2 },
      CRP:  { nombre: 'Puntarenas', color: '#E67E22', cx: 420, cy: 400, zoom: 1.6 },
    };

    // Initialize sub-components via Composition pattern
    this.camera = new MapCamera(this);
    this.renderer = new MapRenderer(this);
    this.events = new MapEvents(this);
    this.tooltip = new MapTooltip(this);
  }

  async connectedCallback() {
    try {
      // Fetch SVG paths and destinations data in parallel
      const [paths, destinos] = await Promise.all([
        fetch('./src/data/map-paths.json').then(r => r.json()),
        fetch('./src/data/destinos.json').then(r => r.json()),
      ]);
      
      this._svgPaths = paths;
      this._destinos = destinos;

      // Orchestrate the rendering and event binding
      this.renderer.render();
      this.events.bindAll();
      
    } catch (err) {
      console.error("Error loading map data:", err);
    }
  }
}

// Register the custom element
if (!customElements.get('interactive-map')) {
  customElements.define('interactive-map', InteractiveMap);
}
