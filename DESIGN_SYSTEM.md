# Sistema de Diseño - Sonda

Este documento explica cómo usar el sistema centralizado de design tokens de la aplicación Sonda.

## 📁 Archivo Principal

**`design-tokens.css`** - Contiene todas las variables de diseño centralizadas:
- Colores
- Tipografías
- Espaciados
- Tamaños
- Sombras
- Animaciones
- Temas

## 🎨 Colores

### Uso en CSS/Tailwind

```jsx
// Tailwind classes
<div className="bg-calm-bg text-deep-text">
<button className="bg-calm-blue text-btn-text">

// CSS directo
background-color: var(--color-calm-bg);
color: var(--color-deep-text);
```

### Paleta de Colores

| Variable | Default | High Contrast | Warm |
|----------|---------|---------------|------|
| `--color-calm-bg` | #f0f4f8 | #000000 | #fdf6e3 |
| `--color-card-bg` | #ffffff | #000000 | #ffffff |
| `--color-calm-blue` | #4a90e2 | #FFFF00 | #d33682 |
| `--color-calm-green` | #50e3c2 | #00FF00 | #859900 |
| `--color-deep-text` | #2c3e50 | #FFFFFF | #5e412f |
| `--color-btn-text` | #ffffff | #000000 | #ffffff |
| `--color-soft-gray` | #bdc3c7 | #FFFFFF | #93a1a1 |

## 📐 Espaciado

```jsx
// Tailwind
<div className="p-md m-lg">  // padding-md, margin-lg
<div className="gap-xs">     // gap-xs

// CSS directo
padding: var(--spacing-md);
margin: var(--spacing-lg);
gap: var(--spacing-xs);
```

| Token | Valor | Equivalente |
|-------|-------|-------------|
| `--spacing-xs` | 0.25rem | 4px |
| `--spacing-sm` | 0.5rem | 8px |
| `--spacing-md` | 1rem | 16px |
| `--spacing-lg` | 1.5rem | 24px |
| `--spacing-xl` | 2rem | 32px |
| `--spacing-2xl` | 3rem | 48px |

## 🔤 Tipografía

### Tamaños de fuente

```jsx
// Aplicar al elemento <html> según preferencia del usuario
<html className="text-normal">  // 16px (default)
<html className="text-large">   // 19px
<html className="text-extra">   // 22px
```

### Fuente para Dislexia

```jsx
// Aplicar al <body>
<body className="font-dyslexia">
```

## 🎭 Temas

### Cambiar tema

```jsx
// Aplicar clase al <body>
<body className="theme-high-contrast">
<body className="theme-warm">
// Sin clase = tema default
```

### Temas disponibles

1. **Default** (Calm/Sereno) - Sin clase adicional
2. **High Contrast** - `theme-high-contrast`
3. **Warm** (Cálido) - `theme-warm`

## 🎬 Animaciones

### Animaciones disponibles

```jsx
// Tailwind
<div className="animate-pulse-slow">
<div className="animate-fade-in">
<div className="animate-slide-up">

// CSS directo
animation: pulse-slow 3s infinite;
animation: fade-in 0.3s ease-out;
animation: slide-up 0.3s ease-out;
```

## 🔘 Border Radius

```jsx
// Tailwind
<div className="rounded-sm">
<button className="rounded-xl">

// CSS directo
border-radius: var(--radius-xl);
```

| Token | Valor |
|-------|-------|
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-2xl` | 24px |
| `--radius-full` | 9999px |

## 🌑 Sombras

```jsx
// Tailwind
<div className="shadow-sm">
<div className="shadow-lg">

// CSS directo
box-shadow: var(--shadow-md);
```

## ♿ Accesibilidad

### Movimiento Reducido

```jsx
// Aplicar al <body> para usuarios con sensibilidad al movimiento
<body className="motion-reduced">
```

Esto deshabilitará todas las animaciones y transiciones.

## 🛠️ Componentes Reutilizables

### Botón Primario

```jsx
<button className="btn-primary">
  Clic aquí
</button>
```

### Card/Tarjeta

```jsx
<div className="card">
  Contenido de la tarjeta
</div>
```

## 📝 Buenas Prácticas

### ✅ Hacer

- Usar siempre las variables CSS en lugar de valores hardcodeados
- Usar las clases de Tailwind personalizadas cuando estén disponibles
- Mantener todos los colores y espaciados en `design-tokens.css`
- Respetar los temas y la accesibilidad

### ❌ Evitar

- Hardcodear colores: ~~`bg-blue-500`~~ → Usar `bg-calm-blue`
- Hardcodear tamaños: ~~`text-[19px]`~~ → Usar sistema de tamaños
- Crear nuevas variables fuera de `design-tokens.css`
- Ignorar el modo de movimiento reducido

## 🔄 Actualizando Tokens

Para agregar o modificar tokens:

1. Editar **`design-tokens.css`**
2. Si es un color nuevo, agregarlo a la configuración de Tailwind en `index.html`
3. Documentar el cambio en este archivo
4. Asegurarse de que funcione en todos los temas

## 📚 Recursos Adicionales

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens (W3C)](https://www.w3.org/community/design-tokens/)
