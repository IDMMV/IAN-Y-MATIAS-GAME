function buildPiano(container) {
  const animales = [
    { emoji:'🐶', nombre:'Perro', freq:262, color:'#ef4444' },
    { emoji:'🐱', nombre:'Gato', freq:294, color:'#f59e0b' },
    { emoji:'🐮', nombre:'Vaca', freq:330, color:'#eab308' },
    { emoji:'🐑', nombre:'Oveja', freq:349, color:'#22c55e' },
    { emoji:'🐸', nombre:'Rana', freq:392, color:'#06b6d4' },
    { emoji:'🐤', nombre:'Pollito', freq:440, color:'#3b82f6' },
    { emoji:'🦆', nombre:'Pato', freq:494, color:'#a855f7' },
    { emoji:'🐷', nombre:'Cerdo', freq:523, color:'#ec4899' }
  ];
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);min-height:440px;padding:16px">
      <div id="animalShow" style="text-align:center;height:120px;display:flex;align-items:center;justify-content:center;font-size:5rem">🎹</div>
      <div id="tecladoAnimales" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:360px;margin:0 auto"></div>
    </div>
    <div class="game-instructions">👶 Toca cada animal para escuchar su nota musical y verlo grande. ¡Crea tu propia música!</div>`;
  const teclado = document.getElementById('tecladoAnimales');
  const show = document.getElementById('animalShow');
  animales.forEach(a => {
    const b = document.createElement('button');
    b.textContent = a.emoji;
    b.style.cssText = `aspect-ratio:1;background:${a.color};border:none;border-radius:18px;font-size:2.4rem;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,0.25);transition:transform 0.08s;-webkit-tap-highlight-color:transparent`;
    const tocar = e => {
      e.preventDefault(); e.stopPropagation();
      b.style.transform = 'translateY(4px) scale(0.95)';
      setTimeout(() => b.style.transform = '', 120);
      // mostrar animal grande
      show.innerHTML = `<div style="text-align:center"><div style="font-size:5rem">${a.emoji}</div><div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.2rem">${a.nombre}</div></div>`;
      // sonar nota
      try { tone(a.freq, 0.4); } catch(e){}
      // decir el nombre con voz
      try { if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(a.nombre); u.lang='es-ES'; u.rate=0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } } catch(e){}
    };
    b.addEventListener('touchstart', tocar, {passive:false});
    b.addEventListener('click', tocar);
    teclado.appendChild(b);
  });
}

// ══════════════════════════════════════════════════════════
//  MÁS JUEGOS DIDÁCTICOS PARA BEBÉS
// ══════════════════════════════════════════════════════════
// Helper: decir algo en voz alta (español) si el dispositivo lo soporta
function decir(texto) {
  try {
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-ES'; u.rate = 0.85; u.pitch = 1.1;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
  } catch (e) {}
}
// Helper genérico: grilla de botones grandes que al tocar muestran algo grande + voz + sonido
function juegoDidactico(container, cfg) {
  // cfg: { items:[{label, big, voz, color, sub}], cols, instruc, freqBase }
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(135deg,${cfg.bg1||'#1e1b4b'},${cfg.bg2||'#4c1d95'});min-height:440px;padding:16px">
      <div id="ddShow" style="text-align:center;min-height:140px;display:flex;align-items:center;justify-content:center;font-size:5rem">${cfg.emoji||'👶'}</div>
      <div id="ddGrid" style="display:grid;grid-template-columns:repeat(${cfg.cols||4},1fr);gap:10px;max-width:380px;margin:0 auto"></div>
    </div>
    <div class="game-instructions">${cfg.instruc}</div>`;
  const grid = document.getElementById('ddGrid');
  const show = document.getElementById('ddShow');
  cfg.items.forEach((it, i) => {
    const b = document.createElement('button');
    b.innerHTML = it.label;
    b.style.cssText = `aspect-ratio:1;background:${it.color};border:none;border-radius:18px;font-size:${it.fontSize||'2rem'};font-weight:800;color:#fff;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,0.25);transition:transform 0.08s;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center`;
    const tocar = e => {
      e.preventDefault(); e.stopPropagation();
      b.style.transform = 'translateY(4px) scale(0.95)';
      setTimeout(() => b.style.transform = '', 120);
      show.innerHTML = `<div style="text-align:center"><div style="font-size:${it.bigSize||'5rem'}">${it.big}</div>${it.sub?`<div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.3rem;margin-top:6px">${it.sub}</div>`:''}</div>`;
      try { tone(it.freq || (262 + i*40), 0.3); } catch(e){}
      decir(it.voz);
    };
    b.addEventListener('touchstart', tocar, {passive:false});
    b.addEventListener('click', tocar);
    grid.appendChild(b);
  });
}

// 🐤 SONIDOS DE ANIMALES
if (typeof buildPiano === "function") window.buildPiano = buildPiano;
