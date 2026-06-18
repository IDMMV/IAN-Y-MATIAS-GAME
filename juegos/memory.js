function buildMemory(container) {
  const emojis = ['🦊','🐸','🦋','🐬','🦁','🐼','🦄','🐙'];
  let cards=[], flipped=[], moves=0, matched=0, locked=false, timer=0, timerInt;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14">
      <div class="memory-grid-container">
        <div class="memory-info">
          <span style="color:#fff">🃏 Movs: <span id="memMoves">0</span></span>
          <span style="color:#fff">⏱️ <span id="memTimer">0</span>s</span>
          <span style="color:#fff">✅ <span id="memMatched">0</span>/8</span>
        </div>
        <div class="memory-grid" id="memGrid"></div>
        <div style="text-align:center;margin-top:16px">
          <button onclick="window.memReset()" style="background:#7C3AED;border:none;color:white;padding:8px 22px;border-radius:16px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800">🔄 Nueva partida</button>
        </div>
      </div>
    </div>
    <div class="game-instructions"><strong>Objetivo:</strong> Encuentra todos los pares iguales. ¡Menos movimientos, mejor!</div>`;
  function reset() {
    if (timerInt) clearInterval(timerInt);
    timer=0; moves=0; matched=0; locked=false; flipped=[];
    setText('memMoves',0); setText('memTimer',0); setText('memMatched',0);
    const doubled=[...emojis,...emojis].sort(()=>Math.random()-0.5);
    const grid=document.getElementById('memGrid'); if(!grid) return; grid.innerHTML='';
    cards=doubled.map((e,i)=>{
      const d=document.createElement('div'); d.className='mem-card';
      d.innerHTML=`<span class="card-front">❓</span><span class="card-back">${e}</span>`;
      d.onclick=()=>flip(d,i);
      grid.appendChild(d); return {el:d,emoji:e};
    });
    timerInt=registerInterval(setInterval(()=>{ if (window.HK_PAUSED) return; timer++; setText('memTimer',timer); },1000));
  }
  function flip(el, idx) {
    if(locked||el.classList.contains('flipped')||el.classList.contains('matched')) return;
    el.classList.add('flipped'); flipped.push(idx);
    if(flipped.length===2){
      locked=true; moves++; setText('memMoves',moves);
      const [a,b]=flipped.map(i=>cards[i]);
      if(a.emoji===b.emoji){
        a.el.classList.add('matched'); b.el.classList.add('matched');
        matched++; setText('memMatched',matched); SFX.pick();
        if(matched===8){ clearInterval(timerInt); celebrate(); setTimeout(()=>showToast(`🎉 ¡Completado en ${moves} movs y ${timer}s!`),400); }
        flipped=[]; locked=false;
      } else {
        setTimeout(()=>{ a.el.classList.remove('flipped'); b.el.classList.remove('flipped'); flipped=[]; locked=false; },1000);
      }
    }
  }
  window.memReset = reset;
  reset();
}

// ═══════════════════════════════════════════
//  GAME 5: MAZE ESCAPE
// ═══════════════════════════════════════════
