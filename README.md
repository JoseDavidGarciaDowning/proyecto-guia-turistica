# Guía Turística Interactiva

Este proyecto consiste en una guía turística interactiva desarrollada en JavaScript por el Grupo 3 del curso de Multimedios de la carrera de Informática Empresarial, en la Universidad de Costa Rica (Sede Guanacaste), durante el ciclo I-2026. La aplicación utiliza ES Modules y una arquitectura modular basada en componentes.

## Requisitos

* Node.js (recomendado v16 o superior)
* pnpm
* servor (servidor estático para desarrollo)

## Instalación

1. Clona este repositorio:

   ```sh
   git clone <URL-del-repositorio>
   cd <nombre-de-la-carpeta-del-proyecto>
   ```

2. Instala las dependencias:

   ```sh
   pnpm install
   ```


## Ejecución en un servidor local

Los navegadores modernos requieren que los ES Modules se sirvan desde un servidor local (no funcionan correctamente abriendo el archivo `index.html` directamente).

Este proyecto utiliza **servor** como servidor de desarrollo estático.

1. Instala `servor` globalmente si no lo tienes:

   ```sh
   pnpm add -g servor
   ```

2. Ejecuta el servidor en la raíz del proyecto:

   ```sh
   servor .
   ```

3. Abre tu navegador en la URL que aparece (por defecto http://localhost:8080).

---

## Estructura del Proyecto

- `index.html`: Página principal.
- `src/`: Código fuente (componentes, datos, utilidades, estilos).
- `assets/`: Imágenes y recursos estáticos.
- `package.json`: Dependencias y scripts.

---


## Notas

- Si modificas archivos fuente, solo recarga el navegador para ver los cambios.
- Si tienes problemas con rutas o módulos, asegúrate de estar usando un servidor local con servor.

---

## Créditos

Consulta el archivo CREDITOS.md para información sobre autores y recursos utilizados.
