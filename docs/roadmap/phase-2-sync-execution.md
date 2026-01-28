# Phase 2: Sync & Execution

**Duration:** Weeks 5-8
**Focus:** Capability execution, synchronization, monitoring, and maintenance tools

---

## Overview

La Phase 2 se enfoca en hacer las capabilities ejecutables y mantener sincronizacion entre el proyecto local y los proveedores de IA. Tambien se implementan herramientas de monitoreo y mantenimiento.

---

## Prerequisites

Antes de iniciar Phase 2, debe estar completo:
- [x] Comandos basicos (`init`, `config`, `help`, `version`)
- [x] Conexion a proveedores (`connect`, `disconnect`, `providers`)
- [x] Gestion basica de capabilities (`search`, `install`, `list`, `info`, `uninstall`)

---

## Goals

- [ ] Implementar ejecucion de capabilities (`run`)
- [ ] Sistema de sincronizacion (`sync`)
- [ ] Monitoreo de estado (`status`)
- [ ] Actualizacion de capabilities (`update`)
- [ ] Herramienta de diagnostico (`doctor`)
- [ ] Limpieza de cache (`clean`)

---

## Week 5: Capability Execution Engine

### Tasks

#### 5.1 Execution Runtime
- [ ] Disenar arquitectura del execution engine
- [ ] Crear `ExecutionEngine` class
- [ ] Implementar carga dinamica de capabilities
- [ ] Implementar contexto de ejecucion
- [ ] Manejar parametros de entrada

```typescript
interface ExecutionContext {
  capability: Capability;
  provider: ProviderAdapter;
  config: Record<string, any>;
  input: ExecutionInput;
  output: ExecutionOutput;
}
```

**Deliverable:** Engine de ejecucion base

#### 5.2 Run Command - Basic
- [ ] Implementar `synapsync run <capability>`
- [ ] Parsear opciones: `--file`, `--dir`, `--provider`
- [ ] Mostrar progress durante ejecucion
- [ ] Formatear output de resultados
- [ ] Manejar errores de ejecucion

**Deliverable:** Comando run basico funcional

#### 5.3 Run Command - Advanced Options
- [ ] Implementar `--output` (json, yaml, table, text)
- [ ] Implementar `--recursive` para directorios
- [ ] Implementar `--severity` para filtrar resultados
- [ ] Implementar `--dry-run` para preview
- [ ] Implementar `--watch` (placeholder para Phase 4)

**Deliverable:** Comando run con todas las opciones

#### 5.4 Output Formatters
- [ ] Crear formatter para resultados de code review
- [ ] Crear formatter para resultados de tests
- [ ] Crear formatter para reportes genericos
- [ ] Guardar reportes a archivos (`./synapsync-reports/`)

**Deliverable:** Sistema de formateo de output

### Acceptance Criteria Week 5
```bash
# Ejecutar capability basica
synapsync run code-reviewer --file src/app.ts

# Ejecutar con provider especifico
synapsync run code-reviewer --file src/app.ts --provider openai

# Ejecutar recursivamente
synapsync run code-reviewer --dir src/ --recursive

# Output en JSON
synapsync run code-reviewer --file src/app.ts --output json
```

---

## Week 6: Synchronization System

> **Note:** Ver [Skill Architecture](../technical/skill-architecture.md) para detalles de la estructura de directorios y sync.

### Tasks

#### 6.1 Sync State Management
- [ ] Disenar modelo de estado de sync
- [ ] Crear `SyncStateManager`
- [ ] Implementar tracking de skills por departamento
- [ ] Implementar manifest de sync (`skills.manifest.json`)

```typescript
interface SyncState {
  lastSync: Date;
  skills: {
    [skillName: string]: {
      department: string;
      version: string;
      hash: string;
      syncedTo: string[];  // ['claude', 'gemini']
      method: 'symlink' | 'copy';
    };
  };
  providers: {
    [provider: string]: {
      lastSync: Date;
      method: 'symlink' | 'copy';
      skillCount: number;
    };
  };
}
```

**Deliverable:** Sistema de estado de sync

#### 6.2 Sync Engine
- [ ] Crear `SyncEngine` service
- [ ] Implementar listado de skills por departamento
- [ ] Implementar creacion de symlinks (metodo recomendado)
- [ ] Implementar copia de archivos (fallback)
- [ ] Detectar si sistema soporta symlinks
- [ ] Crear estructura flat en providers:
  ```
  .agents/skills/{dept}/{name}/  ->  .claude/skills/{name}/
  ```
- [ ] Manejar conflictos de nombres entre departamentos

**Deliverable:** Engine de sincronizacion con symlinks

