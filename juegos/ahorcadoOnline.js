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
      if(esAnf){ palabra = PALABRAS[Math.floor(Math.random()*PALABRAS.length)]; soyQuienAdivina=false; ctrl.enviar({tipo:'palabra', len:palabra.length}); }
      else { soyQuienAdivina=true; palabra='?'; }
      adivinadas=[]; errores=0; render();
    },
    onMovimiento: (d) => {
      if(d.tipo==='palabra'){ palabra='?'.repeat(d.len); adivinadas=[]; errores=0; render(); }
      else if(d.tipo==='letra'){ recibirLetra(d.letra); }
      else if(d.tipo==='revelar'){ palabra=d.palabra; render(); }
    }
  });
  if (!ctrl) return;
  // El anfitrión (tiene la palabra real) valida y reenvía el resultado
  function recibirLetra(letra){
    if(adivinadas.includes(letra)) return;
    adivinadas.push(letra);
    if(!soyQuienAdivina){
      // soy el dueño de la palabra: validar y avisar acierto/error
      if(!palabra.includes(letra)) errores++;
      render(); checkFinAnfitrion();
    } else {
      render();
    }
  }
  function adivinarLetra(letra){
    if(!soyQuienAdivina || !ctrl.jugando || adivinadas.includes(letra)) return;
    ctrl.enviar({tipo:'letra', letra}); SFX.click();
    adivinadas.push(letra);
    render();
  }
  function checkFinAnfitrion(){
    const completa = palabra.split('').every(l=>adivinadas.includes(l));
    if(completa){ ctrl.jugando=false; celebrate(); ctrl.enviar({tipo:'revelar',palabra}); showToast('🎉 ¡Adivinó la palabra!'); }
    else if(errores>=MAX){ ctrl.jugando=false; SFX.lose(); ctrl.enviar({tipo:'revelar',palabra}); showToast('💀 No la adivinó. Era: '+palabra); }
  }
  function render(){
    const conocida = !soyQuienAdivina; // el dueño ve la palabra; quien adivina ve guiones
    const display = (palabra==='?'||palabra.includes('?')) ?
      ('_ '.repeat(palabra==='?'?1:palabra.length)).trim() :
      palabra.split('').map(l=> adivinadas.includes(l)?l:'_').join(' ');
    const partes=['😵','🥵','😰','😟','🙂','😊','😎'];
    const cara = partes[Math.max(0,Math.min(6,MAX-errores))] || '😵';
    container.innerHTML = `
      <div class="game-container" style="background:#0a0a14;padding:14px;min-height:300px">
        ${ctrl.barraJugadores(miNum===1?'✏️':'🔍', miNum===1?'🔍':'✏️')}
        <div style="text-align:center;font-size:3rem">${cara}</div>
        <div style="text-align:center;color:#FFD600;font-family:'Fredoka One',cursive;font-size:1.6rem;letter-spacing:4px;margin:10px 0">${display}</div>
        <div style="text-align:center;color:#fff;margin-bottom:8px">Errores: ${errores}/${MAX} ${soyQuienAdivina?'· ✋ Tú adivinas':'· Tu amigo adivina'}</div>
        <div id="abcGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:340px;margin:0 auto"></div>
        ${ctrl.chatHTML()}
      </div>
      <div class="game-instructions">${soyQuienAdivina?'Toca las letras para adivinar la palabra.':'Tu amigo adivina tu palabra. ¡Anímalo por el chat!'}</div>`;
    const grid=document.getElementById('abcGrid');
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l=>{
      const b=document.createElement('button');
      const usada=adivinadas.includes(l);
      const ok = usada && palabra!=='?' && !palabra.includes('?') && palabra.includes(l);
      b.textContent=l; b.disabled=usada||!soyQuienAdivina;
      b.style.cssText=`padding:8px 0;border:none;border-radius:8px;font-weight:800;font-family:Nunito,sans-serif;cursor:${usada||!soyQuienAdivina?'default':'pointer'};background:${usada?(palabra.includes(l)?'#16A34A':'#DC2626'):'#7C3AED'};color:#fff;opacity:${!soyQuienAdivina&&!usada?0.4:1};-webkit-tap-highlight-color:transparent`;
      if(!usada&&soyQuienAdivina){ const f=e=>{e.preventDefault();e.stopPropagation();adivinarLetra(l);}; b.addEventListener('touchstart',f,{passive:false}); b.addEventListener('click',f); }
      grid.appendChild(b);
    });
    ctrl.conectarChat();
  }
}

// ══════════════════════════════════════════════════════════
//  DAMAS ONLINE (8x8, captura obligatoria simplificada)
// ══════════════════════════════════════════════════════════
if (typeof buildAhorcadoOnline === "function") window.buildAhorcadoOnline = buildAhorcadoOnline;
