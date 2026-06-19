function buildNavalOnline(container) {
  const N=7;
  const FLOTA=[3,2,2,1]; // tamaños de barcos
  let fase, miTablero, disparosMios, disparosRival, miTurno, ctrl, colocando, orient, listo, rivalListo;
  ctrl = crearJuegoOnline({
    container, titulo:'Batalla Naval', emoji:'🚢',
    descripcion:'Hunde todos los barcos del rival',
    colorTema:'linear-gradient(135deg,#0EA5E9,#1e3a8a)',
    onEmpezar: (esAnf) => { empezar(esAnf); },
    onMovimiento: (d) => {
      if(d.tipo==='listo'){ rivalListo=true; if(listo) iniciarBatalla(); }
      else if(d.tipo==='disparo'){ recibirDisparo(d.idx); }
      else if(d.tipo==='resultado'){ marcarResultado(d.idx, d.agua); }
      else if(d.tipo==='reinicio'){ empezar(ctrl.esAnfitrion); }
    }
  });
  if (!ctrl) return;
  function empezar(esAnf){
    fase='colocar'; miTablero=Array(N*N).fill(0); disparosMios=Array(N*N).fill(null); disparosRival=Array(N*N).fill(null);
    colocando=0; orient='h'; listo=false; rivalListo=false; miTurno=esAnf;
    renderColocar();
  }
  function cabe(idx,size,o){
    const r=Math.floor(idx/N), c=idx%N;
    for(let k=0;k<size;k++){ const rr=o==='h'?r:r+k, cc=o==='h'?c+k:c; if(rr>=N||cc>=N) return false; if(miTablero[rr*N+cc]) return false; }
    return true;
  }
  function colocar(idx){
    const size=FLOTA[colocando];
    if(!cabe(idx,size,orient)){ showToast('No cabe ahí'); return; }
    const r=Math.floor(idx/N), c=idx%N;
    for(let k=0;k<size;k++){ const rr=orient==='h'?r:r+k, cc=orient==='h'?c+k:c; miTablero[rr*N+cc]=1; }
    SFX.pick(); colocando++;
    if(colocando>=FLOTA.length){ listo=true; ctrl.enviar({tipo:'listo'}); if(rivalListo) iniciarBatalla(); else renderEsperaListo(); }
    else renderColocar();
  }
  function iniciarBatalla(){ fase='batalla'; renderBatalla(); }
  function recibirDisparo(idx){
    const agua = !miTablero[idx];
    if(!agua) miTablero[idx]=2; // tocado
    disparosRival[idx]=agua?'agua':'tocado';
    ctrl.enviar({tipo:'resultado',idx,agua});
    miTurno=true;
    // ¿perdí?
    if(!quedanBarcos(miTablero)){ ctrl.jugando=false; SFX.lose(); showToast('💀 Hundieron tu flota'); }
    renderBatalla();
  }
  function marcarResultado(idx,agua){
    disparosMios[idx]=agua?'agua':'tocado';
    if(agua){ SFX.click(); miTurno=false; } else { SFX.hit(); /* sigues disparando */ }
    if(!agua && contarTocados(disparosMios)>=FLOTA.reduce((a,b)=>a+b,0)){ ctrl.jugando=false; celebrate(); awardBadge('first_win'); showToast('🎉 ¡Hundiste toda la flota!'); }
    renderBatalla();
  }
  function quedanBarcos(t){ return t.includes(1); }
  function contarTocados(d){ return d.filter(x=>x==='tocado').length; }
  function disparar(idx){
    if(fase!=='batalla'||!miTurno||!ctrl.jugando) return;
    if(disparosMios[idx]) return;
    ctrl.enviar({tipo:'disparo',idx});
    disparosMios[idx]='esperando';
    renderBatalla();
  }
  function gridHTML(arr,tipo){
    let h=`<div style="display:grid;grid-template-columns:repeat(${N},1fr);gap:3px;max-width:280px;margin:0 auto;background:linear-gradient(180deg,#0c4a6e,#082f49);padding:6px;border-radius:10px;border:2px solid #1e3a8a">`;
    for(let i=0;i<N*N;i++){
      let bg='linear-gradient(135deg,#0e7490,#0c4a6e)', txt='', extra='';
      if(tipo==='mio'){
        if(arr[i]===1){bg='linear-gradient(135deg,#64748b,#475569)';txt='🚢';}
        if(arr[i]===2){bg='radial-gradient(circle,#f97316,#dc2626)';txt='💥';}
        if(disparosRival[i]==='agua'){txt='💧';}
      } else {
        if(arr[i]==='agua'){txt='💧';bg='linear-gradient(135deg,#155e75,#0c4a6e)';}
        if(arr[i]==='tocado'){bg='radial-gradient(circle,#f97316,#dc2626)';txt='💥';}
        if(arr[i]==='esperando'){txt='🎯';}
      }
      const clickable = tipo==='enemigo'&&!arr[i]&&miTurno&&fase==='batalla'&&ctrl.jugando;
      if(clickable) extra='box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1);';
      h+=`<div ${clickable?`data-shoot="${i}"`:''} style="aspect-ratio:1;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.85rem;cursor:${clickable?'pointer':'default'};${extra}transition:transform 0.1s">${txt}</div>`;
    }
    return h+'</div>';
  }
  // emoji del barco según tamaño
  function barcoEmoji(size){ return size>=3?'🚢':size===2?'⛵':'🛶'; }
  function renderColocar(){
    const size=FLOTA[colocando];
    let grid=`<div style="display:grid;grid-template-columns:repeat(${N},1fr);gap:3px;max-width:280px;margin:0 auto;background:linear-gradient(180deg,#0c4a6e,#082f49);padding:6px;border-radius:10px;border:2px solid #1e3a8a">`;
    for(let i=0;i<N*N;i++){
      const ocupado=miTablero[i];
      const bg=ocupado?'linear-gradient(135deg,#64748b,#475569)':'linear-gradient(135deg,#0e7490,#0c4a6e)';
      grid+=`<div data-place="${i}" style="aspect-ratio:1;background:${bg};border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.85rem">${ocupado?'🚢':''}</div>`;
    }
    grid+='</div>';
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        ${ctrl.barraJugadores('🚢','🚢')}
        <div style="text-align:center;color:#FFD600;font-weight:800;margin-bottom:6px">${barcoEmoji(size)} Coloca tu barco de ${size} casilla${size>1?'s':''} (${colocando+1}/${FLOTA.length})</div>
        <div style="text-align:center;margin-bottom:8px"><button id="orientBtn" style="background:#7C3AED;border:none;color:#fff;padding:6px 16px;border-radius:14px;font-weight:800;cursor:pointer">↔️ ${orient==='h'?'Horizontal':'Vertical'}</button></div>
        ${grid}
      </div>
      <div class="game-instructions">Toca una casilla para colocar el barco. Cambia la orientación con el botón.</div>`;
    bindBtn('orientBtn',()=>{ orient=orient==='h'?'v':'h'; renderColocar(); });
    container.querySelectorAll('div[data-place]').forEach(d=>{
      const i=+d.dataset.place;
      const f=e=>{e.preventDefault();e.stopPropagation();colocar(i);};
      d.addEventListener('touchstart',f,{passive:false}); d.addEventListener('click',f);
    });
  }
  function renderEsperaListo(){
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:24px;min-height:300px;text-align:center;color:#fff">
        ${ctrl.barraJugadores('🚢','🚢')}
        <div style="font-size:2rem;margin:20px 0">⏳</div>
        <div style="font-weight:800">¡Flota lista! Esperando a que el rival coloque sus barcos...</div>
      </div>
      <div class="game-instructions">En cuanto tu rival termine, empieza la batalla.</div>`;
  }
  function renderBatalla(){
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        ${ctrl.barraJugadores('🚢','🚢')}
        <div style="text-align:center;color:#FFD600;font-weight:800;margin-bottom:6px">${miTurno?'🎯 ¡Dispara al rival!':'⏳ Turno del rival...'}</div>
        <div style="color:#aaa;font-size:0.78rem;text-align:center;margin-bottom:4px">Tablero enemigo (toca para disparar):</div>
        ${gridHTML(disparosMios,'enemigo')}
        <div style="color:#aaa;font-size:0.78rem;text-align:center;margin:8px 0 4px">Tu flota:</div>
        ${gridHTML(miTablero,'mio')}
        ${ctrl.chatHTML()}
      </div>
      <div class="game-instructions">💥 = tocado · 💧 = agua. ¡Hunde toda la flota enemiga para ganar!</div>`;
    ctrl.conectarChat();
    container.querySelectorAll('div[data-shoot]').forEach(d=>{
      const i=+d.dataset.shoot;
      const f=e=>{e.preventDefault();e.stopPropagation();disparar(i);};
      d.addEventListener('touchstart',f,{passive:false}); d.addEventListener('click',f);
    });
  }
}

// ══════════════════════════════════════════════════════════
//  LUDO ONLINE (versión 2 jugadores, carrera simplificada)
// ══════════════════════════════════════════════════════════
// Cada jugador tiene 2 fichas. Recorrido común de 28 casillas + meta.
// Sacas con dado (1-6). Si caes donde está el rival, lo mandas al inicio.
if (typeof buildNavalOnline === "function") window.buildNavalOnline = buildNavalOnline;
