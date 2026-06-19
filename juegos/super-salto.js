/*
  HugoKids — Súper Salto: Reino de Hugo
  Archivo independiente del index.html.
  Para mejorar únicamente este juego, reemplaza solo este archivo.
*/

// ═══════════════════════════════════════════
//  GAME 17: SÚPER SALTO — REINO DE HUGO
//  Aventura lateral original con 3 niveles,
//  poderes en el camino, enemigos, jefe y final.
// ═══════════════════════════════════════════
window.HK_BUILD_SUPER_SALTO = function(container) {
  const W = Math.max(360, Math.min(1100, window.innerWidth));
  const H = Math.max(520, Math.min(760, window.innerHeight));
  const FLOOR_Y = H - Math.max(115, Math.round(H * 0.17));
  const GRAVITY = 0.72;

  container.innerHTML = `
    <div id="plWorldWrap" class="game-container"
         style="position:fixed;inset:0;width:100vw;height:100dvh;min-height:0;overflow:hidden;background:#6ec6ff;border-radius:0;touch-action:none;user-select:none;-webkit-user-select:none;z-index:1">
      <canvas id="plGame" width="${W}" height="${H}"
              style="display:block;width:100%;height:100%;touch-action:none"></canvas>

      <div id="plHud" style="position:absolute;left:10px;top:max(10px,env(safe-area-inset-top));z-index:25;pointer-events:none;
           display:flex;gap:7px;flex-wrap:wrap;max-width:calc(100% - 225px);font-family:Nunito,sans-serif">
        <span style="background:rgba(15,23,42,.82);color:#fff;border:2px solid rgba(255,255,255,.75);border-radius:13px;padding:7px 10px;font-weight:900">
          🗺️ <span id="plLevel">1</span>/3
        </span>
        <span style="background:rgba(15,23,42,.82);color:#fff;border:2px solid rgba(255,255,255,.75);border-radius:13px;padding:7px 10px;font-weight:900">
          ❤️ <span id="plHp">3</span>
        </span>
        <span style="background:rgba(15,23,42,.82);color:#fff;border:2px solid rgba(255,255,255,.75);border-radius:13px;padding:7px 10px;font-weight:900">
          🪙 <span id="plCoins">0</span>
        </span>
        <span style="background:rgba(88,28,135,.88);color:#fff;border:2px solid #FFD600;border-radius:13px;padding:7px 10px;font-weight:900">
          <span id="plPower">Sin poder</span>
        </span>
        <span style="background:rgba(120,53,15,.9);color:#fff;border:2px solid #FDE047;border-radius:13px;padding:7px 10px;font-weight:900">
          🧿 <span id="plRune">0</span>/1
        </span>
      </div>

      <div id="plNotice" style="position:fixed;left:50%;top:max(132px,calc(env(safe-area-inset-top) + 122px));
           transform:translateX(-50%);z-index:2147483450;display:none;width:min(460px,78%);
           padding:10px 16px;border-radius:16px;background:linear-gradient(135deg,rgba(88,28,135,.96),rgba(37,99,235,.96));
           color:#fff;border:2px solid #FFD600;text-align:center;font-family:Nunito,sans-serif;font-weight:900;
           box-shadow:0 9px 25px rgba(0,0,0,.35);pointer-events:none">
      </div>

      <div id="plBossHud" style="display:none;position:absolute;top:78px;left:50%;transform:translateX(-50%);z-index:24;
           width:min(420px,78%);background:rgba(15,23,42,.88);border:2px solid #ef4444;border-radius:15px;padding:8px;color:#fff;text-align:center;font-weight:900">
        👹 Guardián final
        <div style="height:10px;background:#3f3f46;border-radius:99px;overflow:hidden;margin-top:5px">
          <div id="plBossBar" style="height:100%;width:100%;background:linear-gradient(90deg,#ef4444,#f97316)"></div>
        </div>
      </div>

      <div id="plMessage" style="position:absolute;left:50%;top:22%;transform:translateX(-50%);z-index:40;display:none;
           width:min(560px,88%);padding:18px 22px;border-radius:22px;background:rgba(15,23,42,.9);
           color:#fff;border:3px solid #FFD600;text-align:center;font-family:Nunito,sans-serif;box-shadow:0 18px 55px rgba(0,0,0,.45)">
      </div>

      <div id="plControls" style="position:fixed;left:0;right:0;bottom:max(18px,env(safe-area-inset-bottom));z-index:2147483400;
           display:flex;justify-content:space-between;align-items:flex-end;padding:0 12px;pointer-events:none">
        <div style="display:flex;gap:8px;pointer-events:auto">
          <button id="plLeft" aria-label="Mover a la izquierda"
                  style="width:62px;height:62px;border-radius:19px;border:3px solid rgba(255,255,255,.9);
                  background:rgba(24,16,28,.88);color:#fff;font-size:1.7rem;font-weight:900;box-shadow:0 7px 16px rgba(0,0,0,.38);
                  touch-action:none;-webkit-user-select:none;user-select:none">◀</button>
          <button id="plRight" aria-label="Mover a la derecha"
                  style="width:62px;height:62px;border-radius:19px;border:3px solid rgba(255,255,255,.9);
                  background:rgba(24,16,28,.88);color:#fff;font-size:1.7rem;font-weight:900;box-shadow:0 7px 16px rgba(0,0,0,.38);
                  touch-action:none;-webkit-user-select:none;user-select:none">▶</button>
        </div>
        <div style="display:flex;gap:8px;align-items:flex-end;pointer-events:auto">
          <button id="plAction" aria-label="Usar poder"
                  style="width:66px;height:66px;border-radius:20px;border:3px solid rgba(255,255,255,.9);
                  background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;font-size:.9rem;font-weight:900;
                  box-shadow:0 7px 16px rgba(0,0,0,.38);touch-action:none;-webkit-user-select:none;user-select:none">💨<br><span style="font-size:.6rem">IMPULSO</span></button>
          <button id="plJump" aria-label="Saltar"
                  style="width:92px;height:70px;border-radius:21px;border:3px solid rgba(255,255,255,.9);
                  background:linear-gradient(135deg,#2563eb,#16a34a);color:#fff;font-size:.95rem;font-weight:900;
                  box-shadow:0 7px 16px rgba(0,0,0,.38);touch-action:none;-webkit-user-select:none;user-select:none">⬆<br>SALTO</button>
        </div>
      </div>
    </div>`;

  const canvas = document.getElementById('plGame');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('plWorldWrap');
  const keys = {left:false, right:false};

  function ajustarControlesMoviles() {
    const controls = document.getElementById('plControls');
    const gameWrap = document.getElementById('plWorldWrap');
    if (!controls || !gameWrap) return;

    const vv = window.visualViewport;
    const visibleHeight = vv ? vv.height : window.innerHeight;
    const offsetTop = vv ? vv.offsetTop : 0;

    gameWrap.style.height = `${visibleHeight}px`;
    gameWrap.style.top = `${offsetTop}px`;

    // Mantiene los controles visibles por encima de la barra inferior del navegador.
    controls.style.bottom = 'max(18px, env(safe-area-inset-bottom))';
  }

  ajustarControlesMoviles();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', ajustarControlesMoviles);
    window.visualViewport.addEventListener('scroll', ajustarControlesMoviles);
  }
  window.addEventListener('orientationchange', ajustarControlesMoviles);

  const particles = [];
  const shots = [];
  const enemyShots = [];
  let animId = null;
  let levelIndex = 0;
  let level = null;
  let hero = null;
  let cameraX = 0;
  let totalCoins = 0;
  let mode = 'play';
  let frame = 0;
  let checkpointX = 90;
  let bossDefeated = false;
  let levelStartTime = 0;
  let noticeTimer = null;
  let lockedNoticeCooldown = 0;

  const LEVELS = [
    {
      name:'Pradera Arcoíris',
      subtitle:'Aprende a saltar y encuentra el portal',
      width:3650,
      sky:['#58b8f5','#d8f5ff'],
      hill1:'#71b75a', hill2:'#3d8644', soil:'#75512b', grass:'#55b934',
      theme:'day',
      grounds:[
        [0,700],[810,790],[1710,690],[2500,520],[3130,520]
      ],
      platforms:[
        [420,-85,150],[1040,-105,145],[1280,-165,140],[1910,-95,170],
        [2200,-155,145],[2710,-95,170],[2940,-165,145]
      ],
      moving:[
        [1530,-125,130,105],[2360,-105,130,120]
      ],
      enemies:[
        [620,'slime'],[1110,'beetle'],[1830,'slime'],[2100,'beetle'],
        [2630,'slime'],[3240,'beetle']
      ],
      coins:[
        [250,-55],[300,-55],[350,-55],[455,-125],[505,-125],[555,-125],
        [880,-55],[930,-55],[1080,-145],[1130,-145],[1180,-145],
        [1320,-205],[1370,-205],[1760,-55],[1810,-55],[1960,-135],[2010,-135],
        [2190,-205],[2240,-205],[2290,-205],[2550,-55],[2600,-55],
        [2750,-135],[2800,-135],[2970,-205],[3020,-205],[3190,-55],[3260,-55],[3330,-55]
      ],
      powers:[
        [530,-150,'shield'],[1360,-235,'wing'],[2260,-235,'fire'],[3010,-235,'star']
      ],
      checkpoints:[90,1760,2600],
      rune:[2245,-215],
      chests:[[1315,-205,'coins'],[2960,-215,'power']],
      spikes:[[930,68],[2670,72]],
      signs:[[170,'Busca la runa dorada antes de llegar al portal'],[2460,'Cuidado: más adelante hay púas y enemigos']],
      goalX:3470
    },
    {
      name:'Bosque de Cristal',
      subtitle:'Usa los poderes para atravesar el bosque',
      width:4250,
      sky:['#315b75','#91d6c8'],
      hill1:'#356859', hill2:'#173e35', soil:'#5b3b25', grass:'#46a06a',
      theme:'forest',
      grounds:[
        [0,590],[710,560],[1390,680],[2170,530],[2810,650],[3540,620]
      ],
      platforms:[
        [320,-110,145],[850,-90,140],[1060,-165,145],[1500,-115,150],
        [1780,-195,135],[2270,-95,155],[2510,-165,145],[2920,-110,150],
        [3220,-190,140],[3670,-105,150],[3920,-175,130]
      ],
      moving:[
        [620,-145,120,115],[1260,-115,125,135],[2050,-175,125,145],
        [3390,-140,130,140]
      ],
      enemies:[
        [430,'beetle'],[780,'slime'],[1450,'beetle'],[1660,'bat'],[2240,'slime'],
        [2460,'bat'],[2860,'beetle'],[3100,'slime'],[3600,'bat'],[3860,'beetle']
      ],
      coins:[
        [130,-55],[190,-55],[350,-150],[410,-150],[740,-55],[800,-55],
        [880,-130],[930,-130],[1080,-205],[1130,-205],[1420,-55],[1480,-155],
        [1540,-155],[1800,-235],[1850,-235],[2200,-55],[2280,-135],[2340,-135],
        [2520,-205],[2580,-205],[2830,-55],[2900,-150],[2960,-150],
        [3230,-230],[3290,-230],[3560,-55],[3650,-145],[3710,-145],
        [3940,-215],[4000,-215],[4120,-55]
      ],
      powers:[
        [390,-180,'boots'],[1130,-235,'shield'],[1830,-265,'fire'],
        [2570,-235,'wing'],[3260,-260,'star'],[3970,-245,'fire']
      ],
      checkpoints:[90,1450,2860],
      rune:[3250,-255],
      chests:[[1090,-220,'power'],[3690,-160,'coins']],
      spikes:[[1510,78],[2910,82]],
      signs:[[180,'El bosque esconde cofres y caminos elevados'],[2760,'La runa está cerca de las plataformas altas']],
      goalX:4090
    },
    {
      name:'Fortaleza del Guardián',
      subtitle:'Derrota al jefe y abre la puerta final',
      width:4780,
      sky:['#341b58','#d15b72'],
      hill1:'#51316e', hill2:'#24172f', soil:'#46343b', grass:'#8f5366',
      theme:'castle',
      grounds:[
        [0,720],[840,650],[1600,680],[2380,610],[3110,720],[3950,740]
      ],
      platforms:[
        [380,-100,145],[650,-175,135],[1030,-115,150],[1290,-200,135],
        [1710,-110,150],[1960,-180,145],[2460,-105,155],[2740,-190,140],
        [3200,-120,150],[3490,-205,140],[4050,-115,155]
      ],
      moving:[
        [1500,-155,125,130],[2250,-145,125,145],[3000,-180,125,150],
        [3820,-160,130,125]
      ],
      enemies:[
        [510,'beetle'],[910,'slime'],[1170,'bat'],[1660,'beetle'],[1900,'bat'],
        [2430,'slime'],[2670,'beetle'],[3160,'bat'],[3400,'slime'],[3990,'beetle'],
        [4240,'guardian']
      ],
      coins:[
        [170,-55],[230,-55],[400,-140],[460,-140],[650,-215],[710,-215],
        [890,-55],[1040,-155],[1100,-155],[1300,-240],[1360,-240],
        [1640,-55],[1720,-150],[1780,-150],[1970,-220],[2030,-220],
        [2410,-55],[2490,-145],[2550,-145],[2750,-230],[2810,-230],
        [3140,-55],[3210,-160],[3270,-160],[3500,-245],[3560,-245],
        [3980,-55],[4060,-155],[4120,-155],[4420,-55],[4490,-55]
      ],
      powers:[
        [430,-170,'shield'],[690,-245,'wing'],[1320,-270,'fire'],
        [2010,-250,'star'],[2780,-260,'shield'],[3520,-275,'fire'],[4070,-185,'star']
      ],
      checkpoints:[90,1650,3180,4040],
      rune:[3520,-270],
      chests:[[1980,-235,'power'],[4070,-170,'coins']],
      spikes:[[930,86],[2510,96],[3680,82]],
      signs:[[180,'La fortaleza está protegida por trampas'],[3920,'Consigue la runa y derrota al Guardián']],
      goalX:4590
    }
  ];

  function cloneLevel(index) {
    const src = LEVELS[index];
    const platforms = src.platforms.map((p,i)=>({
      x:p[0], y:FLOOR_Y+p[1], w:p[2], h:22, type:'platform', id:'p'+i
    }));
    const grounds = src.grounds.map((g,i)=>({
      x:g[0], y:FLOOR_Y, w:g[1], h:H-FLOOR_Y+120, type:'ground', id:'g'+i
    }));
    const moving = src.moving.map((p,i)=>({
      x:p[0], baseX:p[0], y:FLOOR_Y+p[1], w:p[2], h:20,
      range:p[3], phase:i*1.7, dx:0, prevX:p[0], type:'moving', id:'m'+i
    }));
    const enemies = src.enemies.map((e,i)=>({
      x:e[0], baseX:e[0], y:FLOOR_Y-42, w:e[1]==='guardian'?74:40,
      h:e[1]==='guardian'?76:40, type:e[1], dir:i%2?1:-1,
      speed:e[1]==='guardian'?1.15:(e[1]==='bat'?1.25:.75),
      range:e[1]==='guardian'?170:90, dead:false, hp:e[1]==='guardian'?6:1,
      maxHp:e[1]==='guardian'?6:1, hit:0, cooldown:70+i*9, phase:i*.8
    }));
    enemies.forEach(e=>{
      if(e.type==='bat') e.y=FLOOR_Y-145-(e.baseX%80);
      if(e.type==='guardian') e.y=FLOOR_Y-e.h;
    });
    return {
      ...src,
      grounds, platforms, moving, enemies,
      coins:src.coins.map((c,i)=>({x:c[0],y:FLOOR_Y+c[1],r:10,taken:false,phase:i*.55})),
      powers:src.powers.map((p,i)=>({x:p[0],y:FLOOR_Y+p[1],type:p[2],taken:false,phase:i})),
      rune:{x:src.rune[0],y:FLOOR_Y+src.rune[1],taken:false,phase:index*.8},
      chests:src.chests.map((c,i)=>({x:c[0],y:FLOOR_Y+c[1],w:48,h:36,reward:c[2],opened:false,id:i})),
      spikes:src.spikes.map((s,i)=>({x:s[0],y:FLOOR_Y-18,w:s[1],h:18,id:i})),
      signs:src.signs.map((s,i)=>({x:s[0],y:FLOOR_Y-62,text:s[1],seen:false,id:i})),
      projectiles:[]
    };
  }

  function startLevel(index, keepCoins=true) {
    levelIndex=index;
    level=cloneLevel(index);
    bossDefeated=index<2;
    checkpointX=level.checkpoints[0];
    mode='play';
    levelStartTime=Date.now();
    if(!keepCoins) totalCoins=0;
    hero={
      x:checkpointX,y:FLOOR_Y-58,w:36,h:58,vx:0,vy:0,facing:1,
      onGround:false,jumps:0,maxJumps:2,hp:3,invuln:0,
      power:null,powerTimer:0,shieldHits:0,dash:0,dashCooldown:0,
      rune:false,chests:0,run:0,standingPlatform:null
    };
    cameraX=0;
    shots.length=0;
    enemyShots.length=0;
    particles.length=0;
    setText('plLevel',index+1);
    updateHud();
    showMessage(
      `<div style="font-size:2.3rem">${index===0?'🌈':index===1?'🌲':'🏰'}</div>
       <div style="font-family:'Fredoka One',cursive;font-size:1.55rem">${level.name}</div>
       <div style="color:#c4b5fd;margin-top:5px">${level.subtitle}</div>
       <div style="color:#fde68a;margin-top:7px;font-weight:900">Misión: encuentra la runa 🧿 y llega al portal</div>`,
      1900
    );
  }

  function resetAdventure() {
    totalCoins=0;
    startLevel(0,false);
  }

  function showMessage(content, duration=1200) {
    const box=document.getElementById('plMessage');
    if(!box) return;
    box.innerHTML=content;
    box.style.display='block';
    if(duration>0) {
      setTimeout(()=>{
        if(document.getElementById('plMessage')===box && mode==='play') box.style.display='none';
      },duration);
    }
  }

  function notifyTop(text, duration=1450, tone='normal') {
    const box=document.getElementById('plNotice');
    if(!box) return;
    if(noticeTimer) clearTimeout(noticeTimer);

    const colors={
      normal:'linear-gradient(135deg,rgba(88,28,135,.96),rgba(37,99,235,.96))',
      danger:'linear-gradient(135deg,rgba(153,27,27,.97),rgba(234,88,12,.97))',
      success:'linear-gradient(135deg,rgba(22,101,52,.97),rgba(5,150,105,.97))',
      gold:'linear-gradient(135deg,rgba(146,64,14,.97),rgba(202,138,4,.97))'
    };

    box.style.background=colors[tone]||colors.normal;
    box.textContent=text;
    box.style.display='block';
    box.style.opacity='1';

    noticeTimer=setTimeout(()=>{
      if(document.getElementById('plNotice')===box){
        box.style.opacity='0';
        setTimeout(()=>{box.style.display='none';},180);
      }
    },duration);
  }

  function updateHud() {
    setText('plHp',Math.max(0,hero?hero.hp:3));
    setText('plCoins',totalCoins);
    setText('plRune',hero&&hero.rune?1:0);
    const p=document.getElementById('plPower');
    const a=document.getElementById('plAction');
    if(!p||!a||!hero) return;
    const names={
      shield:'🛡️ Escudo',boots:'⚡ Botas rápidas',wing:'🪶 Triple salto',
      fire:'🔥 Guantes de fuego',star:'⭐ Estrella invencible'
    };
    p.textContent=hero.power?`${names[hero.power]} ${Math.ceil(hero.powerTimer/60)}s`:'Sin poder';
    if(hero.power==='fire') a.innerHTML='🔥<br><span style="font-size:.68rem">DISPARAR</span>';
    else a.innerHTML='💨<br><span style="font-size:.68rem">IMPULSO</span>';
  }

  function addParticles(x,y,color,count=10) {
    for(let i=0;i<count;i++){
      particles.push({
        x,y,vx:(Math.random()-.5)*6,vy:-1-Math.random()*5,
        life:35+Math.random()*20,size:2+Math.random()*4,color
      });
    }
  }

  function rectsOverlap(a,b,pad=0) {
    return a.x+pad < b.x+b.w && a.x+a.w-pad > b.x &&
           a.y+pad < b.y+b.h && a.y+a.h-pad > b.y;
  }

  function allSolids() {
    return [...level.grounds,...level.platforms,...level.moving];
  }

  function respawn() {
    hero.x=checkpointX;
    hero.y=FLOOR_Y-110;
    hero.vx=0;hero.vy=0;hero.invuln=90;
    cameraX=Math.max(0,checkpointX-W*.28);
  }

  function hurt(sourceX, fall=false) {
    const fx=typeof getActiveGameEffects==='function'?getActiveGameEffects():{};
    if(hero.invuln>0 || fx.invencible || fx.todosBeneficios) return;

    if(hero.shieldHits>0){
      hero.shieldHits--;
      hero.invuln=70;
      addParticles(hero.x+hero.w/2,hero.y+hero.h/2,'#60a5fa',18);
      notifyTop('🛡️ El escudo te protegió',1450,'success');
      if(hero.shieldHits<=0 && hero.power==='shield'){hero.power=null;hero.powerTimer=0;}
      updateHud();
      return;
    }

    hero.hp--;
    hero.invuln=90;
    addParticles(hero.x+hero.w/2,hero.y+hero.h/2,'#ef4444',18);
    try{SFX.hit();}catch(e){}
    updateHud();

    if(hero.hp<=0){
      mode='gameover';
      showMessage(`
        <div style="font-size:3rem">💥</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.7rem">¡Inténtalo otra vez!</div>
        <div style="margin:8px 0;color:#c4b5fd">Llegaste al nivel ${levelIndex+1} · ${totalCoins} monedas</div>
        <button onclick="window.plRetry()" style="border:0;border-radius:14px;padding:12px 22px;background:#16a34a;color:#fff;font-weight:900;font-size:1rem">↺ Reintentar nivel</button>
      `,0);
      try{SFX.lose();}catch(e){}
    } else {
      if(fall) notifyTop(`❤️ Caíste · Quedan ${hero.hp}`,1500,'danger');
      else notifyTop(`❤️ Te golpearon · Quedan ${hero.hp}`,1500,'danger');
      respawn();
    }
  }

  function applyPower(type) {
    const durations={shield:9999,boots:12*60,wing:14*60,fire:16*60,star:9*60};
    hero.power=type;
    hero.powerTimer=durations[type]||10*60;
    if(type==='shield') hero.shieldHits=2;
    if(type==='wing') hero.maxJumps=3;
    else hero.maxJumps=2;
    addParticles(hero.x+hero.w/2,hero.y+hero.h/2,'#fde047',22);
    const names={
      shield:'🛡️ Escudo de dos golpes',
      boots:'⚡ Botas de velocidad',
      wing:'🪶 Triple salto',
      fire:'🔥 Guantes de fuego',
      star:'⭐ Invencibilidad'
    };
    notifyTop(`${names[type]} activado`,1600,'gold');
    try{SFX.pop();}catch(e){}
    updateHud();
  }

  function jump() {
    if(mode!=='play'||window.HK_PAUSED) return;
    const fx=typeof getActiveGameEffects==='function'?getActiveGameEffects():{};
    const extra=(fx.doubleSalto||fx.todosBeneficios)?1:0;
    const allowed=Math.max(hero.maxJumps,2+extra);
    if(hero.onGround || hero.jumps<allowed){
      hero.vy=hero.power==='wing'?-15.2:-13.6;
      hero.onGround=false;
      hero.standingPlatform=null;
      hero.jumps++;
      addParticles(hero.x+hero.w/2,hero.y+hero.h,'rgba(255,255,255,.9)',7);
      try{SFX.jump();}catch(e){}
    }
  }

  function useAction() {
    if(mode!=='play'||window.HK_PAUSED) return;
    if(hero.power==='fire'){
      if(shots.length<4){
        shots.push({
          x:hero.facing>0?hero.x+hero.w:hero.x-14,
          y:hero.y+22,w:16,h:12,vx:hero.facing*9,life:90
        });
        try{SFX.shoot();}catch(e){}
      }
      return;
    }
    if(hero.dashCooldown<=0){
      hero.dash=12;
      hero.dashCooldown=70;
      hero.vx=hero.facing*12;
      addParticles(hero.x+hero.w/2,hero.y+hero.h/2,'#67e8f9',12);
    }
  }

  function killEnemy(e, stomp=false) {
    if(e.dead) return;
    e.hp--;
    e.hit=12;
    addParticles(e.x+e.w/2,e.y+e.h/2,e.type==='guardian'?'#fb7185':'#84cc16',16);
    if(e.hp<=0){
      e.dead=true;
      totalCoins+=e.type==='guardian'?25:3;
      if(e.type==='guardian'){
        bossDefeated=true;
        notifyTop('👹 ¡Guardián derrotado! La puerta final está abierta',2200,'success');
        try{SFX.win();}catch(err){}
      } else {
        try{SFX.pop();}catch(err){}
      }
      updateHud();
    } else if(e.type==='guardian'){
      notifyTop(`👹 Guardián: ${e.hp}/${e.maxHp}`);
    }
    if(stomp){hero.vy=-9.5;hero.jumps=1;}
  }

  function completeLevel() {
    if(mode!=='play') return;
    mode='levelclear';
    if(levelIndex<2){
      showMessage(`
        <div style="font-size:3rem">🏁</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.75rem">¡Nivel ${levelIndex+1} completado!</div>
        <div style="color:#fde68a;margin-top:6px">Monedas acumuladas: ${totalCoins}</div>
        <div style="color:#c4b5fd;margin-top:4px">Preparando ${LEVELS[levelIndex+1].name}…</div>
      `,0);
      try{SFX.win();}catch(e){}
      setTimeout(()=>startLevel(levelIndex+1,true),1800);
    } else {
      finishAdventure();
    }
  }

  function finishAdventure() {
    mode='finished';
    const elapsed=Math.max(1,Math.round((Date.now()-levelStartTime)/1000));
    showMessage(`
      <div style="font-size:3.5rem">🏆</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.9rem">¡REINO SALVADO!</div>
      <div style="color:#fde68a;margin:7px 0">Completaste los 3 niveles y venciste al Guardián.</div>
      <div style="color:#fff;font-weight:900">🪙 ${totalCoins} monedas recogidas</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        <button onclick="window.plReset()" style="border:0;border-radius:14px;padding:12px 20px;background:#16a34a;color:#fff;font-weight:900">↺ Jugar de nuevo</button>
        <button onclick="closeModal()" style="border:0;border-radius:14px;padding:12px 20px;background:#ef4444;color:#fff;font-weight:900">✕ Salir</button>
      </div>
    `,0);
    try{
      launchConfetti();
      SFX.win();
      awardBadge('first_win');
    }catch(e){}
    if(typeof darRecompensa==='function'){
      darRecompensa(totalCoins+100,900,'🏆 Súper Salto: Reino de Hugo');
    }
    saveRecord('platform',3000+totalCoins);
  }

  function updateMovingPlatforms() {
    level.moving.forEach((p,i)=>{
      p.prevX=p.x;
      p.x=p.baseX+Math.sin(frame*.025+p.phase)*p.range;
      p.dx=p.x-p.prevX;
    });
  }

  function update() {
    if(mode!=='play'||window.HK_PAUSED) return;
    frame++;

    const shopFx=typeof getActiveGameEffects==='function'?getActiveGameEffects():{};
    const speedFactor=(shopFx.todosBeneficios?1.45:(Number(shopFx.velocidad)||1));
    const pathSpeed=hero.power==='boots'?1.38:1;
    const accel=.72*speedFactor*pathSpeed;
    const maxSpeed=5.4*speedFactor*pathSpeed;

    if(hero.dash>0){
      hero.dash--;
      hero.vx=hero.facing*11.5;
    } else {
      if(keys.left){hero.vx-=accel;hero.facing=-1;}
      if(keys.right){hero.vx+=accel;hero.facing=1;}
      if(!keys.left&&!keys.right) hero.vx*=.78;
      hero.vx=Math.max(-maxSpeed,Math.min(maxSpeed,hero.vx));
    }
    if(hero.dashCooldown>0) hero.dashCooldown--;
    if(hero.invuln>0) hero.invuln--;
    if(hero.powerTimer>0 && hero.power!=='shield'){
      hero.powerTimer--;
      if(hero.powerTimer<=0){
        hero.power=null;
        hero.maxJumps=2;
        updateHud();
      } else if(frame%30===0) updateHud();
    }

    updateMovingPlatforms();

    if(hero.standingPlatform && hero.onGround && hero.standingPlatform.type==='moving'){
      hero.x+=hero.standingPlatform.dx;
    }

    const prevY=hero.y;
    hero.vy+=GRAVITY;
    hero.vy=Math.min(hero.vy,17);
    hero.x+=hero.vx;
    hero.y+=hero.vy;
    hero.x=Math.max(0,Math.min(level.width-hero.w,hero.x));
    hero.run+=(Math.abs(hero.vx)*.08);

    hero.onGround=false;
    hero.standingPlatform=null;
    const prevBottom=prevY+hero.h;
    const currentBottom=hero.y+hero.h;

    for(const p of allSolids()){
      if(hero.vy>=0 &&
         hero.x+hero.w-5>p.x && hero.x+5<p.x+p.w &&
         prevBottom<=p.y+8 && currentBottom>=p.y){
        hero.y=p.y-hero.h;
        hero.vy=0;
        hero.onGround=true;
        hero.jumps=0;
        hero.standingPlatform=p;
        break;
      }
    }

    if(hero.y>H+120){
      hurt(hero.x,true);
      return;
    }

    for(const cp of level.checkpoints){
      if(hero.x>=cp && cp>checkpointX){
        checkpointX=cp;
        notifyTop('🚩 Punto de control guardado',1250,'success');
      }
    }

    const pickupRadius=(shopFx.radioDoble||shopFx.todosBeneficios)?100:42;
    for(const c of level.coins){
      if(c.taken) continue;
      const dx=(hero.x+hero.w/2)-c.x;
      const dy=(hero.y+hero.h/2)-c.y;
      if(Math.hypot(dx,dy)<pickupRadius){
        c.taken=true;
        const mult=(shopFx.monedasDoble||shopFx.monedasX5||shopFx.todosBeneficios)?2:1;
        totalCoins+=mult;
        addParticles(c.x,c.y,'#FFD600',9);
        try{SFX.coin();}catch(e){}
        updateHud();
      }
    }

    for(const p of level.powers){
      if(p.taken) continue;
      if(Math.hypot(hero.x+hero.w/2-p.x,hero.y+hero.h/2-p.y)<42){
        p.taken=true;
        applyPower(p.type);
      }
    }

    if(!level.rune.taken &&
       Math.hypot(hero.x+hero.w/2-level.rune.x,hero.y+hero.h/2-level.rune.y)<45){
      level.rune.taken=true;
      hero.rune=true;
      totalCoins+=5;
      addParticles(level.rune.x,level.rune.y,'#fde047',28);
      notifyTop('🧿 ¡Runa dorada encontrada! El portal puede abrirse',2100,'gold');
      try{SFX.win();}catch(e){}
      updateHud();
    }

    for(const chest of level.chests){
      if(chest.opened) continue;
      if(rectsOverlap(hero,chest,2)){
        chest.opened=true;
        hero.chests++;
        addParticles(chest.x+chest.w/2,chest.y+chest.h/2,'#FFD600',24);

        if(chest.reward==='coins'){
          totalCoins+=15;
          notifyTop('🎁 Cofre abierto: +15 monedas',1600,'gold');
          try{SFX.coin();}catch(e){}
        }else{
          const rewards=['shield','boots','wing','fire','star'];
          applyPower(rewards[(levelIndex+chest.id+hero.chests)%rewards.length]);
          notifyTop('🎁 Cofre mágico: encontraste un poder',1700,'gold');
        }
        updateHud();
      }
    }

    for(const spike of level.spikes){
      if(rectsOverlap(hero,spike,5)){
        hurt(spike.x,false);
        break;
      }
    }

    for(const sign of level.signs){
      if(!sign.seen && Math.abs((hero.x+hero.w/2)-sign.x)<72){
        sign.seen=true;
        notifyTop(`📜 ${sign.text}`,2300,'normal');
      }
    }

    level.enemies.forEach(e=>{
      if(e.dead) return;
      if(e.hit>0)e.hit--;
      if(e.type==='bat'){
        e.x=e.baseX+Math.sin(frame*.025+e.phase)*e.range;
        e.y=FLOOR_Y-145-(e.baseX%80)+Math.sin(frame*.04+e.phase)*28;
      } else {
        const slow=(shopFx.invisible||shopFx.todosBeneficios)?.45:1;
        e.x+=e.dir*e.speed*slow;
        if(Math.abs(e.x-e.baseX)>e.range)e.dir*=-1;
      }

      if(e.type==='guardian'){
        e.cooldown--;
        if(e.cooldown<=0 && Math.abs(e.x-hero.x)<700){
          enemyShots.push({x:e.x,y:e.y+28,w:18,h:18,vx:-5.2,vy:-2.3,life:170});
          e.cooldown=75;
        }
      }

      if(!rectsOverlap(hero,e,5)) return;
      const star=hero.power==='star'||shopFx.invencible||shopFx.todosBeneficios;
      const stomp=hero.vy>2 && prevBottom<=e.y+15;
      if(star) killEnemy(e,false);
      else if(stomp) killEnemy(e,true);
      else hurt(e.x,false);
    });

    shots.forEach(s=>{s.x+=s.vx;s.life--;});
    enemyShots.forEach(s=>{s.x+=s.vx;s.y+=s.vy;s.vy+=.08;s.life--;});
    for(const s of shots){
      if(s.life<=0)continue;
      for(const e of level.enemies){
        if(!e.dead && rectsOverlap(s,e)){
          s.life=0;killEnemy(e,false);break;
        }
      }
    }
    for(const s of enemyShots){
      if(s.life>0 && rectsOverlap(hero,s,3)){
        s.life=0;hurt(s.x,false);
      }
    }
    for(let i=shots.length-1;i>=0;i--)if(shots[i].life<=0)shots.splice(i,1);
    for(let i=enemyShots.length-1;i>=0;i--)if(enemyShots[i].life<=0)enemyShots.splice(i,1);

    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life--;p.size*=.97;
    });
    for(let i=particles.length-1;i>=0;i--)if(particles[i].life<=0)particles.splice(i,1);

    if(lockedNoticeCooldown>0) lockedNoticeCooldown--;

    const goalOpen=hero.rune && (levelIndex<2 || bossDefeated);
    const touchingGoal=hero.x+hero.w>level.goalX && hero.x<level.goalX+70;

    if(goalOpen && touchingGoal){
      completeLevel();
    }else if(touchingGoal && lockedNoticeCooldown<=0){
      lockedNoticeCooldown=120;
      if(!hero.rune) notifyTop('🔒 Falta la runa dorada. Explora el nivel antes de salir',2100,'danger');
      else notifyTop('🔒 Primero debes derrotar al Guardián',1900,'danger');
    }

    const targetCam=hero.x-W*.34;
    cameraX+=(targetCam-cameraX)*.10;
    cameraX=Math.max(0,Math.min(level.width-W,cameraX));

    updateBossHud();
  }

  function updateBossHud() {
    const hud=document.getElementById('plBossHud');
    const bar=document.getElementById('plBossBar');
    if(!hud||!bar||levelIndex!==2){if(hud)hud.style.display='none';return;}
    const boss=level.enemies.find(e=>e.type==='guardian');
    if(boss && !boss.dead && Math.abs(boss.x-hero.x)<900){
      hud.style.display='block';
      bar.style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;
    }else hud.style.display='none';
  }

  function drawBackground() {
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,level.sky[0]);g.addColorStop(1,level.sky[1]);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    const sunX=W*.78-cameraX*.03;
    ctx.fillStyle=level.theme==='castle'?'rgba(255,220,230,.8)':'rgba(255,245,180,.9)';
    ctx.beginPath();ctx.arc((sunX%(W+220)+W+220)%(W+220)-70,90,42,0,Math.PI*2);ctx.fill();

    for(let i=0;i<7;i++){
      const x=((i*240-cameraX*.12)%(W+260)+W+260)%(W+260)-100;
      const y=70+(i%3)*55;
      ctx.fillStyle='rgba(255,255,255,.55)';
      ctx.beginPath();ctx.ellipse(x,y,62,22,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(x+34,y-10,38,24,0,0,Math.PI*2);ctx.fill();
    }

    ctx.fillStyle=level.hill1;
    ctx.beginPath();ctx.moveTo(0,FLOOR_Y);
    for(let x=-120;x<=W+160;x+=150){
      const wx=x+((cameraX*.22)%150);
      ctx.quadraticCurveTo(wx+75,FLOOR_Y-145-(x%300===0?35:0),wx+150,FLOOR_Y);
    }
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();

    ctx.fillStyle=level.hill2;
    ctx.beginPath();ctx.moveTo(0,FLOOR_Y);
    for(let x=-110;x<=W+150;x+=125){
      const wx=x+((cameraX*.42)%125);
      ctx.quadraticCurveTo(wx+62,FLOOR_Y-90-(x%250===0?35:0),wx+125,FLOOR_Y);
    }
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();

    if(level.theme==='forest'){
      for(let i=0;i<18;i++){
        const x=((i*145-cameraX*.55)%(W+300)+W+300)%(W+300)-100;
        const h=85+(i%4)*18;
        ctx.fillStyle='#3d2b1f';ctx.fillRect(x-6,FLOOR_Y-h,12,h);
        ctx.fillStyle=i%2?'#1d6b4d':'#287a56';
        ctx.beginPath();ctx.arc(x,FLOOR_Y-h,34+(i%3)*4,0,Math.PI*2);ctx.fill();
      }
    }

    if(level.theme==='castle'){
      for(let i=0;i<7;i++){
        const x=i*210-cameraX*.38;
        ctx.fillStyle='rgba(35,22,52,.65)';
        ctx.fillRect(x,FLOOR_Y-145,120,145);
        for(let t=0;t<4;t++)ctx.fillRect(x+t*30,FLOOR_Y-170,18,28);
        ctx.fillStyle='rgba(250,204,21,.55)';
        ctx.fillRect(x+32,FLOOR_Y-95,15,22);ctx.fillRect(x+73,FLOOR_Y-95,15,22);
      }
    }
  }

  function drawPlatform(p) {
    const x=p.x-cameraX;
    if(x+p.w<-40||x>W+40)return;
    ctx.fillStyle=p.type==='ground'?level.soil:'#8b5a2b';
    ctx.fillRect(x,p.y,p.w,p.h);
    ctx.fillStyle=level.grass;
    ctx.fillRect(x,p.y-7,p.w,10);
    ctx.fillStyle='rgba(255,255,255,.16)';
    for(let bx=8;bx<p.w;bx+=34)ctx.fillRect(x+bx,p.y+7,18,4);
    if(p.type==='moving'){
      ctx.strokeStyle='#fde047';ctx.lineWidth=3;ctx.strokeRect(x,p.y,p.w,p.h);
    }
  }

  function drawCoin(c) {
    if(c.taken)return;
    const x=c.x-cameraX;
    if(x<-30||x>W+30)return;
    const bob=Math.sin(frame*.11+c.phase)*4;
    const squash=.28+.72*Math.abs(Math.sin(frame*.08+c.phase));
    ctx.save();ctx.translate(x,c.y+bob);ctx.scale(squash,1);
    const g=ctx.createRadialGradient(-3,-4,2,0,0,c.r);
    g.addColorStop(0,'#fff4a3');g.addColorStop(.5,'#FFD600');g.addColorStop(1,'#b97800');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,c.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#8a5b00';ctx.lineWidth=2;ctx.stroke();ctx.restore();
  }

  function drawPower(p) {
    if(p.taken)return;
    const x=p.x-cameraX;
    if(x<-50||x>W+50)return;
    const bob=Math.sin(frame*.08+p.phase)*7;
    const icons={shield:'🛡️',boots:'⚡',wing:'🪶',fire:'🔥',star:'⭐'};
    ctx.save();
    ctx.shadowColor='#fde047';ctx.shadowBlur=18;
    ctx.fillStyle='rgba(88,28,135,.88)';
    ctx.beginPath();ctx.arc(x,p.y+bob,22,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
    ctx.shadowBlur=0;ctx.font='25px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(icons[p.type],x,p.y+bob+1);ctx.restore();
  }

  function drawRune() {
    if(level.rune.taken) return;
    const x=level.rune.x-cameraX;
    if(x<-60||x>W+60) return;
    const bob=Math.sin(frame*.08+level.rune.phase)*7;

    ctx.save();
    ctx.translate(x,level.rune.y+bob);
    ctx.rotate(Math.sin(frame*.035)*.15);
    ctx.shadowColor='#fde047';
    ctx.shadowBlur=25;
    ctx.fillStyle='#7c3aed';
    ctx.beginPath();
    for(let i=0;i<8;i++){
      const a=-Math.PI/2+i*Math.PI/4;
      const r=i%2===0?23:12;
      const px=Math.cos(a)*r, py=Math.sin(a)*r;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='#fde047';ctx.font='22px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('🧿',0,1);
    ctx.restore();
  }

  function drawChest(chest) {
    const x=chest.x-cameraX;
    if(x<-70||x>W+70) return;

    ctx.save();
    ctx.fillStyle=chest.opened?'#6b4423':'#92400e';
    ctx.fillRect(x,chest.y+9,chest.w,chest.h-9);
    ctx.fillStyle=chest.opened?'#4b2e18':'#b45309';
    ctx.beginPath();
    ctx.roundRect(x,chest.y,chest.w,18,8);
    ctx.fill();
    ctx.strokeStyle='#fde047';ctx.lineWidth=3;
    ctx.strokeRect(x+2,chest.y+2,chest.w-4,chest.h-4);
    ctx.fillStyle='#fde047';
    ctx.fillRect(x+chest.w/2-4,chest.y+15,8,12);

    if(!chest.opened){
      ctx.shadowColor='#fde047';ctx.shadowBlur=10;
      ctx.fillStyle='rgba(253,224,71,.75)';
      ctx.beginPath();ctx.arc(x+chest.w/2,chest.y-5,3+Math.sin(frame*.12+chest.id)*2,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawSpikes(spike) {
    const x=spike.x-cameraX;
    if(x+spike.w<-40||x>W+40) return;

    ctx.save();
    const count=Math.max(2,Math.floor(spike.w/18));
    const sw=spike.w/count;
    ctx.fillStyle='#d1d5db';
    ctx.strokeStyle='#4b5563';
    ctx.lineWidth=2;

    for(let i=0;i<count;i++){
      ctx.beginPath();
      ctx.moveTo(x+i*sw,spike.y+spike.h);
      ctx.lineTo(x+i*sw+sw/2,spike.y);
      ctx.lineTo(x+(i+1)*sw,spike.y+spike.h);
      ctx.closePath();ctx.fill();ctx.stroke();
    }
    ctx.restore();
  }

  function drawSign(sign) {
    const x=sign.x-cameraX;
    if(x<-90||x>W+90) return;

    ctx.save();
    ctx.fillStyle='#5b3a20';
    ctx.fillRect(x-4,sign.y+20,8,42);
    ctx.fillStyle='#9a6235';
    ctx.beginPath();ctx.roundRect(x-42,sign.y,84,30,6);ctx.fill();
    ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('!',x,sign.y+15);
    ctx.restore();
  }

  function drawEnemy(e) {
    if(e.dead)return;
    const x=e.x-cameraX;
    if(x<-120||x>W+120)return;
    ctx.save();
    if(e.hit>0)ctx.globalAlpha=.45;
    if(e.type==='slime'){
      ctx.fillStyle='#65a30d';ctx.beginPath();ctx.roundRect(x,e.y+10,e.w,e.h-10,15);ctx.fill();
      ctx.fillStyle='#a3e635';ctx.beginPath();ctx.ellipse(x+e.w/2,e.y+13,e.w*.46,14,0,Math.PI,Math.PI*2);ctx.fill();
      ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x+12,e.y+22,3,0,Math.PI*2);ctx.arc(x+27,e.y+22,3,0,Math.PI*2);ctx.fill();
    }else if(e.type==='beetle'){
      ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.ellipse(x+20,e.y+22,20,17,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#f0abfc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+20,e.y+7);ctx.lineTo(x+20,e.y+37);ctx.stroke();
      ctx.strokeStyle='#111';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+7,e.y+17+i*7);ctx.lineTo(x-2,e.y+13+i*10);ctx.stroke();ctx.beginPath();ctx.moveTo(x+33,e.y+17+i*7);ctx.lineTo(x+42,e.y+13+i*10);ctx.stroke();}
    }else if(e.type==='bat'){
      ctx.fillStyle='#312e81';ctx.beginPath();ctx.ellipse(x+20,e.y+20,15,14,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#4f46e5';ctx.beginPath();ctx.moveTo(x+8,e.y+18);ctx.lineTo(x-12,e.y+5);ctx.lineTo(x+1,e.y+29);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(x+32,e.y+18);ctx.lineTo(x+52,e.y+5);ctx.lineTo(x+39,e.y+29);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(x+15,e.y+18,2,0,Math.PI*2);ctx.arc(x+25,e.y+18,2,0,Math.PI*2);ctx.fill();
    }else{
      ctx.shadowColor='#ef4444';ctx.shadowBlur=18;
      ctx.fillStyle='#7f1d1d';ctx.beginPath();ctx.roundRect(x,e.y+10,e.w,e.h-10,18);ctx.fill();
      ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(x+e.w/2,e.y+20,e.w*.38,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(x+24,e.y+25,5,0,Math.PI*2);ctx.arc(x+50,e.y+25,5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+18,e.y+10);ctx.lineTo(x+8,e.y-5);ctx.moveTo(x+56,e.y+10);ctx.lineTo(x+66,e.y-5);ctx.stroke();
      ctx.shadowBlur=0;
    }
    ctx.restore();
  }

  function drawHero() {
    const x=hero.x-cameraX;
    const y=hero.y;
    const blink=hero.invuln>0 && Math.floor(hero.invuln/5)%2===0;
    if(blink)return;
    ctx.save();
    ctx.translate(x+hero.w/2,y+hero.h);
    if(hero.facing<0)ctx.scale(-1,1);

    ctx.fillStyle='rgba(0,0,0,.25)';
    ctx.beginPath();ctx.ellipse(0,4,17,5,0,0,Math.PI*2);ctx.fill();

    const stride=hero.onGround?Math.sin(hero.run)*10:7;
    ctx.strokeStyle='#26356e';ctx.lineWidth=7;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-5,-22);ctx.lineTo(-6+stride*.5,-3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(5,-22);ctx.lineTo(6-stride*.5,-3);ctx.stroke();
    ctx.fillStyle='#171717';
    ctx.beginPath();ctx.roundRect(-13+stride*.5,-6,14,7,3);ctx.fill();
    ctx.beginPath();ctx.roundRect(0-stride*.5,-6,14,7,3);ctx.fill();

    ctx.fillStyle=hero.power==='star'?'#fde047':'#2563eb';
    ctx.beginPath();ctx.roundRect(-13,-44,26,25,8);ctx.fill();
    ctx.fillStyle='#7c3aed';ctx.fillRect(-3,-43,6,23);

    ctx.fillStyle=hero.power==='fire'?'#ef4444':'#ff4d9d';
    ctx.beginPath();ctx.moveTo(-11,-41);ctx.quadraticCurveTo(-29,-28,-19,-5);ctx.lineTo(-7,-18);ctx.closePath();ctx.fill();

    ctx.strokeStyle='#2563eb';ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(-11,-38);ctx.lineTo(-18,-22-stride*.35);ctx.stroke();
    ctx.beginPath();ctx.moveTo(11,-38);ctx.lineTo(18,-22+stride*.35);ctx.stroke();
    ctx.fillStyle=hero.power==='fire'?'#f97316':'#f7c4a5';
    ctx.beginPath();ctx.arc(-18,-22-stride*.35,4,0,Math.PI*2);ctx.arc(18,-22+stride*.35,4,0,Math.PI*2);ctx.fill();

    ctx.fillStyle='#f7c4a5';ctx.beginPath();ctx.arc(0,-53,11,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4b2e1f';ctx.beginPath();ctx.arc(-1,-57,10,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(5,-53,2,0,Math.PI*2);ctx.fill();

    ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.roundRect(-12,-66,25,8,4);ctx.fill();
    ctx.fillStyle='#FFD600';ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(5,-63);ctx.lineTo(-5,-63);ctx.closePath();ctx.fill();

    if(hero.power==='shield'&&hero.shieldHits>0){
      ctx.strokeStyle='rgba(96,165,250,.9)';ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(0,-31,35,0,Math.PI*2);ctx.stroke();
    }
    if(hero.power==='star'){
      ctx.strokeStyle='#fde047';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(0,-31,39+Math.sin(frame*.15)*3,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }

  function drawGoal() {
    const x=level.goalX-cameraX;
    if(x<-100||x>W+120)return;
    const open=hero.rune&&(levelIndex<2||bossDefeated);
    ctx.save();
    if(levelIndex<2){
      ctx.fillStyle='#6b4226';ctx.fillRect(x,FLOOR_Y-118,10,118);
      ctx.fillStyle=open?'#FFD600':'#6b7280';
      ctx.beginPath();ctx.moveTo(x+10,FLOOR_Y-112);ctx.lineTo(x+72,FLOOR_Y-90);ctx.lineTo(x+10,FLOOR_Y-68);ctx.closePath();ctx.fill();
      ctx.font='25px Arial';ctx.fillText(open?'⭐':'🔒',x+29,FLOOR_Y-84);
    }else{
      ctx.shadowColor=open?'#a78bfa':'#ef4444';ctx.shadowBlur=22;
      ctx.fillStyle=open?'#6d28d9':'#3f3f46';
      ctx.beginPath();ctx.roundRect(x,FLOOR_Y-130,72,130,30);ctx.fill();
      ctx.fillStyle=open?'#c4b5fd':'#71717a';
      ctx.beginPath();ctx.roundRect(x+13,FLOOR_Y-112,46,112,22);ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='26px Arial';ctx.textAlign='center';
      ctx.fillText(open?'🏆':'🔒',x+36,FLOOR_Y-58);
    }
    ctx.restore();
  }

  function draw() {
    drawBackground();
    level.grounds.forEach(drawPlatform);
    level.platforms.forEach(drawPlatform);
    level.moving.forEach(drawPlatform);
    level.spikes.forEach(drawSpikes);
    level.signs.forEach(drawSign);
    level.chests.forEach(drawChest);
    level.coins.forEach(drawCoin);
    level.powers.forEach(drawPower);
    drawRune();
    level.enemies.forEach(drawEnemy);
    drawGoal();

    shots.forEach(s=>{
      const x=s.x-cameraX;
      ctx.fillStyle='#f97316';ctx.shadowColor='#fde047';ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(x,s.y+s.h/2,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    });
    enemyShots.forEach(s=>{
      const x=s.x-cameraX;
      ctx.fillStyle='#ef4444';ctx.shadowColor='#fb7185';ctx.shadowBlur=14;
      ctx.beginPath();ctx.arc(x,s.y,9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    });

    particles.forEach(p=>{
      ctx.globalAlpha=Math.max(0,p.life/55);
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cameraX,p.y,p.size,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    });

    drawHero();

    const progress=Math.max(0,Math.min(1,hero.x/level.goalX));
    ctx.fillStyle='rgba(15,23,42,.68)';
    ctx.fillRect(12,H-18,W-24,7);
    ctx.fillStyle='#FFD600';
    ctx.fillRect(12,H-18,(W-24)*progress,7);

    ctx.fillStyle='rgba(15,23,42,.72)';
    ctx.font='bold 12px Arial';
    ctx.textAlign='center';
    ctx.fillText(hero.rune?'🧿 Runa conseguida · Busca la salida':'🎯 Misión: encuentra la runa dorada',W/2,H-27);
  }

  function loop() {
    if(!document.getElementById('plGame'))return;
    update();
    draw();
    animId=registerAnimation(requestAnimationFrame(loop));
  }

  function bindHold(id,key) {
    const btn=document.getElementById(id);
    const down=e=>{e.preventDefault();e.stopPropagation();keys[key]=true;btn.style.transform='scale(.93)';};
    const up=e=>{e.preventDefault();e.stopPropagation();keys[key]=false;btn.style.transform='scale(1)';};
    btn.addEventListener('pointerdown',down);
    btn.addEventListener('pointerup',up);
    btn.addEventListener('pointercancel',up);
    btn.addEventListener('pointerleave',up);
  }

  bindHold('plLeft','left');
  bindHold('plRight','right');

  window.addEventListener('blur', () => {
    keys.left = false;
    keys.right = false;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      keys.left = false;
      keys.right = false;
    }
  });

  const jumpBtn=document.getElementById('plJump');
  const actionBtn=document.getElementById('plAction');
  jumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();jump();});
  actionBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();useAction();});

  canvas.addEventListener('pointerdown',e=>{
    if(e.clientY<H*.70){jump();e.preventDefault();}
  });

  function keyHandler(e) {
    if(['ArrowLeft','a','A'].includes(e.key)){keys.left=e.type==='keydown';e.preventDefault();}
    if(['ArrowRight','d','D'].includes(e.key)){keys.right=e.type==='keydown';e.preventDefault();}
    if(e.type==='keydown' && ['ArrowUp','w','W',' '].includes(e.key)){jump();e.preventDefault();}
    if(e.type==='keydown' && ['j','J','k','K'].includes(e.key)){useAction();e.preventDefault();}
  }
  document.addEventListener('keydown',keyHandler);
  document.addEventListener('keyup',keyHandler);
  window.activeKeyHandlers.push(keyHandler);

  window.plReset=resetAdventure;
  window.plRetry=()=>startLevel(levelIndex,true);
  window.plJump=jump;
  window.plPower=useAction;

  startLevel(0,false);
  animId=registerAnimation(requestAnimationFrame(loop));
};
