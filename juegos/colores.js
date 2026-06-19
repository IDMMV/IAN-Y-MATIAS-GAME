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
      label:'', big:`<div style="width:120px;height:120px;border-radius:50%;background:${d[1]};border:6px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.3);margin:0 auto"></div>`,
      sub:d[0], voz:d[0], color:d[1], bigSize:'1rem'
    }))
  });
}

// 🔺 APRENDE FORMAS
if (typeof buildColores === "function") window.buildColores = buildColores;
