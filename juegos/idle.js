function buildIdle(container) {
  let dinero = 0;
  let porClic = 1;
  let porSegundo = 0;
  // negocios que se compran y generan dinero solo
  const negocios = [
    { id:'limonada', emoji:'🍋', nombre:'Puesto de Limonada', precio:15, ingreso:1, cant:0 },
    { id:'pizza', emoji:'🍕', nombre:'Pizzería', precio:100, ingreso:5, cant:0 },
    { id:'tienda', emoji:'🏪', nombre:'Tiendita', precio:500, ingreso:20, cant:0 },
    { id:'auto', emoji:'🚗', nombre:'Taller de Autos', precio:2000, ingreso:75, cant:0 },
    { id:'fabrica', emoji:'🏭', nombre:'Fábrica', precio:10000, ingreso:300, cant:0 },
    { id:'banco', emoji:'🏦', nombre:'Banco', precio:50000, ingreso:1500, cant:0 },
    { id:'cohete', emoji:'🚀', nombre:'Empresa Espacial', precio:250000, ingreso:8000, cant:0 }
  ];
  function fmt(n) {
    n = Math.floor(n);
    if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return String(n);
  }
  container.innerHTML = `
    <div class="game-container" style="background:linear-gradient(160deg,#1e1b4b,#4c1d95);min-height:460px;padding:16px;overflow-y:auto">
      <div style="text-align:center;margin-bottom:14px">
        <div style="color:#FFD600;font-family:'Fredoka One',cursive;font-size:2rem" id="idleDinero">$0</div>
        <div style="color:#aaa;font-size:0.82rem" id="idlePorSeg">$0/seg</div>
      </div>
      <div style="text-align:center;margin-bottom:18px">
        <button id="idleBtn" style="width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #fde68a, #f59e0b);border:6px solid #fff;font-size:4rem;cursor:pointer;box-shadow:0 8px 0 #b45309,0 12px 20px rgba(0,0,0,0.3);transition:transform 0.08s;-webkit-tap-highlight-color:transparent">💰</button>
        <div style="color:#fff;font-size:0.8rem;margin-top:8px">¡Toca la moneda para ganar dinero!</div>
      </div>
      <div style="color:#fff;font-weight:800;margin-bottom:8px;text-align:center">🏪 Compra negocios (ganan dinero solos)</div>
      <div id="idleNegocios" style="display:flex;flex-direction:column;gap:8px;max-width:420px;margin:0 auto"></div>
    </div>
    <div class="game-instructions">💰 Toca la moneda para ganar dinero. Compra negocios para ganar dinero automáticamente. ¡Hazte millonario!</div>`;

  const elDinero = document.getElementById('idleDinero');
  const elPorSeg = document.getElementById('idlePorSeg');
  const cont = document.getElementById('idleNegocios');

  function precioActual(n) { return Math.floor(n.precio * Math.pow(1.15, n.cant)); }

  function render() {
    elDinero.textContent = '$' + fmt(dinero);
    elPorSeg.textContent = '$' + fmt(porSegundo) + '/seg · 💪 $' + fmt(porClic) + '/toque';
    cont.innerHTML = '';
    negocios.forEach(n => {
      const precio = precioActual(n);
      const puedo = dinero >= precio;
      const row = document.createElement('div');
      row.style.cssText = `display:flex;align-items:center;gap:10px;background:#13131f;border-radius:12px;padding:10px;opacity:${puedo?'1':'0.6'}`;
      row.innerHTML = `
        <div style="font-size:2rem">${n.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="color:#fff;font-weight:800;font-size:0.85rem">${n.nombre} ${n.cant>0?`<span style="color:#16A34A">x${n.cant}</span>`:''}</div>
          <div style="color:#aaa;font-size:0.72rem">Gana $${fmt(n.ingreso)}/seg cada uno</div>
        </div>
        <button data-buy="${n.id}" style="background:${puedo?'#FFD600':'#444'};border:none;color:${puedo?'#3a2700':'#888'};padding:8px 12px;border-radius:10px;font-weight:800;font-size:0.78rem;cursor:${puedo?'pointer':'default'};white-space:nowrap">$${fmt(precio)}</button>`;
      cont.appendChild(row);
    });
    cont.querySelectorAll('button[data-buy]').forEach(b => {
      const f = e => {
        e.preventDefault(); e.stopPropagation();
        const n = negocios.find(x => x.id === b.dataset.buy);
        const precio = precioActual(n);
        if (dinero >= precio) {
          dinero -= precio; n.cant++;
          porSegundo = negocios.reduce((s,x) => s + x.ingreso*x.cant, 0);
          SFX.coin(); render();
        }
      };
      b.addEventListener('touchstart', f, {passive:false});
      b.addEventListener('click', f);
    });
  }

  // tocar la moneda
  const btn = document.getElementById('idleBtn');
  const clic = e => {
    e.preventDefault(); e.stopPropagation();
    dinero += porClic;
    btn.style.transform = 'scale(0.92)';
    setTimeout(() => btn.style.transform = '', 80);
    try { tone(660, 0.06, 'sine', 0.08); } catch(e){}
    // texto flotante +$
    const f = document.createElement('div');
    f.textContent = '+$' + fmt(porClic);
    f.style.cssText = 'position:absolute;left:50%;top:38%;transform:translateX(-50%);color:#FFD600;font-weight:800;font-size:1.2rem;pointer-events:none;transition:all 0.7s;z-index:10';
    btn.parentElement.style.position = 'relative';
    btn.parentElement.appendChild(f);
    requestAnimationFrame(() => { f.style.top='20%'; f.style.opacity='0'; });
    setTimeout(() => f.remove(), 700);
    render();
  };
  btn.addEventListener('touchstart', clic, {passive:false});
  btn.addEventListener('click', clic);

  // ganar dinero automático cada segundo
  const tick = setInterval(() => {
    if (porSegundo > 0) { dinero += porSegundo; render(); }
  }, 1000);
  window.activeIntervals.push(tick);

  // dar recompensa real al llegar a millonario (una vez)
  let dioPremio = false;
  const checkPremio = setInterval(() => {
    if (!dioPremio && dinero >= 1000000) {
      dioPremio = true;
      if (typeof awardBadge === 'function') awardBadge('first_win');
      if (typeof celebrate === 'function') celebrate();
      showToast('🎉 ¡Eres MILLONARIO!');
    }
  }, 2000);
  window.activeIntervals.push(checkPremio);

  render();
}

// ══════════════════════════════════════════════════════════
//  👥 MULTITUD (Count Masters 2D estilo CrazyGames)
// ══════════════════════════════════════════════════════════
if (typeof buildIdle === "function") window.buildIdle = buildIdle;
