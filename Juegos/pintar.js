function buildPintar(container) {
  const W = Math.min(360, window.innerWidth-40), H = 380;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:12px;min-height:440px">
      <div style="display:flex;gap:6px;justify-content:center;margin-bottom:10px;flex-wrap:wrap" id="paleta"></div>
      <canvas id="pintarCanvas" width="${W}
window.buildPintar = buildPintar;
