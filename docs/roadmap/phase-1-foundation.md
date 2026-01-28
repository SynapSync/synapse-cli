# Phase 1: Core Foundation

**Duration:** Weeks 1-4
**Focus:** CLI framework, basic commands, provider connections

---

## Overview

La Phase 1 establece los cimientos del proyecto SynapSync CLI. El objetivo es tener una CLI funcional con los comandos esenciales y la capacidad de conectarse a proveedores de IA.

---

## Goals

- [ ] Configurar el proyecto con TypeScript y tooling moderno
- [ ] Implementar la estructura base del CLI
- [ ] Crear la pantalla de bienvenida
- [ ] Implementar comandos basicos: `init`, `config`, `help`, `version`
- [ ] Sistema de conexion a proveedores: `connect`, `disconnect`, `providers`
- [ ] Gestion basica de capabilities: `search`, `install`, `list`, `info`

---

## Week 1: Project Setup & CLI Framework

### Tasks

#### 1.1 Project Initialization

- [ ] Crear estructura de carpetas del proyecto
- [ ] Configurar `package.json` con scripts y metadatos
- [ ] Configurar TypeScript (`tsconfig.json`)
- [ ] Configurar ESLint y Prettier
- [ ] Configurar Vitest para testing
- [ ] Configurar build process (tsup o similar)

**Deliverable:** Proyecto compilable con `npm run build`

#### 1.2 CLI Framework Setup

- [ ] Instalar y configurar Commander.js o Oclif
- [ ] Crear entry point principal (`src/index.ts`)
- [ ] Configurar bin entry en package.json
- [ ] Implementar estructura base de comandos
- [ ] Configurar manejo global de errores

**Deliverable:** CLI ejecutable con `synapsync --help`

#### 1.3 Welcome Screen

- [ ] Disenar ASCII art del logo
- [ ] Implementar pantalla de bienvenida
- [ ] Mostrar estado inicial (providers, capabilities)
- [ ] Mostrar tips y quick start

**Deliverable:** `synapsync` muestra pantalla de bienvenida

### Acceptance Criteria Week 1

```bash
# El CLI se puede instalar localmente
npm link

# Muestra pantalla de bienvenida
synapsync

# Muestra ayuda
synapsync --help
synapsync -h
```

---

## Week 2: Basic Commands

### Tasks

#### 2.1 Help Command

- [ ] Implementar `synapsync help`
- [ ] Implementar `synapsync help <command>`
- [ ] Formatear output con colores y estructura clara
- [ ] Incluir ejemplos de uso

**Deliverable:** Sistema de ayuda completo

#### 2.2 Version Command

- [ ] Implementar `synapsync version`
- [ ] Mostrar version del CLI
- [ ] Mostrar version de Node.js
- [ ] Mostrar plataforma
- [ ] Implementar `--check` para ver updates disponibles

**Deliverable:** `synapsync version` funcional

#### 2.3 Init Command

- [ ] Implementar `synapsync init`
- [ ] Crear prompts interactivos (nombre, descripcion, providers)
- [ ] Generar estructura de proyecto:
  - `.synapsync/` directory
  - `synapsync.config.yaml`
  - `.gitignore`
- [ ] Mostrar next steps al usuario

**Deliverable:** Comando init genera proyecto correctamente

#### 2.4 Config Command

- [ ] Implementar `synapsync config list`
- [ ] Implementar `synapsync config get <key>`
- [ ] Implementar `synapsync config set <key> <value>`
- [ ] Implementar `synapsync config edit`
- [ ] Implementar `synapsync config reset`
- [ ] Crear ConfigManager en core

**Deliverable:** Sistema de configuracion completo

### Acceptance Criteria Week 2

```bash
# Inicializar proyecto
synapsync init
# -> Crea .synapsync/, synapsync.config.yaml

# Ver configuracion
synapsync config list

# Modificar configuracion
synapsync config set cli.theme dark
synapsync config get cli.theme
# -> dark
```

---

## Week 3: Provider Management

### Tasks

#### 3.1 Core Auth System

