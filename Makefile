# SynapSync CLI - Release Management
# Usage:
#   make release-patch   → 0.1.7 → 0.1.8
#   make release-minor   → 0.1.7 → 0.2.0
#   make release-major   → 0.1.7 → 1.0.0
#   make release V=1.2.3 → set exact version

.PHONY: release-patch release-minor release-major release _release_bump _release_exact

release-patch:
	@$(MAKE) _release_bump BUMP=patch

release-minor:
	@$(MAKE) _release_bump BUMP=minor

release-major:
	@$(MAKE) _release_bump BUMP=major

# Bump by semver level (patch/minor/major)
_release_bump:
ifndef BUMP
	$(error BUMP is not set)
endif
	@NEW_VERSION=$$(npm version $(BUMP) --no-git-tag-version | tr -d 'v') && \
	$(MAKE) _do_release NEW_VERSION=$$NEW_VERSION

# Set exact version: make release V=1.2.3
release:
ifndef V
	$(error Usage: make release V=x.y.z)
endif
	@npm version $(V) --no-git-tag-version > /dev/null && \
	$(MAKE) _do_release NEW_VERSION=$(V)

# Internal: execute the full release pipeline
_do_release:
	@echo "── Releasing v$(NEW_VERSION) ──"
	@echo "[1/5] Updating src/version.ts..."
	@node -e " \
	  const fs = require('fs'); \
	  const f = 'src/version.ts'; \
	  const c = fs.readFileSync(f, 'utf8'); \
	  fs.writeFileSync(f, c.replace(/version = '[^']*'/, \"version = '$(NEW_VERSION)'\")); \
	"
	@echo "[2/5] Building..."
	@npm run build
	@echo "[3/5] Running tests..."
	@npm test
	@echo "[4/5] Committing..."
	@git add package.json package-lock.json src/version.ts
	@git commit -m "chore(release): v$(NEW_VERSION)"
	@git tag "v$(NEW_VERSION)"
	@echo "[5/5] Pushing..."
	@git push origin HEAD
	@git push origin "v$(NEW_VERSION)"
	@echo ""
	@echo "v$(NEW_VERSION) released. npm publish will run via CI."
