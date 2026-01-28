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
│   ├── skill-architecture.md          # Arquitectura de skills por departamento
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
| [Skill Architecture](./technical/skill-architecture.md) | **Arquitectura de almacenamiento de skills por departamento, sync con symlinks, y estructura de providers** |
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

- **Multi-Provider Support**: Claude, OpenAI, Gemini, Codex, Cursor
- **Skill Management by Department**: Skills organizados en frontend, backend, devops, security, etc.
- **Symlink Sync**: Sincronizar skills a providers via symlinks (single source of truth)
- **Agent System**: Crear y gestionar agentes personalizados
- **Workflow Orchestration**: Pipelines multi-paso
- **Registry Integration**: Compartir skills con la comunidad

### Skill Storage Architecture

```
.agents/skills/                    # Central brain (configurable)
├── frontend/                      # Department
│   └── react-patterns/SKILL.md
├── backend/
│   └── api-designer/SKILL.md
└── general/
    └── code-reviewer/SKILL.md

.claude/skills/                    # Provider (flat, via symlink)
├── react-patterns/ -> ../../.agents/skills/frontend/react-patterns/
├── api-designer/ -> ../../.agents/skills/backend/api-designer/
└── code-reviewer/ -> ../../.agents/skills/general/code-reviewer/
```

### Core Commands

```bash
synapsync init              # Inicializar proyecto
synapsync connect           # Conectar proveedores de IA
synapsync search            # Buscar skills
synapsync install           # Instalar skill (en .agents/skills/{dept}/)
synapsync list              # Listar skills por departamento
synapsync sync              # Sincronizar skills a providers (symlink/copy)
synapsync run               # Ejecutar skill
synapsync agent             # Gestionar agentes
synapsync workflow          # Gestionar workflows
```

---

## Implementation Timeline

```
Week 1-4   ████████████████░░░░░░░░░░░░░░░░░░░░░░░░  Phase 1: Foundation
Week 5-8   ░░░░░░░░░░░░░░░░████████████████░░░░░░░░  Phase 2: Sync & Execution
Week 9-12  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████  Phase 3: Advanced
Ongoing    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓  Phase 4: Enhancement
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
