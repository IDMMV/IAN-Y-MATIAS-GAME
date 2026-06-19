function buildPalabra(container) {
  const WORDS = [
    ['GATO','PERRO','CASA','SOL','PAN'],
    ['ESCUELA','AMIGO','FAMILIA','LIBRO','MESA'],
    ['COMPUTADORA','BICICLETA','MARIPOSA','ELEFANTE','MONTAÑA'],
  ];
  let level=1, score=0, current='', scrambled=[], built=[];
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:16px;min-height:300px">
      <div style="display:flex;justify-content:space-between;align-items:center;color:#fff;font-weight:800;margin-bottom:10px">
        <span>🔤 Nivel <span id="paLevel">1</span></span>
        <span>✅ <span id="paScore">0</span></span>
        <button onclick="window.paSkip()" style="background:#7C3AED;border:none;color:white;padding:6px 12px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Saltar</button>
      </div>
      <div style="text-align:center;color:#aaa;margin-bottom:6px">Ordena las letras para formar la palabra</div>
      <div style="text-align:center;margin-bottom:10px">
        <button id="paReadBtn" style="background:#FFD600;border:none;color:#2D1B4E;padding:9px 20px;border-radius:18px;font-family:Nunito,sans-serif;font-weight:800;font-size:0.9rem;cursor:pointer;-webkit-tap-highlight-color:transparent">🔊 Escuchar palabra</button>
      </div>
      <div id="paBuilt" style="min-height:54px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;border-bottom:2px dashed rgba(255,255,255,0.2);padding-bottom:10px"></div>
      <div id="paLetters" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"></div>
    </div>
    <div class="game-instructions"><strong>Cómo jugar:</strong> Pulsa 🔊 para escuchar la palabra. Toca las letras en orden para formarla. ¡Cada nivel son más largas!</div>`;

  function pickWord() {
    const list = WORDS[Math.min(level-1, WORDS.length-1)];
    current = list[Math.floor(Math.random()*list.length)];
    scrambled = current.split('').sort(()=>Math.random()-0.5);
    // evitar que salga ya ordenada
    if (scrambled.join('')===current) scrambled.reverse();
    built = [];
    setText('paLevel', level); setText('paScore', score);
    render();
    // conectar botón de leer la palabra
    const readBtn = document.getElementById('paReadBtn');
    if (readBtn) {
      const fire = e => { e.preventDefault(); e.stopPropagation(); speak('La palabra es: ' + current); };
      readBtn.ontouchstart = fire;
      readBtn.onclick = fire;
    }
  }
  function render() {
    const lettersEl = document.getElementById('paLetters');
    const builtEl = document.getElementById('paBuilt');
    if(!lettersEl||!builtEl) return;
    lettersEl.innerHTML=''; builtEl.innerHTML='';
    scrambled.forEach((ch, i) => {
      const b = document.createElement('button');
      b.textContent = ch;
      b.disabled = ch === null;
      b.style.cssText = `width:46px;height:46px;border-radius:12px;border:none;font-family:'Fredoka One',cursive;font-size:1.4rem;cursor:pointer;background:${ch===null?'transparent':'linear-gradient(135deg,#2563EB,#06b6d4)'};color:#fff;-webkit-tap-highlight-color:transparent`;
      if (ch !== null) {
        const pick = e => { e.preventDefault(); e.stopPropagation(); addLetter(i); };
        b.addEventListener('touchstart', pick, {passive:false});
        b.addEventListener('click', pick);
      }
      lettersEl.appendChild(b);
    });
    built.forEach(ch => {
      const d = document.createElement('div');
      d.textContent = ch;
      d.style.cssText = "width:42px;height:48px;border-radius:10px;background:#FFD600;color:#2D1B4E;display:flex;align-items:center;justify-content:center;font-family:'Fredoka One',cursive;font-size:1.3rem";
      builtEl.appendChild(d);
    });
  }
  function addLetter(i) {
    if (scrambled[i] === null) return;
    built.push(scrambled[i]); scrambled[i] = null; SFX.click();
    render();
    if (built.length === current.length) {
      if (built.join('') === current) {
        score++; setText('paScore', score); SFX.point();
        awardBadge('first_win');
        if (score >= 5) awardBadge('word_smith');
        if (built.length>0) {
          // ¿subir de nivel? cada 3 palabras
          if (score % 3 === 0 && level < WORDS.length) {
            level++;
            showLevelScreen(level, pickWord, '¡Palabras más largas!');
          } else { celebrate(); setTimeout(pickWord, 800); }
        }
      } else {
        SFX.hit(); showToast('🤔 Casi... ¡intenta de nuevo!');
        setTimeout(pickWord, 900);
      }
    }
  }
  window.paSkip = pickWord;
  pickWord();
}

