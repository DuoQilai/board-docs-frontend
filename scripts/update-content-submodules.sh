#!/usr/bin/env bash
set -euo pipefail

for name in "$@"; do
  path=$(git config --file .gitmodules --get "submodule.$name.path")
  branch=$(git config --file .gitmodules --get "submodule.$name.branch")
  git submodule update --init -- "$path"
  git -C "$path" fetch --no-tags origin "$branch"
  current=$(git -C "$path" rev-parse HEAD)
  target=$(git -C "$path" rev-parse FETCH_HEAD)
  if git -C "$path" merge-base --is-ancestor "$current" "$target"; then
    git -C "$path" checkout --detach "$target"
  elif git -C "$path" merge-base --is-ancestor "$target" "$current"; then
    echo "Keeping $name at $current until origin/$branch includes it"
  else
    echo "::error::$name has diverged from origin/$branch; review and update the recorded revision manually." >&2
    exit 1
  fi
done
