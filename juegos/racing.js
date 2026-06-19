function buildRacing(container) {
  /* ══ SPEED RACER 3D — Vista trasera pseudo-3D ══ */
  const maxW = Math.min(window.innerWidth - 20, 520);
  const W = maxW;
  const H = Math.min(480, maxGameHeight(), Math.round(W * 1.3));
  container.innerHTML = `
    <div class="game-container" style="background:#050a14;position:relative;overflow:hidden;width:100%">
      <canvas id="racingGame" width="${W}" height="${H}" style="display:block;width:100%;height:auto"></canvas>

      <!-- HUD superior: cinta de info compacta -->
      <div style="position:absolute;top:0;left:0;right:0;pointer-events:none">
        <div style="display:flex;align-items:stretch;background:linear-gradient(180deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0) 100%);padding:8px 10px 18px">
          <!-- Distancia -->
          <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start">
            <div style="color:rgba(255,255,255,0.45);font-size:0.55rem;font-weight:700;letter-spacing:1px;text-transform:uppercase">DIST</div>
            <div style="color:#fff;font-weight:800;font-size:0.95rem;line-height:1.1"><span id="raceDist">0</span><span style="color:rgba(255,255,255,0.5);font-size:0.65rem">m</span></div>
          </div>
          <!-- Vidas centrales -->
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div id="raceLivesHUD" style="font-size:1rem;letter-spacing:1px">❤️❤️❤️</div>
          </div>
          <!-- Restart -->
          <div style="flex:1;display:flex;align-items:center;justify-content:flex-end;pointer-events:all">
            <button onclick="window.raceReset()" style="background:rgba(124,58,237,0.7);backdrop-filter:blur(4px);border:1px solid rgba(124,58,237,0.6);color:#fff;padding:5px 11px;border-radius:10px;cursor:pointer;font-weight:800;font-size:0.78rem;font-family:Nunito,sans-serif">↺</button>
          </div>
        </div>
      </div>

      <!-- HUD inferior: velocímetro + nitro sobre el canvas -->
      <div style="position:absolute;bottom:0;left:0;right:0;pointer-events:none;background:linear-gradient(0deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0) 100%);padding:14px 12px 10px;display:flex;align-items:flex-end;justify-content:space-between">

        <!-- Velocímetro circular SVG -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <!-- Aro exterior -->
            <circle cx="36" cy="36" r="32" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
            <!-- Arco de fondo -->
            <path d="M 10 52 A 28 28 0 1 1 62 52" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="5" stroke-linecap="round"/>
            <!-- Arco de velocidad -->
            <path id="speedArc" d="M 10 52 A 28 28 0 0 1 10 52" fill="none" stroke="#00ffaa" stroke-width="5" stroke-linecap="round"/>
            <!-- Número -->
            <text id="raceKmh" x="36" y="38" text-anchor="middle" dominant-baseline="middle" fill="#00ffaa" font-family="Nunito,sans-serif" font-weight="800" font-size="16">0</text>
            <text x="36" y="52" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="Nunito,sans-serif" font-weight="700" font-size="7">KM/H</text>
          </svg>
        </div>

        <!-- Centro: indicador de marcha / modo -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding-bottom:4px">
          <div id="raceGear" style="color:#FFD600;font-family:'Fredoka One',cursive;font-size:1.4rem;text-shadow:0 0 10px rgba(255,214,0,0.6)">1</div>
          <div style="color:rgba(255,255,255,0.35);font-size:0.55rem;font-weight:700;letter-spacing:1px">GEAR</div>
        </div>

        <!-- Barra de nitro -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="color:#00aaff;font-size:0.58rem;font-weight:800;letter-spacing:1px;text-shadow:0 0 6px rgba(0,170,255,0.6)">NITRO</div>
          <!-- Barra vertical de 5 segmentos -->
          <div id="nitroSegs" style="display:flex;flex-direction:column-reverse;gap:2px">
            ${[0,1,2,3,4].map(i=>`<div class="nitroSeg" style="width:28px;height:8px;border-radius:3px;background:rgba(0,170,255,0.2);border:1px solid rgba(0,170,255,0.2);transition:all 0.1s"></div>`).join('')}
          </div>
          <div style="color:rgba(255,255,255,0.35);font-size:0.55rem;font-weight:700;letter-spacing:.5px">BOOST</div>
        </div>
      </div>
    </div>
    <div class="game-instructions">
      <strong>◀ ▶</strong> girar &nbsp;·&nbsp; <strong>⚡ NITRO</strong> boost &nbsp;·&nbsp; Centro pantalla = nitro en móvil &nbsp;·&nbsp; ¡Esquiva los autos! 3 vidas.
    </div>`;

  const canvas = document.getElementById('racingGame');
  const ctx = canvas.getContext('2d');

  /* ── Perspectiva pseudo-3D (técnica raycasting road) ── */
  const HORIZON = Math.floor(H * 0.42);   // línea del horizonte
  const NUM_SEGMENTS = 150;                // segmentos de carretera visibles
  const SEG_H = 2;                         // altura base de cada segmento en pantalla

  /* ── Estado ── */
  let pos, speed, steering, lives, score, dist, nitro, nitroActive;
  let running, animId, keys = {}, lastT = 0;
  let roadCurve = 0, targetCurve = 0, curveTimer = 0;
  let cameraX = 0, shakeT = 0;
  let dayTime = 0;

  /* ── Rivales ── */
  const RIVAL_COLORS = [
    { body:'#FFD600', roof:'#c8a800', window:'#aaddff' },
    { body:'#FF4D9D', roof:'#cc2266', window:'#aaddff' },
    { body:'#00B4D8', roof:'#006688', window:'#ccffff' },
    { body:'#FF6B00', roof:'#cc4400', window:'#ffddaa' },
    { body:'#16A34A', roof:'#0a5c22', window:'#aaffcc' },
  ];
  let rivals = [];

  /* ── Árboles y decoración ── */
  const trees = Array.from({length:30}, (_,i) => ({
    lane: i % 2 === 0 ? -1 : 1,   // izquierda o derecha
    roadPos: i * 0.033,             // posición normalizada en la carretera [0-1]
    type: i % 3,                    // 0=pino, 1=árbol redondeado, 2=arbusto
    size: 0.7 + Math.random()*0.6,
  }));

  function reset() {
    pos = 0; speed = 0; steering = 0; lives = 3; score = 0; dist = 0;
    nitro = 100; nitroActive = false; running = true; cameraX = 0;
    roadCurve = 0; targetCurve = 0; curveTimer = 0; dayTime = 0; shakeT = 0;
    rivals = [];
    setText('raceDist', 0); setText('raceScore', 0);
    const lh = document.getElementById('raceLivesHUD');
    if (lh) lh.textContent = '❤️❤️❤️';
    updateSpeedArc(0); updateNitroSegs(100); updateGear(0);
    if (animId) cancelAnimationFrame(animId);
    lastT = performance.now();
    animId = registerAnimation(requestAnimationFrame(loop));
  }

  function updateSpeedArc(kmh) {
    const arc = document.getElementById('speedArc');
    const txt = document.getElementById('raceKmh');
    if (!arc || !txt) return;
    txt.textContent = kmh;
    // Dibujar arco: el arco va de 10,52 a 62,52 pasando por la parte superior
    // MAX = 200km/h → 0..1 ratio
    const ratio = Math.min(1, kmh / 200);
    const r = 28, cx = 36, cy = 36;
    const startAngle = Math.PI * 0.72;   // ~130°
    const endAngle   = Math.PI * 2.28;   // ~410° (casi vuelta completa)
    const angle = startAngle + (endAngle - startAngle) * ratio;
    const x1 = cx + r*Math.cos(startAngle), y1 = cy + r*Math.sin(startAngle);
    const x2 = cx + r*Math.cos(angle),      y2 = cy + r*Math.sin(angle);
    const large = ratio > 0.5 ? 1 : 0;
    if (ratio < 0.01) { arc.setAttribute('d', `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x1} ${y1}`); return; }
    arc.setAttribute('d', `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`);
    // Color: verde → amarillo → rojo según velocidad
    const col = ratio < 0.5 ? '#00ffaa' : ratio < 0.8 ? '#FFD600' : '#ff4444';
    arc.setAttribute('stroke', col);
    txt.setAttribute('fill', col);
  }

  function updateNitroSegs(pct) {
    const segs = document.querySelectorAll('.nitroSeg');
    const filled = Math.round(pct / 20);   // 0-5 segmentos
    segs.forEach((s, i) => {
      const on = i < filled;
      s.style.background = on ? `rgba(0,${170+i*10},255,${0.7+i*0.06})` : 'rgba(0,170,255,0.12)';
      s.style.borderColor = on ? `rgba(0,200,255,0.6)` : 'rgba(0,170,255,0.15)';
      s.style.boxShadow  = on ? `0 0 6px rgba(0,200,255,0.5)` : 'none';
    });
  }

  function updateGear(kmh) {
    const el = document.getElementById('raceGear');
    if (!el) return;
    const g = kmh < 40 ? 1 : kmh < 80 ? 2 : kmh < 120 ? 3 : kmh < 160 ? 4 : kmh < 185 ? 5 : 'N';
    el.textContent = g;
    el.style.color = kmh > 160 ? '#ff4444' : kmh > 120 ? '#FFD600' : '#00ffaa';
  }

  function loop(ts) {
    if (!document.getElementById('racingGame')) return;
    const dt = Math.min(ts - lastT, 50); lastT = ts;
    if (running) update(dt);
    draw(ts);
    animId = registerAnimation(requestAnimationFrame(loop));
  }

  function update(dt) {
    const dtS = dt / 1000;
    dayTime = (dayTime + dtS / 90) % 1;

    /* Steering — control directo y responsivo */
    let steerDir = 0;
    if (keys['ArrowLeft'] || keys['a']) steerDir = -1;
    if (keys['ArrowRight'] || keys['d']) steerDir = 1;
    steering += (steerDir - steering) * 0.3;   // suaviza pero responde rápido

    /* Nitro */
    if ((keys[' '] || keys['nitro']) && nitro > 0) {
      nitroActive = true;
      nitro = Math.max(0, nitro - dtS * 30);
    } else {
      nitroActive = false;
      if (!keys[' '] && !keys['nitro']) nitro = Math.min(100, nitro + dtS * 8);
    }
    updateNitroSegs(nitro);

    /* Velocidad */
    const targetSpeed = nitroActive ? 180 : 120 + dist / 200;
    speed += (targetSpeed - speed) * 0.08;
    const kmh = Math.round(speed);
    updateSpeedArc(kmh);
    updateGear(kmh);

    /* Posición en la carretera */
    pos += speed * dtS * 0.01;
    dist += Math.round(speed * dtS * 0.05);
    setText('raceDist', dist);

    /* Curva dinámica (suave, una sola dirección a la vez) */
    curveTimer -= dtS;
    if (curveTimer <= 0) {
      targetCurve = (Math.random() - 0.5) * 0.025;
      curveTimer = 4 + Math.random() * 5;
    }
    roadCurve += (targetCurve - roadCurve) * 0.02;
    /* Movimiento lateral del auto: el volante manda directo, y la curva
       empuja levemente hacia afuera (sensación realista). */
    cameraX += steering * dtS * 1.8 + roadCurve * speed * dtS * 0.10;
    /* Sin amortiguación fuerte: el auto se queda donde lo dejas */
    cameraX *= 0.97;

    /* Colisión con bordes */
    if (Math.abs(cameraX) > 1.1) {
      crash();
      return;
    }

    /* Spawning de rivales */
    if (Math.random() < dtS * 0.8) {
      const lane = (Math.random() - 0.5) * 1.4;
      rivals.push({
        roadPos: pos + 0.8 + Math.random() * 0.4,
        lane,
        color: RIVAL_COLORS[Math.floor(Math.random() * RIVAL_COLORS.length)],
        speed: speed * (0.55 + Math.random() * 0.3),
      });
    }

    /* Mover rivales */
    rivals.forEach(r => { r.roadPos -= (speed - r.speed) * dtS * 0.01; });
    rivals = rivals.filter(r => r.roadPos > pos - 0.05 && r.roadPos < pos + 1.2);

    /* Colisión con rivales */
    rivals.forEach(r => {
      const dz = r.roadPos - pos;
      if (dz > 0 && dz < 0.08) {
        const dx = Math.abs(r.lane - cameraX * 0.6);
        if (dx < 0.25) {
          rivals = rivals.filter(x => x !== r);
          crash();
        }
      }
    });

    /* Shake */
    if (shakeT > 0) shakeT -= dtS;
  }

  function crash() {
    lives--;
    const livesEl = document.getElementById('raceLivesHUD');
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0,lives)) + '🖤'.repeat(Math.max(0,3-lives));
    shakeT = 0.5;
    SFX.hit();
    if (lives <= 0) {
      running = false;
      saveRecord('racing', dist);
      if (typeof darRecompensa === 'function') darRecompensa(Math.floor(dist/50), score, '🏎️ Racing');
      try { showToast('💥 ¡Choque! Distancia: ' + dist + 'm'); } catch(e) {}
    } else {
      try { showToast('💥 Vida perdida! Quedan ' + lives); } catch(e) {}
      speed *= 0.4;
      cameraX *= 0.2;
    }
  }

  /* ── DIBUJO ── */
  function draw(ts) {
    const shake = shakeT > 0 ? (Math.random()-0.5)*8*shakeT : 0;
    ctx.save();
    if (shake) ctx.translate(shake, shake*0.5);

    /* Cielo dinámico */
    const night = (Math.sin(dayTime * Math.PI * 2 - Math.PI/2) * 0.5 + 0.5) * 0.8;
    const skyTop = lerpColor('#1a6fc4','#050a20', night);
    const skyBot = lerpColor('#87CEEB','#1a2a50', night);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(1, skyBot);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, HORIZON);

    /* Sol o Luna */
    if (night < 0.5) {
      const sunX = W * (0.3 + night * 0.4), sunY = HORIZON * (0.2 + night*0.3);
      const sunR = 22 - night*8;
      const sunColor = lerpColor('#FFD600','#FF6B00', night*2);
      ctx.fillStyle = sunColor; ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(255,200,0,${0.15*(1-night*2)})`;
      ctx.beginPath(); ctx.arc(sunX, sunY, sunR+12, 0, Math.PI*2); ctx.fill();
    } else {
      const moonX = W * 0.75, moonY = HORIZON * 0.2;
      ctx.fillStyle = `rgba(240,240,200,${(night-0.5)*1.5})`;
      ctx.beginPath(); ctx.arc(moonX, moonY, 16, 0, Math.PI*2); ctx.fill();
    }

    /* Nubes */
    if (night < 0.6) {
      ctx.fillStyle = `rgba(255,255,255,${0.7*(1-night/0.6)})`;
      [[W*0.15, HORIZON*0.25, 50,18],[W*0.6, HORIZON*0.15, 70,22],[W*0.85, HORIZON*0.35, 40,14]].forEach(([cx,cy,cw,ch]) => {
        ctx.beginPath(); ctx.ellipse(cx + Math.sin(ts/8000)*8, cy, cw, ch, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+cw*0.3 + Math.sin(ts/8000)*8, cy-ch*0.3, cw*0.6, ch*0.7, 0, 0, Math.PI*2); ctx.fill();
      });
    }

    /* Montañas */
    const mtnColor = lerpColor('#2d5a27','#0a1a08', night);
    const mtnColor2 = lerpColor('#3d7a34','#121a10', night);
    ctx.fillStyle = mtnColor;
    const mtnPts = [[0,HORIZON],[W*0.12,HORIZON-55],[W*0.22,HORIZON-30],[W*0.38,HORIZON-70],[W*0.5,HORIZON-20],[W*0.65,HORIZON-80],[W*0.78,HORIZON-40],[W*0.9,HORIZON-60],[W,HORIZON-25],[W,HORIZON]];
    ctx.beginPath(); mtnPts.forEach(([mx,my],i)=> i===0?ctx.moveTo(mx,my):ctx.lineTo(mx,my)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = mtnColor2;
    const mtnPts2 = [[0,HORIZON],[W*0.1,HORIZON-35],[W*0.25,HORIZON-55],[W*0.4,HORIZON-30],[W*0.55,HORIZON-65],[W*0.7,HORIZON-28],[W*0.85,HORIZON-50],[W,HORIZON-35],[W,HORIZON]];
    ctx.beginPath(); mtnPts2.forEach(([mx,my],i)=> i===0?ctx.moveTo(mx,my):ctx.lineTo(mx,my)); ctx.closePath(); ctx.fill();

    /* ── CARRETERA pseudo-3D (curva suave de un solo camino) ── */
    const roadW_near = W * 0.92;   // ancho carretera abajo (cerca)
    const roadW_far  = W * 0.06;   // ancho carretera en horizonte (lejos)
    const roadColors = {
      asphalt:  lerpColor('#3c3c3c','#1a1a1a',night),
      asphalt2: lerpColor('#343434','#161616',night),
      line:     lerpColor('#fff8d0','#5a5533',night),
      border:   lerpColor('#f0f0f0','#444444',night),
      grass:    lerpColor('#3a8d48','#16321e',night),
      grass2:   lerpColor('#329040','#13301a',night),
      rumble:   lerpColor('#d02828','#661111',night),
    };

    /* La curva se acumula de forma cuadrática a lo largo de la profundidad.
       curveAmount controla cuánto se desvía la pista. Como dibujamos de
       lejos (seg alto) a cerca (seg bajo), calculamos el desplazamiento X
       del centro de la pista en función de la profundidad normalizada. */
    const curveAmount = roadCurve * 600;   // intensidad horizontal de la curva
    const playerShift = cameraX * (roadW_near * 0.42);  // cuánto se desplaza el jugador

    for (let seg = NUM_SEGMENTS; seg >= 0; seg--) {
      /* p = profundidad: 0 = horizonte (lejos), 1 = parte baja (cerca de la cámara) */
      const p  = seg / NUM_SEGMENTS;
      const p2 = (seg - 1) / NUM_SEGMENTS;
      /* Y en pantalla: p=0 -> HORIZON (arriba), p=1 -> H (abajo) */
      const y1 = HORIZON + (H - HORIZON) * p;
      const y2 = HORIZON + (H - HORIZON) * p2;

      /* Ancho: angosto en el horizonte (p=0), ancho cerca (p=1) */
      const rW = roadW_far + (roadW_near - roadW_far) * p;

      /* Centro de la pista: la curva se nota más lejos (cuando p es chico).
         depth = 1-p  → 1 lejos, 0 cerca. El jugador se desplaza más cerca. */
      const depth = 1 - p;
      const centerX = W/2 + curveAmount * (depth * depth) - playerShift * p;
      const rx = centerX - rW/2;

      /* Franjas que avanzan con el movimiento */
      const stripe = Math.floor(pos * 8 + seg * 0.5) % 2 === 0;

      /* Hierba lateral (todo el ancho de pantalla) */
      ctx.fillStyle = stripe ? roadColors.grass : roadColors.grass2;
      ctx.fillRect(0, y1, W, y2 - y1 + 1);

      /* Bandas rumble (bordes) */
      ctx.fillStyle = stripe ? roadColors.rumble : roadColors.border;
      ctx.fillRect(rx - rW*0.06, y1, rW*0.06, y2 - y1 + 1);
      ctx.fillRect(rx + rW,       y1, rW*0.06, y2 - y1 + 1);

      /* Asfalto */
      ctx.fillStyle = stripe ? roadColors.asphalt : roadColors.asphalt2;
      ctx.fillRect(rx, y1, rW, y2 - y1 + 1);

      /* Línea central discontinua */
      const dash = Math.floor(pos * 8 + seg * 0.5) % 3 === 0;
      if (dash && rW > 14) {
        ctx.fillStyle = roadColors.line;
        ctx.fillRect(centerX - rW*0.012, y1, rW*0.024, y2 - y1 + 1);
      }
    }

    /* Helper: centro X de la pista a una profundidad dada (depth: 0=cerca,1=lejos) */
    function roadCenterAt(t) {
      const depth = 1 - t;
      return W/2 + curveAmount * (depth * depth) - playerShift * t;
    }

    /* ── Árboles (sprites) ── */
    trees.forEach(tree => {
      const dz = ((tree.roadPos - (pos % 1) + 1) % 1);
      if (dz < 0.04 || dz > 0.98) return;
      const t = 1 - dz;
      const y = HORIZON + (H - HORIZON) * t;
      const rW = roadW_far + (roadW_near - roadW_far) * t;
      /* Posición sobre el borde de la pista curvada */
      const rx = roadCenterAt(t) + tree.lane * (rW/2 + rW*0.16);
      const tH = tree.size * 60 * t;
      const tW = tH * 0.65;

      ctx.save();
      /* Sombra */
      ctx.fillStyle = `rgba(0,0,0,${0.3*t})`;
      ctx.beginPath(); ctx.ellipse(rx, y+tH*0.05, tW*0.4, tH*0.06, 0, 0, Math.PI*2); ctx.fill();

      if (tree.type === 0) {
        /* Pino */
        ctx.fillStyle = lerpColor('#1a5c22','#0a2e10',night);
        ctx.beginPath(); ctx.moveTo(rx, y-tH); ctx.lineTo(rx-tW/2, y); ctx.lineTo(rx+tW/2, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = lerpColor('#22782d','#112214',night);
        ctx.beginPath(); ctx.moveTo(rx, y-tH*0.75); ctx.lineTo(rx-tW*0.55, y-tH*0.1); ctx.lineTo(rx+tW*0.55, y-tH*0.1); ctx.closePath(); ctx.fill();
        /* Tronco */
        ctx.fillStyle = lerpColor('#6b3a1f','#2a1508',night);
        ctx.fillRect(rx-tW*0.07, y-tH*0.12, tW*0.14, tH*0.15);
      } else if (tree.type === 1) {
        /* Árbol redondeado */
        ctx.fillStyle = lerpColor('#6b3a1f','#2a1508',night);
        ctx.fillRect(rx-tW*0.08, y-tH*0.35, tW*0.16, tH*0.38);
        ctx.fillStyle = lerpColor('#2d7d32','#0f2e12',night);
        ctx.beginPath(); ctx.arc(rx, y-tH*0.55, tW*0.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = lerpColor('#388e3c','#142e15',night);
        ctx.beginPath(); ctx.arc(rx-tW*0.18, y-tH*0.62, tW*0.32, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx+tW*0.18, y-tH*0.58, tW*0.28, 0, Math.PI*2); ctx.fill();
      } else {
        /* Arbusto */
        ctx.fillStyle = lerpColor('#4a7c2d','#1e3210',night);
        ctx.beginPath(); ctx.arc(rx, y-tH*0.3, tW*0.4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = lerpColor('#5a9c3a','#223814',night);
        ctx.beginPath(); ctx.arc(rx-tW*0.25, y-tH*0.2, tW*0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx+tW*0.22, y-tH*0.25, tW*0.28, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    });

    /* ── Rivales (autos vistos por detrás) ── */
    rivals.sort((a,b) => b.roadPos - a.roadPos).forEach(r => {
      const dz = r.roadPos - pos;
      if (dz < 0.02 || dz > 1.1) return;
      const t = Math.min(1, (1.1 - dz) / 1.08);
      const screenY = HORIZON + (H - HORIZON) * t;
      const rW = roadW_far + (roadW_near - roadW_far) * t;
      const rx = roadCenterAt(t) + r.lane * rW * 0.27;
      const cW = rW * 0.30;          // más ancho (antes 0.18 = se veía plano)
      const cH = cW * 0.95;          // alto proporcional al ancho
      const col = r.color;
      if (cW < 6) return;            // muy lejos, no dibujar

      ctx.save();
      ctx.translate(rx, screenY);

      /* Sombra */
      ctx.fillStyle = `rgba(0,0,0,${0.4*t})`;
      ctx.beginPath(); ctx.ellipse(0, 2, cW*0.58, cH*0.12, 0, 0, Math.PI*2); ctx.fill();

      /* Ruedas traseras (sobresalen a los lados) */
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.ellipse(-cW*0.48, -cH*0.15, cW*0.16, cH*0.22, 0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse( cW*0.48, -cH*0.15, cW*0.16, cH*0.22, 0,0,Math.PI*2); ctx.fill();

      /* Cuerpo (trapecio: más ancho abajo) */
      ctx.fillStyle = col.body;
      ctx.beginPath();
      ctx.moveTo(-cW*0.5, 0);
      ctx.lineTo( cW*0.5, 0);
      ctx.lineTo( cW*0.42, -cH*0.6);
      ctx.lineTo(-cW*0.42, -cH*0.6);
      ctx.closePath(); ctx.fill();

      /* Techo */
      ctx.fillStyle = col.roof;
      ctx.beginPath();
      ctx.moveTo(-cW*0.38, -cH*0.55);
      ctx.lineTo( cW*0.38, -cH*0.55);
      ctx.lineTo( cW*0.28, -cH);
      ctx.lineTo(-cW*0.28, -cH);
      ctx.closePath(); ctx.fill();

      /* Luneta (vidrio trasero) */
      ctx.fillStyle = col.window;
      ctx.beginPath();
      ctx.moveTo(-cW*0.30, -cH*0.62);
      ctx.lineTo( cW*0.30, -cH*0.62);
      ctx.lineTo( cW*0.22, -cH*0.92);
      ctx.lineTo(-cW*0.22, -cH*0.92);
      ctx.closePath(); ctx.fill();

      /* Faros traseros rojos */
      ctx.fillStyle = '#ff2828';
      ctx.beginPath(); ctx.roundRect(-cW*0.46, -cH*0.32, cW*0.26, cH*0.13, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect( cW*0.20, -cH*0.32, cW*0.26, cH*0.13, 2); ctx.fill();

      /* Parachoques */
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.roundRect(-cW*0.5, -cH*0.12, cW, cH*0.12, 2); ctx.fill();

      ctx.restore();
    });

    /* ── Auto del jugador ── */
    drawPlayerCar(ts);

    /* ── Nitro llamas ── */
    if (nitroActive) {
      const px = W/2, py = H-22;
      for (let i = 0; i < 3; i++) {
        const fl = Math.sin(ts/60 + i*2) * 0.5 + 0.5;
        ctx.fillStyle = i%2===0 ? `rgba(0,180,255,${0.8*fl})` : `rgba(0,255,200,${0.6*fl})`;
        ctx.beginPath();
        ctx.moveTo(px + (i-1)*14, py+8);
        ctx.lineTo(px + (i-1)*14 - 6, py + 28 + fl*18);
        ctx.lineTo(px + (i-1)*14 + 6, py + 28 + fl*18);
        ctx.closePath(); ctx.fill();
      }
    }

    /* Overlay noche */
    if (night > 0.15) {
      ctx.fillStyle = `rgba(0,0,20,${night*0.5})`;
      ctx.fillRect(0, 0, W, H);
      /* Estrellas */
      for (let i = 0; i < 30; i++) {
        const sx = (i*73+W*0.1) % W, sy = (i*47) % HORIZON;
        const flicker = Math.sin(ts/500 + i) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255,255,220,${night*flicker*0.9})`;
        ctx.beginPath(); ctx.arc(sx, sy, 0.8+Math.random()*0.5, 0, Math.PI*2); ctx.fill();
      }
    }

    /* ── Game Over overlay ── */
    if (!running) {
      ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#FF4D9D'; ctx.font=`bold ${Math.round(W/9)}px Fredoka One,cursive`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('💥 GAME OVER', W/2, H/2-24);
      ctx.fillStyle='#FFD600'; ctx.font=`bold ${Math.round(W/16)}px Nunito,sans-serif`;
      ctx.fillText(dist+'m · '+score+' pts', W/2, H/2+10);
      ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font=`${Math.round(W/22)}px Nunito,sans-serif`;
      ctx.fillText('Toca ↺ para volver a jugar', W/2, H/2+38);
    }

    ctx.restore();
  }

  function drawPlayerCar(ts) {
    /* ════════════════════════════════════════════════════════════
       VISTA TRASERA REALISTA — usamos polígonos en perspectiva.
       La cámara está DETRÁS y un poco ARRIBA del auto.
       Por eso vemos: el TECHO (parte de arriba, más estrecho),
       la LUNETA trasera, la CAJUELA inclinada, el PORTÓN trasero
       con las luces, y abajo el PARACHOQUES + ruedas que sobresalen.
       Coordenadas: pivot (0,0) = centro del auto a nivel del piso.
       Y negativo = hacia arriba en pantalla.
    ════════════════════════════════════════════════════════════ */
    const px = W / 2 - cameraX * 50;
    const py = H - 6;
    const S  = 0.80;                 // escala general
    const lean = cameraX * 0.05;
    const flare = 0.7 + Math.sin(ts / 200) * 0.3;
    const spin = (ts / 60) % (Math.PI * 2);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(lean);
    ctx.scale(S, S);

    // Medidas base (en unidades pre-escala)
    const wBottom = 92;   // ancho abajo (parachoques, lo más cercano = más ancho)
    const wTop    = 64;   // ancho arriba (techo, más lejos = más estrecho)
    const hBody   = 96;   // alto del cuerpo
    const yFloor  = 0;    // piso
    const yRoof   = -hBody;

    /* ── 1. Sombra en el piso ── */
    ctx.fillStyle = 'rgba(0,0,0,0.40)';
    ctx.beginPath();
    ctx.ellipse(0, -4, wBottom * 0.58, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    /* ── 2. Ruedas traseras (sobresalen a los lados, abajo) ── */
    const wheel = (sx) => {
      ctx.save();
      ctx.translate(sx, -16);
      // Neumático
      ctx.fillStyle = '#0d0d0d';
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 15, 0, 0, Math.PI * 2); ctx.fill();
      // Rin
      ctx.fillStyle = '#9a9a9a';
      ctx.beginPath(); ctx.ellipse(0, 0, 10, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2;
      for (let s = 0; s < 5; s++) {
        const a = spin + s * Math.PI * 2 / 5;
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 7); ctx.stroke();
      }
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };
    wheel(-(wBottom/2) + 6);
    wheel( (wBottom/2) - 6);

    /* ── 3. Cuerpo principal: trapecio (ancho abajo, estrecho arriba) ── */
    const yTrunkTop = yRoof + 40;   // donde acaba la cajuela y empieza el techo
    const bodyGrad = ctx.createLinearGradient(-wBottom/2, 0, wBottom/2, 0);
    bodyGrad.addColorStop(0,    '#8e0f0f');
    bodyGrad.addColorStop(0.16, '#c81d1d');
    bodyGrad.addColorStop(0.5,  '#ff3b3b');
    bodyGrad.addColorStop(0.84, '#c81d1d');
    bodyGrad.addColorStop(1,    '#8e0f0f');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-wBottom/2,  yFloor - 4);     // abajo izq
    ctx.lineTo( wBottom/2,  yFloor - 4);     // abajo der
    ctx.lineTo( wBottom/2,  yTrunkTop + 14); // sube lado der
    ctx.lineTo( wTop/2,     yTrunkTop);      // se estrecha hacia el techo der
    ctx.lineTo(-wTop/2,     yTrunkTop);      // techo izq
    ctx.lineTo(-wBottom/2,  yTrunkTop + 14); // baja lado izq
    ctx.closePath();
    ctx.fill();

    /* Brillo lateral del cuerpo */
    ctx.fillStyle = 'rgba(255,170,170,0.18)';
    ctx.beginPath();
    ctx.moveTo(-wBottom/2 + 5, yFloor - 8);
    ctx.lineTo(-wBottom/2 + 14, yFloor - 8);
    ctx.lineTo(-wTop/2 + 12, yTrunkTop + 4);
    ctx.lineTo(-wTop/2 + 4, yTrunkTop + 4);
    ctx.closePath(); ctx.fill();

    /* ── 4. Techo + luneta trasera (arriba, más estrecho = perspectiva) ── */
    const roofGrad = ctx.createLinearGradient(0, yRoof, 0, yTrunkTop);
    roofGrad.addColorStop(0, '#6e0a0a');
    roofGrad.addColorStop(1, '#9a1414');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(-wTop/2 + 4, yTrunkTop);
    ctx.lineTo( wTop/2 - 4, yTrunkTop);
    ctx.lineTo( wTop/2 - 10, yRoof + 6);
    ctx.lineTo(-wTop/2 + 10, yRoof + 6);
    ctx.closePath();
    ctx.fill();

    /* Luneta (vidrio trasero) — trapecio que sigue la inclinación */
    ctx.fillStyle = 'rgba(120,185,255,0.80)';
    ctx.beginPath();
    ctx.moveTo(-wTop/2 + 9,  yTrunkTop - 3);
    ctx.lineTo( wTop/2 - 9,  yTrunkTop - 3);
    ctx.lineTo( wTop/2 - 13, yRoof + 10);
    ctx.lineTo(-wTop/2 + 13, yRoof + 10);
    ctx.closePath();
    ctx.fill();
    /* Reflejo en la luneta */
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.beginPath();
    ctx.moveTo(-wTop/2 + 12, yTrunkTop - 5);
    ctx.lineTo(-wTop/2 + 28, yTrunkTop - 5);
    ctx.lineTo(-wTop/2 + 26, yRoof + 12);
    ctx.lineTo(-wTop/2 + 15, yRoof + 12);
    ctx.closePath(); ctx.fill();

    /* ── 5. Línea de la cajuela (separa portón del techo) ── */
    ctx.strokeStyle = 'rgba(90,0,0,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-wBottom/2 + 8, yTrunkTop + 14);
    ctx.lineTo( wBottom/2 - 8, yTrunkTop + 14);
    ctx.stroke();

    /* ── 6. Faros traseros (franja roja horizontal típica de autos modernos) ── */
    const lampY = -38;
    // Izquierdo
    ctx.fillStyle = `rgba(255,30,30,${flare})`;
    ctx.beginPath(); ctx.roundRect(-wBottom/2 + 6, lampY, 28, 13, 3); ctx.fill();
    // Derecho
    ctx.beginPath(); ctx.roundRect( wBottom/2 - 34, lampY, 28, 13, 3); ctx.fill();
    // Brillo interno
    ctx.fillStyle = `rgba(255,140,140,${flare * 0.6})`;
    ctx.beginPath(); ctx.roundRect(-wBottom/2 + 9, lampY + 3, 22, 6, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect( wBottom/2 - 31, lampY + 3, 22, 6, 2); ctx.fill();
    // Halo
    ctx.fillStyle = `rgba(255,0,0,${flare * 0.18})`;
    ctx.beginPath(); ctx.ellipse(-wBottom/2 + 20, lampY + 6, 26, 13, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( wBottom/2 - 20, lampY + 6, 26, 13, 0, 0, Math.PI*2); ctx.fill();
    // Tercera luz de freno (centro, arriba)
    ctx.fillStyle = `rgba(255,40,40,${flare})`;
    ctx.beginPath(); ctx.roundRect(-12, yTrunkTop + 2, 24, 4, 2); ctx.fill();

    /* ── 7. Placa de matrícula ── */
    ctx.fillStyle = '#eee';
    ctx.beginPath(); ctx.roundRect(-16, -20, 32, 11, 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
    ctx.fillText('HUGO', 0, -12);

    /* ── 8. Parachoques inferior (lo más cercano, negro) ── */
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.moveTo(-wBottom/2, yFloor - 4);
    ctx.lineTo( wBottom/2, yFloor - 4);
    ctx.lineTo( wBottom/2 - 4, yFloor - 18);
    ctx.lineTo(-wBottom/2 + 4, yFloor - 18);
    ctx.closePath(); ctx.fill();
    /* Difusor (rejillas) */
    ctx.fillStyle = '#2a2a2a';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.roundRect(i * 12 - 4, yFloor - 15, 8, 10, 1); ctx.fill();
    }

    /* ── 9. Escapes + nitro ── */
    [-26, 18].forEach(ex => {
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.roundRect(ex, yFloor - 8, 9, 6, 2); ctx.fill();
    });
    if (nitroActive) {
      for (let i = 0; i < 2; i++) {
        const fl = Math.sin(ts/50 + i*2)*0.5 + 0.5;
        const fx = i === 0 ? -21 : 22;
        ctx.fillStyle = `rgba(0,${160+fl*80},255,${0.8*fl})`;
        ctx.beginPath();
        ctx.moveTo(fx-6, yFloor-4);
        ctx.lineTo(fx,   yFloor + 18 + fl*14);
        ctx.lineTo(fx+6, yFloor-4);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(220,245,255,${0.7*fl})`;
        ctx.beginPath();
        ctx.moveTo(fx-2.5, yFloor-4);
        ctx.lineTo(fx,     yFloor + 9 + fl*7);
        ctx.lineTo(fx+2.5, yFloor-4);
        ctx.closePath(); ctx.fill();
      }
    }

    /* ── 10. Alerón trasero (arriba del techo) ── */
    ctx.fillStyle = '#5e0a0a';
    ctx.fillRect(-wTop/2 + 14, yRoof - 2, 6, 10);
    ctx.fillRect( wTop/2 - 20, yRoof - 2, 6, 10);
    ctx.fillStyle = '#7a0d0d';
    ctx.beginPath(); ctx.roundRect(-wTop/2 + 2, yRoof - 8, wTop - 4, 7, 2); ctx.fill();

    ctx.restore();
  }

  /* ── Helper: interpolar colores ── */
  function lerpColor(a, b, t) {
    const pa=(c)=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const [ar,ag,ab]=pa(a),[br,bg,bb]=pa(b);
    return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
  }

  /* ── Controles teclado ── */
  function kd(e) {
    keys[e.key] = true;
    if (e.key === ' ') e.preventDefault();
  }
  function ku(e) { keys[e.key] = false; }
  document.addEventListener('keydown', kd);
  document.addEventListener('keyup', ku);
  window.activeKeyHandlers.push(kd, ku);

  /* ── Controles táctiles ── */
  canvas.addEventListener('touchstart', e => {
    const tx = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (tx < W * 0.35) keys['ArrowLeft'] = true;
    else if (tx > W * 0.65) keys['ArrowRight'] = true;
    else keys['nitro'] = true;
    e.preventDefault();
  }, {passive:false});
  canvas.addEventListener('touchend', e => {
    keys['ArrowLeft'] = false; keys['ArrowRight'] = false; keys['nitro'] = false;
    e.preventDefault();
  }, {passive:false});

  /* ── Botones en pantalla ── */
  window.raceReset = reset;
  const pad = document.createElement('div');
  pad.className = 'touch-controls';
  pad.style.cssText = 'flex-direction:row;justify-content:center;gap:10px;padding:8px 0';
  pad.innerHTML = `
    <button class="tbtn" id="raceLeft" style="font-size:1.5rem">◀</button>
    <button class="tbtn" id="raceNitro" style="background:linear-gradient(135deg,#00aaff,#00ffff);box-shadow:0 4px 0 #004488;font-size:1rem;width:120px">⚡ NITRO</button>
    <button class="tbtn" id="raceRight" style="font-size:1.5rem">▶</button>`;
  pad.querySelectorAll('button').forEach(btn => {
    const press = (k,v) => e => { e.preventDefault(); keys[k]=v; };
    if (btn.id==='raceLeft') {
      btn.addEventListener('touchstart', press('ArrowLeft',true), {passive:false});
      btn.addEventListener('touchend', press('ArrowLeft',false), {passive:false});
      btn.addEventListener('mousedown', press('ArrowLeft',true));
      btn.addEventListener('mouseup', press('ArrowLeft',false));
    } else if (btn.id==='raceRight') {
      btn.addEventListener('touchstart', press('ArrowRight',true), {passive:false});
      btn.addEventListener('touchend', press('ArrowRight',false), {passive:false});
      btn.addEventListener('mousedown', press('ArrowRight',true));
      btn.addEventListener('mouseup', press('ArrowRight',false));
    } else {
      btn.addEventListener('touchstart', press('nitro',true), {passive:false});
      btn.addEventListener('touchend', press('nitro',false), {passive:false});
      btn.addEventListener('mousedown', press('nitro',true));
      btn.addEventListener('mouseup', press('nitro',false));
    }
  });
  container.querySelector('.game-container').appendChild(pad);
  reset();
}

// ═══════════════════════════════════════════
//  GAME 7: PONG
// ═══════════════════════════════════════════
if (typeof buildRacing === "function") window.buildRacing = buildRacing;
