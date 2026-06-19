/*
  HugoKids — Súper Salto: Las Diez Tierras
  Juego externo e independiente del index.html.

  Mejoras:
  - 10 niveles.
  - Un monstruo final en cada nivel.
  - Espada mejorable y fragmentos acumulables.
  - Potenciadores guardados en un inventario superior y activables al tocarlos.
  - Cofres, reliquias, enemigos, trampas y puntos de control.
  - Progreso guardado en localStorage.
*/

window.HK_BUILD_SUPER_SALTO = function(container) {
  'use strict';

  const VIEWPORT = window.visualViewport;
  const W = Math.max(360, Math.min(960, Math.round(window.innerWidth || 720)));
  const H = Math.max(560, Math.min(820, Math.round((VIEWPORT && VIEWPORT.height) || window.innerHeight || 720)));
  const FLOOR_Y = H - Math.max(104, Math.round(H * 0.14));
  const GRAVITY = 0.72;
  const SAVE_KEY = 'hk_super_salto_10_niveles_v1';

  const POWER_INFO = {
    shield: {icon:'🛡️', name:'Escudo', duration:0, desc:'Bloquea tres golpes'},
    speed:  {icon:'⚡', name:'Velocidad', duration:15*60, desc:'Corre más rápido'},
    wing:   {icon:'🪶', name:'Triple salto', duration:18*60, desc:'Permite tres saltos'},
    fire:   {icon:'🔥', name:'Fuego', duration:16*60, desc:'La espada lanza fuego'},
    star:   {icon:'⭐', name:'Invencible', duration:9*60, desc:'No recibes daño'},
    heal:   {icon:'💚', name:'Curación', duration:0, desc:'Recupera una vida'}
  };

  const BOSSES = [
    {name:'Rey Gelatina', icon:'👑', color:'#65a30d', shot:'#a3e635'},
    {name:'Escarabajo de Hierro', icon:'🪲', color:'#7c3aed', shot:'#c084fc'},
    {name:'Reina Murciélago', icon:'🦇', color:'#312e81', shot:'#818cf8'},
    {name:'Gólem de Lava', icon:'🌋', color:'#b91c1c', shot:'#fb923c'},
    {name:'Bestia de Hielo', icon:'❄️', color:'#0284c7', shot:'#67e8f9'},
    {name:'Caballero Sombrío', icon:'🌑', color:'#3f3f46', shot:'#a78bfa'},
    {name:'Ogro de la Selva', icon:'🌿', color:'#166534', shot:'#4ade80'},
    {name:'Dragón del Trueno', icon:'⚡', color:'#a16207', shot:'#fde047'},
    {name:'Mago del Vacío', icon:'🔮', color:'#581c87', shot:'#e879f9'},
    {name:'Titán de la Corona', icon:'👹', color:'#7f1d1d', shot:'#f87171'}
  ];

  const THEMES = [
    {name:'Pradera Arcoíris', icon:'🌈', sky:['#60bdf2','#dff7ff'], far:'#75bd64', near:'#3f8d48', soil:'#76502b', grass:'#55bd35'},
    {name:'Bosque Esmeralda', icon:'🌲', sky:['#315f72','#9de1c9'], far:'#377360', near:'#17483a', soil:'#5a3c26', grass:'#45a66c'},
    {name:'Cueva Amatista', icon:'💎', sky:['#32215c','#7c5cb4'], far:'#483678', near:'#241d43', soil:'#49364f', grass:'#9d71c7'},
    {name:'Valle de Lava', icon:'🌋', sky:['#611a1a','#f36c43'], far:'#762b24', near:'#401819', soil:'#4a2820', grass:'#e05a27'},
    {name:'Montaña Helada', icon:'🏔️', sky:['#72b9dc','#e8f8ff'], far:'#9fc7d7', near:'#527f98', soil:'#5d6e77', grass:'#e7f8ff'},
    {name:'Ruinas Nocturnas', icon:'🌙', sky:['#111834','#4a3b78'], far:'#37345c', near:'#191d38', soil:'#4b4052', grass:'#716788'},
    {name:'Selva Perdida', icon:'🦜', sky:['#287b65','#bbdb73'], far:'#3c7e39', near:'#1d552d', soil:'#5f4326', grass:'#5fbf39'},
    {name:'Islas del Trueno', icon:'⛈️', sky:['#334155','#94a3b8'], far:'#596b7a', near:'#2f4250', soil:'#55452e', grass:'#d7a928'},
    {name:'Dimensión Violeta', icon:'🌀', sky:['#230f43','#8b3fc2'], far:'#503063', near:'#291638', soil:'#4c304d', grass:'#be5de0'},
    {name:'Fortaleza de la Corona', icon:'🏰', sky:['#351b51','#d15d72'], far:'#55316f', near:'#26172f', soil:'#47343d', grass:'#96516b'}
  ];

  const saved = loadProgress();
  let campaign = {
    level: clamp(saved.level || 0, 0, 9),
    unlocked: clamp(saved.unlocked || 0, 0, 9),
    coins: Math.max(0, saved.coins || 0),
    swordLevel: clamp(saved.swordLevel || 1, 1, 10),
    swordShards: clamp(saved.swordShards || 0, 0, 2),
    inventory: Object.assign({shield:0,speed:0,wing:0,fire:0,star:0,heal:0}, saved.inventory || {}),
    completed: Boolean(saved.completed)
  };

  container.innerHTML = `
    <style>
      #pl10Wrap, #pl10Wrap * {
        -webkit-user-select:none;
        user-select:none;
        -webkit-touch-callout:none;
        -webkit-tap-highlight-color:transparent;
        box-sizing:border-box;
      }
      #pl10Inventory {
        position:fixed;
        z-index:2147483450;
        left:10px;
        right:10px;
        top:max(190px,calc(env(safe-area-inset-top) + 180px));
        display:flex;
        align-items:center;
        gap:6px;
        overflow-x:auto;
        padding:6px;
        border-radius:17px;
        background:rgba(15,23,42,.83);
        border:2px solid rgba(255,255,255,.82);
        box-shadow:0 8px 22px rgba(0,0,0,.33);
        scrollbar-width:none;
      }
      #pl10Inventory::-webkit-scrollbar{display:none}
      .pl10PowerBtn {
        position:relative;
        flex:0 0 auto;
        width:54px;
        height:50px;
        border:2px solid rgba(255,255,255,.82);
        border-radius:14px;
        background:linear-gradient(135deg,#7c3aed,#2563eb);
        color:#fff;
        font-size:1.35rem;
        font-weight:900;
        cursor:pointer;
        touch-action:manipulation;
      }
      .pl10PowerBtn:active{transform:scale(.93)}
      .pl10PowerBtn.active{
        border-color:#fde047;
        box-shadow:0 0 0 3px rgba(253,224,71,.35),0 0 18px rgba(253,224,71,.75);
      }
      .pl10PowerCount {
        position:absolute;
        right:-4px;
        top:-7px;
        min-width:21px;
        height:21px;
        padding:0 4px;
        border-radius:999px;
        background:#ef4444;
        border:2px solid #fff;
        font-size:.68rem;
        line-height:17px;
      }
      #pl10Notice {
        position:fixed;
        z-index:2147483460;
        top:max(258px,calc(env(safe-area-inset-top) + 248px));
        left:50%;
        transform:translateX(-50%);
        display:none;
        width:min(520px,82%);
        padding:10px 15px;
        border-radius:16px;
        color:#fff;
        border:2px solid #fde047;
        text-align:center;
        font-family:Nunito,sans-serif;
        font-weight:900;
        pointer-events:none;
        box-shadow:0 10px 26px rgba(0,0,0,.36);
      }
      #pl10Controls {
        position:fixed;
        z-index:2147483400;
        left:0;
        right:0;
        bottom:max(16px,env(safe-area-inset-bottom));
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        padding:0 11px;
        pointer-events:none;
      }
      #pl10Controls button{
        pointer-events:auto;
        border:3px solid rgba(255,255,255,.9);
        color:#fff;
        font-weight:900;
        box-shadow:0 8px 18px rgba(0,0,0,.38);
        touch-action:none;
      }
      @media (orientation:landscape) {
        #pl10Inventory {
          top:max(72px,calc(env(safe-area-inset-top) + 62px));
          left:8px;
          right:auto;
          max-width:325px;
        }
        #pl10Notice {
          top:max(132px,calc(env(safe-area-inset-top) + 122px));
          width:min(500px,65%);
        }
      }
    </style>

    <div id="pl10Wrap" style="position:fixed;inset:0;width:100vw;height:100dvh;overflow:hidden;background:#60bdf2;z-index:1;touch-action:none">
      <canvas id="pl10Game" width="${W}" height="${H}" style="display:block;width:100%;height:100%;touch-action:none"></canvas>

      <div id="pl10Hud" style="position:fixed;z-index:2147483440;left:10px;top:max(10px,env(safe-area-inset-top));
           display:flex;gap:6px;flex-wrap:wrap;max-width:calc(100% - 220px);pointer-events:none;font-family:Nunito,sans-serif">
        <span style="background:rgba(15,23,42,.84);color:#fff;border:2px solid rgba(255,255,255,.78);border-radius:13px;padding:7px 9px;font-weight:900">
          🗺️ <span id="pl10Level">1</span>/10
        </span>
        <span style="background:rgba(15,23,42,.84);color:#fff;border:2px solid rgba(255,255,255,.78);border-radius:13px;padding:7px 9px;font-weight:900">
          ❤️ <span id="pl10Hp">4</span>
        </span>
        <span style="background:rgba(15,23,42,.84);color:#fff;border:2px solid rgba(255,255,255,.78);border-radius:13px;padding:7px 9px;font-weight:900">
          🪙 <span id="pl10Coins">0</span>
        </span>
        <span style="background:rgba(88,28,135,.92);color:#fff;border:2px solid #fde047;border-radius:13px;padding:7px 9px;font-weight:900">
          ⚔️ <span id="pl10Sword">1</span> · <span id="pl10Shards">0</span>/3
        </span>
        <span style="background:rgba(120,53,15,.92);color:#fff;border:2px solid #fde047;border-radius:13px;padding:7px 9px;font-weight:900">
          🧿 <span id="pl10Relic">0</span>/1
        </span>
      </div>

      <div id="pl10Inventory" aria-label="Inventario de poderes">
        ${powerButtonHtml('shield')}
        ${powerButtonHtml('speed')}
        ${powerButtonHtml('wing')}
        ${powerButtonHtml('fire')}
        ${powerButtonHtml('star')}
        ${powerButtonHtml('heal')}
        <span id="pl10ActiveLabel" style="flex:0 0 auto;color:#fde68a;font:900 .72rem Nunito,sans-serif;padding:0 7px;white-space:nowrap">
          Toca un poder para usarlo
        </span>
      </div>

      <div id="pl10Notice"></div>

      <div id="pl10BossHud" style="display:none;position:fixed;z-index:2147483445;left:50%;top:max(118px,calc(env(safe-area-inset-top) + 108px));
           transform:translateX(-50%);width:min(460px,72%);padding:7px 10px;border-radius:15px;background:rgba(15,23,42,.9);
           color:#fff;border:2px solid #ef4444;text-align:center;font:900 .82rem Nunito,sans-serif">
        <span id="pl10BossName">Monstruo final</span>
        <div style="height:10px;margin-top:5px;border-radius:999px;overflow:hidden;background:#3f3f46">
          <div id="pl10BossBar" style="height:100%;width:100%;background:linear-gradient(90deg,#ef4444,#f97316)"></div>
        </div>
      </div>

      <div id="pl10Modal" style="position:fixed;inset:0;z-index:2147483500;display:none;align-items:center;justify-content:center;
           padding:18px;background:rgba(0,0,0,.78);font-family:Nunito,sans-serif">
        <div id="pl10ModalCard" style="width:min(500px,94%);padding:24px;border-radius:24px;background:linear-gradient(145deg,#1e1b4b,#111827);
             border:3px solid #fde047;color:#fff;text-align:center;box-shadow:0 22px 70px rgba(0,0,0,.55)"></div>
      </div>

      <div id="pl10Controls">
        <div style="display:flex;gap:8px">
          <button id="pl10Left" style="width:62px;height:62px;border-radius:19px;background:rgba(24,16,28,.9);font-size:1.7rem">◀</button>
          <button id="pl10Right" style="width:62px;height:62px;border-radius:19px;background:rgba(24,16,28,.9);font-size:1.7rem">▶</button>
        </div>
        <div style="display:flex;gap:8px;align-items:flex-end">
          <button id="pl10SwordBtn" style="width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,#f97316,#dc2626);font-size:1.05rem">
            ⚔️<br><span style="font-size:.61rem">ESPADA</span>
          </button>
          <button id="pl10Jump" style="width:92px;height:72px;border-radius:21px;background:linear-gradient(135deg,#2563eb,#16a34a);font-size:.95rem">
            ⬆<br>SALTO
          </button>
        </div>
      </div>
    </div>`;

  const canvas = document.getElementById('pl10Game');
  const ctx = canvas.getContext('2d');
  const keys = {left:false, right:false};
  const particles = [];
  const heroShots = [];
  const enemyShots = [];
  let animationId = null;
  let frame = 0;
  let level = null;
  let hero = null;
  let cameraX = 0;
  let mode = 'play';
  let checkpointX = 80;
  let noticeTimer = null;
  let attackSerial = 0;
  let lockedNoticeCooldown = 0;
  let globalBadge = document.getElementById('gamePowerBadge');

  if (globalBadge) globalBadge.style.display = 'none';

  function powerButtonHtml(type) {
    const info = POWER_INFO[type];
    return `<button class="pl10PowerBtn" id="pl10Power_${type}" onclick="window.pl10UsePower('${type}')" title="${info.name}: ${info.desc}">
      ${info.icon}<span class="pl10PowerCount" id="pl10Count_${type}">0</span>
    </button>`;
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(campaign));
    } catch (e) {}
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return function() {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function makeLevel(index) {
    const rand = seededRandom(7000 + index * 977);
    const theme = THEMES[index];
    const bossInfo = BOSSES[index];
    const width = 3800 + index * 230;
    const bossArenaStart = width - 860;
    const grounds = [];
    const platforms = [];
    const moving = [];
    const enemies = [];
    const coins = [];
    const powers = [];
    const shards = [];
    const chests = [];
    const spikes = [];
    const signs = [];
    const checkpoints = [80];

    let x = 0;
    let section = 0;

    while (x < bossArenaStart - 620) {
      const segmentWidth = 500 + Math.floor(rand() * 180);
      grounds.push({x, y:FLOOR_Y, w:segmentWidth, h:H-FLOOR_Y+100, type:'ground'});

      for (let c = 120; c < segmentWidth - 80; c += 70) {
        if (rand() > 0.18) coins.push({x:x+c, y:FLOOR_Y-54-(section%2)*12, taken:false, phase:rand()*6});
      }

      const p1x = x + 170 + Math.floor(rand()*100);
      const p1y = FLOOR_Y - 100 - Math.floor(rand()*85);
      platforms.push({x:p1x, y:p1y, w:130+Math.floor(rand()*55), h:22, type:'platform'});

      if (section % 2 === 1) {
        platforms.push({x:x+segmentWidth-210, y:FLOOR_Y-190-Math.floor(rand()*45), w:135, h:22, type:'platform'});
      }

      if (section % 3 === 2) {
        moving.push({
          x:x+segmentWidth-70, baseX:x+segmentWidth-70, y:FLOOR_Y-125,
          w:120, h:20, range:85+index*4, phase:section*.8, dx:0, prevX:x+segmentWidth-70, type:'moving'
        });
      }

      if (section > 0) {
        enemies.push(makeEnemy(
          x + 250 + Math.floor(rand()*(segmentWidth-330)),
          index,
          section % 4 === 2 ? 'bat' : (section % 2 ? 'beetle' : 'slime'),
          rand
        ));
      }

      if (section % 2 === 1) {
        spikes.push({x:x+90+Math.floor(rand()*160), y:FLOOR_Y-18, w:54+Math.floor(rand()*36), h:18});
      }

      if (section % 3 === 1) {
        chests.push({x:p1x+45, y:p1y-36, w:48, h:36, opened:false, reward: section%6===1?'power':'mixed'});
      }

      if (section === 2 || section === 5) {
        shards.push({x:p1x+70, y:p1y-46, taken:false, phase:section});
      }

      if (section === 1 || section === 4 || section === 7) {
        const types = ['shield','speed','wing','fire','star','heal'];
        powers.push({
          x:x+segmentWidth-150, y:FLOOR_Y-60-(section%2)*80,
          type:types[(index+section)%types.length], taken:false, phase:section
        });
      }

      if (section > 0 && section % 3 === 0) {
        checkpoints.push(x+70);
      }

      if (section === 0) {
        signs.push({x:x+180, y:FLOOR_Y-62, text:`Nivel ${index+1}: encuentra la reliquia y derrota a ${bossInfo.name}`, seen:false});
      }

      const gap = 115 + Math.floor(rand()*42);
      platforms.push({x:x+segmentWidth+18, y:FLOOR_Y-92, w:Math.max(74,gap-36), h:20, type:'bridge'});
      x += segmentWidth + gap;
      section++;
    }

    grounds.push({x:bossArenaStart-180, y:FLOOR_Y, w:1040, h:H-FLOOR_Y+100, type:'ground'});
    checkpoints.push(bossArenaStart-120);

    const relicPlatform = {
      x:Math.floor(width*.58),
      y:FLOOR_Y-210,
      w:160,
      h:22,
      type:'platform'
    };
    platforms.push(relicPlatform);

    const relic = {
      x:relicPlatform.x + relicPlatform.w/2,
      y:relicPlatform.y - 38,
      taken:false,
      phase:index
    };

    powers.push({
      x:bossArenaStart-90,
      y:FLOOR_Y-62,
      type:index%2===0?'heal':'shield',
      taken:false,
      phase:12
    });

    const boss = {
      x:width-560,
      baseX:width-560,
      y:FLOOR_Y-94,
      w:84,
      h:94,
      type:'boss',
      bossIndex:index,
      name:bossInfo.name,
      icon:bossInfo.icon,
      color:bossInfo.color,
      shotColor:bossInfo.shot,
      dir:-1,
      speed:1.05+index*.07,
      range:190,
      hp:9+index*4,
      maxHp:9+index*4,
      dead:false,
      hit:0,
      cooldown:78-index*3,
      phase:index*.9,
      active:false,
      lastAttack:-1
    };

    enemies.push(boss);

    return {
      index,
      theme,
      bossInfo,
      width,
      bossArenaStart,
      goalX:width-150,
      grounds,
      platforms,
      moving,
      enemies,
      coins,
      powers,
      shards,
      chests,
      spikes,
      signs,
      checkpoints,
      relic,
      boss
    };
  }

  function makeEnemy(x, levelIndex, type, rand) {
    const hp = 1 + Math.floor(levelIndex / 4);
    return {
      x,
      baseX:x,
      y:type==='bat' ? FLOOR_Y-145-Math.floor(rand()*60) : FLOOR_Y-42,
      w:40,
      h:40,
      type,
      dir:rand()>.5?1:-1,
      speed:.78+levelIndex*.035,
      range:82+Math.floor(rand()*55),
      hp,
      maxHp:hp,
      dead:false,
      hit:0,
      cooldown:90,
      phase:rand()*6,
      lastAttack:-1
    };
  }

  function startLevel(index, announce=true) {
    const modalAnterior = document.getElementById('pl10Modal');
    if (modalAnterior) modalAnterior.style.display = 'none';

    keys.left = false;
    keys.right = false;

    campaign.level = clamp(index,0,9);
    campaign.unlocked = Math.max(campaign.unlocked, campaign.level);
    level = makeLevel(campaign.level);
    checkpointX = level.checkpoints[0];
    mode = 'play';
    cameraX = 0;
    heroShots.length = 0;
    enemyShots.length = 0;
    particles.length = 0;

    hero = {
      x:checkpointX,
      y:FLOOR_Y-60,
      w:38,
      h:60,
      vx:0,
      vy:0,
      facing:1,
      onGround:false,
      jumps:0,
      maxJumps:2,
      maxHp:4,
      hp:4,
      invuln:80,
      activePower:null,
      powerTimer:0,
      shieldHits:0,
      dash:0,
      attackTimer:0,
      attackCooldown:0,
      attackId:0,
      standingPlatform:null,
      run:0,
      relic:false
    };

    updateHud();
    updateInventory();
    saveProgress();

    if (announce) {
      showModal(`
        <div style="font-size:3rem">${level.theme.icon}</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.75rem">${level.theme.name}</div>
        <div style="margin-top:6px;color:#c4b5fd">Nivel ${campaign.level+1} de 10</div>
        <div style="margin-top:10px;color:#fde68a;font-weight:900">
          Misión: consigue la reliquia 🧿 y derrota a ${level.bossInfo.icon} ${level.bossInfo.name}
        </div>
        <button onclick="window.pl10CloseModal()" style="margin-top:17px;border:0;border-radius:14px;padding:12px 22px;background:#16a34a;color:#fff;font-weight:900">
          ▶ Comenzar
        </button>
      `);
    }
  }

  function updateHud() {
    setTextSafe('pl10Level', campaign.level+1);
    setTextSafe('pl10Hp', hero ? hero.hp : 4);
    setTextSafe('pl10Coins', campaign.coins);
    setTextSafe('pl10Sword', campaign.swordLevel);
    setTextSafe('pl10Shards', campaign.swordShards);
    setTextSafe('pl10Relic', hero && hero.relic ? 1 : 0);
  }

  function updateInventory() {
    Object.keys(POWER_INFO).forEach(type => {
      setTextSafe('pl10Count_'+type, campaign.inventory[type] || 0);
      const btn = document.getElementById('pl10Power_'+type);
      if (btn) btn.classList.toggle('active', Boolean(hero && hero.activePower===type));
    });

    const label = document.getElementById('pl10ActiveLabel');
    if (!label || !hero) return;

    const global = getGlobalPower();
    if (hero.activePower) {
      const info = POWER_INFO[hero.activePower];
      const seconds = hero.powerTimer > 0 ? ` · ${Math.ceil(hero.powerTimer/60)}s` : '';
      const hits = hero.activePower==='shield' ? ` · ${hero.shieldHits} golpes` : '';
      label.textContent = `ACTIVO: ${info.icon} ${info.name}${seconds}${hits}`;
    } else if (global) {
      label.textContent = `TIENDA ACTIVA: ${global.emoji || '✨'} ${global.nombre || 'Poder'}`;
    } else {
      label.textContent = 'Toca un poder para usarlo';
    }
  }

  function getGlobalPower() {
    try {
      if (typeof getActiveGamePowerState === 'function') return getActiveGamePowerState();
    } catch (e) {}
    return null;
  }

  function setTextSafe(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function notify(text, tone='normal', duration=1650) {
    const box = document.getElementById('pl10Notice');
    if (!box) return;
    if (noticeTimer) clearTimeout(noticeTimer);

    const colors = {
      normal:'linear-gradient(135deg,rgba(88,28,135,.97),rgba(37,99,235,.97))',
      danger:'linear-gradient(135deg,rgba(153,27,27,.98),rgba(234,88,12,.98))',
      success:'linear-gradient(135deg,rgba(22,101,52,.98),rgba(5,150,105,.98))',
      gold:'linear-gradient(135deg,rgba(146,64,14,.98),rgba(202,138,4,.98))'
    };

    box.style.background = colors[tone] || colors.normal;
    box.textContent = text;
    box.style.display = 'block';
    box.style.opacity = '1';

    noticeTimer = setTimeout(() => {
      if (!document.getElementById('pl10Notice')) return;
      box.style.opacity = '0';
      setTimeout(() => { box.style.display='none'; }, 160);
    }, duration);
  }

  function showModal(html) {
    const modal = document.getElementById('pl10Modal');
    const card = document.getElementById('pl10ModalCard');
    if (!modal || !card) return;
    card.innerHTML = html;
    modal.style.pointerEvents = 'auto';
    modal.style.display = 'flex';
    mode = 'modal';
  }

  function hideModal() {
    const modal = document.getElementById('pl10Modal');
    if (modal) {
      modal.style.display = 'none';
      modal.style.pointerEvents = 'none';
    }
    if (mode === 'modal') mode = 'play';
  }

  function usePower(type) {
    if (!hero || mode==='finished') return;
    const count = campaign.inventory[type] || 0;

    if (count <= 0) {
      notify(`${POWER_INFO[type].icon} No tienes ${POWER_INFO[type].name}`, 'danger');
      return;
    }

    if (type === 'heal') {
      if (hero.hp >= hero.maxHp) {
        notify('💚 Ya tienes la vida completa', 'normal');
        return;
      }
      campaign.inventory[type]--;
      hero.hp = Math.min(hero.maxHp, hero.hp+1);
      notify('💚 Recuperaste una vida', 'success');
      updateHud();
      updateInventory();
      saveProgress();
      return;
    }

    campaign.inventory[type]--;
    hero.activePower = type;
    hero.powerTimer = POWER_INFO[type].duration;

    if (type === 'shield') {
      hero.shieldHits = 3;
      hero.powerTimer = 999999;
    }

    if (type === 'wing') hero.maxJumps = 3;
    else hero.maxJumps = 2;

    notify(`${POWER_INFO[type].icon} ${POWER_INFO[type].name} activado`, 'gold');
    updateInventory();
    saveProgress();
  }

  function addPower(type, count=1) {
    campaign.inventory[type] = (campaign.inventory[type] || 0) + count;
    notify(`${POWER_INFO[type].icon} ${POWER_INFO[type].name} guardado arriba · ${campaign.inventory[type]} disponibles`, 'gold', 2100);
    updateInventory();
    saveProgress();
  }

  function collectSwordShard() {
    campaign.swordShards++;
    if (campaign.swordShards >= 3) {
      campaign.swordShards = 0;
      campaign.swordLevel = Math.min(10, campaign.swordLevel+1);
      notify(`⚔️ ¡Espada mejorada al nivel ${campaign.swordLevel}!`, 'gold', 2200);
    } else {
      notify(`🗡️ Fragmento de espada ${campaign.swordShards}/3`, 'success');
    }
    updateHud();
    saveProgress();
  }

  function addParticles(x,y,color,count=12) {
    for (let i=0;i<count;i++) {
      particles.push({
        x,y,
        vx:(Math.random()-.5)*6,
        vy:-1-Math.random()*5,
        life:34+Math.random()*24,
        size:2+Math.random()*4,
        color
      });
    }
  }

  function rectsOverlap(a,b,pad=0) {
    return a.x+pad < b.x+b.w &&
      a.x+a.w-pad > b.x &&
      a.y+pad < b.y+b.h &&
      a.y+a.h-pad > b.y;
  }

  function allSolids() {
    return [...level.grounds,...level.platforms,...level.moving];
  }

  function respawn() {
    hero.x = checkpointX;
    hero.y = FLOOR_Y-110;
    hero.vx = 0;
    hero.vy = 0;
    hero.invuln = 100;
    cameraX = Math.max(0, checkpointX-W*.28);
  }

  function hurt(sourceX, fall=false) {
    if (!hero || hero.invuln>0) return;

    const globalFx = getGlobalEffects();
    if (hero.activePower==='star' || globalFx.invencible || globalFx.todosBeneficios) return;

    if (hero.shieldHits>0) {
      hero.shieldHits--;
      hero.invuln = 70;
      addParticles(hero.x+hero.w/2,hero.y+hero.h/2,'#60a5fa',20);
      notify(`🛡️ Escudo bloqueó el golpe · ${hero.shieldHits} restantes`, 'success');

      if (hero.shieldHits<=0 && hero.activePower==='shield') {
        hero.activePower = null;
        hero.powerTimer = 0;
      }
      updateInventory();
      return;
    }

    hero.hp--;
    hero.invuln = 95;
    addParticles(hero.x+hero.w/2,hero.y+hero.h/2,'#ef4444',18);
    updateHud();

    if (hero.hp<=0) {
      keys.left=false;
      keys.right=false;
      showModal(`
        <div style="font-size:3rem">💥</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.65rem">Has caído</div>
        <div style="margin-top:7px;color:#c4b5fd">Nivel ${campaign.level+1} · Espada nivel ${campaign.swordLevel}</div>
        <button id="pl10RetryBtn" onclick="window.pl10RetryLevel(event)"
                style="margin-top:17px;border:0;border-radius:14px;padding:12px 22px;background:#16a34a;color:#fff;font-weight:900;touch-action:manipulation">
          ↺ Reintentar nivel
        </button>
      `);
      sound('lose');
    } else {
      notify(fall ? `❤️ Caíste · Quedan ${hero.hp}` : `❤️ Te golpearon · Quedan ${hero.hp}`, 'danger');
      respawn();
      sound('hit');
    }
  }

  function jump() {
    if (!hero || mode!=='play' || window.HK_PAUSED) return;
    const globalFx = getGlobalEffects();
    const allowed = Math.max(hero.maxJumps, (globalFx.doubleSalto||globalFx.todosBeneficios)?3:2);

    if (hero.onGround || hero.jumps<allowed) {
      hero.vy = hero.activePower==='wing' ? -15.2 : -13.7;
      hero.onGround = false;
      hero.standingPlatform = null;
      hero.jumps++;
      addParticles(hero.x+hero.w/2,hero.y+hero.h,'rgba(255,255,255,.9)',7);
      sound('jump');
    }
  }

  function attack() {
    if (!hero || mode!=='play' || window.HK_PAUSED || hero.attackCooldown>0) return;

    attackSerial++;
    hero.attackId = attackSerial;
    hero.attackTimer = 17;
    hero.attackCooldown = 22;
    sound('attack');

    if (hero.activePower==='fire') {
      heroShots.push({
        x:hero.facing>0?hero.x+hero.w:hero.x-18,
        y:hero.y+21,
        w:18,h:13,
        vx:hero.facing*9.5,
        life:105,
        damage:Math.max(1,Math.floor(campaign.swordLevel/3))
      });
    }
  }

  function getSwordHitbox() {
    const reach = 45 + campaign.swordLevel*2;
    return {
      x:hero.facing>0 ? hero.x+hero.w-2 : hero.x-reach+2,
      y:hero.y+10,
      w:reach,
      h:44
    };
  }

  function swordDamage() {
    let damage = 1 + Math.floor((campaign.swordLevel-1)/3);
    if (hero.activePower==='star') damage *= 2;
    return damage;
  }

  function hitEnemy(enemy, damage, source='sword') {
    if (enemy.dead) return;
    enemy.hp -= damage;
    enemy.hit = 12;
    addParticles(enemy.x+enemy.w/2,enemy.y+enemy.h/2,enemy.type==='boss'?enemy.shotColor:'#84cc16',16);

    if (enemy.hp<=0) {
      enemy.dead = true;
      campaign.coins += enemy.type==='boss' ? 30+campaign.level*5 : 3;
      updateHud();

      if (enemy.type==='boss') {
        notify(`${enemy.icon} ¡${enemy.name} derrotado! El portal está abierto`, 'success', 2600);
        sound('win');
      } else {
        sound('pop');
      }
    } else if (enemy.type==='boss') {
      notify(`${enemy.icon} ${enemy.name}: ${Math.max(0,enemy.hp)}/${enemy.maxHp}`, 'danger', 850);
    }
  }

  function getGlobalEffects() {
    try {
      if (typeof getActiveGameEffects === 'function') return getActiveGameEffects() || {};
    } catch (e) {}
    return {};
  }

  function updateMovingPlatforms() {
    level.moving.forEach(p => {
      p.prevX = p.x;
      p.x = p.baseX + Math.sin(frame*.024+p.phase)*p.range;
      p.dx = p.x-p.prevX;
    });
  }

  function update() {
    if (!hero || mode!=='play' || window.HK_PAUSED) return;
    frame++;

    const fx = getGlobalEffects();
    const speedMult = (hero.activePower==='speed'?1.45:1) *
      (fx.todosBeneficios?1.35:(Number(fx.velocidad)||1));

    const accel = .74*speedMult;
    const maxSpeed = 5.45*speedMult;

    if (keys.left) {
      hero.vx -= accel;
      hero.facing = -1;
    }
    if (keys.right) {
      hero.vx += accel;
      hero.facing = 1;
    }
    if (!keys.left && !keys.right) hero.vx *= .79;
    hero.vx = clamp(hero.vx,-maxSpeed,maxSpeed);

    if (hero.invuln>0) hero.invuln--;
    if (hero.attackCooldown>0) hero.attackCooldown--;
    if (hero.attackTimer>0) hero.attackTimer--;

    if (hero.activePower && hero.activePower!=='shield') {
      hero.powerTimer--;
      if (hero.powerTimer<=0) {
        hero.activePower = null;
        hero.maxJumps = 2;
        updateInventory();
        notify('El potenciador terminó', 'normal');
      } else if (frame%30===0) {
        updateInventory();
      }
    }

    updateMovingPlatforms();

    if (hero.standingPlatform && hero.onGround && hero.standingPlatform.type==='moving') {
      hero.x += hero.standingPlatform.dx;
    }

    const previousY = hero.y;
    hero.vy += GRAVITY;
    hero.vy = Math.min(hero.vy,17);
    hero.x += hero.vx;
    hero.y += hero.vy;
    hero.x = clamp(hero.x,0,level.width-hero.w);
    hero.run += Math.abs(hero.vx)*.08;

    hero.onGround = false;
    hero.standingPlatform = null;
    const previousBottom = previousY+hero.h;
    const currentBottom = hero.y+hero.h;

    for (const solid of allSolids()) {
      if (
        hero.vy>=0 &&
        hero.x+hero.w-5>solid.x &&
        hero.x+5<solid.x+solid.w &&
        previousBottom<=solid.y+8 &&
        currentBottom>=solid.y
      ) {
        hero.y = solid.y-hero.h;
        hero.vy = 0;
        hero.onGround = true;
        hero.jumps = 0;
        hero.standingPlatform = solid;
        break;
      }
    }

    if (hero.y>H+120) {
      hurt(hero.x,true);
      return;
    }

    for (const cp of level.checkpoints) {
      if (hero.x>=cp && cp>checkpointX) {
        checkpointX = cp;
        notify('🚩 Punto de control guardado','success');
      }
    }

    const coinRadius = (fx.radioDoble||fx.todosBeneficios)?100:40;
    for (const coin of level.coins) {
      if (coin.taken) continue;
      if (Math.hypot(hero.x+hero.w/2-coin.x,hero.y+hero.h/2-coin.y)<coinRadius) {
        coin.taken = true;
        campaign.coins += (fx.monedasDoble||fx.monedasX5||fx.todosBeneficios)?2:1;
        addParticles(coin.x,coin.y,'#fde047',8);
        updateHud();
        sound('coin');
      }
    }

    for (const orb of level.powers) {
      if (orb.taken) continue;
      if (Math.hypot(hero.x+hero.w/2-orb.x,hero.y+hero.h/2-orb.y)<42) {
        orb.taken = true;
        addPower(orb.type,1);
        addParticles(orb.x,orb.y,'#fde047',18);
      }
    }

    for (const shard of level.shards) {
      if (shard.taken) continue;
      if (Math.hypot(hero.x+hero.w/2-shard.x,hero.y+hero.h/2-shard.y)<42) {
        shard.taken = true;
        collectSwordShard();
        addParticles(shard.x,shard.y,'#e5e7eb',20);
      }
    }

    if (!level.relic.taken &&
      Math.hypot(hero.x+hero.w/2-level.relic.x,hero.y+hero.h/2-level.relic.y)<45) {
      level.relic.taken = true;
      hero.relic = true;
      campaign.coins += 8;
      notify('🧿 Reliquia obtenida · ahora derrota al monstruo final','gold',2400);
      addParticles(level.relic.x,level.relic.y,'#fde047',28);
      updateHud();
      saveProgress();
      sound('win');
    }

    for (const chest of level.chests) {
      if (chest.opened || !rectsOverlap(hero,chest,2)) continue;
      chest.opened = true;
      const types = Object.keys(POWER_INFO);
      if (chest.reward==='power') {
        addPower(types[(campaign.level+chest.x)%types.length|0],1);
      } else {
        if ((chest.x+campaign.level)%2===0) {
          collectSwordShard();
        } else {
          const type = types[(campaign.level+Math.floor(chest.x/100))%types.length];
          addPower(type,1);
        }
        campaign.coins += 10;
      }
      addParticles(chest.x+24,chest.y+18,'#fde047',22);
      updateHud();
      saveProgress();
    }

    for (const spike of level.spikes) {
      if (rectsOverlap(hero,spike,5)) {
        hurt(spike.x,false);
        break;
      }
    }

    for (const sign of level.signs) {
      if (!sign.seen && Math.abs(hero.x-sign.x)<74) {
        sign.seen = true;
        notify(`📜 ${sign.text}`,'normal',2500);
      }
    }

    const swordActive = hero.attackTimer>=7 && hero.attackTimer<=15;
    const hitbox = swordActive ? getSwordHitbox() : null;

    for (const enemy of level.enemies) {
      if (enemy.dead) continue;
      if (enemy.hit>0) enemy.hit--;

      if (enemy.type==='boss') {
        if (!enemy.active && hero.x>level.bossArenaStart-80) {
          enemy.active = true;
          notify(`${enemy.icon} ¡Aparece ${enemy.name}! Usa la espada y tus poderes`,'danger',2600);
        }

        if (enemy.active) {
          const distance = hero.x-enemy.x;
          enemy.dir = distance>=0?1:-1;
          enemy.x += enemy.dir*enemy.speed*(Math.abs(distance)>105?1:.25);
          enemy.x = clamp(enemy.x,enemy.baseX-enemy.range,enemy.baseX+enemy.range);

          enemy.cooldown--;
          if (enemy.cooldown<=0) {
            const angle = Math.atan2((hero.y+25)-(enemy.y+35),(hero.x+18)-(enemy.x+42));
            const shotSpeed = 4.7+campaign.level*.12;
            enemyShots.push({
              x:enemy.x+42,y:enemy.y+38,w:18,h:18,
              vx:Math.cos(angle)*shotSpeed,
              vy:Math.sin(angle)*shotSpeed,
              life:190,
              color:enemy.shotColor
            });
            enemy.cooldown = Math.max(42,78-campaign.level*3);
          }
        }
      } else if (enemy.type==='bat') {
        enemy.x = enemy.baseX+Math.sin(frame*.025+enemy.phase)*enemy.range;
        enemy.y = FLOOR_Y-145-(enemy.baseX%70)+Math.sin(frame*.04+enemy.phase)*28;
      } else {
        const slow = (fx.invisible||fx.todosBeneficios)?.48:1;
        enemy.x += enemy.dir*enemy.speed*slow;
        if (Math.abs(enemy.x-enemy.baseX)>enemy.range) enemy.dir *= -1;
      }

      if (swordActive && enemy.lastAttack!==hero.attackId && rectsOverlap(hitbox,enemy,0)) {
        enemy.lastAttack = hero.attackId;
        hitEnemy(enemy,swordDamage(),'sword');
      }

      if (rectsOverlap(hero,enemy,5)) {
        const stomp = enemy.type!=='boss' && hero.vy>2 && previousBottom<=enemy.y+15;
        if (hero.activePower==='star') {
          hitEnemy(enemy,swordDamage()*2,'star');
        } else if (stomp) {
          hitEnemy(enemy,1,'stomp');
          hero.vy = -9.5;
          hero.jumps = 1;
        } else {
          hurt(enemy.x,false);
        }
      }
    }

    heroShots.forEach(shot => {
      shot.x += shot.vx;
      shot.life--;
      for (const enemy of level.enemies) {
        if (!enemy.dead && shot.life>0 && rectsOverlap(shot,enemy,0)) {
          shot.life = 0;
          hitEnemy(enemy,shot.damage,'fire');
          break;
        }
      }
    });

    enemyShots.forEach(shot => {
      shot.x += shot.vx;
      shot.y += shot.vy;
      shot.life--;
      if (shot.life>0 && rectsOverlap(hero,shot,3)) {
        shot.life = 0;
        hurt(shot.x,false);
      }
    });

    for (let i=heroShots.length-1;i>=0;i--) {
      if (heroShots[i].life<=0) heroShots.splice(i,1);
    }
    for (let i=enemyShots.length-1;i>=0;i--) {
      if (enemyShots[i].life<=0) enemyShots.splice(i,1);
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += .18;
      p.life--;
      p.size *= .97;
    });
    for (let i=particles.length-1;i>=0;i--) {
      if (particles[i].life<=0) particles.splice(i,1);
    }

    if (lockedNoticeCooldown>0) lockedNoticeCooldown--;

    const bossDead = level.boss.dead;
    const touchingGoal = hero.x+hero.w>level.goalX && hero.x<level.goalX+80;

    if (touchingGoal && hero.relic && bossDead) {
      completeLevel();
    } else if (touchingGoal && lockedNoticeCooldown<=0) {
      lockedNoticeCooldown = 120;
      if (!hero.relic) notify('🔒 Falta la reliquia. Explora el nivel','danger',2100);
      else notify(`🔒 Debes derrotar a ${level.boss.name}`,'danger',2100);
    }

    const targetCamera = hero.x-W*.34;
    cameraX += (targetCamera-cameraX)*.10;
    cameraX = clamp(cameraX,0,level.width-W);

    updateBossHud();
  }

  function completeLevel() {
    if (mode!=='play') return;
    mode = 'levelclear';
    campaign.coins += 25+campaign.level*5;

    if (campaign.level<9) {
      const next = campaign.level+1;
      campaign.unlocked = Math.max(campaign.unlocked,next);
      campaign.level = next;
      saveProgress();

      showModal(`
        <div style="font-size:3.2rem">🏆</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.75rem">Nivel superado</div>
        <div style="margin-top:7px;color:#fde68a">Derrotaste a ${level.boss.icon} ${level.boss.name}</div>
        <div style="margin-top:5px;color:#c4b5fd">Tu espada, monedas y potenciadores se conservan.</div>
        <button onclick="window.pl10NextLevel()" style="margin-top:17px;border:0;border-radius:14px;padding:12px 22px;background:#16a34a;color:#fff;font-weight:900">
          ▶ Ir al nivel ${next+1}
        </button>
      `);
    } else {
      campaign.completed = true;
      saveProgress();
      mode = 'finished';

      showModal(`
        <div style="font-size:3.6rem">👑</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.95rem">¡LAS DIEZ TIERRAS FUERON SALVADAS!</div>
        <div style="margin-top:8px;color:#fde68a">Venciste a los diez monstruos finales.</div>
        <div style="margin-top:8px;font-weight:900">⚔️ Espada nivel ${campaign.swordLevel} · 🪙 ${campaign.coins}</div>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin-top:18px">
          <button onclick="window.pl10RestartCampaign()" style="border:0;border-radius:14px;padding:12px 20px;background:#16a34a;color:#fff;font-weight:900">↺ Nueva aventura</button>
          <button onclick="closeModal()" style="border:0;border-radius:14px;padding:12px 20px;background:#ef4444;color:#fff;font-weight:900">✕ Salir</button>
        </div>
      `);

      try {
        if (typeof darRecompensa==='function') darRecompensa(campaign.coins+200,1800,'Súper Salto: Las Diez Tierras');
        if (typeof awardBadge==='function') awardBadge('first_win');
        if (typeof launchConfetti==='function') launchConfetti();
      } catch (e) {}
      sound('win');
    }
  }

  function updateBossHud() {
    const hud = document.getElementById('pl10BossHud');
    const bar = document.getElementById('pl10BossBar');
    const name = document.getElementById('pl10BossName');

    if (!hud || !bar || !name || !level || !level.boss.active || level.boss.dead) {
      if (hud) hud.style.display = 'none';
      return;
    }

    hud.style.display = 'block';
    name.textContent = `${level.boss.icon} ${level.boss.name}`;
    bar.style.width = `${Math.max(0,level.boss.hp/level.boss.maxHp*100)}%`;
  }

  function drawBackground() {
    const theme = level.theme;
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,theme.sky[0]);
    grad.addColorStop(1,theme.sky[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = campaign.level===5 || campaign.level===8 ? 'rgba(235,220,255,.8)' : 'rgba(255,245,175,.86)';
    ctx.beginPath();
    ctx.arc(W*.72-cameraX*.025,92,43,0,Math.PI*2);
    ctx.fill();

    for (let i=0;i<7;i++) {
      const x = positiveMod(i*240-cameraX*.12,W+300)-110;
      const y = 72+(i%3)*57;
      ctx.fillStyle = 'rgba(255,255,255,.46)';
      ctx.beginPath();
      ctx.ellipse(x,y,62,22,0,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x+34,y-11,38,25,0,0,Math.PI*2);
      ctx.fill();
    }

    drawHills(theme.far,FLOOR_Y,145,.20,150);
    drawHills(theme.near,FLOOR_Y,95,.40,125);

    if (campaign.level===3) {
      for (let i=0;i<15;i++) {
        const x = positiveMod(i*120-cameraX*.55,W+160)-50;
        ctx.fillStyle='rgba(255,90,20,.45)';
        ctx.beginPath();
        ctx.moveTo(x,FLOOR_Y);
        ctx.lineTo(x+20,FLOOR_Y-45-Math.sin(frame*.08+i)*12);
        ctx.lineTo(x+40,FLOOR_Y);
        ctx.fill();
      }
    }

    if (campaign.level===7) {
      ctx.strokeStyle='rgba(253,224,71,.55)';
      ctx.lineWidth=3;
      for (let i=0;i<3;i++) {
        const x=positiveMod(i*290+frame*2,W+150)-70;
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x+20,55);
        ctx.lineTo(x-4,95);
        ctx.stroke();
      }
    }
  }

  function positiveMod(value,mod) {
    return ((value%mod)+mod)%mod;
  }

  function drawHills(color,base,height,speed,step) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0,base);
    const offset = positiveMod(cameraX*speed,step);
    for (let x=-step;x<=W+step;x+=step) {
      const wx=x-offset;
      ctx.quadraticCurveTo(wx+step/2,base-height-(x%(step*2)===0?24:0),wx+step,base);
    }
    ctx.lineTo(W,H);
    ctx.lineTo(0,H);
    ctx.fill();
  }

  function drawPlatform(p) {
    const x = p.x-cameraX;
    if (x+p.w<-50 || x>W+50) return;
    ctx.fillStyle = p.type==='ground'?level.theme.soil:'#8b5a2b';
    ctx.fillRect(x,p.y,p.w,p.h);
    ctx.fillStyle = level.theme.grass;
    ctx.fillRect(x,p.y-7,p.w,10);
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    for (let bx=10;bx<p.w;bx+=36) ctx.fillRect(x+bx,p.y+8,18,4);
    if (p.type==='moving') {
      ctx.strokeStyle='#fde047';
      ctx.lineWidth=3;
      ctx.strokeRect(x,p.y,p.w,p.h);
    }
  }

  function drawCoin(c) {
    if (c.taken) return;
    const x=c.x-cameraX;
    if (x<-30||x>W+30) return;
    const bob=Math.sin(frame*.11+c.phase)*4;
    const squash=.28+.72*Math.abs(Math.sin(frame*.08+c.phase));
    ctx.save();
    ctx.translate(x,c.y+bob);
    ctx.scale(squash,1);
    const g=ctx.createRadialGradient(-3,-4,2,0,0,10);
    g.addColorStop(0,'#fff4a3');
    g.addColorStop(.5,'#fde047');
    g.addColorStop(1,'#b97800');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(0,0,10,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle='#8a5b00';
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.restore();
  }

  function drawPower(p) {
    if (p.taken) return;
    const x=p.x-cameraX;
    if (x<-50||x>W+50) return;
    const bob=Math.sin(frame*.08+p.phase)*7;
    const info=POWER_INFO[p.type];
    ctx.save();
    ctx.shadowColor='#fde047';
    ctx.shadowBlur=18;
    ctx.fillStyle='rgba(88,28,135,.9)';
    ctx.beginPath();
    ctx.arc(x,p.y+bob,22,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle='#fff';
    ctx.lineWidth=3;
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.font='25px Arial';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(info.icon,x,p.y+bob+1);
    ctx.restore();
  }

  function drawShard(s) {
    if (s.taken) return;
    const x=s.x-cameraX;
    if (x<-50||x>W+50) return;
    const bob=Math.sin(frame*.09+s.phase)*6;
    ctx.save();
    ctx.translate(x,s.y+bob);
    ctx.rotate(-.35);
    ctx.shadowColor='#e5e7eb';
    ctx.shadowBlur=16;
    ctx.fillStyle='#d1d5db';
    ctx.beginPath();
    ctx.moveTo(-5,-25);
    ctx.lineTo(5,-25);
    ctx.lineTo(8,13);
    ctx.lineTo(0,23);
    ctx.lineTo(-8,13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#7c3aed';
    ctx.fillRect(-5,10,10,11);
    ctx.restore();
  }

  function drawRelic() {
    if (level.relic.taken) return;
    const x=level.relic.x-cameraX;
    if (x<-60||x>W+60) return;
    const bob=Math.sin(frame*.08+level.relic.phase)*7;
    ctx.save();
    ctx.translate(x,level.relic.y+bob);
    ctx.rotate(Math.sin(frame*.035)*.14);
    ctx.shadowColor='#fde047';
    ctx.shadowBlur=26;
    ctx.fillStyle='#7c3aed';
    ctx.beginPath();
    for (let i=0;i<8;i++) {
      const angle=-Math.PI/2+i*Math.PI/4;
      const radius=i%2===0?23:12;
      const px=Math.cos(angle)*radius;
      const py=Math.sin(angle)*radius;
      if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle='#fff';
    ctx.lineWidth=3;
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='#fde047';
    ctx.font='22px Arial';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('🧿',0,1);
    ctx.restore();
  }

  function drawChest(chest) {
    const x=chest.x-cameraX;
    if (x<-70||x>W+70) return;
    ctx.save();
    ctx.fillStyle=chest.opened?'#5b3a20':'#92400e';
    ctx.fillRect(x,chest.y+9,chest.w,chest.h-9);
    ctx.fillStyle=chest.opened?'#422711':'#b45309';
    roundRect(ctx,x,chest.y,chest.w,18,8);
    ctx.fill();
    ctx.strokeStyle='#fde047';
    ctx.lineWidth=3;
    ctx.strokeRect(x+2,chest.y+2,chest.w-4,chest.h-4);
    ctx.fillStyle='#fde047';
    ctx.fillRect(x+chest.w/2-4,chest.y+15,8,12);
    ctx.restore();
  }

  function drawSpike(spike) {
    const x=spike.x-cameraX;
    if (x+spike.w<-40||x>W+40) return;
    const count=Math.max(2,Math.floor(spike.w/18));
    const sw=spike.w/count;
    ctx.fillStyle='#d1d5db';
    ctx.strokeStyle='#4b5563';
    ctx.lineWidth=2;
    for (let i=0;i<count;i++) {
      ctx.beginPath();
      ctx.moveTo(x+i*sw,spike.y+spike.h);
      ctx.lineTo(x+i*sw+sw/2,spike.y);
      ctx.lineTo(x+(i+1)*sw,spike.y+spike.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawSign(sign) {
    const x=sign.x-cameraX;
    if (x<-90||x>W+90) return;
    ctx.fillStyle='#5b3a20';
    ctx.fillRect(x-4,sign.y+20,8,42);
    ctx.fillStyle='#9a6235';
    roundRect(ctx,x-42,sign.y,84,30,6);
    ctx.fill();
    ctx.strokeStyle='#fbbf24';
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.fillStyle='#fff';
    ctx.font='bold 16px Arial';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('!',x,sign.y+15);
  }

  function drawEnemy(enemy) {
    if (enemy.dead) return;
    const x=enemy.x-cameraX;
    if (x<-140||x>W+140) return;
    ctx.save();
    if (enemy.hit>0) ctx.globalAlpha=.45;

    if (enemy.type==='slime') {
      ctx.fillStyle='#65a30d';
      roundRect(ctx,x,enemy.y+10,enemy.w,enemy.h-10,15);
      ctx.fill();
      ctx.fillStyle='#a3e635';
      ctx.beginPath();
      ctx.ellipse(x+20,enemy.y+13,18,14,0,Math.PI,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#111';
      ctx.beginPath();
      ctx.arc(x+12,enemy.y+22,3,0,Math.PI*2);
      ctx.arc(x+27,enemy.y+22,3,0,Math.PI*2);
      ctx.fill();
    } else if (enemy.type==='beetle') {
      ctx.fillStyle='#7c3aed';
      ctx.beginPath();
      ctx.ellipse(x+20,enemy.y+22,20,17,0,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle='#f0abfc';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(x+20,enemy.y+7);
      ctx.lineTo(x+20,enemy.y+37);
      ctx.stroke();
    } else if (enemy.type==='bat') {
      ctx.fillStyle='#312e81';
      ctx.beginPath();
      ctx.ellipse(x+20,enemy.y+20,15,14,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#4f46e5';
      ctx.beginPath();
      ctx.moveTo(x+8,enemy.y+18);
      ctx.lineTo(x-12,enemy.y+5);
      ctx.lineTo(x+1,enemy.y+29);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x+32,enemy.y+18);
      ctx.lineTo(x+52,enemy.y+5);
      ctx.lineTo(x+39,enemy.y+29);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.shadowColor=enemy.shotColor;
      ctx.shadowBlur=20;
      ctx.fillStyle=enemy.color;
      roundRect(ctx,x,enemy.y+8,enemy.w,enemy.h-8,20);
      ctx.fill();
      ctx.shadowBlur=0;
      ctx.font='38px Arial';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(enemy.icon,x+enemy.w/2,enemy.y+35);
      ctx.fillStyle='#fde047';
      ctx.beginPath();
      ctx.arc(x+25,enemy.y+59,5,0,Math.PI*2);
      ctx.arc(x+59,enemy.y+59,5,0,Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawHero() {
    const x=hero.x-cameraX;
    const y=hero.y;
    if (hero.invuln>0 && Math.floor(hero.invuln/5)%2===0) return;

    ctx.save();
    ctx.translate(x+hero.w/2,y+hero.h);
    if (hero.facing<0) ctx.scale(-1,1);

    ctx.fillStyle='rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.ellipse(0,4,18,5,0,0,Math.PI*2);
    ctx.fill();

    const stride=hero.onGround?Math.sin(hero.run)*10:7;
    ctx.strokeStyle='#26356e';
    ctx.lineWidth=7;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(-5,-22);
    ctx.lineTo(-6+stride*.5,-3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5,-22);
    ctx.lineTo(6-stride*.5,-3);
    ctx.stroke();

    ctx.fillStyle='#111827';
    roundRect(ctx,-14+stride*.5,-7,15,8,3);
    ctx.fill();
    roundRect(ctx,0-stride*.5,-7,15,8,3);
    ctx.fill();

    ctx.fillStyle=hero.activePower==='star'?'#fde047':'#2563eb';
    roundRect(ctx,-13,-45,26,26,8);
    ctx.fill();
    ctx.fillStyle='#7c3aed';
    ctx.fillRect(-3,-44,6,24);

    ctx.fillStyle=hero.activePower==='fire'?'#ef4444':'#ff4d9d';
    ctx.beginPath();
    ctx.moveTo(-11,-41);
    ctx.quadraticCurveTo(-29,-28,-19,-5);
    ctx.lineTo(-7,-18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle='#2563eb';
    ctx.lineWidth=6;
    ctx.beginPath();
    ctx.moveTo(-11,-38);
    ctx.lineTo(-18,-22-stride*.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(11,-38);
    ctx.lineTo(18,-22+stride*.35);
    ctx.stroke();

    ctx.fillStyle=hero.activePower==='fire'?'#f97316':'#f7c4a5';
    ctx.beginPath();
    ctx.arc(-18,-22-stride*.35,4,0,Math.PI*2);
    ctx.arc(18,-22+stride*.35,4,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#f7c4a5';
    ctx.beginPath();
    ctx.arc(0,-54,11,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#4b2e1f';
    ctx.beginPath();
    ctx.arc(-1,-58,10,Math.PI,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#111';
    ctx.beginPath();
    ctx.arc(5,-54,2,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#7c3aed';
    roundRect(ctx,-12,-67,25,8,4);
    ctx.fill();
    ctx.fillStyle='#fde047';
    ctx.beginPath();
    ctx.moveTo(0,-71);
    ctx.lineTo(5,-64);
    ctx.lineTo(-5,-64);
    ctx.closePath();
    ctx.fill();

    drawSwordOnHero();

    if (hero.activePower==='shield'&&hero.shieldHits>0) {
      ctx.strokeStyle='rgba(96,165,250,.95)';
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.arc(0,-31,37,0,Math.PI*2);
      ctx.stroke();
    }
    if (hero.activePower==='star') {
      ctx.strokeStyle='#fde047';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(0,-31,40+Math.sin(frame*.15)*3,0,Math.PI*2);
      ctx.stroke();
    }

    ctx.restore();

    if (hero.attackTimer>0) drawSwordSlash(x,y);
  }

  function drawSwordOnHero() {
    ctx.save();
    ctx.translate(15,-31);
    ctx.rotate(.45);
    ctx.fillStyle='#d1d5db';
    ctx.fillRect(-2,-20,4,25);
    ctx.fillStyle=campaign.swordLevel>=7?'#fde047':campaign.swordLevel>=4?'#93c5fd':'#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(-5,-22);
    ctx.lineTo(0,-34);
    ctx.lineTo(5,-22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#7c3aed';
    ctx.fillRect(-5,4,10,5);
    ctx.restore();
  }

  function drawSwordSlash(x,y) {
    const progress=1-hero.attackTimer/17;
    ctx.save();
    ctx.translate(x+hero.w/2,y+32);
    if (hero.facing<0) ctx.scale(-1,1);
    ctx.strokeStyle=hero.activePower==='fire'?'#fb923c':campaign.swordLevel>=7?'#fde047':'rgba(255,255,255,.9)';
    ctx.lineWidth=6+Math.floor(campaign.swordLevel/3);
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.arc(8,0,38+campaign.swordLevel*2,-1.25+progress*.6,.65+progress*.6);
    ctx.stroke();
    ctx.restore();
  }

  function drawGoal() {
    const x=level.goalX-cameraX;
    if (x<-100||x>W+120) return;
    const open=hero.relic&&level.boss.dead;

    ctx.save();
    ctx.shadowColor=open?'#a78bfa':'#ef4444';
    ctx.shadowBlur=22;
    ctx.fillStyle=open?'#6d28d9':'#3f3f46';
    roundRect(ctx,x,FLOOR_Y-130,72,130,30);
    ctx.fill();
    ctx.fillStyle=open?'#c4b5fd':'#71717a';
    roundRect(ctx,x+13,FLOOR_Y-112,46,112,22);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='#fff';
    ctx.font='27px Arial';
    ctx.textAlign='center';
    ctx.fillText(open?'🏆':'🔒',x+36,FLOOR_Y-58);
    ctx.restore();
  }

  function draw() {
    if (!level || !hero) return;

    drawBackground();
    level.grounds.forEach(drawPlatform);
    level.platforms.forEach(drawPlatform);
    level.moving.forEach(drawPlatform);
    level.spikes.forEach(drawSpike);
    level.signs.forEach(drawSign);
    level.chests.forEach(drawChest);
    level.coins.forEach(drawCoin);
    level.powers.forEach(drawPower);
    level.shards.forEach(drawShard);
    drawRelic();
    level.enemies.forEach(drawEnemy);
    drawGoal();

    heroShots.forEach(shot => {
      const x=shot.x-cameraX;
      ctx.fillStyle='#f97316';
      ctx.shadowColor='#fde047';
      ctx.shadowBlur=13;
      ctx.beginPath();
      ctx.arc(x,shot.y+shot.h/2,8,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur=0;
    });

    enemyShots.forEach(shot => {
      const x=shot.x-cameraX;
      ctx.fillStyle=shot.color;
      ctx.shadowColor=shot.color;
      ctx.shadowBlur=14;
      ctx.beginPath();
      ctx.arc(x,shot.y,9,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur=0;
    });

    particles.forEach(p => {
      ctx.globalAlpha=Math.max(0,p.life/58);
      ctx.fillStyle=p.color;
      ctx.beginPath();
      ctx.arc(p.x-cameraX,p.y,p.size,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
    });

    drawHero();

    const progress=clamp(hero.x/level.goalX,0,1);
    ctx.fillStyle='rgba(15,23,42,.72)';
    ctx.fillRect(12,H-19,W-24,8);
    ctx.fillStyle='#fde047';
    ctx.fillRect(12,H-19,(W-24)*progress,8);
    ctx.fillStyle='rgba(15,23,42,.75)';
    ctx.font='bold 12px Arial';
    ctx.textAlign='center';
    ctx.fillText(
      hero.relic
        ? (level.boss.dead?'🏆 Portal abierto':'⚔️ Ve al monstruo final')
        : '🎯 Busca la reliquia',
      W/2,H-29
    );
  }

  function roundRect(context,x,y,w,h,r) {
    const radius=Math.min(r,w/2,h/2);
    context.beginPath();
    context.moveTo(x+radius,y);
    context.arcTo(x+w,y,x+w,y+h,radius);
    context.arcTo(x+w,y+h,x,y+h,radius);
    context.arcTo(x,y+h,x,y,radius);
    context.arcTo(x,y,x+w,y,radius);
    context.closePath();
  }

  function loop() {
    if (!document.getElementById('pl10Game')) return;
    update();
    draw();
    const id=requestAnimationFrame(loop);
    animationId=typeof registerAnimation==='function'?registerAnimation(id):id;
  }

  function bindHold(id,key) {
    const btn=document.getElementById(id);
    if (!btn) return;

    const down=e=>{
      e.preventDefault();
      e.stopPropagation();
      keys[key]=true;
      btn.style.transform='scale(.93)';
    };
    const up=e=>{
      e.preventDefault();
      e.stopPropagation();
      keys[key]=false;
      btn.style.transform='scale(1)';
    };

    btn.addEventListener('pointerdown',down);
    btn.addEventListener('pointerup',up);
    btn.addEventListener('pointercancel',up);
    btn.addEventListener('pointerleave',up);
  }

  function keyHandler(e) {
    if (['ArrowLeft','a','A'].includes(e.key)) {
      keys.left=e.type==='keydown';
      e.preventDefault();
    }
    if (['ArrowRight','d','D'].includes(e.key)) {
      keys.right=e.type==='keydown';
      e.preventDefault();
    }
    if (e.type==='keydown' && ['ArrowUp','w','W',' '].includes(e.key)) {
      jump();
      e.preventDefault();
    }
    if (e.type==='keydown' && ['j','J','k','K'].includes(e.key)) {
      attack();
      e.preventDefault();
    }
  }

  function sound(name) {
    try {
      if (typeof SFX==='undefined') return;
      if (name==='jump' && SFX.jump) SFX.jump();
      else if (name==='coin' && SFX.coin) SFX.coin();
      else if (name==='attack' && SFX.shoot) SFX.shoot();
      else if (name==='hit' && SFX.hit) SFX.hit();
      else if (name==='lose' && SFX.lose) SFX.lose();
      else if (name==='win' && SFX.win) SFX.win();
      else if (name==='pop' && SFX.pop) SFX.pop();
    } catch (e) {}
  }

  function adjustViewport() {
    const wrap=document.getElementById('pl10Wrap');
    if (!wrap) return;
    const vv=window.visualViewport;
    if (vv) {
      wrap.style.height=`${vv.height}px`;
      wrap.style.top=`${vv.offsetTop}px`;
    }
  }

  bindHold('pl10Left','left');
  bindHold('pl10Right','right');

  document.getElementById('pl10Jump').addEventListener('pointerdown',e=>{
    e.preventDefault();
    e.stopPropagation();
    jump();
  });

  document.getElementById('pl10SwordBtn').addEventListener('pointerdown',e=>{
    e.preventDefault();
    e.stopPropagation();
    attack();
  });

  canvas.addEventListener('pointerdown',e=>{
    if (e.clientY<H*.66) {
      jump();
      e.preventDefault();
    }
  });

  document.addEventListener('keydown',keyHandler);
  document.addEventListener('keyup',keyHandler);
  if (window.activeKeyHandlers) window.activeKeyHandlers.push(keyHandler);

  window.addEventListener('blur',()=>{
    keys.left=false;
    keys.right=false;
  });
  document.addEventListener('visibilitychange',()=>{
    if (document.hidden) {
      keys.left=false;
      keys.right=false;
    }
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize',adjustViewport);
    window.visualViewport.addEventListener('scroll',adjustViewport);
  }
  window.addEventListener('orientationchange',adjustViewport);

  window.pl10UsePower=usePower;
  window.pl10CloseModal=hideModal;
  window.pl10RetryLevel=(event)=>{
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const btn=document.getElementById('pl10RetryBtn');
    if (btn) {
      btn.disabled=true;
      btn.textContent='Cargando nivel…';
    }

    hideModal();
    keys.left=false;
    keys.right=false;
    startLevel(campaign.level,false);
    notify(`↺ Nivel ${campaign.level+1} reiniciado`,'success',1100);
  };

  window.pl10NextLevel=(event)=>{
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    hideModal();
    keys.left=false;
    keys.right=false;
    startLevel(campaign.level,true);
  };
  window.pl10RestartCampaign=()=>{
    campaign={
      level:0,
      unlocked:0,
      coins:0,
      swordLevel:1,
      swordShards:0,
      inventory:{shield:0,speed:0,wing:0,fire:0,star:0,heal:0},
      completed:false
    };
    saveProgress();
    startLevel(0,true);
  };

  adjustViewport();
  startLevel(campaign.completed?0:campaign.level,true);
  loop();
};
