# Actividades Adobe Target — viabcp.com

Snippets de código personalizado para actividades de Adobe Target en https://www.viabcp.com/. Cada `.html` es un `<script>` que se pega en una experiencia de Target; no hay build ni tests.

## Estructura

```
experimentos/     Actividades con tráfico repartido y métrica de éxito (A/B, Auto-Target)
xt/               Experience Targeting: se muestra a una audiencia, sin comparar variantes
herramientas/     Snippets de consola de apoyo (no se publican en Target)
```

| Tipo | Carpeta | Qué hace |
|---|---|---|
| Experimento · Auto-Target | [`experimentos/tc0098-cintillo-auto-target`](experimentos/tc0098-cintillo-auto-target) | Cintillo del header en todo el dominio: control + 6 pilotos |
| XT | [`xt/banner-tarjeta-formularios`](xt/banner-tarjeta-formularios) | Banner "¿Aún no tienes una Tarjeta de Crédito BCP?" en todos los resultados de los formularios de promociones |

## Herramientas

Se ejecutan en la consola de Chrome DevTools sobre una página de viabcp:

- `herramientas/buscar-pushes-digitaldata.js` — lista los atributos y listeners que hacen `digitalData.push` (usa `getEventListeners`, solo disponible en DevTools).
- `herramientas/copiar-digitaldata.js` — copia al portapapeles todos los `digitalData.push` de la página.

## Nueva actividad

Crear una carpeta `<codigo>-<descripcion>` en `experimentos/` o `xt/` con sus snippets y un `CLAUDE.md` propio con el contexto de la actividad.
