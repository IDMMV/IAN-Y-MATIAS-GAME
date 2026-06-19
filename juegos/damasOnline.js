function buildDamasOnline(container) {
  let board, miColor, miTurno, sel, ctrl; // board: 64, 'r'/'R'(rojo/dama) 'n'/'N'(negro/dama) null
  ctrl = crearJuegoOnline({
    container, titulo:'Damas', emoji:'⚫',
    descripcion:'Captura todas las fichas del rival',
    colorTema:'linear-gradient(135deg,#444,#111)',
    onEmpezar: (esAnf) => { miColor = esAnf?'r':'n'; empezar(); },
    onMovimiento: (d) => {
      if(d.tipo==='mov'){ aplicarMov(d.from, d.to, false); miTurno=true; sel=null; render(); }
      else if(d.tipo==='reinicio'){ empezar(); }
    }
  });
  if (!ctrl) return;
  function empezar(){
    board=Array(64).fill(null);
    for(let i=0;i<24;i++){ const r=Math.floor(i/4); }
    // colocar fichas en casillas oscuras
    for(let r=0;r<3;r++) for(let c=0;c<8;c++) if((r+c)%2===1) board[r*8+c]='n';
    for(let r=5;r<8;r++) for(let c=0;c<8;c++) if((r+c)%2===1) board[r*8+c]='r';
    miTurno = (miColor==='r'); // rojas empiezan
    sel=null; render();
  }
  function esMio(v){ return v && v.toLowerCase()===miColor; }
  function aplicarMov(from,to){
    const v=board[from]; board[from]=null;
    // captura: si saltó 2 casillas
    const fr=Math.floor(from/8), fc=from%8, tr=Math.floor(to/8), tc=to%8;
    if(Math.abs(tr-fr)===2){ const mr=(fr+tr)/2, mc=(fc+tc)/2; board[mr*8+mc]=null; }
    // coronar
    let nv=v;
    if(v==='r'&&tr===0) nv='R';
    if(v==='n'&&tr===7) nv='N';
    board[to]=nv;
  }
  function movsValidos(idx){
    const v=board[idx]; if(!v) return [];
    const r=Math.floor(idx/8), c=idx%8;
    const dama = v===v.toUpperCase();
    const dirs = dama?[[-1,-1],[-1,1],[1,-1],[1,1]] : (v.toLowerCase()==='r'?[[-1,-1],[-1,1]]:[[1,-1],[1,1]]);
    const movs=[], caps=[];
    dirs.forEach(([dr,dc])=>{
      const nr=r+dr, nc=c+dc;
      if(nr>=0&&nr<8&&nc>=0&&nc<8){
        const ni=nr*8+nc;
        if(!board[ni]) movs.push(ni);
        else if(board[ni].toLowerCase()!==v.toLowerCase()){
          const jr=r+dr*2, jc=c+dc*2;
          if(jr>=0&&jr<8&&jc>=0&&jc<8&&!board[jr*8+jc]) caps.push(jr*8+jc);
        }
      }
    });
    return caps.length?caps:movs; // si hay captura, prioriza
  }
  function click(idx){
    if(!miTurno||!ctrl.jugando) return;
    if(sel===null){ if(esMio(board[idx])){ sel=idx; render(); } return; }
    if(idx===sel){ sel=null; render(); return; }
    const validos=movsValidos(sel);
    if(validos.includes(idx)){
      ctrl.enviar({tipo:'mov',from:sel,to:idx});
      aplicarMov(sel,idx); SFX.pop();
      miTurno=false; sel=null; render(); revisarFin();
    } else if(esMio(board[idx])){ sel=idx; render(); }
  }
  function revisarFin(){
    const rojas=board.filter(v=>v&&v.toLowerCase()==='r').length;
    const negras=board.filter(v=>v&&v.toLowerCase()==='n').length;
    if(rojas===0||negras===0){
      ctrl.jugando=false;
      const gane=(miColor==='r'&&negras===0)||(miColor==='n'&&rojas===0);
      if(gane){ awardBadge('first_win'); celebrate(); } else SFX.lose();
    }
  }
  function render(){
    const validos = sel!==null?movsValidos(sel):[];
    let grid='<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:0;max-width:320px;margin:0 auto;border:3px solid #6b4423;border-radius:6px;overflow:hidden">';
    for(let i=0;i<64;i++){
      const r=Math.floor(i/8), c=i%8;
      const oscura=(r+c)%2===1;
      const v=board[i];
      const ficha = v? (v.toLowerCase()==='r'?'🔴':'⚫') : '';
      const corona = v&&v===v.toUpperCase()?'<span style="position:absolute;font-size:0.6rem;top:1px;right:3px">👑</span>':'';
      const marca = validos.includes(i)?'box-shadow:inset 0 0 0 3px #16A34A;':'';
      const selb = sel===i?'box-shadow:inset 0 0 0 3px #FFD600;':'';
      grid+=`<div data-i="${i}" style="position:relative;aspect-ratio:1;background:${oscura?'#7c5230':'#e8d0aa'};display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;${marca}${selb}">${ficha}${corona}</div>`;
    }
    grid+='</div>';
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        ${ctrl.barraJugadores(miColor==='r'?'🔴':'⚫', miColor==='r'?'⚫':'🔴')}
        <div style="text-align:center;color:#FFD600;font-weight:800;margin-bottom:8px">${miTurno?'✋ ¡Tu turno!':'⏳ Turno del rival...'}</div>
        ${grid}
        ${ctrl.chatHTML()}
      </div>
      <div class="game-instructions">Toca tu ficha y luego dónde mover (diagonal). Salta para capturar. ¡Captura todas las del rival!</div>`;
    ctrl.conectarChat();
    container.querySelectorAll('div[data-i]').forEach(d=>{
      const i=+d.dataset.i;
      const f=e=>{e.preventDefault();e.stopPropagation();click(i);};
      d.addEventListener('touchstart',f,{passive:false}); d.addEventListener('click',f);
    });
  }
}

// ══════════════════════════════════════════════════════════
//  BATALLA NAVAL ONLINE
// ══════════════════════════════════════════════════════════
if (typeof buildDamasOnline === "function") window.buildDamasOnline = buildDamasOnline;
