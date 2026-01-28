# CLI Analysis: Skills & OpenSkills

> Analisis de los repositorios `vercel-labs/skills` y `numman-ali/openskills` para inspiracion del proyecto SynapSync CLI.

---

## 1. Overview de Proyectos

### vercel-labs/skills

| Aspecto | Detalle |
|---------|---------|
| **Version** | 1.1.8 |
| **Tipo** | ESM Module |
| **Build Tool** | obuild |
| **Test Framework** | vitest |
| **Enfoque** | CLI minimalista, interaccion elegante |

### numman-ali/openskills

| Aspecto | Detalle |
|---------|---------|
| **Version** | 1.5.0 |
| **Tipo** | ESM Module |
| **Build Tool** | tsup |
| **Test Framework** | vitest |
| **Enfoque** | CLI estructurado con Commander.js |

---

## 2. Stack Tecnologico Comparativo

### Dependencias de Produccion

| Libreria | skills-vercel | openskills | Descripcion |
|----------|---------------|------------|-------------|
| **commander** | - | v12.1.0 | Framework CLI estructurado |
| **@clack/prompts** | v0.11.0 | - | UI moderna para CLI (alternativa a inquirer) |
| **@inquirer/prompts** | - | v7.9.0 | Prompts interactivos clasicos |
| **chalk** | - | v5.6.2 | Colores en terminal |
| **picocolors** | v1.1.1 | - | Colores (mas ligero que chalk) |
| **ora** | - | v9.0.0 | Spinners elegantes |
| **simple-git** | v3.27.0 | - | Operaciones git programaticas |
| **gray-matter** | v4.0.3 | - | Parser YAML frontmatter |

### Dependencias de Desarrollo

| Libreria | Ambos Usan | Proposito |
|----------|------------|-----------|
| **typescript** | v5.9.3 | Type safety |
| **vitest** | v4.0.x | Testing |
| **@types/node** | v22+ | Types de Node.js |
| **tsup** | Solo openskills | Build tool rapido |
| **obuild** | Solo skills | Build tool Vercel |

---

## 3. Patrones de UI/UX

### 3.1 Logo ASCII Art (skills-vercel)

```typescript
const LOGO_LINES = [
  '███████╗██╗  ██╗██╗██╗     ██╗     ███████╗',
  '██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝',
  '███████╗█████╔╝ ██║██║     ██║     ███████╗',
  '╚════██║██╔═██╗ ██║██║     ██║     ╚════██║',
  '███████║██║  ██╗██║███████╗███████╗███████║',
  '╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝',
];

// Gradiente de grises para efecto visual
const GRAYS = [
  '\x1b[38;5;250m', // lighter gray
  '\x1b[38;5;248m',
  '\x1b[38;5;245m', // mid gray
  '\x1b[38;5;243m',
  '\x1b[38;5;240m',
  '\x1b[38;5;238m', // darker gray
];
```

**Patron**: Cada linea del logo tiene un color diferente (gradiente), visible tanto en fondos claros como oscuros.

### 3.2 Banner de Bienvenida

```typescript
function showBanner(): void {
  showLogo();
  console.log();
  console.log(`${DIM}The open agent skills ecosystem${RESET}`);
  console.log();
  console.log(`  ${DIM}$${RESET} ${TEXT}npx skills add ${DIM}<package>${RESET}   ${DIM}Install a skill${RESET}`);
  console.log(`  ${DIM}$${RESET} ${TEXT}npx skills find ${DIM}[query]${RESET}    ${DIM}Search for skills${RESET}`);
  // ...
}
```

**Patron**: Uso de `DIM` y `TEXT` para jerarquizar informacion visualmente.

### 3.3 Spinners y Progress (openskills)

```typescript
import ora from 'ora';

const spinner = ora('Cloning repository...').start();
// ... operacion
spinner.succeed('Repository cloned');
// o
spinner.fail('Failed to clone repository');
```

### 3.4 Prompts Interactivos (@clack/prompts)

```typescript
import * as p from '@clack/prompts';

// Intro/Outro
p.intro(pc.bgCyan(pc.black(' skills ')));
p.outro(pc.green('Done!'));

// Spinner
const spinner = p.spinner();
spinner.start('Installing skills...');
spinner.stop('Installation complete');

// Confirmacion
const confirmed = await p.confirm({
  message: 'Proceed with installation?',
});

// Seleccion multiple
const selected = await p.multiselect({
  message: 'Select skills to install',
  options: skillChoices,
  required: true,
});

// Notas/Boxes
p.note(summaryLines.join('\n'), 'Installation Summary');

// Logs estructurados
p.log.info(`Skill: ${pc.cyan(skill.name)}`);
p.log.warn('No coding agents detected.');
p.log.error(pc.red('Failed to clone repository'));
```

### 3.5 Busqueda Interactiva FZF-style (skills-vercel)

