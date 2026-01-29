# SynapSync Documentation

This directory contains the [Docusaurus](https://docusaurus.io/) documentation site for SynapSync CLI.

## Quick Start

```bash
# From the repository root:
npm run docs:install
npm run docs:start

# Or from this directory:
npm install
npm start
```

The dev server starts at `http://localhost:3000/synapsync-cli/`.

## Build

```bash
npm run docs:build   # from repo root
npm run build        # from website/
```

## Structure

- `docs/` - Documentation content (Markdown/MDX)
- `src/css/` - Custom styles
- `static/` - Static assets (images, favicon)
- `docusaurus.config.ts` - Site configuration
- `sidebars.ts` - Sidebar navigation