// ══════════════════════════════════════════════════════════
//  TRES EN RAYA ONLINE (multijugador con Supabase + chat)
// ══════════════════════════════════════════════════════════
const CHAT_FRASES = [
  '👋 ¡Hola!','😄 ¡Buena jugada!','😎 ¡Te voy a ganar!','😅 ¡Uy, casi!',
  '🎉 ¡Gané!','🤝 ¡Buen juego!','🔁 ¿Otra vez?','⏳ ¡Apúrate!',
  '🤣 ¡Jajaja!','😮 ¡Wow!','🔥 ¡Increíble!','👏 ¡Bien hecho!',
  '😤 ¡No te rindas!','🍀 ¡Suerte!','🤔 Déjame pensar...','😱 ¡No puede ser!',
  '💪 ¡Vamos!','🎯 ¡Casi gano!','😜 ¡Te tengo!','🙈 ¡Ups!',
  '⭐ ¡Eres bueno!','🤜🤛 ¡Choca esos cinco!','😴 Me aburro, ¡juega!','🥳 ¡Qué divertido!',
  '😅 ¡Me ganaste!','🧠 ¡Buena estrategia!','🚀 ¡A jugar!','❤️ ¡Me gusta este juego!',
  '😂 ¡Qué risa!','👀 Te estoy mirando...','🏆 ¡Soy el campeón!','🤗 ¡Gracias por jugar!'
];

