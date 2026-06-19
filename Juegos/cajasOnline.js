function buildCajasOnline(container) {
  const N=5; // 5x5 puntos = 4x4 cajas
  let hLines, vLines, boxes, miTurno, miNum, scores, ctrl;
  ctrl = crearJuegoOnline({
    container, titulo:'Puntos y Cajas', emoji:'🎯',
    descripcion:'Conecta puntos y cierra cajas para ganar',
    colorTema:'linear-gradient(135deg,#10b981,#7C3AED)',
    onEmpezar: (esAnf) => { miNum = esAnf?1:2; empezar(); }
window.buildCajasOnline = buildCajasOnline;
