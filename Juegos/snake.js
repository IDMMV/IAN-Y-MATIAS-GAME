function buildSnake(container) {
  const W = Math.min(400, window.innerWidth - 60, maxGameHeight());
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;font-size:1rem;color:#fff">🐍 Score: <span id="snakeScore">0</span></span>
        <span style="font-weight:800;font-size:1rem;color:#fff">⭐ Best: <span id="snakeBest">0</span></span>
        <button onclick="window.snakeReset()" style="background:#7C3AED;border:none;color:white;padding:6px 14px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Reiniciar</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${W}px">
        <canvas id="snakeGame" width="${W}" height="${W}"></canvas>
      </div>
    </div>
    <div class="game-instructions">
      <strong>Controles:</strong> Flechas o WASD · En móvil: desliza la pantalla · Come 🍎 para crecer.
    </div>`;
  const canvas = document.getElementById('snakeGame');
  const ctx = canvas.getContext('2d');
  const SNAKE_POWERUPS = {
    shield: {emoji:'🛡️', effect:'te protege de 1 colisión'},
    speed: {emoji:'⚡', effect:'velocidad extra'}
  };
  const CELL = Math.floor(W / 20);
  const COLS = Math.floor(W / CELL), ROWS = Math.floor(W / CELL);
  let snake, dir, food, score, best = getRecord('snake'), running, speed, loopId;

  function reset() {
    snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir = {x:1,y:0}; score = 0; speed = 150;
    setText('snakeScore', 0);
    setText('snakeBest', best);
    placeFood();
    if (loopId) clearInterval(loopId);
    running = true;
    loopId = registerInterval(setInterval(tick, speed));
  }
  function placeFood() {
    let pos;
    do { pos = {x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS)}; }
    while (snake.some(s=>s.x===pos.x&&s.y===pos.y));
    food = pos;
  }
  function tick() {
    if (window.HK_PAUSED) return;
    if (!running || !document.getElementById('snakeGame')) return;
    const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      running = false; clearInterval(loopId);
      best = saveRecord('snake', score); setText('snakeBest', best);
      if(score>=20) awardBadge('snake_pro');
      SFX.lose();
      draw(); showToast('💀 Game Over! Score: ' + score); return;
    }
    snake.unshift(head);
    if (head.x===food.x&&head.y===food.y) {
      score++; setText('snakeScore', score); SFX.pick();
      if (score > best) { best = score; setText('snakeBest', best); }
      placeFood(); speed = Math.max(60, speed - 2);
      clearInterval(loopId); loopId = registerInterval(setInterval(tick, speed));
    } else snake.pop();
    draw();
  }
  function draw() {
    ctx.fillStyle = '#0a0a14'; ctx.fillRect(0,0,W,W);
    ctx.font = `${CELL-2}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🍎', food.x*CELL+CELL/2, food.y*CELL+CELL/2);
    snake.forEach((s,i) => {
      ctx.fillStyle = i===0 ? '#7C3AED' : `hsl(${280-i*4},70%,${62-i*1.5}%)`;
      ctx.beginPath(); ctx.roundRect(s.x*CELL+1,s.y*CELL+1,CELL-2,CELL-2,4); ctx.fill();
    });
    if (!running) {
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,W);
      ctx.fillStyle='white'; ctx.font='bold 26px Fredoka One,cursive'; ctx.textAlign='center';
      ctx.fillText('💀 GAME OVER', W/2, W/2-20);
      ctx.font='15px Nunito,sans-serif'; ctx.fillText('Score: '+score, W/2, W/2+14);
    }
  }
  let touchStart = null;
  canvas.addEventListener('touchstart', e => { touchStart = {x:e.touches[0].clientX, y:e.touches[0].clientY}; e.preventDefault(); }, {passive:false});
  canvas.addEventListener('touchend', e => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) { if (dx>0&&dir.x!=-1) dir={x:1,y:0}; else if (dx<0&&dir.x!=1) dir={x:-1,y:0}; }
    else { if (dy>0&&dir.y!=-1) dir={x:0,y:1}; else if (dy<0&&dir.y!=1) dir={x:0,y:-1}; }
    touchStart = null; e.preventDefault();
  }, {passive:false});
  function keyHandler(e) {
    const map = {ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},
                 w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};
    const nd = map[e.key];
    if (nd && !(nd.x===-dir.x&&nd.y===-dir.y)) { dir=nd; e.preventDefault(); }
  }
  document.addEventListener('keydown', keyHandler);
  window.activeKeyHandlers.push(keyHandler);
  window.snakeReset = reset;
  function snakeDir(d) {
    const map = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    const nd = map[d];
    if (nd && !(nd.x===-dir.x&&nd.y===-dir.y)) dir=nd;
  }
  container.querySelector('.game-container').appendChild(makeDPad(snakeDir));
  reset(); draw();
}

// ═══════════════════════════════════════════
//  GAME 2: BREAKOUT
// ═══════════════════════════════════════════
