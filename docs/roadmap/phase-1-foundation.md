# Phase 1: Core Foundation

**Duration:** Weeks 1-4
**Focus:** CLI framework, basic commands, provider connections, cognitive management
**Status:** In Progress

---

## Overview

La Phase 1 establece los cimientos del proyecto SynapSync CLI. El objetivo es tener una CLI funcional con los comandos esenciales, modo interactivo REPL, y la capacidad de gestionar cognitives de IA.

---

## Goals

- [x] Configurar el proyecto con TypeScript y tooling moderno
- [x] Implementar la estructura base del CLI
- [x] Crear la pantalla de bienvenida con logo ASCII
- [x] Implementar modo interactivo REPL
- [x] Implementar comandos basicos: `help`, `version`, `info`
- [ ] Implementar comandos de proyecto: `init`, `config`, `status`
- [ ] Sistema de conexion a proveedores: `connect`, `disconnect`, `providers`
- [ ] Gestion de cognitives: `search`, `install`, `list`, `uninstall`

---

## Week 1: Project Setup & CLI Framework ✅ COMPLETED

### Tasks

#### 1.1 Project Initialization ✅

- [x] Crear estructura de carpetas del proyecto
- [x] Configurar `package.json` con scripts y metadatos
- [x] Configurar TypeScript (`tsconfig.json`) con tipado estricto
- [x] Configurar ESLint con reglas estrictas de tipos
- [x] Configurar Prettier
- [x] Configurar build process con tsup

**Deliverable:** Proyecto compilable con `npm run build` ✅

#### 1.2 CLI Framework Setup ✅

- [x] Instalar y configurar Commander.js
- [x] Crear entry point principal (`src/index.ts`)
- [x] Configurar bin entry en package.json
- [x] Implementar estructura base de comandos
- [x] Configurar manejo global de errores

**Deliverable:** CLI ejecutable con `synapsync --help` ✅

#### 1.3 Welcome Screen & REPL ✅

- [x] Disenar ASCII art del logo con gradiente
- [x] Implementar pantalla de bienvenida
- [x] Implementar modo interactivo REPL
- [x] Mostrar tips y quick start
- [x] Comandos REPL: `/help`, `/clear`, `/exit`, `/version`, `/info`

**Deliverable:** `synapsync` muestra pantalla de bienvenida y entra en modo REPL ✅

#### 1.4 Core Infrastructure ✅

- [x] Logger centralizado (`src/utils/logger.ts`)
- [x] Constantes y tipos core (`src/core/constants.ts`)
- [x] Tipos de cognitives definidos (`src/types/index.ts`)
- [x] Sistema de colores por categoria y tipo (`src/ui/colors.ts`)

**Deliverable:** Infraestructura base lista ✅

### Acceptance Criteria Week 1 ✅

```bash
# El CLI se puede instalar localmente
npm link ✅

# Muestra pantalla de bienvenida y entra en REPL
synapsync ✅

# Muestra ayuda
synapsync --help ✅

# Modo interactivo funciona
synapsync
> /help ✅
> /version ✅
> /info --cognitives ✅
```

---

## Week 1.5: Cognitive Type System ✅ COMPLETED (NEW)

> Semana adicional para establecer el sistema de tipos de cognitives.

### Tasks

#### 1.5.1 Multi-Cognitive Type System ✅

- [x] Definir 5 tipos de cognitives: `skill`, `agent`, `prompt`, `workflow`, `tool`
- [x] Archivos por tipo: `SKILL.md`, `AGENT.md`, `PROMPT.md`, `WORKFLOW.yaml`, `TOOL.md`
- [x] Tipos TypeScript completos para cada cognitive type
- [x] Constantes de configuracion por tipo

#### 1.5.2 Cognitive Detection System ✅

- [x] Parser de fuentes de instalacion (`src/services/cognitive/detector.ts`)
- [x] Deteccion por flag explicito (`--type skill`)
- [x] Deteccion por registry (placeholder)
- [x] Deteccion por archivo local (escanea SKILL.md, AGENT.md, etc.)
- [x] Deteccion por GitHub API
- [x] Prompt interactivo como fallback (`src/services/cognitive/prompter.ts`)

