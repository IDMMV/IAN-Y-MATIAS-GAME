function buildVocales(container) {
  const data = [
    ['A','🐝','Abeja','#ef4444'],['E','🐘','Elefante','#f59e0b'],
    ['I','🦎','Iguana','#22c55e'],['O','🐻','Oso','#3b82f6'],['U','🍇','Uva','#a855f7']
  ];
  juegoDidactico(container, {
    bg1:'#fee2e2', bg2:'#dc2626', emoji:'🅰️', cols:5,
    instruc:'👶 Las 5 vocales: A, E, I, O, U. Toca cada una para escucharla y aprenderla.',
    items: data.map(d => ({
      label:d[0], big:d[1], sub:`${d[0]}
window.buildVocales = buildVocales;
