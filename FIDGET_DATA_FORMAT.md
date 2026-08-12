# Formato de Datos del Fidget Digital

## Descripción del Fidget

El fidget es un juego interactivo de física 2D (basado en Matter.js) donde el usuario:
1. Arrastra una pelota blanca desde un punto de anclaje central
2. Suelta la pelota para dispararla hacia torres de cubos coloridos
3. Los cubos caen y rebotan en las paredes laterales
4. Después de 2 segundos, aparece una nueva pelota lista para disparar

Este juego proporciona una experiencia satisfactoria y predecible de causa-efecto, útil para la autorregulación.

## Consentimiento requerido

**Las sesiones solo se registran si el participante otorgó consentimiento explícito** durante la pantalla `FidgetIntroScreen` (antes de usar el fidget por primera vez). El consentimiento es:

- **Opt-in**: el registro está desactivado por defecto; el participante elige activarlo.
- **Revocable**: desde Preferencias → "Registro del Fidget", el participante puede desactivarlo en cualquier momento. Al revocar, **todos los logs previos se eliminan** de IndexedDB.
- **Persistente**: la decisión se guarda en `localStorage` (`sonda_fidget_consent: { granted, decidedAt }`).

Si el participante no otorgó consentimiento, ninguna sesión se guarda, independientemente del uso del fidget.

## Sesión de Fidget Guardada

Cuando un usuario termina una sesión de fidget (y tiene consentimiento activo), se guarda la siguiente estructura en IndexedDB (`sonda_usage`):

```json
{
  "type": "FIDGET_SESSION",
  "startTime": "2026-02-11T14:30:45.123Z",
  "durationSeconds": 45.5,
  "shots": 8,
  "drags": 12,
  "timestamp": "2026-02-11T14:31:30.456Z"
}
```

### Campos:
- **type**: Tipo de evento (siempre "FIDGET_SESSION" para sesiones de fidget)
- **startTime**: Hora ISO cuando el usuario comenzó la sesión
- **durationSeconds**: Duración total de la sesión en segundos
- **shots**: Número de disparos (veces que la pelota se soltó y voló libremente)
- **drags**: Número total de arrastres de la pelota (cuenta cada vez que se agarra la pelota)
- **timestamp**: Hora ISO cuando el log fue guardado (añadido automáticamente)

## Acceso a los Datos

### Usar en código:
```typescript
// loadUsageLogs es async (almacenamiento en IndexedDB)
const logs = await storageService.loadUsageLogs();
const fidgetSessions = logs.filter((log: any) => log.type === 'FIDGET_SESSION');
```

### En el archivo exportado (.sonda):
El archivo `.sonda` es un sobre cifrado (RSA-OAEP-256 + AES-256-GCM). Al descifrarlo con `tools/descifrar.html`, el JSON descifrado tiene esquema 2.0:

```json
{
  "schemaVersion": "2.0",
  "exportedAt": "2026-02-11T14:35:00.000Z",
  "seleccion": { "bitacora": true, "mensajeAlFuturo": true, "fidget": true },
  "omitido":   { "bitacora": false, "mensajeAlFuturo": false, "fidget": false },
  "usageLogs": [
    {
      "type": "FIDGET_SESSION",
      "startTime": "2026-02-11T14:30:45.123Z",
      "durationSeconds": 45.5,
      "shots": 8,
      "drags": 12,
      "timestamp": "2026-02-11T14:31:30.456Z"
    }
  ]
}
```

> Si el participante **deseleccionó** la sección fidget en la pantalla de exportación, `usageLogs` vendrá como `[]` y `omitido.fidget` será `true`.

## Interpretación de Datos

- **startTime + durationSeconds**: Puedes calcular cuándo terminó (endTime = startTime + durationSeconds)
- **shots**: Indica cuántas veces el usuario completó el ciclo de arrastrar → soltar → disparar
  - Valor bajo (1-3): Sesión corta o exploratoria
  - Valor medio (4-10): Sesión típica de regulación
  - Valor alto (>10): Sesión extendida, posible alta necesidad de regulación
- **drags**: Métrica de actividad total (incluye arrastres sin disparar)
  - drags > shots: Usuario está experimentando o reposicionando la pelota sin disparar
  - drags ≈ shots: Usuario está disparando consistentemente en cada intento
- **timestamp**: Diferencia con startTime te da el delay entre cuando terminó y cuándo se guardó

## Métricas Derivadas

Puedes calcular métricas adicionales:
- **Tiempo promedio por disparo**: `durationSeconds / shots`
- **Ratio de eficiencia**: `shots / drags` (0-1, donde 1 = cada drag resulta en un shot)
- **Frecuencia de uso**: Número de sesiones por día/semana