#### 6.3 Sync Command
- [ ] Implementar `synapsync sync`
- [ ] Mostrar skills disponibles agrupadas por departamento
- [ ] Prompt interactivo para seleccionar:
  - Skills a sincronizar (all, by department, individual)
  - Providers destino (claude, gemini, codex, etc.)
  - Metodo (symlink recomendado, copy)
- [ ] Implementar `--provider <name>` para sync a provider especifico
- [ ] Implementar `--department <name>` para sync por departamento
- [ ] Implementar `--symlink` (default) y `--copy`
- [ ] Implementar `--dry-run`
- [ ] Implementar `--yes` para non-interactive
- [ ] Implementar sync de skill especifica

**Deliverable:** Comando sync funcional con soporte symlink/copy

#### 6.4 Status Command
- [ ] Implementar `synapsync status`
- [ ] Mostrar resumen del proyecto
- [ ] Mostrar estado de providers
- [ ] Mostrar estado de capabilities
- [ ] Mostrar issues pendientes
- [ ] Sugerir acciones a tomar
- [ ] Implementar `--verbose` y `--json`

**Deliverable:** Comando status funcional

### Acceptance Criteria Week 6
```bash
# Ver estado del proyecto
synapsync status
# -> Muestra providers, skills por departamento, sync status

# Sincronizar (interactivo)
synapsync sync
# -> Muestra skills por departamento
# -> Pregunta: all / by department / individual
# -> Pregunta: claude / gemini / codex (seleccion multiple)
# -> Pregunta: symlink (recomendado) / copy
# -> Crea symlinks/copies en .claude/skills/, .gemini/skills/, etc.

# Dry run
synapsync sync --dry-run
# -> Muestra que haria sin ejecutar

# Non-interactive con defaults
synapsync sync --yes
# -> Usa config: todos los skills, todos los providers, symlink

# Sync a provider especifico
synapsync sync --provider claude

# Sync por departamento
synapsync sync --department frontend
# -> Solo skills de frontend/

# Sync skill especifico
synapsync sync code-reviewer

# Forzar copia en vez de symlink
synapsync sync --copy

# Verificar resultado
ls -la .claude/skills/
# -> code-reviewer -> ../../.agents/skills/general/code-reviewer
# -> react-patterns -> ../../.agents/skills/frontend/react-patterns
```

---

## Week 7: Update & Maintenance

### Tasks

#### 7.1 Update System
- [ ] Implementar check de versiones disponibles
- [ ] Comparar versiones instaladas vs registry
- [ ] Crear changelog parser

**Deliverable:** Sistema de deteccion de updates

#### 7.2 Update Command
- [ ] Implementar `synapsync update [capability]`
- [ ] Mostrar changelog antes de update
- [ ] Confirmar update con usuario
- [ ] Implementar `synapsync update --all`
- [ ] Mantener backup pre-update
- [ ] Rollback en caso de error

**Deliverable:** Comando update funcional

#### 7.3 Doctor Command
- [ ] Implementar `synapsync doctor`
- [ ] Check de requisitos del sistema (Node, npm)
- [ ] Check de configuracion
- [ ] Check de providers (conexion, auth)
- [ ] Check de capabilities (integridad, deps)
- [ ] Check de registry (conectividad)
- [ ] Implementar `--fix` para auto-fix
- [ ] Mostrar recomendaciones

**Deliverable:** Comando doctor funcional

#### 7.4 Clean Command
- [ ] Implementar `synapsync clean`
- [ ] Limpiar cache (`.synapsync/cache/`)
- [ ] Limpiar archivos temporales
- [ ] Limpiar logs antiguos
- [ ] Opciones: `--cache`, `--logs`, `--all`
- [ ] Mostrar espacio liberado

**Deliverable:** Comando clean funcional

### Acceptance Criteria Week 7
```bash
# Ver updates disponibles
synapsync list --outdated

# Actualizar capability
synapsync update code-reviewer
# -> Muestra changelog, confirma, actualiza

# Actualizar todo
synapsync update --all

# Diagnosticar problemas
synapsync doctor
# -> Check completo del sistema

# Auto-fix
synapsync doctor --fix

# Limpiar cache
synapsync clean --cache
synapsync clean --all
```

---

## Week 8: Polish & Integration

### Tasks

#### 8.1 Error Handling Improvements
- [ ] Mejorar mensajes de error en todos los comandos
- [ ] Agregar sugerencias de solucion
- [ ] Implementar error codes consistentes
- [ ] Logging detallado para debug

**Deliverable:** Mejor experiencia de errores

#### 8.2 Progress & Feedback
- [ ] Mejorar spinners y progress bars
- [ ] Agregar confirmaciones claras
- [ ] Agregar tips contextuales
- [ ] Mejorar output en CI (no-TTY)

**Deliverable:** Mejor feedback visual

