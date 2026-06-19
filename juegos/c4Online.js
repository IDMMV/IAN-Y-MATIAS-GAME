function buildC4Online(container) {
  if (!onlineDisponible()) {
    container.innerHTML = `<div class="game-container" style="background:#0a0a14;padding:30px;text-align:center;color:#fff">
      <div style="font-size:2.5rem">📡</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;margin:10px 0">Sin conexión</div>
      <div style="color:#aaa">No se pudo conectar al servidor. Revisa tu internet.</div>
    </div>`;
    return;
  }
  const COLS=7, ROWS=6;
  let board, miColor, miTurno, jugando=false, rivalInfo=null;
  // miColor: 'R' (rojo, anfitrión) o 'A' (amarillo)

  function renderLobby() {
    const yo = miIdentidadOnline();
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:20px;min-height:320px">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:2.5rem">🔴🟡</div>
          <div style="color:#fff;font-family:'Fredoka One',cursive;font-size:1.3rem">Conecta 4 Online</div>
          <div style="color:#aaa;font-size:0.85rem">Conecta 4 fichas en línea con un amigo</div>
        </div>
        <div style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);border-radius:14px;padding:12px;margin-bottom:16px;max-width:340px;margin-left:auto;margin-right:auto">
          <div style="text-align:center;color:#fff;font-weight:800;margin-bottom:6px"><span style="font-size:1.6rem">${yo.emoji}</span> ${yo.name}</div>
          <div style="color:#aaa;font-size:0.74rem;text-align:center;margin-bottom:8px">Tu personaje (toca para cambiar):</div>
          <div id="c4Avatars" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;max-width:320px;margin:0 auto">
          <button id="c4Crear" style="background:linear-gradient(135deg,#FFD600,#DC2626);border:none;color:#fff;padding:18px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1.05rem;cursor:pointer;-webkit-tap-highlight-color:transparent">➕ Crear sala nueva</button>
          <div style="text-align:center;color:#666;font-weight:700">— o —</div>
          <input id="c4Codigo" type="text" maxlength="8" placeholder="Código (ej: PEZ23)" style="background:#1a1a2e;border:2px solid rgba(255,255,255,0.15);border-radius:14px;padding:14px;color:#fff;font-family:Nunito,sans-serif;font-weight:800;font-size:1.1rem;text-align:center;text-transform:uppercase;outline:none">
          <button id="c4Unirse" style="background:#7C3AED;border:none;color:#fff;padding:16px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem;cursor:pointer;-webkit-tap-highlight-color:transparent">🔗 Unirse con código</button>
        </div>
      </div>
      <div class="game-instructions"><strong>Cómo jugar:</strong> Conecta 4 fichas de tu color en fila, columna o diagonal. ¡Crea una sala y reta a un amigo!</div>`;
    const ap = document.getElementById('c4Avatars');
    if (ap) AVATARS.forEach(av => {
      const b = document.createElement('button');
      b.textContent = av;
      b.style.cssText = `aspect-ratio:1;background:${av===yo.emoji?'#DC2626':'#1a1a2e'};border:2px solid ${av===yo.emoji?'#fff':'transparent'};border-radius:8px;font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent`;
      const pick = e => { e.preventDefault(); e.stopPropagation(); if (currentPlayer==='invitado') setGuestAvatar(av); else updatePlayerProfile(currentPlayer,null,av); SFX.click(); renderLobby(); };
      b.addEventListener('touchstart', pick, {passive:false});
      b.addEventListener('click', pick);
      ap.appendChild(b);
    });
    bindBtn('c4Crear', () => iniciarSala(generarCodigoSala(), true));
    bindBtn('c4Unirse', () => {
      const cod = (document.getElementById('c4Codigo').value||'').toUpperCase().trim();
      if (cod.length < 4) { showToast('Escribe un código válido'); return; }
      iniciarSala(cod, false);
    });
  }

  function iniciarSala(codigo, esAnfitrion) {
    SFX.click();
    miColor = esAnfitrion ? 'R' : 'A';
    renderEspera(codigo);
    onRivalConectado = (info) => { rivalInfo = info; if (!jugando) empezar(); };
    onRivalSalio = () => { if (jugando) showToast('👋 El otro jugador salió'); };
    onMovimientoOnline = (datos) => {
      if (datos.tipo === 'ficha') {
        soltarFicha(datos.col, datos.color, false);
        miTurno = true;
        pintar();
        revisar();
      } else if (datos.tipo === 'reinicio') {
        reiniciar();
      }
    };
    conectarSala(codigo, esAnfitrion);
  }

  function renderEspera(codigo) {
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:24px;min-height:320px;text-align:center;color:#fff">
        <div style="font-size:2.5rem">⏳</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;margin:10px 0">Esperando al otro jugador...</div>
        <div style="color:#aaa;margin-bottom:14px">Comparte este código:</div>
        <div style="background:linear-gradient(135deg,#FFD600,#DC2626);color:#fff;font-family:'Fredoka One',cursive;font-size:2.2rem;letter-spacing:3px;padding:16px;border-radius:16px;max-width:240px;margin:0 auto">${codigo}</div>
      </div>
      <div class="game-instructions">Cuando tu amigo escriba <strong>${codigo}</strong> empezará la partida.</div>`;
  }

  function empezar() {
    jugando = true;
    board = Array(ROWS*COLS).fill(null);
    miTurno = soyAnfitrion;
    SFX.win();
    renderJuego();
    pintar();
  }

  function renderJuego() {
    const yo = miIdentidadOnline();
    const riv = rivalInfo || { name:'Rival', emoji:'👤' };
    const miFicha = miColor==='R'?'🔴':'🟡';
    const suFicha = miColor==='R'?'🟡':'🔴';
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="text-align:center;flex:1"><div style="font-size:1.5rem">${yo.emoji}</div><div style="color:#fff;font-weight:800;font-size:0.8rem">${yo.name} ${miFicha}</div></div>
          <div style="color:#fff;font-family:'Fredoka One',cursive">VS</div>
          <div style="text-align:center;flex:1"><div style="font-size:1.5rem">${riv.emoji}</div><div style="color:#fff;font-weight:800;font-size:0.8rem">${riv.name} ${suFicha}</div></div>
        </div>
        <div id="c4Status" style="text-align:center;color:#FFD600;font-family:'Fredoka One',cursive;font-size:1.05rem;margin-bottom:10px"></div>
        <div id="c4Board" style="background:#1d4ed8;border-radius:12px;padding:6px;display:grid;grid-template-columns:repeat(${COLS},1fr);gap:4px;max-width:300px;margin:0 auto"></div>
        <div style="margin-top:12px">
          <div id="c4Chat" style="height:54px;overflow-y:auto;background:#13131f;border-radius:10px;padding:6px;margin-bottom:6px;font-size:0.8rem;color:#fff"></div>
          <div style="display:flex;gap:5px;margin-bottom:6px">
            <input id="c4ChatInput" type="text" maxlength="120" placeholder="Escribe un mensaje..." style="flex:1;background:#1a1a2e;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px 10px;color:#fff;font-family:Nunito,sans-serif;font-size:0.82rem;outline:none">
            <button id="c4ChatSend" style="background:#16A34A;border:none;color:#fff;padding:0 14px;border-radius:12px;font-weight:800;cursor:pointer;-webkit-tap-highlight-color:transparent">➤</button>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center" id="c4Frases"></div>
        </div>
      </div>
      <div class="game-instructions">Toca una columna en tu turno para soltar tu ficha. ¡Conecta 4 para ganar!</div>`;
    const fc = document.getElementById('c4Frases');
    CHAT_FRASES.forEach(fr => {
      const b = document.createElement('button');
      b.textContent = fr;
      b.style.cssText = 'background:#1a1a2e;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:5px 9px;border-radius:14px;font-size:0.74rem;cursor:pointer;-webkit-tap-highlight-color:transparent';
      const send = e => { e.preventDefault(); e.stopPropagation(); enviarChatOnline(fr); };
      b.addEventListener('touchstart', send, {passive:false});
      b.addEventListener('click', send);
      fc.appendChild(b);
    });
    // chat abierto con filtros
    const sendBtn = document.getElementById('c4ChatSend');
    const inp = document.getElementById('c4ChatInput');
    if (sendBtn) {
      const f = e => { e.preventDefault(); e.stopPropagation(); enviarChatLibre('c4ChatInput'); };
      sendBtn.addEventListener('touchstart', f, {passive:false});
      sendBtn.addEventListener('click', f);
    }
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enviarChatLibre('c4ChatInput'); } });
    window._chatRenderer = function(nombre, texto, emoji) {
      const c = document.getElementById('c4Chat'); if (!c) return;
      const d = document.createElement('div'); d.innerHTML = `<strong>${escaparHTML(emoji||'')} ${escaparHTML(nombre)}:</strong> ${escaparHTML(texto)}`;
      c.appendChild(d); c.scrollTop = c.scrollHeight; SFX.click();
    };
  }

  function pintar() {
    const b = document.getElementById('c4Board'); if (!b) return;
    b.innerHTML = '';
    const fin = ganador();
    for (let i=0;i<ROWS*COLS;i++) {
      const v = board[i];
      const cell = document.createElement('div');
      const col = i % COLS;
      const puedo = miTurno && jugando && !fin && board[col] === null;
      cell.style.cssText = `aspect-ratio:1;border-radius:50%;background:${v==='R'?'#DC2626':v==='A'?'#FFD600':'#0a0a14'};cursor:${puedo?'pointer':'default'};-webkit-tap-highlight-color:transparent`;
      if (puedo) {
        const play = e => { e.preventDefault(); e.stopPropagation(); jugarColumna(col); };
        cell.addEventListener('touchstart', play, {passive:false});
        cell.addEventListener('click', play);
      }
      b.appendChild(cell);
    }
    const st = document.getElementById('c4Status');
    if (st) {
      if (fin) st.textContent = fin==='empate' ? '🤝 ¡Empate!' : (fin===miColor ? '🎉 ¡Ganaste!' : '😢 Perdiste');
      else st.textContent = miTurno ? '✋ ¡Tu turno!' : '⏳ Turno del rival...';
    }
  }

  function soltarFicha(col, color, esMia) {
    // encuentra la fila más baja libre en esa columna
    for (let r=ROWS-1;r>=0;r--) {
      const idx = r*COLS+col;
      if (board[idx]===null) { board[idx]=color; SFX.pop(); return idx; }
    }
    return -1;
  }
  function jugarColumna(col) {
    if (!miTurno || !jugando || board[col]!==null) return;
    soltarFicha(col, miColor, true);
    miTurno = false;
    enviarMovimientoOnline({ tipo:'ficha', col, color:miColor });
    pintar();
    revisar();
  }

  function ganador() {
    const get=(r,c)=> (r<0||r>=ROWS||c<0||c>=COLS)?null:board[r*COLS+c];
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
      const v=get(r,c); if(!v) continue;
      for (const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
        let k=1; while(k<4 && get(r+dr*k,c+dc*k)===v) k++;
        if(k===4) return v;
      }
    }
    if (board.every(v=>v)) return 'empate';
    return null;
  }
  function revisar() {
    const g = ganador(); if (!g) return;
    jugando = false;
    if (g===miColor) { awardBadge('first_win'); celebrate(); }
    else if (g==='empate') showToast('🤝 ¡Empate!');
    else SFX.lose();
    pintar();
    setTimeout(() => {
      const st = document.getElementById('c4Status'); if (!st) return;
      const rb = document.createElement('button');
      rb.textContent = '🔁 Revancha';
      rb.style.cssText = 'display:block;margin:8px auto 0;background:#7C3AED;border:none;color:#fff;padding:8px 20px;border-radius:16px;font-family:Nunito,sans-serif;font-weight:800;cursor:pointer';
      const again = e => { e.preventDefault(); enviarMovimientoOnline({tipo:'reinicio'}); reiniciar(); };
      rb.addEventListener('touchstart', again, {passive:false});
      rb.addEventListener('click', again);
      st.appendChild(rb);
    }, 600);
  }
  function reiniciar() {
    board = Array(ROWS*COLS).fill(null);
    miTurno = soyAnfitrion; jugando = true;
    renderJuego(); pintar();
  }

  // Si viene de una invitación aceptada, entra directo a la sala sin pedir código manual.
  if (typeof _autoSala !== 'undefined' && _autoSala) {
    const a = _autoSala; _autoSala = null;
    iniciarSala(a.sala, a.esAnfitrion);
  } else {
    pantallaBienvenidaOnline(container, '🔴', 'Conecta 4 Online', 'linear-gradient(135deg,#FFD600,#DC2626)', renderLobby);
  }
}

// ══════════════════════════════════════════════════════════
//  PUNTOS Y CAJAS ONLINE
// ══════════════════════════════════════════════════════════
if (typeof buildC4Online === "function") window.buildC4Online = buildC4Online;
