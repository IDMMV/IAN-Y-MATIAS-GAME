function buildTicTacToe(container) {
  const j1=localP1(), j2=localP2();
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:20px">
      <div style="text-align:center;margin-bottom:16px">
        <div id="tttStatus" style="font-family:Fredoka One,cursive;font-size:1.3rem;color:var(--accent);margin-bottom:12px">Turno de ⭕ ${j1.name}</div>
        <div style="display:flex;gap:20px;justify-content:center;font-weight:800;margin-bottom:16px">
          <span style="color:var(--puzzle)">${j1.emoji}⭕ ${j1.name}: <span id="tttS1">0</span></span>
          <span style="color:#fff">🤝 <span id="tttSD">0</span></span>
          <span style="color:var(--secondary)">${j2.emoji}❌ ${j2.name}: <span id="tttS2">0</span></span>
        </div>
        <div id="tttBoard" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:240px;margin:0 auto"></div>
        <button onclick="window.tttReset()" style="margin-top:16px;background:#7C3AED;border:none;color:white;padding:10px 28px;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem">🔄 Nueva partida</button>
      </div>
    </div>
    <div class="game-instructions"><strong>${j1.emoji} ${j1.name} (⭕) vs ${j2.emoji} ${j2.name} (❌)</strong> · ¡3 en raya gana!</div>`;
  let board=Array(9).fill(null), current='O', s1=0, s2=0, sd=0, over=false;
  const WIN=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function reset(){
    board=Array(9).fill(null); current='O'; over=false;
    setText('tttStatus','Turno de ⭕ '+j1.name);
    render();
  }
  function render(){
    const b=document.getElementById('tttBoard'); if(!b) return; b.innerHTML='';
    board.forEach((v,i)=>{
      const cell=document.createElement('div');
      cell.style.cssText=`aspect-ratio:1;border-radius:12px;background:${v?'rgba(124,58,237,0.25)':'rgba(255,255,255,0.08)'};border:2px solid ${v?'rgba(124,58,237,0.5)':'rgba(255,255,255,0.15)'};display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:${over||v?'default':'pointer'};`;
      cell.textContent=v==='O'?'⭕':v==='X'?'❌':'';
      if(!v&&!over) cell.onclick=()=>play(i);
      b.appendChild(cell);
    });
  }
  function play(i){
    if(board[i]||over) return;
    board[i]=current; SFX.click();
    const win=WIN.find(([a,b,c])=>board[a]&&board[a]===board[b]&&board[a]===board[c]);
    render();
    if(win){
      over=true; const sym=current==='O'?'⭕':'❌';
      const ganador=current==='O'?j1.name:j2.name;
      awardBadge('first_win'); if(current==='O'){s1++;setText('tttS1',s1);} else {s2++;setText('tttS2',s2);}
      setText('tttStatus',`¡${sym} ${ganador} Gana! 🎉`);
      celebrate(); showToast(`🎉 ${ganador} gana!`);
    } else if(board.every(v=>v)){
      over=true; sd++; setText('tttSD',sd); setText('tttStatus','🤝 ¡Empate!'); showToast('🤝 ¡Empate!');
    } else {
      current=current==='O'?'X':'O';
      setText('tttStatus',`Turno de ${current==='O'?'⭕ '+j1.name:'❌ '+j2.name}`);
    }
  }
  window.tttReset = reset;
  reset();
}

// ═══════════════════════════════════════════
//  GAME 9: FLAPPY BIRD
// ═══════════════════════════════════════════
if (typeof buildTicTacToe === "function") window.buildTicTacToe = buildTicTacToe;
