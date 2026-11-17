const parseCompletions = (out: string): Fig.Suggestion[] => {
  const seen = new Map<string, Fig.Suggestion>();

  for (const line of out.split("\n")) {
    const [name, description = ""] = line.split("\t");
    if (!name || name.startsWith("-") || seen.has(name)) continue;

    const hasWorktree = description.startsWith("+ ");
    seen.set(name, {
      name,
      description: description
        .replace(/^\+ /, "Worktree · ")
        .replace(/^\/ /, "Branch · "),
      priority: hasWorktree ? 80 : 40,
    });
  }

  return [...seen.values()];
};

const complete = (tokens: string[]): Fig.ExecuteCommandInput => ({
  command: "wt",
  args: ["--", "wt", ...tokens.slice(1, -1), ""],
  env: { COMPLETE: "fish" },
});

const dynamic: Fig.Generator = {
  script: complete,
  postProcess: parseCompletions,
};

const aliases: Fig.Generator = {
  script: complete,
  postProcess: (out) =>
    parseCompletions(out).filter((suggestion) =>
      suggestion.description?.startsWith("alias:")
    ),
};

const varKeys: Fig.Generator = {
  script: ["wt", "config", "state", "vars", "list"],
  postProcess: parseCompletions,
};

const branchOption: Fig.Arg = { name: "branch", generators: dynamic };

const target: Fig.Arg = {
  name: "target",
  isOptional: true,
  generators: dynamic,
};

const noHooks: Fig.Option = { name: "--no-hooks", description: "Skip hooks" };

const stage: Fig.Option = {
  name: "--stage",
  description: "What to stage before committing",
  args: {
    name: "stage",
    default: "all",
    suggestions: [
      {
        name: "all",
        description:
          "Stage everything: untracked files + unstaged tracked changes",
      },
      {
        name: "tracked",
        description: "Stage tracked changes only (like git add -u)",
      },
      {
        name: "none",
        description: "Stage nothing, commit only what's already in the index",
      },
    ],
  },
};

const formatText: Fig.Option = {
  name: "--format",
  description: "Output format",
  args: { name: "format", suggestions: ["text", "json"] },
};

const formatTable: Fig.Option = {
  name: "--format",
  description: "Output format",
  args: { name: "format", suggestions: ["table", "json"] },
};

const formatStatusline: Fig.Option = {
  name: "--format",
  description: "Output format",
  args: { name: "format", suggestions: ["table", "json", "claude-code"] },
};

const targetBranch: Fig.Option = {
  name: "--branch",
  description: "Target branch (defaults to current)",
  args: branchOption,
};

const shells = ["bash", "fish", "nu", "zsh", "powershell"];

const hookTypes = [
  "pre-switch",
  "post-switch",
  "pre-start",
  "post-start",
  "pre-commit",
  "post-commit",
  "pre-merge",
  "post-merge",
  "pre-remove",
  "post-remove",
];

const hookSubcommands: Fig.Subcommand[] = hookTypes.map((name) => ({
  name,
  description: `Run ${name} hooks`,
  options: [
    { name: "--dry-run", description: "Show what would run without executing" },
    {
      name: "--foreground",
      description: "Run in foreground (block until complete)",
    },
    {
      name: "--var",
      description: "Set template variable (prefer --KEY=VALUE)",
      deprecated: true,
      hidden: true,
      args: { name: "KEY=VALUE" },
    },
  ],
  args: {
    name: "name",
    description: "Filter by command name(s)",
    isOptional: true,
    isVariadic: true,
    generators: dynamic,
  },
}));

