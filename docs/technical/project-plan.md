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

### Current Implementation ✅

```
synapse-cli/
├── src/
│   ├── index.ts                # ✅ Entry point - bin executable
│   ├── cli.ts                  # ✅ CLI setup con Commander.js
│   ├── version.ts              # ✅ Version constant
│   │
│   ├── commands/               # Comandos CLI
│   │   ├── help.ts             # ✅ Implementado
│   │   ├── version.ts          # ✅ Implementado
│   │   └── info.ts             # ✅ Implementado (con topics)
│   │
│   ├── ui/                     # Componentes visuales
│   │   ├── logo.ts             # ✅ ASCII art con gradiente
│   │   ├── banner.ts           # ✅ Pantalla de bienvenida
│   │   ├── repl.ts             # ✅ Modo interactivo REPL
│   │   └── colors.ts           # ✅ Colores por tipo/categoria
│   │
│   ├── services/               # Logica de negocio
│   │   ├── asset/              # ✅ Sistema de assets
│   │   │   ├── types.ts        # ✅ Tipos de instalacion
│   │   │   ├── detector.ts     # ✅ Deteccion de tipos
│   │   │   ├── prompter.ts     # ✅ Prompts interactivos
│   │   │   └── index.ts        # ✅ API de alto nivel
│   │   └── index.ts
│   │
│   ├── core/                   # Utilidades core
│   │   └── constants.ts        # ✅ Asset types, providers, categories
│   │
│   ├── utils/                  # Utilidades generales
│   │   ├── logger.ts           # ✅ Logger centralizado
│   │   └── index.ts
│   │
│   └── types/                  # Tipos compartidos
│       └── index.ts            # ✅ Asset, Provider, Config types
│
├── docs/
│   ├── technical/
│   │   ├── project-plan.md     # Este documento
│   │   └── asset-architecture.md # Arquitectura de assets
│   └── roadmap/
│       └── phase-1-foundation.md # Roadmap Phase 1
│
├── package.json
├── tsconfig.json               # ✅ Strict typing configuration
├── tsup.config.ts              # ✅ Build configuration
├── eslint.config.js            # ✅ Strict ESLint rules
├── .prettierrc
└── README.md
```

### Planned Structure (Full)

