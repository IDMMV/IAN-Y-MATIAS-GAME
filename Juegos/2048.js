function build2048(container) {
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:16px">
      <div style="text-align:center">
        <div style="display:flex;gap:20px;justify-content:center;font-weight:800;margin-bottom:14px;color:#fff">
          <span>🔢 Score: <span id="g2Score" style="color:var(--accent)">0</span></span>
          <span>⭐ Best: <span id="g2Best">0</span></span>
        </div>
        <div id="g2Board" style="background:#2a2440;border-radius:12px;padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:300px;margin:0 auto;aspect-ratio:1"></div>
        <button onclick="window.g2Reset()" style="margin-top:14px;background:#7C3AED;border:none;color:white;padding:10px 28px;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem">🔄 Nuevo</button>
      </div>
    </div>
    <div class="game-instructions"><strong>Controles:</strong> Flechas / WASD o desliza · Une números iguales para llegar a 2048!</div>`;
  let grid, score, best=getRecord('2048');
  setTimeout(()=>setText('g2Best',best),0);
  const COLORS={2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
  function reset(){ grid=Array.from({length:4},()=>Array(4).fill(0)); score=0; setText('g2Score',0); addTile(); addTile(); render(); }
  function addTile(){ const empty=[]; for(let r=0;r<4;r++)for(let c=0;c<4;c++) if(!grid[r][c]) empty.push([r,c]); if(empty.length){ const [r,c]=empty[Math.floor(Math.random()*empty.length)]; grid[r][c]=Math.random()<0.9?2:4; } }
  function render(){
    const b=document.getElementById('g2Board'); if(!b) return; b.innerHTML='';
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const v=grid[r][c]; const cell=document.createElement('div');
      cell.style.cssText=`border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:Fredoka One,cursive;font-size:${v>=1000?'1.1rem':'1.5rem'};background:${v?COLORS[v]||'#3c3a32':'rgba(255,255,255,0.08)'};color:${v<=4?'#776e65':'#fff'};`;
      cell.textContent=v||''; b.appendChild(cell);
    }
  }
  function slide(row){ let a=row.filter(x=>x); for(let i=0;i<a.length-1;i++){ if(a[i]===a[i+1]){ a[i]*=2; score+=a[i]; a.splice(i+1,1); } } while(a.length<4) a.push(0); return a; }
  function move(dir){
    const prev=JSON.stringify(grid);
    if(dir==='left') grid=grid.map(slide);
    if(dir==='right') grid=grid.map(r=>slide(r.slice().reverse()).reverse());
    if(dir==='up'||dir==='down'){
      for(let c=0;c<4;c++){ let col=[grid[0][c],grid[1][c],grid[2][c],grid[3][c]]; if(dir==='down')col.reverse(); col=slide(col); if(dir==='down')col.reverse(); for(let r=0;r<4;r++) grid[r][c]=col[r]; }
    }
    if(JSON.stringify(grid)!==prev){ addTile(); setText('g2Score',score); best=saveRecord('2048',score); setText('g2Best',best); render();
      if(isOver()){ SFX.lose(); showToast('💀 Game Over! Score: '+score); }
      if(grid.flat().includes(2048)){ celebrate(); showToast('🎉 ¡Llegaste a 2048!'); }
    }
  }
  function isOver(){ for(let r=0;r<4;r++)for(let c=0;c<4;c++){ if(!grid[r][c]) return false; if(c<3&&grid[r][c]===grid[r][c+1]) return false; if(r<3&&grid[r][c]===grid[r+1][c]) return false; } return true; }
  function keyHandler(e){ if (window.HK_PAUSED) return; const k={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}[e.key]; if(k){ move(k); e.preventDefault(); } }
  document.addEventListener('keydown',keyHandler);
  window.activeKeyHandlers.push(keyHandler);
  const board=document.getElementById('g2Board');
  let st=null;
  board.addEventListener('touchstart',e=>{st={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  board.addEventListener('touchend',e=>{ if(!st) return; const dx=e.changedTouches[0].clientX-st.x,dy=e.changedTouches[0].clientY-st.y; st=null; if(Math.max(Math.abs(dx),Math.abs(dy))<20) return; if(Math.abs(dx)>Math.abs(dy)) move(dx>0?'right':'left'); else move(dy>0?'down':'up'); });
  window.g2Reset = reset;
  container.querySelector('.game-container').appendChild(makeDPad(move));
  reset();
}

// ═══════════════════════════════════════════
//  GAME 14: QUIZ GENIO
// ═══════════════════════════════════════════
