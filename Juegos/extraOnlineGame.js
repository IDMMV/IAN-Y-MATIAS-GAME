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
window.buildExtraOnlineGame = buildExtraOnlineGame;
