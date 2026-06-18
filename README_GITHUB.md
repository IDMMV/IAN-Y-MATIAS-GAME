# 🎮 HugoKids - Plataforma de Juegos Educativos

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v69-blue.svg)](RESUMEN_CAMBIOS.txt)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)

> Una plataforma de juegos educativos diseñada para niños en Perú, con más de 50 juegos interactivos incluyendo Jump con sistema de vidas, tienda, potenciadores y múltiples mundos.

---

## 🚀 Características Principales

### 🦘 Jump Game (v69)
- ✅ Sistema de 5 vidas
- ✅ 4 mundos con temas diferentes
- ✅ 6 tipos de potenciadores
- ✅ Tienda completamente funcional
- ✅ Panel persistente de potenciadores
- ✅ Música de fondo por nivel
- ✅ Sistema de monedas y recompensas
- ✅ Efectos de sonido y visuales

### 📚 50+ Juegos Disponibles
- Juegos educativos (TTS, letras, números)
- Juegos de arcade (2D clásicos)
- Juegos de puzzle (desafíos mentales)
- Juegos en línea (multiplayer)
- Juegos de rol y aventura

---

## 📁 Estructura del Proyecto

```
hugokids/
├── index.html                      # Página principal (todos los juegos)
├── /juegos/
│   └── jump.js                     # Jump separado (v69)
├── /sistema/                       # (Listo para expansión)
├── Documentación/
│   ├── README.txt
│   ├── ESTRUCTURA_MODULAR.md
│   ├── GITHUB_SETUP.txt
│   └── ... (8 archivos de doc)
└── .gitignore
```

### 🏗️ Arquitectura Modular
Esta versión implementa una **estructura modular profesional**:
- Jump aislado en su propio archivo (937 líneas)
- Otros juegos en index.html (sin afectar Jump)
- Sistema de funciones globales compartidas
- Fácil de mantener y escalar

---

## 🎯 Inicio Rápido

### Para Jugar
1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/hugokids.git
   cd hugokids
   ```

2. Abre `index.html` en tu navegador
3. ¡Elige un juego y diviértete!

### Para Editar Jump
1. Abre `/juegos/jump.js`
2. Realiza cambios
3. Recarga `index.html` para probar
4. Haz commit y push:
   ```bash
   git add .
   git commit -m "v70: Descripción del cambio"
   git push origin main
   ```

---

## 📖 Documentación

La documentación completa está disponible en los archivos `.txt` y `.md`:

| Archivo | Contenido |
|---------|-----------|
| **README.txt** | Guía principal (empieza aquí) |
| **ESTRUCTURA_MODULAR.md** | Documentación técnica |
| **GITHUB_SETUP.txt** | Cómo usar GitHub |
| **EJEMPLOS_EDICION.txt** | Ejemplos de cambios |
| **DIAGRAMA_ESTRUCTURA.txt** | Diagramas visuales |
| **INDICE_DOCUMENTACION.txt** | Mapa de documentación |

---

## 🛠️ Tecnología

- **Frontend**: HTML5 + Vanilla JavaScript
- **Almacenamiento**: localStorage + Supabase
- **Sonido**: Web Audio API
- **Base de datos**: Supabase (PostgreSQL)
- **Deployment**: GitHub Pages (opcional)

---

## 🎨 Jump Game Detalles

### Mundos Disponibles
1. **Clásico** - Cielo azul, plataformas verdes
2. **Espacio** - Estrellas y colores futuristicos
3. **Nieve** - Blanco y azul helado
4. **Fuego** - Rojo y naranja ardiente

### Potenciadores
| Nombre | Emoji | Precio | Duración |
|--------|-------|--------|----------|
| Escudo | 🛡️ | 50 monedas | 10 seg |
| Velocidad | ⚡ | 40 monedas | 10 seg |
| Ralentizar | 🐢 | 35 monedas | 10 seg |
| Doble Monedas | 💰 | 60 monedas | 10 seg |
| Salto Extra | ⬆️ | 45 monedas | 10 seg |
| Magnetismo | 🧲 | 55 monedas | 10 seg |

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Total de líneas | ~11,600 |
| Juegos disponibles | 50+ |
| Líneas de Jump (aisladas) | 937 |
| Versión actual | v69 |
| Última actualización | 18 de Junio 2026 |

---

## 🤝 Contribuir

¿Quieres mejorar HugoKids?

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios
4. Haz commit (`git commit -m 'Add some AmazingFeature'`)
5. Haz push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

---

## 📝 Versionamiento

El proyecto sigue versionamiento semántico:

- **v69** (Actual) - Estructura modular, Jump separado
- **v68** - Tienda completamente funcional
- **v67** - Música y panel persistente
- **v66** - Sistema de 5 vidas

Ver [RESUMEN_CAMBIOS.txt](RESUMEN_CAMBIOS.txt) para detalles completos.

---

## 🐛 Reporte de Bugs

Si encuentras un bug:
1. Abre una Issue en GitHub
2. Describe el problema claramente
3. Incluye pasos para reproducir
4. Incluye tu navegador y SO

---

## 💬 Preguntas Frecuentes

**P: ¿Cómo edito Jump sin romper otros juegos?**  
R: Edita `/juegos/jump.js`. Los otros juegos están en `index.html` y no se afectan.

**P: ¿Qué pasa si cometo un error?**  
R: Reviertes con `git checkout juegos/jump.js` o usas tu backup local.

**P: ¿Cómo lanzo el sitio en línea?**  
R: Activa GitHub Pages en Settings (gratis) o sube a Vercel/Netlify.

**P: ¿Puedo jugar sin estar conectado a internet?**  
R: Sí, abre `index.html` directamente desde tu computadora.

---

## 📞 Contacto

- 📧 Email: contacto@hugokids.com
- 🐙 GitHub: https://github.com/TU_USUARIO/hugokids
- 💻 Web: https://campushugo.com

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para detalles.

---

## 🎉 Agradecimientos

- Desarrollado para los niños de Perú
- Inspirado en plataformas educativas modernas
- Construido con amor y JavaScript ❤️

---

## 🚀 Próximas Mejoras

- [ ] Separar Flappy.js a módulo independiente
- [ ] Separar Runner.js a módulo independiente
- [ ] Crear `/sistema/core.js` (funciones compartidas)
- [ ] Implementar autenticación completa con Supabase
- [ ] Dashboard de progreso del jugador
- [ ] Multijugador en línea avanzado
- [ ] Soporte para iOS/Android

---

**⭐ Si te gusta el proyecto, dale una estrella en GitHub!**

```
Made with ❤️ in Peru, 2026
```

---

## 📚 Lectura Recomendada

1. [README.txt](README.txt) - Guía completa
2. [ESTRUCTURA_MODULAR.md](ESTRUCTURA_MODULAR.md) - Detalles técnicos
3. [EJEMPLOS_EDICION.txt](EJEMPLOS_EDICION.txt) - Cómo hacer cambios
4. [GITHUB_SETUP.txt](GITHUB_SETUP.txt) - Guía de Git y GitHub

---

© 2026 HugoKids - Todos los derechos reservados
