function buildTreasure(container) {
  const SIZE=10, CELL=Math.min(34, Math.floor((Math.min(window.innerWidth-60, maxGameHeight()-30))/SIZE));
  const W=SIZE*CELL, H=SIZE*CELL;
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;color:#fff">
        <span style="font-weight:800">💎 <span id="trScore">0</span>/<span id="trTotal">8</span></span>
        <span style="font-weight:800">🏆 Nivel <span id="trLevel">1</span></span>
        <button onclick="window.trReset()" style="background:#7C3AED;border:none;color:white;padding:6px 12px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Nuevo</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px"><canvas id="trGame" width="${W}" height="${H}"></canvas></div>
    </div>
    <div class="game-instructions"><strong>Misión:</strong> Mueve a 🧒 con las flechas y recoge todos los 💎. ¡Cuidado, no pises las 🔥! Cada nivel hay más fuego.</div>`;
  const canvas=document.getElementById('trGame'), ctx=canvas.getContext('2d');
  let player, gems, fires, score, total, level, running;
  function buildMap(){
    player={x:0,y:0}; gems=[]; fires=[]; score=0;
    const used=new Set(['0,0']);
    total=8;
    while(gems.length<total){ const x=Math.floor(Math.random()*SIZE),y=Math.floor(Math.random()*SIZE); const k=x+','+y; if(!used.has(k)){used.add(k);gems.push({x,y});} }
    const nFires=Math.min(SIZE*SIZE-total-2, 4+level*2); // más fuego cada nivel
    let nf=0, tries=0; while(nf<nFires && tries<500){ tries++; const x=Math.floor(Math.random()*SIZE),y=Math.floor(Math.random()*SIZE); const k=x+','+y; if(!used.has(k)){used.add(k);fires.push({x,y});nf++;} }
    setText('trScore',0); setText('trTotal',total); setText('trLevel',level);
    running=true; draw();
  }
  function reset(){ level=1; buildMap(); }
  function move(dir){
    if(!running) return;
    const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir]; if(!d) return;
    const nx=player.x+d[0], ny=player.y+d[1];
    if(nx<0||nx>=SIZE||ny<0||ny>=SIZE) return;
    player.x=nx; player.y=ny;
    if(fires.some(f=>f.x===nx&&f.y===ny)){ running=false; SFX.lose(); showToast('🔥 ¡Te quemaste! Inténtalo de nuevo'); setTimeout(reset,600); return; }
    const gi=gems.findIndex(g=>g.x===nx&&g.y===ny);
    if(gi>=0){ gems.splice(gi,1); score++; setText('trScore',score); SFX.coin();
      if(score>=total){ running=false; level++; if(level>=3) awardBadge('collector'); awardBadge('first_win'); showLevelScreen(level, buildMap, '¡Más fuego que esquivar!'); } }
    draw();
  }
  function draw(){
    if(!document.getElementById('trGame')) return;
    ctx.fillStyle='#1a2e1a'; ctx.fillRect(0,0,W,H);
    for(let i=0;i<=SIZE;i++){ ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(W,i*CELL); ctx.stroke(); }
    ctx.font=`${CELL-6}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    fires.forEach(f=>ctx.fillText('🔥',f.x*CELL+CELL/2,f.y*CELL+CELL/2));
    gems.forEach(g=>ctx.fillText('💎',g.x*CELL+CELL/2,g.y*CELL+CELL/2));
    ctx.fillText('🧒',player.x*CELL+CELL/2,player.y*CELL+CELL/2);
  }
  function keyHandler(e){ const k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key]; if(k){move(k);e.preventDefault();} }
  document.addEventListener('keydown',keyHandler); window.activeKeyHandlers.push(keyHandler);
  window.trReset=reset;
  container.querySelector('.game-container').appendChild(makeDPad(move));
  reset();
}

// ═══════════════════════════════════════════
//  GAME 17: SÚPER SALTO (plataformas/esquivar)
// ═══════════════════════════════════════════
if (typeof buildTreasure === "function") window.buildTreasure = buildTreasure;
