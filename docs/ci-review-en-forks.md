# Claude Code Review en PRs de forks — guía y aprendizajes

Esta guía documenta cómo configuramos el workflow de Claude Code Review para que
funcione en Pull Requests provenientes de forks externos, por qué cada decisión
es como es, un bug conocido que nos encontramos, y los conceptos de GitHub
(issues, PRs, tags vs SHA) que aparecieron en el camino.

> **Idea central que atraviesa todo el documento:** no te fíes del titular
> (el estado "closed" de un issue, la descripción de un PR, un tag de versión).
> **Andá siempre a la fuente: el código y el estado real.**

---

## 1. El problema y la solución (resumen ejecutivo)

| | |
|---|---|
| **Problema** | El review fallaba en PRs desde forks porque el evento `pull_request` **no pasa los secrets** a forks (regla de seguridad de GitHub). Sin el `CLAUDE_CODE_OAUTH_TOKEN`, Claude no podía correr. |
| **Solución** | Cambiar a `pull_request_target` (corre en contexto del repo base → SÍ tiene secrets) + un **allowlist de autores** a nivel de job que blinda el acceso. |
| **Resultado** | El review corre en PRs de forks, pero **solo** si el autor está en la lista de confianza. |

---

## 2. `pull_request` vs `pull_request_target`

Este es el corazón del cambio.

| | `pull_request` | `pull_request_target` |
|---|---|---|
| Contexto de ejecución | El **fork** (no confiable) | El **repo base** (tu repo, confiable) |
| Secrets en PRs de fork | ❌ NO disponibles | ✅ Disponibles |
| Checkout por defecto | Código del PR (head) | Tu **rama base** |

**¿Por qué `pull_request` no pasa secrets a forks?** Porque cualquiera puede
forkear, modificar el código y abrir un PR. Si ese código corriera con tus
secrets, un atacante los robaría en tres líneas. **Esa "falla" es una feature de
seguridad de GitHub.**

`pull_request_target` recupera el acceso a secrets porque corre en el contexto
de tu repo. Pero esto abre un riesgo nuevo (ver siguiente sección).

---

## 3. Implicación de seguridad — leer con atención

`pull_request_target` es un **arma de doble filo**. Por defecto hace checkout de
tu rama base (seguro), pero para revisar el PR necesitamos el código del **head
del PR — que es código NO confiable**.

```
código no confiable del fork  +  secrets disponibles  =  riesgo de exfiltración
```

### La mitigación: allowlist a nivel de JOB

```yaml
if: >
  contains(
    fromJSON('["JoseDavidGarciaDowning", "GeraldFPA", "Mfce3012", "VictorRodz"]'),
    github.event.pull_request.user.login
  )
```

- Se evalúa **ANTES** de cualquier checkout.
- Si el autor no está autorizado → el job se saltea entero → el código del fork
  **nunca toca el runner con secrets**.
- `fromJSON('[...]')` crea un array real; `contains(array, login)` devuelve
  `true` solo si el autor está en la lista.

> La seguridad NO está en `pull_request_target` — está en el **allowlist que lo
> blinda**. Mantené la lista chica y solo con gente de confianza.

### Checkout del head por SHA exacto

```yaml
- uses: actions/checkout@<SHA>
  with:
    ref: ${{ github.event.pull_request.head.sha }}
    fetch-depth: 1
```

Usamos `head.sha` (el commit exacto) y no `head.ref` para evitar una condición
de carrera (TOCTOU): que alguien empuje commits nuevos **después** de pasar el
allowlist pero **antes** del checkout.

---

## 4. Tags vs SHA en GitHub Actions

### El concepto

```
@v4          → "dame lo que HOY esté etiquetado v4"   (etiqueta MOVIBLE)
@34e1148...  → "dame EXACTAMENTE este commit"          (INMUTABLE)
```

Un **tag es una etiqueta movible**: el dueño del repo puede despegarla y pegarla
en otro commit cuando quiera. Un **SHA** es la dirección física inmutable de un
commit: nunca cambia.

