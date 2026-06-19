function buildFlappy(container) {
  let W=Math.min(360,window.innerWidth-60), H=Math.round(W*1.2);
  if (H > maxGameHeight()) { H = maxGameHeight(); W = Math.round(H/1.2); }
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;color:#fff">🐤 Score: <span id="flapScore">0</span></span>
        <span style="font-weight:800;color:#fff">⭐ Best: <span id="flapBest">0</span></span>
        <button onclick="window.flapReset()" style="background:#7C3AED;border:none;color:white;padding:6px 14px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Reiniciar</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px"><canvas id="flappyGame" width="${W}" height="${H}"></canvas></div>
    </div>
    <div class="game-instructions"><strong>Controles:</strong> Toca la pantalla o ESPACIO/clic para volar · ¡Pasa entre los tubos!</div>`;
  const canvas=document.getElementById('flappyGame');
  const ctx=canvas.getContext('2d');
  let bird,pipes,score,best=getRecord('flappy'),running,animId;
  setTimeout(()=>setText('flapBest',best),0);
  const GAP=130, PIPE_W=50, GRAV=0.4, FLAP=-7;
  function reset(){
    bird={y:H/2,vy:0,x:W*0.25}; pipes=[]; score=0; running=true;
    setText('flapScore',0);
    for(let i=0;i<3;i++) pipes.push({x:W+i*200,top:60+Math.random()*(H-GAP-120),passed:false});
    if(animId) cancelAnimationFrame(animId); loop();
  }
  function flap(){ if(running){ bird.vy=FLAP; SFX.jump(); } else reset(); }
  function loop(){
    if(!document.getElementById('flappyGame')) return;
    if(running) update();
    draw();
    animId=registerAnimation(requestAnimationFrame(loop));
  }
  function update(){
    if (window.HK_PAUSED) return;
        bird.vy+=GRAV; bird.y+=bird.vy;
    if(bird.y>H-12||bird.y<12){ running=false; end(); return; }
    pipes.forEach(p=>{
      p.x-=2.5;
      if(!p.passed&&p.x+PIPE_W<bird.x){ p.passed=true; score++; setText('flapScore',score); SFX.point(); }
      if(bird.x+12>p.x&&bird.x-12<p.x+PIPE_W&&(bird.y-12<p.top||bird.y+12>p.top+GAP)){ running=false; end(); }
    });
    if(pipes[0].x<-PIPE_W){ pipes.shift(); pipes.push({x:pipes[pipes.length-1].x+200,top:60+Math.random()*(H-GAP-120),passed:false}); }
  }
  function end(){ best=saveRecord('flappy',score); setText('flapBest',best); SFX.lose(); showToast('💀 Game Over! Score: '+score); }
  function draw(){
    const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#4EC0CA'); sky.addColorStop(1,'#8FE3E8');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#5BBF3A';
    pipes.forEach(p=>{ ctx.fillRect(p.x,0,PIPE_W,p.top); ctx.fillRect(p.x,p.top+GAP,PIPE_W,H-p.top-GAP); ctx.fillStyle='#4A9E2E'; ctx.fillRect(p.x-3,p.top-20,PIPE_W+6,20); ctx.fillRect(p.x-3,p.top+GAP,PIPE_W+6,20); ctx.fillStyle='#5BBF3A'; });
    ctx.font='26px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.save(); ctx.translate(bird.x,bird.y); ctx.rotate(Math.min(Math.max(bird.vy*0.05,-0.4),0.6)); ctx.fillText('🐤',0,0); ctx.restore();
    if(!running){ ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.font='bold 22px Fredoka One,cursive'; ctx.fillText('Toca para volar',W/2,H/2); }
  }
  canvas.addEventListener('touchstart',e=>{flap();e.preventDefault();},{passive:false});
  canvas.addEventListener('mousedown',flap);
  function keyHandler(e){ if(e.key===' '){ flap(); e.preventDefault(); } }
  document.addEventListener('keydown',keyHandler);
  window.activeKeyHandlers.push(keyHandler);
  window.flapReset = reset;
  container.querySelector('.game-container').appendChild(makeActionButton('🐤 VOLAR', flap));
  reset();
}

// ═══════════════════════════════════════════
//  GAME 10: ATRAPA FRUTAS (CATCH)
// ═══════════════════════════════════════════
if (typeof buildFlappy === "function") window.buildFlappy = buildFlappy;
