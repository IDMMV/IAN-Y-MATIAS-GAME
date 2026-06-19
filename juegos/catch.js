function buildCatch(container) {
  let W=Math.min(380,window.innerWidth-60), H=Math.round(W*1.1);
  if (H > maxGameHeight()) { H = maxGameHeight(); W = Math.round(H/1.1); }
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;color:#fff">🧺 Score: <span id="catchScore">0</span></span>
        <span style="font-weight:800;color:#fff">❤️ <span id="catchLives">3</span></span>
        <button onclick="window.catchReset()" style="background:#7C3AED;border:none;color:white;padding:6px 14px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Reiniciar</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px"><canvas id="catchGame" width="${W}" height="${H}"></canvas></div>
    </div>
    <div class="game-instructions"><strong>Controles:</strong> ← → o mueve el dedo · Atrapa frutas 🍎🍌🍇, evita las bombas 💣</div>`;
  const canvas=document.getElementById('catchGame');
  const ctx=canvas.getContext('2d');
  let basket,items,score,lives,running,animId,keys={},spawnT=0;
  const FRUITS=['🍎','🍌','🍇','🍊','🍓','🍑'];
  function reset(){
    basket={x:W/2,w:60}; items=[]; score=0; lives=3; running=true; spawnT=0;
    setText('catchScore',0); setText('catchLives',3);
    if(animId) cancelAnimationFrame(animId); loop();
  }
  function loop(){
    if(!document.getElementById('catchGame')) return;
    if(running) update();
    draw();
    animId=registerAnimation(requestAnimationFrame(loop));
  }
  function update(){
    if (window.HK_PAUSED) return;
        if(keys['ArrowLeft']||keys['a']) basket.x=Math.max(basket.w/2,basket.x-6);
    if(keys['ArrowRight']||keys['d']) basket.x=Math.min(W-basket.w/2,basket.x+6);
    spawnT++;
    if(spawnT>40){ spawnT=0; const bomb=Math.random()<0.2; items.push({x:30+Math.random()*(W-60),y:-20,vy:2+Math.random()*2+score*0.02,bomb,e:bomb?'💣':FRUITS[Math.floor(Math.random()*FRUITS.length)]}); }
    items.forEach(it=>it.y+=it.vy);
    items=items.filter(it=>{
      if(it.y>H-50&&it.y<H-10&&Math.abs(it.x-basket.x)<basket.w/2){
        if(it.bomb){ lives--; setText('catchLives',lives); SFX.hit(); if(lives<=0){running=false;SFX.lose();showToast('💀 Game Over! Score: '+score);} }
        else { score++; setText('catchScore',score); SFX.pick(); }
        return false;
      }
      if(it.y>H){ if(!it.bomb){ lives--; setText('catchLives',lives); if(lives<=0){running=false;SFX.lose();showToast('💀 Game Over! Score: '+score);} } return false; }
      return true;
    });
  }
  function draw(){
    const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#FF9A3C'); bg.addColorStop(1,'#FFD600');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    ctx.font='30px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    items.forEach(it=>ctx.fillText(it.e,it.x,it.y));
    ctx.font='40px serif'; ctx.fillText('🧺',basket.x,H-30);
    if(!running){ ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.font='bold 22px Fredoka One,cursive'; ctx.fillText('Score: '+score,W/2,H/2); }
  }
  function kd(e){keys[e.key]=true;} function ku(e){keys[e.key]=false;}
  document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
  window.activeKeyHandlers.push(kd,ku);
  function moveTo(cx){ basket.x=Math.max(basket.w/2,Math.min(W-basket.w/2,cx-canvas.getBoundingClientRect().left)); }
  canvas.addEventListener('touchstart',e=>{moveTo(e.touches[0].clientX);e.preventDefault();},{passive:false});
  canvas.addEventListener('touchmove',e=>{moveTo(e.touches[0].clientX);e.preventDefault();},{passive:false});
  window.catchReset = reset;
  container.querySelector('.game-container').appendChild(makeLeftRight((dir, pressed) => {
    if (dir === 'left') keys['ArrowLeft'] = pressed;
    else keys['ArrowRight'] = pressed;
  }));
  reset();
}

// ═══════════════════════════════════════════
//  GAME 11: SALTA Y SUBE (JUMP)
// ═══════════════════════════════════════════
if (typeof buildCatch === "function") window.buildCatch = buildCatch;
