import { html } from '../../utils/template-helpers.js';
import '../ui/base-button.js';

export class HeroSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.cssReady = this.#loadStyles();
  }

  async #loadStyles() {
    const [sharedCSS, heroCSS] = await Promise.all([
      fetch(new URL('../../styles/components/shared.css', import.meta.url)).then(r => r.text()),
      fetch(new URL('../../styles/components/hero.css', import.meta.url)).then(r => r.text()),
    ]);
    const sheet = new CSSStyleSheet();
    await sheet.replace(sharedCSS + '\n' + heroCSS);
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  async connectedCallback() {
    await this.cssReady;
    this.render();
  }

  render() {
    this.shadowRoot.setHTMLUnsafe(/*html*/ `
      <div class="hero">
        <div class="asymmetric-grid" aria-hidden="true">
          <div class="grid-item item-1">
            <img src="assets/img/central/volcan-poas.jpg" alt="Volcán Poás, Costa Rica" width="800" height="600" decoding="async" fetchpriority="high">
          </div>
          <div class="grid-item item-2">
            <img src="assets/img/guanacaste/tamarindo-atardecer.jpg" alt="Atardecer en Tamarindo, Guanacaste" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-3">
            <img src="assets/img/caribe/cahuita-playa-blanca.jpg" alt="Playa Blanca en Cahuita, Caribe Sur" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-4">
            <img src="assets/img/pacifico-sur/manuel-antonio-vista-aerea.jpg" alt="Vista aérea de Manuel Antonio" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-5">
            <img src="assets/img/guanacaste/rincon-vieja.jpg" alt="Volcán Rincón de la Vieja, Guanacaste" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-6">
            <img src="assets/img/caribe/tortuguero-canales.jpg" alt="Canales de Tortuguero, Caribe Norte" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-7">
            <img src="assets/img/pacifico-sur/bahia-drake-isla-cano.jpg" alt="Bahía Drake e Isla del Caño, Pacífico Sur" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-8">
            <img src="assets/img/central/irazu-panoramica.jpg" alt="Vista panorámica del Volcán Irazú" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-9">
            <img src="assets/img/pacifico-sur/uvita-cola-ballena.jpg" alt="Cola de ballena en Uvita, Pacífico Sur" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-10">
            <img src="assets/img/guanacaste/conchal-panoramica.jpg" alt="Playa Conchal, Guanacaste" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-11">
            <img src="assets/img/caribe/puerto-viejo.jpg" alt="Puerto Viejo, Caribe Sur" width="800" height="600" decoding="async">
          </div>
          <div class="grid-item item-12">
            <img src="assets/img/pacifico-sur/corcovado-selva.jpg" alt="Selva de Corcovado, Pacífico Sur" width="800" height="600" decoding="async">
          </div>
        </div>
        
        <div class="overlay"></div>
        
        <div class="content">
          <h1>
            Donde la Naturaleza <br/>
            <span class="text-primary">Despierta el Asombro</span>
          </h1>
          <p>
            Descubrí maravillas escondidas con tours ecológicos Pura Vida: aventura, vida silvestre, relajación y lujo sostenible.
          </p>
          <div class="btn-group">
            <base-button variant="primary" href="#explorar">Inspirate</base-button>
            <base-button variant="secondary" href="#explorar">Empezá a Planear</base-button>
          </div>
        </div>
      </div>
    `);
  }
}

if (!customElements.get('hero-section')) {
  customElements.define('hero-section', HeroSection);
}