```typescript
// Custom implementation con raw readline
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_DOWN = '\x1b[J';

async function runSearchPrompt(initialQuery = ''): Promise<SearchSkill | null> {
  process.stdin.setRawMode(true);
  readline.emitKeypressEvents(process.stdin);
  process.stdout.write(HIDE_CURSOR);

  // Render loop con debounce para busqueda
  // Navegacion con flechas
  // Enter para seleccionar, Escape para cancelar
}
```

---

## 4. Estructura de Comandos

### skills-vercel (Switch manual)

```typescript
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showBanner();
    return;
  }

  const command = args[0];
  const restArgs = args.slice(1);

  switch (command) {
    case 'find':
    case 'search':
    case 'f':
    case 's':
      await runFind(restArgs);
      break;
    case 'init':
      runInit(restArgs);
      break;
    case 'i':
    case 'install':
    case 'a':
    case 'add':
      await runAdd(source, options);
      break;
    // ...
  }
}
```

### openskills (Commander.js)

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('openskills')
  .description('Universal skills loader for AI coding agents')
  .version(version);

program
  .command('list')
  .description('List all installed skills')
  .action(listSkills);

program
  .command('install <source>')
  .description('Install skill from GitHub or Git URL')
  .option('-g, --global', 'Install globally')
  .option('-y, --yes', 'Skip interactive selection')
  .action(installSkill);

program.parse();
```

---

## 5. Patrones de Organizacion de Codigo

### Estructura skills-vercel (Flat)

```
src/
├── cli.ts          # Entry point + todos los comandos
├── add.ts          # Logica de add/install
├── find.ts         # Logica de busqueda
├── skills.ts       # Gestion de skills
├── installer.ts    # Instalacion
├── agents.ts       # Deteccion de agentes
├── git.ts          # Operaciones git
├── telemetry.ts    # Tracking
├── types.ts        # Tipos compartidos
└── providers/      # Providers externos
    ├── index.ts
    ├── types.ts
    ├── wellknown.ts
    ├── huggingface.ts
    └── mintlify.ts
```

### Estructura openskills (Modular)

```
src/
├── cli.ts              # Entry point (solo comandos)
├── types.ts            # Tipos compartidos
├── commands/           # Comandos separados
│   ├── install.ts
│   ├── list.ts
│   ├── read.ts
│   ├── remove.ts
│   ├── manage.ts
│   ├── sync.ts
│   └── update.ts
└── utils/              # Utilidades
    ├── dirs.ts
    ├── skills.ts
    ├── yaml.ts
    ├── skill-names.ts
    ├── skill-metadata.ts
    ├── marketplace-skills.ts
    └── agents-md.ts
```

---

## 6. Recomendaciones para SynapSync CLI

### 6.1 Stack Recomendado

```json
{
  "dependencies": {
    "@clack/prompts": "^0.11.0",      // UI moderna (mejor que inquirer)
    "picocolors": "^1.1.1",           // Colores (mas ligero que chalk)
    "commander": "^12.1.0",           // Estructura de comandos
    "ora": "^9.0.0",                  // Spinners
    "yaml": "^2.0.0",                 // Parse YAML
    "zod": "^3.22.0",                 // Validacion de schemas
    "keytar": "^7.0.0"                // Almacenamiento seguro de credenciales
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "tsup": "^8.0.0",                 // Build rapido
    "vitest": "^4.0.0"                // Testing
  }
}
```

### 6.2 Estructura de Proyecto Recomendada

```
src/
├── index.ts                # Entry point
├── cli.ts                  # CLI setup con Commander
├── types/                  # Tipos TypeScript
│   └── index.ts
├── commands/               # Comandos
│   ├── init.ts
│   ├── config.ts
│   ├── connect.ts
│   ├── providers.ts
│   ├── search.ts
│   ├── install.ts
│   ├── list.ts
│   ├── run.ts
│   ├── sync.ts
│   ├── status.ts
│   └── ...
├── services/               # Logica de negocio
│   ├── provider/
│   ├── capability/
│   ├── registry/
│   └── sync/
├── ui/                     # Componentes UI
│   ├── logo.ts
│   ├── banner.ts
│   ├── prompts.ts
│   ├── formatters.ts
│   └── spinners.ts
└── utils/                  # Utilidades
    ├── config.ts
    ├── storage.ts
    ├── keychain.ts
    └── logger.ts
```

### 6.3 Patron de Logo y Banner

```typescript
// src/ui/logo.ts
import pc from 'picocolors';

const LOGO = [
  '███████╗██╗   ██╗███╗   ██╗ █████╗ ██████╗ ',
  '██╔════╝╚██╗ ██╔╝████╗  ██║██╔══██╗██╔══██╗',
  '███████╗ ╚████╔╝ ██╔██╗ ██║███████║██████╔╝',
  '╚════██║  ╚██╔╝  ██║╚██╗██║██╔══██║██╔═══╝ ',
  '███████║   ██║   ██║ ╚████║██║  ██║██║     ',
  '╚══════╝   ╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ',
];

const COLORS = [
  '\x1b[38;5;39m',   // Blue
  '\x1b[38;5;38m',
  '\x1b[38;5;37m',   // Cyan
  '\x1b[38;5;36m',
  '\x1b[38;5;35m',
  '\x1b[38;5;34m',   // Green
];

