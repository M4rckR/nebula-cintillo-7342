copy(
  window.digitalData
    .map(e => `digitalData.push(${JSON.stringify(e, null, 2)});`)
    .join('\n\n')
);
console.log(`✅ ${window.digitalData.length} push copiados`);