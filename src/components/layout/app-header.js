import { html } from '../../utils/template-helpers.js';

export class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.setHTMLUnsafe(html`
      <style>
        /* Importamos las variables globales */
        @import url('./src/styles/global.css');
        
        :host {
          display: block;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 50;
        }

        .glass-nav {
          padding: 1rem 0;
          /* Glass neutro (negro frío) en vez del verde anterior: aire premium.
             El saturate() enriquece el frosted glass. Sin borde ni glow:
             el header se funde limpio con el contenido (look seamless). */
          background-color: rgba(7, 9, 14, 0.78);
          backdrop-filter: blur(16px) saturate(120%);
          -webkit-backdrop-filter: blur(16px) saturate(120%);
        }

        .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          font-family: var(--font-headline);
          font-style: italic;
          font-size: 1.5rem;
          color: #fff;
        }

        /* Oculto por defecto en móviles (Mobile First) */
        .nav-links {
          display: none;
        }

        .nav-links a {
          text-decoration: none;
          margin-left: 2rem;
          transition: color 0.3s ease;
        }

        .link-active {
          color: var(--color-primary);
          font-weight: 700;
          border-bottom: 2px solid var(--color-primary);
        }

        .link-inactive {
          color: rgba(221, 228, 222, 0.8);
        }
        
        .link-inactive:hover {
          color: #fff;
        }

        /* Usamos Media Queries en lugar de JS para hacerlo responsivo */
        @media (width >= 768px) {
          .nav-links {
            display: flex;
            align-items: center;
          }
        }
      </style>

      <nav class="glass-nav">
        <div class="container">
          <div class="brand">Verdant</div>
          
          <div class="nav-links">
            <a href="#" class="link-active">Inicio</a>
            <a href="#explorar" class="link-inactive">Experiencias</a>
            <a href="#explorar" class="link-inactive">Destinos</a>
          </div>

          <!-- Usamos la clase global o, si ya tienes un base-button, podrías usarlo aquí -->
          <a href="#explorar" class="btn-primary">Planea tu viaje</a>
        </div>
      </nav>
    `);
  }
}

if (!customElements.get('app-header')) {
  customElements.define('app-header', AppHeader);
}
