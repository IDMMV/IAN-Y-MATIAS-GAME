function buildAhorcadoOnline(container) {
  const PALABRAS=['PERU','GATO','ESCUELA','AMIGO','PELOTA','FAMILIA','COLEGIO','HELADO','MONTANA','OCEANO','JUGUETE','VENTANA'];
  let palabra, adivinadas, errores, miNum, soyQuienAdivina, ctrl;
  const MAX=6;
  ctrl = crearJuegoOnline({
    container, titulo:'Ahorcado', emoji:'✏️',
    descripcion:'Adivina la palabra letra por letra',
    colorTema:'linear-gradient(135deg,#f59e0b,#b91c1c)',
    onEmpezar: (esAnf) => {
      miNum = esAnf?1:2;
      if(esAnf){ palabra = PALABRAS[Math.floor(Math.random()*PALABRAS.length)]; soyQuienAdivina=false; ctrl.enviar({tipo:'palabra', len:palabra.length}
window.buildAhorcadoOnline = buildAhorcadoOnline;
