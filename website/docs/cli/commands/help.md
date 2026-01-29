---
sidebar_position: 14
title: help
---

# synapsync help

Display help information for commands.

## Usage

```bash
synapsync help [command]
synapsync --help
synapsync <command> --help
```

## Examples

### General Help

```bash
synapsync help
```

```
Usage: synapsync [options] [command]

Neural AI Orchestration Platform - Manage AI cognitives across providers

Options:
  -v, --version    Show CLI version
  --verbose        Enable verbose output
  --no-color       Disable colored output
  -h, --help       Display help

Commands:
  init             Initialize a new project
  config           Manage configuration
  status           Show project status
  providers        Manage providers
  search           Search the registry
  install          Install cognitives
  list             List installed cognitives
  uninstall        Remove cognitives
  sync             Sync to providers
  update           Update cognitives
  doctor           Diagnose issues
  clean            Clean cache and orphans
  help             Display help
  version          Show version
  info             Show concepts
```

### Command-Specific Help

```bash
synapsync help install
synapsync add --help
```

```
Usage: synapsync add <source> [options]

Install a cognitive from registry, local path, or GitHub

Arguments:
  source            Cognitive name, path, or GitHub URL

Options:
  -t, --type        Cognitive type
  -c, --category    Category for organization
  -f, --force       Overwrite if exists
  -h, --help        Display help
```

## Aliases

All of these show help:

```bash
synapsync help
synapsync --help
synapsync -h
```

Command-specific:

```bash
synapsync help sync
synapsync sync --help
synapsync sync -h
```
