# SynapSync CLI - Project Plan

## Overview

Este documento describe el plan de implementacion del proyecto SynapSync CLI, una herramienta de linea de comandos para orquestacion de capacidades de IA multi-proveedor.

---

## 1. Project Goals

### Primary Goals

1. **Unified AI Management**: Crear una interfaz unificada para gestionar multiples proveedores de IA (Claude, OpenAI, Gemini, etc.)
2. **Capability Ecosystem**: Establecer un sistema de "capabilities" reutilizables que puedan ser compartidas via registry
3. **Developer Experience**: Proporcionar una experiencia de CLI intuitiva inspirada en herramientas como npm, git y docker
4. **Extensibility**: Permitir la creacion de agentes y workflows personalizados

### Success Metrics

- CLI funcional con todos los comandos core implementados
- Sistema de autenticacion con al menos 3 proveedores de IA
- Registry funcional para publicar/instalar capabilities
- Documentacion completa y ejemplos de uso

---

## 2. Technical Stack

### Core Technologies

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Runtime** | Node.js 20+ | Ecosistema maduro, soporte async, amplia adopcion |
| **Language** | TypeScript 5.9+ | Type safety, mejor DX, mantenibilidad |
| **CLI Framework** | Commander.js v12 | Estructura robusta, aliases, subcomandos, opciones |
| **UI Components** | @clack/prompts | UI moderna, elegante, mejor UX que inquirer |
| **Output Styling** | picocolors + ora | picocolors es 14x mas rapido que chalk |
| **Config Management** | yaml + zod | YAML para archivos, Zod para validacion de schemas |
| **HTTP Client** | Native fetch | Node 20+ tiene fetch nativo, no necesita axios |
| **Testing** | Vitest | Testing rapido, compatible con TypeScript |
| **Build Tool** | tsup | Build rapido, ESM nativo, tree-shaking |
| **Credentials** | keytar | Almacenamiento seguro en keychain del sistema |

### Why These Choices (Based on CLI Analysis)

| Decision | Rationale |
|----------|-----------|
| **@clack/prompts sobre inquirer** | Usado por vercel-labs/skills, UI mas moderna, mejor manejo de cancelaciones |
| **picocolors sobre chalk** | 14x mas rapido, mismo API, suficiente para CLI |
| **tsup sobre tsc** | Build 10x mas rapido, configuracion simple, ESM nativo |
| **Native fetch sobre axios** | Node 20+ lo soporta, menos dependencias |
| **Zod sobre Joi/Yup** | Mejor inferencia de tipos en TypeScript |

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI Layer                            │
│  (Commands, Prompts, Output Formatting)                     │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
│  (Provider Manager, Capability Manager, Sync Engine)        │
├─────────────────────────────────────────────────────────────┤
│                       Core Layer                            │
│  (Config, Storage, Auth, Logger)                           │
├─────────────────────────────────────────────────────────────┤
│                     External APIs                           │
│  (Claude, OpenAI, Gemini, Registry)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

> Estructura basada en analisis de vercel-labs/skills y numman-ali/openskills

