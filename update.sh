#!/usr/bin/env bash
#
# Deploy: atualiza o código, instala dependências, faz o build, roda as
# migrations e recarrega as apps no PM2 (ecosystem.config.js).
#
#   ./update.sh            # só faz algo se houver commits novos
#   ./update.sh --force    # roda tudo mesmo sem commits novos
#   BRANCH=develop ./update.sh
#
# Qualquer erro interrompe o script ANTES do reload, então a versão atual
# continua no ar.

set -euo pipefail

cd "$(dirname "$0")"

BRANCH="${BRANCH:-main}"
FORCE=false

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    -h | --help)
      sed -n '3,11p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Argumento desconhecido: $arg" >&2
      exit 1
      ;;
  esac
done

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[aviso] %s\033[0m\n' "$*"; }
fail() {
  printf '\033[1;31m[erro] %s\033[0m\n' "$*" >&2
  exit 1
}

trap 'fail "Falhou na linha $LINENO. Nada foi recarregado no PM2."' ERR

# --- 1. Pré-checagens -------------------------------------------------------
step "Pré-checagens"

for cmd in git node npm pm2; do
  command -v "$cmd" >/dev/null 2>&1 || fail "'$cmd' não encontrado no PATH."
done

current_branch="$(git rev-parse --abbrev-ref HEAD)"
[[ "$current_branch" == "$BRANCH" ]] ||
  fail "Branch atual é '$current_branch', esperado '$BRANCH'."

[[ -z "$(git status --porcelain)" ]] ||
  fail "Há alterações locais não commitadas. Resolva antes do deploy (git status)."

[[ -f apps/server/.env.local ]] || warn "apps/server/.env.local não existe: o server não vai subir."
[[ -f apps/web/.env ]] || warn "apps/web/.env não existe: o build do web vai falhar."

# --- 2. Código --------------------------------------------------------------
step "Atualizando o código (origin/$BRANCH)"

old_commit="$(git rev-parse HEAD)"
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"
new_commit="$(git rev-parse HEAD)"

if [[ "$old_commit" == "$new_commit" && "$FORCE" == false ]]; then
  echo "Já está atualizado (${new_commit:0:7}). Use --force para rodar mesmo assim."
  exit 0
fi

# --- 3. Dependências --------------------------------------------------------
step "Dependências"

# Inclui devDependencies: tsup, tsx e typescript são usados no build e nas migrations.
if [[ "$FORCE" == true || ! -d node_modules ]] ||
  ! git diff --quiet "$old_commit" "$new_commit" -- package-lock.json; then
  npm ci
else
  echo "package-lock.json não mudou, pulando npm ci."
fi

# --- 4. Build ---------------------------------------------------------------
step "Build"
npm run start:build

# --- 5. Migrations ----------------------------------------------------------
step "Migrations"
NODE_ENV=production npm run migrate:latest -w @triar-app/server

# --- 6. PM2 -----------------------------------------------------------------
step "Recarregando as apps no PM2"
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# --- 7. Resumo --------------------------------------------------------------
trap - ERR
step "Deploy concluído: ${old_commit:0:7} → ${new_commit:0:7}"
if [[ "$old_commit" != "$new_commit" ]]; then
  git --no-pager log --oneline "$old_commit..$new_commit"
fi
pm2 status
