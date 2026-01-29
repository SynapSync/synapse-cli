# Pre-Production Review Plan

**Objetivo:** Revisión exhaustiva del proyecto antes de hacerlo público en GitHub
**Estado:** 🔄 En Progreso

---

## Checklist de Revisión

### 1. 📁 Estructura del Proyecto
- [ ] Verificar que no hay archivos innecesarios
- [ ] Verificar .gitignore está completo
- [ ] No hay secrets/credenciales expuestas
- [ ] No hay archivos .env committeados
- [ ] No hay carpetas vacías innecesarias
- [ ] Estructura de carpetas es clara y lógica

### 2. 📝 Documentación
- [ ] README.md completo y profesional
- [ ] CHANGELOG.md existe y está actualizado
- [ ] LICENSE existe (MIT recomendado para OSS)
- [ ] CONTRIBUTING.md con guías de contribución
- [ ] CODE_OF_CONDUCT.md
- [ ] docs/ organizados y actualizados
- [ ] Comentarios de código donde sea necesario
- [ ] JSDoc en funciones públicas

### 3. 🔧 Configuración del Proyecto
- [ ] package.json completo (name, description, keywords, repository, bugs, homepage)
- [ ] package.json tiene scripts claros
- [ ] Versión correcta (semver)
- [ ] Dependencies vs devDependencies correctamente separadas
- [ ] No hay dependencias no utilizadas
- [ ] No hay vulnerabilidades en dependencias (npm audit)
- [ ] tsconfig.json optimizado para producción
- [ ] .npmignore o files[] en package.json

### 4. 🧪 Testing
- [ ] Tests pasan (npm test)
- [ ] Coverage adecuado (>80%)
- [ ] Tests cubren casos edge
- [ ] No hay tests skipped sin razón
- [ ] Tests son mantenibles y claros

### 5. 🔍 Calidad de Código
- [ ] ESLint pasa sin errores
- [ ] No hay console.log de debug
- [ ] No hay código comentado obsoleto
- [ ] No hay TODOs críticos pendientes
- [ ] Código consistente (naming, formatting)
- [ ] No hay any innecesarios en TypeScript
- [ ] Error handling apropiado
- [ ] No hay imports no utilizados

### 6. 🔐 Seguridad
- [ ] No hay secrets hardcodeados
- [ ] Input validation en CLI
- [ ] Sanitización de paths
- [ ] No hay vulnerabilidades conocidas
- [ ] Permisos de archivos apropiados

### 7. 🚀 Build & Distribution
- [ ] Build funciona (npm run build)
- [ ] El binario CLI funciona correctamente
- [ ] Funciona en Linux/macOS/Windows
- [ ] Shebang correcto en entry point
- [ ] bin en package.json apunta al archivo correcto

### 8. 🌐 GitHub Readiness
- [ ] .github/ISSUE_TEMPLATE/ configurado
- [ ] .github/PULL_REQUEST_TEMPLATE.md
- [ ] GitHub Actions para CI (opcional)
- [ ] Badges en README (build, npm version, license)
- [ ] Topics/tags apropiados para el repo

### 9. 📦 NPM Readiness
- [ ] Nombre disponible en npm
- [ ] prepublishOnly script configurado
- [ ] Archivos correctos incluidos en package

### 10. 🎨 UX/DX
- [ ] Mensajes de error claros
- [ ] Help text útil en todos los comandos
- [ ] Colores/formatting consistente
- [ ] Performance aceptable (<1s startup)

---

## Plan de Ejecución

### Fase A: Análisis (Diagnóstico)
1. Escanear estructura del proyecto
2. Revisar configuraciones (package.json, tsconfig, etc.)
3. Ejecutar linters y tests
4. Auditar dependencias
5. Buscar código problemático (TODOs, console.log, any)
6. Verificar documentación existente

### Fase B: Correcciones (Implementación)
1. Corregir issues encontrados en Fase A
2. Crear archivos faltantes (LICENSE, CONTRIBUTING, etc.)
3. Actualizar documentación
4. Refactorizar código si es necesario
5. Mejorar mensajes de error/UX

### Fase C: Validación Final
1. Re-ejecutar todos los tests
2. Test manual de todos los comandos
3. Verificar build de producción
4. Review final de README
5. Dry-run de npm publish

---

## Resultados del Análisis

**Fecha de análisis:** 2026-01-28

---

### ✅ Lo que está BIEN

| Área | Estado | Detalles |
|------|--------|----------|
| Tests | ✅ 95 passing | Todos los tests pasan en ~770ms |
| Build | ✅ Funciona | tsup compila correctamente |
| CLI Binary | ✅ Funciona | Shebang presente, `--help` y `--version` OK |
| tsconfig.json | ✅ Excelente | Strict mode con todas las verificaciones |
| CHANGELOG.md | ✅ Existe | Bien mantenido con formato Keep a Changelog |
| package.json | ✅ Completo | name, description, keywords, repository, bugs, homepage |
| Secrets | ✅ Ninguno | Solo encontrado `apiKeyEnvVar` (tipo, no valor) |
| Carpetas vacías | ✅ Ninguna | src/ limpio |
| `any` types | ✅ Ninguno | No hay `any` innecesarios |
| README.md | ✅ Completo | 298 líneas, documentación completa |
| src/ estructura | ✅ Organizada | commands/, services/, ui/, utils/, types/ |

