function buildPlatform(container) {
  /* ══ SÚPER SALTO — Plataformas realistas ══
     Parallax de nubes/montañas, personaje animado,
     suelo con textura, obstáculos variados, monedas
  ══════════════════════════════════════════════ */
  let W = Math.min(380, window.innerWidth - 40);
  let H = Math.min(300, maxGameHeight(), Math.round(W * 0.78));
  container.innerHTML = `
    <div class="game-container" style="position:relative;background:#87CEEB">
      <canvas id="plGame" width="${W}" height="${H}" style="display:block"></canvas>
      <div style="position:absolute;top:0;left:0;width:100%;pointer-events:none;display:flex;justify-content:space-between;align-items:center;padding:7px 12px;background:rgba(0,0,0,0.3)">
        <span style="color:#fff;font-weight:800;font-size:0.85rem">🪙 <span id="plScore">0</span></span>
        <span style="color:#fff;font-weight:800;font-size:0.85rem">📏 <span id="plDist">0</span>/<span id="plGoal">300</span>m</span>
        <span style="color:#fff;font-weight:800;font-size:0.85rem">❤️ <span id="plLives">3</span></span>
        <button onclick="window.plReset()" style="background:#7C3AED;border:none;color:#fff;padding:4px 10px;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.75rem">↺</button>
      </div>
    </div>
    <div class="game-instructions"><strong>SALTAR:</strong> Toca pantalla / Espacio / ↑ · Doble toque = doble salto · ¡Llega a la meta de 300m esquivando obstáculos!</div>`;

  const canvas = document.getElementById('plGame');
  const ctx = canvas.getContext('2d');
  const GROUND = H - 32;
  const GRAV = 0.55, JUMP_V = -13, DJUMP_V = -11;

  /* ── Parallax layers ── */
  let parallaxX = [0, 0, 0];  // 3 capas: nubes lejanas, montañas, árboles

  /* ── Partículas ── */
  const pars = [];
  function addPar(x, y, col, n=6) {
    for (let i=0;i<n;i++) {
      const a=Math.random()*Math.PI*2;
      pars.push({x,y,vx:Math.cos(a)*(1+Math.random()*3),vy:Math.sin(a)*(1+Math.random()*3)-2,life:1,r:2+Math.random()*3,col});
    }
  }

  /* ── Estado ── */
  let hero, obstacles, coins, dist, distFloat, score, speed, animId, running, lives, won;
  let frameN = 0;  // para animación del personaje
  const GOAL = 300;  // meta en metros

  function reset() {
    hero = {x:60, y:GROUND-40, w:28, h:40, vy:0, vx:0, jumping:false, djump:false, run:0, dead:false};
    obstacles=[]; coins=[]; dist=0; distFloat=0; score=0; speed=4; running=true; lives=3; frameN=0; won=false;
    parallaxX=[0,0,0]; pars.length=0;
    setText('plScore',0); setText('plDist',0); setText('plGoal', GOAL);
    document.getElementById('plLives').textContent='3';
    if (animId) cancelAnimationFrame(animId);
    animId = registerAnimation(requestAnimationFrame(loop));
  }

  let canDJump = false;
  function jump() {
    if (!running) { reset(); return; }
    if (!hero.jumping) {
      hero.vy = JUMP_V; hero.jumping = true; canDJump = true; SFX.jump();
    } else if (canDJump) {
      hero.vy = DJUMP_V; canDJump = false; SFX.jump();
      addPar(hero.x+hero.w/2, hero.y+hero.h, '#aaddff', 8);
    }
  }

  function loop() {
    if (!document.getElementById('plGame')) return;
    frameN++;
    if (running) update();
    pars.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life-=0.05;p.r*=0.93;});
    pars.filter(p=>p.life>0);
    draw();
    animId = registerAnimation(requestAnimationFrame(loop));
  }

  function update() {
    if (window.HK_PAUSED) return;
        /* Parallax */
    parallaxX[0] = (parallaxX[0] - speed*0.15) % W;
    parallaxX[1] = (parallaxX[1] - speed*0.3) % W;
    parallaxX[2] = (parallaxX[2] - speed*0.6) % (W*2);

    /* Física del héroe */
    hero.vy += GRAV;
    hero.y += hero.vy;
    if (hero.y >= GROUND - hero.h) {
      hero.y = GROUND - hero.h; hero.vy = 0; hero.jumping = false; canDJump = false;
    }
    hero.run = (hero.run + 0.18) % (Math.PI*2);

    /* Spawn obstáculos */
    if (frameN % Math.max(40, 90 - Math.floor(dist/200)) === 0) {
      const h = 28 + Math.random()*24;
      const types = ['cactus','stone','log'];
      obstacles.push({x:W+20, y:GROUND-h, w:22, h, type:types[Math.floor(Math.random()*types.length)]});
    }
    /* Spawn monedas */
    if (frameN % 55 === 0) {
      const yOff = Math.random() < 0.5 ? 0 : -(40 + Math.random()*50);
      coins.push({x:W+20, y:GROUND-22+yOff, r:9, got:false});
    }

    /* Mover objetos */
    obstacles.forEach(o => o.x -= speed);
    coins.forEach(c => c.x -= speed);
    obstacles = obstacles.filter(o => o.x > -40);
    coins = coins.filter(c => c.x > -20 && !c.got);

    /* Distancia: acumular en flotante para no perder los decimales */
    distFloat += speed * 0.08;
    dist = Math.floor(distFloat);
    speed = 4 + dist/120;   // acelera gradualmente
    setText('plDist', Math.min(dist, GOAL));

    /* ¿Llegó a la meta? → ¡Ganó! */
    if (dist >= GOAL && running) {
      running = false; won = true;
      saveRecord('platform', dist);
      if (typeof darRecompensa==='function') darRecompensa(score + 20, dist, '🦸 Plataforma');
      try { showToast('🏁 ¡Meta alcanzada! +20🪙 bonus'); launchConfetti(); SFX.win(); } catch(e) {}
    }

    /* Colisiones obstáculos */
    for (const o of obstacles) {
      if (hero.x+hero.w-4 > o.x && hero.x+4 < o.x+o.w && hero.y+hero.h-2 > o.y && hero.y < o.y+o.h) {
        addPar(hero.x+hero.w/2, hero.y+hero.h/2, '#ff4444', 12);
        SFX.hit();
        lives--;
        const el = document.getElementById('plLives');
        if (el) el.textContent = lives;
        obstacles = obstacles.filter(x=>x!==o);
        if (lives <= 0) {
          running = false;
          saveRecord('platform', dist);
          if (typeof darRecompensa==='function') darRecompensa(score, dist, '🦸 Plataforma');
          try { showToast('💥 ¡Choque! '+dist+'m · '+score+' monedas'); } catch(e) {}
        } else {
          try { showToast('💔 Vida perdida · Quedan '+lives); } catch(e) {}
          hero.vy = -8; // rebotar
        }
        break;
      }
    }
    /* Colisiones monedas */
    coins.forEach(c => {
      if (!c.got && hero.x+hero.w>c.x-c.r && hero.x<c.x+c.r && hero.y+hero.h>c.y-c.r && hero.y<c.y+c.r) {
        c.got=true; score++; setText('plScore',score); SFX.coin();
        addPar(c.x, c.y, '#FFD600', 8);
      }
    });
  }

  function draw() {
    /* ── Cielo con degradado ── */
    const skyG = ctx.createLinearGradient(0,0,0,GROUND);
    skyG.addColorStop(0,'#4fa3e0'); skyG.addColorStop(1,'#b8e0f7');
    ctx.fillStyle=skyG; ctx.fillRect(0,0,W,GROUND);

    /* ── Nubes (capa 0, más lenta) ── */
    [[0.1,0.18,70,24],[0.35,0.1,90,28],[0.65,0.22,60,20],[0.85,0.12,80,25]].forEach(([fx,fy,cw,ch])=>{
      const cx = ((fx*W + parallaxX[0]) % W + W) % W;
      const cy = fy*GROUND;
      ctx.fillStyle='rgba(255,255,255,0.88)';
      ctx.beginPath(); ctx.ellipse(cx,cy,cw,ch,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+cw*0.35,cy-ch*0.3,cw*0.55,ch*0.7,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx-cw*0.3,cy-ch*0.15,cw*0.4,ch*0.6,0,0,Math.PI*2); ctx.fill();
    });

    /* ── Montañas lejanas (capa 1) ── */
    const mOffset = parallaxX[1];
    const drawMtn = (pts, col) => {
      ctx.fillStyle=col;
      ctx.beginPath();
      ctx.moveTo(pts[0][0]+mOffset, pts[0][1]);
      pts.forEach(([mx,my])=>ctx.lineTo(mx+mOffset,my));
      ctx.lineTo(pts[pts.length-1][0]+mOffset,GROUND);
      ctx.lineTo(pts[0][0]+mOffset,GROUND);
      ctx.closePath(); ctx.fill();
      // segunda repetición
      ctx.beginPath();
      ctx.moveTo(pts[0][0]+mOffset+W, pts[0][1]);
      pts.forEach(([mx,my])=>ctx.lineTo(mx+mOffset+W,my));
      ctx.lineTo(pts[pts.length-1][0]+mOffset+W,GROUND);
      ctx.lineTo(pts[0][0]+mOffset+W,GROUND);
      ctx.closePath(); ctx.fill();
    };
    drawMtn([[0,GROUND-70],[100,GROUND-120],[200,GROUND-80],[320,GROUND-110],[420,GROUND-60],[W,GROUND-75],[W+50,GROUND]],'#6b9e5a');
    drawMtn([[0,GROUND-50],[80,GROUND-90],[180,GROUND-60],[280,GROUND-100],[380,GROUND-55],[W,GROUND-65]],'#4a7a3a');

    /* ── Árboles fondo (capa 2) ── */
    const treePositions = [50,140,230,330,420,520,620,720,810,900,1000,1100];
    treePositions.forEach(tp => {
      const tx = ((tp + parallaxX[2]) % (W*2+200) - 200 + W*2) % (W*2) - W*0.1;
      if (tx < -30 || tx > W+30) return;
      const th = 50 + (tp%3)*12;
      /* Tronco */
      ctx.fillStyle='#6b4226'; ctx.fillRect(tx-4,GROUND-th,8,th*0.42);
      /* Copa */
      ctx.fillStyle=`hsl(${120+tp%20},55%,${32+tp%8}%)`;
      ctx.beginPath(); ctx.arc(tx,GROUND-th,th*0.38,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=`hsl(${125+tp%15},60%,${38+tp%6}%)`;
      ctx.beginPath(); ctx.arc(tx-th*0.18,GROUND-th*0.85,th*0.28,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(tx+th*0.2,GROUND-th*0.9,th*0.24,0,Math.PI*2); ctx.fill();
    });

    /* ── Suelo ── */
    /* Base del suelo */
    const dirtG = ctx.createLinearGradient(0,GROUND,0,H);
    dirtG.addColorStop(0,'#8B6914'); dirtG.addColorStop(1,'#5a3d08');
    ctx.fillStyle=dirtG; ctx.fillRect(0,GROUND,W,H-GROUND);
    /* Césped */
    const grassG = ctx.createLinearGradient(0,GROUND-6,0,GROUND+6);
    grassG.addColorStop(0,'#4a9e2a'); grassG.addColorStop(1,'#2e6a15');
    ctx.fillStyle=grassG; ctx.fillRect(0,GROUND-6,W,10);
    /* Textura raíces/hierba pequeña */
    for (let gx=0; gx<W; gx+=18) {
      ctx.fillStyle=`rgba(0,100,0,${0.15+Math.sin(gx)*0.1})`;
      ctx.fillRect(gx+((frameN*speed*0.05)|0)%18, GROUND-2, 6, 4);
    }

    /* ── Obstáculos ── */
    obstacles.forEach(o => {
      if (o.type==='cactus') {
        ctx.fillStyle='#2d7a1e';
        ctx.beginPath(); ctx.roundRect(o.x+6,o.y,10,o.h,4); ctx.fill();
        ctx.beginPath(); ctx.roundRect(o.x,o.y+o.h*0.35,22,8,4); ctx.fill();
        ctx.fillStyle='#3a9a28';
        ctx.beginPath(); ctx.roundRect(o.x+7,o.y+1,8,o.h-2,3); ctx.fill();
        /* Espinas */
        ctx.fillStyle='#1a5010';
        for(let sp=0;sp<3;sp++){
          const sy=o.y+o.h*0.2+sp*o.h*0.25;
          ctx.fillRect(o.x+2,sy,5,2); ctx.fillRect(o.x+15,sy,5,2);
        }
      } else if (o.type==='stone') {
        const stoneG=ctx.createLinearGradient(o.x,o.y,o.x,o.y+o.h);
        stoneG.addColorStop(0,'#aaaaaa'); stoneG.addColorStop(1,'#666666');
        ctx.fillStyle=stoneG;
        ctx.beginPath(); ctx.roundRect(o.x,o.y,o.w,o.h,8); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.ellipse(o.x+o.w*0.35,o.y+o.h*0.3,o.w*0.22,o.h*0.18,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.roundRect(o.x+1,o.y+1,o.w-2,o.h-2,7); ctx.stroke();
      } else {
        /* Tronco caído */
        ctx.fillStyle='#8B4513';
        ctx.beginPath(); ctx.roundRect(o.x,o.y+4,o.w,o.h-4,5); ctx.fill();
        ctx.fillStyle='#A0522D';
        ctx.beginPath(); ctx.roundRect(o.x+2,o.y+4,o.w-4,o.h*0.5,4); ctx.fill();
        /* Vetas */
        ctx.strokeStyle='rgba(0,0,0,0.2)'; ctx.lineWidth=1;
        [0.3,0.6,0.9].forEach(t=>{
          ctx.beginPath(); ctx.moveTo(o.x+o.w*t,o.y+4); ctx.lineTo(o.x+o.w*t,o.y+o.h); ctx.stroke();
        });
      }
    });

    /* ── Monedas ── */
    coins.forEach(c => {
      if (c.got) return;
      const bob = Math.sin(frameN*0.15+c.x)*3;
      /* Sombra */
      ctx.fillStyle='rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(c.x,c.y+c.r+bob+3,c.r*0.7,c.r*0.2,0,0,Math.PI*2); ctx.fill();
      /* Moneda */
      const coinG=ctx.createRadialGradient(c.x-c.r*0.3,c.y+bob-c.r*0.3,c.r*0.1,c.x,c.y+bob,c.r);
      coinG.addColorStop(0,'#ffe066'); coinG.addColorStop(0.6,'#FFD600'); coinG.addColorStop(1,'#c89000');
      ctx.fillStyle=coinG;
      ctx.beginPath(); ctx.arc(c.x,c.y+bob,c.r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#b07800'; ctx.lineWidth=1.5; ctx.stroke();
      /* $ */
      ctx.fillStyle='rgba(100,60,0,0.6)'; ctx.font=`bold ${c.r}px Nunito,sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('$',c.x,c.y+bob);
    });

    /* ── Partículas ── */
    pars.filter(p=>p.life>0).forEach(p=>{
      ctx.save(); ctx.globalAlpha=p.life*0.9;
      ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      ctx.restore();
    });

    /* ── Personaje animado ── */
    drawHero();

    /* ── Pantalla final (ganó o perdió) ── */
    if (!running) {
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H);
      ctx.textAlign='center'; ctx.textBaseline='middle';
      if (won) {
        ctx.fillStyle='#86efac'; ctx.font=`bold ${Math.round(W/9)}px Fredoka One,cursive`;
        ctx.fillText('🏁 ¡META!', W/2, H/2-20);
        ctx.fillStyle='#FFD600'; ctx.font=`bold ${Math.round(W/16)}px Nunito,sans-serif`;
        ctx.fillText('¡Llegaste! '+score+' 🪙 +20 bonus', W/2, H/2+12);
      } else {
        ctx.fillStyle='#FF4D9D'; ctx.font=`bold ${Math.round(W/9)}px Fredoka One,cursive`;
        ctx.fillText('💥 ¡CHOQUE!', W/2, H/2-20);
        ctx.fillStyle='#FFD600'; ctx.font=`bold ${Math.round(W/16)}px Nunito,sans-serif`;
        ctx.fillText(dist+'/'+GOAL+'m · '+score+' 🪙', W/2, H/2+12);
      }
      ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font=`${Math.round(W/22)}px Nunito,sans-serif`;
      ctx.fillText('Toca para volver a jugar', W/2, H/2+36);
    }
  }

  function drawHero() {
    /* Anclaje: trasladamos al punto donde los PIES tocan el suelo.
       hero.y es la parte superior del hitbox, hero.h su altura,
       así que los pies están en hero.y + hero.h. Dibujamos el
       personaje HACIA ARRIBA desde ahí (Y negativo = arriba). */
    const hx = hero.x + hero.w / 2;
    const feetY = hero.y + hero.h;
    const run = hero.run;
    const inAir = hero.jumping;

    ctx.save();
    ctx.translate(hx, feetY);

    /* Sombra en el piso (se achica al saltar) */
    const shadowScale = inAir ? 0.6 : 1;
    ctx.fillStyle = `rgba(0,0,0,${inAir ? 0.12 : 0.25})`;
    ctx.beginPath();
    ctx.ellipse(0, 2, hero.w * 0.5 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    /* Animación de piernas: ángulo de zancada */
    const stride = inAir ? 14 : Math.sin(run) * 14;

    /* ── Piernas (desde la cadera ~ -18 hasta los pies ~ 0) ── */
    ctx.strokeStyle = '#1a40a0'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    /* Izquierda */
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(-4 + stride * 0.4, -2);
    ctx.stroke();
    /* Derecha */
    ctx.beginPath();
    ctx.moveTo(4, -18);
    ctx.lineTo(4 - stride * 0.4, -2);
    ctx.stroke();
    /* Zapatos */
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.roundRect(-9 + stride * 0.4, -4, 11, 5, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-2 - stride * 0.4, -4, 11, 5, 2); ctx.fill();

    /* ── Torso (de -38 a -16) ── */
    ctx.fillStyle = '#2563EB';
    ctx.beginPath(); ctx.roundRect(-11, -38, 22, 22, 6); ctx.fill();
    /* Cierre / detalle de la chaqueta */
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath(); ctx.roundRect(-2, -38, 4, 22, 2); ctx.fill();

    /* ── Brazos ── */
    const armSwing = inAir ? -16 : Math.sin(run + Math.PI) * 12;
    ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -34); ctx.lineTo(-15, -22 + armSwing); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -34); ctx.lineTo(15, -22 - armSwing); ctx.stroke();
    /* Manos */
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath(); ctx.arc(-15, -22 + armSwing, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(15, -22 - armSwing, 3, 0, Math.PI*2); ctx.fill();

    /* ── Capa (detrás, ondeando) ── */
    ctx.save();
    ctx.fillStyle = '#FF4D9D';
    const capeWave = inAir ? 14 : 6 + Math.sin(run) * 4;
    ctx.beginPath();
    ctx.moveTo(-9, -36);
    ctx.quadraticCurveTo(-18, -24, -14 - capeWave * 0.3, -8);
    ctx.lineTo(-6, -16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    /* ── Cabeza (de -56 a -38) ── */
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath(); ctx.arc(0, -47, 10, 0, Math.PI * 2); ctx.fill();
    /* Pelo */
    ctx.fillStyle = '#5c3317';
    ctx.beginPath(); ctx.arc(0, -50, 9, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-6, -48, 4, Math.PI * 1.1, Math.PI * 2.1); ctx.fill();
    /* Ojo (mira a la derecha, hacia donde corre) */
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(4, -47, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(4.8, -47.6, 0.9, 0, Math.PI * 2); ctx.fill();
    /* Sonrisa */
    ctx.strokeStyle = '#c97'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(3, -43, 3, 0.1, Math.PI * 0.8); ctx.stroke();

    ctx.restore();
  }

  /* Controles */
  canvas.addEventListener('touchstart', e=>{jump();e.preventDefault();},{passive:false});
  function keyHandler(e){if(e.key===' '||e.key==='ArrowUp'||e.key==='w'){jump();e.preventDefault();}}
  document.addEventListener('keydown', keyHandler);
  window.activeKeyHandlers.push(keyHandler);
  window.plReset = reset;
  container.querySelector('.game-container').appendChild(makeActionButton('🦸 SALTAR / DOBLE SALTO', jump));
  reset();
}

// ═══════════════════════════════════════════
//  GAME 18: DEFENSA ESPACIAL (disparar)
// ═══════════════════════════════════════════
if (typeof buildPlatform === "function") window.buildPlatform = buildPlatform;
