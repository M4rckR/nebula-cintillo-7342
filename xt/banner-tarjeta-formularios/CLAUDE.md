# XT — Banner tarjeta en formularios de promociones

**Experience Targeting** (no es experimento: no hay control ni reparto de tráfico). Muestra la card "¿Aún no tienes una Tarjeta de Crédito BCP?" en **todas** las casuísticas de resultado de los formularios de promociones: éxito, no aplica, duplicado, límite y campaña no vigente, incluidas las que nativamente no muestran banner.

- `banner-tarjeta.html` — el snippet de la XT.
- `deteccion-landing.html` — snippet de depuración: solo detecta el tipo de landing y lo muestra en un `alert` al cargar.
- `referencias/piloto-cuotas-sin-intereses.html` — experimento anterior (VarB "Cuotas sin Intereses") del que sale el detector y el patrón de reemplazo del banner.

El contenido de la card (textos, imagen Visa Oro LATAM Pass, botón a `https://www.mitarjetabcp.viabcp.com/login` y estilos `.bcp_exito_solicitud*`) se copió de la landing `https://www.viabcp.com/bcp-latam-pass/solicitar-tarjeta-de-credito-bcp/`, que la pinta en su estado de éxito.

## Landings de prueba

- Por código: https://www.viabcp.com/gana-comprando
- Tradicional: https://www.viabcp.com/sorteo-conciertos

## Cómo funciona

1. `detectarTipoLandingBCP` devuelve `CODIGO` (existe `.bcp_crosssell_section`; se comprueba primero porque estas landings también llevan `tipo-formulario="FORMPROMOCIONES"`), `TRADICIONAL` (`section[tipo-formulario="FORMPROMOCIONES"]` con clase `bcp_form_exclusivo_promociones`/`bcp-formulario` y algún tag `bcp-form-*`) o `DESCONOCIDO` (no hace nada).
2. `LANDINGS[tipo]` define el contenedor de los estados, dónde insertar la card y cómo saber si hay un resultado visible.
3. La card se inserta oculta en `.bcp_contenedor_formulario` y un MutationObserver sobre `body` la muestra/oculta según el estado.

## DOM de cada landing (verificado en vivo)

**Por código** — `.form-premio .bcp_contenedor_formulario` contiene `.bcp_form_content`, `#estado-{no_aplica,duplicado,exito,limite,novigente}` (`.bcp_estado_resultado`) y `.bcp_crosssell_section`.
- `mostrarEstado(tipo)` de la landing pone `style.display = 'block'` en `#estado-<tipo>`.
- El cross-sell nativo (un solo banner, WARDA) se activa con `mostrarBannerProductoLeadNoLead()` en éxito y no aplica, según la cookie `leadMiEspacioBCP`. La sección tiene `display:none !important` en el CSS de la landing: el `display:block` en línea no cambia el estilo computado, así que hay que leer `style.display`, no `getComputedStyle`.

**Tradicional** — `.bcp_form_exclusivo_promociones .bcp_contenedor_formulario` contiene `.bcp_registro_formulario`, `.bcp_respuesta_{registro_correcto,registro_existente,novigente,no_aplica_campana,limite_inscritos_campana}` y `.bcp_confirmacion_registro` (con `bcp-form-confirmacion`).
- Cada respuesta se muestra añadiendo `.mostrar`.
- `.bcp_resultados_venta_formulario` trae ~22 banners de producto precargados ocultos; la landing elige uno (`.mostrar`) en todos los estados. Esta parte se renderiza después de la carga: observar `body`, no nodos que quizá aún no existan.

La XT oculta el cross-sell nativo de ambas landings para que no salgan dos banners.

## Pendiente

- Sin tageo (`trackPromotionView`/`trackPromotionClick`).
- Probado simulando estados en el DOM (no aplica en tradicional, duplicado en código), no con inscripciones reales.
