# SynapSync CLI Documentation

Bienvenido a la documentacion del proyecto SynapSync CLI.

---

## Structure

```
docs/
├── README.md                          # Este archivo
├── technical/
│   ├── specification.md               # Especificacion completa del CLI
│   ├── project-plan.md                # Plan de proyecto y arquitectura
│   ├── cognitive-architecture.md      # Arquitectura de cognitives (skills, agents, prompts, etc.)
│   └── cli-analysis.md                # Analisis de CLIs de referencia
└── roadmap/
    ├── phase-1-foundation.md          # Semanas 1-4: Fundamentos
    ├── phase-2-sync-execution.md      # Semanas 5-8: Sync y Ejecucion
    ├── phase-3-advanced.md            # Semanas 9-12: Features Avanzados
    └── phase-4-enhancement.md         # Ongoing: Mejoras continuas
```

---

## Quick Links

### Technical Documentation

| Document | Description |
|----------|-------------|
| [Specification](./technical/specification.md) | Especificacion completa del CLI incluyendo todos los comandos, UX, y estructuras de configuracion |
| [Project Plan](./technical/project-plan.md) | Plan de proyecto con arquitectura, stack tecnologico, estructura de modulos, y estrategia de testing |
| [Cognitive Architecture](./technical/cognitive-architecture.md) | **Arquitectura de almacenamiento de cognitives (skills, agents, prompts, workflows, tools), sync con symlinks, y estructura de providers** |
| [CLI Analysis](./technical/cli-analysis.md) | Analisis de CLIs de referencia (vercel-labs/skills, openskills) con patrones y recomendaciones |

### Roadmap

| Phase | Duration | Focus | Document |
|-------|----------|-------|----------|
| Phase 1 | Weeks 1-4 | Core Foundation | [phase-1-foundation.md](./roadmap/phase-1-foundation.md) |
| Phase 2 | Weeks 5-8 | Sync & Execution | [phase-2-sync-execution.md](./roadmap/phase-2-sync-execution.md) |
| Phase 3 | Weeks 9-12 | Advanced Features | [phase-3-advanced.md](./roadmap/phase-3-advanced.md) |
| Phase 4 | Ongoing | Enhancement | [phase-4-enhancement.md](./roadmap/phase-4-enhancement.md) |

---

## Overview

SynapSync CLI es una herramienta de linea de comandos para orquestacion de capacidades de IA multi-proveedor.

### Key Features

- **Multi-Provider Support**: Claude, OpenAI, Gemini, Cursor, Windsurf, Copilot
- **Multi-Cognitive Management**: Gestiona cognitives (skills, agents, prompts, workflows, tools)
- **Organization by Category**: Cognitives organizados por categoria (frontend, backend, devops, security, etc.)
- **Symlink Sync**: Sincronizar cognitives a providers via symlinks (single source of truth)
- **Workflow Orchestration**: Pipelines multi-paso con agentes
- **Registry Integration**: Compartir cognitives con la comunidad

### Cognitive Types

SynapSync soporta multiples tipos de cognitives de IA:

| Cognitive Type | Description | File |
|------------|-------------|------|
| **Skill** | Instrucciones reutilizables para asistentes de IA | `SKILL.md` |
| **Agent** | Entidades AI autonomas con comportamientos especificos | `AGENT.md` |
| **Prompt** | Templates de prompts reutilizables con variables | `PROMPT.md` |
| **Workflow** | Procesos multi-paso que combinan agentes y prompts | `WORKFLOW.yaml` |
| **Tool** | Integraciones externas y funciones | `TOOL.md` |

### Cognitive Storage Architecture

