function buildRunner(container) {
  const W = Math.min(360, window.innerWidth-40), H = 460;
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:10px;min-height:500px">
      <div style="text-align:center;color:#fff;margin-bottom:6px">
        <span style="font-family:'Fredoka One',cursive">🏆 <span id="runScore">0</span></span>
        <span style="margin-left:14px;color:#FFD600">🪙 <span id="runCoins">0</span></span>
      </div>
      <canvas id="runCanvas" width="${W}
window.buildRunner = buildRunner;