#### 1.5.3 Installation Sources ✅

- [x] Registry: `synapsync install code-reviewer`
- [x] Local: `synapsync install ./path/to/cognitive`
- [x] GitHub shorthand: `synapsync install github:user/repo`
- [x] GitHub path: `synapsync install github:user/repo/cognitives/skill`
- [x] GitHub branch: `synapsync install github:user/repo#develop`
- [x] GitHub URL: `synapsync install https://github.com/user/repo`

#### 1.5.4 Info Command ✅

- [x] Comando `/info` con topics de documentacion
- [x] `/info --cognitives` - Tipos de cognitives
- [x] `/info --install` - Fuentes de instalacion y deteccion
- [x] `/info --providers` - Proveedores soportados
- [x] `/info --categories` - Categorias de organizacion
- [x] `/info --sync` - Como funciona sync
- [x] `/info --structure` - Estructura de proyecto

**Deliverable:** Sistema de cognitives completamente tipado con deteccion automatica ✅

---

## Week 2: Basic Commands ✅ COMPLETED

### Tasks

#### 2.1 Help Command ✅

- [x] Implementar `synapsync help`
- [x] Implementar `synapsync help <command>`
- [x] Formatear output con colores y estructura clara
- [x] Mostrar argumentos disponibles para cada comando

**Deliverable:** Sistema de ayuda completo ✅

#### 2.2 Version Command ✅

- [x] Implementar `synapsync version`
- [x] Mostrar version del CLI
- [x] Mostrar version de Node.js
- [x] Mostrar plataforma
- [x] Implementar `--check` para ver updates disponibles

**Deliverable:** `synapsync version` funcional ✅

#### 2.3 Init Command ✅

- [x] Implementar `synapsync init`
- [x] Crear prompts interactivos (nombre, descripcion, providers)
- [x] Generar estructura de proyecto:
  - `.synapsync/` directory con subdirectorios por tipo
  - `synapsync.config.yaml`
  - `manifest.json`
  - `.gitignore` actualizado
- [x] Mostrar next steps al usuario
- [x] Opcion `-y, --yes` para modo no-interactivo

**Deliverable:** Comando init genera proyecto correctamente ✅

#### 2.4 Config Command ✅

- [x] Implementar `synapsync config list`
- [x] Implementar `synapsync config get <key>`
- [x] Implementar `synapsync config set <key> <value>`
- [x] Crear ConfigManager en services (`src/services/config/`)

**Deliverable:** Sistema de configuracion completo ✅

#### 2.5 Status Command ✅

- [x] Implementar `synapsync status`
- [x] Mostrar estado de inicializacion
- [x] Mostrar cognitives instalados por tipo
- [x] Mostrar providers habilitados
- [x] Mostrar timestamp de ultima actualizacion

**Deliverable:** Comando status funcional ✅

### Acceptance Criteria Week 2 ✅

```bash
# Inicializar proyecto
synapsync init ✅
# -> Crea .synapsync/, synapsync.config.yaml

# Ver configuracion
synapsync config list ✅

# Modificar configuracion
synapsync config set cli.theme dark ✅
synapsync config get cli.theme ✅
# -> dark

# Ver estado del proyecto
synapsync status ✅

# Verificar actualizaciones
synapsync version --check ✅
```

---

## Week 3: Provider Management (PENDING)

### Tasks

#### 3.1 Provider Adapter Interface

- [ ] Definir interfaz base `ProviderAdapter`
- [ ] Definir tipos comunes para providers
- [ ] Crear factory de providers
- [ ] Implementar health check interface

```typescript
interface ProviderAdapter {
  name: SupportedProvider;
  connect(credentials: Credentials): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<ProviderHealthStatus>;
}
```

**Deliverable:** Interfaz de adapter definida

#### 3.2 Claude Adapter

- [ ] Implementar `ClaudeAdapter`
- [ ] Configurar Anthropic SDK
- [ ] Implementar autenticacion
- [ ] Implementar health check

