function buildTttOnline(container) {
  if (!onlineDisponible()) {
    container.innerHTML = `<div class="game-container" style="background:#0a0a14;padding:30px;text-align:center;color:#fff">
      <div style="font-size:2.5rem">📡</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;margin:10px 0">Sin conexión</div>
      <div style="color:#aaa">No se pudo conectar al servidor de juego. Revisa tu internet e inténtalo de nuevo.</div>
    </div>`;
    return;
  }
  // Estado del juego
  let board, miSimbolo, miTurno, jugando=false, rivalInfo=null;

  // Pantalla de lobby (crear o unirse)
  function renderLobby() {
    const yo = miIdentidadOnline();
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:20px;min-height:320px">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:2.5rem">🌐</div>
          <div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.3rem">Jugar en Línea</div>
          <div style="color:#aaa;font-size:0.85rem">Juega Tres en Raya con un amigo a distancia</div>
        </div>
        <div style="background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);border-radius:14px;padding:12px;margin-bottom:16px;max-width:340px;margin-left:auto;margin-right:auto">
          <div style="text-align:center;color:#fff;font-weight:800;margin-bottom:6px"><span id="miAvatarBig" style="font-size:1.6rem">${yo.emoji}</span> ${yo.name}</div>
          <div style="color:#aaa;font-size:0.74rem;text-align:center;margin-bottom:8px">Tu personaje (toca para cambiar):</div>
          <div id="onlineAvatars" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;max-width:320px;margin:0 auto">
          <button id="btnCrear" style="background:linear-gradient(135deg,#16A34A,#2563EB);border:none;color:#fff;padding:18px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1.05rem;cursor:pointer;-webkit-tap-highlight-color:transparent">➕ Crear sala nueva</button>
          <div style="text-align:center;color:#666;font-weight:700">— o —</div>
          <input id="codigoInput" type="text" maxlength="8" placeholder="Código (ej: GATO42)" style="background:#1a1a2e;border:2px solid rgba(255,255,255,0.15);border-radius:14px;padding:14px;color:#fff;font-family:Nunito,sans-serif;font-weight:800;font-size:1.1rem;text-align:center;text-transform:uppercase;outline:none">
          <button id="btnUnirse" style="background:#7C3AED;border:none;color:#fff;padding:16px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem;cursor:pointer;-webkit-tap-highlight-color:transparent">🔗 Unirse con código</button>
        </div>
      </div>
      <div class="game-instructions"><strong>Cómo jugar:</strong> Un jugador crea una sala y le dice el código al otro. El otro entra con ese código. ¡A jugar y chatear!</div>`;
    // selector de avatar para el online (solo afecta al invitado; si tiene perfil, cambia ese perfil)
    const ap = document.getElementById('onlineAvatars');
    if (ap) {
      AVATARS.forEach(av => {
        const b = document.createElement('button');
        b.textContent = av;
        b.style.cssText = `aspect-ratio:1;background:${av===yo.emoji?'#16A34A':'#1a1a2e'};border:2px solid ${av===yo.emoji?'#fff':'transparent'};border-radius:8px;font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent`;
        const pick = e => {
          e.preventDefault(); e.stopPropagation();
          if (currentPlayer === 'invitado') setGuestAvatar(av);
          else updatePlayerProfile(currentPlayer, null, av);
          SFX.click();
          renderLobby();
        };
        b.addEventListener('touchstart', pick, {passive:false});
        b.addEventListener('click', pick);
        ap.appendChild(b);
      });
    }
    bindBtn('btnCrear', () => {
      const cod = generarCodigoSala();
      iniciarSala(cod, true);
    });
    bindBtn('btnUnirse', () => {
      const inp = document.getElementById('codigoInput');
      const cod = (inp.value || '').toUpperCase().trim();
      if (cod.length < 4) { showToast('Escribe un código válido'); return; }
      iniciarSala(cod, false);
    });
  }

  function iniciarSala(codigo, esAnfitrion) {
    SFX.click();
    miSimbolo = esAnfitrion ? 'O' : 'X';
    renderEspera(codigo, esAnfitrion);
    // configurar callbacks
    onRivalConectado = (info) => {
      rivalInfo = info;
      if (!jugando) empezarPartida();  // evita reiniciar la partida si ya empezó
    };
    onRivalSalio = () => {
      if (jugando) { showToast('👋 El otro jugador salió'); }
    };
    onMovimientoOnline = (datos) => {
      if (datos.tipo === 'jugada') {
        board[datos.casilla] = datos.simbolo;
        miTurno = true;
        SFX.pop();
        pintarTablero();
        revisarFin();
      } else if (datos.tipo === 'reinicio') {
        reiniciarTablero(); 
      }
    };
    conectarSala(codigo, esAnfitrion);
  }

  function renderEspera(codigo, esAnfitrion) {
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:24px;min-height:320px;text-align:center;color:#fff">
        <div style="font-size:2.5rem">⏳</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;margin:10px 0">Esperando al otro jugador...</div>
        <div style="color:#aaa;margin-bottom:14px">Comparte este código:</div>
        <div style="background:linear-gradient(135deg,#16A34A,#2563EB);color:#fff;font-family:'Fredoka One',cursive;font-size:2.2rem;letter-spacing:3px;padding:16px;border-radius:16px;max-width:240px;margin:0 auto">${codigo}</div>
        <div style="color:#aaa;font-size:0.85rem;margin-top:14px">Dile este código a tu amigo para que se una</div>
      </div>
      <div class="game-instructions">Cuando tu amigo escriba <strong>${codigo}</strong> en "Unirse con código", empezará la partida.</div>`;
  }

  function empezarPartida() {
    jugando = true;
    board = Array(9).fill(null);
    miTurno = soyAnfitrion; // anfitrión (O) empieza
    SFX.win();
    renderJuego();
    pintarTablero();
  }

  function renderJuego() {
    const yo = miIdentidadOnline();
    const riv = rivalInfo || { name:'Rival', emoji:'👤' };
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="text-align:center;flex:1">
            <div style="font-size:1.6rem">${yo.emoji}</div>
            <div style="color:#00B4D8;font-weight:800;font-size:0.85rem">${yo.name} (${miSimbolo})</div>
          </div>
          <div style="color:#fff;font-family:'Fredoka One',cursive">VS</div>
          <div style="text-align:center;flex:1">
            <div style="font-size:1.6rem">${riv.emoji}</div>
            <div style="color:#FF4D9D;font-weight:800;font-size:0.85rem">${riv.name} (${miSimbolo==='O'?'X':'O'})</div>
          </div>
        </div>
        <div id="tttoStatus" style="text-align:center;color:#FFD600;font-family:'Fredoka One',cursive;font-size:1.1rem;margin-bottom:12px"></div>
        <div id="tttoBoard" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:260px;margin:0 auto"></div>
        <div style="margin-top:14px">
          <div style="color:#aaa;font-size:0.78rem;text-align:center;margin-bottom:6px">💬 Chat:</div>
          <div id="tttoChat" style="height:70px;overflow-y:auto;background:#13131f;border-radius:10px;padding:8px;margin-bottom:8px;font-size:0.82rem;color:#fff"></div>
          <div style="display:flex;gap:5px;margin-bottom:8px">
            <input id="tttoChatInput" type="text" maxlength="120" placeholder="Escribe un mensaje..." style="flex:1;background:#1a1a2e;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px 10px;color:#fff;font-family:Nunito,sans-serif;font-size:0.82rem;outline:none">
            <button id="tttoChatSend" style="background:#16A34A;border:none;color:#fff;padding:0 14px;border-radius:12px;font-weight:800;cursor:pointer;-webkit-tap-highlight-color:transparent">➤</button>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center" id="tttoFrases"></div>
        </div>
      </div>
      <div class="game-instructions">Toca una casilla en tu turno. Escribe o usa las frases para hablar con tu amigo.</div>`;
    // frases de chat
    const fc = document.getElementById('tttoFrases');
    CHAT_FRASES.forEach(fr => {
      const b = document.createElement('button');
      b.textContent = fr;
      b.style.cssText = 'background:#1a1a2e;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:6px 10px;border-radius:14px;font-size:0.78rem;cursor:pointer;-webkit-tap-highlight-color:transparent';
      const send = e => { e.preventDefault(); e.stopPropagation(); enviarChatOnline(fr); };
      b.addEventListener('touchstart', send, {passive:false});
      b.addEventListener('click', send);
      fc.appendChild(b);
    });
    // chat abierto con filtros
    const sendBtn = document.getElementById('tttoChatSend');
    const inp = document.getElementById('tttoChatInput');
    if (sendBtn) {
      const f = e => { e.preventDefault(); e.stopPropagation(); enviarChatLibre('tttoChatInput'); };
      sendBtn.addEventListener('touchstart', f, {passive:false});
      sendBtn.addEventListener('click', f);
    }
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enviarChatLibre('tttoChatInput'); } });
  }

  function pintarTablero() {
    const b = document.getElementById('tttoBoard'); if (!b) return;
    b.innerHTML = '';
    const fin = ganador();
    board.forEach((v, i) => {
      const cell = document.createElement('div');
      const clickable = !v && miTurno && jugando && !fin;
      cell.style.cssText = `aspect-ratio:1;border-radius:12px;background:${v?'rgba(124,58,237,0.18)':'rgba(255,255,255,0.05)'};border:2px solid ${v?'rgba(124,58,237,0.4)':'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:${clickable?'pointer':'default'};-webkit-tap-highlight-color:transparent`;
      cell.textContent = v==='O'?'⭕':v==='X'?'❌':'';
      if (clickable) {
        const play = e => { e.preventDefault(); e.stopPropagation(); jugar(i); };
        cell.addEventListener('touchstart', play, {passive:false});
        cell.addEventListener('click', play);
      }
      b.appendChild(cell);
    });
    const st = document.getElementById('tttoStatus');
    if (st) {
      if (fin) st.textContent = fin === 'empate' ? '🤝 ¡Empate!' : (fin === miSimbolo ? '🎉 ¡Ganaste!' : '😢 Perdiste');
      else st.textContent = miTurno ? '✋ ¡Tu turno!' : '⏳ Turno del rival...';
    }
  }

  function jugar(i) {
    if (board[i] || !miTurno || !jugando) return;
    board[i] = miSimbolo; miTurno = false; SFX.click();
    enviarMovimientoOnline({ tipo:'jugada', casilla:i, simbolo:miSimbolo });
    pintarTablero();
    revisarFin();
  }

  const LINEAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function ganador() {
    for (const [a,b,c] of LINEAS) if (board[a] && board[a]===board[b] && board[a]===board[c]) return board[a];
    if (board.every(v=>v)) return 'empate';
    return null;
  }
  function revisarFin() {
    const g = ganador();
    if (!g) return;
    jugando = false;
    if (g === miSimbolo) { awardBadge('first_win'); celebrate(); }
    else if (g === 'empate') showToast('🤝 ¡Empate!');
    else SFX.lose();
    pintarTablero();
    // botón de revancha
    setTimeout(() => {
      const st = document.getElementById('tttoStatus');
      if (st) {
        const rb = document.createElement('button');
        rb.textContent = '🔁 Revancha';
        rb.style.cssText = 'display:block;margin:10px auto 0;background:#7C3AED;border:none;color:#fff;padding:8px 20px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;cursor:pointer';
        const again = e => { e.preventDefault(); enviarMovimientoOnline({tipo:'reinicio'}); reiniciarTablero(); };
        rb.addEventListener('touchstart', again, {passive:false});
        rb.addEventListener('click', again);
        st.appendChild(rb);
      }
    }, 600);
  }
  function reiniciarTablero() {
    board = Array(9).fill(null);
    miTurno = soyAnfitrion;
    jugando = true;
    renderJuego();
    pintarTablero();
  }

  // mostrar mensajes de chat (función del juego, registrada globalmente)
  window._chatRenderer = function(nombre, texto, emoji) {
    const c = document.getElementById('tttoChat'); if (!c) return;
    const d = document.createElement('div');
    d.style.cssText = 'margin-bottom:3px';
    d.innerHTML = `<strong>${escaparHTML(emoji||'')} ${escaparHTML(nombre)}:</strong> ${escaparHTML(texto)}`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
    SFX.click();
  };

  // Si viene de una invitación, salta directo a la sala
  if (_autoSala) {
    const a = _autoSala; _autoSala = null;
    iniciarSala(a.sala, a.esAnfitrion);
  } else {
    pantallaBienvenidaOnline(container, '🌐', 'Tres en Raya Online', 'linear-gradient(135deg,#16A34A,#2563EB)', renderLobby);
  }
}
// helper para botones del lobby online
function bindBtn(id, fn) {
  const el = document.getElementById(id); if (!el) return;
  let h=false;
  const fire = e => { e.preventDefault(); e.stopPropagation(); if(h)return; h=true; setTimeout(()=>h=false,200); fn(); };
  el.addEventListener('touchstart', fire, {passive:false});
  el.addEventListener('click', fire);
}
// el canal de Supabase llama a esto; delega al renderer del juego activo
function mostrarChatMsg(nombre, texto, emoji) {
  if (window._chatRenderer) window._chatRenderer(nombre, texto, emoji);
}

// ══════════════════════════════════════════════════════════
//  CONECTA 4 ONLINE (multijugador con Supabase + chat)
// ══════════════════════════════════════════════════════════
if (typeof buildTttOnline === "function") window.buildTttOnline = buildTttOnline;