// ══════════════════════════════════════════════════════════
//  MOTOR COMÚN DE JUEGOS ONLINE (lobby + espera + sala + chat)
// ══════════════════════════════════════════════════════════
// cfg = { container, titulo, emoji, descripcion, colorTema,
//         onEmpezar(esAnfitrion, rivalInfo), onMovimiento(datos) }
function crearJuegoOnline(cfg) {
  const c = cfg.container;
  if (!onlineDisponible()) {
    c.innerHTML = `<div class="game-container" style="background:#0a0a14;padding:30px;text-align:center;color:#fff">
      <div style="font-size:2.5rem">📡</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;margin:10px 0">Sin conexión</div>
      <div style="color:#aaa">No se pudo conectar al servidor. Revisa tu internet.</div></div>`;
    return null;
  }
  const tema = cfg.colorTema || 'linear-gradient(135deg,#16A34A,#2563EB)';
  const ctrl = { esAnfitrion:false, rivalInfo:null };

  // Pantalla de bienvenida: muestra el número de jugador, pide nombre y avatar
  function renderBienvenida() {
    const yo = miIdentidadOnline();
    const num = getGuestId();
    c.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:20px;min-height:340px">
        <div style="text-align:center;margin-bottom:14px">
          <div style="font-size:2.4rem">${cfg.emoji}</div>
          <div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.25rem">${cfg.titulo}</div>
        </div>
        <div style="background:${tema};border-radius:16px;padding:16px;text-align:center;margin-bottom:16px;max-width:340px;margin-left:auto;margin-right:auto">
          <div style="color:#fff;font-size:0.85rem;opacity:0.9">¡Bienvenido! Eres el</div>
          <div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.8rem">Jugador #${num}</div>
          <div style="color:#fff;font-size:0.78rem;opacity:0.9">Comparte tu código U con tus amigos para reconocerse</div>
        </div>
        <div style="max-width:340px;margin:0 auto">
          <div style="color:#fff;font-weight:800;text-align:center;margin-bottom:8px">✏️ ¿Cómo te llamas?</div>
          <input id="bvNombre" type="text" maxlength="14" value="${yo.name.replace(/"/g,'&quot;')}" placeholder="Tu nombre" style="width:100%;box-sizing:border-box;background:#1a1a2e;border:2px solid rgba(255,255,255,0.15);border-radius:12px;padding:12px;color:#fff;font-family:Nunito,sans-serif;font-weight:700;font-size:1rem;text-align:center;outline:none;margin-bottom:14px">
          <div style="color:#aaa;font-size:0.78rem;text-align:center;margin-bottom:8px">Elige tu personaje:</div>
          <div id="bvAvatars" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-bottom:18px"></div>
          <button id="bvContinuar" style="width:100%;background:${tema};border:none;color:#fff;padding:16px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1.05rem;cursor:pointer;-webkit-tap-highlight-color:transparent">¡Listo, vamos a jugar! ▶</button>
        </div>
      </div>
      <div class="game-instructions">Tu código <strong>#${getGuestId()}</strong> te identifica. Si eres invitado será temporal; si tienes cuenta será permanente.</div>`;
    // nombre
    const ni = document.getElementById('bvNombre');
    if (ni) ni.addEventListener('input', () => {
      if (currentPlayer === 'invitado') setGuestName(ni.value || ('Invitado #' + getGuestId()));
      else updatePlayerProfile(currentPlayer, ni.value, null);
      updatePlayerBadge();
    });
    // avatares
    const ap = document.getElementById('bvAvatars');
    if (ap) AVATARS.forEach(av => {
      const b = document.createElement('button');
      b.textContent = av;
      const cur = miIdentidadOnline().emoji;
      b.style.cssText = `aspect-ratio:1;background:${av===cur?'#7C3AED':'#1a1a2e'};border:2px solid ${av===cur?'#fff':'transparent'};border-radius:8px;font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent`;
      const pick = e => {
        e.preventDefault(); e.stopPropagation();
        const nombreActual = document.getElementById('bvNombre');
        if (currentPlayer === 'invitado') { setGuestAvatar(av); if(nombreActual) setGuestName(nombreActual.value||('Invitado #'+getGuestId())); }
        else updatePlayerProfile(currentPlayer, nombreActual?nombreActual.value:null, av);
        SFX.click(); updatePlayerBadge(); renderBienvenida();
      };
      b.addEventListener('touchstart', pick, {passive:false});
      b.addEventListener('click', pick);
      ap.appendChild(b);
    });
    bindBtn('bvContinuar', () => {
      const n = document.getElementById('bvNombre');
      if (n) { if (currentPlayer==='invitado') setGuestName(n.value||('Invitado #'+getGuestId())); else updatePlayerProfile(currentPlayer, n.value, null); }
      SFX.click();
      renderLobby();
    });
  }

  function renderLobby() {
    const yo = miIdentidadOnline();
    c.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:20px;min-height:320px">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:2.5rem">${cfg.emoji}</div>
          <div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.3rem">${cfg.titulo}</div>
          <div style="color:#aaa;font-size:0.85rem">${cfg.descripcion}</div>
        </div>
        <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:14px;padding:12px;margin-bottom:16px;max-width:340px;margin-left:auto;margin-right:auto">
          <div style="text-align:center;color:#fff;font-weight:800;margin-bottom:6px"><span style="font-size:1.6rem">${yo.emoji}</span> ${yo.name}</div>
          <div style="color:#aaa;font-size:0.74rem;text-align:center;margin-bottom:8px">Tu personaje (toca para cambiar):</div>
          <div id="olAvatars" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;max-width:320px;margin:0 auto">
          <button id="olCrear" style="background:${tema};border:none;color:#fff;padding:18px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1.05rem;cursor:pointer;-webkit-tap-highlight-color:transparent">➕ Crear sala nueva</button>
          <div style="text-align:center;color:#666;font-weight:700">— o —</div>
          <input id="olCodigo" type="text" maxlength="8" placeholder="Código (ej: GATO42)" style="background:#1a1a2e;border:2px solid rgba(255,255,255,0.15);border-radius:14px;padding:14px;color:#fff;font-family:Nunito,sans-serif;font-weight:800;font-size:1.1rem;text-align:center;text-transform:uppercase;outline:none">
          <button id="olUnirse" style="background:#7C3AED;border:none;color:#fff;padding:16px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem;cursor:pointer;-webkit-tap-highlight-color:transparent">🔗 Unirse con código</button>
        </div>
      </div>
      <div class="game-instructions"><strong>Cómo jugar:</strong> Un jugador crea una sala y le da el código al otro. ¡A jugar y chatear!</div>`;
    const ap = document.getElementById('olAvatars');
    if (ap) AVATARS.forEach(av => {
      const b = document.createElement('button');
      b.textContent = av;
      b.style.cssText = `aspect-ratio:1;background:${av===yo.emoji?'#7C3AED':'#1a1a2e'};border:2px solid ${av===yo.emoji?'#fff':'transparent'};border-radius:8px;font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent`;
      const pick = e => { e.preventDefault(); e.stopPropagation(); if (currentPlayer==='invitado') setGuestAvatar(av); else updatePlayerProfile(currentPlayer,null,av); SFX.click(); renderLobby(); };
      b.addEventListener('touchstart', pick, {passive:false});
      b.addEventListener('click', pick);
      ap.appendChild(b);
    });
    bindBtn('olCrear', () => iniciar(generarCodigoSala(), true));
    bindBtn('olUnirse', () => {
      const cod = (document.getElementById('olCodigo').value||'').toUpperCase().trim();
      if (cod.length < 4) { showToast('Escribe un código válido'); return; }
      iniciar(cod, false);
    });
  }

  function iniciar(codigo, esAnfitrion) {
    SFX.click();
    ctrl.esAnfitrion = esAnfitrion;
    renderEspera(codigo);
    onRivalConectado = (info) => { ctrl.rivalInfo = info; if (!ctrl.jugando) { ctrl.jugando = true; cfg.onEmpezar(esAnfitrion, info); } };
    onRivalSalio = () => { if (ctrl.jugando) showToast('👋 El otro jugador salió'); };
    onMovimientoOnline = (datos) => { cfg.onMovimiento(datos); };
    conectarSala(codigo, esAnfitrion);
  }

  function renderEspera(codigo) {
    c.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:24px;min-height:320px;text-align:center;color:#fff">
        <div style="font-size:2.5rem">⏳</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;margin:10px 0">Esperando al otro jugador...</div>
        <div style="color:#aaa;margin-bottom:14px">Comparte este código:</div>
        <div style="background:${tema};color:#fff;font-family:'Fredoka One',cursive;font-size:2.2rem;letter-spacing:3px;padding:16px;border-radius:16px;max-width:240px;margin:0 auto">${codigo}</div>
      </div>
      <div class="game-instructions">Cuando tu amigo escriba <strong>${codigo}</strong> empezará la partida.</div>`;
  }

  // Helper: renderiza la barra de jugadores + chat (lo usa cada juego en su pantalla)
  ctrl.barraJugadores = function(miFicha, suFicha) {
    const yo = miIdentidadOnline();
    const riv = ctrl.rivalInfo || { name:'Rival', emoji:'👤' };
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="text-align:center;flex:1"><div style="font-size:1.4rem">${yo.emoji}</div><div style="color:#00B4D8;font-weight:800;font-size:0.78rem">${yo.name} ${miFicha||''}</div></div>
        <div style="color:#fff;font-family:'Fredoka One',cursive">VS</div>
        <div style="text-align:center;flex:1"><div style="font-size:1.4rem">${riv.emoji}</div><div style="color:#FF4D9D;font-weight:800;font-size:0.78rem">${riv.name} ${suFicha||''}</div></div>
      </div>`;
  };
  ctrl.chatHTML = function() {
    return `<div style="margin-top:12px">
        <div id="olChat" style="height:54px;overflow-y:auto;background:#13131f;border-radius:10px;padding:6px;margin-bottom:6px;font-size:0.8rem;color:#fff"></div>
        <div style="display:flex;gap:5px;margin-bottom:6px">
          <input id="olChatInput" type="text" maxlength="120" placeholder="Escribe un mensaje..." style="flex:1;background:#1a1a2e;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px 10px;color:#fff;font-family:Nunito,sans-serif;font-size:0.82rem;outline:none">
          <button id="olChatSend" style="background:#16A34A;border:none;color:#fff;padding:0 14px;border-radius:12px;font-weight:800;cursor:pointer;-webkit-tap-highlight-color:transparent">➤</button>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center" id="olFrases"></div></div>`;
  };
  ctrl.conectarChat = function() {
    const fc = document.getElementById('olFrases');
    if (fc) CHAT_FRASES.forEach(fr => {
      const b = document.createElement('button');
      b.textContent = fr;
      b.style.cssText = 'background:#1a1a2e;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:5px 9px;border-radius:14px;font-size:0.74rem;cursor:pointer;-webkit-tap-highlight-color:transparent';
      const send = e => { e.preventDefault(); e.stopPropagation(); enviarChatOnline(fr); };
      b.addEventListener('touchstart', send, {passive:false});
      b.addEventListener('click', send);
      fc.appendChild(b);
    });
    // chat abierto con filtros
    const sendBtn = document.getElementById('olChatSend');
    const inp = document.getElementById('olChatInput');
    if (sendBtn) {
      const f = e => { e.preventDefault(); e.stopPropagation(); enviarChatLibre('olChatInput'); };
      sendBtn.addEventListener('touchstart', f, {passive:false});
      sendBtn.addEventListener('click', f);
    }
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enviarChatLibre('olChatInput'); } });
    window._chatRenderer = function(nombre, texto, emoji) {
      const ch = document.getElementById('olChat'); if (!ch) return;
      const d = document.createElement('div');
      d.innerHTML = `<strong>${escaparHTML(emoji||'')} ${escaparHTML(nombre)}:</strong> ${escaparHTML(texto)}`;
      ch.appendChild(d); ch.scrollTop = ch.scrollHeight; SFX.click();
    };
  };
  ctrl.enviar = enviarMovimientoOnline;
  ctrl.renderLobby = renderLobby;
  // Si viene de una invitación aceptada, salta directo a la sala compartida.
  if (typeof _autoSala !== 'undefined' && _autoSala) {
    const a = _autoSala; _autoSala = null;
    iniciar(a.sala, a.esAnfitrion);
  } else {
    renderBienvenida();
  }
  return ctrl;
}