- [ ] Crear AuthManager en core
- [ ] Implementar almacenamiento seguro (keychain)
- [ ] Crear abstraccion para credenciales
- [ ] Implementar validacion de API keys

**Deliverable:** Sistema de auth seguro

#### 3.2 Provider Adapter Interface

- [ ] Definir interfaz base `ProviderAdapter`
- [ ] Definir tipos comunes para providers
- [ ] Crear factory de providers
- [ ] Implementar health check interface

```typescript
interface ProviderAdapter {
  name: string;
  connect(credentials: Credentials): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  execute(prompt: string, options?: ExecuteOptions): Promise<Response>;
}
```

**Deliverable:** Interfaz de adapter definida

#### 3.3 Claude Adapter

- [ ] Implementar `ClaudeAdapter`
- [ ] Configurar Anthropic SDK
- [ ] Implementar autenticacion
- [ ] Implementar health check
- [ ] Manejar rate limits

**Deliverable:** Adapter de Claude funcional

#### 3.4 OpenAI Adapter

- [ ] Implementar `OpenAIAdapter`
- [ ] Configurar OpenAI SDK
- [ ] Implementar autenticacion
- [ ] Implementar health check
- [ ] Manejar rate limits

**Deliverable:** Adapter de OpenAI funcional

#### 3.5 Connect Command

- [ ] Implementar `synapsync connect`
- [ ] Implementar `synapsync connect <provider>`
- [ ] Crear prompts de autenticacion
- [ ] Guardar credenciales de forma segura
- [ ] Testear conexion post-auth
- [ ] Mostrar status del provider

**Deliverable:** Comando connect funcional

#### 3.6 Disconnect Command

- [ ] Implementar `synapsync disconnect <provider>`
- [ ] Confirmar accion con usuario
- [ ] Eliminar credenciales almacenadas
- [ ] Actualizar estado del proyecto

**Deliverable:** Comando disconnect funcional

#### 3.7 Providers Command

- [ ] Implementar `synapsync providers`
- [ ] Mostrar tabla de providers conectados
- [ ] Mostrar status de cada provider
- [ ] Mostrar modelo activo
- [ ] Mostrar rate limit actual

**Deliverable:** Comando providers funcional

### Acceptance Criteria Week 3

```bash
# Conectar a Claude
synapsync connect claude
# -> Prompt para API key
# -> Guarda en keychain
# -> Muestra status

# Conectar a OpenAI
synapsync connect openai

# Listar providers
synapsync providers
# -> Tabla con status de cada provider

# Desconectar
synapsync disconnect claude
```

---

## Week 4: Basic Skill Management

> **Note:** Ver [Skill Architecture](../technical/skill-architecture.md) para detalles completos de la estructura de almacenamiento.

### Tasks

#### 4.1 Skill Schema & Storage Structure

- [ ] Definir schema de skill (`SKILL.md` con frontmatter YAML)
- [ ] Crear tipos TypeScript para skills y departments
- [ ] Implementar validacion de schema con Zod
- [ ] Documentar formato de skill
- [ ] Implementar estructura de directorios por departamento:
  ```
  .agents/skills/{department}/{skill-name}/SKILL.md
  ```
- [ ] Crear constantes configurables para paths (`DEFAULT_AGENTS_DIR`, etc.)

**Deliverable:** Schema de skill definido con estructura por departamento

#### 4.2 Registry Client

- [ ] Crear `RegistryClient` service
- [ ] Implementar busqueda de capabilities
- [ ] Implementar descarga de capabilities
- [ ] Implementar cache local
- [ ] Manejar errores de red

> **Note:** Para MVP, el registry puede ser un repositorio de GitHub o un JSON estatico.

**Deliverable:** Cliente de registry funcional

#### 4.3 Search Command

- [ ] Implementar `synapsync search [query]`
- [ ] Mostrar resultados formateados por departamento
- [ ] Implementar filtros: `--tag`, `--provider`, `--department`, `--author`
- [ ] Paginacion de resultados

**Deliverable:** Comando search funcional

