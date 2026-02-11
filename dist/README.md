# Public Assets

## Favicon

Para usar un favicon PNG personalizado:

1. **Opción A: Usar el favicon.png directamente**
   - Coloca tu archivo `favicon.png` en esta carpeta (`public/`)
   - Vite lo servirá automáticamente
   - En `index.html`, reemplaza la etiqueta del favicon con:
   ```html
   <link rel="icon" type="image/png" href="/favicon.png" />
   ```

2. **Opción B: Usar favicon.ico**
   - Convierte tu imagen PNG a `.ico` format
   - Colócalo en `public/favicon.ico`
   - En `index.html`, agrega:
   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico" />
   ```

3. **Opción C: Favicon SVG (actual)**
   - El favicon SVG en línea está configurado en `index.html`
   - Es pequeño, rápido y no requiere archivos adicionales

## Archivos Estáticos

Cualquier archivo en esta carpeta será servido por Vite en la raíz del dominio:
- `public/favicon.png` → `http://localhost:3000/favicon.png`
- `public/image.jpg` → `http://localhost:3000/image.jpg`