### Por qué importa para la seguridad

Tu workflow ejecuta el código de cada action **con acceso a tus secrets**. Si una
action se compromete (cuenta del mantenedor hackeada, ataque de supply chain como
el de `tj-actions/changed-files` en marzo 2025), mover el tag `v4` a código
malicioso te afecta sin que vos cambies nada. Con un **SHA pineado**, seguís
corriendo el commit que verificaste.

### El tradeoff

| | Tag (`@v4`) | SHA (`@34e1148...`) |
|---|---|---|
| Seguridad | Vulnerable a mover-tag / supply chain | Inmutable, blindado |
| Updates | Automáticos | Congelado hasta actualizar a mano |
| Legibilidad | Claro | Ilegible → necesita comentario `# v4.3.1` |

### Lo que aplicamos

```yaml
uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5  # v4.3.1
uses: anthropics/claude-code-action@70a6e5256e9e2366a1ed5c041904a982ba3a328f  # v1.0.135
```

SHA (inmutabilidad) + comentario con el tag (legibilidad) + Dependabot (updates).

---

## 5. Dependabot: qué es y qué revisar

El SHA pineado te deja **congelado**: no recibís parches. Dependabot lo resuelve.

**Qué hace:** vigila semanalmente si tus actions tienen versión nueva y, cuando
la hay, **abre un PR** que mueve el SHA viejo al nuevo:

```diff
- uses: actions/checkout@34e1148...  # v4.3.1
+ uses: actions/checkout@a1b2c3d...  # v4.4.0
```

### ⚠️ Qué revisar antes de mergear ese PR (NO lo aceptes a ciegas)

Vas a meter un SHA nuevo en un workflow que tiene acceso a tu secret. Verificá
**una sola cosa**:

> ¿El SHA nuevo corresponde de verdad a una release oficial y legítima?

```bash
git ls-remote --tags https://github.com/actions/checkout.git | grep <SHA-nuevo>
# Si devuelve refs/tags/v4.4.0 → confirmado, ese SHA es esa versión real.
```

- [ ] El changelog/release del PR de Dependabot tiene sentido (parche normal).
- [ ] El SHA nuevo mapea a un tag de versión oficial.
- [ ] **NO** activar auto-merge para estos PRs.

---

## 6. Bug encontrado: colisión de nombres de rama

### Síntoma

```
fatal: refusing to fetch into branch 'refs/heads/main' checked out at '...'
Command failed: git fetch origin --depth=20 pull/9/head:main
```

### Causa raíz

La `claude-code-action` hace su propio checkout del PR con:

```bash
git fetch origin pull/<N>/head:<nombre-de-la-rama-del-PR>
```

Crea una rama local con **el mismo nombre que la rama del fork**. Si el
contribuyente abrió el PR desde la rama **`main` de su fork**, el comando termina
en `:main` → choca con la `main` del runner (que está checked out). Git se niega
a escribir sobre la rama activa. **Colisión.**

### Solución (en nuestra mano)

El contribuyente debe abrir el PR desde una **rama con nombre propio**, no `main`:

```bash
# En su fork, parado en main con sus cambios:
git checkout -b fix/descripcion-del-cambio
git push origin fix/descripcion-del-cambio
# Luego abre un PR nuevo desde esa rama y cierra el que falla.
```

Con un nombre que no existe en el repo base, no hay colisión.

> **Regla del equipo:** nunca abrir PRs desde `main` (ni en forks). Siempre
> rama con nombre descriptivo (`fix/...`, `feat/...`). Es higiene de git y, de
> paso, esquiva este bug.

### Estado del bug (caso de estudio: "closed" ≠ "arreglado")

