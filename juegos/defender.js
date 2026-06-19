function buildDefender(container) {
  let W=Math.min(360,window.innerWidth-60), H=Math.round(W*1.1);
  if(H>maxGameHeight()){ H=maxGameHeight(); W=Math.round(H/1.1); }
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;color:#fff">
        <span style="font-weight:800">⭐ <span id="dfScore">0</span></span>
        <span style="font-weight:800">🌊 Oleada <span id="dfLevel">1</span></span>
        <span style="font-weight:800">❤️ <span id="dfLives">3</span></span>
        <button onclick="window.dfReset()" style="background:#7C3AED;border:none;color:white;padding:6px 12px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Reiniciar</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px"><canvas id="dfGame" width="${W}" height="${H}"></canvas></div>
    </div>
    <div class="game-instructions"><strong>Cómo jugar:</strong> Mueve tu 🚀 con ◀ ▶ y pulsa 🔫 para disparar a los 👾. Cada 10 destruidos pasas de oleada (más rápidos). ¡No dejes que lleguen abajo!</div>`;
  const canvas=document.getElementById('dfGame'), ctx=canvas.getContext('2d');
  let ship, bullets, enemies, score, lives, animId, running, keys={}, shootCooldown=0, level, killsThisWave;
  function reset(){
    ship={x:W/2,y:H-40,w:30}; bullets=[]; enemies=[]; score=0; lives=3; running=true; keys={}; level=1; killsThisWave=0;
    setText('dfScore',0); setText('dfLives',3); setText('dfLevel',1);
    if(animId) cancelAnimationFrame(animId); loop();
  }
  function shoot(){ if(shootCooldown<=0&&running){ bullets.push({x:ship.x,y:ship.y-15}); shootCooldown=12; SFX.shoot(); } }
  function loop(){
    if(!document.getElementById('dfGame')) return;
    if(running){
      if(keys.left) ship.x=Math.max(18,ship.x-5);
      if(keys.right) ship.x=Math.min(W-18,ship.x+5);
      if(shootCooldown>0) shootCooldown--;
      bullets.forEach(b=>b.y-=7); bullets=bullets.filter(b=>b.y>-10);
      const spawnRate = 0.03 + level*0.006;          // más enemigos cada oleada
      const eSpeed = 1 + level*0.4;                   // más rápidos cada oleada
      if(Math.random()<spawnRate) enemies.push({x:20+Math.random()*(W-40),y:-20,vy:eSpeed+Math.random()*0.8});
      enemies.forEach(e=>e.y+=e.vy);
      enemies.forEach(e=>{
        bullets.forEach(b=>{ if(Math.abs(b.x-e.x)<18&&Math.abs(b.y-e.y)<18){ e.dead=true; b.dead=true; score++; killsThisWave++; setText('dfScore',score); SFX.pop();
          if(killsThisWave>=10){ killsThisWave=0; level++; setText('dfLevel',level); if(level>=3) awardBadge('space_hero'); awardBadge('first_win'); running=false; showLevelScreen(level, ()=>{ enemies=[]; bullets=[]; running=true; }, '¡Oleada más rápida!'); } } });
        if(e.y>H-20){ e.dead=true; lives--; setText('dfLives',lives); if(lives<=0){ running=false; SFX.lose(); showToast('👾 ¡Te invadieron! Score: '+score); } }
      });
      bullets=bullets.filter(b=>!b.dead); enemies=enemies.filter(e=>!e.dead);
    }
    draw(); animId=registerAnimation(requestAnimationFrame(loop));
  }
  function draw(){
    ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
    for(let i=0;i<30;i++){ ctx.fillStyle='rgba(255,255,255,0.3)'; const sx=(i*53)%W, sy=(i*97+Date.now()/30)%H; ctx.fillRect(sx,sy,2,2); }
    ctx.font='26px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    enemies.forEach(e=>ctx.fillText('👾',e.x,e.y));
    ctx.fillStyle='#FFD600'; bullets.forEach(b=>{ ctx.fillRect(b.x-2,b.y-8,4,12); });
    ctx.fillText('🚀',ship.x,ship.y);
    if(!running){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.font='bold 22px Fredoka One,cursive'; ctx.fillText('👾 GAME OVER',W/2,H/2-10); ctx.font='14px Nunito,sans-serif'; ctx.fillText('Score: '+score,W/2,H/2+16); }
  }
  function keyHandler(e){ if(e.key==='ArrowLeft'||e.key==='a')keys.left=true; if(e.key==='ArrowRight'||e.key==='d')keys.right=true; if(e.key===' '){shoot();e.preventDefault();} }
  function keyUp(e){ if(e.key==='ArrowLeft'||e.key==='a')keys.left=false; if(e.key==='ArrowRight'||e.key==='d')keys.right=false; }
  document.addEventListener('keydown',keyHandler); document.addEventListener('keyup',keyUp);
  window.activeKeyHandlers.push(keyHandler,keyUp);
  window.dfReset=reset;
  // Controles: izquierda/derecha + botón disparar
  const pad=document.createElement('div'); pad.className='touch-controls'; pad.style.flexDirection='row'; pad.style.justifyContent='center'; pad.style.gap='10px';
  pad.innerHTML=`<button class="tbtn" data-a="left">◀</button><button class="tbtn" data-a="shoot" style="background:linear-gradient(135deg,#FFD600,#FF6B00);box-shadow:0 4px 0 #B34700;font-size:1.4rem">🔫</button><button class="tbtn" data-a="right">▶</button>`;
  pad.querySelectorAll('button').forEach(btn=>{
    const a=btn.dataset.a;
    if(a==='shoot'){ const f=e=>{e.preventDefault();e.stopPropagation();shoot();}; btn.addEventListener('touchstart',f,{passive:false}); btn.addEventListener('click',f); }
    else { const d=e=>{e.preventDefault();e.stopPropagation();keys[a]=true;}; const u=e=>{e.preventDefault();e.stopPropagation();keys[a]=false;};
      btn.addEventListener('touchstart',d,{passive:false}); btn.addEventListener('touchend',u,{passive:false}); btn.addEventListener('touchcancel',u,{passive:false}); btn.addEventListener('mousedown',d); btn.addEventListener('mouseup',u); btn.addEventListener('mouseleave',u); }
  });
  container.querySelector('.game-container').appendChild(pad);
  reset();
}

// ═══════════════════════════════════════════
//  GAME 19: MAZMORRA MÁGICA (explorar/llaves)
// ═══════════════════════════════════════════
if (typeof buildDefender === "function") window.buildDefender = buildDefender;
