function buildMultitud(container) {
  const W = Math.min(360, window.innerWidth - 40), H = 460;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:10px;min-height:500px">
      <div style="text-align:center;color:#fff;margin-bottom:6px">
        <span style="font-family:'Fredoka One',cursive;font-size:1.1rem">👥 Tu equipo: <span id="multCount" style="color:#3b82f6">1</span></span>
        <span style="margin-left:12px;color:#aaa;font-size:0.85rem">Nivel <span id="multNivel">1</span></span>
      </div>
      <canvas id="multCanvas" width="${W}
window.buildMultitud = buildMultitud;
