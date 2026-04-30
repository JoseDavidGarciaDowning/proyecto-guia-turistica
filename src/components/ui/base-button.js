import { html } from '../../utils/template-helpers.js';

export class BaseButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['variant', 'href'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const href = this.getAttribute('href');
    const className = `btn variant-${variant}`;

    // Si tiene href, renderizamos un link; si no, un botón.
    if (href) {
      this.shadowRoot.innerHTML = html`
        <style>@import url('./src/styles/components/shared.css');</style>
        <style>@import url('./src/styles/components/button.css');</style>
        <a href="${href}" class="${className}" part="button">
          <slot></slot>
        </a>
      `;
    } else {
      this.shadowRoot.innerHTML = html`
        <style>@import url('./src/styles/components/shared.css');</style>
        <style>@import url('./src/styles/components/button.css');</style>
        <button class="${className}" part="button">
          <slot></slot>
        </button>
      `;
    }
  }
}

if (!customElements.get('base-button')) {
  customElements.define('base-button', BaseButton);
}
