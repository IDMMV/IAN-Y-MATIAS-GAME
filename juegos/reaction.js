function buildReaction(container) {
  const j1=localP1(), j2=localP2();
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:0;overflow:hidden">
      <div id="reactInfo" style="text-align:center;padding:14px;color:#fff;font-weight:800;font-size:1.05rem">Pulsa ▶ Iniciar ronda. Cuando el centro se ponga 🟢 VERDE, ¡pulsa tu botón!</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <button id="p1btn" style="background:#00B4D8;border:none;color:white;padding:38px;font-family:Fredoka One,cursive;font-size:1.3rem;cursor:pointer;-webkit-tap-highlight-color:transparent">${j1.emoji} ${j1.name}</button>
        <div id="reactLight" style="text-align:center;padding:24px;font-family:Fredoka One,cursive;font-size:1.6rem;color:#fff;background:#c41e3a">🔴 ESPERA...</div>
        <button id="p2btn" style="background:#FF4D9D;border:none;color:white;padding:38px;font-family:Fredoka One,cursive;font-size:1.3rem;cursor:pointer;-webkit-tap-highlight-color:transparent">${j2.emoji} ${j2.name}</button>
      </div>
      <div style="display:flex;justify-content:space-around;align-items:center;padding:14px;color:#fff;font-weight:800">
        <span>${j1.emoji} ${j1.name}: <span id="r1score">0</span></span>
        <button id="reactStartBtn" style="background:#7C3AED;border:none;color:white;padding:10px 24px;border-radius:18px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800">▶ Iniciar ronda</button>
        <span>${j2.emoji} ${j2.name}: <span id="r2score">0</span></span>
      </div>
    </div>
    <div class="game-instructions"><strong>${j1.emoji} ${j1.name} vs ${j2.emoji} ${j2.name}:</strong> Pulsa "Iniciar ronda". Espera a que el centro se ponga verde 🟢 y pulsa tu botón antes que tu rival. ¡Si pulsas antes de tiempo, pierdes! Primero en 5 gana.</div>`;
  let s1=0,s2=0,state='idle',greenT;
  const light=()=>document.getElementById('reactLight');
  function startRound(){
    if(state==='ready') return; // ya en curso
    state='ready'; const l=light(); if(l){ l.style.background='#c41e3a'; l.textContent='🔴 ESPERA...'; }
    setText('reactInfo','¡Prepárense! 👀 Esperen el verde...');
    if(greenT) clearTimeout(greenT);
    greenT=registerInterval(setTimeout(()=>{
      state='go'; const l2=light();
      if(l2){ l2.style.background='#1a8c3a'; l2.textContent='🟢 ¡YA! PULSA'; }
    }, 1500+Math.random()*2500));
  }
  function nombreDe(p){ return p===1 ? j1.name : j2.name; }
  function press(p){
    if(state==='idle'){ setText('reactInfo','Primero pulsa ▶ Iniciar ronda'); return; }
    if(state==='ready'){ // se adelantó
      const l=light(); if(l){ l.style.background='#e6b800'; l.textContent=`❌ ¡${nombreDe(p)} se adelantó!`; }
      if(greenT) clearTimeout(greenT);
      state='idle'; award(p===1?2:1); return;
    }
    if(state==='go'){
      const l=light(); if(l){ l.style.background='#7C3AED'; l.textContent=`🏆 ¡${nombreDe(p)} gana la ronda!`; }
      state='idle'; award(p);
    }
  }
  function award(p){
    if(p===1){ s1++; setText('r1score',s1); } else { s2++; setText('r2score',s2); }
    if(s1>=5||s2>=5){
      const w=s1>=5?1:2;
      setText('reactInfo',`🎉 ¡${nombreDe(w)} GANA EL DUELO!`); celebrate(); showToast(`🎉 ¡${nombreDe(w)} gana!`);
      s1=0;s2=0; setText('r1score',0); setText('r2score',0);
    } else setText('reactInfo','Pulsa ▶ Iniciar ronda para seguir');
  }
  // Conectar botones con touch + click robusto
  function bind(id, fn){
    const el=document.getElementById(id); if(!el) return;
    let handled=false;
    const h=e=>{ e.preventDefault(); e.stopPropagation(); if(handled)return; handled=true; setTimeout(()=>handled=false,120); fn(); };
    el.addEventListener('touchstart',h,{passive:false});
    el.addEventListener('click',h);
  }
  bind('p1btn',()=>press(1));
  bind('p2btn',()=>press(2));
  bind('reactStartBtn',startRound);
}

// ═══════════════════════════════════════════
//  GAME 16: CAZA TESOROS (recolectar)
// ═══════════════════════════════════════════
if (typeof buildReaction === "function") window.buildReaction = buildReaction;