---

### ❌ Issues que REQUIEREN corrección

#### 1. Archivos Faltantes (CRÍTICO para OSS)

| Archivo | Estado | Prioridad |
|---------|--------|-----------|
| LICENSE | ❌ Falta | **P0** - Requerido para open source |
| CONTRIBUTING.md | ❌ Falta | **P1** - Importante para contribuidores |
| CODE_OF_CONDUCT.md | ❌ Falta | P2 - Recomendado |
| .github/ISSUE_TEMPLATE/ | ❌ Falta | P2 - Mejora UX |
| .github/PULL_REQUEST_TEMPLATE.md | ❌ Falta | P2 - Mejora UX |

#### 2. ESLint Errors (62 errores)

```
Archivos con errores:
- src/commands/clean.ts (2 errores)
- src/commands/install.ts (14 errores)
- src/commands/list.ts (5 errores)
- src/commands/search.ts (2 errores)
- src/commands/sync.ts (9 errores)
- src/commands/uninstall.ts (1 error)
- src/commands/update.ts (2 errores)
- src/services/maintenance/cleaner.ts (3 errores)
- src/services/maintenance/doctor.ts (4 errores)
- src/services/maintenance/types.ts (1 error)
- src/services/maintenance/update-checker.ts (2 errores)
- src/services/registry/client.ts (2 errores)
- src/services/scanner/parser.ts (3 errores)
- src/services/scanner/scanner.ts (4 errores)
- src/services/symlink/manager.ts (6 errores)
- src/services/sync/engine.ts (5 errores)

Tipos de errores comunes:
- no-unused-vars (imports/vars no usados)
- require-await (async sin await)
- no-non-null-assertion (! assertions)
- prefer-optional-chain (usar ?. en lugar de &&)
- strict-boolean-expressions (manejo explícito de nullable)
- no-unnecessary-type-assertion (as innecesarios)
```

#### 3. .gitignore Problemas

```gitignore
# PROBLEMAS:
docs/              # ❌ Ignora documentación (debería quitarse)
CLAUDE.md          # ❌ Aparece 2 veces
```

---

### ⚠️ Issues que REQUIEREN decisión

#### 1. npm audit (6 vulnerabilidades moderadas)

```
Paquete: esbuild <=0.24.2
Severidad: moderate
Afecta: vitest → vite → esbuild (solo dev dependency)
```

**Opciones:**
- A) Ignorar (solo afecta desarrollo, no producción)
- B) Actualizar vitest a v4.x (breaking change)

#### 2. Dependencias no utilizadas (según depcheck)

| Dependencia | ¿Eliminar? | Notas |
|-------------|------------|-------|
| @anthropic-ai/sdk | ❓ | ¿Para Execution Engine futuro? |
| openai | ❓ | ¿Para Execution Engine futuro? |
| keytar | ❓ | ¿Para registry auth futuro? |
| zod | ❓ | ¿Se usa para validación? |

**Opciones:**
- A) Eliminar todas (reducir tamaño, reinstalar cuando se necesiten)
- B) Mantener (preparación para Execution Engine)

#### 3. Carpeta .temp/

```
.temp/
├── growthly-skills-cli/   # Proyecto de referencia
├── openskills/            # Proyecto de referencia
└── skills-vercel/         # Proyecto de referencia
```

**Opciones:**
- A) Eliminar antes de release (ya no se necesitan)
- B) Mantener ignorado en .gitignore

#### 4. TODOs en código (3 encontrados)

```typescript
// src/cli.ts:63
// TODO: Register more commands as they are implemented

// src/commands/status.ts:164
connected: false, // TODO: Check actual connection status

// src/services/cognitive/detector.ts:160
// TODO: Implement actual registry lookup
```

**Opciones:**
- A) Convertir a GitHub Issues
- B) Resolver ahora
- C) Dejar como están (minor)

---

### 📊 Test Coverage

```
Overall: ~40% (varía por módulo)

Servicios con buena coverage:
- manifest/manager.ts: 91.2%
- config/: 78.5%
- maintenance/: 60-80%

Servicios sin coverage (0%):
- registry/client.ts
- sync/engine.ts
- symlink/manager.ts
- ui/* (banner, repl, colors)
- utils/logger.ts
```

**Nota:** Coverage bajo no es bloqueante para release, pero debería mejorarse.

---

### 📋 Resumen de Tareas

#### P0 - Bloqueantes
- [ ] Crear LICENSE (MIT)
- [ ] Corregir .gitignore (quitar docs/)

#### P1 - Importantes
- [ ] Crear CONTRIBUTING.md
- [ ] Corregir ESLint errors (62)
- [ ] Decidir sobre dependencias no usadas

#### P2 - Recomendadas
- [ ] Crear CODE_OF_CONDUCT.md
- [ ] Crear .github/ISSUE_TEMPLATE/
- [ ] Crear .github/PULL_REQUEST_TEMPLATE.md
- [ ] Eliminar .temp/ o asegurar que está en .gitignore
- [ ] Convertir TODOs a issues

#### P3 - Nice to have
- [ ] Mejorar test coverage
- [ ] Actualizar vitest (vulnerabilidades)
- [ ] Agregar badges al README

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Plan inicial creado |
