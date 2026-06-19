function buildNavalOnline(container) {
  const N=7;
  const FLOTA=[3,2,2,1]; // tamaños de barcos
  let fase, miTablero, disparosMios, disparosRival, miTurno, ctrl, colocando, orient, listo, rivalListo;
  ctrl = crearJuegoOnline({
    container, titulo:'Batalla Naval', emoji:'🚢',
    descripcion:'Hunde todos los barcos del rival',
    colorTema:'linear-gradient(135deg,#0EA5E9,#1e3a8a)',
    onEmpezar: (esAnf) => { empezar(esAnf); }
window.buildNavalOnline = buildNavalOnline;
