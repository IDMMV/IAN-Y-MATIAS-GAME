function buildPalabra(container) {
  const WORDS = [
    ['GATO','PERRO','CASA','SOL','PAN'],
    ['ESCUELA','AMIGO','FAMILIA','LIBRO','MESA'],
    ['COMPUTADORA','BICICLETA','MARIPOSA','ELEFANTE','MONTAÑA'],
  ];
  let level=1, score=0, current='', scrambled=[], built=[];
  container.innerHTML = `
    <div class="game-container" style="background:#0a0a14;padding:16px;min-height:300px">
      <div style="display:flex;justify-content:space-between;align-items:center;color:#fff;font-weight:800;margin-bottom:10px">
        <span>🔤 Nivel <span id="paLevel">1</span></span>
        <span>✅ <span id="paScore">0</span></span>
        <button onclick="window.paSkip()" style="background:#7C3AED;border:none;color:white;padding:6px 12px;border-radius:12px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700">Saltar</button>
      </div>
      <div style="text-align:center;color:#aaa;margin-bottom:6px">Ordena las letras para formar la palabra</div>
      <div style="text-align:center;margin-bottom:10px">
        <button id="paReadBtn" style="background:#FFD600;border:none;color:#2D1B4E;padding:9px 20px;border-radius:18px;font-family:Nunito,sans-serif;font-weight:800;font-size:0.9rem;cursor:pointer;-webkit-tap-highlight-color:transparent">🔊 Escuchar palabra</button>
      </div>
      <div id="paBuilt" style="min-height:54px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;border-bottom:2px dashed rgba(255,255,255,0.2);padding-bottom:10px"></div>
      <div id="paLetters" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"></div>
    </div>
    <div class="game-instructions"><strong>Cómo jugar:</strong> Pulsa 🔊 para escuchar la palabra. Toca las letras en orden para formarla. ¡Cada nivel son más largas!</div>`;

  function pickWord() {
    const list = WORDS[Math.min(level-1, WORDS.length-1)];
    current = list[Math.floor(Math.random()*list.length)];
    scrambled = current.split('').sort(()=>Math.random()-0.5);
    // evitar que salga ya ordenada
    if (scrambled.join('')===current) scrambled.reverse();
    built = [];
    setText('paLevel', level); setText('paScore', score);
    render();
    // conectar botón de leer la palabra
    const readBtn = document.getElementById('paReadBtn');
    if (readBtn) {
      const fire = e => { e.preventDefault(); e.stopPropagation(); speak('La palabra es: ' + current); }
window.buildPalabra = buildPalabra;
