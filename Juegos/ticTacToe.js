function buildTicTacToe(container) {
  const j1=localP1(), j2=localP2();
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:20px">
      <div style="text-align:center;margin-bottom:16px">
        <div id="tttStatus" style="font-family:Fredoka One,cursive;font-size:1.3rem;color:var(--accent);margin-bottom:12px">Turno de ⭕ ${j1.name}
window.buildTicTacToe = buildTicTacToe;
