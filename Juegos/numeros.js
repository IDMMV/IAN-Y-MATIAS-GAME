function buildNumeros(container) {
  const objetos = ['🍎','⭐','🎈','🐱','🌸','🍓','🚗','⚽','🦋','🍪'];
  const items = [];
  for (let n=1; n<=10; n++) {
    const obj = objetos[n-1];
    items.push({
      label: String(n), big: obj.repeat(n), sub: String(n), voz: String(n),
      color: ['#ef4444','#f59e0b','#eab308','#22c55e','#06b6d4','#3b82f6','#6366f1','#a855f7','#ec4899','#f43f5e'][n-1],
      fontSize:'2.4rem', bigSize:'2.4rem'
    }
window.buildNumeros = buildNumeros;
