# tinecli/autocomplete

Fork of [withfig/autocomplete](https://github.com/withfig/autocomplete). This
repo's only consumer is **[tine](https://github.com/tinecli/tine)**, a native
macOS terminal autocomplete app — not the Amazon Q / Fig apps the upstream
project targets. Single maintainer, no CLA, no contributor program.

## What ships where

- `src/*.ts` — one file per CLI, each exporting (or assigning to
  `completionSpec`) a `Fig.Spec` describing that CLI's `subcommands`,
  `options`, and `args`.
- `src/<cli>/*.ts` — for CLIs too large for one file (`aws`, `gcloud`, `az`),
  one file per subcommand/service, each `export default`ing a
  `Fig.Subcommand`. The top-level `src/<cli>.ts` references them via
  `loadSpec: "<cli>/<service>"` instead of inlining every subcommand.
- `build/` — compiled output (gitignored), produced by `bun run build`
  (`@withfig/autocomplete-tools compile`).
- `.github/workflows/pack.yml` — on every push to `master` that touches
  `src/**` (and manually via `workflow_dispatch`), builds `src/` → `build/`
  and publishes it as the rolling `specs` GitHub release. tine downloads
  that release at runtime — merging to master is the deploy step, there is
  no separate release process to remember.

## Writing or editing a spec

```bash
bun install
bun run create-spec my-cli   # scaffold a new spec
bun run dev                  # recompiles on save; generators re-run every keystroke
```

Before opening a PR:

```bash
bun run test       # tsc --noEmit across all of src/
bun run lint:fix   # biome check --write (lint + format, one tool)
```

### Conventions that aren't obvious from one file

- **Modular options, not combined flags.** Model `-a`, `-u`, `-x` as three
  separate options, not one `-aux` option — even if the real CLI accepts the
  combined form.
- **Any option that takes a value needs `args: {}`.** Without it the parser
  treats the option as a boolean flag and won't suggest/consume the value
  that follows.
- **A global option needs `isPersistent: true` or it silently vanishes past
  the first subcommand.** The parser scopes each spec node's own `options` to
  that node; only options flagged `isPersistent` get carried into every
  child subcommand. A flag declared once at the root `Fig.Spec` (e.g. a
  `--profile` valid anywhere: `aws s3 cp ... --profile foo`) needs the flag
  set explicitly, or it only completes immediately after the command name
  and disappears the moment a subcommand is typed. `src/act.ts`'s
  `--artifact-server-path` and friends are a real example. This exact bug
  shipped upstream in `src/aws.ts`'s `--profile` (fixed here, PR #1) — check
  for it whenever you add or touch a root-level option on any spec.
- **Multi-word CLIs that fragment into a directory** (`aws`, `gcloud`, `az`)
  get updated per-service, in `src/<cli>/<service>.ts` — don't add new
  subcommands to a giant single file once a CLI has outgrown one.

## Branch naming

Prefix every branch by what it changes:

- `spec/<name>` — a new or updated completion spec (the common case)
- `fix/<name>` — a bug fix, to a spec or to tooling/CI
- `chore/<name>` — everything else: CI/workflow changes, dependency bumps,
  docs, repo hygiene

## Workflow for an agent making a change here

1. Work in a dedicated `git worktree` per branch rather than on `master`
   directly — this repo has no branch protection, so nothing stops a bad
   push to `master` except discipline.
2. Branch off current `origin/master`, name it per the prefix convention
   above.
3. Run `bun run test` and `bun run lint` before pushing — both are required CI
   checks (`.github/workflows/checks.yml`).
4. Push and open a PR with `gh pr create`; don't push directly to `master`.
5. Merging to `master` is sufficient to ship a spec fix to tine — no
   additional release step needed (see `pack.yml` above).
