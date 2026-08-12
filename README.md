# Sonda Digital - Proyecto FONDECYT 1251541

**Sonda** es una Aplicación Web Progresiva (PWA) diseñada como una sonda de diseño (design probe) para estudiantes universitarios en el espectro autista.

**Deployment:** [https://accesibilidad-inclusion.github.io/sonda](https://accesibilidad-inclusion.github.io/sonda)
**Versión:** 3.0 (rama `dev`)

Su objetivo es recolectar experiencias cualitativas sobre barreras, facilitadores y estrategias de autorregulación en el entorno académico, respetando la privacidad y las necesidades sensoriales de los participantes. El diseño de actividades está fundamentado en la **Teoría de la Agencia Causal (TAC)**.

**Documentación:**
- [Guión completo de actividades y preguntas](./SONDA_QUESTIONS.md) - Estructura TAC, diseño anti-ambigüedad, ejemplos
- [Formato de datos del Fidget](./FIDGET_DATA_FORMAT.md) - Estructura de tracking del fidget interactivo
- [Sistema de Diseño](./DESIGN_SYSTEM.md) - Tokens, temas, tipografía, accesibilidad

## Contexto del Proyecto

Esta aplicación es parte del proyecto de investigación:
> **"Promoción del aprendizaje de habilidades de autodeterminación en estudiantes con TEA en educación superior: Diseño y evaluación de una propuesta formativa basada en la Teoría de la Agencia Causal."**
>
> **Financiamiento:** FONDECYT Regular N° 1251541 (ANID).
> **Investigadora Responsable:** Dra. Vanessa Vega Córdova (PUCV).

## Características Principales

### 1. Estructura de 12 Momentos (Teoría de la Agencia Causal)

La experiencia se organiza en **12 momentos** más una entrada sensorial y un cierre opcional, alineados con las tres dimensiones de la TAC:

- **Entrada (Momento 1):** autoconocimiento sensorial — mapa de lugares, cazadores de ruido/luz
- **Acciones Volitivas (Momentos 2–4):** autonomía, autoiniciación, control inhibitorio
- **Acciones Agenciales (Momentos 5–8):** autodirección, autorregulación, pensar en alternativas, flexibilidad cognitiva
- **Creencias de Control-Acción (Momentos 9–11):** empoderamiento, autoconcepto, control de expectativas
- **Cierre (opcional):** mensaje al futuro

Los momentos se desbloquean progresivamente en días hábiles (uno por día o cada dos días). Ver [el guión completo](SONDA_QUESTIONS.md).

### 2. Respuestas Multimodales

Los participantes pueden responder a las actividades mediante:
- Texto
- Audio
- Fotografía

### 3. Perfil Sensorial Personalizable

La aplicación incluye un menú de accesibilidad cognitiva y sensorial:
- **Temas Visuales:** Calma (azules), Cálido (sepia), Alto Contraste (negro/amarillo)
- **Tipografía:** ajuste de tamaño y fuente especial para dislexia
- **Reducción de Movimiento:** desactiva animaciones para evitar sobrecarga vestibular
- **Ruido de Fondo:** generador de ruido blanco, rosa o marrón para la concentración

### 4. Herramienta de Regulación (Fidget)

Incluye una herramienta interactiva basada en **Matter.js** (motor de física 2D): el usuario arrastra y suelta una pelota para derribar torres de cubos coloridos. Siempre accesible, sin importar el avance en los momentos del estudio.

El registro de uso (disparos, arrastres, duración) es **opt-in**: se activa solo si el participante otorga consentimiento explícito durante la pantalla introductoria del fidget, y puede revocarse desde Preferencias en cualquier momento. Ver [formato de datos y política de consentimiento](./FIDGET_DATA_FORMAT.md).

### 5. Privacidad y Modelo de Datos "Local-First"

- **Almacenamiento:** los datos de progreso y logs de fidget se guardan en **IndexedDB** del dispositivo. Los flags de sesión (consentimiento, onboarding, perfil sensorial) se guardan en `localStorage`. No hay servidor ni sincronización en la nube.
- **Exportación selectiva y cifrada:** el participante accede a una pantalla de revisión con tres checkboxes (bitácora, mensaje al futuro, uso del fidget), todos marcados por defecto. Al confirmar, se genera un archivo `.sonda` cifrado con **RSA-OAEP-256 + AES-256-GCM**. Solo el equipo investigador con la clave privada puede leer el contenido.
- **Envío proactivo:** en móvil (iOS/Android), el share sheet del sistema permite adjuntar el archivo directamente. En escritorio, se descarga y el participante lo adjunta manualmente al correo.
- **Retiro explícito:** el participante puede retirarse del estudio desde "Ayuda" → "Retirarse del estudio", lo que abre un correo pre-redactado al equipo. El borrado de datos del dispositivo es una acción separada y confirma antes de ejecutarse.
- **Herramienta de descifrado:** `tools/descifrar.html` es una página HTML autocontenida (sin dependencias externas) para que el equipo investigador descifre los archivos `.sonda` localmente, sin enviar datos a internet.

## Configuración Técnica

El proyecto está construido con:
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (iconos)
- **Matter.js** (motor de física 2D para el Fidget)

### Servicios principales

| Archivo | Rol |
|---------|-----|
| `services/db.ts` | Wrapper de IndexedDB (`idbGet`, `idbSet`, `idbClear`, `requestPersistence`) |
| `services/migration.ts` | Migración one-shot de localStorage → IndexedDB al arrancar |
| `services/crypto.ts` | Cifrado de exportaciones (RSA-OAEP-256 + AES-256-GCM) |
| `services/storageService.ts` | Fachada de persistencia: progreso (IDB), logs (IDB), flags (localStorage) |
| `tools/descifrar.html` | Herramienta offline para descifrar archivos `.sonda` (solo equipo investigador) |

### Variables de Entorno y Constantes

La configuración principal se encuentra en `constants.ts`.

#### Modo Desarrollador

Existe una constante `IS_DEVELOPER_MODE`:
- `true`: desbloquea todos los momentos, habilita logs detallados en consola y cambia el correo de destino a `hspencer@ead.cl`.
- `false`: modo producción. Bloquea momentos futuros y dirige los datos a `vanessa.vega@pucv.cl`.

```typescript
// constants.ts
export const IS_DEVELOPER_MODE = true;
```

## Estructura de Datos (esquema 2.0)

Al exportar, se genera un archivo `.sonda` cifrado. Al descifrarlo con `tools/descifrar.html`, el JSON tiene esta forma (esquema 2.0):

```json
{
  "schemaVersion": "2.0",
  "exportedAt": "2026-08-12T10:00:00.000Z",
  "studyStartDate": "2026-07-01T09:00:00.000Z",
  "seleccion": { "bitacora": true, "mensajeAlFuturo": true, "fidget": true },
  "omitido":   { "bitacora": false, "mensajeAlFuturo": false, "fidget": false },
  "progress": [
    {
      "id": 1,
      "tac_dimension": "entrada",
      "tac_subdimension": "sensorial",
      "isLocked": false,
      "activities": [
        {
          "id": "1.A",
          "title": "Mapa de lugares",
          "isCompleted": true,
          "responses": [
            {
              "mode": "TEXT",
              "content": "Me siento seguro en la biblioteca...",
              "timestamp": 1698400000000
            }
          ]
        }
      ]
    }
  ],
  "sensoryProfile": { "theme": "calm", "fontSize": "normal", "reducedMotion": false, "dyslexiaFont": false, "sound": "off", "soundVolume": 0.5 },
  "usageLogs": [
    {
      "type": "FIDGET_SESSION",
      "startTime": "2026-08-12T10:04:20.000Z",
      "durationSeconds": 45.2,
      "shots": 8,
      "drags": 12,
      "timestamp": "2026-08-12T10:05:05.000Z"
    }
  ],
  "deviceInfo": { "userAgent": "Mozilla/5.0...", "screen": { "width": 390, "height": 844 } }
}
```

Si el participante omitió alguna sección, el campo `omitido.<sección>` será `true` y el contenido correspondiente (`progress` sin esos momentos, o `usageLogs: []`) lo reflejará.

## Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

## Uso como PWA

La aplicación está optimizada para móviles. En iOS (Safari) y Android (Chrome), se puede usar la opción "Agregar a Inicio" para instalarla como una aplicación nativa sin barras de navegación del navegador.

## Contacto

- **Investigación:** vanessa.vega@pucv.cl
- **Diseño y Desarrollo:** hspencer@ead.cl
