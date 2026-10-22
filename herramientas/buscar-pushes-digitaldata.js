(() => {
  const KEY = /digitalData/; // agrega aquí funciones wrapper, ej: /digitalData|trackEvent|_satellite\.track/
  const hits = [];
  const add = (el, tipo, src) => hits.push({ el, tipo, src: src.replace(/\s+/g, ' ').slice(0, 150) });

  [window, document, ...document.querySelectorAll('*')].forEach(el => {
    // 1. Atributos inline (onclick, href="javascript:...", etc.)
    el.attributes && [...el.attributes].forEach(a => KEY.test(a.value) && add(el, `inline ${a.name}`, a.value));

    // 2. Listeners nativos
    Object.entries(getEventListeners(el)).forEach(([type, arr]) =>
      arr.forEach(l => { const s = l.listener.toString(); KEY.test(s) && add(el, type, s); })
    );

    // 3. Listeners jQuery (incluye delegados con selector)
    const jq = window.jQuery?._data?.(el, 'events');
    jq && Object.entries(jq).forEach(([type, arr]) => arr.forEach(h => {
      const s = h.handler.toString();
      if (!KEY.test(s)) return;
      if (h.selector) document.querySelectorAll(h.selector).forEach(t => add(t, `jQuery ${type} (delegado: ${h.selector})`, s));
      else add(el, `jQuery ${type}`, s);
    }));
  });

  const sel = el => el === window ? 'window' : el === document ? 'document'
    : el.id ? `#${el.id}` : el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');

  hits.forEach(h => { if (h.el.style) { h.el.style.outline = '3px dashed red'; h.el.title = `🎯 ${h.tipo}`; } });

  window.__dlTargets = hits;
  console.table(hits.map(h => ({ elemento: sel(h.el), texto: h.el.innerText?.trim().slice(0, 40), evento: h.tipo, codigo: h.src })));
  console.log(`🎯 ${hits.length} elementos encontrados. Detalle en __dlTargets`);
})();