#### 4.4 Install Command

- [ ] Implementar `synapsync install <skill>`
- [ ] Implementar `synapsync install <skill>@<version>`
- [ ] Implementar `synapsync install <skill> --department <dept>`
- [ ] Resolver dependencias basicas
- [ ] Descargar y guardar skill en estructura:
  ```
  .agents/skills/{department}/{skill-name}/SKILL.md
  ```
- [ ] Auto-detectar departamento desde metadata del skill
- [ ] Prompt interactivo si departamento no especificado
- [ ] Actualizar `skills.manifest.json`
- [ ] Opcion `--global` para instalacion global

**Deliverable:** Comando install funcional con soporte de departamentos

#### 4.5 List Command

- [ ] Implementar `synapsync list`
- [ ] Mostrar capabilities instaladas localmente
- [ ] Mostrar capabilities globales
- [ ] Opciones: `--global`, `--type`, `--outdated`

**Deliverable:** Comando list funcional

#### 4.6 Info Command

- [ ] Implementar `synapsync info <capability>`
- [ ] Mostrar metadata completa
- [ ] Mostrar dependencias
- [ ] Mostrar ejemplos de uso
- [ ] Mostrar links (docs, issues)

**Deliverable:** Comando info funcional

#### 4.7 Uninstall Command

- [ ] Implementar `synapsync uninstall <capability>`
- [ ] Verificar dependientes
- [ ] Confirmar con usuario
- [ ] Opcion `--force`
- [ ] Limpiar archivos

**Deliverable:** Comando uninstall funcional

### Acceptance Criteria Week 4

```bash
# Buscar skills
synapsync search code review
synapsync search --tag security
synapsync search --department frontend

# Instalar skill (auto-detecta departamento)
synapsync install code-reviewer
# -> Guardado en .agents/skills/general/code-reviewer/SKILL.md

# Instalar con departamento explicito
synapsync install react-patterns --department frontend
# -> Guardado en .agents/skills/frontend/react-patterns/SKILL.md

# Instalar version especifica
synapsync install code-reviewer@2.1.0

# Listar instaladas (por departamento)
synapsync list
# -> Muestra skills agrupadas por departamento

synapsync list --department frontend
# -> Solo skills de frontend

# Ver info
synapsync info code-reviewer

# Desinstalar
synapsync uninstall code-reviewer
```

---

## Technical Specifications

### Directory Structure After Phase 1

```
src/
├── cli/
│   ├── commands/
│   │   ├── init.ts
│   │   ├── config.ts
│   │   ├── help.ts
│   │   ├── version.ts
│   │   ├── connect.ts
│   │   ├── disconnect.ts
│   │   ├── providers.ts
│   │   ├── search.ts
│   │   ├── install.ts
│   │   ├── list.ts
│   │   ├── info.ts
│   │   └── uninstall.ts
│   ├── prompts/
│   │   ├── init-prompts.ts
│   │   └── provider-prompts.ts
│   ├── formatters/
│   │   ├── table.ts
│   │   ├── box.ts
│   │   └── spinner.ts
│   └── index.ts
├── services/
│   ├── provider/
│   │   ├── ProviderManager.ts
│   │   ├── adapters/
│   │   │   ├── ClaudeAdapter.ts
│   │   │   └── OpenAIAdapter.ts
│   │   └── types.ts
│   ├── capability/
│   │   ├── CapabilityManager.ts
│   │   └── types.ts
│   └── registry/
│       ├── RegistryClient.ts
│       └── types.ts
├── core/
│   ├── config/
│   │   ├── ConfigManager.ts
│   │   ├── schema.ts
│   │   └── defaults.ts
│   ├── storage/
│   │   ├── StorageManager.ts
│   │   └── keychain.ts
│   ├── auth/
│   │   └── AuthManager.ts
│   └── logger/
│       └── Logger.ts
└── types/
    └── index.ts
```

### Dependencies to Install

> Stack actualizado basado en analisis de vercel-labs/skills y numman-ali/openskills

