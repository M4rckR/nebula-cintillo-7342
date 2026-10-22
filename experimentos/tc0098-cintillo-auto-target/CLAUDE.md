# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Experimento **Adobe Target Auto-Target** sobre el cintillo (franja superior del header) de **todo el dominio https://www.viabcp.com/**. No hay build, lint ni tests: cada archivo `.html` es un snippet `<script>(() => { ... })();</script>` que se pega como código personalizado de una experiencia en Target.

- `control.html` — experiencia control (50% del tráfico). Debe dejar el cintillo actual del sitio intacto.
- `variantes/piloto1..5.html` — las 5 experiencias que Auto-Target reparte en el otro 50%. Mensajes (en orden):
  1. Oferta preaprobada — "Descubre si tienes una tarjeta de crédito preaprobada"
  2. Seguridad — "Saca tu tarjeta de crédito y compra seguro con la protección BCP"
  3. Descuentos y beneficios — "Saca tu tarjeta de crédito y disfruta descuentos desde el primer día"
  4. Primer paso financiero — "Tu primera tarjeta de crédito es el inicio de tu historial crediticio"
  5. Flexibilidad en cuotas — "Saca tu tarjeta de crédito y paga tus compras en cuotas"
- `referencias/base-no-exp.html` / `referencias/base.html` — snapshots del home de viabcp sin y con otras actividades de Target activas. Son solo referencia (~300 KB c/u); buscar con grep/python en lugar de leerlos completos.

## Cómo se arma el cintillo en viabcp (común a todas las páginas)

```
header.bcp_header.bcp_header_principal
└── div.bcp_cintillo.activo                ← la "caja" del cintillo: único ancla permitida
    ├── div.bcp_cintillo_experimentos      (vacío; aquí cae el mbox)
    ├── <style> del cintillo genérico (inline, no global)
    ├── div.bcp_cintillo_campana           (cintillo genérico del CMS)
    │   ├── a > .container > .bcp_cintillo_texto_boton > .bcp_texto > p
    │   ├── button.btn_cerrar_promocion
    │   └── span.listaNegraCintilloGenerico (rutas donde NO se muestra, una por línea)
    └── <script> lógica del genérico
```

Comportamiento nativo que hay que respetar/no romper:
- Cerrar el genérico setea la cookie `bcp_cintillo_promocion_ocultar` (24 h) y hace `.remove()` del `.bcp_cintillo_campana`. En rutas de la lista negra también se elimina.
- El sitio pide el mbox `viabcp-global-mbox-cintillo` (`adobe.target.getOffer`) y, si hay oferta, **reemplaza todo el `innerHTML` de `.bcp_cintillo`** por `<div class="bcp_cintillo_experimentos">` + contenido; luego `agregarEventosCintilloMbox()` espera un `.bcp_cintillo_campana_adobe` con `a` y `.btn_cerrar_promocion`. Cookie de cierre de esa variante: `bcp_cintillo_promocion_adobe_ocultar`.
- El header calcula su comportamiento con la altura de `.bcp_cintillo` (`obtenerAltoCintilloExp`, scroll ≥190 px muestra botones). Alturas del genérico: 56 px (≤991 px) y 48 px (≥992 px).
- Analítica: `digitalData.push({ action: { group: 'Header' | 'Header-PyMES' | 'Header-Empresas', category, name: 'Cintillo', label }, event: 'trackAction' })`.

## Reglas para los snippets

- **Nunca usar template literals** (comillas invertidas) en ningún snippet: Target interpreta `${...}` como sus propias variables y lo reemplaza por vacío. CSS y HTML van como arrays de strings con `.join('\n')`; valores dinámicos por concatenación o asignados por DOM.
- Anclarse **solo** a `.bcp_cintillo` (y lo que esté dentro). No depender de otros divs de la página, porque el código corre en todo el dominio y el resto del layout cambia entre páginas.
- Todo autocontenido: estilos inyectados con un `id` propio desde JS (el `<style>` del genérico puede no existir si el mbox reescribió la caja), idempotente si el script corre dos veces, y esperando con MutationObserver/intervalo acotado a que exista `.bcp_cintillo`.
- Estilo de código de los experimentos del equipo (ver carpetas hermanas `../tc0060-contador-cintillo`, `../experiencia-cintillo`): IIFE, nombres en español, funciones pequeñas (`inyectarEstilos`, `iniciar`, ...).
- Tageo del experimento (estilo del equipo, como `../fabrica/experimentos-ajo/tc0060`): `digitalData.push({ promotion: { name: 'Header - ViaBCP - <código> - {C|P1..P6}', creative: 'Cintillo', position: '<copy sin emojis>' }, event: 'trackPromotionView' | 'trackPromotionClick' })`. Vista una vez por página con IntersectionObserver ≥50 %; clic solo en el enlace (la X no se taggea). El código va en la constante `CODIGO_EXPERIMENTO` de cada archivo. La conversión de Auto-Target se mide en Target (clic al cintillo), no en Analytics.

## Verificación

No hay entorno local: probar pegando el snippet en la consola (o con la extensión de Chrome) en páginas aleatorias de viabcp.com — home, `/pymes`, `/empresas`, una página de producto y una ruta de la lista negra — en desktop y mobile (≤991 px), y con la cookie de cierre seteada.
