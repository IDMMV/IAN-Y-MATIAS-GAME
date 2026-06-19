function buildJump(container) {
  const toast = (msg) => {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log(msg);
  };
  const sfx = (name) => {
    try {
      if (window.SFX && typeof window.SFX[name] === 'function') window.SFX[name]();
    } catch (_) {}
  };

  window.HK_PAUSED = false;
  window.jumpTheme = window.jumpTheme || 'sabana';
  window.jumpSoundEnabled = localStorage.getItem('jumpSound') !== 'false';
  window.jumpCoins = Number(localStorage.getItem('jumpCoins')) || 500;
  window.jumpInventory = JSON.parse(localStorage.getItem('jumpInventory') || 'null') || {
    escudo: 0,
    velocidad: 0,
    dobleMonedas: 0,
    saltoExtra: 0,
    magnetismo: 0,
    curacion: 0
  };

  window.jumpPowerups = {
    escudo: { emoji: '🛡️', nombre: 'Escudo', precio: 60, duracion: 600, descripcion: 'Bloquea un golpe enemigo.' },
    velocidad: { emoji: '⚡', nombre: 'Velocidad', precio: 45, duracion: 600, descripcion: 'Aumenta la velocidad durante 10 segundos.' },
    dobleMonedas: { emoji: '💰', nombre: 'Doble monedas', precio: 70, duracion: 600, descripcion: 'Duplica las monedas recogidas.' },
    saltoExtra: { emoji: '⬆️', nombre: 'Super salto', precio: 50, duracion: 600, descripcion: 'Salta más alto durante 10 segundos.' },
    magnetismo: { emoji: '🧲', nombre: 'Imán', precio: 55, duracion: 600, descripcion: 'Atrae monedas cercanas.' },
    curacion: { emoji: '❤️', nombre: 'Curación', precio: 40, duracion: 1, descripcion: 'Recupera 35 puntos de vida.' }
  };

  container.style.cssText = `
    position:fixed; inset:0; width:100vw; height:100dvh; overflow:hidden;
    background:#111; z-index:9999; touch-action:none; user-select:none;
    font-family:Nunito,Arial,sans-serif;
  `;

  container.innerHTML = `
    <style>
      #jumpGame{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
      .jk-glass{background:linear-gradient(180deg,rgba(20,20,26,.84),rgba(5,5,8,.72));border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 26px rgba(0,0,0,.35);backdrop-filter:blur(7px)}
      .jk-btn{border:2px solid rgba(255,255,255,.75);color:#fff;background:rgba(15,18,25,.74);border-radius:50%;display:grid;place-items:center;font-weight:900;box-shadow:0 6px 16px rgba(0,0,0,.38);touch-action:none}
      .jk-btn:active{transform:scale(.94);filter:brightness(1.2)}
      #jumpTop{position:absolute;top:max(8px,env(safe-area-inset-top));left:10px;right:10px;z-index:15;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;pointer-events:none}
      #jumpStats{padding:8px 10px;border-radius:14px;color:#fff;min-width:160px;pointer-events:auto}
      #jumpStats .bar{height:9px;background:rgba(255,255,255,.16);border-radius:99px;overflow:hidden;margin-top:4px}
      #jumpStats .fill{height:100%;width:100%;border-radius:inherit;transition:width .2s}
      #jumpHealthFill{background:linear-gradient(90deg,#ff344f,#ff7a68)}
      #jumpStaminaFill{background:linear-gradient(90deg,#2adca8,#74f0c9)}
      #jumpCenterHud{padding:8px 12px;border-radius:14px;color:#fff;text-align:center;min-width:120px;pointer-events:auto}
      #jumpTopBtns{display:flex;gap:8px;pointer-events:auto}
      #jumpTopBtns button{width:44px;height:44px;font-size:20px;padding:0}
      #jumpMiniMap{position:absolute;top:82px;right:12px;width:112px;height:112px;border-radius:50%;z-index:15;overflow:hidden;border:3px solid rgba(255,255,255,.78);background:rgba(8,22,17,.72);box-shadow:0 8px 20px rgba(0,0,0,.4)}
      #jumpMission{position:absolute;left:50%;top:82px;transform:translateX(-50%);z-index:15;color:#fff;padding:8px 13px;border-radius:999px;font-size:13px;font-weight:900;white-space:nowrap}
      #jumpJoy{position:absolute;left:18px;bottom:max(24px,env(safe-area-inset-bottom));width:126px;height:126px;border-radius:50%;z-index:18;background:rgba(10,10,14,.38);border:3px solid rgba(255,255,255,.45);box-shadow:inset 0 0 30px rgba(0,0,0,.4);touch-action:none}
      #jumpJoyKnob{position:absolute;left:38px;top:38px;width:50px;height:50px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff7b35,#b51d10);border:3px solid rgba(255,255,255,.8);box-shadow:0 5px 12px rgba(0,0,0,.45)}
      #jumpActions{position:absolute;right:16px;bottom:max(25px,env(safe-area-inset-bottom));z-index:18;width:150px;height:145px}
      #jumpAttackBtn{position:absolute;right:0;bottom:0;width:82px;height:82px;font-size:36px;background:radial-gradient(circle at 35% 30%,#ff7b35,#9d180f)}
      #jumpJumpBtn{position:absolute;left:0;top:3px;width:62px;height:62px;font-size:28px;background:radial-gradient(circle at 35% 30%,#3f8cff,#17429e)}
      #jumpDashBtn{position:absolute;right:2px;top:0;width:54px;height:54px;font-size:24px;background:radial-gradient(circle at 35% 30%,#6de8ff,#12718a)}
      #jumpPowerupsPanel{position:absolute;right:12px;bottom:180px;z-index:18;display:flex;flex-direction:column;gap:7px}
      #jumpPowerupsPanel button{width:48px;height:48px;border-radius:14px;font-size:22px;color:#fff;border:2px solid rgba(255,255,255,.75);background:rgba(18,20,27,.8);position:relative}
      #jumpPowerupsPanel small{position:absolute;right:-4px;bottom:-4px;background:#ffd321;color:#111;border-radius:999px;min-width:19px;height:19px;display:grid;place-items:center;font-weight:900;border:1px solid #111}
      #jumpBanner{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.9);z-index:40;color:#fff;padding:24px 28px;border-radius:22px;text-align:center;opacity:0;pointer-events:none;transition:.25s}
      #jumpBanner.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
      #jumpModal{position:absolute;inset:0;z-index:60;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;padding:18px}
      #jumpModal.show{display:flex}
      #jumpModalCard{width:min(520px,94vw);max-height:84vh;overflow:auto;border-radius:22px;padding:20px;color:#fff}
      .jk-shop-row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.09);padding:10px;border-radius:14px;margin:8px 0}
      .jk-shop-row .info{flex:1}.jk-shop-row button{border:0;border-radius:11px;padding:10px 12px;background:#ffd321;color:#111;font-weight:900}
      @media (min-width:900px){#jumpJoy{width:150px;height:150px}#jumpJoyKnob{left:47px;top:47px;width:56px;height:56px}#jumpActions{right:28px;bottom:34px}.jk-btn{cursor:pointer}}
    </style>
    <canvas id="jumpGame"></canvas>
    <div id="jumpTop">
      <div id="jumpStats" class="jk-glass">
        <div style="display:flex;justify-content:space-between;font-weight:900"><span>🦘 HUGO KANGAROO</span><span id="jumpLevel">Nv. 1</span></div>
        <div class="bar"><div id="jumpHealthFill" class="fill"></div></div>
        <div class="bar"><div id="jumpStaminaFill" class="fill"></div></div>
      </div>
      <div id="jumpCenterHud" class="jk-glass">
        <div style="font-size:12px;opacity:.8">PUNTOS</div>
        <div id="jumpScore" style="font-size:20px;font-weight:1000">0</div>
        <div style="font-size:12px">🪙 <span id="jumpCoins">${window.jumpCoins}</span></div>
      </div>
      <div id="jumpTopBtns">
        <button id="jumpSoundBtn" class="jk-btn">${window.jumpSoundEnabled ? '🔊' : '🔇'}</button>
        <button id="jumpPauseBtn" class="jk-btn">⏸️</button>
        <button id="jumpCloseBtn" class="jk-btn" style="background:rgba(180,25,30,.82)">✕</button>
      </div>
    </div>
    <canvas id="jumpMiniMap" width="112" height="112"></canvas>
    <div id="jumpMission" class="jk-glass">🎯 Derrota 5 rivales y recoge 10 monedas</div>
    <div id="jumpJoy"><div id="jumpJoyKnob"></div></div>
    <div id="jumpActions">
      <button id="jumpJumpBtn" class="jk-btn" aria-label="Saltar">⬆️</button>
      <button id="jumpDashBtn" class="jk-btn" aria-label="Correr">⚡</button>
      <button id="jumpAttackBtn" class="jk-btn" aria-label="Atacar">🦘</button>
    </div>
    <div id="jumpPowerupsPanel"></div>
    <div id="jumpBanner" class="jk-glass"></div>
    <div id="jumpModal"><div id="jumpModalCard" class="jk-glass"></div></div>
  `;

  const cv = container.querySelector('#jumpGame');
  const ctx = cv.getContext('2d');
  const mm = container.querySelector('#jumpMiniMap');
  const mctx = mm.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;

  function resize() {
    W = container.clientWidth;
    H = container.clientHeight;
    cv.width = Math.max(1, Math.floor(W * DPR));
    cv.height = Math.max(1, Math.floor(H * DPR));
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();

  const world = { size: 3600, horizon: 0.36, time: 0 };
  const player = {
    x: 0, z: 0, y: 0, angle: 0, vx: 0, vz: 0, vy: 0,
    health: 100, stamina: 100, attackTimer: 0, hurtTimer: 0,
    dashTimer: 0, invulnerable: 0, level: 1, xp: 0
  };
  let score = 0;
  let kills = 0;
  let collected = 0;
  let running = true;
  let animId = 0;
  let last = performance.now();
  let shake = 0;
  let activePowerups = {};
  let missionComplete = false;
  const keys = Object.create(null);
  const input = { x: 0, y: 0, attack: false, jump: false, dash: false };

  const trees = Array.from({ length: 70 }, (_, i) => ({
    x: (Math.random() - .5) * world.size,
    z: (Math.random() - .5) * world.size,
    size: 35 + Math.random() * 55,
    hue: i % 3
  }));
  const rocks = Array.from({ length: 42 }, () => ({
    x: (Math.random() - .5) * world.size,
    z: (Math.random() - .5) * world.size,
    size: 18 + Math.random() * 32
  }));
  const enemies = Array.from({ length: 10 }, (_, i) => spawnEnemy(i));
  const coins = Array.from({ length: 28 }, () => spawnCoin());
  const particles = [];

  function spawnEnemy(i = 0) {
    const a = Math.random() * Math.PI * 2;
    const d = 450 + Math.random() * 1150;
    return {
      x: Math.cos(a) * d,
      z: Math.sin(a) * d,
      angle: Math.random() * Math.PI * 2,
      health: 35 + i * 2,
      hit: 0,
      attackCooldown: Math.random() * 2,
      alive: true,
      respawn: 0,
      speed: 42 + Math.random() * 18
    };
  }
  function spawnCoin() {
    const a = Math.random() * Math.PI * 2;
    const d = 180 + Math.random() * 1500;
    return { x: Math.cos(a) * d, z: Math.sin(a) * d, bob: Math.random() * 8, alive: true, respawn: 0 };
  }

  function project(x, y, z) {
    const dx = x - player.x;
    const dz = z - player.z;
    const ca = Math.cos(player.angle), sa = Math.sin(player.angle);
    const rx = dx * ca - dz * sa;
    const rz = dx * sa + dz * ca;
    if (rz < 30) return null;
    const horizon = H * world.horizon;
    const focal = Math.min(W, H) * 1.04;
    const scale = focal / rz;
    return { x: W / 2 + rx * scale, y: horizon + (85 - y) * scale, scale, depth: rz };
  }

  function drawSky() {
    const horizon = H * world.horizon;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon + 100);
    sky.addColorStop(0, '#55b9ec');
    sky.addColorStop(.7, '#d5f1ff');
    sky.addColorStop(1, '#ffe8ad');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon + 120);

    ctx.fillStyle = 'rgba(255,245,196,.95)';
    ctx.beginPath();
    ctx.arc(W * .77, H * .15, Math.max(28, W * .035), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,.44)';
    for (let i = 0; i < 7; i++) {
      const x = ((i * 211 + world.time * 3) % (W + 280)) - 140;
      const y = 55 + (i % 3) * 44;
      ctx.beginPath();
      ctx.ellipse(x, y, 55, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 42, y + 3, 42, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#d5a83a';
    ctx.fillRect(0, horizon, W, H - horizon);
    const ground = ctx.createLinearGradient(0, horizon, 0, H);
    ground.addColorStop(0, '#d9b64d');
    ground.addColorStop(1, '#786121');
    ctx.fillStyle = ground;
    ctx.fillRect(0, horizon, W, H - horizon);

    ctx.strokeStyle = 'rgba(255,240,150,.24)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const y = horizon + ((i / 24) ** 2) * (H - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  function drawTree(t) {
    const p = project(t.x, 0, t.z);
    if (!p || p.x < -100 || p.x > W + 100 || p.y < 0 || p.y > H + 120) return;
    const s = Math.max(.15, p.scale * t.size);
    ctx.fillStyle = '#65411f';
    ctx.fillRect(p.x - s * .09, p.y - s * .95, s * .18, s * .95);
    ctx.fillStyle = ['#bf8a22', '#d59b2f', '#9e741d'][t.hue];
    for (let i = 0; i < 5; i++) {
      const ox = (i - 2) * s * .18;
      const oy = Math.abs(i - 2) * s * .05;
      ctx.beginPath();
      ctx.ellipse(p.x + ox, p.y - s * .97 - oy, s * .32, s * .22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRock(r) {
    const p = project(r.x, 0, r.z);
    if (!p || p.x < -80 || p.x > W + 80 || p.y < 0 || p.y > H + 80) return;
    const s = Math.max(.12, p.scale * r.size);
    ctx.fillStyle = '#75694f';
    ctx.beginPath();
    ctx.moveTo(p.x - s * .55, p.y);
    ctx.lineTo(p.x - s * .35, p.y - s * .55);
    ctx.lineTo(p.x + s * .25, p.y - s * .72);
    ctx.lineTo(p.x + s * .65, p.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawCoin(c) {
    const p = project(c.x, 30 + Math.sin(world.time * 5 + c.bob) * 8, c.z);
    if (!p) return;
    const s = Math.max(5, 14 * p.scale);
    ctx.save();
    ctx.translate(p.x, p.y - s);
    ctx.scale(.35 + Math.abs(Math.sin(world.time * 5 + c.bob)) * .65, 1);
    ctx.fillStyle = '#ffd523';
    ctx.strokeStyle = '#7f5600';
    ctx.lineWidth = Math.max(1, s * .12);
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff1a3';
    ctx.beginPath(); ctx.arc(-s * .25, -s * .25, s * .2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawKangaroo(x, y, z, angle, enemy = false, hit = 0) {
    const p = project(x, y, z);
    if (!p) return;
    const s = Math.max(.18, p.scale * 68);
    const flip = Math.cos(angle - player.angle) >= 0 ? 1 : -1;
    ctx.save();
    ctx.translate(p.x, p.y - s * .38);
    ctx.scale(flip, 1);
    if (hit > 0) ctx.globalAlpha = .55 + Math.sin(hit * 25) * .35;

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(0, s * .46, s * .42, s * .12, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = enemy ? '#6f5b53' : '#ae7650';
    ctx.beginPath(); ctx.ellipse(0, 0, s * .26, s * .38, -.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-s * .06, -s * .38, s * .16, s * .18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * .08, -s * .53, s * .055, s * .24, -.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-s * .09, -s * .55, s * .055, s * .24, .12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-s * .1, s * .34, s * .12, s * .32, .12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * .12, s * .34, s * .12, s * .32, -.12, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = s * .13; ctx.lineCap = 'round'; ctx.strokeStyle = enemy ? '#5c4a43' : '#91603f';
    ctx.beginPath(); ctx.moveTo(s * .08, s * .12); ctx.lineTo(s * .6, s * .32); ctx.stroke();

    ctx.fillStyle = '#211';
    ctx.beginPath(); ctx.arc(-s * .055, -s * .42, s * .018, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * .045, -s * .42, s * .018, 0, Math.PI * 2); ctx.fill();

    if (!enemy && player.attackTimer > 0) {
      ctx.strokeStyle = 'rgba(255,160,45,.78)'; ctx.lineWidth = Math.max(2, s * .04);
      ctx.beginPath(); ctx.arc(s * .4, 0, s * .48, -1.25, 1.1); ctx.stroke();
    }
    if (!enemy && activePowerups.escudo) {
      ctx.strokeStyle = 'rgba(80,210,255,.75)'; ctx.lineWidth = Math.max(2, s * .035);
      ctx.beginPath(); ctx.arc(0, 0, s * .63, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function addParticles(x, z, kind = 'hit') {
    for (let i = 0; i < 10; i++) particles.push({
      x, z, y: 35, vx: (Math.random() - .5) * 100, vz: (Math.random() - .5) * 100,
      vy: 45 + Math.random() * 100, life: .45 + Math.random() * .4, kind
    });
  }

  function attack() {
    if (player.attackTimer > 0 || player.stamina < 12 || !running) return;
    player.attackTimer = .42;
    player.stamina -= 12;
    shake = 3;
    sfx('pick');
    enemies.forEach(e => {
      if (!e.alive) return;
      const dx = e.x - player.x, dz = e.z - player.z;
      const d = Math.hypot(dx, dz);
      const facing = Math.atan2(dx, dz);
      const diff = Math.atan2(Math.sin(facing - player.angle), Math.cos(facing - player.angle));
      if (d < 145 && Math.abs(diff) < 1.3) {
        e.health -= 22 + player.level * 3;
        e.hit = .3;
        addParticles(e.x, e.z, 'hit');
        if (e.health <= 0) {
          e.alive = false; e.respawn = 7; kills++; score += 250; player.xp += 25;
          window.jumpCoins += 3; saveCoins();
          toast('🥊 ¡Rival derrotado! +250');
          sfx('point');
        }
      }
    });
  }

  function jump() {
    if (player.y <= .5 && player.stamina >= 8) {
      player.vy = activePowerups.saltoExtra ? 260 : 205;
      player.stamina -= 8;
      sfx('pop');
    }
  }

  function dash() {
    if (player.stamina >= 25 && player.dashTimer <= 0) {
      player.dashTimer = .55;
      player.stamina -= 25;
      addParticles(player.x, player.z, 'dust');
    }
  }

  function takeDamage(amount) {
    if (player.invulnerable > 0 || !running) return;
    if (activePowerups.escudo) {
      delete activePowerups.escudo;
      renderPowerups();
      toast('🛡️ El escudo bloqueó el golpe');
      return;
    }
    player.health -= amount;
    player.hurtTimer = .5;
    player.invulnerable = 1;
    shake = 12;
    sfx('lose');
    if (navigator.vibrate) navigator.vibrate(70);
    if (player.health <= 0) gameOver();
  }

  function gameOver() {
    running = false;
    showBanner('💀 FIN DE LA PARTIDA', `Puntuación: ${score}<br>Rivales derrotados: ${kills}`, true);
  }

  function showBanner(title, text = '', stay = false) {
    const el = container.querySelector('#jumpBanner');
    el.innerHTML = `<div style="font-size:2rem;font-weight:1000">${title}</div><div style="margin-top:8px;font-weight:800">${text}</div>${stay ? '<button id="jumpRestartBanner" style="margin-top:16px;border:0;border-radius:12px;padding:12px 18px;background:#ffd321;font-weight:1000">JUGAR OTRA VEZ</button>' : ''}`;
    el.classList.add('show');
    if (stay) {
      setTimeout(() => {
        const b = container.querySelector('#jumpRestartBanner');
        if (b) b.onclick = reset;
      }, 0);
    } else setTimeout(() => el.classList.remove('show'), 1400);
  }

  function saveCoins() {
    localStorage.setItem('jumpCoins', String(window.jumpCoins));
    container.querySelector('#jumpCoins').textContent = window.jumpCoins;
  }

  function update(dt) {
    if (window.HK_PAUSED || !running) return;
    world.time += dt;
    shake *= Math.pow(.015, dt);

    Object.keys(activePowerups).forEach(k => {
      if (activePowerups[k] !== Infinity) {
        activePowerups[k] -= dt * 60;
        if (activePowerups[k] <= 0) delete activePowerups[k];
      }
    });

    const left = keys.ArrowLeft || keys.a;
    const right = keys.ArrowRight || keys.d;
    const up = keys.ArrowUp || keys.w;
    const down = keys.ArrowDown || keys.s;
    let turn = (right ? 1 : 0) - (left ? 1 : 0) + input.x;
    let forward = (up ? 1 : 0) - (down ? 1 : 0) - input.y;
    turn = Math.max(-1, Math.min(1, turn));
    forward = Math.max(-1, Math.min(1, forward));

    player.angle += turn * dt * 2.3;
    let speed = 125;
    if (activePowerups.velocidad) speed *= 1.5;
    if (player.dashTimer > 0) { speed *= 2.25; player.dashTimer -= dt; }
    const targetVX = Math.sin(player.angle) * forward * speed;
    const targetVZ = Math.cos(player.angle) * forward * speed;
    player.vx += (targetVX - player.vx) * Math.min(1, dt * 7);
    player.vz += (targetVZ - player.vz) * Math.min(1, dt * 7);
    player.x += player.vx * dt;
    player.z += player.vz * dt;
    const half = world.size / 2;
    player.x = Math.max(-half, Math.min(half, player.x));
    player.z = Math.max(-half, Math.min(half, player.z));

    player.vy -= 470 * dt;
    player.y += player.vy * dt;
    if (player.y < 0) { player.y = 0; player.vy = 0; }
    player.attackTimer = Math.max(0, player.attackTimer - dt);
    player.hurtTimer = Math.max(0, player.hurtTimer - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.stamina = Math.min(100, player.stamina + dt * (Math.abs(forward) > .2 ? 7 : 15));

    enemies.forEach((e, idx) => {
      if (!e.alive) {
        e.respawn -= dt;
        if (e.respawn <= 0) Object.assign(e, spawnEnemy(idx));
        return;
      }
      e.hit = Math.max(0, e.hit - dt);
      e.attackCooldown -= dt;
      const dx = player.x - e.x, dz = player.z - e.z;
      const d = Math.hypot(dx, dz);
      if (d < 520) {
        e.angle = Math.atan2(dx, dz);
        if (d > 92) {
          e.x += Math.sin(e.angle) * e.speed * dt;
          e.z += Math.cos(e.angle) * e.speed * dt;
        } else if (e.attackCooldown <= 0) {
          e.attackCooldown = 1.4 + Math.random() * .6;
          takeDamage(12);
          addParticles(player.x, player.z, 'hurt');
        }
      } else e.angle += Math.sin(world.time + idx) * dt * .35;
    });

    coins.forEach(c => {
      if (!c.alive) {
        c.respawn -= dt;
        if (c.respawn <= 0) Object.assign(c, spawnCoin());
        return;
      }
      let dx = player.x - c.x, dz = player.z - c.z;
      let d = Math.hypot(dx, dz);
      if (activePowerups.magnetismo && d < 260) {
        c.x += dx / Math.max(1, d) * 210 * dt;
        c.z += dz / Math.max(1, d) * 210 * dt;
        d = Math.hypot(player.x - c.x, player.z - c.z);
      }
      if (d < 45) {
        c.alive = false; c.respawn = 5; collected++;
        const gain = activePowerups.dobleMonedas ? 2 : 1;
        window.jumpCoins += gain; score += 35 * gain; saveCoins();
        sfx('pick');
      }
    });

    particles.forEach(p => {
      p.life -= dt; p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt; p.vy -= 260 * dt;
    });
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);

    if (!missionComplete && kills >= 5 && collected >= 10) {
      missionComplete = true; score += 1500; window.jumpCoins += 25; saveCoins();
      showBanner('🏆 MISIÓN COMPLETADA', '+1500 puntos · +25 monedas');
      sfx('win');
    }
    if (player.xp >= player.level * 80) {
      player.xp = 0; player.level++; player.health = 100;
      showBanner(`⭐ NIVEL ${player.level}`, 'Vida restaurada y más fuerza');
    }

    container.querySelector('#jumpHealthFill').style.width = Math.max(0, player.health) + '%';
    container.querySelector('#jumpStaminaFill').style.width = player.stamina + '%';
    container.querySelector('#jumpLevel').textContent = 'Nv. ' + player.level;
    container.querySelector('#jumpScore').textContent = score;
    container.querySelector('#jumpMission').textContent = missionComplete
      ? '✅ Misión completada'
      : `🎯 Rivales ${kills}/5 · Monedas ${collected}/10`;
  }

  function draw() {
    ctx.save();
    if (shake > .2) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    drawSky();

    const drawables = [];
    trees.forEach(o => { const p = project(o.x, 0, o.z); if (p) drawables.push({ d:p.depth, fn:()=>drawTree(o) }); });
    rocks.forEach(o => { const p = project(o.x, 0, o.z); if (p) drawables.push({ d:p.depth, fn:()=>drawRock(o) }); });
    coins.forEach(o => { if (!o.alive) return; const p = project(o.x, 20, o.z); if (p) drawables.push({ d:p.depth, fn:()=>drawCoin(o) }); });
    enemies.forEach(o => { if (!o.alive) return; const p = project(o.x, 0, o.z); if (p) drawables.push({ d:p.depth, fn:()=>drawKangaroo(o.x,0,o.z,o.angle,true,o.hit) }); });
    particles.forEach(o => { const p = project(o.x,o.y,o.z); if (p) drawables.push({ d:p.depth, fn:()=>{
      const s=Math.max(2,p.scale*8);ctx.fillStyle=o.kind==='hurt'?'#ff3146':o.kind==='dust'?'#d9b56c':'#ffd52c';ctx.beginPath();ctx.arc(p.x,p.y,s,0,Math.PI*2);ctx.fill();
    }}); });
    const pp = project(player.x, player.y, player.z + 125);
    if (pp) drawables.push({ d:pp.depth, fn:()=>drawKangaroo(player.x,player.y,player.z+125,player.angle,false,player.hurtTimer) });
    drawables.sort((a,b)=>b.d-a.d).forEach(o=>o.fn());

    if (player.dashTimer > 0) {
      ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=3;
      for(let i=0;i<12;i++){const x=Math.random()*W,y=H*.45+Math.random()*H*.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x-W/2)*.12,y+18);ctx.stroke();}
    }
    ctx.restore();
    drawMiniMap();
  }

  function drawMiniMap() {
    const R = 56;
    mctx.clearRect(0,0,112,112);
    mctx.save(); mctx.beginPath(); mctx.arc(R,R,R,0,Math.PI*2); mctx.clip();
    mctx.fillStyle='#23472a';mctx.fillRect(0,0,112,112);
    mctx.strokeStyle='rgba(255,255,255,.12)';
    for(let i=1;i<4;i++){mctx.beginPath();mctx.arc(R,R,i*14,0,Math.PI*2);mctx.stroke();}
    const range=700;
    enemies.forEach(e=>{if(!e.alive)return;const x=R+(e.x-player.x)/range*R,y=R+(e.z-player.z)/range*R;if((x-R)**2+(y-R)**2<R*R){mctx.fillStyle='#ff394c';mctx.beginPath();mctx.arc(x,y,3,0,Math.PI*2);mctx.fill();}});
    coins.forEach(c=>{if(!c.alive)return;const x=R+(c.x-player.x)/range*R,y=R+(c.z-player.z)/range*R;if((x-R)**2+(y-R)**2<R*R){mctx.fillStyle='#ffd321';mctx.beginPath();mctx.arc(x,y,2,0,Math.PI*2);mctx.fill();}});
    mctx.translate(R,R);mctx.rotate(-player.angle);mctx.fillStyle='#fff';mctx.beginPath();mctx.moveTo(0,-8);mctx.lineTo(5,6);mctx.lineTo(-5,6);mctx.closePath();mctx.fill();
    mctx.restore();
  }

  function loop(now) {
    const dt = Math.min(.033, (now - last) / 1000 || .016);
    last = now;
    update(dt);
    draw();
    animId = requestAnimationFrame(loop);
  }

  function renderPowerups() {
    const panel = container.querySelector('#jumpPowerupsPanel');
    panel.innerHTML = '';
    Object.entries(window.jumpPowerups).forEach(([key,p]) => {
      const n = window.jumpInventory[key] || 0;
      if (!n) return;
      const b = document.createElement('button');
      b.innerHTML = `${p.emoji}<small>${n}</small>`;
      b.title = p.descripcion;
      b.onclick = () => usePowerup(key);
      panel.appendChild(b);
    });
  }

  function usePowerup(key) {
    if (!window.jumpInventory[key]) return toast('No tienes ese potenciador');
    window.jumpInventory[key]--;
    localStorage.setItem('jumpInventory', JSON.stringify(window.jumpInventory));
    const p = window.jumpPowerups[key];
    if (key === 'curacion') player.health = Math.min(100, player.health + 35);
    else if (key === 'escudo') activePowerups[key] = Infinity;
    else activePowerups[key] = p.duracion;
    toast(`${p.emoji} ${p.nombre} activado`);
    renderPowerups();
  }

  function openShop() {
    window.HK_PAUSED = true;
    const modal = container.querySelector('#jumpModal');
    const card = container.querySelector('#jumpModalCard');
    card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:28px;font-weight:1000">🛒 Tienda</div><div>Monedas: <b id="jumpShopCoins">${window.jumpCoins}</b></div></div><button id="jumpShopClose" class="jk-btn" style="width:44px;height:44px">✕</button></div><div id="jumpShopList"></div>`;
    const list = card.querySelector('#jumpShopList');
    Object.entries(window.jumpPowerups).forEach(([key,p]) => {
      const row=document.createElement('div');row.className='jk-shop-row';
      row.innerHTML=`<div style="font-size:30px">${p.emoji}</div><div class="info"><b>${p.nombre}</b><div style="font-size:12px;opacity:.78">${p.descripcion}</div><div style="font-size:12px">Inventario: ${window.jumpInventory[key]||0}</div></div><button>🪙 ${p.precio}</button>`;
      row.querySelector('button').onclick=()=>{
        if(window.jumpCoins<p.precio)return toast('❌ No tienes suficientes monedas');
        window.jumpCoins-=p.precio;window.jumpInventory[key]=(window.jumpInventory[key]||0)+1;
        localStorage.setItem('jumpInventory',JSON.stringify(window.jumpInventory));saveCoins();renderPowerups();openShop();toast(`✅ Compraste ${p.nombre}`);
      };
      list.appendChild(row);
    });
    modal.classList.add('show');
    card.querySelector('#jumpShopClose').onclick=()=>{modal.classList.remove('show');window.HK_PAUSED=false;};
  }

  function reset() {
    running = true; missionComplete = false; score = 0; kills = 0; collected = 0;
    Object.assign(player,{x:0,z:0,y:0,angle:0,vx:0,vz:0,vy:0,health:100,stamina:100,attackTimer:0,hurtTimer:0,dashTimer:0,invulnerable:0,level:1,xp:0});
    enemies.forEach((e,i)=>Object.assign(e,spawnEnemy(i)));
    coins.forEach(c=>Object.assign(c,spawnCoin()));
    container.querySelector('#jumpBanner').classList.remove('show');
    window.HK_PAUSED=false;
  }

  // Teclado
  const onKeyDown = e => {
    if (!container.isConnected) return;
    keys[e.key] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (e.key === ' ') jump();
    if (e.key.toLowerCase() === 'f') attack();
    if (e.key.toLowerCase() === 'shift') dash();
    if (e.key.toLowerCase() === 'e') openShop();
  };
  const onKeyUp = e => { keys[e.key] = false; };
  document.addEventListener('keydown', onKeyDown, { passive:false });
  document.addEventListener('keyup', onKeyUp);

  // Joystick táctil
  const joy = container.querySelector('#jumpJoy');
  const knob = container.querySelector('#jumpJoyKnob');
  let joyId = null;
  function moveJoy(e) {
    const r=joy.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;
    let dx=e.clientX-cx,dy=e.clientY-cy;const max=r.width*.31;const d=Math.hypot(dx,dy)||1;
    if(d>max){dx=dx/d*max;dy=dy/d*max;}
    input.x=dx/max;input.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`;
  }
  joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);moveJoy(e);});
  joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)moveJoy(e);});
  const endJoy=e=>{if(e.pointerId!==joyId)return;joyId=null;input.x=0;input.y=0;knob.style.transform='translate(0,0)';};
  joy.addEventListener('pointerup',endJoy);joy.addEventListener('pointercancel',endJoy);

  container.querySelector('#jumpAttackBtn').addEventListener('pointerdown',attack);
  container.querySelector('#jumpJumpBtn').addEventListener('pointerdown',jump);
  container.querySelector('#jumpDashBtn').addEventListener('pointerdown',dash);
  container.querySelector('#jumpPauseBtn').onclick=()=>{
    window.HK_PAUSED=!window.HK_PAUSED;
    container.querySelector('#jumpPauseBtn').textContent=window.HK_PAUSED?'▶️':'⏸️';
  };
  container.querySelector('#jumpSoundBtn').onclick=()=>{
    window.jumpSoundEnabled=!window.jumpSoundEnabled;localStorage.setItem('jumpSound',String(window.jumpSoundEnabled));
    container.querySelector('#jumpSoundBtn').textContent=window.jumpSoundEnabled?'🔊':'🔇';
  };
  container.querySelector('#jumpCenterHud').onclick=openShop;

  function closeGame() {
    cancelAnimationFrame(animId);
    document.removeEventListener('keydown',onKeyDown);
    document.removeEventListener('keyup',onKeyUp);
    window.removeEventListener('resize',resize);
    if (typeof window.closeGame === 'function') window.closeGame();
    else if (typeof window.closeModal === 'function') window.closeModal();
    else container.remove();
  }
  container.querySelector('#jumpCloseBtn').onclick=closeGame;
  window.addEventListener('resize',resize);

  window.jumpReset = reset;
  window.jumpClose = closeGame;
  window.jumpOpenShop = openShop;
  window.jumpUsePowerup = usePowerup;
  window.jumpUpdatePowerupsUI = renderPowerups;
  window.jumpToggleSound = () => container.querySelector('#jumpSoundBtn').click();
  window.jumpStartBackgroundMusic = () => {};
  window.jumpStopBackgroundMusic = () => {};

  renderPowerups();
  showBanner('🦘 AVENTURA SALVAJE', 'Usa el joystick · salta · ataca');
  animId = requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════
//  GAME 12: SIMÓN DICE (SIMON)
// ═══════════════════════════════════════════