```
synapse-cli/
├── src/
│   ├── index.ts
│   ├── cli.ts
│   │
│   ├── commands/
│   │   ├── help.ts             # ✅
│   │   ├── version.ts          # ✅
│   │   ├── info.ts             # ✅
│   │   ├── init.ts             # PENDING
│   │   ├── config.ts           # PENDING
│   │   ├── connect.ts          # PENDING
│   │   ├── disconnect.ts       # PENDING
│   │   ├── providers.ts        # PENDING
│   │   ├── search.ts           # PENDING
│   │   ├── install.ts          # PENDING
│   │   ├── uninstall.ts        # PENDING
│   │   ├── list.ts             # PENDING
│   │   ├── update.ts           # PENDING
│   │   ├── run.ts              # PENDING
│   │   ├── sync.ts             # PENDING
│   │   ├── status.ts           # PENDING
│   │   ├── doctor.ts           # PENDING
│   │   └── clean.ts            # PENDING
│   │
│   ├── ui/
│   │   ├── logo.ts             # ✅
│   │   ├── banner.ts           # ✅
│   │   ├── repl.ts             # ✅
│   │   ├── colors.ts           # ✅
│   │   ├── prompts.ts          # PENDING - @clack/prompts
│   │   ├── spinner.ts          # PENDING - ora wrappers
│   │   └── formatters.ts       # PENDING - tablas, boxes
│   │
│   ├── services/
│   │   ├── asset/              # ✅ Multi-asset detection
│   │   ├── provider/           # PENDING
│   │   ├── registry/           # PENDING
│   │   ├── sync/               # PENDING
│   │   └── workflow/           # PENDING
│   │
│   ├── core/
│   │   ├── constants.ts        # ✅
│   │   ├── config.ts           # PENDING - ConfigManager
│   │   ├── storage.ts          # PENDING - StorageManager
│   │   ├── keychain.ts         # PENDING - Secure credentials
│   │   ├── auth.ts             # PENDING - AuthManager
│   │   └── errors.ts           # PENDING - Custom errors
│   │
│   ├── utils/
│   │   ├── logger.ts           # ✅
│   │   ├── fs.ts               # PENDING
│   │   ├── git.ts              # PENDING
│   │   ├── yaml.ts             # PENDING
│   │   └── validation.ts       # PENDING - Zod schemas
│   │
│   └── types/
│       └── index.ts            # ✅
│
├── tests/
│   ├── unit/                   # PENDING
│   ├── integration/            # PENDING
│   ├── e2e/                    # PENDING
│   └── fixtures/               # PENDING
│
└── docs/
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

### 4.3 Asset Service (`src/services/asset/`) ✅ IMPLEMENTED

**Responsabilidades:**
- Detectar tipo de asset desde multiples fuentes
- Parsear fuentes de instalacion (registry, local, GitHub, URL)
- Prompts interactivos para seleccion de tipo
- Resolver assets para instalacion

**Asset Detection Flow:**

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

**Asset File Formats:**

| Type | File | Format |
|------|------|--------|
| skill | `SKILL.md` | Markdown with YAML frontmatter |
| agent | `AGENT.md` | Markdown with YAML frontmatter |
| prompt | `PROMPT.md` | Markdown with YAML frontmatter |
| workflow | `WORKFLOW.yaml` | YAML configuration |
| tool | `TOOL.md` | Markdown with YAML frontmatter |

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

> Ver [Asset Architecture](./asset-architecture.md) para detalles completos del sistema multi-asset.

### Asset Types

SynapSync soporta 5 tipos de assets de IA:

| Type | File | Description |
|------|------|-------------|
| **skill** | `SKILL.md` | Instrucciones reutilizables para asistentes de IA |
| **agent** | `AGENT.md` | Entidades AI autonomas con comportamientos especificos |
| **prompt** | `PROMPT.md` | Templates de prompts reutilizables con variables |
| **workflow** | `WORKFLOW.yaml` | Procesos multi-paso que combinan agentes y prompts |
| **tool** | `TOOL.md` | Integraciones externas y funciones |

### Base Types (Implemented ✅)

```typescript
// src/core/constants.ts
export const ASSET_TYPES = ['skill', 'agent', 'prompt', 'workflow', 'tool'] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_FILE_NAMES: Record<AssetType, string> = {
  skill: 'SKILL.md',
  agent: 'AGENT.md',
  prompt: 'PROMPT.md',
  workflow: 'WORKFLOW.yaml',
  tool: 'TOOL.md',
};

