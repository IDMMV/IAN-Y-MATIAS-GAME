function buildDamasOnline(container) {
  let board, miColor, miTurno, sel, ctrl; // board: 64, 'r'/'R'(rojo/dama) 'n'/'N'(negro/dama) null
  ctrl = crearJuegoOnline({
    container, titulo:'Damas', emoji:'⚫',
    descripcion:'Captura todas las fichas del rival',
    colorTema:'linear-gradient(135deg,#444,#111)',
    onEmpezar: (esAnf) => { miColor = esAnf?'r':'n'; empezar(); }
window.buildDamasOnline = buildDamasOnline;
