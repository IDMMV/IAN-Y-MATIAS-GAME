function buildColores(container) {
  const data = [
    ['Rojo','#ef4444'],['Naranja','#f97316'],['Amarillo','#eab308'],['Verde','#22c55e'],
    ['Azul','#3b82f6'],['Morado','#a855f7'],['Rosado','#ec4899'],['Café','#92400e'],
    ['Negro','#1f2937'],['Blanco','#f3f4f6']
  ];
  juegoDidactico(container, {
    bg1:'#ede9fe', bg2:'#7c3aed', emoji:'🌈', cols:5,
    instruc:'👶 Toca un color para escuchar su nombre. ¡Aprende todos los colores!',
    items: data.map(d => ({
      label:'', big:`<div style="width:120px;height:120px;border-radius:50%;background:${d[1]}
window.buildColores = buildColores;
