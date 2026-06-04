# CLAUDE.md — Proyecto Guía Turística

Este archivo define los estándares del proyecto. Se aplican siempre: al generar, modificar o revisar código.
Si una instrucción del usuario entra en conflicto con estas reglas, preguntale antes de proceder.

---

## Reglas duras — Web Components

| # | Regla | ❌ Prohibido | ✅ Obligatorio |
|---|---|---|---|
| 1 | HTML injection | `innerHTML`, `outerHTML`, `insertAdjacentHTML` | `setHTMLUnsafe()` |
| 2 | CSS en Shadow DOM | `<style>` inline concatenado | `adoptedStyleSheets` + `import "./X.css" with { type: "css" }` |
| 3 | Encapsulación | Componente sin Shadow DOM | `attachShadow({ mode: "open" })` en `constructor` |
| 4 | Naming | `<mycomponent>`, `<MyComponent>` | kebab-case con guión: `<my-component>` |
| 5 | Clases | `var`, prototipos, `function MyComp()` | `class extends HTMLElement` con campos `#privados` |
| 6 | Reactividad | Watchers manuales, `setInterval` para props | `observedAttributes` + `attributeChangedCallback` |
| 7 | Theming externo | Selectores que penetren Shadow DOM | Custom Properties (`--var`) + `::part()` |
| 8 | CustomEvents cross-component | `bubbles: false` por defecto | `{ bubbles: true, composed: true }` |
| 9 | Template literals | Strings sin marcar | Prefijo `/* html */` o `/* css */` |

---

## Plantilla canónica

Toda generación de un componente nuevo debe partir de aquí.

### `MyComponent.js`
```js
import styles from "./MyComponent.css" with { type: "css" };

const DEFAULTS = { label: "Default label" };

class MyComponent extends HTMLElement {
  static get observedAttributes() { return ["label", "disabled"]; }

  #label = DEFAULTS.label;
  #disabled = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }

  connectedCallback() {
    this.#label = this.getAttribute("label") ?? DEFAULTS.label;
    this.#disabled = this.hasAttribute("disabled");
    this.#render();
  }

  disconnectedCallback() {
    // Cancelar listeners, intervals, AbortControllers
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "label") this.#label = newValue ?? DEFAULTS.label;
    if (name === "disabled") this.#disabled = newValue !== null;
    this.#render();
  }

  get label() { return this.#label; }
  set label(value) { this.setAttribute("label", value); }

  #render() {
    this.shadowRoot.setHTMLUnsafe(/* html */`
      <div part="container" class="container">
        <span part="label">${this.#label}</span>
        <slot></slot>
      </div>
    `);
  }
}

customElements.define("my-component", MyComponent);
```

### `MyComponent.css`
```css
:host {
  display: block flow;
  --color: var(--my-component-color, indigo);
}

:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}

.container { display: flex; align-items: center; gap: 0.5rem; }

::slotted(*) { /* hijos via slot */ }
```

---

## Ciclo de vida

| Hook | Qué va acá | Qué NO va acá |
|---|---|---|
| `constructor()` | `super()`, `attachShadow`, `adoptedStyleSheets`, init de campos privados | Nada de DOM ni atributos, no `render()` |
| `connectedCallback()` | Leer atributos, primer `render()`, suscribir listeners, fetch inicial | — |
| `disconnectedCallback()` | Cancelar listeners, intervals, `AbortController.abort()` | Re-render |
| `attributeChangedCallback()` | Actualizar estado interno, re-render | Tareas pesadas sin debounce |

---

## Propiedad ≠ Atributo (bug más común)

```js
el.setAttribute("count", 42);  // Siempre string → "42"
el.count = 100;                // Tipo JS → 100 (no dispara attributeChangedCallback)
```

**Patrón de reflejo** — cuando ambos deben sincronizarse:
```js
get disabled() { return this.hasAttribute("disabled"); }
set disabled(value) {
  if (value) this.setAttribute("disabled", "");
  else this.removeAttribute("disabled");
}
```

Objetos complejos van siempre por propiedad, nunca por atributo:
```js
// ❌
<user-card data='{"name":"Alo"}'></user-card>

// ✅
card.data = { name: "Alo" };
```

---

## Comunicación entre componentes

```js
// Emisor
this.dispatchEvent(new CustomEvent("user-card:select", {
  bubbles: true,
  composed: true,
  detail: { id: 42 }
}));

// Receptor — cleanup automático con AbortController
class OtherComponent extends HTMLElement {
  #controller = new AbortController();

  connectedCallback() {
    document.addEventListener("user-card:select", (e) => {
      console.log(e.detail);
    }, { signal: this.#controller.signal });
  }

  disconnectedCallback() { this.#controller.abort(); }
}
```

Naming de eventos: `componente:accion` en minúsculas (`modal:close`, `user-card:select`). Nunca nombres genéricos que choquen con nativos.

---

## Estructura de archivos

```
src/
├── index.html
├── main.js
└── components/
    └── UserCard/
        ├── UserCard.js
        └── UserCard.css
```

```js
// main.js — punto de entrada, importa todos los componentes
import "./components/UserCard/UserCard.js";
```
