function buildBreakout(container) {
  const W = Math.min(400, window.innerWidth - 60);
  const H = Math.round(W * 0.7);
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;color:#fff">🧱 <span id="boScore">0</span></span>
        <span style="font-weight:800;color:#fff">🏆 Nivel <span id="boLevel">1</span></span>
        <span style="font-weight:800;color:#fff">❤️ <span id="boLives">3</span></span>
        <button onclick="window.boReset()" style="background:#7C3AED;border:none;color:white;padding:6px 12px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Reiniciar</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px">
        <canvas id="breakoutGame" width="${W}" height="${H}"></canvas>
      </div>
    </div>
    <div class="game-instructions"><strong>Controles:</strong> ← → o A/D · Móvil: toca/arrastra · ¡Rompe todos los ladrillos para subir de nivel!</div>`;
  const canvas = document.getElementById('breakoutGame');
  const ctx = canvas.getContext('2d');
  let score=0, lives=3, bricks=[], ball, paddle, animId, running=true, level=1;
  const pW=80, pH=10, bR=8, bW=(W-40)/8-4, bH=18;
  const COLORS=['#FF4D9D','#7C3AED','#00B4D8','#FFD600','#00D68F','#FF6B00'];
  let keys={};
  function makeBricks() {
    bricks = [];
    const rows = Math.min(8, 4 + level); // más filas cada nivel
    for (let r=0;r<rows;r++) for (let c=0;c<8;c++)
      bricks.push({x:20+c*(bW+4),y:40+r*(bH+6),w:bW,h:bH,alive:true,color:COLORS[r%COLORS.length],pts:10*(rows-r)});
  }
  function newBall() {
    const sp = 4 + level * 0.6; // más rápido cada nivel
    ball = {x:W/2,y:H-60,vx:(Math.random()>0.5?1:-1)*(sp*0.7),vy:-sp,r:bR};
  }
  function reset() {
    score=0; lives=3; running=true; level=1;
    setText('boScore',0); setText('boLives',3); setText('boLevel',1);
    newBall();
    paddle = {x:W/2-pW/2,y:H-30,w:pW,h:pH,speed:7};
    makeBricks();
    if (animId) cancelAnimationFrame(animId);
    loop();
  }
  function nextLevel() {
    running=false; level++;
    setText('boLevel',level);
    if(level>=3) awardBadge('brick_boss');
    awardBadge('first_win');
    showLevelScreen(level, () => {
      newBall(); makeBricks(); running=true;
    }, '¡Más ladrillos y más rápido!');
  }
  function kd(e){ keys[e.key]=true; } function ku(e){ keys[e.key]=false; }
  document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
  window.activeKeyHandlers.push(kd, ku);
  function movePaddle(clientX){ const tx=clientX-canvas.getBoundingClientRect().left; paddle.x=Math.max(0,Math.min(W-paddle.w,tx-paddle.w/2)); }
  canvas.addEventListener('touchstart', e=>{ movePaddle(e.touches[0].clientX); e.preventDefault(); },{passive:false});
  canvas.addEventListener('touchmove', e=>{ movePaddle(e.touches[0].clientX); e.preventDefault(); },{passive:false});
  function loop() {
    if (!document.getElementById('breakoutGame')) return;
    if (running) update();
    draw();
    animId = registerAnimation(requestAnimationFrame(loop));
  }
  function update() {
    if (window.HK_PAUSED) return;
    if (keys['ArrowLeft']||keys['a']) paddle.x = Math.max(0, paddle.x-paddle.speed);
    if (keys['ArrowRight']||keys['d']) paddle.x = Math.min(W-paddle.w, paddle.x+paddle.speed);
    ball.x += ball.vx; ball.y += ball.vy;
    if (ball.x-ball.r<0||ball.x+ball.r>W) ball.vx*=-1;
    if (ball.y-ball.r<0) ball.vy*=-1;
    if (ball.y+ball.r>H) {
      lives--; setText('boLives',lives);
      if (lives<=0) { running=false; SFX.lose(); showToast('💀 Game Over! Score: '+score); return; }
      newBall();
    }
    if (ball.y+ball.r>paddle.y&&ball.y-ball.r<paddle.y+paddle.h&&ball.x>paddle.x&&ball.x<paddle.x+paddle.w) {
      ball.vy=-Math.abs(ball.vy); ball.vx += ((ball.x-(paddle.x+paddle.w/2))/paddle.w)*4;
    }
    bricks.forEach(b => {
      if (!b.alive) return;
      if (ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h) {
        b.alive=false; ball.vy*=-1; score+=b.pts; setText('boScore',score); SFX.pop();
      }
    });
    if (bricks.every(b=>!b.alive)) { nextLevel(); }
  }
  function draw() {
    ctx.fillStyle='#0a0a14'; ctx.fillRect(0,0,W,H);
    bricks.forEach(b => { if (!b.alive) return; ctx.fillStyle=b.color; ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,b.h,4); ctx.fill(); });
    const grad = ctx.createLinearGradient(paddle.x,0,paddle.x+paddle.w,0);
    grad.addColorStop(0,'#7C3AED'); grad.addColorStop(1,'#FF4D9D');
    ctx.fillStyle=grad; ctx.beginPath(); ctx.roundRect(paddle.x,paddle.y,paddle.w,paddle.h,5); ctx.fill();
    ctx.fillStyle='#FFD600'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
    if (!running) { ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='white'; ctx.font='bold 22px Fredoka One,cursive'; ctx.textAlign='center'; ctx.fillText('Score: '+score, W/2, H/2); }
  }
  window.boReset = reset;
  container.querySelector('.game-container').appendChild(makeLeftRight((dir, pressed) => {
    if (dir === 'left') keys['ArrowLeft'] = pressed;
    else keys['ArrowRight'] = pressed;
  }));
  reset();
}

// ═══════════════════════════════════════════
//  GAME 3: WHACK-A-MOLE
// ═══════════════════════════════════════════
if (typeof buildBreakout === "function") window.buildBreakout = buildBreakout;
