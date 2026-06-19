function buildTorre(container) {
  const W = Math.min(360, window.innerWidth-40), H = 460;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:10px;min-height:520px">
      <div style="text-align:center;color:#fff;margin-bottom:6px">
        <span style="font-family:'Fredoka One',cursive">❤️ <span id="torreVida">10</span></span>
        <span style="margin-left:12px;color:#FFD600">🪙 <span id="torreOro">50</span></span>
        <span style="margin-left:12px;color:#aaa;font-size:0.85rem">Oleada <span id="torreOla">1</span></span>
      </div>
      <canvas id="torreCanvas" width="${W}" height="${H}" style="background:#14532d;border-radius:14px;display:block;margin:0 auto;touch-action:manipulation;max-width:100%"></canvas>
      <div style="text-align:center;margin-top:8px">
        <button id="torreComprar" style="background:#FFD600;border:none;color:#3a2700;padding:10px 18px;border-radius:14px;font-weight:800;cursor:pointer">🏹 Torre (20🪙)</button>
        <button id="torreOla2" style="background:#16A34A;border:none;color:#fff;padding:10px 18px;border-radius:14px;font-weight:800;cursor:pointer;margin-left:6px">▶️ Oleada</button>
      </div>
    </div>
    <div class="game-instructions">🏰 Compra torres 🏹 y tócalas para colocarlas en el camino. Disparan a los enemigos 👹. ¡No dejes que lleguen a tu castillo 🏰!</div>`;
  const cv = document.getElementById('torreCanvas');
  const ctx = cv.getContext('2d');
  // camino (puntos)
  const camino = [{x:0,y:80},{x:W*0.7,y:80},{x:W*0.7,y:200},{x:W*0.25,y:200},{x:W*0.25,y:330},{x:W,y:330}];
  let vida=10, oro=50, ola=1, jugando=true;
  let torres=[], enemigos=[], balas=[], colocando=false;
  let spawnQueue=0, spawnT=0, enOleada=false;
  let _torreAnimId = null;

  function puntoEnCamino(t) {
    // t de 0..1 sobre el camino total
    let segLen=[], total=0;
    for (let i=0;i<camino.length-1;i++){ const d=Math.hypot(camino[i+1].x-camino[i].x,camino[i+1].y-camino[i].y); segLen.push(d); total+=d; }
    let dist=t*total;
    for (let i=0;i<segLen.length;i++){ if (dist<=segLen[i]){ const r=dist/segLen[i]; return {x:camino[i].x+(camino[i+1].x-camino[i].x)*r, y:camino[i].y+(camino[i+1].y-camino[i].y)*r}; } dist-=segLen[i]; }
    return camino[camino.length-1];
  }

  document.getElementById('torreComprar').addEventListener('click', e => {
    e.preventDefault();
    if (oro>=20) { colocando=true; showToast('Toca el campo para poner la torre'); }
    else showToast('No tienes suficiente oro');
  });
  document.getElementById('torreOla2').addEventListener('click', e => {
    e.preventDefault();
    if (!enOleada) iniciarOleada();
  });
  const poner = e => {
    e.preventDefault();
    if (!colocando) return;
    const r = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || e;
    const x = (t.clientX-r.left)*(W/r.width), y=(t.clientY-r.top)*(H/r.height);
    torres.push({x,y,cd:0,rango:90,emoji:'🏹'});
    oro-=20; setText('torreOro',oro); colocando=false; SFX.coin();
  };
  cv.addEventListener('touchstart', poner, {passive:false});
  cv.addEventListener('click', poner);

  function iniciarOleada() {
    enOleada=true; spawnQueue=4+ola*2; setText('torreOla',ola);
  }

  function loop() {
    if (!container.isConnected || !jugando) return;
    ctx.clearRect(0,0,W,H);
    // dibujar camino
    ctx.strokeStyle='#a16207'; ctx.lineWidth=28; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(camino[0].x,camino[0].y);
    camino.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
    // castillo al final
    ctx.font='28px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🏰', camino[camino.length-1].x-14, camino[camino.length-1].y);
    // spawn enemigos
    if (enOleada && spawnQueue>0) {
      spawnT++;
      if (spawnT>40) { spawnT=0; spawnQueue--; enemigos.push({t:0,vida:2+Math.floor(ola/2),max:2+Math.floor(ola/2)}); }
    }
    // mover enemigos
    enemigos.forEach(en => {
      en.t += 0.0025 + ola*0.0002;
      const p = puntoEnCamino(en.t);
      en.x=p.x; en.y=p.y;
      if (en.t>=1) { en.muerto=true; vida--; setText('torreVida',vida); SFX.lose(); if (vida<=0) finJuego(); }
    });
    // torres disparan
    torres.forEach(to => {
      ctx.fillText(to.emoji, to.x, to.y);
      // rango
      ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(to.x,to.y,to.rango,0,7); ctx.stroke();
      to.cd--;
      if (to.cd<=0) {
        const obj = enemigos.find(en=>!en.muerto && Math.hypot(en.x-to.x,en.y-to.y)<to.rango);
        if (obj) { balas.push({x:to.x,y:to.y,obj}); to.cd=35; SFX.click(); }
      }
    });
    // balas
    balas.forEach(b => {
      if (b.obj.muerto) { b.hit=true; return; }
      const dx=b.obj.x-b.x, dy=b.obj.y-b.y, d=Math.hypot(dx,dy);
      if (d<8) { b.obj.vida--; b.hit=true; if (b.obj.vida<=0){ b.obj.muerto=true; oro+=5; setText('torreOro',oro); } }
      else { b.x+=dx/d*6; b.y+=dy/d*6; }
    });
    balas=balas.filter(b=>!b.hit);
    ctx.fillStyle='#fde047';
    balas.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,4,0,7); ctx.fill(); });
    // dibujar enemigos con barra de vida
    ctx.font='24px sans-serif';
    enemigos.forEach(en => {
      if (en.muerto) return;
      ctx.fillText('👹', en.x, en.y);
      ctx.fillStyle='#dc2626'; ctx.fillRect(en.x-14,en.y-20,28,4);
      ctx.fillStyle='#22c55e'; ctx.fillRect(en.x-14,en.y-20,28*(en.vida/en.max),4);
      ctx.fillStyle='#fde047';
    });
    enemigos = enemigos.filter(en=>!en.muerto);
    // fin de oleada
    if (enOleada && spawnQueue<=0 && enemigos.length===0) {
      enOleada=false; ola++; oro+=20; setText('torreOro',oro); setText('torreOla',ola);
      showToast('🎉 ¡Oleada superada! +20🪙');
      if (ola>5 && typeof awardBadge==='function') awardBadge('first_win');
    }
    if (!container.isConnected || !jugando) return;
    _torreAnimId = registerAnimation(requestAnimationFrame(loop));
  }
  function finJuego() {
    jugando=false;
    ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff'; ctx.font='bold 26px sans-serif'; ctx.textAlign='center';
    ctx.fillText('🏰 ¡Cayó el castillo!', W/2, H/2-20);
    ctx.font='18px sans-serif'; ctx.fillText('Llegaste a la oleada '+ola, W/2, H/2+15);
    if (ola>=3 && typeof darRecompensa==='function') darRecompensa(ola*5, ola*20, 'Torre');
    const btn=document.createElement('button');
    btn.textContent='🔁 Jugar de nuevo';
    btn.style.cssText='display:block;margin:10px auto 0;background:#7C3AED;border:none;color:#fff;padding:12px 24px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;cursor:pointer';
    const again=e=>{e.preventDefault(); vida=10;oro=50;ola=1;torres=[];enemigos=[];balas=[];enOleada=false;jugando=true; setText('torreVida',10);setText('torreOro',50);setText('torreOla',1); loop();};
    btn.addEventListener('touchstart',again,{passive:false}); btn.addEventListener('click',again);
    cv.parentElement.appendChild(btn);
  }
  loop();
}


/* ══════════════════════════════════════════════════════════
   MEJORA 2026: MISIÓN, NIVELES, RECOMPENSA Y MÁS JUEGOS 2P
   ══════════════════════════════════════════════════════════ */
const JUEGOS_EXTRA_ONLINE = [
  {id:'futbolonline', emoji:'⚽', name:'Fútbol Penal Online', desc:'Turnos para patear y atajar'},
  {id:'cartasonline', emoji:'🃏', name:'Cartas Mayor Online', desc:'Gana quien saque la carta mayor'},
  {id:'matematicasduelo', emoji:'➕', name:'Duelo Matemático Online', desc:'Responde rápido contra un amigo'},
  {id:'piramideonline', emoji:'🔺', name:'Pirámide Matemática Online', desc:'Completa la pirámide resolviendo sumas por turnos'},
  {id:'memoriaonline', emoji:'🧠', name:'Memoria Online', desc:'Busca pares por turnos'},
  {id:'carreraonline', emoji:'🏁', name:'Carrera de Dados Online', desc:'Avanza hasta la meta'},
  {id:'piedrapapelonline', emoji:'✊', name:'Piedra Papel Tijera Online', desc:'Rondas rápidas con amigo'}
];

function hgInjectExtraOnlineGames(){
  const grid=document.getElementById('gameGrid');
  if(!grid || document.getElementById('card-futbolonline')) return;
  JUEGOS_EXTRA_ONLINE.forEach(g=>{
    const card=document.createElement('div');
    card.className='game-card fade-up visible';
    card.id='card-'+g.id;
    card.dataset.cat='online multi';
    card.dataset.name=(g.name+' '+g.desc).toLowerCase();
    card.onclick=()=>openJuegoExtraOnline(g.id);
    card.innerHTML=`
      <div class="game-thumb"><div class="game-thumb-bg" style="background:linear-gradient(135deg,#06b6d4,#7C3AED)"></div><span class="game-thumb-emoji">${g.emoji}</span></div>
      <div class="game-badge badge-new">🌐 Online</div>
      <div class="game-info"><div class="game-name">${g.name}</div><div class="game-meta"><span class="game-cat cat-online">2 jugadores</span><span class="game-stars">⭐⭐⭐⭐⭐</span></div></div>`;
    grid.appendChild(card);
  });
  const gc=document.getElementById('gameCount'); if(gc) gc.textContent=(document.querySelectorAll('.game-card').length)+' juegos';
  const stat=document.querySelector('.stats .stat .stat-num');
}

document.addEventListener('DOMContentLoaded',()=>setTimeout(hgInjectExtraOnlineGames,400));

function hgGetProgress(){
  try{return JSON.parse(localStorage.getItem('hg_game_progress')||'{}')}catch(e){return {}}
}
function hgSaveProgress(p){try{localStorage.setItem('hg_game_progress',JSON.stringify(p))}catch(e){}}
function hgNivelActual(gameId){const p=hgGetProgress(); return Math.min(5, Math.max(1, (p[gameId]?.nivel)||1));}
async function hgCompletarNivel(gameId, nombre, baseMonedas=8, basePuntos=20){
  const p=hgGetProgress(); const cur=p[gameId]||{nivel:1, finales:0};
  const final = cur.nivel>=5;
  const monedas = final ? baseMonedas*6 : baseMonedas*cur.nivel;
  const puntos = final ? basePuntos*6 : basePuntos*cur.nivel;
  if(typeof darRecompensa==='function') await darRecompensa(monedas,puntos, final?'🏆 Recompensa final '+nombre:'Nivel '+cur.nivel+' '+nombre);
  if(final){ cur.finales=(cur.finales||0)+1; cur.nivel=1; if(typeof awardBadge==='function') awardBadge('first_win'); }
  else cur.nivel++;
  p[gameId]=cur; hgSaveProgress(p); hgMostrarFinalNivel(nombre, final, monedas, puntos, cur.nivel);
}
function hgMostrarFinalNivel(nombre, final, monedas, puntos, siguiente){
  const box=document.createElement('div');
  box.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:7000;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Nunito,sans-serif';
  box.innerHTML=`<div style="background:white;border:5px solid #FFD600;border-radius:28px;max-width:430px;width:100%;padding:28px;text-align:center;color:#2D1B4E;box-shadow:0 20px 70px rgba(0,0,0,.45)">
    <div style="font-size:4rem">${final?'🏆':'⭐'}</div>
    <h2 style="font-family:'Fredoka One',cursive;margin:8px 0">${final?'¡Nivel final terminado!':'¡Nivel superado!'}</h2>
    <p style="font-weight:800">${nombre}</p>
    <div style="background:#FFF4D6;border-radius:18px;padding:14px;margin:14px 0;font-weight:900;font-size:1.2rem">+${monedas} 🪙 &nbsp; +${puntos} ⭐</div>
    <p style="color:#7A6B9D;font-weight:700">${final?'Se reinicia la misión para volver a ganar premios.':'Siguiente nivel: '+siguiente+' de 5'}</p>
    <button style="margin-top:12px;background:linear-gradient(135deg,#7C3AED,#FF4D9D);color:white;border:none;border-radius:20px;padding:12px 26px;font-weight:900;cursor:pointer">Continuar</button>
  </div>`;
  box.querySelector('button').onclick=()=>box.remove(); document.body.appendChild(box);
}

// COMENTADO: Panel de misión - ahora no se muestra para ahorrar espacio
function hgMissionPanel(gameId, nombre, objetivo){
  return ''; // Retorna vacío - no mostrar misión
}

function openJuegoExtraOnline(id){
  stopAllGames();
  const modal=document.getElementById('modalOverlay'), body=document.getElementById('modalBody'), title=document.getElementById('modalTitle');
  modal.classList.add('open','fs'); document.body.style.overflow='hidden'; requestFullscreen();
  const game=JUEGOS_EXTRA_ONLINE.find(x=>x.id===id)||JUEGOS_EXTRA_ONLINE[0];
  title.textContent=game.emoji+' '+game.name;
  body.innerHTML = hgMissionPanel(id, game.name, 'Juega con un amigo. Al ganar 5 niveles recibes una recompensa final.') + `<div id="extraGameBox"></div>`;
  buildExtraOnlineGame(document.getElementById('extraGameBox'), game);
}
if (typeof buildTorre === "function") window.buildTorre = buildTorre;