#### 8.3 Exec Command
- [ ] Implementar `synapsync exec <command>`
- [ ] Ejecutar comandos arbitrarios con AI
- [ ] Implementar `--interactive` mode
- [ ] Historial de comandos

**Deliverable:** Comando exec funcional

#### 8.4 Integration Testing
- [ ] Tests E2E para run command
- [ ] Tests E2E para sync flow
- [ ] Tests E2E para update flow
- [ ] Tests E2E para doctor
- [ ] Test en diferentes OS

**Deliverable:** Suite de tests completa

#### 8.5 Documentation Update
- [ ] Actualizar README con nuevos comandos
- [ ] Documentar flujos de uso comunes
- [ ] Agregar troubleshooting guide
- [ ] Actualizar help texts

**Deliverable:** Documentacion actualizada

### Acceptance Criteria Week 8
```bash
# Ejecutar comando AI arbitrario
synapsync exec "explain this codebase"
synapsync exec "find security issues"

# Interactive mode
synapsync exec -i
synapsync> analyze this function
synapsync> exit

# Todos los flujos funcionan end-to-end
# Tests pasando en CI
# Documentacion completa
```

---

## Technical Specifications

### New Services in Phase 2

```
src/services/
├── execution/
│   ├── ExecutionEngine.ts
│   ├── ExecutionContext.ts
│   ├── RuntimeLoader.ts
│   └── types.ts
├── sync/
│   ├── SyncEngine.ts
│   ├── SyncStateManager.ts
│   ├── ChangeDetector.ts
│   └── types.ts
└── maintenance/
    ├── DoctorService.ts
    ├── UpdateChecker.ts
    └── CacheCleaner.ts
```

### New Commands Structure

```
src/cli/commands/
├── run.ts
├── exec.ts
├── sync.ts
├── status.ts
├── update.ts
├── doctor.ts
└── clean.ts
```

### Execution Flow

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Command   │────>│  Execution   │────>│   Provider    │
│   (run)     │     │   Engine     │     │   Adapter     │
└─────────────┘     └──────────────┘     └───────────────┘
                           │
                           v
                    ┌──────────────┐
                    │  Capability  │
                    │   Runtime    │
                    └──────────────┘
                           │
                           v
                    ┌──────────────┐
                    │   Output     │
                    │  Formatter   │
                    └──────────────┘
```

### Sync Flow

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Local     │────>│    Sync      │────>│   Provider    │
│   State     │     │   Engine     │     │   API         │
└─────────────┘     └──────────────┘     └───────────────┘
       │                   │                     │
       v                   v                     v
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Detect     │     │   Resolve    │     │   Apply       │
│  Changes    │     │  Conflicts   │     │   Changes     │
└─────────────┘     └──────────────┘     └───────────────┘
```

---

## Testing Requirements

### Unit Tests

- [ ] ExecutionEngine tests
- [ ] SyncEngine tests
- [ ] SyncStateManager tests
- [ ] DoctorService tests
- [ ] UpdateChecker tests
- [ ] CacheCleaner tests

### Integration Tests

- [ ] Run command with mock capability
- [ ] Sync flow with mock provider
- [ ] Update flow with mock registry
- [ ] Doctor checks

### E2E Tests

- [ ] Full run flow (install -> run -> view results)
- [ ] Full sync flow (modify -> sync -> verify)
- [ ] Full update flow (check -> update -> verify)
- [ ] Doctor diagnose and fix

---

## Definition of Done

Phase 2 se considera completa cuando:

1. **Todos los comandos implementados:**
   - `run` con todas las opciones
   - `exec` basico e interactivo
   - `sync` con preview y opciones
   - `status` con detalles completos
   - `update` individual y masivo
   - `doctor` con auto-fix
   - `clean` con opciones

2. **Tests pasando:**
   - Unit tests con coverage >= 75%
   - Integration tests para flujos principales
   - E2E tests pasando

3. **Calidad:**
   - Errores manejados gracefully
   - Feedback visual consistente
   - Performance aceptable (<5s para operaciones comunes)

4. **Documentacion:**
   - Todos los comandos documentados
   - Troubleshooting guide
   - Flujos de uso documentados

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Execution engine complejo | Empezar simple, iterar |
| Sync conflicts dificiles | Estrategia simple (last-write-wins) para MVP |
| Performance en proyectos grandes | Implementar caching, lazy loading |
| Variabilidad de output entre providers | Normalizar respuestas en adapters |

---

## Notes

- La ejecucion de capabilities es el core del producto - invertir tiempo en hacerlo bien
- El sync puede ser complejo - mantener simple para MVP, mejorar en fases posteriores
- Doctor es critico para soporte - hacerlo comprehensivo
- Considerar integracion con CI/CD desde el inicio
