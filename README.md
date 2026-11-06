# Portafolio · Gabriel Solís

Portafolio personal en una sola página (HTML, CSS y JavaScript, sin build).

- **Sitio:** https://trikis.nl
- **Proyectos destacados:** Optimizador para Windows (https://github.com/Trikis67/Optimizador), tienda "El Rack de las Playeras" (https://elrackdelasplayerasgt.lat) y su panel de administración.
- **Experiencia:** taller 3D cinematográfico: el scroll guía la cámara de un objeto a otro (un capítulo por sección y por proyecto), intro con la persiana del taller y títulos que se estampan letra por letra.
- **Extras:** Orden de trabajo (arma tu proyecto y envíalo por WhatsApp), tarjeta de visita descargable (.vcf) y terminal con comandos. La Galería 3D estilo Doom se abre con el comando `doom`.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Toda la página (estilos y scripts incluidos) |
| `taller3d.js` | Escena 3D (Three.js r128): mesa de taller, tomas de cámara por capítulo, HUD con etiquetas e índice, lámpara que sigue al ratón y comando `bigbang`. En celulares va en versión ligera; con `?lite` se desactiva |
| `sonido.js` | Sonido sintetizado (Web Audio) según el mundo: ambiente, clics y teclas. Empieza apagado (botón "Sonido") |
| `logo.png` | Ícono de pestaña e imagen al compartir |
| `CV-Luis-Gabriel-Solis-Garcia.pdf` | Currículum |
| `CNAME` | Dominio personalizado de GitHub Pages |

## Probar en local

Abre `index.html` en el navegador. Temas: papel kraft (por defecto), taller oscuro, naval, retro y cyber (botón 🎨). Parámetros útiles: `?intro` (repite la persiana de la intro), `?lite` (modo ligero), `?full` (modo completo).
