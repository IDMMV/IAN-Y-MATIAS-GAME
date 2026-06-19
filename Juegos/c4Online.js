function buildC4Online(container) {
  if (!onlineDisponible()) {
    container.innerHTML = `<div class="game-container" style="background:#0a0a14;padding:30px;text-align:center;color:#fff">
      <div style="font-size:2.5rem">📡</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;margin:10px 0">Sin conexión</div>
      <div style="color:#aaa">No se pudo conectar al servidor. Revisa tu internet.</div>
    </div>`;
    return;
  }
window.buildC4Online = buildC4Online;
