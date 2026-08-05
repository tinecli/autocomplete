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

**Prerequisites:** Node ([`.nvmrc`](.nvmrc) pins the version) and
[pnpm](https://pnpm.io/installation).

```bash
git clone https://github.com/tinecli/autocomplete.git
cd autocomplete
pnpm install

# Edit an existing spec in src/, or scaffold a new one:
pnpm create-spec my-cli

# Dev mode: recompiles on save, generators re-run every keystroke
pnpm dev
```

Specs are compiled from `src/` to `build/` on save; dev mode reads from
`build/`.

## Pulling spec updates from upstream

Since most specs originate in withfig/autocomplete, it's often easier to pull
their updates than to hand-port a change:

```bash
git remote add upstream https://github.com/withfig/autocomplete.git
git fetch upstream
git merge upstream/master
```

## Other package.json commands

```bash
# Typecheck all specs in src/
pnpm test

# Compile specs from src/ to build/
pnpm build

# Lint and fix issues
pnpm lint:fix
```

## License

MIT — see [LICENSE](LICENSE). Original work (c) Hercules Labs Inc. (Fig).
