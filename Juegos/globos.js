function buildGlobos(container) {
  const colores = ['#ef4444','#f59e0b','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#06b6d4'];
  let activos = [];
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(180deg,#bfdbfe,#dbeafe);min-height:420px;position:relative;overflow:hidden;border-radius:0">
      <div id="globosArea" style="position:absolute;inset:0;touch-action:manipulation"></div>
    </div>
    <div class="game-instructions">👶 Toca los globos para reventarlos. ¡Sin perder, solo diversión!</div>`;
  const area = document.getElementById('globosArea');
  function nuevoGlobo() {
    if (!document.body.contains(area)) return;
    const g = document.createElement('div');
    const col = colores[Math.floor(Math.random()*colores.length)];
    const size = 60 + Math.random()*40;
    const x = Math.random()*(area.clientWidth - size);
    g.style.cssText = `position:absolute;left:${x}
window.buildGlobos = buildGlobos;