export const CATEGORIES = [
  'frontend', 'backend', 'database', 'devops', 'security',
  'testing', 'analytics', 'automation', 'general',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SUPPORTED_PROVIDERS = [
  'claude', 'openai', 'gemini', 'cursor', 'windsurf', 'copilot',
] as const;
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export const PROVIDER_PATHS: Record<SupportedProvider, Record<AssetType, string>> = {
  claude: {
    skill: '.claude/skills',
    agent: '.claude/agents',
    prompt: '.claude/prompts',
    workflow: '.claude/workflows',
    tool: '.claude/tools',
  },
  // ... other providers
};
```

### Asset Interfaces (Implemented ✅)

```typescript
// src/types/index.ts
interface AssetMetadata {
  name: string;
  type: AssetType;
  version: string;
  category: Category;
  description: string;
  author?: string;
  tags?: string[];
  providers?: SupportedProvider[];
}

interface Asset extends AssetMetadata {
  content: string;
  path: string;
}

// Specialized assets
interface Skill extends Asset { type: 'skill'; }
interface Agent extends Asset { type: 'agent'; capabilities?: string[]; }
interface Prompt extends Asset { type: 'prompt'; variables?: string[]; }
interface Workflow extends Asset { type: 'workflow'; steps?: WorkflowStep[]; }
interface Tool extends Asset { type: 'tool'; schema?: Record<string, unknown>; }
```

### Installation Source Types (Implemented ✅)

```typescript
// src/services/asset/types.ts
type InstallSourceType = 'registry' | 'local' | 'github' | 'url';

interface InstallSource {
  type: InstallSourceType;
  value: string;
  owner?: string;     // For GitHub
  repo?: string;      // For GitHub
  path?: string;      // For GitHub subpath
  ref?: string;       // For GitHub branch/tag
}

interface AssetDetectionResult {
  type: AssetType | null;
  method: 'flag' | 'registry' | 'file' | 'prompt' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  source: InstallSource;
  metadata?: AssetRegistryMetadata;
}
```

### Provider Connection (Planned)

```typescript
interface ProviderConnection {
  id: string;
  name: string;
  type: SupportedProvider;
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

### Manifest (Planned)

```typescript
// .synapsync/manifest.json
interface SynapSyncManifest {
  version: string;
  lastUpdated: string;
  assets: Record<string, InstalledAsset>;
  syncs: Record<SupportedProvider, {
    lastSync: string;
    method: 'symlink' | 'copy';
    assets: string[];
  }>;
}

interface InstalledAsset {
  name: string;
  type: AssetType;
  category: Category;
  version: string;
  installedAt: Date;
  source: 'registry' | 'local' | 'github';
  sourceUrl?: string;
}
```

### Sync Configuration (Planned)

```typescript
interface SyncConfig {
  baseDir: string;                // Default: '.synapsync'
  defaultMethod: 'symlink' | 'copy';
  providers: {
    [name: string]: {
      enabled: boolean;
      paths: Record<AssetType, string>;
    };
  };
}
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

### Milestone 1: Foundation (Phase 1) - IN PROGRESS

**Week 1: Project Setup & CLI Framework ✅ COMPLETED**
- [x] Project setup (TypeScript 5.7, strict typing, ESLint strict rules)
- [x] CLI framework setup (Commander.js)
- [x] Welcome screen with ASCII logo gradient
- [x] Interactive REPL mode
- [x] `help`, `version`, `info` commands
- [x] Centralized logger utility

**Week 1.5: Asset Type System ✅ COMPLETED**
- [x] Multi-asset type system (skill, agent, prompt, workflow, tool)
- [x] Asset detection system (flag, registry, file, prompt)
- [x] Installation source parser (registry, local, GitHub, URL)
- [x] `/info` command with documentation topics

**Week 2: Basic Commands - PENDING**
- [ ] `init` command with interactive prompts
- [ ] `config` command (list, get, set)
- [ ] ConfigManager implementation

**Week 3: Provider Management - PENDING**
- [ ] Provider adapter interface
- [ ] Claude adapter
- [ ] OpenAI adapter
- [ ] `connect`, `disconnect`, `providers` commands

**Week 4: Asset Management - PENDING**
- [ ] Registry client
- [ ] `search`, `install`, `list`, `uninstall` commands
- [ ] Manifest management

### Milestone 2: Sync & Storage (Phase 2)
- [ ] StorageManager implementation
- [ ] `sync` command with symlink/copy
- [ ] `status` command
- [ ] Provider path management
- [ ] Conflict resolution

### Milestone 3: Execution (Phase 2)
- [ ] `run` command implementation
- [ ] Capability execution engine
- [ ] Output formatting
- [ ] `doctor` command

### Milestone 4: Advanced (Phase 3)
- [ ] Workflow engine
- [ ] Registry auth and publishing
- [ ] `watch` mode
- [ ] Performance optimizations

### Milestone 5: Polish (Phase 4)
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
| 2.0.0 | 2025-01-27 | Claude AI | Updated to multi-asset architecture, current implementation status, updated data models, reference to asset-architecture.md |
