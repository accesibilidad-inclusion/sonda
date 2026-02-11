# Formato de Datos del Fidget Digital

## Sesión de Fidget Guardada

Cuando un usuario termina una sesión de fidget, se guarda la siguiente estructura en `usageLogs`:

```json
{
  "type": "FIDGET_SESSION",
  "startTime": "2026-02-11T14:30:45.123Z",
  "durationSeconds": 45.5,
  "intensity": "medium",
  "interactions": 125,
  "timestamp": "2026-02-11T14:31:30.456Z"
}
```

### Campos:
- **type**: Tipo de evento (siempre "FIDGET_SESSION" para sesiones de fidget)
- **startTime**: Hora ISO cuando el usuario comenzó la sesión
- **durationSeconds**: Duración total de la sesión en segundos
- **intensity**: 
  - `"low"`: ≤ 50 interacciones
  - `"medium"`: 51-200 interacciones
  - `"high"`: > 200 interacciones
- **interactions**: Número total de "splats" (toques/movimientos) durante la sesión
- **timestamp**: Hora ISO cuando el log fue guardado (añadido automáticamente)

## Acceso a los Datos

### Usar en código:
```typescript
const logs = storageService.loadUsageLogs();
const fidgetSessions = logs.filter(log => log.type === 'FIDGET_SESSION');
```

### En el archivo exportado:
Los datos de fidget se incluyen automáticamente en `usageLogs` cuando se exportan:
```json
{
  "exportedAt": "2026-02-11T14:35:00.000Z",
  "usageLogs": [
    { "type": "FIDGET_SESSION", ... },
    { "type": "FIDGET_SESSION", ... }
  ]
}
```

## Interpretación de Datos

- **startTime + durationSeconds**: Puedes calcular cuándo terminó (endTime = startTime + durationSeconds)
- **intensity**: Indica el nivel de engagement del usuario
- **interactions**: Métrica bruta de actividad
- **timestamp**: Diferencia con startTime te da el delay entre cuando terminó y cuándo se guardó
