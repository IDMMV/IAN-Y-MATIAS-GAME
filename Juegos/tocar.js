function buildTocar(container) {
  const cosas = ['⭐','❤️','🌈','🦋','🌟','🎈','🐱','🐶','🌸','🍎','🚗','⚽','🎀','🦄','🐠','🌞'];
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(135deg,#1e1b4b,#312e81);min-height:420px;position:relative;overflow:hidden;border-radius:0">
      <div id="tocarArea" style="position:absolute;inset:0;touch-action:manipulation;display:flex;align-items:center;justify-content:center">
        <div style="color:#fff9;font-family:'Fredoka One',cursive;font-size:1.4rem;text-align:center;pointer-events:none">👶 ¡Toca la pantalla!</div>
      </div>
    </div>
    <div class="game-instructions">👶 Toca cualquier parte de la pantalla y aparecerán cositas mágicas con sonido.</div>`;
  const area = document.getElementById('tocarArea');
  const aparecer = e => {
    e.preventDefault();
    const r = area.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || e;
    const x = (t.clientX || r.left+r.width/2) - r.left;
    const y = (t.clientY || r.top+r.height/2) - r.top;
    const el = document.createElement('div');
    el.textContent = cosas[Math.floor(Math.random()*cosas.length)];
    el.style.cssText = `position:absolute;left:${x}
window.buildTocar = buildTocar;