```
synapse-cli/
├── src/
│   ├── index.ts                # Entry point - bin executable
│   ├── cli.ts                  # CLI setup con Commander.js
│   │
│   ├── commands/               # Un archivo por comando (patron openskills)
│   │   ├── init.ts
│   │   ├── config.ts
│   │   ├── connect.ts
│   │   ├── disconnect.ts
│   │   ├── providers.ts
│   │   ├── search.ts
│   │   ├── install.ts
│   │   ├── uninstall.ts
│   │   ├── list.ts
│   │   ├── info.ts
│   │   ├── update.ts
│   │   ├── run.ts
│   │   ├── sync.ts
│   │   ├── status.ts
│   │   ├── doctor.ts
│   │   ├── clean.ts
│   │   └── version.ts
│   │
│   ├── ui/                     # Componentes visuales reutilizables
│   │   ├── logo.ts             # ASCII art con gradiente
│   │   ├── banner.ts           # Pantalla de bienvenida
│   │   ├── prompts.ts          # Wrappers de @clack/prompts
│   │   ├── spinner.ts          # Wrappers de ora
│   │   ├── formatters.ts       # Tablas, boxes, listas
│   │   └── colors.ts           # Constantes de colores
│   │
│   ├── services/               # Logica de negocio
│   │   ├── provider/
│   │   │   ├── manager.ts      # ProviderManager
│   │   │   ├── adapters/
│   │   │   │   ├── base.ts     # BaseAdapter interface
│   │   │   │   ├── claude.ts
│   │   │   │   ├── openai.ts
│   │   │   │   └── gemini.ts
│   │   │   └── types.ts
│   │   ├── capability/
│   │   │   ├── manager.ts      # CapabilityManager
│   │   │   ├── resolver.ts     # Dependency resolver
│   │   │   └── types.ts
│   │   ├── registry/
│   │   │   ├── client.ts       # RegistryClient
│   │   │   └── types.ts
│   │   ├── sync/
│   │   │   ├── engine.ts       # SyncEngine
│   │   │   └── types.ts
│   │   ├── agent/
│   │   │   ├── manager.ts
│   │   │   └── types.ts
│   │   └── workflow/
│   │       ├── engine.ts
│   │       └── types.ts
│   │
│   ├── core/                   # Utilidades core
│   │   ├── config.ts           # ConfigManager + schema + defaults
│   │   ├── storage.ts          # StorageManager (.synapse/)
│   │   ├── keychain.ts         # Secure credential storage
│   │   ├── auth.ts             # AuthManager
│   │   ├── logger.ts           # Logger con niveles
│   │   └── errors.ts           # Custom errors
│   │
│   ├── utils/                  # Utilidades generales
│   │   ├── fs.ts               # File system helpers
│   │   ├── git.ts              # Git operations
│   │   ├── yaml.ts             # YAML parsing
│   │   └── validation.ts       # Zod schemas
│   │
│   └── types/                  # Tipos compartidos
│       ├── index.ts
│       ├── provider.ts
│       ├── capability.ts
│       └── config.ts
│
├── tests/
│   ├── unit/                   # Tests unitarios por modulo
│   ├── integration/            # Tests de integracion
│   ├── e2e/                    # Tests end-to-end
│   └── fixtures/               # Datos de prueba
│
├── docs/
│   ├── technical/
│   └── roadmap/
│
├── package.json
├── tsconfig.json
├── tsup.config.ts              # Build configuration
├── vitest.config.ts
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Flat commands/** | Mas facil de navegar, un archivo = un comando |
| **Separar ui/** | Reutilizar componentes visuales, consistencia |
| **core/ simplificado** | Un archivo por concern, evitar over-engineering |
| **utils/ separado** | Helpers generales que no son parte del core |

---

## 4. Module Breakdown

### 4.1 CLI Module (`src/cli/`)

**Responsabilidades:**
- Parsear argumentos y opciones de linea de comandos
- Mostrar prompts interactivos
- Formatear y mostrar output al usuario
- Manejar errores de forma user-friendly

**Comandos a implementar:**

| Prioridad | Comando | Descripcion |
|-----------|---------|-------------|
| P0 | `init` | Inicializar proyecto |
| P0 | `config` | Gestionar configuracion |
| P0 | `help` | Mostrar ayuda |
| P0 | `version` | Mostrar version |
| P0 | `connect` | Conectar proveedor |
| P0 | `providers` | Listar proveedores |
| P1 | `search` | Buscar capabilities |
| P1 | `install` | Instalar capability |
| P1 | `list` | Listar capabilities |
| P1 | `info` | Info de capability |
| P1 | `uninstall` | Desinstalar capability |
| P1 | `update` | Actualizar capabilities |
| P2 | `run` | Ejecutar capability |
| P2 | `sync` | Sincronizar |
| P2 | `status` | Estado del proyecto |
| P2 | `doctor` | Diagnostico |
| P3 | `agent` | Gestionar agentes |
| P3 | `workflow` | Gestionar workflows |
| P3 | `login/logout` | Auth registry |
| P3 | `publish` | Publicar capability |

### 4.2 Provider Service (`src/services/provider/`)

**Responsabilidades:**
- Gestionar conexiones a proveedores de IA
- Abstraer diferencias entre APIs de proveedores
- Almacenar credenciales de forma segura
- Validar conexiones

**Adapters a implementar:**

1. **ClaudeAdapter** - Anthropic Claude API
2. **OpenAIAdapter** - OpenAI API
3. **GeminiAdapter** - Google Gemini API
4. **HuggingFaceAdapter** - Hugging Face Inference API

### 4.3 Capability Service (`src/services/capability/`)

**Responsabilidades:**
- Instalar/desinstalar capabilities
- Resolver dependencias
- Ejecutar capabilities
- Gestionar versiones

**Capability Structure:**

```yaml
# capability.yaml
name: code-reviewer
version: 2.1.0
type: agent
description: Comprehensive code review agent

providers:
  - claude
  - openai

dependencies:
  - syntax-checker@^3.0.0
  - security-scanner@^2.4.0

config:
  severity:
    type: enum
    values: [low, medium, high, critical]
    default: medium