const completionSpec: Fig.Spec = {
  name: "wt",
  description: "Git worktree management for parallel AI agent workflows",
  options: [
    {
      name: ["-h", "--help"],
      description: "Print help",
      isPersistent: true,
    },
    { name: ["-V", "--version"], description: "Print version" },
    {
      name: "-C",
      description: "Working directory for this command",
      isPersistent: true,
      args: { name: "path", template: "folders" },
    },
    {
      name: "--config",
      description: "User config file path",
      isPersistent: true,
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "--config-set",
      description: "Override config with inline TOML",
      isPersistent: true,
      isRepeatable: true,
      args: { name: "toml" },
    },
    {
      name: ["-v", "--verbose"],
      description: "Verbose output (-vv: also debug logs)",
      isPersistent: true,
      isRepeatable: true,
    },
    {
      name: ["-y", "--yes"],
      description: "Skip approval prompts",
      isPersistent: true,
    },
  ],
  args: {
    name: "alias",
    description: "User or project alias",
    isOptional: true,
    generators: aliases,
  },
  subcommands: [
    {
      name: "switch",
      description: "Switch to a worktree; create if needed",
      options: [
        { name: ["-c", "--create"], description: "Create a new branch" },
        {
          name: ["-b", "--base"],
          description: "Base branch",
          args: { name: "base", generators: dynamic },
        },
        {
          name: "--path",
          description: "Worktree directory for a new worktree [experimental]",
          args: { name: "path", template: "folders" },
        },
        {
          name: ["-x", "--execute"],
          description: "Program to run after switch",
          args: { name: "program" },
        },
        { name: "--clobber", description: "Remove stale paths at target" },
        {
          name: "--no-cd",
          description: "Skip directory change after switching",
        },
        {
          name: "--branches",
          description: "Include branches without worktrees",
        },
        { name: "--remotes", description: "Include remote branches" },
        { name: "--prs", description: "Include open PRs/MRs" },
        noHooks,
        formatText,
        {
          name: "--",
          description: "Additional arguments for the --execute command",
          args: { name: "execute-args", isVariadic: true },
        },
      ],
      args: {
        name: "branch",
        description: "Branch, worktree path, shortcut, or PR/MR URL",
        isOptional: true,
        generators: dynamic,
        suggestions: [
          { name: "^", description: "Default branch" },
          { name: "-", description: "Previous worktree" },
          { name: "@", description: "Current worktree" },
        ],
      },
    },
    {
      name: "list",
      description: "List worktrees and their status",
      options: [
        formatTable,
        {
          name: "--branches",
          description: "Include branches without worktrees",
        },
        { name: "--remotes", description: "Include remote branches" },
        { name: "--full", description: "Show CI status and LLM summaries" },
        {
          name: "--progressive",
          description: "Show fast info immediately, update with slow info",
        },
      ],
      subcommands: [
        {
          name: "statusline",
          description: "Single-line status for the current worktree",
          options: [formatStatusline],
        },
      ],
    },
    {
      name: "remove",
      description: "Remove worktree; delete branch if merged",
      options: [
        {
          name: "--no-delete-branch",
          description: "Keep branch after removal",
        },
        {
          name: "--delete-branch",
          description: "Delete branch after removal",
        },
        {
          name: ["-D", "--force-delete"],
          description: "Delete unmerged branches",
        },
        {
          name: "--foreground",
          description: "Run removal in foreground (block until complete)",
        },
        {
          name: "--reap",
          description: "Kill processes started in the worktree [experimental]",
        },
        { name: ["-f", "--force"], description: "Force worktree removal" },
        noHooks,
        formatText,
      ],
      args: {
        name: "branches",
        description: "Branch name or worktree path",
        isOptional: true,
        isVariadic: true,
        generators: dynamic,
      },
    },
    {
      name: "merge",
      description: "Merge a branch into the target branch",
      options: [
        {
          name: ["-b", "--branch"],
          description: "Branch to merge (defaults to the current branch)",
          args: branchOption,
        },
        { name: "--no-squash", description: "Skip commit squashing" },
        { name: "--no-commit", description: "Skip commit and squash" },
        {
          name: "--no-rebase",
          description:
            "Skip rebase; require the target to fast-forward to the resulting tip",
        },
        { name: "--no-remove", description: "Keep worktree after merge" },
        {
          name: "--no-ff",
          description: "Create a merge commit (no fast-forward)",
        },
        stage,
        noHooks,
        formatText,
      ],
      args: { ...target, description: "Target branch" },
    },
    {
      name: "step",
      description: "Run individual operations",
      subcommands: [
        {
          name: "commit",
          description: "Stage and commit with LLM-generated message",
          options: [
            {
              name: ["-b", "--branch"],
              description:
                "Branch to operate on (defaults to current worktree)",
              args: branchOption,
            },
            stage,
            {
              name: "--dry-run",
              description:
                "Preview prompt, command, and generated message without committing",
            },
            noHooks,
            formatText,
          ],
        },
        {
          name: "squash",
          description: "Squash commits since branching",
          options: [
            stage,
            {
              name: "--dry-run",
              description:
                "Preview prompt, command, and generated message without squashing",
            },
            noHooks,
            formatText,
          ],
          args: { ...target, description: "Target branch" },
        },
        {
          name: "rebase",
          description: "Rebase onto target",
          options: [formatText],
          args: { ...target, description: "Target branch, tag, or commit" },
        },
        {
          name: "push",
          description: "Fast-forward target to current branch",
          options: [
            {
              name: "--no-ff",
              description: "Create a merge commit (no fast-forward)",
            },
            formatText,
          ],
          args: { ...target, description: "Target branch" },
        },
        {
          name: "diff",
          description: "Show all changes since branching",
          options: [
            {
              name: ["-b", "--branch"],
              description:
                "Branch to operate on (defaults to current worktree)",
              args: branchOption,
            },
            {
              name: "--",
              description: "Extra arguments forwarded to git diff",
              args: { name: "extra-args", isVariadic: true },
            },
          ],
          args: { ...target, description: "Target branch" },
        },
        {
          name: "copy-ignored",
          description: "Copy gitignored files to another worktree",
          options: [
            {
              name: "--from",
              description: "Source worktree branch",
              args: { name: "from", generators: dynamic },
            },
            {
              name: "--to",
              description: "Destination worktree branch",
              args: { name: "to", generators: dynamic },
            },
            { name: "--dry-run", description: "Show what would be copied" },
            {
              name: "--force",
              description: "Overwrite existing files in destination",
            },
            {
              name: "--require-include",
              description: "Require .worktreeinclude to copy anything",
            },
            formatText,
          ],
        },
        {
          name: "eval",
          description: "Evaluate a template expression",
          options: [formatText],
          args: {
            name: "template",
            description: "Template expression to evaluate",
          },
        },
        {
          name: "for-each",
          description: "Run command in each worktree",
          options: [
            formatText,
            {
              name: "--",
              description: "Command template (see --help for all variables)",
              args: { name: "args", isVariadic: true, isCommand: true },
            },
          ],
        },
        {
          name: "promote",
          description: "[experimental] Swap a branch into the main worktree",
          options: [formatText],
          args: {
            name: "branch",
            description: "Branch to promote to main worktree",
            isOptional: true,
            generators: dynamic,
          },
        },
        {
          name: "prune",
          description:
            "Remove worktrees and branches merged into the default branch",
          options: [
            { name: "--dry-run", description: "Show what would be removed" },
            {
              name: "--min-age",
              description: "Skip worktrees and branches younger than this",
              args: { name: "min-age", default: "1d" },
            },
            {
              name: "--foreground",
              description: "Run removal in foreground (block until complete)",
            },
            formatText,
          ],
        },
        {
          name: "relocate",
          description: "[experimental] Move worktrees to expected paths",
          options: [
            { name: "--dry-run", description: "Show what would be moved" },
            {
              name: "--commit",
              description: "Commit uncommitted changes before relocating",
            },
            {
              name: "--clobber",
              description: "Backup non-worktree paths at target locations",
            },
            formatText,
          ],
          args: {
            name: "branches",
            description: "Worktrees to relocate (defaults to all mismatched)",
            isOptional: true,
            isVariadic: true,
            generators: dynamic,
          },
        },
        {
          name: "tether",
          description:
            "[experimental] Run a command; kill its whole process tree when its worktree is removed",
          options: [
            {
              name: "--",
              description: "Command to run (run directly, no shell)",
              args: { name: "command", isCommand: true },
            },
          ],
        },
      ],
    },
    {
      name: "hook",
      description: "Run configured hooks",
      subcommands: [
        {
          name: "show",
          description: "Show configured hooks",
          options: [
            {
              name: "--expanded",
              description: "Show expanded commands with current variables",
            },
            formatText,
          ],
          args: {
            name: "hook-type",
            description: "Hook type to show (default: all)",
            isOptional: true,
            suggestions: hookTypes,
          },
        },
        ...hookSubcommands,
      ],
    },
    {
      name: "config",
      description: "Manage user & project configs",
      subcommands: [
        {
          name: "shell",
          description: "Shell integration setup",
          subcommands: [
            {
              name: "init",
              description: "Generate shell integration code",
              options: [
                {
                  name: "--cmd",
                  description:
                    "Command name for shell integration (defaults to binary name)",
                  args: { name: "cmd" },
                },
              ],
              args: {
                name: "shell",
                description: "Shell to generate code for",
                suggestions: shells,
              },
            },
            {
              name: "install",
              description: "Write shell integration to config files",
              options: [
                {
                  name: "--dry-run",
                  description: "Show what would be changed",
                },
                {
                  name: "--cmd",
                  description:
                    "Command name for shell integration (defaults to binary name)",
                  args: { name: "cmd" },
                },
              ],
              args: {
                name: "shell",
                description: "Shell to install (default: all)",
                isOptional: true,
                suggestions: shells,
              },
            },
            {
              name: "uninstall",
              description: "Remove shell integration from config files",
              options: [
                {
                  name: "--dry-run",
                  description: "Show what would be changed",
                },
              ],
              args: {
                name: "shell",
                description: "Shell to uninstall (default: all)",
                isOptional: true,
                suggestions: shells,
              },
            },
            {
              name: "show-theme",
              description: "Show output theme samples",
            },
          ],
        },
        {
          name: "create",
          description: "Create configuration file",
          options: [
            {
              name: "--project",
              description:
                "Create project config (.config/wt.toml) instead of user config",
            },
          ],
        },
        {
          name: "show",
          description: "Show configuration files & locations",
          options: [
            {
              name: "--full",
              description:
                "Run diagnostic checks (CI tools, commit generation, version)",
            },
            formatText,
          ],
        },
        {
          name: "update",
          description: "Update deprecated config settings",
          options: [
            {
              name: "--output",
              description: "Output migrated config (- for stdout)",
              args: { name: "path", template: "filepaths" },
            },
          ],
        },
        {
          name: "approvals",
          description: "Manage command approvals",
          subcommands: [
            {
              name: "list",
              description: "List project commands and their approval status",
              options: [formatText],
            },
            {
              name: "add",
              description: "Store approvals in approvals.toml",
              options: [{ name: "--all", description: "Show all commands" }],
            },
            {
              name: "clear",
              description: "Clear approved commands from approvals.toml",
              options: [
                {
                  name: ["-g", "--global"],
                  description: "Clear global approvals",
                },
                { name: "--stale", description: "Clear only stale approvals" },
              ],
            },
          ],
        },
        {
          name: "alias",
          description: "Inspect and preview aliases",
          subcommands: [
            {
              name: "show",
              description:
                "Show an alias's template, or all aliases' templates",
              args: {
                name: "name",
                description: "Alias name (omit to show all)",
                isOptional: true,
                generators: dynamic,
              },
            },
            {
              name: "dry-run",
              description:
                "Preview an alias invocation with template expansion",
              options: [
                {
                  name: "--",
                  description:
                    "Arguments forwarded to the alias as if typed after wt <name>",
                  args: { name: "args", isVariadic: true },
                },
              ],
              args: {
                name: "name",
                description: "Alias name",
                generators: dynamic,
              },
            },
          ],
        },
        {
          name: "plugins",
          description: "Plugin management",
          subcommands: [
            {
              name: "claude",
              description: "Claude Code plugin",
              subcommands: [
                {
                  name: "install",
                  description: "Install the Worktrunk plugin",
                },
                {
                  name: "uninstall",
                  description: "Remove the Worktrunk plugin",
                },
                {
                  name: "install-statusline",
                  description: "Configure the Claude Code statusline",
                },
              ],
            },
            {
              name: "codex",
              description: "Codex plugin",
              subcommands: [
                {
                  name: "install",
                  description: "Install the Worktrunk plugins",
                },
                {
                  name: "uninstall",
                  description: "Remove the Worktrunk plugins",
                },
              ],
            },
            {
              name: "omp",
              description: "oh-my-pi activity hook",
              subcommands: [
                {
                  name: "install",
                  description: "Install the activity tracking hook",
                },
                {
                  name: "uninstall",
                  description: "Remove the activity tracking hook",
                },
              ],
            },
            {
              name: "opencode",
              description: "OpenCode plugin",
              subcommands: [
                {
                  name: "install",
                  description: "Install the activity tracking plugin",
                },
                {
                  name: "uninstall",
                  description: "Remove the activity tracking plugin",
                },
              ],
            },
            {
              name: "pi",
              description: "Pi activity extension",
              subcommands: [
                {
                  name: "install",
                  description: "Install the activity tracking extension",
                },
                {
                  name: "uninstall",
                  description: "Remove the activity tracking extension",
                },
              ],
            },
          ],
        },
        {
          name: "state",
          description: "Manage internal data and cache",
          subcommands: [
            {
              name: "get",
              description: "Get all stored state",
              options: [formatTable],
            },
            { name: "clear", description: "Clear all stored state" },
            {
              name: "cache",
              description: "Regenerable caches",
              options: [formatText],
              subcommands: [
                {
                  name: "get",
                  description: "Show cache contents",
                  options: [formatText],
                },
                {
                  name: "clear",
                  description: "Drop all caches",
                  options: [formatText],
                },
              ],
            },
            {
              name: "default-branch",
              description: "Default branch detection and override",
              subcommands: [
                { name: "get", description: "Get the default branch" },
                {
                  name: "set",
                  description: "Set the default branch",
                  args: {
                    name: "branch",
                    description: "Branch name to set as default",
                    generators: dynamic,
                  },
                },
                {
                  name: "clear",
                  description: "Clear the default branch cache",
                },
              ],
            },
            {
              name: "logs",
              description: "Operation and debug logs",
              options: [formatText],
              subcommands: [
                {
                  name: "get",
                  description: "List all log file paths",
                  options: [formatText],
                },
                {
                  name: "profile",
                  description: "Performance profile from a trace",
                  options: [formatText],
                  args: {
                    name: "file",
                    description:
                      "Trace to read (defaults to .git/wt/logs/trace.jsonl; - for stdin)",
                    isOptional: true,
                    template: "filepaths",
                  },
                },
                {
                  name: "clear",
                  description: "Clear all log files",
                  options: [formatText],
                },
              ],
            },
            {
              name: "marker",
              description: "Branch markers",
              options: [formatText],
              subcommands: [
                {
                  name: "get",
                  description: "Get marker for a branch",
                  options: [targetBranch, formatText],
                },
                {
                  name: "set",
                  description: "Set marker for a branch",
                  options: [targetBranch, formatText],
                  args: {
                    name: "value",
                    description: "Marker text (shown in wt list output)",
                  },
                },
                {
                  name: "clear",
                  description: "Clear marker for a branch",
                  options: [
                    targetBranch,
                    { name: "--all", description: "Clear all markers" },
                    formatText,
                  ],
                },
              ],
            },
            {
              name: "vars",
              description: "Custom variables per branch",
              subcommands: [
                {
                  name: "get",
                  description: "Get a value",
                  options: [targetBranch],
                  args: {
                    name: "key",
                    description: "Key name",
                    generators: varKeys,
                  },
                },
                {
                  name: "list",
                  description: "List all keys",
                  options: [targetBranch, formatText],
                },
                {
                  name: "set",
                  description: "Set a value",
                  options: [targetBranch],
                  args: { name: "key=value", description: "KEY=VALUE pair" },
                },
                {
                  name: "clear",
                  description: "Clear a key or all keys",
                  options: [
                    {
                      name: "--all",
                      description: "Clear all keys for the branch",
                    },
                    targetBranch,
                  ],
                  args: {
                    name: "key",
                    description: "Key to clear (required unless --all)",
                    isOptional: true,
                    generators: varKeys,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default completionSpec;
