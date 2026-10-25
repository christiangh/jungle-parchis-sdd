# Fondo jungla (selva densa)

Loseta repetible sin costuras, vista cenital.

- fondo-jungla-1200.webp — principal (pantallas retina, mostrado a 600 px)
- fondo-jungla-800.webp — móviles (mostrado a 400 px)
- fondo-jungla-1200.jpg / -800.jpg — respaldo para navegadores sin WebP
- fondo-jungla.svg — fuente editable; no usar en producción (pesado)

Las imágenes de producción se copian a `public/` al implementarlo, y el color de carga se define como token de la paleta: en `src/app/` no hay colores en hexadecimal.

## CSS

```css
.juego {
  background-color: #264018;
  background-image: url(fondo-jungla-1200.jpg);
  background-image: image-set(url(fondo-jungla-1200.webp) type("image/webp"), url(fondo-jungla-1200.jpg) type("image/jpeg"));
  background-size: 600px 600px;
  background-repeat: repeat;
  background-position: center;
}
@media (max-width: 600px) {
  .juego {
    background-image: url(fondo-jungla-800.jpg);
    background-image: image-set(url(fondo-jungla-800.webp) type("image/webp"), url(fondo-jungla-800.jpg) type("image/jpeg"));
    background-size: 400px 400px;
  }
}
```

El color #264018 se ve mientras carga la imagen.