**Deliverable:** Adapter de Claude funcional

#### 3.3 OpenAI Adapter

- [ ] Implementar `OpenAIAdapter`
- [ ] Configurar OpenAI SDK
- [ ] Implementar autenticacion
- [ ] Implementar health check

**Deliverable:** Adapter de OpenAI funcional

#### 3.4 Connect/Disconnect Commands

- [ ] Implementar `synapsync connect`
- [ ] Implementar `synapsync connect <provider>`
- [ ] Implementar `synapsync disconnect <provider>`
- [ ] Guardar credenciales de forma segura

**Deliverable:** Comandos connect/disconnect funcionales

#### 3.5 Providers Command

- [ ] Implementar `synapsync providers`
- [ ] Mostrar tabla de providers conectados
- [ ] Mostrar status de cada provider

**Deliverable:** Comando providers funcional

### Acceptance Criteria Week 3

```bash
# Conectar a Claude
synapsync connect claude
# -> Prompt para API key
# -> Guarda en keychain
# -> Muestra status

# Listar providers
synapsync providers
# -> Tabla con status de cada provider

# Desconectar
synapsync disconnect claude
```

---

## Week 4: Cognitive Management (PENDING)

> **Note:** Ver [Cognitive Architecture](../technical/cognitive-architecture.md) para detalles completos.

### Tasks

#### 4.1 Registry Client

- [ ] Crear `RegistryClient` service
- [ ] Implementar busqueda de cognitives
- [ ] Implementar descarga de cognitives
- [ ] Implementar cache local

> **Note:** Para MVP, el registry puede ser un repositorio de GitHub o JSON estatico.

**Deliverable:** Cliente de registry funcional

#### 4.2 Search Command

- [ ] Implementar `synapsync search [query]`
- [ ] Mostrar resultados formateados
- [ ] Implementar filtros: `--tag`, `--type`, `--category`
- [ ] Paginacion de resultados

**Deliverable:** Comando search funcional

#### 4.3 Install Command

- [ ] Implementar `synapsync install <cognitive>`
- [ ] Implementar `synapsync install <cognitive>@<version>`
- [ ] Soportar todas las fuentes de instalacion (registry, local, GitHub)
- [ ] Auto-detectar tipo de cognitive (skill, agent, prompt, etc.)
- [ ] Prompt interactivo si tipo no detectado
- [ ] Actualizar `manifest.json`
- [ ] Opcion `--type` para tipo explicito
- [ ] Opcion `--category` para categoria explicita
- [ ] Opcion `--global` para instalacion global

**Deliverable:** Comando install funcional con deteccion de tipos

#### 4.4 List Command

- [ ] Implementar `synapsync list`
- [ ] Mostrar cognitives instalados por tipo
- [ ] Opciones: `--type`, `--category`, `--global`

**Deliverable:** Comando list funcional

#### 4.5 Uninstall Command

- [ ] Implementar `synapsync uninstall <cognitive>`
- [ ] Confirmar con usuario
- [ ] Opcion `--force`
- [ ] Limpiar archivos

**Deliverable:** Comando uninstall funcional

### Acceptance Criteria Week 4

```bash
# Buscar cognitives
synapsync search code review
synapsync search --type agent
synapsync search --category frontend

# Instalar desde registry
synapsync install code-reviewer
# -> Auto-detecta tipo desde registry

# Instalar desde GitHub
synapsync install github:user/my-skill
# -> Detecta tipo por archivo (SKILL.md)
# -> O pregunta si no puede detectar

# Instalar con tipo explicito
synapsync install ./local-cognitive --type agent

# Listar instalados
synapsync list
synapsync list --type skill

# Desinstalar
synapsync uninstall code-reviewer
```

---

## Technical Specifications

### Current Directory Structure

