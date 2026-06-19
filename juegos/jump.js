function buildJump(container) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  
  // Tema por defecto si no hay seleccionado
  if(!window.jumpTheme) window.jumpTheme = 'clasico';
  
  // DEFINIR POTENCIADORES
  if(!window.jumpPowerups) {
    window.jumpPowerups = {
      escudo: { emoji: '🛡️', nombre: 'Escudo', precio: 50, duracion: 600, descripcion: 'Invulnerabilidad temporal' },
      velocidad: { emoji: '⚡', nombre: 'Velocidad', precio: 40, duracion: 600, descripcion: 'Movimiento más rápido' },
      lentitud: { emoji: '🐢', nombre: 'Ralentizar', precio: 35, duracion: 600, descripcion: 'Los obstáculos se ralentizan' },
      dobleMonedas: { emoji: '💰', nombre: 'Doble Monedas', precio: 60, duracion: 600, descripcion: 'Gana el doble de puntos' },
      saltoExtra: { emoji: '⬆️', nombre: 'Salto Extra', precio: 45, duracion: 600, descripcion: 'Salta más alto' },
      magnetismo: { emoji: '🧲', nombre: 'Magnetismo', precio: 55, duracion: 600, descripcion: 'Atrae obstáculos alejados' }
    };
  }
  
  // DEFINIR INVENTARIO
  if(!window.jumpInventory) {
    window.jumpInventory = JSON.parse(localStorage.getItem('jumpInventory')) || {
      escudo: 0, velocidad: 0, lentitud: 0, dobleMonedas: 0, saltoExtra: 0, magnetismo: 0
    };
  }
  
  // DEFINIR MONEDAS
  if(!window.jumpCoins) {
    window.jumpCoins = parseInt(localStorage.getItem('jumpCoins')) || 500;
  }
  
  const themes = {
    clasico: { bg: 'linear-gradient(180deg,#87CEEB,#E0F6FF)', platform: '#00cc00', obstacle: 'rgba(255,50,50,0.3)', emoji: '🦘' },
    espacio: { bg: 'linear-gradient(180deg,#0a0a0a,#1a1a2e)', platform: '#00ff88', obstacle: 'rgba(255,0,255,0.3)', emoji: '🛸' },
    nieve: { bg: 'linear-gradient(180deg,#e6f3ff,#b3d9ff)', platform: '#ffffff', obstacle: 'rgba(100,149,237,0.3)', emoji: '❄️' },
    fuego: { bg: 'linear-gradient(180deg,#ff6347,#ff4500)', platform: '#ffff00', obstacle: 'rgba(255,140,0,0.3)', emoji: '🔥' }
  };
  
  const theme = themes[window.jumpTheme] || themes.clasico;
  
  container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;margin:0;padding:0;overflow:hidden;background:' + theme.bg;
  
  container.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;padding:8px 12px;background:rgba(0,0,0,0.2);display:flex;justify-content:space-between;align-items:center;z-index:10;font-size:1rem">
      <span style="color:#fff;font-weight:800">🦘 <span id="jumpLevel">1</span>/5</span>
      <span style="color:#FF0020;font-weight:800">❤️<span id="jumpLives">5</span></span>
      <span style="color:#FFD700;font-weight:800">🏆 <span id="jumpScore">0</span></span>
    </div>
    <canvas id="jumpGame" width="${W}" height="${H}" style="display:block;position:absolute;top:0;left:0;width:100vw;height:100vh;z-index:1"></canvas>
    
    <!-- Controles móvil -->
    <div id="jumpMobileControls" style="position:fixed;bottom:80px;left:10px;right:10px;display:flex;justify-content:space-around;z-index:20;gap:8px">
      <button id="jumpLeftBtn" style="flex:1;padding:12px;background:rgba(124,58,237,0.8);color:#fff;border:2px solid #fff;border-radius:8px;cursor:pointer;font-weight:800;font-size:1.2rem;text-align:center">◀</button>
      <button id="jumpRightBtn" style="flex:1;padding:12px;background:rgba(124,58,237,0.8);color:#fff;border:2px solid #fff;border-radius:8px;cursor:pointer;font-weight:800;font-size:1.2rem;text-align:center">▶</button>
    </div>
    
    <!-- Panel de Potenciadores Activos -->
    <div id="jumpPowerupsPanel" style="position:fixed;bottom:70px;left:20px;display:none;justify-content:flex-start;z-index:100;gap:8px;flex-wrap:wrap;background:rgba(0,0,0,0.8);padding:10px 15px;border-radius:8px;border:2px solid #FFD700;max-width:calc(100% - 40px);min-height:40px;align-items:center;font-size:0.9rem">
    </div>
    
    <button id="jumpSoundBtn" onclick="window.jumpToggleSound()" style="position:fixed;top:20px;right:160px;padding:12px 20px;background:#FFD700;color:#000;border:3px solid #000;border-radius:10px;cursor:pointer;font-weight:900;font-size:1.3rem;z-index:20;transition:all 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🔊</button>
    
    <button onclick="window.jumpReset()" style="position:fixed;bottom:20px;right:20px;padding:8px 16px;background:#7C3AED;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:800;font-size:1rem;z-index:20">🔄 Reiniciar</button>
    
    <button onclick="window.jumpOpenShop()" style="position:fixed;bottom:20px;left:20px;padding:8px 16px;background:#FFD700;color:#000;border:none;border-radius:6px;cursor:pointer;font-weight:800;font-size:1rem;z-index:20">🛒 Tienda</button>
    
    <button id="jumpPauseBtn" onclick="window.HK_PAUSED=!window.HK_PAUSED" style="position:fixed;top:20px;right:80px;padding:12px 20px;background:#7C3AED;color:#fff;border:3px solid #fff;border-radius:10px;cursor:pointer;font-weight:900;font-size:1.3rem;z-index:20;transition:all 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">⏸️</button>
    
    <button onclick="window.jumpClose()" style="position:fixed;top:20px;right:20px;padding:12px 20px;background:#FF4757;color:#fff;border:3px solid #fff;border-radius:10px;cursor:pointer;font-weight:900;font-size:1.3rem;z-index:20;transition:all 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">✕</button>`;
  
  const cv = document.getElementById('jumpGame');
  const ctx = cv.getContext('2d');
  
  let player = {x: W/2, y: H-80, vy: 0, vx: 0};
  let platforms = [];
  let obstacles = [];
  let powerups = [];
  let activePowerups = {}; // Potenciadores activos durante el juego
  let score = 0, level = 1, running = true, animId = null;
  let lives = 5; // 5 vidas
  let lastDeathY = 0; // Flag para evitar multiple trigger
  let keys = {};
  
  const platformCount = Math.max(15, Math.floor(H / 50));
  const platformWidth = Math.floor(W * 0.20);
  const platformHeight = Math.floor(H * 0.025);
  const platformSpacing = Math.floor(H / (platformCount + 1));
  
  for(let i = 0; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (W - platformWidth),
      y: H - 50 - i * platformSpacing,
      w: platformWidth,
      h: platformHeight
    });
    
    // Agregar obstáculos garantizados (pero no en las primeras plataformas)
    if(i % 3 === 0 && i > 4) {
      obstacles.push({
        x: platforms[i].x + 30,
        y: platforms[i].y - 30,
        type: ['⚔️', '🔥', '❄️', '💣'][i % 4],
        active: true
      });
    }
    
    // Potenciadores - Generar cada 3 plataformas
    if(i % 3 === 0 && i > 1) {
      const powerupKeys = Object.keys(window.jumpPowerups);
      powerups.push({
        x: platforms[i].x + Math.random() * 40 - 20,
        y: platforms[i].y - 30,
        type: powerupKeys[i % powerupKeys.length],
        isPowerupFromGame: true
      });
    }
  }
  
  platforms[0] = {x: W/2-30, y: H-60, w: 60, h: 10};
  
  document.addEventListener('keydown', e => {
    if(!document.getElementById('jumpGame')) return;
    keys[e.key] = true;
  });
  document.addEventListener('keyup', e => {
    if(!document.getElementById('jumpGame')) return;
    keys[e.key] = false;
  });
  
  // Controles táctiles para móvil/tablet
  let touchStartX = 0;
  cv.addEventListener('touchstart', e => {
    if(!document.getElementById('jumpGame')) return;
    touchStartX = e.touches[0].clientX;
  }, false);
  
  cv.addEventListener('touchmove', e => {
    if(!document.getElementById('jumpGame')) return;
    e.preventDefault();
    const touchCurrentX = e.touches[0].clientX;
    const diff = touchCurrentX - touchStartX;
    
    // Si está tocando el lado izquierdo del canvas
    if(diff < -10) {
      keys['ArrowLeft'] = true;
      keys['ArrowRight'] = false;
    }
    // Si está tocando el lado derecho del canvas
    else if(diff > 10) {
      keys['ArrowRight'] = true;
      keys['ArrowLeft'] = false;
    }
    // Neutral
    else {
      keys['ArrowLeft'] = false;
      keys['ArrowRight'] = false;
    }
  }, false);
  
  cv.addEventListener('touchend', e => {
    if(!document.getElementById('jumpGame')) return;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
  }, false);
  
  // Botones móvil
  const leftBtn = document.getElementById('jumpLeftBtn');
  const rightBtn = document.getElementById('jumpRightBtn');
  
  if(leftBtn && rightBtn) {
    leftBtn.addEventListener('touchstart', () => {
      keys['ArrowLeft'] = true;
      keys['ArrowRight'] = false;
    }, false);
    leftBtn.addEventListener('touchend', () => {
      keys['ArrowLeft'] = false;
    }, false);
    
    rightBtn.addEventListener('touchstart', () => {
      keys['ArrowRight'] = true;
      keys['ArrowLeft'] = false;
    }, false);
    rightBtn.addEventListener('touchend', () => {
      keys['ArrowRight'] = false;
    }, false);
  }
  
  function update() {
    if(window.HK_PAUSED) return;
    
    // Actualizar duración de potenciadores activos
    for(let key in activePowerups) {
      activePowerups[key]--;
      if(activePowerups[key] <= 0) {
        delete activePowerups[key];
        window.jumpUpdatePowerupsUI();
      }
    }
    
    // Aplicar efectos de potenciadores activos
    let speedMultiplier = 1;
    let gravityMultiplier = 1;
    let jumpBoost = 0;
    
    if(activePowerups.velocidad) {
      speedMultiplier = 1.5; // 50% más rápido
    }
    if(activePowerups.lentitud) {
      gravityMultiplier = 0.5; // Gravedad a la mitad
    }
    if(activePowerups.saltoExtra) {
      jumpBoost = 3; // Salto extra
    }
    
    // Movimiento
    if(keys['ArrowLeft'] || keys['a']) player.vx = -4 * speedMultiplier;
    else if(keys['ArrowRight'] || keys['d']) player.vx = 4 * speedMultiplier;
    else player.vx *= 0.9;
    
    player.x += player.vx;
    if(player.x < 10) player.x = W - 10;
    if(player.x > W - 10) player.x = 10;
    
    player.vy += 0.35 * gravityMultiplier; // gravedad con multiplicador
    player.y += player.vy;
    
    // Colisión plataformas
    platforms.forEach(p => {
      if(player.vy > 0 && player.x > p.x && player.x < p.x + p.w && player.y + 14 > p.y && player.y + 14 < p.y + 9) {
        player.vy = -(12 + jumpBoost); // Salto con boost
        SFX.pick();
        window.jumpSounds.platformHit();
      }
    });
    
    // Colisión obstáculos
    obstacles.forEach((obs, i) => {
      if(obs.active && Math.hypot(player.x - obs.x, player.y - obs.y) < 20) {
        obs.active = false; // Desactivar inmediatamente para evitar múltiples triggers
        // Verificar si hay escudo activo
        if(activePowerups.escudo) {
          showToast('🛡️ ¡El escudo te protegió!');
          window.jumpSounds.powerupGrab();
          activePowerups.escudo = 0;
          delete activePowerups.escudo;
          window.jumpUpdatePowerupsUI();
        } else {
          lives--;
          document.getElementById('jumpLives').textContent = lives;
          if(lives <= 0) {
            running = false;
            SFX.lose();
            showToast('💀 ¡GAME OVER!');
          } else {
            window.jumpSounds.obstacleHit();
            showToast(`❤️ Vidas: ${lives}`);
            player = {x: W/2, y: H-80, vy: 0, vx: 0};
          }
        }
      }
    });
    
    // Colisión potenciadores (con magnetismo si está activo)
    let pickupRange = 15;
    if(activePowerups.magnetismo) {
      pickupRange = 60; // Rango aumentado 4x con magnetismo
    }
    
    powerups.forEach((pu, i) => {
      if(Math.hypot(player.x - pu.x, player.y - pu.y) < pickupRange) {
        powerups.splice(i, 1);
        
        // Si es un potenciador del juego, agregarlo al inventario
        if(pu.isPowerupFromGame) {
          // Leer inventario actual
          let currentInventory = JSON.parse(localStorage.getItem('jumpInventory')) || {
            escudo: 0, velocidad: 0, lentitud: 0, dobleMonedas: 0, saltoExtra: 0, magnetismo: 0
          };
          
          // Agregar potenciador
          currentInventory[pu.type] = (currentInventory[pu.type] || 0) + 1;
          localStorage.setItem('jumpInventory', JSON.stringify(currentInventory));
          window.jumpInventory = currentInventory;
          
          showToast(`📦 +${window.jumpPowerups[pu.type].emoji} ${window.jumpPowerups[pu.type].nombre}`);
          window.jumpSounds.powerupGrab();
          window.jumpUpdatePowerupsUI(); // Actualizar UI inmediatamente
        } else {
          // Potenciador antiguo
          showToast(`⭐ ${pu.type}`);
          SFX.pop();
        }
      }
    });
    
    // Cámara
    if(player.y < H/2) {
      const dy = H/2 - player.y;
      player.y = H/2;
      platforms.forEach(p => p.y += dy);
      obstacles.forEach(o => o.y += dy);
      powerups.forEach(pu => pu.y += dy);
      score += Math.round(dy);
      
      // Subir de nivel y cambiar de mundo
      const levelGoals = [1000, 2500, 4000, 6000, 8000];
      const worlds = ['clasico', 'espacio', 'nieve', 'fuego', 'clasico'];
      
      if(score >= levelGoals[level-1] && level < 5) {
        level++;
        window.jumpSounds.levelUp();
        
        // PAUSAR el juego mientras se muestra el modal
        window.HK_PAUSED = true;
        
        // Reiniciar la música de fondo para que toque la nueva canción
        window.jumpStopBackgroundMusic();
        setTimeout(() => {
          if(window.jumpStartBackgroundMusic) window.jumpStartBackgroundMusic();
        }, 500);
        
        document.getElementById('jumpLevel').textContent = level;
        
        // Cambiar de mundo
        const newWorld = worlds[level-1];
        window.jumpTheme = newWorld;
        
        // Modal de nivel con mundo
        const worldEmojis = {clasico: '🌤️', espacio: '🚀', nieve: '❄️', fuego: '🔥'};
        const worldNames = {clasico: 'Clásico', espacio: 'Espacio', nieve: 'Nieve', fuego: 'Fuego'};
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;font-family:Nunito';
        modal.innerHTML = `<div style="background:#7C3AED;color:#fff;padding:30px;border-radius:15px;text-align:center;border:3px solid #FFD600">
          <div style="font-size:2.5rem;margin-bottom:10px">⭐</div>
          <div style="font-size:1.8rem;font-weight:900">¡NIVEL ${level}!</div>
          <div style="font-size:1.5rem;margin:15px 0">${worldEmojis[newWorld]} Mundo ${worldNames[newWorld]}</div>
          <div style="font-size:0.9rem;margin-top:15px">Meta: ${levelGoals[level-1]}m</div>
        </div>`;
        document.body.appendChild(modal);
        
        // Mantener el modal por 4 segundos y LUEGO reanudar el juego
        setTimeout(() => {
          modal.remove();
          window.HK_PAUSED = false; // REANUDAR el juego
        }, 4000);
        
        // Limpiar y reiniciar con el nuevo mundo
        platforms = [];
        obstacles = [];
        powerups = [];
        player = {x: W/2, y: H-80, vy: 0, vx: 0};
        
        // Recrear plataformas para el nuevo mundo
        for(let i = 0; i < platformCount; i++) {
          platforms.push({x: Math.random()*(W-platformWidth), y: H-50-i*platformSpacing, w: platformWidth, h: platformHeight});
          // Obstáculos específicos por nivel
          const obstaclesByLevel = {
            1: ['⚔️', '🔥'],
            2: ['🔥', '❄️', '⚔️'],
            3: ['💣', '🔥', '❄️', '⚔️'],
            4: ['💣', '👻', '⚔️'],
            5: ['👾', '💣', '🔥', '❄️', '⚔️']
          };
          const levelObstacles = obstaclesByLevel[level] || ['⚔️', '🔥'];
          
          if(i % 3 === 0 && i > 4) obstacles.push({
            x: platforms[i].x+platformWidth/2, 
            y: platforms[i].y-30, 
            type: levelObstacles[i % levelObstacles.length], 
            active: true
          });
          if(i % 5 === 0) powerups.push({x: platforms[i].x+platformWidth/2, y: platforms[i].y-20, type: ['🛡️','⚡','🐢'][i%3]});
        }
        platforms[0] = {x: W/2-platformWidth/2, y: H-50, w: platformWidth, h: platformHeight};
      }
      
      if(score >= levelGoals[4] && level === 5) {
        running = false;
        window.jumpSounds.victoryComplete();
        SFX.point();
        showToast('🎉 ¡COMPLETASTE LA AVENTURA!');
        document.getElementById('jumpScore').textContent = score;
        
        // Modal de fin
        const finalModal = document.createElement('div');
        finalModal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;font-family:Nunito';
        finalModal.innerHTML = `<div style="background:linear-gradient(135deg,#7C3AED,#FF6B9D);color:#fff;padding:40px;border-radius:20px;text-align:center;border:3px solid #FFD600;max-width:400px">
          <div style="font-size:3rem;margin-bottom:10px">🏆</div>
          <div style="font-size:2rem;font-weight:900;margin-bottom:10px">¡LO HICISTE!</div>
          <div style="font-size:1.2rem;margin-bottom:20px">Completaste todos los mundos</div>
          <div style="font-size:1.5rem;font-weight:800;color:#FFD700">Puntuación: ${score}</div>
          <div style="margin-top:20px;font-size:0.9rem">🌤️ Clásico → 🚀 Espacio → ❄️ Nieve → 🔥 Fuego → 🌤️ Clásico</div>
        </div>`;
        document.body.appendChild(finalModal);
      }
    }
    
    // Caída
    if(player.y > H) {
      if(lastDeathY === 0 || player.y - lastDeathY > 100) {
        lastDeathY = player.y;
        lives--;
        document.getElementById('jumpLives').textContent = lives;
        if(lives <= 0) {
          running = false;
          SFX.lose();
          showToast('💀 ¡GAME OVER!');
        } else {
          showToast(`❤️ Vidas: ${lives}`);
          player = {x: W/2, y: H-80, vy: 0, vx: 0};
        }
      }
    }
    
    // Remover plataformas lejanas
    platforms = platforms.filter(p => p.y < H + 16);
    
    while(platforms.length < platformCount - 2) {
      const lowestY = Math.min(...platforms.map(p => p.y));
      platforms.push({
        x: Math.random() * (W - platformWidth),
        y: lowestY - platformSpacing,
        w: platformWidth,
        h: platformHeight
      });
      
      // Agregar obstáculos
      if(Math.random() < 0.5) {
        obstacles.push({
          x: platforms[platforms.length-1].x + 30,
          y: platforms[platforms.length-1].y - 30,
          type: ['⚔️', '🔥', '❄️', '💣'][Math.floor(Math.random()*4)],
          active: true
        });
      }
    }
  }
  
  function draw() {
    // Fondo con colores del tema
    const backgrounds = {
      clasico: ['#87CEEB', '#E0F6FF'],
      espacio: ['#0a0a0a', '#1a1a2e'],
      nieve: ['#e6f3ff', '#b3d9ff'],
      fuego: ['#ff6347', '#ff4500']
    };
    
    const bgColors = backgrounds[window.jumpTheme] || backgrounds.clasico;
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, bgColors[0]);
    grad.addColorStop(1, bgColors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
    
    // Efecto especial para espacio (estrellas)
    if(window.jumpTheme === 'espacio') {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for(let i = 0; i < 50; i++) {
        const x = Math.sin(i * 12.9898 + score * 0.01) * W;
        const y = Math.cos(i * 78.233 + score * 0.01) * H;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    
    // Efecto para nieve (copos cayendo)
    if(window.jumpTheme === 'nieve') {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for(let i = 0; i < 30; i++) {
        const x = Math.sin(i * 12.9898) * W;
        const y = (score * 2 + i * 100) % H;
        ctx.fillRect(x, y, 4, 4);
      }
    }
    
    // Efecto para fuego (llamas)
    if(window.jumpTheme === 'fuego') {
      ctx.fillStyle = 'rgba(255,200,0,0.3)';
      for(let i = 0; i < 20; i++) {
        const x = Math.sin(i * 12.9898) * W;
        const y = (score * 3 + i * 50) % H;
        ctx.fillRect(x, y, 8, 8);
      }
    }
    
    // Plataformas
    ctx.fillStyle = theme.platform;
    platforms.forEach(p => {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = theme.platform;
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    });
    
    // Obstáculos
    obstacles.forEach(obs => {
      if(!obs.active) return;
      ctx.fillStyle = theme.obstacle;
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, 18, 0, Math.PI*2);
      ctx.fill();
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obs.type, obs.x, obs.y);
    });
    
    // Potenciadores
    powerups.forEach(pu => {
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.type, pu.x, pu.y);
    });
    
    // Jugador
    ctx.font = '64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(theme.emoji, player.x, player.y);
    
    // HUD
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Nivel: ${level}`, 10, 10);
    ctx.fillText(`Puntos: ${score}`, 10, 30);
    
    // Indicador de potenciadores activos
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    let activePowerupList = Object.keys(activePowerups);
    activePowerupList.forEach((key, index) => {
      const powerup = window.jumpPowerups[key];
      const duration = activePowerups[key];
      ctx.fillText(`${powerup.emoji} ${Math.ceil(duration/60)}s`, 10, 40 + (index * 25));
    });
    
    if(!running) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W/2, H/2);
    }
  }
  
  function loop() {
    if(!document.getElementById('jumpGame')) return;
    if(running) update();
    draw();
    animId = requestAnimationFrame(loop);
  }
  
  // Iniciar el loop del juego
  loop();
  
  // Iniciar música de fondo después del loop
  setTimeout(() => {
    if(window.jumpStartBackgroundMusic) window.jumpStartBackgroundMusic();
  }, 100);
  
  window.jumpReset = () => {
    player = {x: W/2, y: H-80, vy: 0, vx: 0};
    platforms = [];
    obstacles = [];
    powerups = [];
    score = 0;
    level = 1;
    running = true;
    document.getElementById('jumpLevel').textContent = '1';
    document.getElementById('jumpScore').textContent = '0';
    
    for(let i = 0; i < platformCount; i++) {
      platforms.push({x: Math.random()*(W-platformWidth), y: H-50-i*platformSpacing, w: platformWidth, h: platformHeight});
      
      // Obstáculos específicos por nivel
      const obstaclesByLevel = {
        1: ['⚔️', '🔥'],
        2: ['🔥', '❄️', '⚔️'],
        3: ['💣', '🔥', '❄️', '⚔️'],
        4: ['💣', '👻', '⚔️'],
        5: ['👾', '💣', '🔥', '❄️', '⚔️']
      };
      const levelObstacles = obstaclesByLevel[level] || ['⚔️', '🔥'];
      
      if(i % 3 === 0 && i > 4) obstacles.push({
        x: platforms[i].x+platformWidth/2, 
        y: platforms[i].y-30, 
        type: levelObstacles[i % levelObstacles.length], 
        active: true
      });
      if(i % 5 === 0) powerups.push({x: platforms[i].x+platformWidth/2, y: platforms[i].y-20, type: ['🛡️','⚡','🐢'][i%3]});
    }
    platforms[0] = {x: W/2-platformWidth/2, y: H-50, w: platformWidth, h: platformHeight};
  };
  
  window.jumpClose = () => {
    console.log('Closing Jump game...');
    if(animId) cancelAnimationFrame(animId);
    // Detener la música de fondo
    if(typeof window.jumpStopBackgroundMusic === 'function') {
      window.jumpStopBackgroundMusic();
    }
    // Intentar cerrar mediante la función closeGame o closeModal del sistema
    if(typeof closeGame === 'function') {
      closeGame();
    } else if(typeof closeModal === 'function') {
      closeModal();
    } else {
      // Si no existen, remover el contenedor manualmente
      const container = document.querySelector('div[style*="position:fixed"][style*="width:100vw"]');
      if(container) container.remove();
    }
  };
  
  window.jumpOpenShop = () => {
    try {
      // Asegurar que las variables existan
      if(!window.jumpPowerups) {
        console.error('jumpPowerups no está definido');
        showToast('❌ Error: Potenciadores no cargados');
        return;
      }
      
      if(!window.jumpInventory) {
        window.jumpInventory = JSON.parse(localStorage.getItem('jumpInventory')) || {
          escudo: 0, velocidad: 0, lentitud: 0, dobleMonedas: 0, saltoExtra: 0, magnetismo: 0
        };
      }
      
      if(!window.jumpCoins) {
        window.jumpCoins = parseInt(localStorage.getItem('jumpCoins')) || 500;
      }
      
      const shopModal = document.createElement('div');
      shopModal.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
      
      let shopHTML = `
        <div style="background:linear-gradient(135deg,#7C3AED,#FF6B9D);color:#fff;padding:25px;border-radius:20px;max-width:550px;width:100%;margin-bottom:20px;border:3px solid #FFD700">
          <div style="text-align:center;margin-bottom:20px">
            <div style="font-size:3rem;margin-bottom:10px">🛒</div>
            <div style="font-size:2rem;font-weight:900">TIENDA</div>
            <div style="font-size:1.3rem;font-weight:800;margin-top:10px;background:rgba(0,0,0,0.3);padding:10px;border-radius:10px">💰 Monedas: ${window.jumpCoins}</div>
          </div>
          
          <div style="background:rgba(0,0,0,0.4);padding:15px;border-radius:15px;margin-bottom:20px">
            <div style="font-size:1.1rem;font-weight:900;margin-bottom:12px;border-bottom:2px solid #FFD700;padding-bottom:8px">📦 TU INVENTARIO:</div>`;
      
      for(let [key, powerup] of Object.entries(window.jumpPowerups)) {
        const cantidad = window.jumpInventory[key] || 0;
        shopHTML += `<div style="margin:8px 0;font-size:1rem;font-weight:700">${powerup.emoji} ${powerup.nombre}: <span style="color:#FFD700;font-size:1.2rem">${cantidad}x</span></div>`;
      }
      
      shopHTML += `</div>
          
          <div style="font-size:1.1rem;font-weight:900;margin-bottom:15px;border-bottom:2px solid #FFD700;padding-bottom:8px;width:100%">🛍️ COMPRAR POTENCIADORES:</div>`;
      
      for(let [key, powerup] of Object.entries(window.jumpPowerups)) {
        shopHTML += `
          <button onclick="window.jumpBuyPowerup('${key}')" style="width:100%;padding:12px;margin:8px 0;background:linear-gradient(135deg,#4CAF50,#45a049);color:#fff;border:2px solid #fff;border-radius:10px;cursor:pointer;font-weight:900;font-size:1rem;transition:all 0.2s" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            ${powerup.emoji} ${powerup.nombre} - 💰${powerup.precio}
          </button>`;
      }
      
      shopHTML += `
        </div>
        
        <button onclick="this.parentElement.remove()" style="width:100%;max-width:550px;padding:15px;margin-top:20px;background:linear-gradient(135deg,#FF4757,#FF6348);color:#fff;border:3px solid #fff;border-radius:10px;cursor:pointer;font-weight:900;font-size:1.1rem;transition:all 0.2s" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          ✕ CERRAR TIENDA
        </button>
      `;
      
      shopModal.innerHTML = shopHTML;
      document.body.appendChild(shopModal);
    } catch(error) {
      console.error('Error en jumpOpenShop:', error);
      showToast('❌ Error al abrir tienda');
    }
  };
  
  window.jumpBuyPowerup = (key) => {
    const powerup = window.jumpPowerups[key];
    if(window.jumpCoins >= powerup.precio) {
      window.jumpCoins -= powerup.precio;
      window.jumpInventory[key]++;
      localStorage.setItem('jumpCoins', window.jumpCoins);
      localStorage.setItem('jumpInventory', JSON.stringify(window.jumpInventory));
      window.jumpSounds.buy();
      showToast(`✅ Compraste ${powerup.emoji} ${powerup.nombre}`);
      
      // Actualizar UI del panel de potenciadores
      setTimeout(() => {
        if(document.getElementById('jumpGame')) {
          window.jumpUpdatePowerupsUI();
        }
      }, 500);
      
      window.jumpOpenShop(); // Reabrir tienda
    } else {
      showToast('❌ No tienes suficientes monedas');
    }
  };
  
  window.jumpToggleSound = () => {
    window.jumpSoundEnabled = !window.jumpSoundEnabled;
    localStorage.setItem('jumpSound', window.jumpSoundEnabled);
    const btn = document.getElementById('jumpSoundBtn');
    if(btn) {
      btn.textContent = window.jumpSoundEnabled ? '🔊' : '🔇';
      btn.style.background = window.jumpSoundEnabled ? '#FFD700' : '#999';
    }
  };
  
  // Sistema de activación de potenciadores
  window.jumpUsePowerup = (key) => {
    const inventory = JSON.parse(localStorage.getItem('jumpInventory')) || {};
    
    if(!inventory[key] || inventory[key] <= 0) {
      showToast(`❌ No tienes ${window.jumpPowerups[key].nombre}`);
      return;
    }
    
    // Gastar el potenciador del inventario
    inventory[key]--;
    localStorage.setItem('jumpInventory', JSON.stringify(inventory));
    window.jumpInventory = inventory;
    
    const powerup = window.jumpPowerups[key];
    
    // Activar el potenciador
    if(!activePowerups[key]) {
      activePowerups[key] = 0;
    }
    activePowerups[key] += powerup.duracion;
    
    showToast(`✨ ¡Activaste ${powerup.emoji} ${powerup.nombre}!`);
    window.jumpSounds.powerupGrab();
    
    // Actualizar UI
    window.jumpUpdatePowerupsUI();
  };
  
  window.jumpUpdatePowerupsUI = () => {
    const panel = document.getElementById('jumpPowerupsPanel');
    if(!panel) return;
    
    // Leer directamente del localStorage para asegurar data fresca
    const inventory = JSON.parse(localStorage.getItem('jumpInventory')) || {
      escudo: 0,
      velocidad: 0,
      lentitud: 0,
      dobleMonedas: 0,
      saltoExtra: 0,
      magnetismo: 0
    };
    
    let html = '';
    let hasAnyPowerup = false;
    
    for(let [key, powerup] of Object.entries(window.jumpPowerups)) {
      const count = inventory[key] || 0;
      if(count > 0) {
        hasAnyPowerup = true;
        html += `<button onclick="window.jumpUsePowerup('${key}')" title="${powerup.descripcion}" style="padding:10px 14px;background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;border:3px solid #fff;border-radius:10px;cursor:pointer;font-weight:900;font-size:1rem;white-space:nowrap;transition:all 0.2s;box-shadow:0 4px 8px rgba(0,0,0,0.3)" onmouseover="this.style.transform='scale(1.08)';this.style.boxShadow='0 6px 12px rgba(0,0,0,0.5)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'">${powerup.emoji} ${count}x</button>`;
      }
    }
    
    if(hasAnyPowerup) {
      panel.style.display = 'flex';
      panel.innerHTML = html;
    } else {
      panel.style.display = 'none';
    }
  };
  
  // Actualizar UI de potenciadores al iniciar
  setTimeout(() => {
    window.jumpUpdatePowerupsUI();
  }, 100);
  
  // Sistema de Sonido para Jump
  window.jumpSoundEnabled = localStorage.getItem('jumpSound') !== 'false';
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  window.jumpPlaySound = (frequency, duration, type = 'sine') => {
    if(!window.jumpSoundEnabled) return;
    try {
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = type;
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.start(now);
      osc.stop(now + duration);
    } catch(e) {
      console.log('Audio error:', e);
    }
  };
  
  // Sonidos para cada evento
  window.jumpSounds = {
    jump: () => window.jumpPlaySound(400, 0.1),
    platformHit: () => {
      window.jumpPlaySound(600, 0.08);
      setTimeout(() => window.jumpPlaySound(800, 0.06), 40);
    },
    levelUp: () => {
      window.jumpPlaySound(800, 0.1);
      setTimeout(() => window.jumpPlaySound(1000, 0.1), 100);
      setTimeout(() => window.jumpPlaySound(1200, 0.15), 200);
    },
    obstacleHit: () => {
      window.jumpPlaySound(200, 0.15);
      setTimeout(() => window.jumpPlaySound(150, 0.15), 100);
      setTimeout(() => window.jumpPlaySound(100, 0.2), 200);
      setTimeout(() => window.jumpPlaySound(150, 0.15), 350);
    },
    powerupGrab: () => {
      window.jumpPlaySound(1000, 0.05);
      setTimeout(() => window.jumpPlaySound(1200, 0.05), 50);
      setTimeout(() => window.jumpPlaySound(1400, 0.08), 100);
    },
    buy: () => {
      window.jumpPlaySound(700, 0.08);
      setTimeout(() => window.jumpPlaySound(900, 0.08), 80);
    },
    victoryComplete: () => {
      window.jumpPlaySound(1000, 0.12);
      setTimeout(() => window.jumpPlaySound(1200, 0.12), 120);
      setTimeout(() => window.jumpPlaySound(1400, 0.15), 240);
    },
    // 4 Canciones de fondo diferentes
    backgroundMusic1: () => { // Canción clásica alegre
      const notes = [
        {freq: 262, duration: 0.5}, // Do
        {freq: 330, duration: 0.5}, // Mi
        {freq: 392, duration: 0.5}, // Sol
        {freq: 330, duration: 0.5}, // Mi
      ];
      notes.forEach((note, i) => {
        setTimeout(() => {
          if(window.jumpMusicPlaying) window.jumpPlaySound(note.freq, note.duration, 'sine');
        }, i * 500);
      });
    },
    backgroundMusic2: () => { // Canción de espacio futurista
      const notes = [
        {freq: 440, duration: 0.4},
        {freq: 550, duration: 0.4},
        {freq: 660, duration: 0.4},
        {freq: 550, duration: 0.4},
      ];
      notes.forEach((note, i) => {
        setTimeout(() => {
          if(window.jumpMusicPlaying) window.jumpPlaySound(note.freq, note.duration, 'sine');
        }, i * 400);
      });
    },
    backgroundMusic3: () => { // Canción suave y mágica
      const notes = [
        {freq: 293, duration: 0.6},
        {freq: 349, duration: 0.6},
        {freq: 294, duration: 0.6},
        {freq: 349, duration: 0.6},
      ];
      notes.forEach((note, i) => {
        setTimeout(() => {
          if(window.jumpMusicPlaying) window.jumpPlaySound(note.freq, note.duration, 'sine');
        }, i * 600);
      });
    },
    backgroundMusic4: () => { // Canción épica y energética
      const notes = [
        {freq: 330, duration: 0.35},
        {freq: 392, duration: 0.35},
        {freq: 494, duration: 0.35},
        {freq: 392, duration: 0.35},
      ];
      notes.forEach((note, i) => {
        setTimeout(() => {
          if(window.jumpMusicPlaying) window.jumpPlaySound(note.freq, note.duration, 'sine');
        }, i * 350);
      });
    }
  };
  
  // Sistema de música de fondo
  window.jumpMusicPlaying = localStorage.getItem('jumpMusic') !== 'false';
  window.jumpMusicInterval = null;
  window.jumpCurrentSong = 1;
  
  window.jumpStartBackgroundMusic = () => {
    if(window.jumpMusicInterval) clearInterval(window.jumpMusicInterval);
    window.jumpMusicInterval = setInterval(() => {
      if(window.jumpMusicPlaying && window.jumpSoundEnabled) {
        // Seleccionar canción según el nivel actual
        const songFunctions = [
          'backgroundMusic1',
          'backgroundMusic2',
          'backgroundMusic3',
          'backgroundMusic4'
        ];
        
        // Usar la canción correspondiente al nivel (0-3 para 4 canciones)
        const songIndex = Math.min(level - 1, 3);
        const songFunction = songFunctions[songIndex];
        
        if(window.jumpSounds[songFunction]) {
          window.jumpSounds[songFunction]();
        }
      }
    }, 2400); // Intervalo ajustado para las nuevas duraciones
  };
  
  window.jumpStopBackgroundMusic = () => {
    if(window.jumpMusicInterval) {
      clearInterval(window.jumpMusicInterval);
      window.jumpMusicInterval = null;
    }
  };
}

// ═══════════════════════════════════════════
//  GAME 12: SIMÓN DICE (SIMON)
// ═══════════════════════════════════════════
if (typeof buildJump === "function") window.buildJump = buildJump;
