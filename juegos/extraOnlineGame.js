function buildExtraOnlineGame(root, game){
  // Versión corregida: estos juegos ya no son solo una imagen estática.
  // Funcionan por turnos y sincronizan el estado por la misma sala online de Supabase.
  if (!root) return;
  if (!onlineDisponible()) {
    root.innerHTML = `<div class="game-container" style="background:#0a0a14;padding:30px;text-align:center;color:#fff">
      <div style="font-size:2.5rem">📡</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;margin:10px 0">Sin conexión online</div>
      <div style="color:#aaa">Revisa Supabase o tu conexión a internet.</div>
    </div>`;
    return;
  }

  let salaExtra = '';
  let rivalInfoExtra = null;
  let state = null;
  let recompensaMostrada = false;
  const safe = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const gameTitle = () => (game && (game.name || game.title)) || 'Juego online';
  const miRol = () => soyAnfitrion ? 'A' : 'B';
  const otroRol = () => soyAnfitrion ? 'B' : 'A';
  const nombreRol = (r) => r === miRol() ? 'Tú' : 'Tu amigo';
  const rolColor = (r) => r === 'A' ? '#00B4D8' : '#FF4D9D';
  const nextTurn = (r) => r === 'A' ? 'B' : 'A';

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function rnd(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function preguntaMate(){
    const lv = Math.max(1, Number(hgNivelActual ? hgNivelActual(game.id) : 1));
    const a = rnd(1, 6 + lv*3), b = rnd(1, 6 + lv*3);
    const ans = a + b;
    const opts = shuffle([ans, ans+rnd(1,4), Math.max(0, ans-rnd(1,4)), ans+rnd(5,8)]).slice(0,4);
    if(!opts.includes(ans)) opts[0]=ans;
    return {txt:`${a} + ${b} = ?`, ans, opts:shuffle(opts)};
  }
  function preguntaPiramide(){
    const lv = Math.max(1, Number(hgNivelActual ? hgNivelActual(game.id) : 1));
    const a = rnd(1,5+lv), b = rnd(1,5+lv), c = rnd(1,5+lv);
    const x = a+b, y = b+c, top = x+y;
    const ask = shuffle([{txt:`${a} + ${b}`, ans:x},{txt:`${b} + ${c}`, ans:y},{txt:`${x} + ${y}`, ans:top}])[0];
    const opts = shuffle([ask.ans, ask.ans+rnd(1,3), Math.max(0, ask.ans-rnd(1,3)), ask.ans+rnd(4,6)]);
    return {base:[a,b,c], middle:[x,y], top, txt:`Pirámide: ¿cuánto vale ${ask.txt}?`, ans:ask.ans, opts};
  }
  function initialState(){
    const id = game.id;
    const base = { id, turn:'A', scores:{A:0,B:0}, round:1, msg:'Empieza el Jugador A', done:false, winner:null, match:Date.now() };
    if(id === 'memoriaonline'){
      const icons = ['🍎','⭐','🚀','🐶','🎲','💎','⚽','🦄'];
      return {...base, cards:shuffle([...icons,...icons]).map((v,i)=>({id:i,v,done:false})), flipped:[], msg:'Encuentra pares por turnos'};
    }
    if(id === 'carreraonline') return {...base, pos:{A:0,B:0}, meta:30, msg:'Tira el dado y llega primero a la meta'};
    if(id === 'cartasonline') return {...base, draws:{}, msg:'Cada jugador saca una carta; gana la carta mayor'};
    if(id === 'futbolonline') return {...base, target:5, msg:'Elige dónde patear. Si el arquero no adivina, es gol'};
    if(id === 'matematicasduelo' || id === 'quizonline') return {...base, q:preguntaMate(), msg:'Responde la pregunta de tu turno'};
    if(id === 'piramideonline') return {...base, q:preguntaPiramide(), msg:'Completa la pirámide matemática'};
    if(id === 'piedrapapelonline') return {...base, picks:{}, msg:'Elige piedra, papel o tijera'};
    if(id === 'tesoroonline') return {...base, boxes:shuffle(['💎','💎','🪙','🪙','💣','🕳️','⭐','🎁']), opened:[], msg:'Abre un cofre por turno'};
    return {...base, energy:{A:10,B:10}, msg:'Juega por turnos usando acción, defensa o poder'};
  }
  function myName(){ try { return miIdentidadOnline(); } catch(e){ return {name:'Yo',emoji:'👤'}; } }
  function peerName(){ return rivalInfoExtra || {name:'Amigo',emoji:'👤'}; }
  function sendState(){ try{ enviarMovimientoOnline({tipo:'extra_state_v6', gameId:game.id, state}); }catch(e){} }
  function sendNeedState(){ try{ enviarMovimientoOnline({tipo:'extra_need_state_v6', gameId:game.id}); }catch(e){} }
  function setMsg(m){ if(state) state.msg = m; }
  function isMyTurn(){ return state && !state.done && state.turn === miRol(); }
  function maybeReward(){
    if(!state || !state.done || recompensaMostrada) return;
    if(state.winner !== miRol()) return;
    recompensaMostrada = true;
    const key = 'hg_reward_' + game.id + '_' + salaExtra + '_' + state.match;
    try{ if(localStorage.getItem(key)) return; localStorage.setItem(key,'1'); }catch(e){}
    try{ hgCompletarNivel(game.id, gameTitle(), 10, 25); }catch(e){}
  }
  function finishIfNeeded(limit=5){
    if(state.scores.A >= limit || state.scores.B >= limit){
      state.done = true;
      state.winner = state.scores.A > state.scores.B ? 'A' : 'B';
      state.msg = (state.winner === miRol() ? '🏆 ¡Ganaste!' : '😮 Ganó tu amigo') + ' Puedes pedir revancha.';
    }
  }
  function nuevaPartida(){ state = initialState(); recompensaMostrada = false; renderGame(); sendState(); }

  function commonTop(){
    const yo = myName(), riv = peerName();
    const myR = miRol(), opR = otroRol();
    return `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin-bottom:10px">
      <div style="text-align:center"><div style="font-size:1.8rem">${safe(yo.emoji)}</div><b style="color:${rolColor(myR)}">${safe(yo.name)} (${myR})</b><div style="font-size:.75rem;color:#ccc">Puntos: ${state?.scores?.[myR]||0}</div></div>
      <div style="font-family:'Fredoka One',cursive;color:#FFD600">VS</div>
      <div style="text-align:center"><div style="font-size:1.8rem">${safe(riv.emoji)}</div><b style="color:${rolColor(opR)}">${safe(riv.name||'Amigo')} (${opR})</b><div style="font-size:.75rem;color:#ccc">Puntos: ${state?.scores?.[opR]||0}</div></div>
    </div>`;
  }
  function chatHTML(){
    return `<div style="margin-top:12px">
      <div id="extraChat" style="height:70px;overflow:auto;background:#10101c;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px;margin-bottom:6px;font-size:.82rem;color:white"></div>
      <div style="display:flex;gap:6px"><input id="extraChatInput" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="120" placeholder="Mensaje..." style="flex:1;min-width:0;background:#1a1a2e;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:9px;color:white;font-family:Nunito,sans-serif;outline:none"><button id="extraChatSend" style="background:#16A34A;color:white;border:0;border-radius:12px;padding:0 14px;font-weight:900;cursor:pointer">➤</button></div>
    </div>`;
  }
  function bindChat(){
    window._chatRenderer = function(nombre,texto,emoji){
      const box = document.getElementById('extraChat'); if(!box) return;
      const d=document.createElement('div'); d.innerHTML = `<b>${safe(emoji||'👤')} ${safe(nombre)}:</b> ${safe(texto)}`; box.appendChild(d); box.scrollTop=box.scrollHeight;
    };
    const btn=document.getElementById('extraChatSend'), inp=document.getElementById('extraChatInput');
    const send=()=>{ if(!inp || !inp.value.trim()) return; const res=typeof filtrarMensaje==='function'?filtrarMensaje(inp.value):{ok:true,texto:inp.value}; if(!res.ok){showToast(res.motivo||'Mensaje no permitido');return;} const txt=res.texto; inp.value=''; enviarChatOnline(txt); };
    if(btn) btn.onclick=send;
    if(inp) inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); send(); } };
  }
  function actionsDisabled(){ return !isMyTurn() ? 'disabled style="opacity:.45;cursor:not-allowed"' : ''; }
  function btn(label, action, extra='') { return `<button data-action="${action}" ${actionsDisabled()} style="background:linear-gradient(135deg,#7C3AED,#FF4D9D);color:white;border:0;border-radius:14px;padding:12px 14px;font-family:Nunito,sans-serif;font-weight:900;cursor:pointer;${extra}">${label}</button>`; }

  function renderSpecific(){
    const id = game.id;
    if(id === 'futbolonline'){
      return `<div style="font-size:3rem;margin:8px">⚽🥅</div><p style="color:#d9d3ff">${safe(state.msg)}</p><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${btn('⬅️ Izquierda','shot-L')}${btn('⬆️ Centro','shot-C')}${btn('➡️ Derecha','shot-R')}</div><div style="font-size:.8rem;color:#aaa;margin-top:8px">Meta: primero en llegar a ${state.target} goles.</div>`;
    }
    if(id === 'memoriaonline'){
      return `<p style="color:#d9d3ff;text-align:center">${safe(state.msg)}</p><div style="display:grid;grid-template-columns:repeat(4,minmax(54px,86px));gap:8px;justify-content:center">${state.cards.map((c,i)=>{
        const show = c.done || state.flipped.includes(i);
        return `<button data-card="${i}" ${(!isMyTurn()||c.done||state.flipped.includes(i)||state.flipped.length>=2)?'disabled':''} style="height:70px;background:${show?'#7C3AED':'#1a1a2e'};border:2px solid #4c1d95;border-radius:14px;color:white;font-size:1.8rem;font-weight:900;cursor:pointer;opacity:${(!isMyTurn()&&!show)?'.75':'1'}">${show?c.v:'❓'}</button>`;
      }).join('')}</div>`;
    }
    if(id === 'carreraonline'){
      const pctA=Math.min(100,Math.round((state.pos.A/state.meta)*100)); const pctB=Math.min(100,Math.round((state.pos.B/state.meta)*100));
      return `<p style="color:#d9d3ff;text-align:center">${safe(state.msg)}</p><div style="max-width:560px;margin:0 auto 12px"><div style="color:#00B4D8;font-weight:900">A 🏎️ ${state.pos.A}/${state.meta}</div><div style="background:#222;border-radius:12px;overflow:hidden;height:22px;margin-bottom:8px"><div style="width:${pctA}%;height:100%;background:#00B4D8"></div></div><div style="color:#FF4D9D;font-weight:900">B 🏁 ${state.pos.B}/${state.meta}</div><div style="background:#222;border-radius:12px;overflow:hidden;height:22px"><div style="width:${pctB}%;height:100%;background:#FF4D9D"></div></div></div><div style="text-align:center">${btn('🎲 Tirar dado','dice')}</div>`;
    }
    if(id === 'cartasonline'){
      return `<p style="color:#d9d3ff;text-align:center">${safe(state.msg)}</p><div style="display:flex;justify-content:center;gap:18px;margin:16px"><div style="font-size:4rem;background:#1a1a2e;border-radius:16px;padding:18px">${state.draws.A||'🂠'}</div><div style="font-size:4rem;background:#1a1a2e;border-radius:16px;padding:18px">${state.draws.B||'🂠'}</div></div><div style="text-align:center">${btn('🃏 Sacar carta','card')}</div>`;
    }
    if(id === 'matematicasduelo' || id === 'quizonline' || id === 'piramideonline'){
      const q = state.q || preguntaMate();
      const pir = id === 'piramideonline' && q.base ? `<div style="font-size:1.4rem;margin:8px auto;color:#FFD600">🔺 ${q.top}<br>🔹 ${q.middle[0]} &nbsp;&nbsp; ${q.middle[1]}<br>▫️ ${q.base.join('  ')}</div>` : '';
      return `<div style="text-align:center"><div style="font-size:2.5rem">${id==='piramideonline'?'🔺':'➕'}</div>${pir}<h2 style="color:white">${safe(q.txt)}</h2><p style="color:#d9d3ff">${safe(state.msg)}</p><div style="display:grid;grid-template-columns:repeat(2,minmax(90px,160px));gap:8px;justify-content:center">${q.opts.map(o=>btn(String(o),'answer-'+o)).join('')}</div></div>`;
    }
    if(id === 'piedrapapelonline'){
      return `<p style="color:#d9d3ff;text-align:center">${safe(state.msg)}</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${btn('✊ Piedra','rps-rock')}${btn('✋ Papel','rps-paper')}${btn('✌️ Tijera','rps-scissors')}</div><div style="font-size:.85rem;color:#aaa;margin-top:10px;text-align:center">Cuando ambos elijan, se muestra el ganador de la ronda.</div>`;
    }
    if(id === 'tesoroonline'){
      return `<p style="color:#d9d3ff;text-align:center">${safe(state.msg)}</p><div style="display:grid;grid-template-columns:repeat(4,minmax(58px,88px));gap:8px;justify-content:center">${state.boxes.map((x,i)=>`<button data-box="${i}" ${(!isMyTurn()||state.opened.includes(i))?'disabled':''} style="height:68px;background:#1a1a2e;border:2px solid #4c1d95;border-radius:14px;color:white;font-size:1.9rem;cursor:pointer;opacity:${state.opened.includes(i)?'.6':'1'}">${state.opened.includes(i)?x:'🎁'}</button>`).join('')}</div>`;
    }
    return `<p style="color:#d9d3ff;text-align:center">${safe(state.msg)}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:420px;margin:0 auto 12px"><div style="background:#15152a;border-radius:14px;padding:12px;text-align:center"><b>A</b><div style="font-size:1.7rem;color:#00B4D8">❤️ ${state.energy.A}</div></div><div style="background:#15152a;border-radius:14px;padding:12px;text-align:center"><b>B</b><div style="font-size:1.7rem;color:#FF4D9D">❤️ ${state.energy.B}</div></div></div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${btn('⚔️ Acción','generic-hit')}${btn('🛡️ Defensa','generic-def')}${btn('✨ Poder','generic-power')}</div>`;
  }

  function renderGame(){
    if(!state) state = initialState();
    const turnoTexto = state.done ? 'Partida terminada' : (state.turn === miRol() ? '✅ Tu turno' : '⏳ Turno de tu amigo');
    root.innerHTML = `<div class="game-container" style="background:#0a0a14;color:white;border-radius:20px;padding:16px;min-height:430px">
      ${commonTop()}
      <div style="text-align:center;background:#15152a;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:10px;margin-bottom:12px"><b>${safe(gameTitle())}</b> · Nivel ${hgNivelActual ? hgNivelActual(game.id) : 1}/5<br><span style="color:${state.turn===miRol()?'#16A34A':'#FFD600'}">${turnoTexto}</span></div>
      <div id="extraPlayArea">${renderSpecific()}</div>
      ${state.done ? `<div style="text-align:center;margin-top:12px"><button id="extraRematch" style="background:#7C3AED;color:white;border:0;border-radius:16px;padding:12px 22px;font-weight:900;cursor:pointer">🔁 Revancha</button></div>` : ''}
      ${chatHTML()}
    </div>
    <div class="game-instructions"><strong>Ahora sí se puede jugar:</strong> cada botón ejecuta una acción y se sincroniza con el otro jugador de la sala.</div>`;
    bindActions(); bindChat(); maybeReward();
  }

  function bindActions(){
    root.querySelectorAll('[data-action]').forEach(b => b.onclick = () => handleAction(b.dataset.action));
    root.querySelectorAll('[data-card]').forEach(b => b.onclick = () => flipCard(Number(b.dataset.card)));
    root.querySelectorAll('[data-box]').forEach(b => b.onclick = () => openBox(Number(b.dataset.box)));
    const rem = document.getElementById('extraRematch'); if(rem) rem.onclick = nuevaPartida;
  }
  function handleAction(action){
    if(!isMyTurn()) { showToast('⏳ Espera tu turno'); return; }
    const r = miRol();
    if(action.startsWith('shot-')){
      const dir = action.split('-')[1], save = ['L','C','R'][rnd(0,2)];
      if(dir !== save){ state.scores[r]++; state.msg = `⚽ ¡Gol! Pateaste ${dir} y el arquero fue a ${save}.`; }
      else state.msg = `🧤 Atajada. Ambos eligieron ${dir}.`;
      state.turn = nextTurn(r); finishIfNeeded(state.target || 5);
    } else if(action === 'dice'){
      const d = rnd(1,6); state.pos[r] += d; state.scores[r] = state.pos[r]; state.msg = `${nombreRol(r)} sacó ${d}.`;
      if(state.pos[r] >= state.meta){ state.done=true; state.winner=r; state.msg = `${nombreRol(r)} llegó a la meta 🏁`; }
      else state.turn = nextTurn(r);
    } else if(action === 'card'){
      const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
      const card = vals[rnd(0,12)]; state.draws[r]=card;
      const val = vals.indexOf(card)+1;
      if(state.draws.A && state.draws.B){
        const va = vals.indexOf(state.draws.A)+1, vb = vals.indexOf(state.draws.B)+1;
        if(va>vb){state.scores.A++; state.msg='Gana la ronda A';}
        else if(vb>va){state.scores.B++; state.msg='Gana la ronda B';}
        else state.msg='Empate de cartas';
        state.draws={}; state.round++; state.turn = state.round % 2 ? 'A' : 'B'; finishIfNeeded(5);
      } else { state.msg = `${nombreRol(r)} sacó carta. Falta el otro.`; state.turn=nextTurn(r); }
    } else if(action.startsWith('answer-')){
      const ans = Number(action.replace('answer-',''));
      if(ans === Number(state.q.ans)){ state.scores[r]++; state.msg = `✅ Correcto. ${nombreRol(r)} suma punto.`; }
      else state.msg = `❌ Era ${state.q.ans}.`;
      state.q = game.id === 'piramideonline' ? preguntaPiramide() : preguntaMate();
      state.turn = nextTurn(r); finishIfNeeded(5);
    } else if(action.startsWith('rps-')){
      const pick = action.replace('rps-',''); state.picks[r]=pick;
      if(state.picks.A && state.picks.B){
        const a=state.picks.A,b=state.picks.B; let win=null;
        if(a!==b){ if((a==='rock'&&b==='scissors')||(a==='paper'&&b==='rock')||(a==='scissors'&&b==='paper')) win='A'; else win='B'; }
        if(win){ state.scores[win]++; state.msg = `Resultado: A eligió ${a}, B eligió ${b}. Gana ${win}.`; }
        else state.msg = `Empate: ambos eligieron ${a}.`;
        state.picks={}; state.turn = nextTurn(state.turn); finishIfNeeded(5);
      } else { state.msg = `${nombreRol(r)} ya eligió. Falta el otro.`; state.turn = nextTurn(r); }
    } else if(action.startsWith('generic-')){
      const op = nextTurn(r); let dmg=0;
      if(action==='generic-hit') dmg=rnd(1,3);
      if(action==='generic-def') { state.energy[r]=Math.min(12,state.energy[r]+1); state.msg=`${nombreRol(r)} se defendió y recuperó energía.`; }
      if(action==='generic-power') dmg=rnd(2,5);
      if(dmg){ state.energy[op]-=dmg; state.scores[r]+=dmg; state.msg=`${nombreRol(r)} hizo ${dmg} de fuerza.`; }
      if(state.energy[op] <= 0){ state.done=true; state.winner=r; state.msg=`🏆 ${nombreRol(r)} ganó el duelo.`; }
      else state.turn=op;
    }
    renderGame(); sendState();
  }
  function flipCard(i){
    if(!isMyTurn()) return;
    const c=state.cards[i]; if(!c || c.done || state.flipped.includes(i) || state.flipped.length>=2) return;
    state.flipped.push(i);
    if(state.flipped.length===2){
      const [a,b]=state.flipped;
      if(state.cards[a].v===state.cards[b].v){ state.cards[a].done=state.cards[b].done=true; state.scores[miRol()]++; state.msg='✅ Par encontrado. Sigues jugando.'; state.flipped=[]; finishIfNeeded(8); renderGame(); sendState(); }
      else { state.msg='❌ No es par. Cambia el turno.'; renderGame(); sendState(); setTimeout(()=>{ if(state && state.flipped.length===2){ state.flipped=[]; state.turn=nextTurn(state.turn); renderGame(); sendState(); } },900); }
    } else { state.msg='Elige otra carta.'; renderGame(); sendState(); }
  }
  function openBox(i){
    if(!isMyTurn()) return;
    if(state.opened.includes(i)) return;
    state.opened.push(i); const x=state.boxes[i], r=miRol();
    if(x==='💣' || x==='🕳️'){ state.scores[r]=Math.max(0,state.scores[r]-1); state.msg='😬 Trampa. Pierdes un punto.'; }
    else { const pts = x==='💎'?2:1; state.scores[r]+=pts; state.msg=`${x} Cofre abierto: +${pts}.`; }
    state.turn=nextTurn(r); finishIfNeeded(6); renderGame(); sendState();
  }

  function handleMove(payload){
    if(!payload || payload.gameId !== game.id) return;
    if(payload.tipo === 'extra_state_v6' && payload.state){ state = payload.state; renderGame(); }
    if(payload.tipo === 'extra_need_state_v6' && soyAnfitrion){ sendState(); }
  }
  function start(codigo, esHost){
    salaExtra = codigo; recompensaMostrada=false; state = initialState();
    onMovimientoOnline = handleMove;
    onRivalConectado = (info) => { rivalInfoExtra = info || rivalInfoExtra; if(soyAnfitrion) sendState(); renderGame(); };
    onRivalSalio = () => { try{ showToast('👋 Tu amigo salió del juego'); }catch(e){} if(state){ state.msg='👋 Tu amigo salió. Te quedaste solo en la partida.'; renderGame(); } };
    renderGame();
    conectarSala(codigo, esHost);
    setTimeout(sendNeedState, 900);
    setTimeout(sendNeedState, 2000);
  }
  function renderLobby(){
    const codigo = generarCodigoSala();
    root.innerHTML = `<div class="game-container" style="background:#0a0a14;color:white;border-radius:20px;padding:22px;min-height:360px;text-align:center">
      <div style="font-size:3rem">${safe(game.emoji||'🎮')}</div><h2 style="font-family:'Fredoka One',cursive">${safe(gameTitle())}</h2>
      <p style="color:#d9d3ff">Crea una sala o únete con un código. También puedes llegar aquí desde una invitación aceptada.</p>
      <button id="extraCrear" class="btn-primary" style="margin:8px">➕ Crear sala</button>
      <div style="margin:10px;color:#aaa">— o —</div>
      <input id="extraCodigo" value="" maxlength="10" placeholder="Código de sala" style="background:#1a1a2e;border:2px solid rgba(255,255,255,.15);border-radius:14px;color:white;padding:12px;text-align:center;text-transform:uppercase;font-weight:900;outline:none">
      <button id="extraUnir" class="btn-primary" style="margin:8px;background:linear-gradient(135deg,#16A34A,#06b6d4)">🔗 Unirse</button>
      <div class="game-instructions" style="background:#15152a;color:#ddd;margin-top:14px">Si vienes desde el chat de amigos, no necesitas copiar código: ambos entran automáticamente.</div>
    </div>`;
    document.getElementById('extraCrear').onclick=()=>start(codigo,true);
    document.getElementById('extraUnir').onclick=()=>{ const v=(document.getElementById('extraCodigo').value||'').toUpperCase().trim(); if(v.length<4){showToast('Escribe un código válido');return;} start(v,false); };
  }

  let auto = null;
  try { if (typeof _autoSala !== 'undefined' && _autoSala) { auto = _autoSala; _autoSala = null; } } catch(e) {}
  if(auto) start(auto.sala, auto.esAnfitrion);
  else renderLobby();
}

