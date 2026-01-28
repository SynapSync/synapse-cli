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
│   ├── asset-architecture.md          # Arquitectura de assets (skills, agents, prompts, etc.)
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
| [Asset Architecture](./technical/asset-architecture.md) | **Arquitectura de almacenamiento de assets (skills, agents, prompts, workflows, tools), sync con symlinks, y estructura de providers** |
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
- **Multi-Asset Management**: Gestiona skills, agents, prompts, workflows y tools
- **Organization by Category**: Assets organizados por categoria (frontend, backend, devops, security, etc.)
- **Symlink Sync**: Sincronizar assets a providers via symlinks (single source of truth)
- **Workflow Orchestration**: Pipelines multi-paso con agentes
- **Registry Integration**: Compartir assets con la comunidad

### Asset Types

SynapSync soporta multiples tipos de assets de IA:

| Asset Type | Description | File |
|------------|-------------|------|
| **Skill** | Instrucciones reutilizables para asistentes de IA | `SKILL.md` |
| **Agent** | Entidades AI autonomas con comportamientos especificos | `AGENT.md` |
| **Prompt** | Templates de prompts reutilizables con variables | `PROMPT.md` |
| **Workflow** | Procesos multi-paso que combinan agentes y prompts | `WORKFLOW.yaml` |
| **Tool** | Integraciones externas y funciones | `TOOL.md` |

### Asset Storage Architecture

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

# REPL Mode (interactive)
synapsync
> /help                     # Ayuda del modo REPL
> /version                  # Version del CLI
> /info --assets            # Documentacion de tipos de assets
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
synapsync init              # Inicializar proyecto
synapsync connect           # Conectar proveedores de IA

# Asset management (works with all asset types)
synapsync search            # Buscar assets en registry
synapsync install           # Instalar asset (skill, agent, prompt, etc.)
synapsync list              # Listar assets instalados
synapsync create            # Crear nuevo asset
synapsync sync              # Sincronizar assets a providers

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
Week 1.5   ████████████████████  100% ✅ Asset Type System
Week 2     ░░░░░░░░░░░░░░░░░░░░    0%    Basic Commands (init, config)
Week 3     ░░░░░░░░░░░░░░░░░░░░    0%    Provider Management
Week 4     ░░░░░░░░░░░░░░░░░░░░    0%    Asset Management
```

### Overall Timeline

```
Phase 1    ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  In Progress (40%)
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
