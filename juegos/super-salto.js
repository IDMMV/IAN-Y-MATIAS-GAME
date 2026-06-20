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
    {name:'Rey Gelatina', icon:'👑', color:'#65a30d', shot:'#a3e635', title:'Soberano de la Pradera', attack:'Lluvia de gel'},
    {name:'Escarabajo de Hierro', icon:'🪲', color:'#7c3aed', shot:'#c084fc', title:'Armadura del Bosque', attack:'Carga blindada'},
    {name:'Reina Murciélago', icon:'🦇', color:'#312e81', shot:'#818cf8', title:'Señora de la Cueva', attack:'Oleada nocturna'},
    {name:'Gólem de Lava', icon:'🌋', color:'#b91c1c', shot:'#fb923c', title:'Corazón del Volcán', attack:'Meteoritos ardientes'},
    {name:'Bestia de Hielo', icon:'❄️', color:'#0284c7', shot:'#67e8f9', title:'Colmillo de la Montaña', attack:'Tormenta congelante'},
    {name:'Caballero Sombrío', icon:'🌑', color:'#3f3f46', shot:'#a78bfa', title:'Guardián de las Ruinas', attack:'Salto de sombras'},
    {name:'Ogro de la Selva', icon:'🌿', color:'#166534', shot:'#4ade80', title:'Señor de las Lianas', attack:'Invocación salvaje'},
    {name:'Dragón del Trueno', icon:'⚡', color:'#a16207', shot:'#fde047', title:'Amo de las Islas', attack:'Rayos del cielo'},
    {name:'Mago del Vacío', icon:'🔮', color:'#581c87', shot:'#e879f9', title:'Tejedor de Dimensiones', attack:'Orbe perseguidor'},
    {name:'Titán de la Corona', icon:'👹', color:'#7f1d1d', shot:'#f87171', title:'Rey de las Diez Tierras', attack:'Caos imperial'}
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
        bottom:max(10px,env(safe-area-inset-bottom));
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        padding:0 10px;
        pointer-events:none;
      }
      #pl10Controls *{ box-sizing:border-box; }
      .pl10PadArea{
        pointer-events:auto;
        position:relative;
        width:min(43vw,180px);
        height:min(43vw,180px);
        border-radius:999px;
        border:2px solid rgba(255,255,255,.28);
        background:radial-gradient(circle at center, rgba(255,255,255,.08), rgba(255,255,255,.02) 58%, rgba(0,0,0,.08));
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.1), 0 10px 22px rgba(0,0,0,.22);
        touch-action:none;
        backdrop-filter: blur(2px);
      }
      .pl10PadRing{
        position:absolute;
        inset:17%;
        border-radius:999px;
        border:2px solid rgba(255,255,255,.23);
      }
      #pl10MoveStick{
        position:absolute;
        left:50%;
        top:50%;
        width:32%;
        height:32%;
        transform:translate(-50%,-50%);
        border-radius:999px;
        background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.45), rgba(255,255,255,.16));
        border:2px solid rgba(255,255,255,.42);
        box-shadow:0 4px 10px rgba(0,0,0,.18);
      }
      .pl10PadHint{
        position:absolute;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        color:rgba(255,255,255,.92);
        text-shadow:0 2px 8px rgba(0,0,0,.36);
        font:900 .95rem Nunito,sans-serif;
        text-align:center;
        pointer-events:none;
      }
      .pl10SmallBubble{
        position:absolute;
        bottom:12%;
        left:50%;
        transform:translateX(-50%);
        width:28%;
        height:28%;
        border-radius:999px;
        border:2px solid rgba(255,255,255,.35);
        background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.35), rgba(255,255,255,.06));
        display:flex;
        align-items:center;
        justify-content:center;
        color:#fff;
        font-size:1.3rem;
        text-shadow:0 2px 8px rgba(0,0,0,.36);
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
        .pl10PadArea{
          width:min(24vw,170px);
          height:min(24vw,170px);
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
        <div id="pl10MovePad" class="pl10PadArea" aria-label="Mover">
          <div class="pl10PadRing"></div>
          <div id="pl10MoveStick"></div>
          <div class="pl10PadHint">Mover</div>
        </div>
        <div id="pl10ActionPad" class="pl10PadArea" aria-label="Acciones">
          <div class="pl10PadRing"></div>
          <div class="pl10PadHint" style="top:39%">↑ Salto</div>
          <div class="pl10SmallBubble">⚔️</div>
          <div class="pl10PadHint" style="top:72%;font-size:.78rem">Toque = ataque</div>
        </div>
      </div>
    </div>`;

  const canvas = document.getElementById('pl10Game');
  const ctx = canvas.getContext('2d');
  const keys = {left:false, right:false};
  const touchState = {
    movePointerId:null,
    actionPointerId:null,
    moveCenter:{x:0,y:0,r:0},
    actionCenter:{x:0,y:0,r:0},
    actionStart:null
  };
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
  let screenShake = 0;
  let screenFlash = 0;
  let bossIntroTimer = 0;
  let lightningFlash = 0;
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
      lastAttack:-1,
      attackCount:0,
      phaseStage:1,
      enraged:false,
      chargeTimer:0,
      teleportTimer:0,
      jumpVy:0,
      groundY:FLOOR_Y-94,
      summonCooldown:160,
      aura:0,
      telegraph:0
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

    releaseMoveTouch();

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
        <div style="margin-top:10px;color:#fde68a;font-weight:900">Misión: consigue la reliquia 🧿 y derrota a ${level.bossInfo.icon} ${level.bossInfo.name}</div><div style="margin-top:6px;color:#f0abfc;font-size:.82rem">${level.bossInfo.title} · ${level.bossInfo.attack}</div>
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

  function triggerShake(amount=8, flash=0) {
    screenShake = Math.max(screenShake, amount);
    screenFlash = Math.max(screenFlash, flash);
  }

  function spawnEnemyShot(x,y,vx,vy,color,extra={}) {
    enemyShots.push(Object.assign({
      x,y,w:18,h:18,vx,vy,life:190,color,
      gravity:0,homing:false,trail:true,size:9
    },extra));
  }

  function spawnBossMinion(boss, type='slime') {
    const offset = boss.attackCount % 2 === 0 ? -120 : 120;
    const minion = makeEnemy(boss.x + offset, campaign.level, type, seededRandom(frame + boss.attackCount*97));
    minion.baseX = boss.x + offset;
    minion.x = minion.baseX;
    minion.y = type==='bat' ? FLOOR_Y-150 : FLOOR_Y-42;
    minion.range = 100;
    level.enemies.push(minion);
    addParticles(minion.x+20,minion.y+20,boss.shotColor,20);
  }

  function performBossAttack(boss) {
    if (!hero || boss.dead) return;
    boss.attackCount++;
    const idx = boss.bossIndex;
    const hx = hero.x + hero.w/2;
    const hy = hero.y + hero.h/2;
    const bx = boss.x + boss.w/2;
    const by = boss.y + boss.h*.42;
    const speed = 4.8 + idx*.14 + (boss.enraged ? .8 : 0);
    const aim = Math.atan2(hy-by,hx-bx);

    triggerShake(idx>=7?8:4, idx===7?0.15:0);

    if (idx===0) {
      [-.34,0,.34].forEach(a=>spawnEnemyShot(bx,by,Math.cos(aim+a)*speed,Math.sin(aim+a)*speed,boss.shotColor,{gravity:.035,size:10}));
    } else if (idx===1) {
      boss.chargeTimer = 42;
      boss.dir = hx>=bx?1:-1;
      spawnEnemyShot(bx,by,boss.dir*7,-1,boss.shotColor,{size:11,gravity:.02});
    } else if (idx===2) {
      for (let i=0;i<7;i++) {
        const a = i*Math.PI*2/7 + frame*.01;
        spawnEnemyShot(bx,by,Math.cos(a)*speed,Math.sin(a)*speed,boss.shotColor,{size:8});
      }
    } else if (idx===3) {
      for (let i=0;i<6;i++) {
        const px = hero.x - 190 + i*76;
        spawnEnemyShot(px,-30,0,5.2+i*.18,boss.shotColor,{gravity:.035,size:11,meteor:true});
      }
    } else if (idx===4) {
      [-.48,-.24,0,.24,.48].forEach(a=>spawnEnemyShot(bx,by,Math.cos(aim+a)*speed*.9,Math.sin(aim+a)*speed*.9,boss.shotColor,{size:9,ice:true}));
    } else if (idx===5) {
      boss.teleportTimer = 16;
      boss.x = clamp(hero.x + (hero.facing>0?-150:150), level.bossArenaStart, level.width-250);
      addParticles(boss.x+42,boss.y+45,boss.shotColor,30);
      spawnEnemyShot(boss.x+42,boss.y+40,Math.cos(aim)*speed*1.15,Math.sin(aim)*speed*1.15,boss.shotColor,{size:12,shadow:true});
    } else if (idx===6) {
      spawnBossMinion(boss, boss.attackCount%2?'slime':'beetle');
      if (boss.enraged) spawnBossMinion(boss,'bat');
      spawnEnemyShot(bx,by,Math.cos(aim)*speed,Math.sin(aim)*speed,boss.shotColor,{size:10});
    } else if (idx===7) {
      lightningFlash = 1;
      for (let i=0;i<4;i++) {
        const px = hero.x - 130 + i*88;
        spawnEnemyShot(px,-10,0,7.4,boss.shotColor,{life:120,size:12,lightning:true});
      }
    } else if (idx===8) {
      spawnEnemyShot(bx,by,Math.cos(aim)*3.2,Math.sin(aim)*3.2,boss.shotColor,{life:260,size:13,homing:true});
      if (boss.enraged) spawnEnemyShot(bx,by,-Math.cos(aim)*2.5,-Math.sin(aim)*2.5,boss.shotColor,{life:230,size:11,homing:true});
    } else {
      const pattern = boss.attackCount % 3;
      if (pattern===0) {
        for (let i=0;i<9;i++) {
          const a = i*Math.PI*2/9;
          spawnEnemyShot(bx,by,Math.cos(a)*speed,Math.sin(a)*speed,boss.shotColor,{size:9});
        }
      } else if (pattern===1) {
        boss.chargeTimer = 54;
        boss.dir = hx>=bx?1:-1;
        for (let i=0;i<5;i++) spawnEnemyShot(hero.x-160+i*80,-20,0,6.2+i*.12,boss.shotColor,{size:11,meteor:true});
      } else {
        boss.teleportTimer = 18;
        boss.x = clamp(hero.x + (hero.facing>0?-170:170), level.bossArenaStart, level.width-250);
        [-.3,0,.3].forEach(a=>spawnEnemyShot(boss.x+42,boss.y+38,Math.cos(aim+a)*speed*1.2,Math.sin(aim+a)*speed*1.2,boss.shotColor,{size:12,homing:a===0}));
      }
    }
  }

  function updateEpicBoss(boss) {
    const distance = hero.x - boss.x;
    boss.dir = distance>=0?1:-1;
    boss.aura += .07;

    if (!boss.enraged && boss.hp <= boss.maxHp*.5) {
      boss.enraged = true;
      boss.phaseStage = 2;
      boss.speed *= 1.28;
      boss.cooldown = 24;
      triggerShake(14,.34);
      notify(`🔥 ${boss.name} entra en FASE 2`, 'danger', 2200);
    }

    if (boss.chargeTimer>0) {
      boss.chargeTimer--;
      boss.x += boss.dir * (boss.enraged?10:8);
      boss.x = clamp(boss.x, level.bossArenaStart-80, level.width-245);
      if (boss.chargeTimer%5===0) addParticles(boss.x+boss.w/2,boss.y+boss.h,boss.shotColor,4);
    } else {
      boss.x += boss.dir*boss.speed*(Math.abs(distance)>110?1:.28);
      boss.x = clamp(boss.x,boss.baseX-boss.range,boss.baseX+boss.range);
    }

    const jumpBoss = [2,3,4,7,9].includes(boss.bossIndex);
    if (jumpBoss && boss.jumpVy===0 && frame%(boss.enraged?115:160)===0) {
      boss.jumpVy = -10.5 - boss.bossIndex*.12;
    }
    if (boss.jumpVy!==0 || boss.y<boss.groundY) {
      boss.jumpVy += .58;
      boss.y += boss.jumpVy;
      if (boss.y>=boss.groundY) {
        boss.y=boss.groundY;
        boss.jumpVy=0;
        triggerShake(7,.08);
      }
    }

    boss.cooldown--;
    if (boss.cooldown<=0) {
      boss.telegraph = 18;
      performBossAttack(boss);
      boss.cooldown = Math.max(30, 76-campaign.level*3-(boss.enraged?16:0));
    }
    if (boss.telegraph>0) boss.telegraph--;
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
    triggerShake(10,.22);
    addParticles(hero.x+hero.w/2,hero.y+hero.h/2,'#ef4444',18);
    updateHud();

    if (hero.hp<=0) {
      releaseMoveTouch();
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
    if (enemy.type==='boss') triggerShake(5,.09);
    addParticles(enemy.x+enemy.w/2,enemy.y+enemy.h/2,enemy.type==='boss'?enemy.shotColor:'#84cc16',16);

    if (enemy.hp<=0) {
      enemy.dead = true;
      campaign.coins += enemy.type==='boss' ? 30+campaign.level*5 : 3;
      updateHud();

      if (enemy.type==='boss') {
        triggerShake(18,.45);
        addParticles(enemy.x+enemy.w/2,enemy.y+enemy.h/2,enemy.shotColor,60);
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
    if (screenShake>0) screenShake*=.86;
    if (screenFlash>0) screenFlash*=.84;
    if (lightningFlash>0) lightningFlash*=.82;
    if (bossIntroTimer>0) bossIntroTimer--;

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
          bossIntroTimer = 150;
          triggerShake(12,.24);
          notify(`${enemy.icon} ${enemy.name} · ${BOSSES[enemy.bossIndex].attack}`,'danger',2800);
        }

        if (enemy.active) updateEpicBoss(enemy);
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
      if (shot.homing && shot.life>40) {
        const angle = Math.atan2((hero.y+hero.h/2)-shot.y,(hero.x+hero.w/2)-shot.x);
        shot.vx = shot.vx*.94 + Math.cos(angle)*.28;
        shot.vy = shot.vy*.94 + Math.sin(angle)*.28;
      }
      shot.vy += shot.gravity || 0;
      shot.x += shot.vx;
      shot.y += shot.vy;
      shot.life--;
      if (shot.trail && frame%3===0) particles.push({x:shot.x,y:shot.y,vx:-shot.vx*.08,vy:-shot.vy*.08,life:16,size:Math.max(2,(shot.size||9)*.3),color:shot.color});
      if (shot.life>0 && rectsOverlap(hero,shot,3)) {
        shot.life = 0;
        triggerShake(8,.12);
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
        <div style="margin-top:5px;color:#c4b5fd">Tu espada, monedas y potenciadores se conservan.</div><div style="margin-top:6px;color:#f0abfc">El siguiente mundo será más peligroso.</div>
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

    drawSkyDecor();
    drawHills(theme.far,FLOOR_Y,150,.18,155);
    drawHills(theme.near,FLOOR_Y,102,.38,128);
    drawWorldDecor();
  }

  function positiveMod(value,mod) {
    return ((value%mod)+mod)%mod;
  }

  function drawSkyDecor() {
    const lvl = campaign.level;
    const orbColors = [
      'rgba(255,245,175,.90)','rgba(233,255,210,.84)','rgba(207,176,255,.72)','rgba(255,162,73,.80)','rgba(244,252,255,.95)',
      'rgba(230,230,255,.84)','rgba(255,245,126,.84)','rgba(255,255,210,.74)','rgba(230,180,255,.80)','rgba(255,211,122,.84)'
    ];
    ctx.save();
    ctx.fillStyle = orbColors[lvl];
    ctx.beginPath();
    ctx.arc(W*.72-cameraX*.025,92,lvl===4?48:43,0,Math.PI*2);
    ctx.fill();

    if (lvl===0) {
      const rx = W*.22 - cameraX*.02;
      const ry = 96;
      ctx.lineWidth = 5;
      ['#ff4d6d','#fb923c','#fde047','#34d399','#60a5fa','#a78bfa'].forEach((c,idx)=>{
        ctx.strokeStyle=c;
        ctx.beginPath();
        ctx.arc(rx,ry,25+idx*9,Math.PI,Math.PI*2);
        ctx.stroke();
      });
    }

    if (lvl===5 || lvl===9) {
      ctx.fillStyle='rgba(255,255,255,.95)';
      for (let i=0;i<24;i++) {
        const x = positiveMod(i*97 - cameraX*.03, W+70) - 30;
        const y = 26 + (i*37 % 160);
        const r = 1 + (i % 3);
        ctx.beginPath();
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fill();
      }
    }

    for (let i=0;i<7;i++) {
      const x = positiveMod(i*240-cameraX*.12,W+320)-120;
      const y = 70+(i%3)*58;
      ctx.fillStyle = lvl===7 ? 'rgba(220,226,236,.30)' : 'rgba(255,255,255,.46)';
      ctx.beginPath(); ctx.ellipse(x,y,62,22,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x+34,y-11,38,25,0,0,Math.PI*2); ctx.fill();
      if (lvl===4) {
        ctx.fillStyle='rgba(255,255,255,.25)';
        ctx.beginPath(); ctx.ellipse(x-14,y+20,16,8,0,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();

    if (lvl===4) {
      ctx.save();
      ctx.strokeStyle='rgba(255,255,255,.6)';
      ctx.lineWidth=2;
      for (let i=0;i<34;i++) {
        const x = positiveMod(i*61 - frame*1.4 - cameraX*.08, W+40)-20;
        const y = 50 + (i*29 % 260);
        ctx.beginPath();
        ctx.moveTo(x,y); ctx.lineTo(x+7,y+12); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawWorldDecor() {
    const lvl = campaign.level;
    ctx.save();

    if (lvl===0) {
      for (let i=0;i<9;i++) {
        const x = positiveMod(i*165 - cameraX*.55, W+120)-60;
        drawFlower(x, FLOOR_Y-5, ['#f472b6','#facc15','#60a5fa'][i%3]);
      }
    } else if (lvl===1) {
      for (let i=0;i<6;i++) {
        const x = positiveMod(i*220 - cameraX*.45, W+140)-70;
        drawTree(x, FLOOR_Y+6, 95 + (i%2)*24, '#14532d', '#22c55e');
      }
      for (let i=0;i<10;i++) {
        const x = positiveMod(i*113 - frame*.6 - cameraX*.25, W+80)-30;
        const y = 120 + (i*23 % 160);
        ctx.fillStyle='rgba(253,224,71,.55)';
        ctx.beginPath(); ctx.arc(x,y,2+(i%2),0,Math.PI*2); ctx.fill();
      }
    } else if (lvl===2) {
      for (let i=0;i<8;i++) {
        const x = positiveMod(i*175 - cameraX*.48, W+140)-50;
        drawCrystal(x, FLOOR_Y+5, 22 + (i%3)*6, ['#c084fc','#93c5fd','#ddd6fe'][i%3]);
      }
      ctx.fillStyle='rgba(255,255,255,.08)';
      for (let i=0;i<4;i++) {
        const x = positiveMod(i*290 - cameraX*.15, W+200)-70;
        ctx.beginPath(); ctx.ellipse(x, 170+(i%2)*60, 120, 35, 0, 0, Math.PI*2); ctx.fill();
      }
    } else if (lvl===3) {
      for (let i=0;i<11;i++) {
        const x = positiveMod(i*118 - cameraX*.55, W+120)-40;
        ctx.fillStyle='rgba(255,90,20,.46)';
        ctx.beginPath();
        ctx.moveTo(x,FLOOR_Y+14);
        ctx.lineTo(x+20,FLOOR_Y-42-Math.sin(frame*.08+i)*12);
        ctx.lineTo(x+40,FLOOR_Y+14);
        ctx.fill();
      }
      for (let i=0;i<6;i++) {
        const x = positiveMod(i*230 - cameraX*.3, W+160)-60;
        drawVolcanoRock(x, FLOOR_Y+20, 28 + (i%2)*10);
      }
    } else if (lvl===4) {
      for (let i=0;i<7;i++) {
        const x = positiveMod(i*180 - cameraX*.43, W+120)-60;
        drawPine(x, FLOOR_Y+8, 80 + (i%3)*18);
      }
    } else if (lvl===5) {
      for (let i=0;i<5;i++) {
        const x = positiveMod(i*290 - cameraX*.35, W+180)-80;
        drawColumn(x, FLOOR_Y+4, 110);
      }
    } else if (lvl===6) {
      for (let i=0;i<6;i++) {
        const x = positiveMod(i*210 - cameraX*.52, W+140)-70;
        drawTotem(x, FLOOR_Y+6, 82 + (i%2)*20);
      }
      for (let i=0;i<9;i++) {
        const x = positiveMod(i*137 - cameraX*.2, W+100)-40;
        const y = 95 + (i*37 % 150);
        ctx.strokeStyle='rgba(34,197,94,.28)';
        ctx.lineWidth=4;
        ctx.beginPath(); ctx.arc(x,y,22,Math.PI*.1,Math.PI*.9); ctx.stroke();
      }
    } else if (lvl===7) {
      for (let i=0;i<3;i++) {
        const x=positiveMod(i*270+80-cameraX*.18,W+180)-80;
        drawFloatingIsland(x, 155 + (i%2)*45);
      }
      ctx.strokeStyle='rgba(253,224,71,.65)';
      ctx.lineWidth=3;
      for (let i=0;i<4;i++) {
        const x=positiveMod(i*290+frame*2,W+150)-70;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+20,55); ctx.lineTo(x-4,95); ctx.stroke();
      }
    } else if (lvl===8) {
      for (let i=0;i<5;i++) {
        const x = positiveMod(i*245 - cameraX*.28, W+180)-80;
        drawPortalStatue(x, FLOOR_Y+10, 92);
      }
      ctx.strokeStyle='rgba(216,180,254,.42)';
      ctx.lineWidth=4;
      for (let i=0;i<3;i++) {
        const x=positiveMod(i*310-frame*1.5, W+120)-60;
        ctx.beginPath();
        ctx.moveTo(x,165); ctx.bezierCurveTo(x+50,140,x+80,220,x+130,190); ctx.stroke();
      }
    } else if (lvl===9) {
      for (let i=0;i<5;i++) {
        const x = positiveMod(i*250 - cameraX*.4, W+180)-90;
        drawCastleTower(x, FLOOR_Y+10, 145);
      }
      ctx.fillStyle='rgba(255,255,255,.06)';
      ctx.fillRect(0, FLOOR_Y-130, W, 8);
    }

    ctx.restore();
  }

  function drawFlower(x, y, color) {
    ctx.save();
    ctx.strokeStyle='#166534'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-26); ctx.stroke();
    ctx.fillStyle=color;
    for (let i=0;i<5;i++) {
      const a = i*Math.PI*2/5;
      ctx.beginPath(); ctx.arc(x+Math.cos(a)*8,y-34+Math.sin(a)*8,6,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(x,y-34,6,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawTree(x, baseY, h, trunk, leaves) {
    ctx.save();
    ctx.fillStyle=trunk; ctx.fillRect(x-8, baseY-h, 16, h);
    ctx.fillStyle=leaves;
    for (const [dx,dy,r] of [[0,-h,28],[-24,-h+18,22],[24,-h+20,22],[0,-h+38,24]]) {
      ctx.beginPath(); ctx.arc(x+dx, baseY+dy, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawCrystal(x, baseY, s, color) {
    ctx.save();
    ctx.translate(x, baseY-s);
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(0,-s); ctx.lineTo(s*.65,-s*.2); ctx.lineTo(s*.38,s); ctx.lineTo(-s*.38,s); ctx.lineTo(-s*.65,-s*.2); ctx.closePath();
    ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.moveTo(-s*.18,-s*.55); ctx.lineTo(0,-s*.12); ctx.lineTo(-s*.18,s*.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawVolcanoRock(x, baseY, s) {
    ctx.save();
    ctx.fillStyle='#3f1f1a';
    ctx.beginPath(); ctx.ellipse(x, baseY-s*.2, s, s*.65, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='#f97316'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x-s*.4, baseY-s*.4); ctx.lineTo(x-s*.1, baseY-s*.05); ctx.lineTo(x+s*.25, baseY-s*.45); ctx.stroke();
    ctx.restore();
  }

  function drawPine(x, baseY, h) {
    ctx.save();
    ctx.fillStyle='#6b7280'; ctx.fillRect(x-6, baseY-h, 12, h);
    ctx.fillStyle='#dbeafe';
    for (let i=0;i<3;i++) {
      ctx.beginPath(); ctx.moveTo(x, baseY-h-8 + i*26); ctx.lineTo(x-28+i*6, baseY-h+24+i*26); ctx.lineTo(x+28-i*6, baseY-h+24+i*26); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawColumn(x, baseY, h) {
    ctx.save();
    ctx.fillStyle='#8b7aa2'; ctx.fillRect(x-16, baseY-h, 32, h);
    ctx.fillStyle='#c4b5fd'; ctx.fillRect(x-20, baseY-h-10, 40, 12); ctx.fillRect(x-20, baseY-4, 40, 12);
    ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=3;
    for (let i=-8;i<=8;i+=8) { ctx.beginPath(); ctx.moveTo(x+i, baseY-h); ctx.lineTo(x+i, baseY); ctx.stroke(); }
    ctx.restore();
  }

  function drawTotem(x, baseY, h) {
    ctx.save();
    ctx.fillStyle='#7c4a24'; roundRect(ctx, x-18, baseY-h, 36, h, 8); ctx.fill();
    ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(x, baseY-h+20, 9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x-7, baseY-h+20, 2.5, 0, Math.PI*2); ctx.arc(x+7, baseY-h+20, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#ef4444'; ctx.fillRect(x-12, baseY-h+38, 24, 8); ctx.fillStyle='#22c55e'; ctx.fillRect(x-12, baseY-h+56, 24, 8);
    ctx.restore();
  }

  function drawFloatingIsland(x, y) {
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.14)'; ctx.beginPath(); ctx.ellipse(x+65,y+46,56,12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#6b7280';
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+130,y); ctx.lineTo(x+96,y+36); ctx.lineTo(x+36,y+36); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#d1d5db'; ctx.fillRect(x+15,y-8,100,10);
    ctx.restore();
  }

  function drawPortalStatue(x, baseY, h) {
    ctx.save();
    ctx.fillStyle='#4c1d95'; ctx.fillRect(x-12, baseY-h, 24, h);
    ctx.strokeStyle='#c084fc'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(x, baseY-h-6, 20, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(196,132,252,.25)'; ctx.beginPath(); ctx.arc(x, baseY-h-6, 12, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawCastleTower(x, baseY, h) {
    ctx.save();
    ctx.fillStyle='#43314d'; ctx.fillRect(x-28, baseY-h, 56, h);
    ctx.fillStyle='#31203a';
    for (let i=-22;i<=22;i+=14) ctx.fillRect(x+i, baseY-h-12, 9, 12);
    ctx.fillStyle='#f472b6'; ctx.fillRect(x-6, baseY-h+14, 12, 26);
    ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(x, baseY-h+8, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
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
    const lvl = campaign.level;
    const topColors = ['#7ddc5f','#5fcf8f','#b08ce9','#ef7b42','#f7fdff','#8f84a6','#6edb47','#f6c34b','#d88dff','#c46d85'];
    const bodyColors = ['#8b5a2b','#6b4d31','#5a4b6f','#603222','#7a8593','#5d5367','#6e4b2d','#5a5f69','#5b3c68','#52404d'];
    const trimColors = ['#b78953','#7dd4a4','#d8c2ff','#ffb267','#dbeafe','#c4b5fd','#c08457','#cbd5e1','#f5d0fe','#f9a8d4'];

    ctx.save();
    ctx.fillStyle = p.type==='ground' ? level.theme.soil : bodyColors[lvl];
    roundRect(ctx,x,p.y,p.w,p.h,p.type==='ground'?0:8);
    ctx.fill();

    ctx.fillStyle = p.type==='ground' ? level.theme.grass : topColors[lvl];
    roundRect(ctx,x,p.y-8,p.w,12,5);
    ctx.fill();

    ctx.fillStyle = trimColors[lvl];
    if (lvl===2) {
      for (let bx=12; bx<p.w; bx+=30) {
        ctx.beginPath();
        ctx.moveTo(x+bx,p.y+10); ctx.lineTo(x+bx+12,p.y+4); ctx.lineTo(x+bx+20,p.y+15); ctx.lineTo(x+bx+10,p.y+18); ctx.closePath();
        ctx.fill();
      }
    } else if (lvl===3) {
      ctx.strokeStyle='rgba(255,160,90,.85)';
      ctx.lineWidth=2;
      for (let bx=16; bx<p.w-10; bx+=34) {
        ctx.beginPath(); ctx.moveTo(x+bx,p.y+7); ctx.lineTo(x+bx+10,p.y+18); ctx.lineTo(x+bx+18,p.y+8); ctx.stroke();
      }
    } else if (lvl===4) {
      ctx.fillStyle='rgba(255,255,255,.55)';
      for (let bx=10; bx<p.w; bx+=26) ctx.fillRect(x+bx,p.y+6,14,4);
    } else if (lvl===5 || lvl===9) {
      ctx.strokeStyle='rgba(255,255,255,.18)';
      ctx.lineWidth=2;
      for (let bx=12; bx<p.w; bx+=24) ctx.strokeRect(x+bx,p.y+6,14,10);
    } else if (lvl===7) {
      ctx.fillStyle='rgba(255,255,255,.18)';
      for (let bx=18; bx<p.w; bx+=32) { ctx.beginPath(); ctx.arc(x+bx,p.y+12,5,0,Math.PI*2); ctx.fill(); }
    } else if (lvl===8) {
      ctx.fillStyle='rgba(255,255,255,.28)';
      for (let bx=14; bx<p.w; bx+=34) {
        ctx.beginPath(); ctx.moveTo(x+bx,p.y+8); ctx.lineTo(x+bx+9,p.y+4); ctx.lineTo(x+bx+18,p.y+8); ctx.lineTo(x+bx+9,p.y+16); ctx.closePath(); ctx.fill();
      }
    } else {
      for (let bx=10; bx<p.w; bx+=36) ctx.fillRect(x+bx,p.y+8,18,4);
    }

    if (p.type==='moving') {
      ctx.strokeStyle='#fde047';
      ctx.lineWidth=3;
      ctx.strokeRect(x,p.y,p.w,p.h);
      ctx.fillStyle='rgba(253,224,71,.28)';
      ctx.fillRect(x+6,p.y-20,p.w-12,10);
    }
    ctx.restore();
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
    if (x<-160||x>W+160) return;
    const lvl = campaign.level;
    const palettes = [
      ['#65a30d','#a3e635'],['#166534','#4ade80'],['#6d28d9','#c084fc'],['#991b1b','#fb923c'],['#0369a1','#67e8f9'],
      ['#27272a','#a78bfa'],['#166534','#86efac'],['#92400e','#fde047'],['#581c87','#e879f9'],['#7f1d1d','#f87171']
    ][lvl];

    ctx.save();
    if (enemy.hit>0) ctx.globalAlpha=.48;

    if (enemy.type==='slime') {
      const bounce = Math.sin(frame*.12+enemy.phase)*2;
      ctx.fillStyle=palettes[0];
      roundRect(ctx,x,enemy.y+10+bounce,enemy.w,enemy.h-10-bounce,15);
      ctx.fill();
      ctx.fillStyle=palettes[1];
      ctx.beginPath(); ctx.ellipse(x+20,enemy.y+13+bounce,18,14,0,Math.PI,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111';
      ctx.beginPath(); ctx.arc(x+12,enemy.y+22+bounce,3,0,Math.PI*2); ctx.arc(x+27,enemy.y+22+bounce,3,0,Math.PI*2); ctx.fill();
      if (lvl===3) { ctx.fillStyle='#fb923c'; ctx.beginPath(); ctx.arc(x+20,enemy.y+34,5,0,Math.PI*2); ctx.fill(); }
    } else if (enemy.type==='beetle') {
      ctx.fillStyle=palettes[0];
      ctx.beginPath(); ctx.ellipse(x+20,enemy.y+22,20,17,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=palettes[1]; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(x+20,enemy.y+7); ctx.lineTo(x+20,enemy.y+37); ctx.stroke();
      ctx.strokeStyle='#111827'; ctx.lineWidth=3;
      for (let i=0;i<3;i++) {
        ctx.beginPath(); ctx.moveTo(x+7,enemy.y+17+i*7); ctx.lineTo(x-3,enemy.y+13+i*10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+33,enemy.y+17+i*7); ctx.lineTo(x+43,enemy.y+13+i*10); ctx.stroke();
      }
    } else if (enemy.type==='bat') {
      const flap=Math.sin(frame*.2+enemy.phase)*8;
      ctx.fillStyle=palettes[0];
      ctx.beginPath(); ctx.ellipse(x+20,enemy.y+20,15,14,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=palettes[1];
      ctx.beginPath(); ctx.moveTo(x+8,enemy.y+18); ctx.lineTo(x-14,enemy.y+5+flap); ctx.lineTo(x+1,enemy.y+29); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x+32,enemy.y+18); ctx.lineTo(x+54,enemy.y+5+flap); ctx.lineTo(x+39,enemy.y+29); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(x+15,enemy.y+18,2,0,Math.PI*2); ctx.arc(x+25,enemy.y+18,2,0,Math.PI*2); ctx.fill();
    } else {
      const pulse = 1 + Math.sin(enemy.aura)*.045;
      const bob = enemy.jumpVy===0 ? Math.sin(frame*.08+enemy.phase)*2 : 0;
      ctx.translate(x+enemy.w/2,enemy.y+enemy.h/2+bob);
      ctx.scale(enemy.dir<0?-pulse:pulse,pulse);

      ctx.globalAlpha*=.24;
      ctx.fillStyle=enemy.shotColor;
      ctx.beginPath(); ctx.arc(0,0,58+Math.sin(enemy.aura)*7,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=enemy.hit>0?.48:1;

      ctx.shadowColor=enemy.shotColor;
      ctx.shadowBlur=enemy.enraged?32:20;
      ctx.fillStyle=enemy.color;
      roundRect(ctx,-enemy.w/2,-enemy.h/2+8,enemy.w,enemy.h-8,22);
      ctx.fill();
      ctx.shadowBlur=0;

      if (enemy.enraged) {
        ctx.strokeStyle='#fde047'; ctx.lineWidth=4;
        ctx.beginPath(); ctx.arc(0,-2,49+Math.sin(frame*.16)*4,0,Math.PI*2); ctx.stroke();
      }

      ctx.font='42px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(enemy.icon,0,-16);
      ctx.fillStyle='#fde047';
      ctx.beginPath(); ctx.arc(-17,12,5,0,Math.PI*2); ctx.arc(17,12,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111';
      ctx.beginPath(); ctx.arc(-17,12,2,0,Math.PI*2); ctx.arc(17,12,2,0,Math.PI*2); ctx.fill();

      const idx=enemy.bossIndex;
      ctx.strokeStyle=enemy.shotColor; ctx.lineWidth=5;
      if (idx===1) { ctx.beginPath(); ctx.moveTo(-34,-28); ctx.lineTo(-50,-44); ctx.moveTo(34,-28); ctx.lineTo(50,-44); ctx.stroke(); }
      if (idx===2 || idx===7) { ctx.beginPath(); ctx.moveTo(-40,-5); ctx.lineTo(-62,-25); ctx.moveTo(40,-5); ctx.lineTo(62,-25); ctx.stroke(); }
      if (idx===3) { ctx.fillStyle='#fb923c'; ctx.beginPath(); ctx.arc(0,28,13+Math.sin(frame*.15)*4,0,Math.PI*2); ctx.fill(); }
      if (idx===4) { ctx.fillStyle='#e0f2fe'; ctx.beginPath(); ctx.moveTo(0,-55); ctx.lineTo(10,-34); ctx.lineTo(-10,-34); ctx.closePath(); ctx.fill(); }
      if (idx===5) { ctx.fillStyle='rgba(167,139,250,.75)'; ctx.fillRect(-46,-10,92,8); }
      if (idx===6) { ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.ellipse(-40,0,16,7,-.5,0,Math.PI*2); ctx.ellipse(40,0,16,7,.5,0,Math.PI*2); ctx.fill(); }
      if (idx===8) { ctx.strokeStyle='#e879f9'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,34,frame*.05,frame*.05+Math.PI*1.4); ctx.stroke(); }
      if (idx===9) { ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.moveTo(-25,-49); ctx.lineTo(-12,-66); ctx.lineTo(0,-49); ctx.lineTo(13,-67); ctx.lineTo(27,-49); ctx.closePath(); ctx.fill(); }

      if (enemy.telegraph>0) {
        ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.globalAlpha=.65;
        ctx.beginPath(); ctx.arc(0,0,64-enemy.telegraph*.9,0,Math.PI*2); ctx.stroke();
      }
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
    if (x<-120||x>W+150) return;
    const open=hero.relic&&level.boss.dead;

    ctx.save();
    if (campaign.level===9) {
      ctx.fillStyle='rgba(49,32,58,.96)';
      ctx.fillRect(x-20,FLOOR_Y-165,120,165);
      ctx.fillStyle='#6d4c7d';
      for (let i=0;i<5;i++) ctx.fillRect(x-14+i*24,FLOOR_Y-177,14,14);
      ctx.fillStyle=open?'#fde68a':'#52525b';
      roundRect(ctx,x+16,FLOOR_Y-102,48,102,16);
      ctx.fill();
      ctx.fillStyle=open?'#7c3aed':'#18181b';
      ctx.beginPath(); ctx.arc(x+40,FLOOR_Y-60,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f472b6'; ctx.fillRect(x+34,FLOOR_Y-150,12,42);
      ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(x+40,FLOOR_Y-154,7,0,Math.PI*2); ctx.fill();
    } else {
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
      ctx.strokeStyle='rgba(255,255,255,.22)';
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(x+36,FLOOR_Y-142,20,Math.PI,0); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(x-8,FLOOR_Y-4,88,5);
    }
    ctx.restore();
  }

  function drawBossArena() {
    if (!level || hero.x < level.bossArenaStart-420) return;
    const start = level.bossArenaStart-cameraX;
    ctx.save();
    const alpha = clamp((hero.x-(level.bossArenaStart-420))/420,0,.65);
    ctx.globalAlpha=alpha;
    ctx.fillStyle='rgba(15,23,42,.28)';
    ctx.fillRect(start-40,0,W-start+80,FLOOR_Y);
    ctx.strokeStyle=level.boss.shotColor;
    ctx.lineWidth=3;
    for (let i=0;i<6;i++) {
      const x=start+40+i*105;
      ctx.beginPath(); ctx.moveTo(x,FLOOR_Y); ctx.lineTo(x+20,FLOOR_Y-35-Math.sin(frame*.08+i)*10); ctx.stroke();
    }
    ctx.restore();
  }

  function drawWeatherOverlay() {
    const lvl=campaign.level;
    ctx.save();
    if (lvl===1 || lvl===6) {
      for (let i=0;i<22;i++) {
        const x=positiveMod(i*73+frame*(lvl===6?1.3:.5),W+40)-20;
        const y=positiveMod(i*47+frame*(lvl===6?.9:.25),H+60)-30;
        ctx.fillStyle=lvl===6?'rgba(74,222,128,.34)':'rgba(253,224,71,.45)';
        ctx.beginPath(); ctx.ellipse(x,y,4,2,frame*.03+i,0,Math.PI*2); ctx.fill();
      }
    } else if (lvl===2 || lvl===8) {
      for (let i=0;i<24;i++) {
        const x=positiveMod(i*89-frame*.35,W+50)-25;
        const y=positiveMod(i*53+frame*.22,H+80)-40;
        ctx.fillStyle=lvl===8?'rgba(232,121,249,.38)':'rgba(196,181,253,.35)';
        ctx.beginPath(); ctx.arc(x,y,2+(i%3),0,Math.PI*2); ctx.fill();
      }
    } else if (lvl===3 || lvl===9) {
      for (let i=0;i<28;i++) {
        const x=positiveMod(i*57+frame*.7,W+40)-20;
        const y=positiveMod(i*43-frame*(lvl===3?.8:.35),H+50)-25;
        ctx.fillStyle=lvl===3?'rgba(251,146,60,.48)':'rgba(248,113,113,.28)';
        ctx.beginPath(); ctx.arc(x,y,1.5+(i%3),0,Math.PI*2); ctx.fill();
      }
    } else if (lvl===4) {
      ctx.strokeStyle='rgba(255,255,255,.62)'; ctx.lineWidth=2;
      for (let i=0;i<38;i++) {
        const x=positiveMod(i*61-frame*1.2,W+30)-15;
        const y=positiveMod(i*41+frame*.9,H+30)-15;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+6,y+10); ctx.stroke();
      }
    } else if (lvl===7) {
      ctx.strokeStyle='rgba(180,210,255,.35)'; ctx.lineWidth=1.5;
      for (let i=0;i<34;i++) {
        const x=positiveMod(i*47-frame*2.1,W+20)-10;
        const y=positiveMod(i*37+frame*4,H+20)-10;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-8,y+18); ctx.stroke();
      }
    } else if (lvl===5) {
      const fog=ctx.createLinearGradient(0,H*.45,0,H);
      fog.addColorStop(0,'rgba(120,100,160,0)'); fog.addColorStop(1,'rgba(120,100,160,.24)');
      ctx.fillStyle=fog; ctx.fillRect(0,H*.45,W,H*.55);
    }
    if (lightningFlash>0) {
      ctx.fillStyle=`rgba(255,255,255,${Math.min(.65,lightningFlash)})`;
      ctx.fillRect(0,0,W,H);
    }
    ctx.restore();
  }

  function drawBossIntroOverlay() {
    if (bossIntroTimer<=0 || !level || !level.boss) return;
    const t=bossIntroTimer/150;
    const boss=level.boss;
    ctx.save();
    ctx.globalAlpha=Math.min(1,(1-t)*5,t*4);
    ctx.fillStyle='rgba(0,0,0,.62)';
    ctx.fillRect(0,H*.30,W,H*.24);
    ctx.fillStyle=boss.shotColor;
    ctx.fillRect(0,H*.30,W,4);
    ctx.fillRect(0,H*.54-4,W,4);
    ctx.textAlign='center';
    ctx.fillStyle='#fff';
    ctx.font='900 28px Nunito, Arial';
    ctx.fillText(`${boss.icon} ${boss.name}`,W/2,H*.39);
    ctx.fillStyle='#fde68a';
    ctx.font='900 16px Nunito, Arial';
    ctx.fillText(BOSSES[boss.bossIndex].title,W/2,H*.44);
    ctx.fillStyle='#c4b5fd';
    ctx.font='bold 14px Nunito, Arial';
    ctx.fillText(`Ataque especial: ${BOSSES[boss.bossIndex].attack}`,W/2,H*.49);
    ctx.restore();
  }

  function drawScreenEffects() {
    if (screenFlash>0) {
      ctx.fillStyle=`rgba(255,255,255,${Math.min(.45,screenFlash)})`;
      ctx.fillRect(0,0,W,H);
    }
    if (level && level.boss && level.boss.enraged && level.boss.active && !level.boss.dead) {
      const v=ctx.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.78);
      v.addColorStop(0,'rgba(127,29,29,0)');
      v.addColorStop(1,'rgba(127,29,29,.18)');
      ctx.fillStyle=v; ctx.fillRect(0,0,W,H);
    }
  }

  function draw() {
    if (!level || !hero) return;

    ctx.clearRect(0,0,W,H);
    drawBackground();

    const sx = screenShake>0 ? (Math.random()-.5)*screenShake : 0;
    const sy = screenShake>0 ? (Math.random()-.5)*screenShake : 0;
    ctx.save();
    ctx.translate(sx,sy);

    drawBossArena();
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
      ctx.shadowBlur=16;
      ctx.beginPath(); ctx.arc(x,shot.y+shot.h/2,8,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x-18*Math.sign(shot.vx),shot.y+shot.h/2); ctx.lineTo(x,shot.y+shot.h/2); ctx.stroke();
      ctx.shadowBlur=0;
    });

    enemyShots.forEach(shot => {
      const x=shot.x-cameraX;
      ctx.save();
      ctx.fillStyle=shot.color;
      ctx.shadowColor=shot.color;
      ctx.shadowBlur=shot.lightning?24:16;
      if (shot.lightning) {
        ctx.strokeStyle=shot.color; ctx.lineWidth=5;
        ctx.beginPath(); ctx.moveTo(x,shot.y-30); ctx.lineTo(x-7,shot.y-10); ctx.lineTo(x+5,shot.y+7); ctx.lineTo(x,shot.y+22); ctx.stroke();
      } else if (shot.ice) {
        ctx.translate(x,shot.y); ctx.rotate(frame*.08);
        ctx.beginPath();
        for (let i=0;i<8;i++) { const a=i*Math.PI/4; const r=i%2===0?(shot.size||9):4; const px=Math.cos(a)*r,py=Math.sin(a)*r; if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py); }
        ctx.closePath(); ctx.fill();
      } else if (shot.meteor) {
        ctx.beginPath(); ctx.arc(x,shot.y,shot.size||11,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(255,220,160,.65)'; ctx.lineWidth=4;
        ctx.beginPath(); ctx.moveTo(x,shot.y-28); ctx.lineTo(x,shot.y-8); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(x,shot.y,shot.size||9,0,Math.PI*2); ctx.fill();
        if (shot.homing) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,shot.y,(shot.size||9)+5,0,Math.PI*2); ctx.stroke(); }
      }
      ctx.restore();
    });

    particles.forEach(p => {
      ctx.globalAlpha=Math.max(0,p.life/58);
      ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x-cameraX,p.y,p.size,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    });

    drawHero();
    ctx.restore();

    drawWeatherOverlay();
    drawBossIntroOverlay();
    drawScreenEffects();

    const progress=clamp(hero.x/level.goalX,0,1);
    ctx.fillStyle='rgba(15,23,42,.72)';
    ctx.fillRect(12,H-19,W-24,8);
    ctx.fillStyle='#fde047';
    ctx.fillRect(12,H-19,(W-24)*progress,8);
    ctx.fillStyle='rgba(15,23,42,.75)';
    ctx.font='bold 12px Arial';
    ctx.textAlign='center';
    ctx.fillText(
      hero.relic ? (level.boss.dead?'🏆 Portal abierto':'⚔️ Ve al monstruo final') : '🎯 Busca la reliquia',
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
    updateTouchLayout();
  }

  function updateTouchLayout() {
    const movePad = document.getElementById('pl10MovePad');
    const actionPad = document.getElementById('pl10ActionPad');
    if (movePad) {
      const r = movePad.getBoundingClientRect();
      touchState.moveCenter = {x:r.left + r.width/2, y:r.top + r.height/2, r:r.width*0.22};
    }
    if (actionPad) {
      const r = actionPad.getBoundingClientRect();
      touchState.actionCenter = {x:r.left + r.width/2, y:r.top + r.height/2, r:r.width*0.22};
    }
    resetMoveStick();
  }

  function resetMoveStick() {
    const stick = document.getElementById('pl10MoveStick');
    if (stick) stick.style.transform = 'translate(-50%,-50%)';
  }

  function updateMoveStick(dx, dy) {
    const stick = document.getElementById('pl10MoveStick');
    if (!stick) return;
    stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  function releaseMoveTouch() {
    touchState.movePointerId = null;
    keys.left = false;
    keys.right = false;
    resetMoveStick();
  }

  function processMoveTouch(clientX, clientY) {
    const c = touchState.moveCenter;
    const max = c.r || 24;
    let dx = clientX - c.x;
    let dy = clientY - c.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist > max) {
      dx = dx / dist * max;
      dy = dy / dist * max;
    }
    updateMoveStick(dx, dy);
    keys.left = dx < -10;
    keys.right = dx > 10;
  }

  function bindTouchControls() {
    const movePad = document.getElementById('pl10MovePad');
    const actionPad = document.getElementById('pl10ActionPad');
    if (!movePad || !actionPad) return;

    movePad.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      touchState.movePointerId = e.pointerId;
      movePad.setPointerCapture?.(e.pointerId);
      processMoveTouch(e.clientX, e.clientY);
    });
    movePad.addEventListener('pointermove', e => {
      if (touchState.movePointerId !== e.pointerId) return;
      e.preventDefault();
      processMoveTouch(e.clientX, e.clientY);
    });
    const moveUp = e => {
      if (touchState.movePointerId !== e.pointerId) return;
      e.preventDefault();
      releaseMoveTouch();
    };
    movePad.addEventListener('pointerup', moveUp);
    movePad.addEventListener('pointercancel', moveUp);
    movePad.addEventListener('lostpointercapture', () => releaseMoveTouch());

    actionPad.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      touchState.actionPointerId = e.pointerId;
      actionPad.setPointerCapture?.(e.pointerId);
      touchState.actionStart = {x:e.clientX, y:e.clientY, t:Date.now()};
      actionPad.style.transform = 'scale(.98)';
    });
    actionPad.addEventListener('pointerup', e => {
      if (touchState.actionPointerId !== e.pointerId) return;
      e.preventDefault();
      e.stopPropagation();
      const start = touchState.actionStart;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const dt = Date.now() - start.t;
      actionPad.style.transform = 'scale(1)';
      touchState.actionPointerId = null;
      touchState.actionStart = null;
      if (dy < -28 && Math.abs(dy) > Math.abs(dx)) {
        jump();
      } else if (Math.hypot(dx,dy) < 26 && dt < 340) {
        attack();
      }
    });
    actionPad.addEventListener('pointercancel', () => {
      touchState.actionPointerId = null;
      touchState.actionStart = null;
      actionPad.style.transform = 'scale(1)';
    });
  }


  bindTouchControls();

  canvas.addEventListener('pointerdown',e=>{
    if (e.clientY<H*.42) {
      jump();
      e.preventDefault();
    }
  });

  document.addEventListener('keydown',keyHandler);
  document.addEventListener('keyup',keyHandler);
  if (window.activeKeyHandlers) window.activeKeyHandlers.push(keyHandler);

  window.addEventListener('blur',()=>{
    releaseMoveTouch();
  });
  document.addEventListener('visibilitychange',()=>{
    if (document.hidden) {
      releaseMoveTouch();
    }
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize',adjustViewport);
    window.visualViewport.addEventListener('scroll',adjustViewport);
  }
  window.addEventListener('orientationchange',adjustViewport);

  window.pl10UsePower=usePower;window.pl10UsePower=usePower;
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
    releaseMoveTouch();
    startLevel(campaign.level,false);
    notify(`↺ Nivel ${campaign.level+1} reiniciado`,'success',1100);
  };

  window.pl10NextLevel=(event)=>{
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    hideModal();
    releaseMoveTouch();
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
  updateTouchLayout();
  startLevel(campaign.completed?0:campaign.level,true);
  loop();
};
