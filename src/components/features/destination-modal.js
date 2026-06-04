export default class DestinationModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._destino = null;
    this._currentImageIndex = 0;
    this._audioPlayed = false;
    this._audioElement = null;
    this._audioTimeoutId = null;
  }

  set destino(data) {
    this._destino = data;
    this._currentImageIndex = 0;
    this._audioPlayed = false;
    this.render();
  }

  open() {
    const overlay = this.shadowRoot.getElementById("modal-overlay");
    if (overlay) {
      overlay.classList.add("visible");
      this.shadowRoot.getElementById("close-btn")?.focus();
      document.body.style.overflow = "hidden";

      // Reproducir audio solo una vez con mejores prácticas
      if (!this._audioPlayed && this._destino?.audio) {
        this._playAudio();
      }
    }
  }
  _playAudio() {
    this._audioPlayed = true;
    const audioElement = this.shadowRoot.getElementById("destination-audio");

    if (!audioElement) return;
    if (this._audioTimeoutId) {
      clearTimeout(this._audioTimeoutId);
      this._audioTimeoutId = null;
    }

    // Usar requestAnimationFrame para no bloquear el thread principal
    requestAnimationFrame(() => {
      audioElement.currentTime = 0;
      const playPromise = audioElement.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // El navegador puede bloquear la reproducción automática
          console.warn(
            `Audio no se reprodujo automáticamente para ${this._destino?.nombre}:`,
            error.message,
          );
        });
      }

      // Limitar la reproducción a un tiempo fijo para evitar audios muy largos
      const FIXED_AUDIO_DURATION_MS = 4000; // 4 segundos
      this._audioTimeoutId = setTimeout(() => {
        audioElement.pause();
        audioElement.currentTime = 0;
        this._audioTimeoutId = null;
      }, FIXED_AUDIO_DURATION_MS);
    });
  }

  close() {
    const overlay = this.shadowRoot.getElementById("modal-overlay");
    if (overlay) {
      overlay.classList.remove("visible");
      document.body.style.overflow = "";

      // Stop media from playing when closed
      const video = this.shadowRoot.querySelector("video");
      if (video) {
        video.pause();
      }

      // Detener audio
      const audio = this.shadowRoot.querySelector("audio");
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (this._audioTimeoutId) {
        clearTimeout(this._audioTimeoutId);
        this._audioTimeoutId = null;
      }
    }
  }

  nextImage() {
    if (
      !this._destino ||
      !this._destino.galeria ||
      this._destino.galeria.length <= 1
    )
      return;
    this._currentImageIndex =
      (this._currentImageIndex + 1) % this._destino.galeria.length;
    this.updateImage();
  }

  prevImage() {
    if (
      !this._destino ||
      !this._destino.galeria ||
      this._destino.galeria.length <= 1
    )
      return;
    this._currentImageIndex =
      (this._currentImageIndex - 1 + this._destino.galeria.length) %
      this._destino.galeria.length;
    this.updateImage();
  }

  updateImage() {
    const img = this.shadowRoot.getElementById("gallery-img");
    const dots = this.shadowRoot.querySelectorAll(".dot");

    if (img) {
      img.style.opacity = 0;
      setTimeout(() => {
        img.src = this._destino.galeria[this._currentImageIndex];
        img.style.opacity = 1;
      }, 200);
    }

    if (dots.length > 0) {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === this._currentImageIndex);
      });
    }
  }

  render() {
    if (!this._destino) return;
    const d = this._destino;

    const badges = (d.actividades || [])
      .map((act) => `<span class="badge">${act}</span>`)
      .join("");

    let dotsHtml = "";
    if (d.galeria && d.galeria.length > 1) {
      dotsHtml =
        `<div class="gallery-dots">` +
        d.galeria
          .map(
            (_, i) =>
              `<span class="dot ${i === 0 ? "active" : ""}" data-idx="${i}"></span>`,
          )
          .join("") +
        `</div>`;
    }

    this.shadowRoot.setHTMLUnsafe(/*html*/ `
      <style>
        :host {
          --modal-bg: var(--color-surface-dim, #131b16);
          --color-primary: var(--color-primary, #4de082);
          --font-headline: var(--font-headline, 'Noto Serif', serif);
          --font-body: var(--font-body, 'Manrope', sans-serif);
        }
        
        .overlay {
          position: fixed; inset: 0;
          background: rgba(10, 20, 15, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.35s ease;
          padding: 1rem;
        }
        .overlay.visible { opacity: 1; pointer-events: auto; }
        
        .modal {
          background: var(--modal-bg);
          width: 100%; max-width: 900px;
          height: 90vh; /* Fixed max height for consistency */
          max-height: 700px;
          border-radius: var(--radius-xl, 24px);
          overflow: hidden; /* Hide main overflow to let columns scroll separately */
          box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
          display: flex; flex-direction: column;
          transform: scale(0.96) translateY(20px);
          transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1);
        }
        .overlay.visible .modal { transform: scale(1) translateY(0); }

        .gallery { 
          position: relative; 
          height: 35vh; 
          min-height: 250px;
          background: #000; 
          overflow: hidden; 
          flex-shrink: 0;
        }
        .gallery img { 
          width: 100%; height: 100%; 
          object-fit: cover; 
          transition: opacity 0.3s ease-in-out; 
        }
        
        /* Controles Carrusel */
        .gallery-controls {
           position: absolute; inset: 0;
           display: flex; justify-content: space-between; align-items: center;
           padding: 0 1rem;
           pointer-events: none;
        }
        .control-btn {
           background: rgba(0,0,0,0.5); color: white; border: none;
           border-radius: 50%; width: 44px; height: 44px; cursor: pointer;
           backdrop-filter: blur(8px);
           -webkit-backdrop-filter: blur(8px);
           pointer-events: auto;
           display: flex; align-items: center; justify-content: center;
           transition: background 0.2s, transform 0.2s;
           font-size: 1.2rem;
        }
        .control-btn:hover { background: rgba(0,0,0,0.8); transform: scale(1.05); }
        .control-btn:active { transform: scale(0.95); }
        
        .gallery-dots {
           position: absolute; bottom: 16px; left: 0; right: 0;
           display: flex; justify-content: center; gap: 8px;
        }
        .dot {
           width: 8px; height: 8px; border-radius: 50%;
           background: rgba(255,255,255,0.4);
           cursor: pointer;
           transition: background 0.2s, transform 0.2s;
           box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .dot.active { background: #fff; transform: scale(1.3); }

        /* Scrollable Content */
        .content-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto; /* Enable scrolling here instead of modal root */
        }
        
        /* Custom Scrollbar for inner content */
        .content-wrap::-webkit-scrollbar { width: 8px; }
        .content-wrap::-webkit-scrollbar-track { background: transparent; }
        .content-wrap::-webkit-scrollbar-thumb { 
          background-color: rgba(255,255,255,0.15); 
          border-radius: 10px; 
        }
        .content-wrap::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.25); }

        .header { padding: 2rem 2.5rem 1.5rem; position: relative; flex-shrink: 0; }
        .close-btn { 
          position: absolute; top: 1.5rem; right: 1.5rem; 
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1);
          color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; 
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, transform 0.2s;
          font-size: 1.2rem;
        }
        .close-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }
        
        .title { 
          font-family: var(--font-headline); font-size: 2.25rem; 
          margin: 0 0 0.5rem 0; color: #fff; 
          line-height: 1.1; padding-right: 3rem;
        }
        .region { 
          color: var(--color-primary); font-size: 0.85rem; 
          text-transform: uppercase; letter-spacing: 0.15em; 
          font-weight: 700;
        }
        
        .badges-wrap { padding: 0 2.5rem; flex-shrink: 0; }
        .badges { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .badge { 
          background: rgba(77, 224, 130, 0.12); 
          color: var(--color-primary); 
          padding: 0.4rem 0.8rem; 
          border-radius: 999px; font-size: 0.8rem; font-weight: 600;
          border: 1px solid rgba(77, 224, 130, 0.25);
          letter-spacing: 0.03em;
        }
        
        .body { 
          padding: 1.5rem 2.5rem 2.5rem 2.5rem; 
          color: var(--color-on-surface-variant, #dde4de); 
          line-height: 1.7; font-size: 1.05rem; 
        }

        /* Video Section */
        .video-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .video-title {
          font-family: var(--font-headline);
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
          color: #fff;
        }
        .video-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .video-wrapper video {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover; /* or contain depending on preference */
        }

        @media (width >= 768px) {
           .modal { flex-direction: row; align-items: stretch; height: 75vh; }
           .gallery { width: 45%; height: 100%; min-height: auto; }
           .content-wrap { width: 55%; }
           .header { padding-top: 3rem; }
           .close-btn { 
             /* Always float right regardless of scroll, so we use sticky or absolute relative to wrapper */
             position: absolute; top: 1.5rem; right: 1.5rem; z-index: 10;
           }
        }
      </style>

      <div class="overlay" id="modal-overlay" role="dialog" aria-modal="true" tabindex="-1">
        <div class="modal">
          
          <div class="gallery">
             <img src="${d.galeria && d.galeria.length > 0 ? d.galeria[0] : d.imagen_portada || ""}" id="gallery-img" alt="${d.nombre}">
             ${
               d.galeria && d.galeria.length > 1
                 ? `
             <div class="gallery-controls">
                <button class="control-btn" id="prev-btn" aria-label="Anterior imagen">❮</button>
                <button class="control-btn" id="next-btn" aria-label="Siguiente imagen">❯</button>
             </div>
             ${dotsHtml}
             `
                 : ""
             }
          </div>
          
          <div class="content-wrap">
            <button class="close-btn" id="close-btn" aria-label="Cerrar modal">✕</button>
            <div class="header">
              <h2 class="title">${d.nombre}</h2>
              <div class="region">${d.region}</div>
            </div>
            <div class="badges-wrap">
              <div class="badges">${badges}</div>
            </div>
            <div class="body">
              <p>${d.descripcion || "Sin descripción disponible."}</p>
              
              <div class="video-section">
                <h3 class="video-title">Explora en Video</h3>
                <div class="video-wrapper">
                  <!-- Usa el video del JSON si existe, de lo contrario usa un MP4 dummy -->
                  <video id="dest-video" controls preload="none" 
                    src="${d.video || "https://www.w3schools.com/html/mov_bbb.mp4"}" 
                    poster="${d.imagen_portada || ""}"
                    aria-label="Video del destino ${d.nombre}">
                    Tu navegador no soporta el etiquetado de video.
                  </video>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
      <!-- Audio Element: Hidden, plays only once when modal opens -->
      ${d.audio ? `<audio id="destination-audio" preload="metadata">
        <source src="${d.audio}" type="audio/mpeg">
        Tu navegador no soporta audio.
      </audio>` : ''}
      
    `);

    // Event Bindings
    this.shadowRoot
      .getElementById("close-btn")
      .addEventListener("click", () => this.close());

    this.shadowRoot
      .getElementById("modal-overlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "modal-overlay") this.close();
      });

    if (d.galeria && d.galeria.length > 1) {
      this.shadowRoot
        .getElementById("next-btn")
        .addEventListener("click", () => this.nextImage());
      this.shadowRoot
        .getElementById("prev-btn")
        .addEventListener("click", () => this.prevImage());

      // Dots interaction
      this.shadowRoot.querySelectorAll(".dot").forEach((dot) => {
        dot.addEventListener("click", (e) => {
          const idx = parseInt(e.target.getAttribute("data-idx"));
          if (!isNaN(idx)) {
            this._currentImageIndex = idx;
            this.updateImage();
          }
        });
      });
    }

    // Video Fallback: Si el video del JSon no existe localmente (error 404), usa el dummy publico
    const videoEl = this.shadowRoot.getElementById("dest-video");
    if (videoEl) {
      videoEl.addEventListener("error", () => {
        // Para asegurar compatibilidad extra con Safari y evitar bucles
        if (!videoEl.src.includes("w3schools.com")) {
          console.warn(
            "Video local no encontrado, cargando video de respaldo.",
          );
          videoEl.src = "https://www.w3schools.com/html/mov_bbb.mp4";
        }
      });
    }

    // Single global keyboard handler bound to window to make sure we catch Escape regardless of focus
    if (!this._keydownHandler) {
      this._keydownHandler = (e) => {
        if (
          !this.shadowRoot
            .getElementById("modal-overlay")
            .classList.contains("visible")
        )
          return;

        if (e.key === "Escape") {
          this.close();
        } else if (e.key === "ArrowRight") {
          this.nextImage();
        } else if (e.key === "ArrowLeft") {
          this.prevImage();
        }
      };
      window.addEventListener("keydown", this._keydownHandler);
    }
  }

  disconnectedCallback() {
    if (this._keydownHandler) {
      window.removeEventListener("keydown", this._keydownHandler);
    }
  }
}

customElements.define("destination-modal", DestinationModal);
