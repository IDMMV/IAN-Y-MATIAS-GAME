function buildAnimales(container) {
  const animales = [
    { emoji:'🐶', nombre:'Perro', sonido:'Guau guau', color:'#ef4444', freq:200 },
    { emoji:'🐱', nombre:'Gato', sonido:'Miau', color:'#f59e0b', freq:500 },
    { emoji:'🐮', nombre:'Vaca', sonido:'Muuu', color:'#eab308', freq:120 },
    { emoji:'🐷', nombre:'Cerdo', sonido:'Oink oink', color:'#ec4899', freq:260 },
    { emoji:'🐔', nombre:'Gallina', sonido:'Co co co', color:'#22c55e', freq:600 },
    { emoji:'🐸', nombre:'Rana', sonido:'Croac croac', color:'#06b6d4', freq:180 },
    { emoji:'🦆', nombre:'Pato', sonido:'Cuac cuac', color:'#3b82f6', freq:400 },
    { emoji:'🐴', nombre:'Caballo', sonido:'Iiiih', color:'#a855f7', freq:350 },
    { emoji:'🐑', nombre:'Oveja', sonido:'Beee', color:'#14b8a6', freq:300 },
    { emoji:'🦁', nombre:'León', sonido:'Grrr', color:'#f97316', freq:90 },
    { emoji:'🐘', nombre:'Elefante', sonido:'Pruuum', color:'#8b5cf6', freq:80 },
    { emoji:'🐝', nombre:'Abeja', sonido:'Bzzz', color:'#facc15', freq:700 }
  ];
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(135deg,#fef3c7,#fbbf24);min-height:440px;padding:16px">
      <div id="ddShow" style="text-align:center;min-height:150px;display:flex;align-items:center;justify-content:center;font-size:5rem">🐤</div>
      <div id="ddGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:380px;margin:0 auto"></div>
    </div>
    <div class="game-instructions">👶 Toca un animal y escucha su sonido. ¡Aprende cómo hace cada uno!</div>`;
  const grid = document.getElementById('ddGrid');
  const show = document.getElementById('ddShow');
  animales.forEach(a => {
    const b = document.createElement('button');
    b.textContent = a.emoji;
    b.style.cssText = `aspect-ratio:1;background:${a.color};border:none;border-radius:18px;font-size:2.4rem;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,0.25);transition:transform 0.08s;-webkit-tap-highlight-color:transparent`;
    const tocar = e => {
      e.preventDefault(); e.stopPropagation();
      b.style.transform = 'translateY(4px) scale(0.95)';
      setTimeout(() => b.style.transform = '', 120);
      show.innerHTML = `<div style="text-align:center"><div style="font-size:5.5rem">${a.emoji}</div><div style="color:#7c2d12;font-family:'Fredoka One',cursive;font-size:1.3rem;margin-top:6px">${a.nombre}</div><div style="color:#92400e;font-size:1rem">hace "${a.sonido}"</div></div>`;
      // tono según el animal (grave=grande, agudo=pequeño)
      try { tone(a.freq, 0.5, 'sawtooth', 0.12); } catch(e){}
      // voz: primero el nombre, luego el sonido con énfasis
      decirAnimal(a.nombre, a.sonido);
    };
    b.addEventListener('touchstart', tocar, {passive:false});
    b.addEventListener('click', tocar);
    grid.appendChild(b);
  });
}
// Voz expresiva para animales: dice "El perro hace guau guau"
function decirAnimal(nombre, sonido) {
  try {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u1 = new SpeechSynthesisUtterance(`El ${nombre} hace`);
    u1.lang='es-ES'; u1.rate=0.9; u1.pitch=1.1;
    const u2 = new SpeechSynthesisUtterance(sonido);
    u2.lang='es-ES'; u2.rate=0.75; u2.pitch=1.3;
    speechSynthesis.speak(u1);
    speechSynthesis.speak(u2);
  } catch (e) {}
}

// 🔢 APRENDE NÚMEROS
if (typeof buildAnimales === "function") window.buildAnimales = buildAnimales;