// Pantalla de bienvenida reutilizable (número de jugador + nombre + avatar)
function pantallaBienvenidaOnline(container, emoji, titulo, tema, onContinuar) {
  const num = getGuestId();
  function render() {
    const yo = miIdentidadOnline();
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:20px;min-height:340px">
        <div style="text-align:center;margin-bottom:14px">
          <div style="font-size:2.4rem">${emoji}</div>
          <div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.25rem">${titulo}</div>
        </div>
        <div style="background:${tema};border-radius:16px;padding:16px;text-align:center;margin-bottom:16px;max-width:340px;margin-left:auto;margin-right:auto">
          <div style="color:#fff;font-size:0.85rem;opacity:0.9">¡Bienvenido! Eres el</div>
          <div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.8rem">Jugador #${num}</div>
          <div style="color:#fff;font-size:0.78rem;opacity:0.9">Comparte tu código U con tus amigos para reconocerse</div>
        </div>
        <div style="max-width:340px;margin:0 auto">
          <div style="color:#fff;font-weight:800;text-align:center;margin-bottom:8px">✏️ ¿Cómo te llamas?</div>
          <input id="bvNombre" type="text" maxlength="14" value="${yo.name.replace(/"/g,'&quot;')}" placeholder="Tu nombre" style="width:100%;box-sizing:border-box;background:#1a1a2e;border:2px solid rgba(255,255,255,0.15);border-radius:12px;padding:12px;color:#fff;font-family:Nunito,sans-serif;font-weight:700;font-size:1rem;text-align:center;outline:none;margin-bottom:14px">
          <div style="color:#aaa;font-size:0.78rem;text-align:center;margin-bottom:8px">Elige tu personaje:</div>
          <div id="bvAvatars" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-bottom:18px"></div>
          <button id="bvContinuar" style="width:100%;background:${tema};border:none;color:#fff;padding:16px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1.05rem;cursor:pointer;-webkit-tap-highlight-color:transparent">¡Listo, vamos a jugar! ▶</button>
        </div>
      </div>
      <div class="game-instructions">Tu código <strong>#${getGuestId()}</strong> te identifica. Si eres invitado será temporal; si tienes cuenta será permanente.</div>`;
    const ni = document.getElementById('bvNombre');
    if (ni) ni.addEventListener('input', () => {
      if (currentPlayer === 'invitado') setGuestName(ni.value || ('Invitado #' + getGuestId()));
      else updatePlayerProfile(currentPlayer, ni.value, null);
      updatePlayerBadge();
    });
    const ap = document.getElementById('bvAvatars');
    if (ap) AVATARS.forEach(av => {
      const b = document.createElement('button');
      b.textContent = av;
      const cur = miIdentidadOnline().emoji;
      b.style.cssText = `aspect-ratio:1;background:${av===cur?'#7C3AED':'#1a1a2e'};border:2px solid ${av===cur?'#fff':'transparent'};border-radius:8px;font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent`;
      const pick = e => {
        e.preventDefault(); e.stopPropagation();
        const nombreActual = document.getElementById('bvNombre');
        if (currentPlayer === 'invitado') { setGuestAvatar(av); if(nombreActual) setGuestName(nombreActual.value||('Invitado #'+getGuestId())); }
        else updatePlayerProfile(currentPlayer, nombreActual?nombreActual.value:null, av);
        SFX.click(); updatePlayerBadge(); render();
      };
      b.addEventListener('touchstart', pick, {passive:false});
      b.addEventListener('click', pick);
      ap.appendChild(b);
    });
    bindBtn('bvContinuar', () => {
      const n = document.getElementById('bvNombre');
      if (n) { if (currentPlayer==='invitado') setGuestName(n.value||('Invitado #'+getGuestId())); else updatePlayerProfile(currentPlayer, n.value, null); }
      SFX.click();
      onContinuar();
    });
  }
  render();
}
if (typeof buildPalabra === "function") window.buildPalabra = buildPalabra;
