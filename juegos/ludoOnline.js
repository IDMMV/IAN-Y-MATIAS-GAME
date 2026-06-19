function buildLudoOnline(container) {
  const META=28;
  let fichas, miNum, miTurno, dado, ctrl, tiradaHecha;
  // fichas = { 1:[posA,posB], 2:[posA,posB] }  pos: -1=base, 0..27=pista, 28=meta
  ctrl = crearJuegoOnline({
    container, titulo:'Ludo', emoji:'🎲',
    descripcion:'Carrera de fichas. ¡Llega primero!',
    colorTema:'linear-gradient(135deg,#ef4444,#22c55e)',
    onEmpezar: (esAnf)=>{ miNum=esAnf?1:2; empezar(); },
    onMovimiento: (d)=>{
      if(d.tipo==='jugada'){ fichas=d.fichas; dado=d.dado; miTurno=true; tiradaHecha=false; render(); revisarFin(); }
      else if(d.tipo==='reinicio'){ empezar(); }
    }
  });
  if(!ctrl) return;
  function empezar(){
    fichas={1:[-1,-1],2:[-1,-1]};
    miTurno=ctrl.esAnfitrion; dado=0; tiradaHecha=false;
    render();
  }
  // casilla global de salida según jugador
  function salida(num){ return num===1?0:14; }
  function posGlobal(num,pos){ if(pos<0||pos>=META) return -1; return (salida(num)+pos)%META; }
  function tirar(){
    if(!miTurno||tiradaHecha||!ctrl.jugando) return;
    dado=Math.floor(Math.random()*6)+1; SFX.click(); tiradaHecha=true;
    // ¿hay movimiento posible?
    const mis=fichas[miNum];
    const puede = mis.some((p,i)=> puedeMover(i));
    render();
    if(!puede){ // sin jugada: pasa turno
      setTimeout(()=>{ ctrl.enviar({tipo:'jugada',fichas,dado:0}); miTurno=false; tiradaHecha=false; render(); }, 900);
    }
  }
  function puedeMover(i){
    const p=fichas[miNum][i];
    if(p>=META) return false;
    if(p===-1) return dado===6; // sale con 6
    return p+dado<=META;
  }
  function mover(i){
    if(!miTurno||!tiradaHecha||!ctrl.jugando||!puedeMover(i)) return;
    let p=fichas[miNum][i];
    if(p===-1) p=0; else p=p+dado;
    fichas[miNum][i]=p;
    // ¿comió rival?
    const miGlobal=posGlobal(miNum,p);
    if(miGlobal>=0){
      const rn=miNum===1?2:1;
      fichas[rn].forEach((rp,ri)=>{ if(rp>=0&&rp<META&&posGlobal(rn,rp)===miGlobal){ fichas[rn][ri]=-1; SFX.coin(); showToast('¡Comiste una ficha rival!'); } });
    }
    SFX.pop();
    const otra = dado===6; // con 6 repite turno
    ctrl.enviar({tipo:'jugada',fichas,dado: otra?-1:0}); // -1 = repite el mismo
    if(otra){ tiradaHecha=false; } else { miTurno=false; tiradaHecha=false; }
    render(); revisarFin();
  }
  function revisarFin(){
    [1,2].forEach(n=>{
      if(fichas[n].every(p=>p>=META)){
        ctrl.jugando=false;
        if(n===miNum){ awardBadge('first_win'); celebrate(); } else SFX.lose();
        showToast(n===miNum?'🎉 ¡Ganaste la carrera!':'😢 El rival llegó primero');
      }
    });
  }
  function render(){
    // pista circular simple representada como fila de casillas
    let pista='<div style="display:flex;flex-wrap:wrap;gap:2px;justify-content:center;max-width:320px;margin:0 auto">';
    for(let g=0;g<META;g++){
      let cont='';
      [1,2].forEach(n=> fichas[n].forEach(p=>{ if(p>=0&&p<META&&posGlobal(n,p)===g) cont=(n===1?'🔴':'🟢'); }));
      const esSalida = g===salida(1)||g===salida(14);
      pista+=`<div style="width:30px;height:30px;background:${cont?'#1a1a2e':'#13131f'};border:1px solid ${esSalida?'#FFD600':'rgba(255,255,255,0.1)'};border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:0.9rem">${cont}</div>`;
    }
    pista+='</div>';
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        ${ctrl.barraJugadores('🔴','🟢')}
        <div style="text-align:center;color:#FFD600;font-weight:800;margin-bottom:6px">${miTurno?'✋ ¡Tu turno!':'⏳ Turno del rival...'}</div>
        <div style="text-align:center;margin-bottom:8px">
          <div style="display:inline-block;background:#fff;color:#000;width:54px;height:54px;border-radius:12px;font-size:2rem;line-height:54px;font-weight:800">${dado>0?['','⚀','⚁','⚂','⚃','⚄','⚅'][dado]:'🎲'}</div>
        </div>
        <div style="text-align:center;margin-bottom:10px">
          <button id="tirarBtn" style="background:${miTurno&&!tiradaHecha?'#16A34A':'#444'};border:none;color:#fff;padding:10px 24px;border-radius:16px;font-weight:800;font-family:Nunito,sans-serif;cursor:${miTurno&&!tiradaHecha?'pointer':'default'}">🎲 Tirar dado</button>
        </div>
        <div style="color:#aaa;font-size:0.78rem;text-align:center;margin-bottom:4px">Mis fichas (${miNum===1?'🔴':'🟢'}): toca una para mover ${dado>0?'('+dado+')':''}</div>
        <div id="misFichas" style="display:flex;gap:10px;justify-content:center;margin-bottom:8px"></div>
        ${pista}
        ${ctrl.chatHTML()}
      </div>
      <div class="game-instructions">Tira el dado. Saca fichas de 🏠 con un 6. Llega con tus 2 fichas a 🏁. Si caes sobre el rival, ¡lo mandas a casa! Con 6 repites turno.</div>`;
    bindBtn('tirarBtn',tirar);
    const mf=document.getElementById('misFichas');
    fichas[miNum].forEach((p,i)=>{
      const b=document.createElement('button');
      const est = p===-1?'🏠':(p>=META?'🏁':String(p));
      b.innerHTML=`${miNum===1?'🔴':'🟢'}<br><span style="font-size:0.7rem">${est}</span>`;
      const activa = miTurno&&tiradaHecha&&puedeMover(i)&&ctrl.jugando;
      b.style.cssText=`background:${activa?'#7C3AED':'#1a1a2e'};border:2px solid ${activa?'#FFD600':'transparent'};color:#fff;padding:8px 16px;border-radius:12px;font-weight:800;cursor:${activa?'pointer':'default'};-webkit-tap-highlight-color:transparent`;
      if(activa){ const f=e=>{e.preventDefault();e.stopPropagation();mover(i);}; b.addEventListener('touchstart',f,{passive:false}); b.addEventListener('click',f); }
      mf.appendChild(b);
    });
    ctrl.conectarChat();
  }
}

// ══════════════════════════════════════════════════════════
//  JUEGOS PARA BEBÉS (1-3 años) — causa y efecto, sin perder
// ══════════════════════════════════════════════════════════

// 🎈 REVIENTA GLOBOS
if (typeof buildLudoOnline === "function") window.buildLudoOnline = buildLudoOnline;
