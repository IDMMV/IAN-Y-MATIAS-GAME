function buildLetras(container) {
  const data = [
    ['A','✈️','Avión'],['B','🍌','Banana'],['C','🏠','Casa'],['D','🦕','Dinosaurio'],
    ['E','🐘','Elefante'],['F','🌸','Flor'],['G','🐱','Gato'],['H','🍦','Helado'],
    ['I','🦎','Iguana'],['J','🦒','Jirafa'],['K','🐨','Koala'],['L','🌙','Luna'],
    ['M','🐵','Mono'],['N','☁️','Nube'],['O','🐻','Oso'],['P','🐧','Pingüino'],
    ['Q','🧀','Queso'],['R','🐭','Ratón'],['S','☀️','Sol'],['T','🐯','Tigre'],
    ['U','🍇','Uva'],['V','🐮','Vaca'],['W','🧇','Waffle'],['X','🎸','Xilófono'],
    ['Y','⛵','Yate'],['Z','🦓','Zebra']
  ];
  const cols = ['#ef4444','#f59e0b','#eab308','#22c55e','#06b6d4','#3b82f6','#6366f1','#a855f7','#ec4899'];
  juegoDidactico(container, {
    bg1:'#d1fae5', bg2:'#059669', emoji:'🔤', cols:5,
    instruc:'👶 Toca una letra, escúchala y aprende una palabra que empieza con ella.',
    items: data.map((d,i) => ({
      label:d[0], big:`${d[1]}`, sub:`${d[0]} de ${d[2]}`, voz:`${d[0]}. ${d[0]} de ${d[2]}`, color:cols[i%cols.length], fontSize:'1.8rem', bigSize:'4.5rem'
    }))
  });
}

// 🅰️ APRENDE VOCALES
if (typeof buildLetras === "function") window.buildLetras = buildLetras;
