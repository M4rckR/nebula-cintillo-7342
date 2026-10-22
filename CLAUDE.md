# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Repositorio de actividades **Adobe Target** para https://www.viabcp.com/. No hay build, lint ni tests: cada `.html` es un snippet `<script>...</script>` que se pega como código personalizado de una experiencia en Target. Ver `README.md` para el índice.

- `experimentos/<codigo>-<nombre>/` — A/B o Auto-Target (control + pilotos, con tageo de vista/clic para comparar).
- `xt/<nombre>/` — Experience Targeting (una sola experiencia para una audiencia; no hay control).
- `herramientas/` — snippets de consola de DevTools, no se publican.

**Cada actividad tiene su propio `CLAUDE.md`** con la estructura del DOM que toca y sus reglas; leerlo antes de editar esa carpeta.

## Reglas comunes a todos los snippets

- **Nunca usar template literals** (comillas invertidas): Target interpreta `${...}` como sus propias variables y lo reemplaza por vacío. Concatenar strings o usar arrays con `.join('')`.
- Todo autocontenido: estilos inyectados con un `id` propio, idempotente si el script corre dos veces, y esperar al DOM con MutationObserver (o intervalo acotado) porque muchos componentes de viabcp se renderizan después de la carga.
- Estilo del equipo: IIFE, nombres en español, funciones pequeñas (`inyectarEstilo`, `iniciar`, ...).
- Tageo de experimentos: `digitalData.push({ promotion: { name, creative, position }, event: 'trackPromotionView' | 'trackPromotionClick' })`.

## Verificación

No hay entorno local: pegar el contenido del `<script>` en la consola (o usar el preview de Target) en las páginas reales de viabcp, en desktop y mobile. Evitar `alert` en pruebas automatizadas del navegador (bloquea la página); usar `console.log`.
