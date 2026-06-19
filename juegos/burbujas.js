function buildBurbujas(container) {
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(180deg,#a5f3fc,#0ea5e9);min-height:440px;position:relative;overflow:hidden;border-radius:0">
      <div id="burbujasArea" style="position:absolute;inset:0;touch-action:manipulation"></div>
    </div>
    <div class="game-instructions">👶 Toca las burbujas para reventarlas. ¡Flotan suaves por la pantalla!</div>`;
  const area = document.getElementById('burbujasArea');
  function nueva() {
    if (!document.body.contains(area)) return;
    const bu = document.createElement('div');
    const size = 50 + Math.random()*55;
    const x = Math.random()*(area.clientWidth - size);
    bu.style.cssText = `position:absolute;left:${x}px;bottom:-120px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #ffffffcc, #ffffff22 40%, #38bdf833);border:2px solid #ffffff66;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:inset -6px -6px 12px #0ea5e955`;
    area.appendChild(bu);
    let pos = -120;
    const vel = 0.7 + Math.random()*1.2;
    const drift = (Math.random()-0.5)*0.6;
    let dx = 0;
    const subir = setInterval(() => {
      if (!document.body.contains(bu)) { clearInterval(subir); return; }
      pos += vel; dx += drift;
      bu.style.bottom = pos + 'px';
      bu.style.transform = `translateX(${Math.sin(pos/40)*15}px)`;
      if (pos > area.clientHeight + 60) { bu.remove(); clearInterval(subir); }
    }, 16);
    const reventar = e => {
      e.preventDefault(); e.stopPropagation();
      clearInterval(subir);
      bu.style.transition = 'transform 0.15s, opacity 0.15s';
      bu.style.transform += ' scale(1.5)'; bu.style.opacity = '0';
      try { SFX.pop(); } catch(e){}
      setTimeout(() => bu.remove(), 150);
    };
    bu.addEventListener('touchstart', reventar, {passive:false});
    bu.addEventListener('click', reventar);
  }
  const gen = setInterval(nueva, 700);
  window.activeIntervals.push(gen);
  for (let i=0;i<4;i++) setTimeout(nueva, i*250);
}

// ══════════════════════════════════════════════════════════
//  💰 IDLE MILLONARIO (clicker estilo CrazyGames)
// ══════════════════════════════════════════════════════════
if (typeof buildBurbujas === "function") window.buildBurbujas = buildBurbujas;
