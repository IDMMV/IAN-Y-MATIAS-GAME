function buildMerge(container) {
  // cadena de evolución
  const CADENA = ['🥚','🐣','🐤','🐥','🐔','🦃','🦅','🦄','🐉'];
  const N = 5;
  let grid = Array(N*N).fill(-1);
  let score = 0;
  let siguiente = 0;

  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:14px;min-height:480px">
      <div style="text-align:center;color:#fff;margin-bottom:10px">
        <span style="font-family:'Fredoka One',cursive">🏆 <span id="mergeScore">0</span></span>
        <span style="margin-left:14px;color:#aaa;font-size:0.85rem">Siguiente: <span id="mergeNext" style="font-size:1.4rem">🥚</span></span>
      </div>
      <div id="mergeGrid" style="display:grid;grid-template-columns:repeat(${N},1fr);gap:6px;max-width:340px;margin:0 auto"></div>
      <div style="text-align:center;color:#aaa;font-size:0.8rem;margin-top:10px">Toca una casilla vacía para poner. ¡Junta 3 iguales para evolucionar!</div>
    </div>
    <div class="game-instructions">🎯 Coloca huevos en el tablero. Cuando 3 iguales se tocan, se fusionan en algo mejor: 🥚→🐣→🐤→🐔→🦄→🐉. ¡Llega al dragón!</div>`;
  const gridEl = document.getElementById('mergeGrid');

  function nuevoSiguiente() {
    // mayormente huevos, a veces el siguiente nivel
    siguiente = Math.random() < 0.8 ? 0 : 1;
    setText('mergeNext', CADENA[siguiente]);
  }

  function vecinos(i) {
    const r = Math.floor(i/N), c = i%N, v = [];
    if (r>0) v.push(i-N); if (r<N-1) v.push(i+N);
    if (c>0) v.push(i-1); if (c<N-1) v.push(i+1);
    return v;
  }
  function resolverFusiones(desde) {
    // BFS de iguales conectados
    const val = grid[desde];
    if (val < 0) return false;
    const visto = new Set([desde]), cola = [desde];
    while (cola.length) {
      const x = cola.pop();
      vecinos(x).forEach(n => { if (!visto.has(n) && grid[n]===val) { visto.add(n); cola.push(n); } });
    }
    if (visto.size >= 3 && val < CADENA.length-1) {
      visto.forEach(x => grid[x] = -1);
      grid[desde] = val+1;
      score += (val+1)*10; setText('mergeScore', score);
      SFX.coin();
      // efecto cadena
      setTimeout(() => { resolverFusiones(desde); render(); }, 120);
      return true;
    }
    return false;
  }
  function render() {
    gridEl.innerHTML = '';
    grid.forEach((v, i) => {
      const cell = document.createElement('button');
      cell.style.cssText = `aspect-ratio:1;background:${v<0?'#13131f':'#1e1b4b'};border:2px solid ${v<0?'rgba(255,255,255,0.08)':'rgba(124,58,237,0.4)'};border-radius:10px;font-size:1.8rem;cursor:${v<0?'pointer':'default'};-webkit-tap-highlight-color:transparent`;
      cell.textContent = v<0 ? '' : CADENA[v];
      if (v < 0) {
        const put = e => {
          e.preventDefault(); e.stopPropagation();
          grid[i] = siguiente; SFX.click();
          if (!resolverFusiones(i)) render();
          else render();
          nuevoSiguiente();
          if (grid.every(x => x>=0)) setTimeout(checkFin, 200);
        };
        cell.addEventListener('touchstart', put, {passive:false});
        cell.addEventListener('click', put);
      }
      gridEl.appendChild(cell);
    });
    // ¿llegó al dragón?
    if (grid.includes(CADENA.length-1)) {
      if (typeof awardBadge==='function') awardBadge('first_win');
      if (typeof celebrate==='function') celebrate();
      showToast('🐉 ¡Creaste el DRAGÓN!');
    }
  }
  function checkFin() {
    // si está lleno y no hay fusiones posibles
    if (grid.every(x => x>=0)) {
      showToast('😅 Tablero lleno. +' + score + ' puntos');
      if (score>=100 && typeof darRecompensa==='function') darRecompensa(Math.floor(score/10), score, 'Fusión');
    }
  }
  nuevoSiguiente();
  render();
}

// ══════════════════════════════════════════════════════════
//  🏰 DEFIENDE LA TORRE (tower defense simple)
// ══════════════════════════════════════════════════════════
if (typeof buildMerge === "function") window.buildMerge = buildMerge;
