function buildDungeon(container) {
  const SIZE=9, CELL=Math.min(38, Math.floor((Math.min(window.innerWidth-60, maxGameHeight()-30))/SIZE));
  const W=SIZE*CELL, H=SIZE*CELL;
  container.innerHTML = `
    <div class="game-container">
      <div style="padding:12px;background:#0a0a14;display:flex;justify-content:space-between;align-items:center;color:#fff">
        <span style="font-weight:800">🗝️ <span id="dgKeys">0</span>/<span id="dgKeyTotal">3</span></span>
        <span style="font-weight:800">🏆 Nv <span id="dgLevel">1</span></span>
        <span style="font-weight:800">❤️ <span id="dgLives">3</span></span>
        <button onclick="window.dgReset()" style="background:#7C3AED;border:none;color:white;padding:6px 12px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Nuevo</button>
      </div>
      <div class="game-canvas-wrap" style="min-height:${H}px"><canvas id="dgGame" width="${W}" height="${H}"></canvas></div>
    </div>
    <div class="game-instructions"><strong>Misión:</strong> Mueve a 🧙 con las flechas. Junta las 🗝️ y abre la 🚪. ¡Evita los 👹! Cada nivel hay más monstruos.</div>`;
  const canvas=document.getElementById('dgGame'), ctx=canvas.getContext('2d');
  let player, walls, keysArr, monsters, door, keysGot, lives, level, keyTotal, running;
  function buildLevel(){
    player={x:0,y:0}; keysGot=0;
    keyTotal=Math.min(5, 2+level); // más llaves cada nivel
    walls=new Set(); keysArr=[]; monsters=[];
    for(let i=0;i<14;i++){ const x=Math.floor(Math.random()*SIZE),y=Math.floor(Math.random()*SIZE); if((x===0&&y===0)||(x===SIZE-1&&y===SIZE-1)) continue; walls.add(x+','+y); }
    const free=()=>{ let x,y,k,t=0; do{ x=Math.floor(Math.random()*SIZE); y=Math.floor(Math.random()*SIZE); k=x+','+y; t++; }while((walls.has(k)||(x===0&&y===0))&&t<200); return {x,y}; };
    for(let i=0;i<keyTotal;i++) keysArr.push(free());
    const nMon=Math.min(7, 2+level); // más monstruos cada nivel
    for(let i=0;i<nMon;i++){ const m=free(); m.dir=Math.random()<0.5?'h':'v'; monsters.push(m); }
    door={x:SIZE-1,y:SIZE-1};
    setText('dgKeys',0); setText('dgKeyTotal',keyTotal); setText('dgLevel',level); setText('dgLives',lives);
    running=true; draw();
  }
  function reset(){ lives=3; level=1; buildLevel(); }
  function moveMonsters(){
    if(!running) return;
    monsters.forEach(m=>{
      const opts = m.dir==='h'?[[1,0],[-1,0]]:[[0,1],[0,-1]];
      const [dx,dy]=opts[Math.floor(Math.random()*2)];
      const nx=m.x+dx, ny=m.y+dy;
      if(nx>=0&&nx<SIZE&&ny>=0&&ny<SIZE&&!walls.has(nx+','+ny)){ m.x=nx; m.y=ny; }
    });
    checkMonster();
  }
  function checkMonster(){
    if(monsters.some(m=>m.x===player.x&&m.y===player.y)){
      lives--; setText('dgLives',lives);
      if(lives<=0){ running=false; SFX.hit(); showToast('👹 ¡Te atraparon! Inténtalo de nuevo'); setTimeout(reset,700); return; }
      player={x:0,y:0};
    }
  }
  function move(dir){
    if(!running) return;
    const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir]; if(!d) return;
    const nx=player.x+d[0], ny=player.y+d[1];
    if(nx<0||nx>=SIZE||ny<0||ny>=SIZE||walls.has(nx+','+ny)) return;
    player.x=nx; player.y=ny;
    const ki=keysArr.findIndex(k=>k.x===nx&&k.y===ny);
    if(ki>=0){ keysArr.splice(ki,1); keysGot++; setText('dgKeys',keysGot); SFX.coin(); }
    if(nx===door.x&&ny===door.y){ if(keysGot>=keyTotal){ running=false; level++; awardBadge('explorer'); awardBadge('first_win'); showLevelScreen(level, buildLevel, '¡Más monstruos y llaves!'); return; } else showToast('🔒 Te faltan '+(keyTotal-keysGot)+' llaves'); }
    checkMonster(); moveMonsters(); draw();
  }
  function draw(){
    if(!document.getElementById('dgGame')) return;
    ctx.fillStyle='#1a1020'; ctx.fillRect(0,0,W,H);
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){ ctx.fillStyle=(x+y)%2?'#241830':'#1f1428'; ctx.fillRect(x*CELL,y*CELL,CELL,CELL); }
    ctx.font=`${CELL-8}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    walls.forEach(w=>{ const [x,y]=w.split(',').map(Number); ctx.fillStyle='#4a3060'; ctx.fillRect(x*CELL+2,y*CELL+2,CELL-4,CELL-4); ctx.fillStyle='#fff'; ctx.fillText('🧱',x*CELL+CELL/2,y*CELL+CELL/2); });
    ctx.fillText(keysGot>=3?'🚪':'🔒',door.x*CELL+CELL/2,door.y*CELL+CELL/2);
    keysArr.forEach(k=>ctx.fillText('🗝️',k.x*CELL+CELL/2,k.y*CELL+CELL/2));
    monsters.forEach(m=>ctx.fillText('👹',m.x*CELL+CELL/2,m.y*CELL+CELL/2));
    ctx.fillText('🧙',player.x*CELL+CELL/2,player.y*CELL+CELL/2);
  }
  function keyHandler(e){ const k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key]; if(k){move(k);e.preventDefault();} }
  document.addEventListener('keydown',keyHandler); window.activeKeyHandlers.push(keyHandler);
  window.dgReset=reset;
  container.querySelector('.game-container').appendChild(makeDPad(move));
  reset();
}

// ══════════════════════════════════════════════════════════
//  JUEGOS EDUCATIVOS (currículo escolar)
// ══════════════════════════════════════════════════════════
// Banco de preguntas por materia. Cada materia tiene niveles (arrays).
const EDU_DATA = {
  regiones: {
    icon: '🗺️',
    levels: [
      [
        {q:'¿Cuál es la capital del Perú?',o:['Lima','Cusco','Arequipa','Trujillo'],a:0},
        {q:'¿En qué región está Machu Picchu?',o:['Cusco','Puno','Ica','Loreto'],a:0},
        {q:'¿Qué región es famosa por el lago Titicaca?',o:['Puno','Tacna','Piura','Áncash'],a:0},
        {q:'¿Cuántas regiones naturales tiene el Perú?',o:['2','3','4','5'],a:1},
        {q:'¿Cuáles son las 3 regiones naturales?',o:['Costa, Sierra y Selva','Norte, Centro, Sur','Mar, Río, Lago','Este, Oeste, Centro'],a:0},
      ],
      [
        {q:'¿Qué región produce más café?',o:['Junín','Lima','Tacna','Ica'],a:0},
        {q:'La ciudad blanca del Perú es:',o:['Arequipa','Cusco','Trujillo','Iquitos'],a:0},
        {q:'¿Qué río es el más largo del Perú?',o:['Amazonas','Rímac','Ucayali','Marañón'],a:0},
        {q:'Las Líneas de Nazca están en:',o:['Ica','Lima','Tacna','Puno'],a:0},
        {q:'¿Cuál es la región más grande del Perú?',o:['Loreto','Lima','Cusco','Puno'],a:0},
      ],
    ],
  },
  patrios: {
    icon: '🇵🇪',
    levels: [
      [
        {q:'¿De qué colores es la bandera del Perú?',o:['Rojo y blanco','Azul y blanco','Verde y rojo','Amarillo y rojo'],a:0},
        {q:'¿Qué animal aparece en el escudo del Perú?',o:['Vicuña','Cóndor','Llama','Puma'],a:0},
        {q:'¿Cómo se llama el himno?',o:['Himno Nacional del Perú','La Marsellesa','Marcha Real','Himno de la Alegría'],a:0},
        {q:'El árbol del escudo del Perú es la:',o:['Quina','Palmera','Ceiba','Caoba'],a:0},
        {q:'¿Qué hay en el escudo además de la vicuña y el árbol?',o:['Cornucopia con monedas','Un sol','Una espada','Un barco'],a:0},
      ],
      [
        {q:'¿Quién creó la primera bandera del Perú?',o:['San Martín','Bolívar','Grau','Cáceres'],a:0},
        {q:'¿En qué año se proclamó la independencia?',o:['1821','1810','1830','1900'],a:0},
        {q:'¿Quién compuso la música del himno?',o:['José Bernardo Alcedo','José de la Torre','Ricardo Palma','Abelardo Gamarra'],a:0},
        {q:'La escarapela del Perú es de color:',o:['Rojo y blanco','Azul y blanco','Verde y blanco','Solo rojo'],a:0},
        {q:'¿Qué flor es nacional del Perú?',o:['La cantuta','La rosa','El girasol','El tulipán'],a:0},
      ],
    ],
  },
  solar: {
    icon: '🪐',
    levels: [
      [
        {q:'¿Cuál es el planeta más grande?',o:['Júpiter','Tierra','Marte','Saturno'],a:0},
        {q:'¿Qué planeta tiene anillos famosos?',o:['Saturno','Mercurio','Venus','Tierra'],a:0},
        {q:'¿En qué planeta vivimos?',o:['Tierra','Marte','Luna','Venus'],a:0},
        {q:'¿Cuál es la estrella del sistema solar?',o:['El Sol','La Luna','Marte','Polaris'],a:0},
        {q:'¿Qué planeta es conocido como el planeta rojo?',o:['Marte','Júpiter','Venus','Neptuno'],a:0},
      ],
      [
        {q:'¿Cuántos planetas tiene el sistema solar?',o:['8','9','7','10'],a:0},
        {q:'¿Cuál es el planeta más cercano al Sol?',o:['Mercurio','Venus','Tierra','Marte'],a:0},
        {q:'¿Qué satélite tiene la Tierra?',o:['La Luna','Fobos','Titán','Europa'],a:0},
        {q:'¿Cuál es el planeta más lejano del Sol?',o:['Neptuno','Plutón','Urano','Saturno'],a:0},
        {q:'¿Qué planeta es el más caliente?',o:['Venus','Mercurio','Marte','Júpiter'],a:0},
      ],
    ],
  },
  cuerpo: {
    icon: '🫀',
    levels: [
      [
        {q:'¿Qué órgano bombea la sangre?',o:['El corazón','El pulmón','El hígado','El riñón'],a:0},
        {q:'¿Con qué órgano respiramos?',o:['Los pulmones','El estómago','El cerebro','La piel'],a:0},
        {q:'¿Cuántos sentidos tiene el ser humano?',o:['5','3','4','6'],a:0},
        {q:'¿Qué órgano usamos para pensar?',o:['El cerebro','El corazón','El hígado','El pulmón'],a:0},
        {q:'¿Qué huesos protegen el corazón?',o:['Las costillas','El cráneo','La cadera','El fémur'],a:0},
      ],
      [
        {q:'¿Cuántos huesos tiene un adulto aprox.?',o:['206','100','300','150'],a:0},
        {q:'¿Qué órgano limpia la sangre?',o:['Los riñones','El corazón','El cerebro','El ojo'],a:0},
        {q:'¿Dónde se digiere la comida?',o:['El estómago','El pulmón','El corazón','El oído'],a:0},
        {q:'¿Qué parte del cuerpo nos da equilibrio?',o:['El oído','La nariz','El codo','La rodilla'],a:0},
        {q:'¿Qué sistema incluye huesos y músculos?',o:['Locomotor','Digestivo','Nervioso','Respiratorio'],a:0},
      ],
    ],
  },
  figuras: {
    icon: '🔷',
    levels: [
      [
        {q:'¿Cuántos lados tiene un triángulo?',o:['3','4','5','6'],a:0},
        {q:'¿Cuántos lados tiene un cuadrado?',o:['4','3','5','6'],a:0},
        {q:'¿Qué color sale de mezclar azul y amarillo?',o:['Verde','Naranja','Morado','Rosa'],a:0},
        {q:'¿Qué figura es totalmente redonda?',o:['Círculo','Cuadrado','Triángulo','Rombo'],a:0},
        {q:'¿Qué color sale de rojo y amarillo?',o:['Naranja','Verde','Morado','Café'],a:0},
      ],
      [
        {q:'¿Cuántos lados tiene un pentágono?',o:['5','6','4','7'],a:0},
        {q:'¿Cuántos lados tiene un hexágono?',o:['6','5','7','8'],a:0},
        {q:'¿Qué color sale de rojo y azul?',o:['Morado','Verde','Naranja','Gris'],a:0},
        {q:'Una figura de 8 lados se llama:',o:['Octágono','Hexágono','Pentágono','Rombo'],a:0},
        {q:'¿Cuáles son los colores primarios?',o:['Rojo, azul y amarillo','Verde, naranja, morado','Blanco y negro','Rosa y celeste'],a:0},
      ],
    ],
  },
};

// Baraja un arreglo de forma pareja (Fisher-Yates) — mezcla de verdad
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Genera preguntas de matemáticas según nivel
function genMathQuestions(type, level) {
  const qs = [];
  for (let i = 0; i < 5; i++) {
    if (type === 'sumas') {
      const max = level === 1 ? 10 : (level === 2 ? 25 : 50);
      const a = Math.floor(Math.random()*max)+1, b = Math.floor(Math.random()*max)+1;
      const isSum = Math.random() < 0.5 || a < b;
      const sign = isSum ? '+' : '−';
      const big = isSum ? a : Math.max(a,b), small = isSum ? b : Math.min(a,b);
      const ans = isSum ? big+small : big-small;
      let opts = [ans];
      while (opts.length < 4) { const o = ans + (Math.floor(Math.random()*9)-4); if (o>=0 && !opts.includes(o)) opts.push(o); }
      opts = shuffle(opts);
      qs.push({ q:`${big} ${sign} ${small} = ?`, o:opts.map(String), a:opts.indexOf(ans) });
    } else { // tablas
      const tabla = level + 1; // nivel 1 = tabla del 2, etc.
      const b = Math.floor(Math.random()*9)+1;
      const ans = tabla*b;
      let opts=[ans];
      while(opts.length<4){ const o=tabla*(Math.floor(Math.random()*9)+1); if(!opts.includes(o)) opts.push(o); }
      opts = shuffle(opts);
      qs.push({ q:`${tabla} × ${b} = ?`, o:opts.map(String), a:opts.indexOf(ans) });
    }
  }
  return qs;
}

// Motor de quiz educativo con niveles