// Panel de misión también para juegos existentes: no cambia el juego, pero da una finalidad visible.
const _hgOriginalOpenGame = typeof openGame === 'function' ? openGame : null;
if(_hgOriginalOpenGame){
  openGame = function(id){
    _hgOriginalOpenGame(id);
    setTimeout(()=>{
      const body=document.getElementById('modalBody'); if(!body || body.querySelector('.hg-existing-mission')) return;
      const nombres={snake:'Snake Pro',breakout:'Breakout Blast',memory:'Memory Flip',maze:'Maze Escape',racing:'Speed Racer',pong:'Pong Battle',tictactoe:'Tres en Raya',flappy:'Flappy Bird',catch:'Atrapa Frutas',jump:'Salta y Sube',simon:'Simón Dice','2048':'2048',quiz:'Quiz Genio',reaction:'Duelo Reflejos',treasure:'Caza Tesoros',platform:'Súper Salto',defender:'Defensa Espacial',dungeon:'Mazmorra Mágica'};
      if(!nombres[id]) return;
      const panel=document.createElement('div'); panel.className='hg-existing-mission';
      panel.innerHTML=hgMissionPanel(id,nombres[id],'Completa el objetivo del juego. Puedes registrar el nivel cuando termines la partida.');
      const btn=document.createElement('button'); btn.className='btn-primary'; btn.style.cssText='display:block;margin:-6px auto 14px;padding:10px 20px'; btn.textContent='🎁 Registrar nivel terminado';
      btn.onclick=()=>hgCompletarNivel(id,nombres[id],8,20);
      panel.appendChild(btn); body.insertBefore(panel, body.firstChild);
    },250);
  }
}
if (typeof buildExtraOnlineGame === "function") window.buildExtraOnlineGame = buildExtraOnlineGame;
