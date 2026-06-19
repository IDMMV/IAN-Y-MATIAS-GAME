function buildMultitud(container) {
  const W = Math.min(360, window.innerWidth - 40), H = 460;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:10px;min-height:500px">
      <div style="text-align:center;color:#fff;margin-bottom:6px">
        <span style="font-family:'Fredoka One',cursive;font-size:1.1rem">👥 Tu equipo: <span id="multCount" style="color:#3b82f6">1</span></span>
        <span style="margin-left:12px;color:#aaa;font-size:0.85rem">Nivel <span id="multNivel">1</span></span>
      </div>
      <canvas id="multCanvas" width="${W}" height="${H}" style="background:linear-gradient(180deg,#1e3a5f,#0f172a);border-radius:14px;display:block;margin:0 auto;touch-action:none;max-width:100%"></canvas>
      <div id="multMsg" style="text-align:center;color:#FFD600;font-weight:800;margin-top:8px;min-height:24px;font-size:0.9rem"></div>
    </div>
    <div class="game-instructions">👥 Mueve el dedo (o el mouse) a izquierda y derecha para elegir las puertas. Pasa por ✖️2 o ➕ para crecer tu equipo. ¡Vence al equipo rojo al final!</div>`;
  const cv = document.getElementById('multCanvas');
  const ctx = cv.getContext('2d');
  const elCount = document.getElementById('multCount');
  const elNivel = document.getElementById('multNivel');
  const elMsg = document.getElementById('multMsg');

  let nivel = 1;
  let miEquipo = 1;
  let playerX = W/2;
  let scroll = 0;
  let jugando = true;
  let puertas = [];   // {y, izq:{tipo,val}, der:{tipo,val}, pasada}
  let enemigo = 0;
  let enemyY = -800;
  let estado = 'corriendo'; // corriendo | batalla | fin
  let _multAnimId = null;

  function nuevoNivel() {
    miEquipo = 1; playerX = W/2; scroll = 0; jugando = true; estado = 'corriendo';
    puertas = [];
    const numPuertas = 3 + nivel;
    for (let i = 0; i < numPuertas; i++) {
      puertas.push(generarPuerta(-(i+1) * 320 - 200));
    }
    enemigo = Math.floor(8 * nivel * (1 + Math.random()));
    enemyY = -(numPuertas + 1) * 320 - 300;
    elNivel.textContent = nivel;
    elMsg.textContent = '';
    update();
  }
  function generarPuerta(y) {
    const ops = ['x2','+5','+10','x3','-5','+8'];
    const buenos = ['x2','+5','+10','x3','+8'];
    // al menos una opción buena
    let izq = ops[Math.floor(Math.random()*ops.length)];
    let der = buenos[Math.floor(Math.random()*buenos.length)];
    if (Math.random() < 0.5) { const t = izq; izq = der; der = t; }
    return { y, izq: parseOp(izq), der: parseOp(der), pasada: false };
  }
  function parseOp(s) {
    if (s[0] === 'x') return { tipo:'x', val:+s.slice(1), txt:s };
    return { tipo:'+', val:+s.slice(1), txt:s, neg:s[0]==='-' };
  }
  function aplicar(op) {
    if (op.txt[0] === 'x') miEquipo = Math.max(1, Math.floor(miEquipo * op.val));
    else miEquipo = Math.max(1, miEquipo + op.val);
  }

  // control: mover con dedo/mouse
  function mover(e) {
    if (!jugando) return;
    const r = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || e;
    if (!t) return;
    playerX = Math.max(30, Math.min(W-30, (t.clientX - r.left) * (W/r.width)));
  }
  cv.addEventListener('touchmove', e => { e.preventDefault(); mover(e); }, {passive:false});
  cv.addEventListener('mousemove', e => { if (e.buttons) mover(e); });
  cv.addEventListener('touchstart', e => { e.preventDefault(); mover(e); }, {passive:false});

  function dibujarMultitud(x, y, n, color, emoji) {
    // dibuja hasta ~30 muñecos en bloque
    const mostrar = Math.min(30, n);
    const cols = Math.ceil(Math.sqrt(mostrar));
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
    for (let i = 0; i < mostrar; i++) {
      const cx = x + ((i % cols) - cols/2) * 14;
      const cy = y + Math.floor(i / cols) * 14;
      ctx.fillText(emoji, cx, cy);
    }
  }

  function update() {
    if (window.HK_PAUSED) return;
    if (!container.isConnected) return;
    ctx.clearRect(0, 0, W, H);
    // carretera
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3; ctx.setLineDash([15, 15]);
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke(); ctx.setLineDash([]);

    if (estado === 'corriendo') {
      scroll += 2.5 + nivel*0.3;
      // dibujar puertas
      puertas.forEach(p => {
        const py = p.y + scroll;
        if (py > -60 && py < H) {
          // dos puertas (izq y der)
          dibujarPuerta(W*0.27, py, p.izq);
          dibujarPuerta(W*0.73, py, p.der);
        }
        // detección de paso (cuando la puerta llega al jugador ~H-80)
        if (!p.pasada && py >= H-90) {
          p.pasada = true;
          const elige = playerX < W/2 ? p.izq : p.der;
          aplicar(elige);
          elCount.textContent = miEquipo;
          SFX.coin();
        }
      });
      // enemigo se acerca
      const ey = enemyY + scroll;
      if (ey > -60 && ey < H) {
        dibujarMultitud(W/2, ey, enemigo, '#ef4444', '🔴');
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign='center';
        ctx.fillText('👹 ' + enemigo, W/2, ey - 30);
      }
      // ¿llegamos al enemigo?
      if (ey >= H-130) { estado = 'batalla'; setTimeout(batalla, 300); }
      // dibujar mi multitud
      dibujarMultitud(playerX, H-70, miEquipo, '#3b82f6', '🔵');
      ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign='center';
      ctx.fillText('' + miEquipo, playerX, H-95);
    }

    if (jugando) _multAnimId = registerAnimation(requestAnimationFrame(update));
  }

  function dibujarPuerta(x, y, op) {
    const bueno = op.txt[0]==='x' || (op.tipo==='+' && !op.neg);
    ctx.fillStyle = bueno ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';
    ctx.fillRect(x-45, y-50, 90, 50);
    ctx.strokeStyle = bueno ? '#22c55e' : '#ef4444'; ctx.lineWidth=3;
    ctx.strokeRect(x-45, y-50, 90, 50);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign='center';
    ctx.fillText(op.txt, x, y-18);
  }

  function batalla() {
    estado = 'batalla'; jugando = false;
    if (miEquipo >= enemigo) {
      elMsg.innerHTML = `🎉 ¡GANASTE! ${miEquipo} vs ${enemigo}`;
      SFX.win(); if (typeof celebrate === 'function') celebrate();
      nivel++;
      setTimeout(() => { if (container.isConnected) { jugando=true; nuevoNivel(); } }, 1800);
    } else {
      elMsg.innerHTML = `😢 Perdiste: ${miEquipo} vs ${enemigo}. ¡Intenta de nuevo!`;
      SFX.lose();
      // botón reintentar
      setTimeout(() => {
        if (!container.isConnected) return;
        const btn = document.createElement('button');
        btn.textContent = '🔁 Reintentar nivel ' + nivel;
        btn.style.cssText = 'display:block;margin:8px auto 0;background:#7C3AED;border:none;color:#fff;padding:10px 22px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;cursor:pointer';
        const again = e => { e.preventDefault(); elMsg.innerHTML=''; jugando=true; nuevoNivel(); };
        btn.addEventListener('touchstart', again, {passive:false});
        btn.addEventListener('click', again);
        elMsg.appendChild(btn);
      }, 400);
    }
  }

  nuevoNivel();
}

// ══════════════════════════════════════════════════════════
//  🏃 CORRE SIN FIN (runner estilo Subway)
// ══════════════════════════════════════════════════════════
if (typeof buildMultitud === "function") window.buildMultitud = buildMultitud;
