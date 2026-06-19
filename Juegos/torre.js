function buildTorre(container) {
  const W = Math.min(360, window.innerWidth-40), H = 460;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:10px;min-height:520px">
      <div style="text-align:center;color:#fff;margin-bottom:6px">
        <span style="font-family:'Fredoka One',cursive">❤️ <span id="torreVida">10</span></span>
        <span style="margin-left:12px;color:#FFD600">🪙 <span id="torreOro">50</span></span>
        <span style="margin-left:12px;color:#aaa;font-size:0.85rem">Oleada <span id="torreOla">1</span></span>
      </div>
      <canvas id="torreCanvas" width="${W}
window.buildTorre = buildTorre;
