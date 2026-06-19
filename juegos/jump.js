(function(){
  'use strict';

  function buildJump(container){
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(320, window.innerWidth);
    const H = Math.max(480, window.innerHeight);

    container.style.cssText = `position:fixed;inset:0;overflow:hidden;background:#111;z-index:99999;touch-action:none;font-family:Arial,sans-serif`;
    container.innerHTML = `
      <canvas id="jumpGame25" style="position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none"></canvas>
      <div id="jumpHud25" style="position:absolute;top:0;left:0;right:0;display:flex;gap:8px;align-items:center;padding:10px 12px;color:#fff;font-weight:900;z-index:5;background:linear-gradient(180deg,rgba(0,0,0,.58),rgba(0,0,0,0));pointer-events:none">
        <span>❤️ <b id="j25Lives">5</b></span>
        <span>💎 <b id="j25Gems">0</b>/3</span>
        <span>🪙 <b id="j25Coins">0</b></span>
        <span style="margin-left:auto">⚡ <b id="j25Power">ENERGÍA</b></span>
      </div>
      <div style="position:absolute;top:52px;left:12px;right:12px;height:8px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.5);border-radius:999px;overflow:hidden;z-index:5;pointer-events:none">
        <div id="j25Hp" style="height:100%;width:100%;background:linear-gradient(90deg,#22c55e,#facc15,#ef4444);transform-origin:left"></div>
      </div>
      <button id="j25Sound" style="position:absolute;top:72px;right:12px;z-index:8;border:0;border-radius:14px;padding:10px 13px;background:rgba(255,255,255,.9);font-size:20px">🔊</button>
      <button id="j25Close" style="position:absolute;top:72px;left:12px;z-index:8;border:0;border-radius:14px;padding:10px 14px;background:#ef4444;color:#fff;font-weight:900;font-size:18px">✕</button>
      <div id="j25Controls" style="position:absolute;left:0;right:0;bottom:16px;display:flex;justify-content:space-between;align-items:flex-end;padding:0 16px;z-index:8;pointer-events:none">
        <div style="display:flex;gap:10px;pointer-events:auto">
          <button data-key="left" class="j25btn">◀</button>
          <button data-key="right" class="j25btn">▶</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,74px);gap:10px;pointer-events:auto">
          <button data-key="power" class="j25btn j25power">⚡</button>
          <button data-key="attack" class="j25btn j25attack">🥊</button>
          <button data-key="jump" class="j25btn j25jump" style="grid-column:1/3">⬆ SALTO</button>
        </div>
      </div>
      <style>
        .j25btn{min-width:68px;height:62px;border:2px solid rgba(255,255,255,.8);border-radius:18px;background:rgba(25,20,45,.72);color:#fff;font-size:24px;font-weight:900;box-shadow:0 8px 20px rgba(0,0,0,.3);touch-action:none;user-select:none}
        .j25btn:active,.j25btn.active{transform:scale(.94);filter:brightness(1.25)}
        .j25attack{background:linear-gradient(135deg,#ef4444,#f97316)}
        .j25power{background:linear-gradient(135deg,#7c3aed,#06b6d4)}
        .j25jump{height:54px;background:linear-gradient(135deg,#2563eb,#22c55e);font-size:18px}
      </style>
      <div id="j25Message" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:20;pointer-events:none"></div>`;

    const canvas = container.querySelector('#jumpGame25');
    const ctx = canvas.getContext('2d');
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);

    const ui = {
      lives: container.querySelector('#j25Lives'), gems: container.querySelector('#j25Gems'), coins: container.querySelector('#j25Coins'),
      hp: container.querySelector('#j25Hp'), power: container.querySelector('#j25Power'), msg: container.querySelector('#j25Message')
    };

    const keys = {left:false,right:false,jump:false,attack:false,power:false};
    let running = true, paused = false, raf = 0, last = performance.now();
    let sound = localStorage.getItem('jump25Sound') !== 'false';
    let cameraX = 0, shake = 0, worldTime = 0;
    const WORLD_W = 7200;
    const GROUND_Y = H - 145;

    const player = {
      x:120,y:GROUND_Y-84,w:46,h:78,vx:0,vy:0,dir:1,onGround:false,
      hp:100,lives:5,coins:0,gems:0,attackTimer:0,attackCooldown:0,invuln:0,
      power:'ENERGÍA', powerEnergy:100, checkpointX:120, anim:0
    };

    const platforms = [
      {x:0,y:GROUND_Y,w:880,h:220,t:'grass'},
      {x:980,y:GROUND_Y-50,w:430,h:270,t:'rock'},
      {x:1490,y:GROUND_Y-130,w:280,h:350,t:'wood'},
      {x:1850,y:GROUND_Y,w:640,h:220,t:'grass'},
      {x:2580,y:GROUND_Y-90,w:340,h:310,t:'rock'},
      {x:3010,y:GROUND_Y-160,w:280,h:380,t:'wood'},
      {x:3390,y:GROUND_Y,w:760,h:220,t:'grass'},
      {x:4260,y:GROUND_Y-70,w:470,h:290,t:'rock'},
      {x:4820,y:GROUND_Y-150,w:300,h:370,t:'wood'},
      {x:5220,y:GROUND_Y,w:860,h:220,t:'grass'},
      {x:6200,y:GROUND_Y-80,w:1000,h:300,t:'temple'}
    ];

    const smallPlatforms = [
      {x:690,y:GROUND_Y-130,w:170,h:24},{x:1120,y:GROUND_Y-190,w:150,h:24},{x:1690,y:GROUND_Y-260,w:160,h:24},
      {x:2180,y:GROUND_Y-130,w:180,h:24},{x:2780,y:GROUND_Y-240,w:150,h:24},{x:3150,y:GROUND_Y-300,w:170,h:24},
      {x:3780,y:GROUND_Y-150,w:170,h:24},{x:4510,y:GROUND_Y-210,w:170,h:24},{x:4950,y:GROUND_Y-300,w:170,h:24},
      {x:5650,y:GROUND_Y-160,w:190,h:24},{x:6480,y:GROUND_Y-210,w:180,h:24}
    ];

    const coins = [];
    for(let x=260;x<WORLD_W-300;x+=170) coins.push({x,y:GROUND_Y-80-(Math.sin(x*.008)+1)*45,r:10,taken:false,bob:Math.random()*6.28});
    const gems = [
      {x:1710,y:GROUND_Y-310,taken:false},{x:3200,y:GROUND_Y-350,taken:false},{x:5000,y:GROUND_Y-350,taken:false}
    ];
    const crates = [780,1330,2070,2700,3650,4390,5450,5900].map((x,i)=>({x,y:GROUND_Y-52,w:52,h:52,hp:2,broken:false,kind:i%3}));
    const enemies = [
      {x:560,y:GROUND_Y-55,min:450,max:800,hp:3,dir:1,type:'lizard'},
      {x:1210,y:GROUND_Y-105,min:1030,max:1370,hp:3,dir:-1,type:'boar'},
      {x:1990,y:GROUND_Y-55,min:1880,max:2350,hp:4,dir:1,type:'lizard'},
      {x:2800,y:GROUND_Y-145,min:2610,max:2900,hp:4,dir:-1,type:'boar'},
      {x:3590,y:GROUND_Y-55,min:3440,max:4070,hp:5,dir:1,type:'lizard'},
      {x:4470,y:GROUND_Y-125,min:4300,max:4680,hp:5,dir:-1,type:'boar'},
      {x:5530,y:GROUND_Y-55,min:5280,max:6000,hp:6,dir:1,type:'lizard'}
    ].map(e=>({...e,w:52,h:52,vx:0,vy:0,dead:false,hit:0}));

    const particles = [], projectiles = [];
    let portal = {x:6800,y:GROUND_Y-130,w:90,h:130,open:false};

    function beep(freq=440,dur=.08,type='sine',vol=.08){
      if(!sound) return;
      try{
        const ac = beep.ac || (beep.ac = new (window.AudioContext||window.webkitAudioContext)());
        const o=ac.createOscillator(),g=ac.createGain(); o.type=type;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);o.stop(ac.currentTime+dur);
      }catch(_){ }
    }

    function toast(text,color='#7c3aed',ms=1500){
      ui.msg.innerHTML = `<div style="background:${color};color:white;border:3px solid rgba(255,255,255,.9);border-radius:20px;padding:18px 24px;font-weight:900;font-size:clamp(20px,5vw,34px);box-shadow:0 12px 40px rgba(0,0,0,.45);text-align:center">${text}</div>`;
      clearTimeout(toast.t); toast.t=setTimeout(()=>ui.msg.innerHTML='',ms);
    }

    function addParticles(x,y,count,kind='spark'){
      for(let i=0;i<count;i++) particles.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.8)*7,life:30+Math.random()*20,kind,size:3+Math.random()*5});
    }

    function rects(a,b){return a.x<a.x+b.w && a.x+a.w>b.x && a.y<a.y+b.h && a.y+a.h>b.y;}
    function overlap(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;}

    function groundAt(x, yBottom){
      let best = Infinity;
      [...platforms,...smallPlatforms].forEach(p=>{
        if(x+player.w*.7>p.x && x+player.w*.3<p.x+p.w && yBottom<=p.y+34 && p.y<best) best=p.y;
      });
      return best;
    }

    function hurt(amount,fromX){
      if(player.invuln>0) return;
      player.hp-=amount; player.invuln=70; player.vy=-7; player.vx=(player.x<fromX?-1:1)*7; shake=12;
      addParticles(player.x+player.w/2,player.y+30,14,'hit'); beep(130,.2,'sawtooth',.12);
      if(player.hp<=0){
        player.lives--; ui.lives.textContent=player.lives;
        if(player.lives<=0){running=false;toast('💀 FIN DE LA AVENTURA','#b91c1c',999999);}
        else { player.hp=100; player.x=player.checkpointX; player.y=GROUND_Y-100; player.vx=0;player.vy=0;toast('❤️ Intento nuevamente','#dc2626'); }
      }
    }

    function attackBox(){
      const reach=58;
      return {x:player.dir>0?player.x+player.w-4:player.x-reach+4,y:player.y+18,w:reach,h:42};
    }

    function performAttack(){
      if(player.attackCooldown>0) return;
      player.attackTimer=16;player.attackCooldown=24;beep(210,.06,'square',.08);setTimeout(()=>beep(420,.08,'triangle',.08),40);
      const box=attackBox();
      enemies.forEach(e=>{
        if(!e.dead && overlap(box,{x:e.x,y:e.y,w:e.w,h:e.h})){
          e.hp--;e.hit=10;e.x+=player.dir*20;shake=7;addParticles(e.x+25,e.y+25,10,'spark');
          if(e.hp<=0){e.dead=true;player.coins+=20;addParticles(e.x+25,e.y+25,24,'boom');beep(700,.12,'sine',.12);}
        }
      });
      crates.forEach(c=>{
        if(!c.broken && overlap(box,c)){c.hp--;shake=5;addParticles(c.x+25,c.y+25,10,'wood'); if(c.hp<=0){c.broken=true;player.coins+=10+Math.floor(Math.random()*10);addParticles(c.x+25,c.y+25,18,'wood');}}
      });
    }

    function usePower(){
      if(player.powerEnergy<25) return;
      player.powerEnergy-=25;
      projectiles.push({x:player.x+player.w/2,y:player.y+28,vx:player.dir*10,life:80,r:12});
      addParticles(player.x+player.w/2,player.y+28,14,'energy');beep(760,.12,'sine',.12);
    }

    function update(dt){
      if(paused || !running) return;
      worldTime += dt;
      const accel=.7,max=5.8;
      if(keys.left){player.vx=Math.max(player.vx-accel,-max);player.dir=-1;}
      else if(keys.right){player.vx=Math.min(player.vx+accel,max);player.dir=1;}
      else player.vx*=.80;

      if(keys.jump && player.onGround){player.vy=-12.8;player.onGround=false;beep(360,.08,'triangle',.08);keys.jump=false;}
      if(keys.attack){performAttack();keys.attack=false;}
      if(keys.power){usePower();keys.power=false;}

      player.vy += .62;
      const oldY=player.y;
      player.x += player.vx;
      player.y += player.vy;
      player.x=Math.max(0,Math.min(WORLD_W-player.w,player.x));

      const g=groundAt(player.x,oldY+player.h);
      if(player.vy>=0 && g<Infinity && player.y+player.h>=g && oldY+player.h<=g+24){player.y=g-player.h;player.vy=0;player.onGround=true;} else player.onGround=false;
      if(player.y>H+300) hurt(120,player.x+100);

      if(player.attackCooldown>0)player.attackCooldown--;
      if(player.attackTimer>0)player.attackTimer--;
      if(player.invuln>0)player.invuln--;
      player.powerEnergy=Math.min(100,player.powerEnergy+.08);
      player.anim += Math.abs(player.vx)*.12 + .04;

      coins.forEach(c=>{ if(!c.taken && Math.hypot((player.x+23)-c.x,(player.y+35)-c.y)<38){c.taken=true;player.coins++;addParticles(c.x,c.y,8,'coin');beep(880,.05,'sine',.07);} });
      gems.forEach(gm=>{ if(!gm.taken && Math.hypot((player.x+23)-gm.x,(player.y+35)-gm.y)<45){gm.taken=true;player.gems++;addParticles(gm.x,gm.y,22,'gem');toast(`💎 CRISTAL ${player.gems}/3`,'#0ea5e9');beep(1040,.15,'sine',.12);} });

      if(player.x>2200 && player.checkpointX<2200){player.checkpointX=2200;toast('🚩 Punto de control','#16a34a');}
      if(player.x>4300 && player.checkpointX<4300){player.checkpointX=4300;toast('🚩 Punto de control','#16a34a');}

      enemies.forEach(e=>{
        if(e.dead)return;
        e.x += e.dir*(e.type==='boar'?1.55:1.1);
        if(e.x<e.min||e.x>e.max)e.dir*=-1;
        if(e.hit>0)e.hit--;
        if(overlap(player,{x:e.x,y:e.y,w:e.w,h:e.h})) hurt(e.type==='boar'?24:16,e.x);
      });

      projectiles.forEach(p=>{
        p.x+=p.vx;p.life--;
        enemies.forEach(e=>{if(!e.dead&&Math.hypot(p.x-(e.x+26),p.y-(e.y+26))<34){e.hp-=2;e.hit=12;p.life=0;addParticles(p.x,p.y,18,'energy');if(e.hp<=0){e.dead=true;player.coins+=25;}}});
        crates.forEach(c=>{if(!c.broken&&p.x>c.x&&p.x<c.x+c.w&&p.y>c.y&&p.y<c.y+c.h){c.hp=0;c.broken=true;p.life=0;addParticles(c.x+25,c.y+25,20,'wood');}});
      });
      for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].life<=0)projectiles.splice(i,1);

      particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.22;p.life--;});
      for(let i=particles.length-1;i>=0;i--)if(particles[i].life<=0)particles.splice(i,1);

      portal.open = player.gems>=3;
      if(portal.open && overlap(player,portal)){running=false;toast('🏆 ¡AVENTURA COMPLETADA!<br><span style="font-size:.55em">Recogiste los 3 cristales</span>','#7c3aed',999999);beep(1200,.3,'sine',.14);}

      cameraX += ((player.x-W*.38)-cameraX)*.08;
      cameraX=Math.max(0,Math.min(WORLD_W-W,cameraX));
      if(shake>0)shake*=.82;

      ui.hp.style.width=`${Math.max(0,player.hp)}%`;
      ui.coins.textContent=player.coins;ui.gems.textContent=player.gems;ui.lives.textContent=player.lives;
    }

    function hillLayer(offset,baseY,amp,step,color){
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,H);
      for(let sx=-step;sx<=W+step;sx+=step){const wx=sx+cameraX*offset;const y=baseY-Math.sin(wx*.004)*amp-Math.sin(wx*.009)*amp*.35;ctx.lineTo(sx,y);}ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    }

    function drawBackground(){
      const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#7dd3fc');sky.addColorStop(.55,'#f9a8d4');sky.addColorStop(1,'#fde68a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(255,255,255,.45)';
      for(let i=0;i<9;i++){const x=((i*210-cameraX*.12)% (W+260))-100;const y=70+(i%3)*65;ctx.beginPath();ctx.ellipse(x,y,70,25,0,0,Math.PI*2);ctx.ellipse(x+45,y+8,55,22,0,0,Math.PI*2);ctx.fill();}
      hillLayer(.12,H*.54,70,110,'#9f7aea');
      hillLayer(.22,H*.66,90,100,'#6d5fa8');
      hillLayer(.38,H*.78,75,85,'#3f6f65');
      ctx.fillStyle='rgba(24,71,54,.55)';
      for(let i=0;i<34;i++){const x=((i*230-cameraX*.55)%(W+300))-100;const h=70+(i%5)*18;ctx.fillRect(x,H-220-h,16,h);ctx.beginPath();ctx.arc(x+8,H-220-h,38,0,Math.PI*2);ctx.fill();}
    }

    function drawPlatform(p){
      const x=p.x-cameraX;if(x>W||x+p.w<0)return;
      const grad=ctx.createLinearGradient(0,p.y,0,p.y+p.h);
      if(p.t==='grass'){grad.addColorStop(0,'#65a30d');grad.addColorStop(.08,'#84cc16');grad.addColorStop(.1,'#8b5a2b');grad.addColorStop(1,'#4b2e1f');}
      else if(p.t==='wood'){grad.addColorStop(0,'#f59e0b');grad.addColorStop(1,'#78350f');}
      else if(p.t==='temple'){grad.addColorStop(0,'#fbbf24');grad.addColorStop(1,'#7c2d12');}
      else {grad.addColorStop(0,'#a78bfa');grad.addColorStop(.12,'#7c3aed');grad.addColorStop(1,'#312e81');}
      ctx.fillStyle=grad;ctx.fillRect(x,p.y,p.w,p.h);
      ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;for(let xx=x;xx<x+p.w;xx+=56)ctx.strokeRect(xx,p.y,52,26);
    }

    function drawKangaroo(){
      const x=player.x-cameraX,y=player.y; if(player.invuln>0&&Math.floor(player.invuln/4)%2===0)return;
      ctx.save();ctx.translate(x+player.w/2,y+player.h/2);ctx.scale(player.dir,1);
      const run=Math.sin(player.anim)*6;
      if(player.attackTimer>0){ctx.rotate(-.12*player.dir);}
      ctx.strokeStyle='#7c2d12';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-12,8);ctx.quadraticCurveTo(-46,18,-60,42);ctx.stroke();
      ctx.strokeStyle='#a16207';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(-8,22);ctx.lineTo(-13+run,48);ctx.moveTo(10,22);ctx.lineTo(21-run,50);ctx.stroke();
      ctx.fillStyle='#b45309';ctx.beginPath();ctx.ellipse(0,4,22,31,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.ellipse(3,-23,18,19,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.ellipse(10,-25,12,9,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(8,-29,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(9,-29,2,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#a16207';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-8,-38);ctx.lineTo(-14,-62);ctx.moveTo(3,-39);ctx.lineTo(7,-64);ctx.stroke();
      ctx.strokeStyle='#b45309';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(-28,15+run*.3);ctx.stroke();
      const fistX=player.attackTimer>0?48:28;ctx.strokeStyle='#b45309';ctx.beginPath();ctx.moveTo(13,-2);ctx.lineTo(fistX,5);ctx.stroke();
      ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.arc(fistX+4,6,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#22d3ee';ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle='#2563eb';ctx.fillRect(-19,8,38,22);
      ctx.restore();
    }

    function drawEnemy(e){
      const x=e.x-cameraX,y=e.y;if(x<-80||x>W+80||e.dead)return;
      ctx.save();ctx.translate(x+26,y+26);ctx.scale(e.dir,1);if(e.hit>0)ctx.globalAlpha=.45;
      ctx.fillStyle=e.type==='boar'?'#7c2d12':'#16a34a';ctx.beginPath();ctx.ellipse(0,6,25,20,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=e.type==='boar'?'#a16207':'#22c55e';ctx.beginPath();ctx.arc(18,-2,15,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(22,-6,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(23,-6,2,0,Math.PI*2);ctx.fill();
      if(e.type==='boar'){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(29,3);ctx.lineTo(38,8);ctx.stroke();}
      ctx.restore();
    }

    function draw(){
      ctx.save();
      const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;ctx.translate(sx,sy);
      drawBackground();
      platforms.forEach(drawPlatform);
      smallPlatforms.forEach(p=>{const x=p.x-cameraX;if(x>-p.w&&x<W){ctx.fillStyle='#f59e0b';ctx.fillRect(x,p.y,p.w,p.h);ctx.fillStyle='#fde68a';ctx.fillRect(x,p.y,p.w,6);}});

      coins.forEach(c=>{if(c.taken)return;const x=c.x-cameraX;if(x<-20||x>W+20)return;const y=c.y+Math.sin(worldTime*.004+c.bob)*6;ctx.fillStyle='#facc15';ctx.beginPath();ctx.ellipse(x,y,8+Math.sin(worldTime*.006)*2,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff7ae';ctx.lineWidth=2;ctx.stroke();});
      gems.forEach(g=>{if(g.taken)return;const x=g.x-cameraX,y=g.y+Math.sin(worldTime*.004)*8;if(x<-30||x>W+30)return;ctx.save();ctx.translate(x,y);ctx.rotate(worldTime*.0015);ctx.fillStyle='#22d3ee';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(14,0);ctx.lineTo(0,20);ctx.lineTo(-14,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();ctx.restore();});

      crates.forEach(c=>{if(c.broken)return;const x=c.x-cameraX;if(x<-60||x>W+60)return;ctx.fillStyle='#92400e';ctx.fillRect(x,c.y,c.w,c.h);ctx.strokeStyle='#f59e0b';ctx.lineWidth=5;ctx.strokeRect(x+3,c.y+3,c.w-6,c.h-6);ctx.beginPath();ctx.moveTo(x+6,c.y+6);ctx.lineTo(x+c.w-6,c.y+c.h-6);ctx.moveTo(x+c.w-6,c.y+6);ctx.lineTo(x+6,c.y+c.h-6);ctx.stroke();});
      enemies.forEach(drawEnemy);

      projectiles.forEach(p=>{const x=p.x-cameraX;const rg=ctx.createRadialGradient(x,p.y,2,x,p.y,18);rg.addColorStop(0,'#fff');rg.addColorStop(.35,'#22d3ee');rg.addColorStop(1,'rgba(124,58,237,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(x,p.y,18,0,Math.PI*2);ctx.fill();});

      const px=portal.x-cameraX;if(px>-120&&px<W+120){ctx.save();ctx.translate(px+45,portal.y+65);ctx.strokeStyle=portal.open?'#22d3ee':'#64748b';ctx.lineWidth=10;ctx.beginPath();ctx.ellipse(0,0,34,60,0,0,Math.PI*2);ctx.stroke();if(portal.open){ctx.fillStyle='rgba(34,211,238,.3)';ctx.beginPath();ctx.ellipse(0,0,26,52,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
      drawKangaroo();

      particles.forEach(p=>{const x=p.x-cameraX;if(p.kind==='coin')ctx.fillStyle='#facc15';else if(p.kind==='wood')ctx.fillStyle='#92400e';else if(p.kind==='hit')ctx.fillStyle='#ef4444';else if(p.kind==='gem')ctx.fillStyle='#22d3ee';else if(p.kind==='energy')ctx.fillStyle='#a78bfa';else ctx.fillStyle='#fde047';ctx.globalAlpha=Math.max(0,p.life/45);ctx.fillRect(x,p.y,p.size,p.size);ctx.globalAlpha=1;});
      ctx.restore();

      if(!portal.open && player.x>6200){ctx.fillStyle='rgba(15,23,42,.75)';ctx.fillRect(W/2-170,90,340,56);ctx.fillStyle='#fff';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText(`Faltan ${3-player.gems} cristales para abrir el portal`,W/2,124);}
    }

    function loop(now){
      const dt=Math.min(32,now-last);last=now;update(dt);draw();raf=requestAnimationFrame(loop);
    }

    function bindButton(btn,key){
      const down=e=>{e.preventDefault();keys[key]=true;btn.classList.add('active');};
      const up=e=>{e.preventDefault();keys[key]=false;btn.classList.remove('active');};
      btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
    }
    container.querySelectorAll('[data-key]').forEach(b=>bindButton(b,b.dataset.key));

    const kd=e=>{if(!document.getElementById('jumpGame25'))return;const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=true;if(k==='arrowright'||k==='d')keys.right=true;if(k==='arrowup'||k==='w'||k===' ')keys.jump=true;if(k==='j')keys.attack=true;if(k==='k')keys.power=true;if(k==='p')paused=!paused;};
    const ku=e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=false;if(k==='arrowright'||k==='d')keys.right=false;};
    document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);

    container.querySelector('#j25Sound').onclick=()=>{sound=!sound;localStorage.setItem('jump25Sound',sound);container.querySelector('#j25Sound').textContent=sound?'🔊':'🔇';};
    container.querySelector('#j25Close').onclick=()=>{
      running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
      if(typeof window.closeGame==='function')window.closeGame();else if(typeof window.closeModal==='function')window.closeModal();else container.remove();
    };

    window.jumpReset=()=>location.reload();
    window.jumpClose=container.querySelector('#j25Close').onclick;
    toast('🦘 HUGOKIDS ADVENTURE<br><span style="font-size:.55em">Consigue 3 cristales y llega al portal</span>','#7c3aed',2600);
    raf=requestAnimationFrame(loop);
  }

  window.buildJump = buildJump;
})();
