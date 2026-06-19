function buildMerge(container) {
  // cadena de evolución
  const CADENA = ['🥚','🐣','🐤','🐥','🐔','🦃','🦅','🦄','🐉'];
  const N = 5;
  let grid = Array(N*N).fill(-1);
  let score = 0;
  let siguiente = 0;

  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:14px;min-height:480px">
      <div style="text-align:center;color:#fff;margin-bottom:10px">
        <span style="font-family:'Fredoka One',cursive">🏆 <span id="mergeScore">0</span></span>
        <span style="margin-left:14px;color:#aaa;font-size:0.85rem">Siguiente: <span id="mergeNext" style="font-size:1.4rem">🥚</span></span>
      </div>
      <div id="mergeGrid" style="display:grid;grid-template-columns:repeat(${N}
window.buildMerge = buildMerge;