entrypoint: index.ts
```

### 4.4 Registry Service (`src/services/registry/`)

**Responsabilidades:**
- Comunicacion con el registry central
- Buscar capabilities
- Descargar/subir capabilities
- Autenticacion con registry

### 4.5 Sync Service (`src/services/sync/`)

**Responsabilidades:**
- Sincronizar capabilities con proveedores
- Detectar cambios locales
- Resolver conflictos
- Mantener estado de sync

### 4.6 Core Module (`src/core/`)

**Config Manager:**
- Cargar/guardar configuracion global y local
- Validar esquema de configuracion
- Merge de configuraciones

**Storage Manager:**
- Gestionar directorio `.synapsync/`
- Cache de capabilities
- Estado del proyecto

**Auth Manager:**
- Almacenar credenciales en keychain del sistema
- Gestionar tokens de registry
- Refresh de tokens

---

## 5. Data Models

### Provider Connection

```typescript
interface ProviderConnection {
  id: string;
  name: string;
  type: 'claude' | 'openai' | 'gemini' | 'huggingface' | 'custom';
  status: 'active' | 'inactive' | 'error';
  config: {
    model: string;
    maxTokens?: number;
    temperature?: number;
  };
  lastSync?: Date;
  createdAt: Date;
}
```

### Skill

> Ver [Skill Architecture](./skill-architecture.md) para detalles completos.

```typescript
interface Skill {
  name: string;
  version: string;
  department: Department;           // 'frontend' | 'backend' | 'devops' | etc.
  description: string;
  author?: string;
  tags?: string[];
  providers?: string[];             // Compatible providers (all if empty)
  content: string;                  // Full SKILL.md content
  path: string;                     // Full path to SKILL.md
}

type Department =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'security'
  | 'growth'
  | 'testing'
  | 'general'
  | string;  // Custom departments allowed

// Storage structure:
// .agents/skills/{department}/{skill-name}/SKILL.md
```

### Skill Manifest

```typescript
// .agents/skills.manifest.json
interface SkillManifest {
  version: string;
  lastUpdated: Date;
  skills: {
    [skillName: string]: {
      department: Department;
      version: string;
      installedAt: Date;
      source: 'registry' | 'local' | 'git';
    };
  };
  syncs: {
    [provider: string]: {
      lastSync: Date;
      method: 'symlink' | 'copy';
      skills: string[];
    };
  };
}
```

### Project State

```typescript
interface ProjectState {
  name: string;
  version: string;
  providers: ProviderConnection[];
  skills: SkillManifest;
  lastSync: Date;
  syncStatus: 'synced' | 'pending' | 'error';
}
```

### Sync Configuration

```typescript
interface SyncConfig {
  agentsDir: string;              // Default: '.agents'
  skillsSubdir: string;           // Default: 'skills'
  defaultMethod: 'symlink' | 'copy';
  providers: {
    [name: string]: {
      enabled: boolean;
      path: string;               // e.g., '.claude/skills'
    };
  };
}

// Provider paths (configurable)
const PROVIDER_PATHS = {
  claude: '.claude/skills',
  gemini: '.gemini/skills',
  codex: '.codex/skills',
  cursor: '.cursor/skills',
  windsurf: '.windsurf/skills',
};
```

---

## 6. API Integrations

### Anthropic Claude API

```typescript
// Authentication
headers: {
  'x-api-key': API_KEY,
  'anthropic-version': '2023-06-01'
}

// Endpoints
POST /v1/messages
```

### OpenAI API

```typescript
// Authentication
headers: {
  'Authorization': `Bearer ${API_KEY}`
}

// Endpoints
POST /v1/chat/completions
```

### SynapSync Registry API

```typescript
// Endpoints
GET  /api/v1/capabilities/search?q={query}
GET  /api/v1/capabilities/{name}
GET  /api/v1/capabilities/{name}/versions
POST /api/v1/capabilities
DELETE /api/v1/capabilities/{name}@{version}
POST /api/v1/auth/login
POST /api/v1/auth/logout
```

---

## 7. Security Considerations

### Credential Storage

- Usar keychain del sistema operativo (macOS Keychain, Windows Credential Manager, libsecret en Linux)
- Nunca almacenar API keys en texto plano
- Encriptar tokens de registry

### Input Validation

- Validar todos los inputs de usuario
- Sanitizar paths de archivos
- Validar manifiestos de capabilities

### Network Security

- HTTPS obligatorio para todas las comunicaciones
- Verificar certificados SSL
- Rate limiting en cliente

---

## 8. Testing Strategy

### Unit Tests

- Testear cada servicio de forma aislada
- Mock de APIs externas
- Coverage minimo: 80%

### Integration Tests

- Testear interaccion entre servicios
- Testear comandos CLI end-to-end
- Usar fixtures de capabilities

### E2E Tests

- Flujos completos de usuario
- Testear en diferentes OS
- CI/CD integration

---

## 9. Development Workflow

### Git Branching

```
main
├── develop
│   ├── feature/init-command
│   ├── feature/provider-connect
│   └── feature/capability-install
└── release/v1.0.0
```

### Commit Convention

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: cli, provider, capability, registry, core

Example: feat(cli): add init command with interactive prompts
```

