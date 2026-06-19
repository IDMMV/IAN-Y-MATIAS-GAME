function buildGlobos(container) {
  const colores = ['#ef4444','#f59e0b','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#06b6d4'];
  let activos = [];
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(180deg,#bfdbfe,#dbeafe);min-height:420px;position:relative;overflow:hidden;border-radius:0">
      <div id="globosArea" style="position:absolute;inset:0;touch-action:manipulation"></div>
    </div>
    <div class="game-instructions">👶 Toca los globos para reventarlos. ¡Sin perder, solo diversión!</div>`;
  const area = document.getElementById('globosArea');
  function nuevoGlobo() {
    if (!document.body.contains(area)) return;
    const g = document.createElement('div');
    const col = colores[Math.floor(Math.random()*colores.length)];
    const size = 60 + Math.random()*40;
    const x = Math.random()*(area.clientWidth - size);
    g.style.cssText = `position:absolute;left:${x}px;bottom:-120px;width:${size}px;height:${size*1.2}px;background:radial-gradient(circle at 35% 30%, #fff8, ${col});border-radius:50%;cursor:pointer;transition:bottom 0.05s linear;box-shadow:0 4px 10px rgba(0,0,0,0.15);-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center`;
    g.innerHTML = `<div style="width:2px;height:30px;background:#0003;position:absolute;bottom:-26px"></div>`;
    area.appendChild(g);
    let pos = -120;
    const vel = 1 + Math.random()*1.5;
    const subir = setInterval(() => {
      if (!document.body.contains(g)) { clearInterval(subir); return; }
      pos += vel; g.style.bottom = pos + 'px';
      if (pos > area.clientHeight + 60) { g.remove(); clearInterval(subir); }
    }, 16);
    const reventar = e => {
      e.preventDefault(); e.stopPropagation();
      clearInterval(subir);
      g.innerHTML = '💥'; g.style.background='transparent'; g.style.boxShadow='none';
      g.style.fontSize = size+'px'; g.style.transition='transform 0.2s, opacity 0.2s';
      g.style.transform='scale(1.4)'; g.style.opacity='0';
      try { SFX.pop(); } catch(e){}
      setTimeout(() => g.remove(), 200);
    };
    g.addEventListener('touchstart', reventar, {passive:false});
    g.addEventListener('click', reventar);
  }
  const generador = setInterval(nuevoGlobo, 900);
  window.activeIntervals.push(generador);
  for (let i=0;i<3;i++) setTimeout(nuevoGlobo, i*300);
}

// ⭐ TOCA Y APARECE
if (typeof buildGlobos === "function") window.buildGlobos = buildGlobos;
