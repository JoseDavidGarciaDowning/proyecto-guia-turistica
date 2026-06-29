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
      CRG:  { nombre: 'Guanacaste', color: '#D4841A', cx: 350, cy: 210, zoom: 2.5 },
      CRA:  { nombre: 'Alajuela',   color: '#2E86DE', cx: 490, cy: 155, zoom: 3.0 },
      CRH:  { nombre: 'Heredia',    color: '#8E44AD', cx: 615, cy: 185, zoom: 4.5 },
      CRSJ: { nombre: 'San José',   color: '#27AE60', cx: 580, cy: 285, zoom: 3.5 },
      CRC:  { nombre: 'Cartago',    color: '#E85D4A', cx: 668, cy: 280, zoom: 4.0 },
      CRL:  { nombre: 'Limón',      color: '#1ABC9C', cx: 745, cy: 290, zoom: 2.2 },
      CRP:  { nombre: 'Puntarenas', color: '#E67E22', cx: 580, cy: 430, zoom: 1.4 },
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
