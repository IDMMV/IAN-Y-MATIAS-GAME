function buildSilabas(container) {
  // sílabas simples con una consonante + vocales
  const consonantes = ['M','P','L','S','T','N'];
  const vocales = ['A','E','I','O','U'];
  const ejemplos = { 'MA':'🐵 Mamá','PA':'👨 Papá','LO':'🦁 Lobo','SO':'☀️ Sol','TE':'🍵 Té','NI':'👶 Niño' };
  // armar lista de sílabas combinando
  const items = [];
  const cols = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7'];
  consonantes.forEach((c, ci) => {
    vocales.forEach((v, vi) => {
      const sil = c + v;
      items.push({
        label: sil.charAt(0) + sil.charAt(1).toLowerCase(),
        big: `<div style="font-family:'Fredoka One',cursive">${sil.charAt(0)+sil.charAt(1).toLowerCase()}</div>`,
        sub: ejemplos[sil] || '',
        voz: sil, color: cols[vi], fontSize:'1.4rem', bigSize:'5rem'
      });
    });
  });
  juegoDidactico(container, {
    bg1:'#cffafe', bg2:'#0891b2', emoji:'📖', cols:5,
    instruc:'👶 Toca una sílaba para escucharla: MA, ME, MI... ¡El primer paso para leer!',
    items
  });
}

// 🔵 BURBUJAS
if (typeof buildSilabas === "function") window.buildSilabas = buildSilabas;