| Evidencia | Cómo se verificó | Resultado |
|---|---|---|
| Issue #930 figura "closed" | Página del issue | Engañoso por sí solo |
| PR #931 (el fix con `pr-{number}`) | API de GitHub | `merged: true` (12-feb-2026) |
| Código `branch.ts` en v1.0.135 | Lectura del raw en el SHA | Usa nombre original, **no** `pr-{number}` |
| Código `branch.ts` en `main` hoy | Lectura del raw | Tampoco tiene el fix |

**Conclusión:** el PR #931 se mergeó **y después se revirtió**. El fix automático
no está vivo en el código. Por eso no se arregla bumpeando la versión — hay que
usar el workaround del nombre de rama.

Refs: [issue #930](https://github.com/anthropics/claude-code-action/issues/930) ·
[PR #851](https://github.com/anthropics/claude-code-action/pull/851) ·
[PR #931](https://github.com/anthropics/claude-code-action/pull/931)

---

## 7. Cómo funcionan los issues y PRs en GitHub

### Issue ≠ Pull Request (pero comparten numeración)

- **Issue** = un reporte / conversación. No tiene código.
- **Pull Request (PR)** = una propuesta de cambio de código.
- GitHub usa **un solo contador compartido** para issues Y PRs por repo.

```
#851  ← un PR    (introdujo el bug)
#930  ← un issue (reporta el bug)
#931  ← un PR    (intentó arreglarlo)
```

No podés saber si `#851` es issue o PR solo por el número. Lo sabés por la URL:
`/issues/851` vs `/pull/851`.

### Decodificar un título con referencias

> "PR checkout fails due to branch name collision after **#851**" · Issue **#930**

| Parte | Qué es |
|---|---|
| **#930** (header/URL) | El número **de este issue** (su identidad) |
| **#851** (en el texto, color suave) | Una **referencia clickeable** a otro item (el PR culpable) |

Escribir `#N` en cualquier texto de GitHub crea un **hipervínculo** automático.

### El enlace mágico issue ↔ PR

En la descripción del PR que arregla un issue se escribe:

```
Fixes #930      (o Closes #930, Resolves #930)
```

Al mergear ese PR, GitHub **cierra el issue automáticamente** y los deja
enlazados para siempre.

### Qué significa "Closed" (no es lo que parece)

| Estado | Significado |
|---|---|
| **Closed as completed** (✔️ morado) | "Se resolvió / se hizo" |
| **Closed as not planned** (⊘ gris) | "No se va a hacer": duplicado, won't-fix, obsoleto |

> ⚠️ Ni "completed" garantiza que esté arreglado en TU versión. Un fix puede
> mergearse y luego revertirse — el PR sigue marcado `merged: true`, pero el
> código ya no está. **Hay que leer el hilo completo y mirar el código.**

### Buenas prácticas con issues

**Antes de crear:**
- [ ] Buscá primero — la mayoría ya existen. Evitá duplicados.

**Al crear:**
- [ ] Título claro y específico.
- [ ] Pasos para reproducir, esperado vs real.
- [ ] **La versión** que usás.
- [ ] Referenciá items relacionados con `#numero`.

**Al cerrar:**
- [ ] Si lo arregla un PR, usá `Fixes #N` (cierre + enlace automático).
- [ ] Si no se hará, cerralo "not planned" **con un comentario explicando**.

**Como lector de issues ajenos:**
- [ ] No asumas por el estado. Leé el hilo, mirá la fecha del último comentario,
      **verificá contra tu versión**.

---

## 8. La lección que se repite en todo el documento

```
"Issue closed"        ≠  arreglado en tu versión
"PR merged: true"     ≠  el código está vivo (pudo revertirse)
Tag @v4               ≠  un commit fijo (es movible)
Descripción de un PR  ≠  lo que realmente corre

→ Andá SIEMPRE a la fuente: el código y el estado real, no el titular.
```

---

## Archivos relevantes

- `.github/workflows/claude-code-review.yml` — review en PRs (con `pull_request_target` + allowlist).
- `.github/workflows/claude.yml` — Claude por mención `@claude`.
- `.github/dependabot.yml` — mantiene los SHAs de las actions actualizados.
