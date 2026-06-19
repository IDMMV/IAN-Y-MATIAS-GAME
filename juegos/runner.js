function buildRunner(container) {
  const W = Math.min(360, window.innerWidth-40), H = 460;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:10px;min-height:500px">
      <div style="text-align:center;color:#fff;margin-bottom:6px">
        <span style="font-family:'Fredoka One',cursive">🏆 <span id="runScore">0</span></span>
        <span style="margin-left:14px;color:#FFD600">🪙 <span id="runCoins">0</span></span>
      </div>
      <canvas id="runCanvas" width="${W}" height="${H}" style="background:linear-gradient(180deg,#312e81,#1e1b4b);border-radius:14px;display:block;margin:0 auto;touch-action:none;max-width:100%"></canvas>
    </div>
    <div class="game-instructions">🏃 Toca izquierda/derecha de la pantalla (o flechas) para cambiar de carril y esquivar. ¡Recoge monedas y llega lejos!</div>`;
  const cv = document.getElementById('runCanvas');
  const ctx = cv.getContext('2d');
  const carriles = [W*0.25, W*0.5, W*0.75];
  let carril = 1, score = 0, coins = 0, vel = 4, jugando = true;
  let obstaculos = [], monedas = [], spawnT = 0;
  let gameover_called = false;
  let jugadorEmoji = (typeof miIdentidadOnline==='function' ? miIdentidadOnline().emoji : '🏃');
  let _runAnimId = null;

  function mover(dir) {
    carril = Math.max(0, Math.min(2, carril + dir));
    SFX.click();
  }
  // tocar la pantalla
  const tap = e => {
    e.preventDefault();
    const r = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || e;
    const x = (t.clientX - r.left);
    if (x < r.width/2) mover(-1); else mover(1);
  };
  cv.addEventListener('touchstart', tap, {passive:false});
  cv.addEventListener('click', tap);
  const key = e => { if (e.key==='ArrowLeft') mover(-1); else if (e.key==='ArrowRight') mover(1); };
  document.addEventListener('keydown', key);
  window.activeKeyHandlers.push(key);

  function loop() {
    if (window.HK_PAUSED) {
      _runAnimId = requestAnimationFrame(loop);
      return;
    }
    if (!container.isConnected || !jugando) return;
    ctx.clearRect(0,0,W,H);
    // líneas de carril
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth=2; ctx.setLineDash([12,12]);
    [W*0.375, W*0.625].forEach(x => { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); });
    ctx.setLineDash([]);
    // generar
    spawnT++;
    if (spawnT > Math.max(28, 60-score/10)) {
      spawnT = 0;
      const c = Math.floor(Math.random()*3);
      if (Math.random() < 0.7) obstaculos.push({ c, y:-40, emoji:['🚧','🪨','📦','🛢️'][Math.floor(Math.random()*4)] });
      else monedas.push({ c, y:-40 });
    }
    // mover y dibujar obstáculos
    obstaculos.forEach(o => o.y += vel);
    monedas.forEach(m => m.y += vel);
    obstaculos = obstaculos.filter(o => o.y < H+40);
    monedas = monedas.filter(m => m.y < H+40);
    ctx.font = '30px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    obstaculos.forEach(o => ctx.fillText(o.emoji, carriles[o.c], o.y));
    monedas.forEach(m => ctx.fillText('🪙', carriles[m.c], m.y));
    // jugador
    const py = H-60;
    ctx.font = '36px sans-serif';
    ctx.fillText(jugadorEmoji, carriles[carril], py);
    // colisiones
    obstaculos.forEach(o => {
      if (o.c === carril && Math.abs(o.y - py) < 30) { gameOver(); }
    });
    monedas = monedas.filter(m => {
      if (m.c === carril && Math.abs(m.y - py) < 30) { coins++; score+=5; setText('runCoins',coins); SFX.coin(); return false; }
      return true;
    });
    score++; setText('runScore', Math.floor(score/3));
    vel = 4 + score/300;
    if (jugando) _runAnimId = registerAnimation(requestAnimationFrame(loop));
  }
  function gameOver() {
    if (gameover_called) return;  // Prevenir múltiples llamadas
    gameover_called = true;
    jugando = false;
    SFX.lose();
    const finalScore = Math.floor(score/3);
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff'; ctx.font='bold 28px sans-serif'; ctx.textAlign='center';
    ctx.fillText('💀 ¡Chocaste!', W/2, H/2-40);
    ctx.font='20px sans-serif';
    ctx.fillText('Puntos: '+finalScore+' · 🪙'+coins, W/2, H/2);
    // recompensa
    if (coins >= 10 && typeof darRecompensa==='function') darRecompensa(coins, finalScore, 'Runner');
    if (finalScore >= 50 && typeof awardBadge==='function') awardBadge('first_win');
    
    // botón reiniciar - LIMPIAR PRIMERO LOS ANTIGUOS
    const oldBtns = cv.parentElement.querySelectorAll('button');
    oldBtns.forEach(b => b.remove());
    
    const btn = document.createElement('button');
    btn.textContent = '🔁 Jugar de nuevo';
    btn.style.cssText='display:block;margin:10px auto 0;background:#7C3AED;border:none;color:#fff;padding:12px 24px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;cursor:pointer';
    const again = e => { e.preventDefault(); score=0;coins=0;vel=4;obstaculos=[];monedas=[];carril=1;jugando=true;gameover_called=false; setText('runScore','0');setText('runCoins','0'); loop(); };
    btn.addEventListener('touchstart', again, {passive:false});
    btn.addEventListener('click', again);
    cv.parentElement.appendChild(btn);
  }
  loop();
}

// ══════════════════════════════════════════════════════════
//  🎯 FUSIÓN (merge tipo 2048 con emojis)
// ══════════════════════════════════════════════════════════
if (typeof buildRunner === "function") window.buildRunner = buildRunner;
