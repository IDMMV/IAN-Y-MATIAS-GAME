function buildBurbujas(container) {
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(180deg,#a5f3fc,#0ea5e9);min-height:440px;position:relative;overflow:hidden;border-radius:0">
      <div id="burbujasArea" style="position:absolute;inset:0;touch-action:manipulation"></div>
    </div>
    <div class="game-instructions">👶 Toca las burbujas para reventarlas. ¡Flotan suaves por la pantalla!</div>`;
  const area = document.getElementById('burbujasArea');
  function nueva() {
    if (!document.body.contains(area)) return;
    const bu = document.createElement('div');
    const size = 50 + Math.random()*55;
    const x = Math.random()*(area.clientWidth - size);
    bu.style.cssText = `position:absolute;left:${x}
window.buildBurbujas = buildBurbujas;