```
.synapsync/                            # Central storage (configurable)
├── skills/
│   ├── frontend/
│   │   └── react-patterns/SKILL.md
│   └── general/
│       └── code-reviewer/SKILL.md
├── agents/
│   ├── automation/
│   │   └── ci-agent/AGENT.md
│   └── general/
│       └── reviewer-agent/AGENT.md
├── prompts/
│   └── general/
│       └── code-review/PROMPT.md
├── workflows/
│   └── devops/
│       └── deploy-pipeline/WORKFLOW.yaml
└── tools/
    └── general/
        └── github-integration/TOOL.md

.claude/                               # Provider (flat, via symlink)
├── skills/
│   └── react-patterns/ -> ../../.synapsync/skills/frontend/react-patterns/
├── agents/
│   └── ci-agent/ -> ../../.synapsync/agents/automation/ci-agent/
└── prompts/
    └── code-review/ -> ../../.synapsync/prompts/general/code-review/
```

### Implemented Commands ✅

```bash
synapsync                   # Pantalla de bienvenida + modo REPL
synapsync --help            # Ayuda general
synapsync version           # Version y info del sistema
synapsync version --check   # Verificar actualizaciones disponibles
synapsync init              # Inicializar proyecto (interactivo)
synapsync init --yes        # Inicializar con valores por defecto
synapsync config list       # Listar configuracion
synapsync config get <key>  # Obtener valor de configuracion
synapsync config set <k> <v># Establecer valor de configuracion
synapsync status            # Mostrar estado del proyecto

# REPL Mode (interactive)
synapsync
> /help                     # Ayuda del modo REPL
> /help <command>           # Ayuda detallada de un comando
> /version                  # Version del CLI
> /init                     # Inicializar proyecto
> /config list              # Ver configuracion
> /config get cli.theme     # Obtener valor
> /config set cli.theme dark# Establecer valor
> /status                   # Estado del proyecto
> /info --cognitives        # Documentacion de tipos de cognitives
> /info --install           # Documentacion de fuentes de instalacion
> /info --providers         # Proveedores soportados
> /info --categories        # Categorias de organizacion
> /info --sync              # Como funciona sync
> /info --structure         # Estructura de proyecto
> /clear                    # Limpiar pantalla
> /exit                     # Salir
```

### Planned Commands

```bash
synapsync connect           # Conectar proveedores de IA

# Cognitive management (works with all cognitive types)
synapsync search            # Buscar cognitives en registry
synapsync install           # Instalar cognitive (skill, agent, prompt, etc.)
synapsync list              # Listar cognitives instalados
synapsync create            # Crear nuevo cognitive
synapsync sync              # Sincronizar cognitives a providers

# Specialized commands
synapsync run               # Ejecutar skill o workflow
synapsync agent             # Gestionar agentes
synapsync workflow          # Gestionar workflows
```

---

## Implementation Status

### Phase 1 Progress

```
Week 1     ████████████████████  100% ✅ Project Setup & CLI Framework
Week 1.5   ████████████████████  100% ✅ Cognitive Type System
Week 2     ████████████████████  100% ✅ Basic Commands (init, config, status)
Week 3     ░░░░░░░░░░░░░░░░░░░░    0%    Provider Management
Week 4     ░░░░░░░░░░░░░░░░░░░░    0%    Cognitive Management
```

### Overall Timeline

```
Phase 1    ███████████████░░░░░░░░░░░░░░░░░░░░░░░░░  In Progress (60%)
Phase 2    ░░░░░░░░░░░░░░░░████████████████░░░░░░░░  Pending
Phase 3    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████  Pending
Phase 4    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓  Ongoing
```

---

## Getting Started

Para comenzar el desarrollo, consulta:

1. **[Project Plan](./technical/project-plan.md)** - Estructura del proyecto y arquitectura
2. **[Phase 1 Roadmap](./roadmap/phase-1-foundation.md)** - Tareas detalladas para empezar

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-27 | Initial documentation structure |
| 1.1.0 | 2025-01-27 | Added skill architecture by department, sync with symlinks |
| 2.0.0 | 2025-01-27 | Expanded to multi-asset architecture (skills, agents, prompts, workflows, tools) |
| 2.1.0 | 2025-01-27 | Updated with implementation status, implemented commands, REPL mode |
| 3.0.0 | 2025-01-27 | Renamed "asset" to "cognitive" terminology throughout |
