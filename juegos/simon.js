function buildSimon(container) {
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:20px">
      <div style="text-align:center">
        <div style="display:flex;gap:24px;justify-content:center;font-weight:800;margin-bottom:16px;color:#fff">
          <span>🎵 Nivel: <span id="simLevel" style="color:var(--accent)">0</span></span>
          <span>⭐ Best: <span id="simBest">0</span></span>
        </div>
        <div id="simBoard" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px;margin:0 auto">
          <div class="sim-btn" data-c="0" style="aspect-ratio:1;background:#1a8c3a;border-radius:20px 0 0 0;cursor:pointer;opacity:0.5;transition:opacity 0.2s"></div>
          <div class="sim-btn" data-c="1" style="aspect-ratio:1;background:#c41e3a;border-radius:0 20px 0 0;cursor:pointer;opacity:0.5;transition:opacity 0.2s"></div>
          <div class="sim-btn" data-c="2" style="aspect-ratio:1;background:#1e63c4;border-radius:0 0 0 20px;cursor:pointer;opacity:0.5;transition:opacity 0.2s"></div>
          <div class="sim-btn" data-c="3" style="aspect-ratio:1;background:#e6b800;border-radius:0 0 20px 0;cursor:pointer;opacity:0.5;transition:opacity 0.2s"></div>
        </div>
        <div id="simStatus" style="margin-top:16px;font-weight:700;color:#fff;min-height:24px">Pulsa Iniciar</div>
        <button onclick="window.simStart()" style="margin-top:12px;background:#7C3AED;border:none;color:white;padding:10px 28px;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem">▶ Iniciar</button>
      </div>
    </div>
    <div class="game-instructions"><strong>Cómo jugar:</strong> Observa la secuencia de colores y repítela en el mismo orden. ¡Cada nivel agrega un color más!</div>`;
  const MEMORY_POWERUPS = {
    hint: {emoji:'💡', effect:'muestra una pista'}
  };
  let seq=[], playerSeq=[], level=0, best=getRecord('simon'), accepting=false;
  setTimeout(()=>setText('simBest',best),0);
  const btns=[...document.querySelectorAll('.sim-btn')];
  btns.forEach(b=>b.onclick=()=>press(parseInt(b.dataset.c)));
  function flash(c){ const b=btns[c]; if(!b) return; b.style.opacity='1'; registerInterval(setTimeout(()=>{ if(b) b.style.opacity='0.5'; },350)); }
  function playSeq(){
    accepting=false; setText('simStatus','Observa...');
    seq.forEach((c,i)=>registerInterval(setTimeout(()=>flash(c), (i+1)*650)));
    registerInterval(setTimeout(()=>{ accepting=true; setText('simStatus','¡Tu turno!'); }, (seq.length+1)*650));
  }
  function next(){ level++; setText('simLevel',level); seq.push(Math.floor(Math.random()*4)); playerSeq=[]; playSeq(); }
  function press(c){
    if (window.HK_PAUSED || !accepting) return;
    flash(c); playerSeq.push(c);
    const idx=playerSeq.length-1;
    if(playerSeq[idx]!==seq[idx]){ accepting=false; best=saveRecord('simon',level); setText('simBest',best); setText('simStatus','💀 ¡Fallaste! Nivel '+level); SFX.lose(); showToast('💀 Game Over! Nivel '+level); return; }
    if(playerSeq.length===seq.length){ accepting=false; setText('simStatus','✅ ¡Bien!'); registerInterval(setTimeout(next,800)); }
  }
  window.simStart = function(){ seq=[]; level=0; setText('simLevel',0); next(); };
}

// ═══════════════════════════════════════════
//  GAME 13: 2048
// ═══════════════════════════════════════════
