function buildQuiz(container) {
  const QUESTIONS=[
    {q:'¿Cuál es la capital del Perú?',o:['Lima','Cusco','Arequipa','Trujillo'],a:0},
    {q:'¿Cuánto es 7 × 8?',o:['54','56','64','48'],a:1},
    {q:'¿Qué planeta es el más grande?',o:['Tierra','Marte','Júpiter','Saturno'],a:2},
    {q:'¿Cuántos lados tiene un hexágono?',o:['5','6','7','8'],a:1},
    {q:'¿Qué animal es el rey de la selva?',o:['Tigre','Elefante','León','Oso'],a:2},
    {q:'¿Cuál es el océano más grande?',o:['Atlántico','Pacífico','Índico','Ártico'],a:1},
    {q:'¿Cuánto es 12 + 15?',o:['25','27','28','26'],a:1},
    {q:'¿Qué color resulta de azul + amarillo?',o:['Verde','Naranja','Morado','Rosa'],a:0},
    {q:'¿Cuántos días tiene un año normal?',o:['364','365','366','360'],a:1},
    {q:'¿Cuál es el río más largo del mundo?',o:['Nilo','Amazonas','Misisipi','Yangtsé'],a:1},
  ];
  let order=[...QUESTIONS].sort(()=>Math.random()-0.5).slice(0,8);
  let idx=0, score=0, answered=false;
  function render(){
    const c=container.querySelector('#quizContent'); if(!c) return;
    if(idx>=order.length){ c.innerHTML=`<div style="text-align:center;padding:40px 20px"><div style="font-size:3rem">🏆</div><div style="font-family:Fredoka One,cursive;font-size:1.6rem;color:#fff;margin:12px 0">¡Terminaste!</div><div style="color:#fff;font-size:1.2rem;font-weight:800">Puntaje: ${score}/${order.length}</div><button onclick="window.quizReset()" style="margin-top:20px;background:#7C3AED;border:none;color:white;padding:12px 32px;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem">🔄 Jugar otra vez</button></div>`; return; }
    const it=order[idx]; answered=false;
    c.innerHTML=`
      <div style="text-align:center;margin-bottom:16px"><span style="color:var(--accent);font-weight:800">Pregunta ${idx+1}/${order.length}</span> · <span style="color:#fff;font-weight:800">⭐ ${score}</span></div>
      <div style="background:rgba(124,58,237,0.2);border-radius:16px;padding:24px 16px;text-align:center;font-size:1.2rem;font-weight:800;color:#fff;margin-bottom:16px">${it.q}</div>
      <div id="quizOpts" style="display:grid;gap:10px"></div>`;
    const opts=c.querySelector('#quizOpts');
    it.o.forEach((opt,i)=>{
      const b=document.createElement('button');
      b.textContent=opt;
      b.style.cssText='background:#fff;border:3px solid #fff;color:#2D1B4E;padding:14px;border-radius:14px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:800;font-size:1rem;transition:all 0.2s';
      b.onclick=()=>answer(i,it.a,opts);
      opts.appendChild(b);
    });
  }
  function answer(chosen,correct,opts){
    if(answered) return; answered=true;
    const btns=[...opts.children];
    btns[correct].style.background='#00D68F'; btns[correct].style.borderColor='#00D68F'; btns[correct].style.color='#fff';
    if(chosen===correct) score++;
    else { btns[chosen].style.background='#FF4D9D'; btns[chosen].style.borderColor='#FF4D9D'; btns[chosen].style.color='#fff'; }
    registerInterval(setTimeout(()=>{ idx++; render(); },1100));
  }
  container.innerHTML=`<div class="game-container" style="background:#0a0a14;padding:20px"><div id="quizContent"></div></div><div class="game-instructions"><strong>Quiz Genio:</strong> Responde 8 preguntas de cultura general. ¡A ver cuántas aciertas!</div>`;
  window.quizReset=function(){ order=[...QUESTIONS].sort(()=>Math.random()-0.5).slice(0,8); idx=0; score=0; render(); };
  render();
}

// ═══════════════════════════════════════════
//  GAME 15: DUELO DE REFLEJOS (2 jugadores)
// ═══════════════════════════════════════════
