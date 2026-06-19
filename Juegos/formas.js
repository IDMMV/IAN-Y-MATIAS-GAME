function buildFormas(container) {
  const data = [
    ['Círculo','●','#ef4444'],['Cuadrado','■','#f59e0b'],['Triángulo','▲','#22c55e'],
    ['Estrella','★','#eab308'],['Corazón','♥','#ec4899'],['Rombo','◆','#3b82f6'],
    ['Pentágono','⬟','#a855f7'],['Luna','☾','#06b6d4']
  ];
  juegoDidactico(container, {
    bg1:'#fef9c3', bg2:'#7c3aed', emoji:'🔺', cols:4,
    instruc:'👶 Toca una forma para escuchar su nombre. ¡Círculo, cuadrado, triángulo y más!',
    items: data.map(d => ({
      label:`<span style="font-size:2.6rem">${d[1]}
window.buildFormas = buildFormas;