```json
{
  "dependencies": {
    "@clack/prompts": "^0.11.0",
    "commander": "^12.1.0",
    "picocolors": "^1.1.1",
    "ora": "^9.0.0",
    "yaml": "^2.6.0",
    "zod": "^3.23.0",
    "keytar": "^7.9.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "openai": "^4.70.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsup": "^8.3.0",
    "vitest": "^2.1.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0"
  }
}
```

### Why These Dependencies

| Dependency         | Reason                                           |
| ------------------ | ------------------------------------------------ |
| **@clack/prompts** | UI moderna, mejor que inquirer, usado por Vercel |
| **picocolors**     | 14x mas rapido que chalk, mismo API              |
| **commander**      | Framework CLI robusto, aliases, subcomandos      |
| **ora**            | Spinners elegantes, ampliamente usado            |
| **yaml**           | Parse/stringify YAML para config files           |
| **zod**            | Validacion de schemas con inferencia de tipos    |
| **keytar**         | Almacenamiento seguro de credenciales            |
| **tsup**           | Build tool rapido, ESM nativo                    |

### Removed Dependencies

| Removed     | Replacement           | Reason                      |
| ----------- | --------------------- | --------------------------- |
| inquirer    | @clack/prompts        | Mas moderno, mejor UX       |
| chalk       | picocolors            | Mas ligero, mismo API       |
| axios       | native fetch          | Node 20+ tiene fetch nativo |
| boxen       | custom con picocolors | Menos dependencias          |
| cli-table3  | custom formatter      | Mas control, menos deps     |
| cosmiconfig | yaml + custom         | YAML es suficiente          |

---

## Testing Requirements

### Unit Tests (minimum coverage: 70%)

- [ ] ConfigManager tests
- [ ] AuthManager tests
- [ ] ProviderManager tests
- [ ] ClaudeAdapter tests
- [ ] OpenAIAdapter tests
- [ ] RegistryClient tests
- [ ] CapabilityManager tests

### Integration Tests

- [ ] Init command flow
- [ ] Connect -> Providers flow
- [ ] Search -> Install -> List flow
- [ ] Config get/set flow

### Manual Testing Checklist

- [ ] Instalar CLI globalmente con `npm link`
- [ ] Ejecutar `synapsync` sin argumentos
- [ ] Ejecutar `synapsync init` en directorio nuevo
- [ ] Conectar a Claude con API key real
- [ ] Conectar a OpenAI con API key real
- [ ] Buscar e instalar una capability de prueba
- [ ] Verificar que capabilities se listan correctamente

---

## Definition of Done

Phase 1 se considera completa cuando:

1. **Todos los comandos MVP estan implementados:**
   - `init`, `config`, `help`, `version`
   - `connect`, `disconnect`, `providers`
   - `search`, `install`, `list`, `info`, `uninstall`

2. **Tests pasando:**
   - Unit tests con coverage >= 70%
   - Integration tests para flujos principales

3. **Documentacion:**
   - README actualizado con instrucciones de uso
   - Help text completo para cada comando

4. **Quality:**
   - No errores de TypeScript
   - Linting pasando
   - Build exitoso

5. **Funcionalidad:**
   - Se puede inicializar un proyecto
   - Se puede conectar a Claude y OpenAI
   - Se puede buscar e instalar capabilities

---

## Risks & Mitigations

| Risk                                | Mitigation                                          |
| ----------------------------------- | --------------------------------------------------- |
| Keychain no funciona en CI          | Implementar fallback a archivo encriptado           |
| Registry no disponible              | Usar JSON local como fallback para MVP              |
| Complejidad de prompts interactivos | Empezar con prompts simples, mejorar iterativamente |
| Dependencias desactualizadas        | Lock versions, Dependabot                           |

---

## Notes

- **Priorizar funcionalidad sobre perfeccion** - Es mejor tener algo funcionando que algo perfecto incompleto
- **Iterar rapido** - Hacer releases internas frecuentes para validar
- **Documentar decisiones** - Mantener ADRs para decisiones arquitectonicas importantes
