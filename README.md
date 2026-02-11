# Sonda Digital - Proyecto FONDECYT 1251541

**Sonda** es una Aplicación Web Progresiva (PWA) diseñada como una sonda de diseño (design probe) para estudiantes universitarios en el espectro autista.

**Deployment:** [https://accesibilidad-inclusion.github.io/sonda](https://accesibilidad-inclusion.github.io/sonda)
**Versión:** 0.1

Su objetivo es recolectar experiencias cualitativas sobre barreras, facilitadores y estrategias de autorregulación en el entorno académico, respetando la privacidad y las necesidades sensoriales de los participantes.

**Documentación:**
- [Guión completo de preguntas](./SONDA_QUESTIONS.md) - Diseño anti-ambigüedad con ejemplos concretos
- [Formato de datos del Fidget](./FIDGET_DATA_FORMAT.md) - Estructura de tracking del fidget interactivo

## Contexto del Proyecto

Esta aplicación es parte del proyecto de investigación:
> **"Promoción del aprendizaje de habilidades de autodeterminación en estudiantes con TEA en educación superior: Diseño y evaluación de una propuesta formativa basada en la Teoría de la Agencia Causal."**
>
> **Financiamiento:** FONDECYT Regular N° 1251541 (ANID).
> **Investigadora Responsable:** Dra. Vanessa Vega Córdova (PUCV).

## Características Principales

### 1. Estructura Modular Semanal
La experiencia está dividida en 4 módulos temáticos que se desbloquean progresivamente:
- **Semana 1:** Mi Entorno y mis Sentidos (Mapas de calor, estímulos sensoriales).
- **Semana 2:** Navegando la Academia (Funciones ejecutivas, planificación).
- **Semana 3:** Lo Social y la Comunicación (Interacción con pares y docentes).
- **Semana 4:** Identidad y Futuro (Autodeterminación).
Ver [el guión completo](SONDA_QUESTIONS.md).

### 2. Respuestas Multimodales
Los participantes pueden responder a las actividades mediante:
- Texto.
- Audio 
- Fotografía (y clips de video).

### 3. Perfil Sensorial Personalizable
La aplicación incluye un menú robusto de accesibilidad cognitiva y sensorial:
- **Temas Visuales:** Calma (Azules), Cálido (Sepia), Alto Contraste (Negro/Amarillo).
- **Tipografía:** Ajuste de tamaño y fuente especial para Dislexia.
- **Reducción de Movimiento:** Desactiva animaciones para evitar sobrecarga vestibular.
- **Ruido de Fondo:** Generador de ruido blanco, rosa oarrón para la concentración.

### 4. Herramienta de Regulación (Fidget)
Incluye una herramienta interactiva basada en **Matter.js** (motor de física 2D) que funciona como un juego de resortera: el usuario arrastra y suelta una pelota para derribar torres de cubos coloridos. Los cubos rebotan en paredes laterales, creando una experiencia satisfactoria y predecible. El uso de esta herramienta se registra pasivamente (disparos, arrastres, duración) para entender los momentos de necesidad de regulación. Ver [formato de datos](./FIDGET_DATA_FORMAT.md).

### 5. Privacidad y Modelo de Datos "Local-First"
- **Almacenamiento Local:** Todos los datos (respuestas y configuraciones) se guardan exclusivamente en el `localStorage` del dispositivo del usuario.
- **Envío Proactivo:** No hay envío silencioso de datos a un servidor. El usuario debe explícitamente presionar "Enviar Datos", lo cual descarga un archivo JSON y abre su cliente de correo para enviarlo manualmente al equipo de investigación.

## Configuración Técnica

El proyecto está construido con:
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (Iconos)
- **Matter.js** (Motor de física 2D para el Fidget Tool)

### Variables de Entorno y Constantes
La configuración principal se encuentra en `constants.ts`.

#### Modo Desarrollador
Existe una constante `IS_DEVELOPER_MODE`.
- `true`: Desbloquea todas las semanas, habilita logs detallados en consola (especialmente para el Fidget/WebGL) y cambia el correo de destino a `hspencer@ead.cl`.
- `false`: Modo producción. Bloquea semanas futuras y dirige los datos a `vanessa.vega@pucv.cl`.

```typescript
// constants.ts
export const IS_DEVELOPER_MODE = true; 
```

## Estructura de Datos de la Sonda (JSON)

Al exportar los datos desde el menú "Preferencias", se genera un archivo JSON con la siguiente estructura:

```json
{
  "exportedAt": "2023-10-27T10:00:00.000Z", // Fecha y hora de la exportación
  "studyStartDate": "2023-10-01T09:00:00.000Z", // Fecha de firma de consentimiento (base para el desbloqueo semanal)
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...", // Identificador del navegador para debugging
    "screen": { "width": 390, "height": 844 } // Resolución de pantalla
  },
  "sensoryProfile": {
     "theme": "default", // default | warm | high-contrast
     "fontSize": "normal", // normal | large | extra
     "reducedMotion": false, // boolean
     "dyslexiaFont": false, // boolean
     "sound": "off", // off | white | pink | brown
     "soundVolume": 0.5 // 0.0 - 1.0
  },
  "progress": [
    {
      "id": 1,
      "isLocked": false,
      "activities": [
        {
          "id": "1.1",
          "title": "El mapa de calor personal",
          "isCompleted": true,
          "responses": [
            {
              "mode": "TEXT", // TEXT | AUDIO | PHOTO | VIDEO | SKIPPED
              "content": "Me gusta la biblioteca...", // Texto o String Base64 para medios
              "timestamp": 1698400000000
            }
          ]
        }
      ]
    },
    // ... Semanas 2, 3, 4
  ],
  "usageLogs": [
    {
      "timestamp": "2023-10-27T10:05:00.000Z",
      "type": "FIDGET_SESSION",
      "startTime": "2023-10-27T10:04:20.000Z",
      "durationSeconds": 45.2, // Duración total de la sesión
      "shots": 8, // Número de disparos (sueltas de la pelota)
      "drags": 12 // Número de arrastres (movimientos de la pelota)
    }
  ]
}
```

## 🚀 Instalación y Ejecución

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Ejecutar en desarrollo:**
    ```bash
    npm start
    # o dependiendo de tu script
    npm run dev
    ```

3.  **Construir para producción:**
    ```bash
    npm run build
    ```

## Uso como PWA
La aplicación está optimizada para móviles. En iOS (Safari) y Android (Chrome), se puede usar la opción "Agregar a Inicio" para instalarla como una aplicación nativa sin barras de navegación del navegador.

## Contacto
Para dudas técnicas o sobre el estudio:
- **Investigación:** vanessa.vega@pucv.cl
- **Diseño y Desarrollo:** hspencer@ead.cl