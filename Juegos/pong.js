function buildPong(container) {
  const W=Math.min(400,window.innerWidth-60), H=Math.round(W*0.6);
  const j1=localP1(), j2=localP2();
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;color:var(--puzzle)">${j1.emoji} ${j1.name} (W/S): <span id="p1score">0</span></span>
        <button onclick="window.pongReset()" style="background:#7C3AED;border:none;color:white;padding:6px 14px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Reiniciar</button>
        <span style="font-weight:800;color:var(--secondary)"><span id="p2score">0</span> :${j2.emoji} ${j2.name} (↑/↓)</span>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px"><canvas id="pongGame" width="${W}" height="${H}"></canvas></div>
    </div>
    <div class="game-instructions"><strong>${j1.emoji} ${j1.name}:</strong> W/S &nbsp;|&nbsp; <strong>${j2.emoji} ${j2.name}:</strong> ↑/↓ · ¡Primero en 7 gana!</div>`;
  const canvas=document.getElementById('pongGame');
  const ctx=canvas.getContext('2d');
  const PH=60,PW=10,BR=8;
  let ball,p1,p2,s1,s2,animId,keys={};
  function reset(){
    p1={x:10,y:H/2-PH/2}; p2={x:W-20,y:H/2-PH/2};
    ball={x:W/2,y:H/2,vx:(Math.random()>0.5?3:-3),vy:(Math.random()*4-2)};
    s1=0;s2=0; setText('p1score',0); setText('p2score',0);
    if(animId) cancelAnimationFrame(animId); loop();
  }
  function loop(){
    if(!document.getElementById('pongGame')) return;
    if(keys['w']) p1.y=Math.max(0,p1.y-5);
    if(keys['s']) p1.y=Math.min(H-PH,p1.y+5);
    if(keys['ArrowUp']) p2.y=Math.max(0,p2.y-5);
    if(keys['ArrowDown']) p2.y=Math.min(H-PH,p2.y+5);
    ball.x+=ball.vx; ball.y+=ball.vy;
    if(ball.y-BR<0||ball.y+BR>H) ball.vy*=-1;
    if(ball.x-BR<p1.x+PW&&ball.y>p1.y&&ball.y<p1.y+PH&&ball.vx<0){ ball.vx=Math.abs(ball.vx)*1.05; ball.vy=((ball.y-(p1.y+PH/2))/(PH/2))*5; }
    if(ball.x+BR>p2.x&&ball.y>p2.y&&ball.y<p2.y+PH&&ball.vx>0){ ball.vx=-Math.abs(ball.vx)*1.05; ball.vy=((ball.y-(p2.y+PH/2))/(PH/2))*5; }
    if(ball.x<0){ s2++; setText('p2score',s2); ball={x:W/2,y:H/2,vx:-3,vy:Math.random()*4-2}; }
    if(ball.x>W){ s1++; setText('p1score',s1); ball={x:W/2,y:H/2,vx:3,vy:Math.random()*4-2}; }
    if(s1>=7||s2>=7){ awardBadge('first_win'); celebrate(); showToast(s1>=7?('🎉 ¡'+j1.name+' gana!'):('🎉 ¡'+j2.name+' gana!')); reset(); return; }
    draw();
    animId=registerAnimation(requestAnimationFrame(loop));
  }
  function draw(){
    ctx.fillStyle='#0a0a14'; ctx.fillRect(0,0,W,H);
    ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#00B4D8'; ctx.beginPath(); ctx.roundRect(p1.x,p1.y,PW,PH,4); ctx.fill();
    ctx.fillStyle='#FF4D9D'; ctx.beginPath(); ctx.roundRect(p2.x,p2.y,PW,PH,4); ctx.fill();
    ctx.fillStyle='#FFD600'; ctx.beginPath(); ctx.arc(ball.x,ball.y,BR,0,Math.PI*2); ctx.fill();
  }
  function kd(e){keys[e.key]=true; if(e.key==='ArrowUp'||e.key==='ArrowDown')e.preventDefault();}
  function ku(e){keys[e.key]=false;}
  document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
  window.activeKeyHandlers.push(kd,ku);
  window.pongReset = reset;
  // Controles táctiles para 2 jugadores (J1 izquierda azul, J2 derecha rosa)
  const pad = document.createElement('div');
  pad.className = 'touch-controls';
  pad.style.flexDirection = 'row';
  pad.style.justifyContent = 'space-between';
  pad.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
      <div style="color:#00B4D8;font-weight:800;font-size:0.8rem">J1</div>
      <button class="tbtn" data-p="w-up" style="background:linear-gradient(135deg,#00B4D8,#0077B6);box-shadow:0 4px 0 #005577">▲</button>
      <button class="tbtn" data-p="w-down" style="background:linear-gradient(135deg,#00B4D8,#0077B6);box-shadow:0 4px 0 #005577">▼</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
      <div style="color:#FF4D9D;font-weight:800;font-size:0.8rem">J2</div>
      <button class="tbtn" data-p="a-up" style="background:linear-gradient(135deg,#FF4D9D,#C9184A);box-shadow:0 4px 0 #8B0030">▲</button>
      <button class="tbtn" data-p="a-down" style="background:linear-gradient(135deg,#FF4D9D,#C9184A);box-shadow:0 4px 0 #8B0030">▼</button>
    </div>`;
  const keyMap = { 'w-up':'w', 'w-down':'s', 'a-up':'ArrowUp', 'a-down':'ArrowDown' };
  pad.querySelectorAll('button[data-p]').forEach(btn => {
    const k = keyMap[btn.dataset.p];
    const down = e => { e.preventDefault(); e.stopPropagation(); keys[k]=true; };
    const up = e => { e.preventDefault(); e.stopPropagation(); keys[k]=false; };
    btn.addEventListener('touchstart', down, {passive:false});
    btn.addEventListener('touchend', up, {passive:false});
    btn.addEventListener('touchcancel', up, {passive:false});
    btn.addEventListener('mousedown', down);
    btn.addEventListener('mouseup', up);
    btn.addEventListener('mouseleave', up);
  });
  container.querySelector('.game-container').appendChild(pad);
  reset();
}

// ═══════════════════════════════════════════
//  GAME 8: TIC-TAC-TOE
// ═══════════════════════════════════════════
