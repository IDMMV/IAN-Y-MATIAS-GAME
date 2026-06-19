function buildPintar(container) {
  const W = Math.min(360, window.innerWidth-40), H = 380;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:12px;min-height:440px">
      <div style="display:flex;gap:6px;justify-content:center;margin-bottom:10px;flex-wrap:wrap" id="paleta"></div>
      <canvas id="pintarCanvas" width="${W}" height="${H}" style="background:#fff;border-radius:14px;touch-action:none;display:block;margin:0 auto;box-shadow:0 4px 14px rgba(0,0,0,0.3)"></canvas>
      <div style="text-align:center;margin-top:10px"><button id="borrarBtn" style="background:#ef4444;border:none;color:#fff;padding:10px 24px;border-radius:16px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer">🧹 Borrar todo</button></div>
    </div>
    <div class="game-instructions">👶 Arrastra el dedo para pintar. Elige colores arriba. ¡Borra y vuelve a empezar!</div>`;
  const cv = document.getElementById('pintarCanvas');
  const ctx = cv.getContext('2d');
  let color = '#ef4444', pintando = false;
  const colores = ['#ef4444','#f59e0b','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#000000'];
  const pal = document.getElementById('paleta');
  colores.forEach((col,i) => {
    const b = document.createElement('button');
    b.style.cssText = `width:36px;height:36px;border-radius:50%;background:${col};border:3px solid ${i===0?'#fff':'transparent'};cursor:pointer;-webkit-tap-highlight-color:transparent`;
    const pick = e => { e.preventDefault(); e.stopPropagation(); color = col; [...pal.children].forEach(c=>c.style.border='3px solid transparent'); b.style.border='3px solid #fff'; try{SFX.click();}catch(e){} };
    b.addEventListener('touchstart', pick, {passive:false}); b.addEventListener('click', pick);
    pal.appendChild(b);
  });
  function pos(e) {
    const r = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || e;
    return { x: (t.clientX - r.left) * (cv.width/r.width), y: (t.clientY - r.top) * (cv.height/r.height) };
  }
  function start(e){ e.preventDefault(); pintando=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); dibujarPunto(p); }
  function move(e){ if(!pintando) return; e.preventDefault(); const p=pos(e); ctx.lineTo(p.x,p.y); ctx.strokeStyle=color; ctx.lineWidth=14; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke(); }
  function dibujarPunto(p){ ctx.fillStyle=color; ctx.beginPath(); ctx.arc(p.x,p.y,7,0,7); ctx.fill(); }
  function end(){ pintando=false; }
  cv.addEventListener('touchstart', start, {passive:false});
  cv.addEventListener('touchmove', move, {passive:false});
  cv.addEventListener('touchend', end);
  cv.addEventListener('mousedown', start);
  cv.addEventListener('mousemove', move);
  cv.addEventListener('mouseup', end);
  bindBtn('borrarBtn', () => { ctx.clearRect(0,0,cv.width,cv.height); try{SFX.pop();}catch(e){} });
}

// 🎹 PIANO DE ANIMALES
if (typeof buildPintar === "function") window.buildPintar = buildPintar;
