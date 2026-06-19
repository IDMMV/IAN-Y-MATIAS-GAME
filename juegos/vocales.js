function buildVocales(container) {
  const data = [
    ['A','🐝','Abeja','#ef4444'],['E','🐘','Elefante','#f59e0b'],
    ['I','🦎','Iguana','#22c55e'],['O','🐻','Oso','#3b82f6'],['U','🍇','Uva','#a855f7']
  ];
  juegoDidactico(container, {
    bg1:'#fee2e2', bg2:'#dc2626', emoji:'🅰️', cols:5,
    instruc:'👶 Las 5 vocales: A, E, I, O, U. Toca cada una para escucharla y aprenderla.',
    items: data.map(d => ({
      label:d[0], big:d[1], sub:`${d[0]} de ${d[2]}`, voz:`${d[0]}. ${d[0]} de ${d[2]}`, color:d[3], fontSize:'2.6rem', bigSize:'4.5rem'
    }))
  });
}

// 🌈 APRENDE COLORES
if (typeof buildVocales === "function") window.buildVocales = buildVocales;
