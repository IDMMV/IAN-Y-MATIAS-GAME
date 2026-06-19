function buildWhack(container) {
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14">
      <div class="whack-container">
        <div class="whack-info">
          <span style="color:#fff">🔨 Score: <span id="wScore" style="color:var(--accent)">0</span></span>
          <span style="color:#fff">⏱️ <span id="wTime" style="color:var(--secondary)">30</span>s</span>
          <span style="color:#fff">⭐ Best: <span id="wBest">0</span></span>
        </div>
        <div class="whack-grid">
          ${[...Array(9)].map((_,i)=>`<div class="mole-hole" id="hole${i}" onclick="window.whackHit(${i})"><span id="mole${i}">🕳️</span></div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:16px">
          <button onclick="window.whackStart()" id="whackBtn" style="background:#7C3AED;border:none;color:white;padding:10px 28px;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem">▶ Iniciar</button>
        </div>
      </div>
    </div>
    <div class="game-instructions"><strong>Cómo jugar:</strong> Toca los topos 🐭 cuando aparezcan. ¡30 segundos!</div>`;
  let score=0,best=getRecord('whack'),timer=30,running=false,tick;
  setText('wBest',best);
  window.whackStart = function() {
    score=0;timer=30;running=true;
    setText('wScore',0); setText('wTime',30);
    const btn=document.getElementById('whackBtn'); if(btn) btn.disabled=true;
    for(let i=0;i<9;i++){const h=document.getElementById(`hole${i}`); if(h){h.classList.remove('active','hit'); setText(`mole${i}`,'🕳️');}}
    tick=registerInterval(setInterval(()=>{
      if (window.HK_PAUSED) return;
      timer--; setText('wTime',timer);
      if(timer<=0){clearInterval(tick);running=false;
        for(let i=0;i<9;i++){const h=document.getElementById(`hole${i}`); if(h){h.classList.remove('active'); setText(`mole${i}`,'🕳️');}}
        best=saveRecord('whack',score); setText('wBest',best);
        const b=document.getElementById('whackBtn'); if(b) b.disabled=false;
        SFX.point(); showToast('🔨 ¡Tiempo! Score: '+score);
      }
    },1000));
    spawn();
  };
  function spawn() {
    if (window.HK_PAUSED || !running || !document.querySelector('.whack-grid')) return;
    const hole = Math.floor(Math.random()*9);
    const el = document.getElementById(`hole${hole}`);
    if(el && !el.classList.contains('active')) {
      el.classList.add('active'); setText(`mole${hole}`,'🐭');
      registerInterval(setTimeout(()=>{ if(el){el.classList.remove('active'); setText(`mole${hole}`,'🕳️');} },900));
    }
    registerInterval(setTimeout(spawn, Math.max(300, 700 - score*8)));
  }
  window.whackHit = function(i) {
    if(!running) return;
    const el=document.getElementById(`hole${i}`);
    if(el && el.classList.contains('active')){
      score++; setText('wScore',score); SFX.pop();
      el.classList.remove('active'); el.classList.add('hit'); setText(`mole${i}`,'💥');
      registerInterval(setTimeout(()=>{ if(el){el.classList.remove('hit'); setText(`mole${i}`,'🕳️');} },300));
    }
  };
}

// ═══════════════════════════════════════════
//  GAME 4: MEMORY FLIP
// ═══════════════════════════════════════════
