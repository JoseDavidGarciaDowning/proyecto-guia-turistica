import { html } from '../../utils/template-helpers.js';

export class BaseButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.cssReady = this.#loadStyles();
  }

  async #loadStyles() {
    const [sharedCSS, buttonCSS] = await Promise.all([
      fetch(new URL('../../styles/components/shared.css', import.meta.url)).then(r => r.text()),
      fetch(new URL('../../styles/components/button.css', import.meta.url)).then(r => r.text()),
    ]);
    const sheet = new CSSStyleSheet();
    await sheet.replace(sharedCSS + '\n' + buttonCSS);
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  static get observedAttributes() {
    return ['variant', 'href'];
  }

  async connectedCallback() {
    await this.cssReady;
    this.render();
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      await this.cssReady;
      this.render();
    }
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const href = this.getAttribute('href');
    const className = `btn variant-${variant}`;

    // Si tiene href, renderizamos un link; si no, un botón.
    if (href) {
      this.shadowRoot.setHTMLUnsafe(html`
        <a href="${href}" class="${className}" part="button">
          <slot></slot>
        </a>
      `);
    } else {
      this.shadowRoot.setHTMLUnsafe(html`
        <button class="${className}" part="button">
          <slot></slot>
        </button>
      `);
    }
  }
}

if (!customElements.get('base-button')) {
  customElements.define('base-button', BaseButton);
}