```
src/
├── index.ts                   # Entry point
├── cli.ts                     # CLI setup con Commander.js
├── version.ts                 # Version constant
│
├── commands/                  # Comandos CLI
│   ├── help.ts               # ✅ Implementado
│   ├── version.ts            # ✅ Implementado
│   └── info.ts               # ✅ Implementado (con topics)
│
├── ui/                       # Componentes visuales
│   ├── logo.ts               # ✅ ASCII art con gradiente
│   ├── banner.ts             # ✅ Pantalla de bienvenida
│   ├── repl.ts               # ✅ Modo interactivo REPL
│   └── colors.ts             # ✅ Colores por tipo/categoria
│
├── services/                 # Logica de negocio
│   ├── cognitive/
│   │   ├── types.ts          # ✅ Tipos de instalacion
│   │   ├── detector.ts       # ✅ Deteccion de tipos
│   │   ├── prompter.ts       # ✅ Prompts interactivos
│   │   └── index.ts          # ✅ API de alto nivel
│   └── index.ts
│
├── core/                     # Utilidades core
│   └── constants.ts          # ✅ Cognitive types, providers, categories
│
├── utils/                    # Utilidades generales
│   ├── logger.ts             # ✅ Logger centralizado
│   └── index.ts
│
└── types/                    # Tipos compartidos
    └── index.ts              # ✅ Cognitive, Provider, Config types
```

### Strict TypeScript Configuration ✅

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Strict ESLint Rules ✅

- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-unsafe-*`: error
- `@typescript-eslint/explicit-function-return-type`: error
- `@typescript-eslint/strict-boolean-expressions`: error

### Cognitive Detection Flow

```
synapsync install <source>
       │
       ▼
┌─────────────────────┐
│ 1. Check --type     │ ─── Si existe ──► Usar tipo (confidence: high)
│    flag             │
└─────────────────────┘
       │ No
       ▼
┌─────────────────────┐
│ 2. Query Registry   │ ─── Si existe ──► Usar tipo (confidence: high)
└─────────────────────┘
       │ No
       ▼
┌─────────────────────┐
│ 3. Detect by file   │ ─── Si existe ──► Usar tipo (confidence: high)
│    (local/GitHub)   │     SKILL.md, AGENT.md, etc.
└─────────────────────┘
       │ No
       ▼
┌─────────────────────┐
│ 4. Prompt user      │ ─── Seleccion ──► Usar tipo (confidence: prompt)
│    (interactive)    │
└─────────────────────┘
```

---

## Testing Requirements

### Unit Tests (minimum coverage: 70%)

- [ ] Logger tests
- [ ] Cognitive detector tests
- [ ] Source parser tests
- [ ] ConfigManager tests (when implemented)

### Integration Tests

- [ ] REPL command flow
- [ ] Info command topics
- [ ] Install detection flow

### Manual Testing Checklist

- [x] Instalar CLI localmente con `npm link`
- [x] Ejecutar `synapsync` sin argumentos
- [x] Verificar modo REPL funciona
- [x] Verificar `/info --cognitives` muestra documentacion
- [x] Verificar `/info --install` muestra fuentes
- [ ] Ejecutar `synapsync init` en directorio nuevo
- [ ] Buscar e instalar un cognitive de prueba

---

## Definition of Done

Phase 1 se considera completa cuando:

1. **Comandos MVP implementados:**
   - [x] `help`, `version`, `info`
   - [ ] `init`, `config`, `status`
   - [ ] `connect`, `disconnect`, `providers`
   - [ ] `search`, `install`, `list`, `uninstall`

2. **Sistemas core funcionando:**
   - [x] Logger centralizado
   - [x] Sistema de tipos de cognitives
   - [x] Deteccion automatica de tipos
   - [x] Modo REPL interactivo
   - [ ] ConfigManager
   - [ ] RegistryClient

3. **Quality:**
   - [x] No errores de TypeScript
   - [x] Linting pasando (strict mode)
   - [x] Build exitoso

4. **Documentacion:**
   - [x] `/info` command con topics
   - [ ] README actualizado
   - [ ] Help text para cada comando

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-27 | Initial phase 1 roadmap |
| 2.0.0 | 2025-01-27 | Updated with implemented features, multi-asset system, detection flow |
| 3.0.0 | 2025-01-27 | Renamed "asset" to "cognitive" terminology throughout |