export function showLogo(): void {
  console.log();
  LOGO.forEach((line, i) => {
    console.log(`${COLORS[i]}${line}\x1b[0m`);
  });
}

export function showBanner(): void {
  showLogo();
  console.log();
  console.log(pc.dim('Neural AI Orchestration Platform'));
  console.log(pc.dim(`Version ${version}`));
  console.log();
  console.log(`  ${pc.dim('$')} ${pc.white('synapse init')}        ${pc.dim('Initialize a new project')}`);
  console.log(`  ${pc.dim('$')} ${pc.white('synapse connect')}     ${pc.dim('Connect to AI providers')}`);
  console.log(`  ${pc.dim('$')} ${pc.white('synapse help')}        ${pc.dim('Show all commands')}`);
  console.log();
}
```

### 6.4 Patron de Comando con @clack/prompts

```typescript
// src/commands/init.ts
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { showLogo } from '../ui/logo.js';

export async function initCommand(): Promise<void> {
  showLogo();
  console.log();

  p.intro(pc.bgBlue(pc.white(' synapse init ')));

  const spinner = p.spinner();

  // Preguntas interactivas
  const project = await p.group({
    name: () => p.text({
      message: 'Project name',
      placeholder: 'my-ai-project',
      validate: (value) => {
        if (!value) return 'Name is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Use lowercase and hyphens only';
      },
    }),
    description: () => p.text({
      message: 'Description',
      placeholder: 'AI-powered project',
    }),
    providers: () => p.multiselect({
      message: 'Select providers to configure',
      options: [
        { value: 'claude', label: 'Claude (Anthropic)', hint: 'Recommended' },
        { value: 'openai', label: 'OpenAI' },
        { value: 'gemini', label: 'Gemini (Google)' },
      ],
      required: true,
    }),
  }, {
    onCancel: () => {
      p.cancel('Setup cancelled');
      process.exit(0);
    },
  });

  spinner.start('Creating project structure');

  // ... crear archivos

  spinner.stop('Project created');

  // Resumen
  const summary = [
    `${pc.green('✓')} Created .synapse/`,
    `${pc.green('✓')} Created synapse.config.yaml`,
    `${pc.green('✓')} Created .gitignore`,
  ];

  p.note(summary.join('\n'), 'Created Files');

  // Next steps
  p.log.info('Next steps:');
  p.log.message(`  1. ${pc.cyan('synapse connect')} to authenticate providers`);
  p.log.message(`  2. ${pc.cyan('synapse search')} to discover capabilities`);

  p.outro(pc.green('Project initialized successfully!'));
}
```

### 6.5 Patron de Output Formateado

```typescript
// src/ui/formatters.ts
import pc from 'picocolors';

export function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => r[i]?.length || 0))
  );

  const sep = colWidths.map(w => '─'.repeat(w + 2)).join('┼');
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(' │ ');
  const dataRows = rows.map(row =>
    row.map((cell, i) => cell.padEnd(colWidths[i])).join(' │ ')
  );

  return [
    `┌${sep.replace(/┼/g, '┬')}┐`,
    `│ ${headerRow} │`,
    `├${sep}┤`,
    ...dataRows.map(r => `│ ${r} │`),
    `└${sep.replace(/┼/g, '┴')}┘`,
  ].join('\n');
}

export function formatStatus(status: 'active' | 'inactive' | 'error'): string {
  switch (status) {
    case 'active': return pc.green('✓ Active');
    case 'inactive': return pc.dim('✗ Inactive');
    case 'error': return pc.red('✗ Error');
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
```

---

## 7. Configuracion de Build

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  dts: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  shims: true,
});
```

### package.json (bin)

```json
{
  "name": "synapsync",
  "type": "module",
  "bin": {
    "synapse": "./dist/index.js",
    "synapsync": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "start": "node dist/index.js"
  }
}
```

---

## 8. Key Takeaways

### Lo que funciona bien

1. **@clack/prompts** - UI moderna, mejor que inquirer
2. **picocolors** - Ligero, rapido, suficiente para CLI
3. **Logo con gradiente** - Efecto visual atractivo
4. **Estructura modular** - Separar comandos en archivos
5. **tsup** - Build rapido y simple
6. **Commander.js** - Estructura solida para comandos complejos

### Lo que evitar

1. Mezclar toda la logica en un solo archivo (como skills-vercel hace parcialmente)
2. Usar chalk si picocolors es suficiente (mas ligero)
3. Reinventar la rueda con prompts custom cuando @clack ya existe
4. Olvidar manejar Ctrl+C y cancelaciones gracefully

### Para SynapSync

- Usar **@clack/prompts** + **picocolors** para UI
- Usar **Commander.js** para estructura de comandos
- Usar **tsup** para build
- Separar comandos en `src/commands/`
- Crear modulo `src/ui/` para componentes visuales reutilizables
- Implementar logo con gradiente de colores (azul -> cyan -> verde)
- Siempre mostrar banner cuando se ejecuta sin argumentos

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-27 | Initial analysis |
