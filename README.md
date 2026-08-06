# tine completion specs

This is a fork of [withfig/autocomplete](https://github.com/withfig/autocomplete),
maintained as the completion-spec source for
**[tine](https://github.com/tinecli/tine)**, a native macOS terminal
autocomplete app. It's a single-maintainer fork, not a community project —
issues and PRs are welcome, but there's no CLA, no contributor program, and no
guarantee of review turnaround.

A completion spec is a _declarative_ TypeScript schema describing the
`subcommands`, `options`, and `args` of a CLI tool. tine (and, upstream,
Amazon Q Developer CLI / Fig) reads these to generate suggestions.

## How specs reach tine

Specs live as TypeScript in `src/`. The `Spec pack` workflow
(`.github/workflows/pack.yml`, run manually from the Actions tab) compiles
`src/` to self-contained minified JS tiles and publishes them as a rolling
GitHub release tagged `specs`. tine downloads
[that release](https://github.com/tinecli/autocomplete/releases/tag/specs) at
runtime, so a spec fix ships as soon as the workflow runs — no tine app
release needed.

## Editing or adding a spec

**Prerequisites:** [Bun](https://bun.com/docs/installation) — `package.json`
pins the version.

```bash
git clone https://github.com/tinecli/autocomplete.git
cd autocomplete
bun install

# Edit an existing spec in src/, or scaffold a new one:
bun run create-spec my-cli

# Dev mode: recompiles on save, generators re-run every keystroke
bun run dev
```

Specs are compiled from `src/` to `build/` on save; dev mode reads from
`build/`.

## Other package.json commands

```bash
# Typecheck all specs in src/
bun run test

# Compile specs from src/ to build/
bun run build

# Lint and fix issues
bun run lint:fix
```

## License

MIT — see [LICENSE](LICENSE). Original work (c) Hercules Labs Inc. (Fig).
