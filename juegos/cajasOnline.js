function buildCajasOnline(container) {
  const N=5; // 5x5 puntos = 4x4 cajas
  let hLines, vLines, boxes, miTurno, miNum, scores, ctrl;
  ctrl = crearJuegoOnline({
    container, titulo:'Puntos y Cajas', emoji:'🎯',
    descripcion:'Conecta puntos y cierra cajas para ganar',
    colorTema:'linear-gradient(135deg,#10b981,#7C3AED)',
    onEmpezar: (esAnf) => { miNum = esAnf?1:2; empezar(); },
    onMovimiento: (d) => {
      if (d.tipo==='linea') { aplicarLinea(d.tipoL, d.r, d.c, d.num, false); }
      else if (d.tipo==='reinicio') { empezar(); }
    }
  });
  if (!ctrl) return;
  function empezar(){
    hLines={}; vLines={}; boxes={}; scores={1:0,2:0};
    miTurno = ctrl.esAnfitrion;
    render();
  }
  function aplicarLinea(tipoL, r, c, num){
    const key=r+','+c;
    if(tipoL==='h') hLines[key]=num; else vLines[key]=num;
    let cerro=false;
    for(let br=0;br<N-1;br++) for(let bc=0;bc<N-1;bc++){
      if(boxes[br+','+bc]) continue;
      if(hLines[br+','+bc]&&hLines[(br+1)+','+bc]&&vLines[br+','+bc]&&vLines[br+','+(bc+1)]){
        boxes[br+','+bc]=num; scores[num]++; cerro=true;
      }
    }
    if(!cerro){ miTurno = (num!==miNum); }
    else { miTurno = (num===miNum); SFX.coin(); }
    render();
    revisarFin();
  }
  function clickLinea(tipoL,r,c){
    if(!miTurno||!ctrl.jugando) return;
    const key=r+','+c;
    if((tipoL==='h'&&hLines[key])||(tipoL==='v'&&vLines[key])) return;
    ctrl.enviar({tipo:'linea',tipoL,r,c,num:miNum});
    SFX.click();
    aplicarLinea(tipoL,r,c,miNum);
  }
  function revisarFin(){
    const total=(N-1)*(N-1);
    if(Object.keys(boxes).length>=total){
      ctrl.jugando=false;
      const gano = scores[miNum] > scores[miNum===1?2:1];
      const empate = scores[1]===scores[2];
      if(empate) showToast('🤝 ¡Empate!');
      else if(gano){ awardBadge('first_win'); celebrate(); }
      else SFX.lose();
    }
  }
  function render(){
    const cell=44, pad=20;
    const size=(N-1)*cell;
    let svg=`<svg width="${size+pad*2}" height="${size+pad*2}" viewBox="0 0 ${size+pad*2} ${size+pad*2}" style="max-width:100%;touch-action:manipulation">`;
    for(let br=0;br<N-1;br++) for(let bc=0;bc<N-1;bc++){
      const o=boxes[br+','+bc];
      if(o) svg+=`<rect x="${pad+bc*cell+3}" y="${pad+br*cell+3}" width="${cell-6}" height="${cell-6}" fill="${o===1?'rgba(0,180,216,0.35)':'rgba(255,77,157,0.35)'}" rx="4"/>`;
    }
    for(let r=0;r<N;r++) for(let cc=0;cc<N-1;cc++){
      const on=hLines[r+','+cc];
      svg+=`<line data-h="${r},${cc}" x1="${pad+cc*cell}" y1="${pad+r*cell}" x2="${pad+(cc+1)*cell}" y2="${pad+r*cell}" stroke="${on?(on===1?'#00B4D8':'#FF4D9D'):'rgba(255,255,255,0.15)'}" stroke-width="${on?5:3}" stroke-linecap="round" style="cursor:pointer"/>`;
    }
    for(let r=0;r<N-1;r++) for(let cc=0;cc<N;cc++){
      const on=vLines[r+','+cc];
      svg+=`<line data-v="${r},${cc}" x1="${pad+cc*cell}" y1="${pad+r*cell}" x2="${pad+cc*cell}" y2="${pad+(r+1)*cell}" stroke="${on?(on===1?'#00B4D8':'#FF4D9D'):'rgba(255,255,255,0.15)'}" stroke-width="${on?5:3}" stroke-linecap="round" style="cursor:pointer"/>`;
    }
    for(let r=0;r<N;r++) for(let cc=0;cc<N;cc++) svg+=`<circle cx="${pad+cc*cell}" cy="${pad+r*cell}" r="4" fill="#fff"/>`;
    svg+=`</svg>`;
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        ${ctrl.barraJugadores('🔵','🔴')}
        <div style="text-align:center;color:#fff;font-weight:800;margin-bottom:8px">${miTurno?'✋ ¡Tu turno!':'⏳ Turno del rival...'} · Tú: ${scores[miNum]} | Rival: ${scores[miNum===1?2:1]}</div>
        <div style="display:flex;justify-content:center">${svg}</div>
        ${ctrl.chatHTML()}
      </div>
      <div class="game-instructions">Toca una línea entre dos puntos. Si cierras una caja, ¡juegas de nuevo! Quien cierre más cajas gana.</div>`;
    ctrl.conectarChat();
    container.querySelectorAll('line[data-h]').forEach(l=>{
      const [r,cc]=l.dataset.h.split(',').map(Number);
      const f=e=>{e.preventDefault();e.stopPropagation();clickLinea('h',r,cc);};
      l.addEventListener('touchstart',f,{passive:false}); l.addEventListener('click',f);
    });
    container.querySelectorAll('line[data-v]').forEach(l=>{
      const [r,cc]=l.dataset.v.split(',').map(Number);
      const f=e=>{e.preventDefault();e.stopPropagation();clickLinea('v',r,cc);};
      l.addEventListener('touchstart',f,{passive:false}); l.addEventListener('click',f);
    });
  }
}

// ══════════════════════════════════════════════════════════
//  AHORCADO ONLINE (anfitrión pone palabra, invitado adivina)
// ══════════════════════════════════════════════════════════
if (typeof buildCajasOnline === "function") window.buildCajasOnline = buildCajasOnline;
