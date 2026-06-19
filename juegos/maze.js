function buildMaze(container) {
  const avail = Math.min(window.innerWidth-60, maxGameHeight());
  const SIZE=15, CELL=Math.min(28, Math.floor((Math.min(400,avail)-20)/SIZE));
  const W=SIZE*CELL, H=SIZE*CELL;
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;color:#fff">⏱️ Tiempo: <span id="mazeTime">0</span>s</span>
        <span style="font-weight:800;color:#fff">🏆 Nivel: <span id="mazeLevel">1</span></span>
        <button onclick="window.mazeReset()" style="background:#7C3AED;border:none;color:white;padding:6px 14px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Nuevo</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px"><canvas id="mazeGame" width="${W}" height="${H}"></canvas></div>
    </div>
    <div class="game-instructions"><strong>Controles:</strong> Flechas / WASD o desliza · Lleva 🟢 hasta la 🚪</div>`;
  const canvas=document.getElementById('mazeGame');
  const ctx=canvas.getContext('2d');
  let maze,player,level=1,timeElapsed=0,timerInt;
  function genMaze(s) {
    const g=Array.from({length:s},()=>Array.from({length:s},()=>({visited:false,walls:[true,true,true,true]})));
    const stack=[[0,0]]; g[0][0].visited=true;
    while(stack.length){
      const [x,y]=stack[stack.length-1];
      const dirs=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]].filter(([dx,dy])=>{
        const nx=x+dx,ny=y+dy; return nx>=0&&nx<s&&ny>=0&&ny<s&&!g[ny][nx].visited;
      });
      if(dirs.length){
        const [dx,dy,w,nw]=dirs[Math.floor(Math.random()*dirs.length)];
        g[y][x].walls[w]=false; g[y+dy][x+dx].walls[nw]=false; g[y+dy][x+dx].visited=true;
        stack.push([x+dx,y+dy]);
      } else stack.pop();
    }
    return g;
  }
  function reset() {
    if(timerInt) clearInterval(timerInt); timeElapsed=0;
    maze=genMaze(SIZE); player={x:0,y:0};
    setText('mazeTime',0);
    timerInt=registerInterval(setInterval(()=>{ timeElapsed++; setText('mazeTime',timeElapsed); },1000));
    draw();
  }
  function draw() {
    if(!document.getElementById('mazeGame')) return;
    ctx.fillStyle='#0a0a14'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#7C3AED'; ctx.lineWidth=2;
    for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){
      const c=maze[y][x], px=x*CELL, py=y*CELL;
      if(c.walls[0]){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+CELL,py);ctx.stroke();}
      if(c.walls[1]){ctx.beginPath();ctx.moveTo(px+CELL,py);ctx.lineTo(px+CELL,py+CELL);ctx.stroke();}
      if(c.walls[2]){ctx.beginPath();ctx.moveTo(px,py+CELL);ctx.lineTo(px+CELL,py+CELL);ctx.stroke();}
      if(c.walls[3]){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+CELL);ctx.stroke();}
    }
    ctx.font=`${CELL-4}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🚪',(SIZE-0.5)*CELL,(SIZE-0.5)*CELL);
    ctx.fillText('🟢',(player.x+0.5)*CELL,(player.y+0.5)*CELL);
  }
  function move(dir) {
    const m={up:[0,0,-1],down:[2,0,1],right:[1,1,0],left:[3,-1,0]}[dir];
    if(!m) return;
    const [wall,dx,dy]=m;
    if(!maze[player.y][player.x].walls[wall]){
      player.x+=dx; player.y+=dy; draw();
      if(player.x===SIZE-1&&player.y===SIZE-1){
        clearInterval(timerInt); celebrate(); showToast(`🎉 ¡Escapaste en ${timeElapsed}s!`);
        level++; setText('mazeLevel',level); setTimeout(reset,1200);
      }
    }
  }
  function keyHandler(e) {
    const k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key];
    if(k){ move(k); e.preventDefault(); }
  }
  document.addEventListener('keydown', keyHandler);
  window.activeKeyHandlers.push(keyHandler);
  let mt=null;
  canvas.addEventListener('touchstart',e=>{mt={x:e.touches[0].clientX,y:e.touches[0].clientY};e.preventDefault();},{passive:false});
  canvas.addEventListener('touchend',e=>{
    if(!mt) return;
    const dx=e.changedTouches[0].clientX-mt.x, dy=e.changedTouches[0].clientY-mt.y; mt=null;
    if(Math.abs(dx)>Math.abs(dy)) move(dx>0?'right':'left'); else move(dy>0?'down':'up');
    e.preventDefault();
  },{passive:false});
  window.mazeReset = reset;
  container.querySelector('.game-container').appendChild(makeDPad(move));
  reset();
}
// ═══════════════════════════════════════════
if (typeof buildMaze === "function") window.buildMaze = buildMaze;