### Release Process

1. Feature freeze en develop
2. Create release branch
3. QA testing
4. Merge to main
5. Tag release
6. Publish to npm

---

## 10. Milestones

### Milestone 1: Foundation (Phase 1)
- [ ] Project setup (TypeScript, testing, linting)
- [ ] CLI framework setup
- [ ] Welcome screen
- [ ] `init`, `config`, `help`, `version` commands
- [ ] Provider connection system
- [ ] Basic provider adapters (Claude, OpenAI)

### Milestone 2: Capabilities (Phase 1-2)
- [ ] Capability schema definition
- [ ] Registry client
- [ ] `search`, `install`, `list`, `info` commands
- [ ] Dependency resolution
- [ ] Local capability storage

### Milestone 3: Execution (Phase 2)
- [ ] `run` command implementation
- [ ] Capability execution engine
- [ ] Output formatting
- [ ] `sync` and `status` commands
- [ ] `doctor` command

### Milestone 4: Advanced (Phase 3)
- [ ] Agent management
- [ ] Workflow engine
- [ ] Registry auth and publishing
- [ ] `watch` mode
- [ ] Performance optimizations

### Milestone 5: Polish (Phase 4)
- [ ] Interactive mode
- [ ] Benchmarking
- [ ] Plugin system
- [ ] Comprehensive documentation
- [ ] Community features

---

## 11. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API changes in providers | High | Medium | Adapter pattern, version pinning |
| Registry downtime | Medium | Low | Offline mode, local cache |
| Security vulnerabilities | High | Medium | Security audits, dependency scanning |
| Poor performance | Medium | Medium | Caching, lazy loading, benchmarks |
| Complex dependency resolution | Medium | High | Use proven algorithms (semver), extensive testing |

---

## 12. Resources

### Core Libraries Documentation

| Library | URL | Purpose |
|---------|-----|---------|
| **Commander.js** | [github.com/tj/commander.js](https://github.com/tj/commander.js) | CLI framework |
| **@clack/prompts** | [github.com/natemoo-re/clack](https://github.com/natemoo-re/clack) | Interactive prompts |
| **picocolors** | [github.com/alexeyraspopov/picocolors](https://github.com/alexeyraspopov/picocolors) | Terminal colors |
| **ora** | [github.com/sindresorhus/ora](https://github.com/sindresorhus/ora) | Spinners |
| **Zod** | [zod.dev](https://zod.dev) | Schema validation |
| **keytar** | [github.com/atom/node-keytar](https://github.com/atom/node-keytar) | Secure credentials |
| **tsup** | [tsup.egoist.dev](https://tsup.egoist.dev) | Build tool |

### AI Provider APIs

| Provider | Documentation |
|----------|---------------|
| **Anthropic Claude** | [docs.anthropic.com](https://docs.anthropic.com/) |
| **OpenAI** | [platform.openai.com/docs](https://platform.openai.com/docs) |
| **Google Gemini** | [ai.google.dev/docs](https://ai.google.dev/docs) |

### Reference Projects (Analyzed)

| Project | URL | Key Learnings |
|---------|-----|---------------|
| **vercel-labs/skills** | [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills) | Logo con gradiente, @clack/prompts, busqueda interactiva |
| **numman-ali/openskills** | [github.com/numman-ali/openskills](https://github.com/numman-ali/openskills) | Commander.js structure, modular commands, ora spinners |

---

## 13. Package.json Template

```json
{
  "name": "synapsync",
  "version": "0.1.0",
  "description": "Neural AI Orchestration Platform - CLI",
  "type": "module",
  "bin": {
    "synapse": "./dist/index.js",
    "synapsync": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run typecheck && npm run build && npm test"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "@clack/prompts": "^0.11.0",
    "commander": "^12.1.0",
    "keytar": "^7.9.0",
    "openai": "^4.70.0",
    "ora": "^9.0.0",
    "picocolors": "^1.1.1",
    "yaml": "^2.6.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "tsup": "^8.3.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-27 | Claude AI | Initial project plan |
| 1.1.0 | 2025-01-27 | Claude AI | Updated stack based on CLI analysis (skills, openskills) |
