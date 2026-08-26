const effortLevels: Fig.Suggestion[] = [
  { name: "low" },
  { name: "medium" },
  { name: "high" },
  { name: "xhigh" },
  { name: "max" },
];

const permissionModes: Fig.Suggestion[] = [
  { name: "acceptEdits" },
  { name: "auto" },
  { name: "bypassPermissions" },
  { name: "manual" },
  { name: "dontAsk" },
  { name: "plan" },
];

const settingSources: Fig.Suggestion[] = [
  { name: "user" },
  { name: "project" },
  { name: "local" },
];

const mcpScopeOption: Fig.Option = {
  name: ["-s", "--scope"],
  description: "Configuration scope (local, user, or project)",
  args: {
    name: "scope",
    default: "local",
    suggestions: [{ name: "local" }, { name: "user" }, { name: "project" }],
  },
};

const completionSpec: Fig.Spec = {
  name: "claude",
  description:
    "Claude Code - starts an interactive session by default, use -p/--print for non-interactive output",
  args: {
    name: "prompt",
    description: "Your prompt",
    isOptional: true,
  },
  subcommands: [
    {
      name: "agents",
      description: "Manage background agents",
      options: [
        {
          name: "--add-dir",
          description:
            "Additional directory to allow tool access to in dispatched sessions",
          isRepeatable: true,
          args: { name: "directory", template: "folders" },
        },
        {
          name: "--agent",
          description: "Default agent for sessions dispatched from agent view",
          args: { name: "agent" },
        },
        {
          name: "--all",
          description:
            "With --json: also include completed background sessions",
        },
        {
          name: "--allow-dangerously-skip-permissions",
          description:
            "Make bypass-permissions mode available to dispatched sessions without defaulting to it",
        },
        {
          name: "--cwd",
          description: "Show only background sessions started under <path>",
          args: { name: "path", template: "folders" },
        },
        {
          name: "--dangerously-skip-permissions",
          description: "Alias for --permission-mode bypassPermissions",
        },
        {
          name: "--effort",
          description:
            "Default effort level for sessions dispatched from agent view",
          args: { name: "level", suggestions: effortLevels },
        },
        {
          name: "--json",
          description:
            "Print active sessions (interactive and background) as a JSON array and exit",
        },
        {
          name: "--mcp-config",
          description:
            "MCP server configuration to apply to dispatched sessions",
          isRepeatable: true,
          args: { name: "config", template: "filepaths" },
        },
        {
          name: "--model",
          description: "Default model for sessions dispatched from agent view",
          args: { name: "model" },
        },
        {
          name: "--permission-mode",
          description:
            "Default permission mode for sessions dispatched from agent view",
          args: { name: "mode", suggestions: permissionModes },
        },
        {
          name: "--plugin-dir",
          description:
            "Load plugins from specified directory for the agent view and dispatched sessions",
          isRepeatable: true,
          args: { name: "path", template: "folders" },
        },
        {
          name: "--setting-sources",
          description:
            "Comma-separated list of setting sources to load (user, project, local)",
          args: { name: "sources", suggestions: settingSources },
        },
        {
          name: "--settings",
          description:
            "Settings file or JSON string to apply to the agent view and dispatched sessions",
          args: { name: "file-or-json", template: "filepaths" },
        },
        {
          name: "--strict-mcp-config",
          description:
            "Only use MCP servers from --mcp-config in dispatched sessions",
        },
      ],
    },
    {
      name: "auth",
      description: "Manage authentication",
      subcommands: [
        {
          name: "login",
          description: "Sign in to your Anthropic account",
          options: [
            {
              name: "--claudeai",
              description: "Use Claude subscription (default)",
            },
            {
              name: "--console",
              description:
                "Use Anthropic Console (API usage billing) instead of Claude subscription",
            },
            {
              name: "--email",
              description: "Pre-populate email address on the login page",
              args: { name: "email" },
            },
            {
              name: "--sso",
              description: "Force SSO login flow",
            },
          ],
        },
        {
          name: "logout",
          description: "Log out from your Anthropic account",
        },
        {
          name: "status",
          description: "Show authentication status",
          options: [
            {
              name: "--json",
              description: "Output as JSON (default)",
            },
            {
              name: "--text",
              description: "Output as human-readable text",
            },
          ],
        },
      ],
    },
    {
      name: "auto-mode",
      description: "Inspect or reset auto mode classifier configuration",
      subcommands: [
        {
          name: "config",
          description:
            "Print the effective auto mode config as JSON: your settings where set, defaults otherwise",
        },
        {
          name: "critique",
          description: "Get AI feedback on your custom auto mode rules",
          options: [
            {
              name: "--model",
              description: "Override which model is used",
              args: { name: "model" },
            },
          ],
        },
        {
          name: "defaults",
          description:
            "Print the default auto mode environment, allow, soft_deny, and hard_deny rules as JSON",
          options: [
            {
              name: "--label",
              description:
                "Show only rules whose label starts with this prefix",
              args: { name: "prefix" },
            },
          ],
        },
        {
          name: "reset",
          description:
            "Reset auto mode configuration to the shipped defaults by removing the autoMode section from your user settings file",
          options: [
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
          ],
        },
      ],
    },
    {
      name: "doctor",
      description: "Check the health of your Claude Code installation",
    },
    {
      name: "gateway",
      description: "Run the enterprise auth/telemetry gateway",
      options: [
        {
          name: "--config",
          description: "Path to gateway YAML config",
          args: { name: "path", template: "filepaths" },
        },
      ],
    },
    {
      name: "import",
      description:
        "Import config from another AI coding agent into Claude Code",
      args: {
        name: "source",
        description: "Which agent to import from",
        isOptional: true,
        suggestions: [{ name: "codex" }, { name: "gemini" }],
      },
      options: [
        {
          name: "--dry-run",
          description: "Show what would be imported without writing anything",
        },
        {
          name: "--yes",
          description: "Skip the interactive picker",
          args: { name: "digest", isOptional: true },
        },
      ],
    },
    {
      name: "install",
      description: "Install Claude Code native build",
      args: {
        name: "target",
        description: "Version to install",
        isOptional: true,
        suggestions: [{ name: "stable" }, { name: "latest" }],
      },
      options: [
        {
          name: "--force",
          description: "Force installation even if already installed",
        },
      ],
    },
    {
      name: "mcp",
      description: "Configure and manage MCP servers",
      subcommands: [
        {
          name: "add",
          description: "Add an MCP server to Claude Code",
          args: [
            { name: "name" },
            { name: "commandOrUrl" },
            { name: "args", isOptional: true, isVariadic: true },
          ],
          options: [
            {
              name: "--callback-port",
              description: "Fixed port for OAuth callback",
              args: { name: "port" },
            },
            {
              name: "--client-id",
              description: "OAuth client ID for HTTP/SSE servers",
              args: { name: "clientId" },
            },
            {
              name: "--client-secret",
              description: "Prompt for OAuth client secret",
            },
            {
              name: ["-e", "--env"],
              description: "Set environment variables",
              args: { name: "env", isVariadic: true },
            },
            {
              name: ["-H", "--header"],
              description: "Set WebSocket headers",
              args: { name: "header", isVariadic: true },
            },
            mcpScopeOption,
            {
              name: ["-t", "--transport"],
              description: "Transport type, defaults to stdio if not specified",
              args: {
                name: "transport",
                suggestions: [
                  { name: "stdio" },
                  { name: "sse" },
                  { name: "http" },
                ],
              },
            },
          ],
        },
        {
          name: "add-from-claude-desktop",
          description:
            "Import MCP servers from Claude Desktop (Mac and WSL only)",
          options: [mcpScopeOption],
        },
        {
          name: "add-json",
          description: "Add an MCP server (stdio or SSE) with a JSON string",
          args: [{ name: "name" }, { name: "json" }],
          options: [
            {
              name: "--client-secret",
              description: "Prompt for OAuth client secret",
            },
            mcpScopeOption,
          ],
        },
        {
          name: "get",
          description: "Get details about an MCP server",
          args: { name: "name" },
        },
        {
          name: "list",
          description: "List configured MCP servers",
        },
        {
          name: "login",
          description:
            "Authenticate with an MCP server (HTTP, SSE, or claude.ai connector)",
          args: { name: "name" },
          options: [
            {
              name: "--no-browser",
              description:
                "Print the authorization URL instead of opening a browser",
            },
          ],
        },
        {
          name: "logout",
          description: "Clear stored OAuth credentials for an MCP server",
          args: { name: "name" },
        },
        {
          name: "remove",
          description: "Remove an MCP server",
          args: { name: "name" },
          options: [
            {
              name: ["-s", "--scope"],
              description:
                "Configuration scope (local, user, or project) - if not specified, removes from whichever scope it exists in",
              args: {
                name: "scope",
                suggestions: [
                  { name: "local" },
                  { name: "user" },
                  { name: "project" },
                ],
              },
            },
          ],
        },
        {
          name: "reset-project-choices",
          description:
            "Reset all approved and rejected project-scoped (.mcp.json) servers within this project",
        },
        {
          name: "serve",
          description: "Start the Claude Code MCP server",
          options: [
            {
              name: ["-d", "--debug"],
              description: "Enable debug mode",
            },
            {
              name: "--verbose",
              description: "Override verbose mode setting from config",
            },
          ],
        },
      ],
    },
    {
      name: ["plugin", "plugins"],
      description: "Manage Claude Code plugins",
      subcommands: [
        {
          name: "details",
          description:
            "Show a plugin's component inventory and projected token cost",
          args: { name: "name" },
        },
        {
          name: "disable",
          description: "Disable an enabled plugin",
          args: { name: "plugin", isOptional: true },
          options: [
            {
              name: ["-a", "--all"],
              description: "Disable all enabled plugins",
            },
            {
              name: ["-s", "--scope"],
              description: "Installation scope: user, project, local",
              args: {
                name: "scope",
                suggestions: [
                  { name: "user" },
                  { name: "project" },
                  { name: "local" },
                ],
              },
            },
          ],
        },
        {
          name: "enable",
          description: "Enable a disabled plugin",
          args: { name: "plugin" },
          options: [
            {
              name: ["-s", "--scope"],
              description: "Installation scope: user, project, local",
              args: {
                name: "scope",
                suggestions: [
                  { name: "user" },
                  { name: "project" },
                  { name: "local" },
                ],
              },
            },
          ],
        },
        {
          name: "eval",
          description:
            "Run eval cases against a plugin and report scored results",
          args: { name: "target", isOptional: true, template: "filepaths" },
          options: [
            {
              name: "--eval-dir",
              description:
                "Directory holding the eval cases, instead of evals/",
              args: { name: "dir", template: "folders" },
            },
          ],
        },
        {
          name: ["init", "new"],
          description: "Scaffold a new plugin at ~/.claude/skills/<name>/",
          args: { name: "name" },
          options: [
            {
              name: "--author",
              description: "Author name",
              args: { name: "name" },
            },
            {
              name: "--author-email",
              description: "Author email",
              args: { name: "email" },
            },
            {
              name: "--description",
              description: "Manifest description",
              args: { name: "text" },
            },
            {
              name: ["-f", "--force"],
              description:
                "Overwrite an existing .claude-plugin/ at the target",
            },
            {
              name: "--with",
              description: "Also scaffold extra components",
              args: {
                name: "components",
                isVariadic: true,
                suggestions: [
                  { name: "skills" },
                  { name: "agents" },
                  { name: "hooks" },
                  { name: "mcp" },
                  { name: "lsp" },
                  { name: "output-style" },
                  { name: "channel" },
                ],
              },
            },
          ],
        },
        {
          name: ["install", "i"],
          description: "Install a plugin from available marketplaces",
          args: { name: "plugin" },
          options: [
            {
              name: "--config",
              description:
                "Set a userConfig option declared in the plugin's manifest",
              isRepeatable: true,
              args: { name: "key=value" },
            },
            {
              name: ["-s", "--scope"],
              description: "Installation scope: user, project, or local",
              args: {
                name: "scope",
                default: "user",
                suggestions: [
                  { name: "user" },
                  { name: "project" },
                  { name: "local" },
                ],
              },
            },
            {
              name: ["-y", "--yes"],
              description:
                "Accept the displayed marketplace-declared command without the confirmation prompt",
            },
          ],
        },
        {
          name: "list",
          description: "List installed plugins",
          options: [
            {
              name: "--available",
              description:
                "Include available plugins from marketplaces (requires --json)",
            },
            {
              name: "--json",
              description: "Output as JSON",
            },
          ],
        },
        {
          name: "marketplace",
          description: "Manage Claude Code marketplaces",
          subcommands: [
            {
              name: "add",
              description: "Add a marketplace from a URL, path, or GitHub repo",
              args: { name: "source" },
              options: [
                {
                  name: "--scope",
                  description:
                    "Where to declare the marketplace: user (default), project, or local",
                  args: {
                    name: "scope",
                    suggestions: [
                      { name: "user" },
                      { name: "project" },
                      { name: "local" },
                    ],
                  },
                },
                {
                  name: "--sparse",
                  description:
                    "Limit checkout to specific directories via git sparse-checkout",
                  args: {
                    name: "paths",
                    isVariadic: true,
                    template: "folders",
                  },
                },
              ],
            },
            {
              name: "list",
              description: "List all configured marketplaces",
              options: [
                {
                  name: "--json",
                  description: "Output as JSON",
                },
              ],
            },
            {
              name: ["remove", "rm"],
              description: "Remove a configured marketplace",
              args: { name: "name" },
              options: [
                {
                  name: "--scope",
                  description:
                    "Remove the marketplace declaration from a specific settings scope: user, project, or local",
                  args: {
                    name: "scope",
                    suggestions: [
                      { name: "user" },
                      { name: "project" },
                      { name: "local" },
                    ],
                  },
                },
              ],
            },
            {
              name: "update",
              description:
                "Update marketplace(s) from their source - updates all if no name specified",
              args: { name: "name", isOptional: true },
            },
          ],
        },
        {
          name: ["prune", "autoremove"],
          description:
            "Remove auto-installed dependencies that are no longer needed",
          options: [
            {
              name: "--dry-run",
              description: "List what would be removed without removing",
            },
            {
              name: ["-s", "--scope"],
              description: "Prune at scope: user, project, or local",
              args: {
                name: "scope",
                default: "user",
                suggestions: [
                  { name: "user" },
                  { name: "project" },
                  { name: "local" },
                ],
              },
            },
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
          ],
        },
        {
          name: "tag",
          description:
            "Create a {name}--v{version} git tag for a plugin release",
          args: { name: "path", isOptional: true, template: "folders" },
          options: [
            {
              name: "--dry-run",
              description: "Print what would be tagged without creating it",
            },
            {
              name: ["-f", "--force"],
              description:
                "Skip the dirty-working-tree and tag-already-exists checks",
            },
            {
              name: ["-m", "--message"],
              description: "Tag annotation message (use %s for the version)",
              args: { name: "msg" },
            },
            {
              name: "--push",
              description: "Push the tag to --remote after creating it",
            },
            {
              name: "--remote",
              description: "Remote to push to with --push",
              args: { name: "name", default: "origin" },
            },
          ],
        },
        {
          name: ["uninstall", "remove"],
          description: "Uninstall an installed plugin",
          args: { name: "plugin" },
          options: [
            {
              name: "--keep-data",
              description: "Preserve the plugin's persistent data directory",
            },
            {
              name: "--prune",
              description:
                "Also remove auto-installed dependencies that are no longer needed",
            },
            {
              name: ["-s", "--scope"],
              description: "Uninstall from scope: user, project, or local",
              args: {
                name: "scope",
                default: "user",
                suggestions: [
                  { name: "user" },
                  { name: "project" },
                  { name: "local" },
                ],
              },
            },
            {
              name: ["-y", "--yes"],
              description: "Skip the --prune confirmation prompt",
            },
          ],
        },
        {
          name: "update",
          description:
            "Update a plugin to the latest version (restart required to apply)",
          args: { name: "plugin" },
          options: [
            {
              name: ["-s", "--scope"],
              description: "Installation scope: user, project, local, managed",
              args: {
                name: "scope",
                default: "user",
                suggestions: [
                  { name: "user" },
                  { name: "project" },
                  { name: "local" },
                  { name: "managed" },
                ],
              },
            },
            {
              name: ["-y", "--yes"],
              description:
                "Accept the displayed marketplace-declared command without the confirmation prompt",
            },
          ],
        },
        {
          name: "validate",
          description:
            "Validate a plugin or marketplace manifest, or the skills, agents, and commands in a directory",
          args: { name: "path", template: "filepaths" },
          options: [
            {
              name: "--strict",
              description: "Treat warnings as errors (exit 1)",
            },
          ],
        },
      ],
    },
    {
      name: "project",
      description: "Manage Claude Code project state",
      subcommands: [
        {
          name: "purge",
          description:
            "Delete all Claude Code state for a project (transcripts, tasks, file history, config entry)",
          args: { name: "path", isOptional: true, template: "folders" },
          options: [
            {
              name: "--all",
              description:
                "Purge state for every project (mutually exclusive with [path])",
            },
            {
              name: "--dry-run",
              description:
                "List what would be deleted without deleting anything",
            },
            {
              name: ["-i", "--interactive"],
              description: "Prompt for each item before deleting",
            },
            {
              name: ["-y", "--yes"],
              description: "Skip confirmation prompt",
            },
          ],
        },
      ],
    },
    {
      name: "setup-token",
      description:
        "Set up a long-lived authentication token (requires Claude subscription)",
    },
    {
      name: "ultrareview",
      description:
        "Run a cloud-hosted multi-agent code review of the current branch and print the findings",
      args: {
        name: "target",
        description: "PR number or base branch",
        isOptional: true,
      },
      options: [
        {
          name: "--json",
          description:
            "Print the raw bugs.json payload instead of formatted findings",
        },
        {
          name: "--no-post",
          description: "Do not post the findings to the PR (the default)",
          exclusiveOn: ["--post"],
        },
        {
          name: "--post",
          description:
            "Post the finished review's findings to the PR as you (PR targets only)",
          exclusiveOn: ["--no-post"],
        },
        {
          name: "--timeout",
          description: "Maximum minutes to wait for the review to finish",
          args: { name: "minutes", default: "30" },
        },
      ],
    },
    {
      name: ["update", "upgrade"],
      description: "Check for updates and install if available",
    },
  ],
  options: [
    {
      name: "--add-dir",
      description: "Additional directories to allow tool access to",
      args: { name: "directories", isVariadic: true, template: "folders" },
    },
    {
      name: "--agent",
      description: "Agent for the current session",
      args: { name: "agent" },
    },
    {
      name: "--agents",
      description: "JSON object defining custom agents",
      args: { name: "json" },
    },
    {
      name: "--allow-dangerously-skip-permissions",
      description:
        "Enable bypassing all permission checks as an option, without it being enabled by default",
    },
    {
      name: ["--allowedTools", "--allowed-tools"],
      description: "Comma or space-separated list of tool names to allow",
      args: { name: "tools", isVariadic: true },
    },
    {
      name: "--append-system-prompt",
      description: "Append a system prompt to the default system prompt",
      args: { name: "prompt" },
    },
    {
      name: "--autocompact",
      description: "Auto-compact window size (auto, or 100k-1M tokens)",
      args: { name: "auto|tokens", suggestions: [{ name: "auto" }] },
    },
    {
      name: "--ax-screen-reader",
      description:
        "Render screen-reader friendly output (flat text, no decorative borders or animations)",
    },
    {
      name: ["--bg", "--background"],
      description:
        "Start the session as a background agent and return immediately",
    },
    {
      name: "--bare",
      description:
        "Minimal mode: skip hooks, LSP, plugin sync, attribution, auto-memory, background prefetches, keychain reads, and CLAUDE.md auto-discovery",
    },
    {
      name: "--betas",
      description:
        "Beta headers to include in API requests (API key users only)",
      args: { name: "betas", isVariadic: true },
    },
    {
      name: "--brief",
      description:
        "Enable SendUserMessage tool for agent-to-user communication",
    },
    {
      name: "--chrome",
      description: "Enable Claude in Chrome integration",
      exclusiveOn: ["--no-chrome"],
    },
    {
      name: "--cloud",
      description:
        "Create a cloud session with the given description, or attach to an existing one by session ID or claude.ai/code URL",
      args: { name: "description|session_id|url", isOptional: true },
    },
    {
      name: ["-c", "--continue"],
      description:
        "Continue the most recent conversation in the current directory",
    },
    {
      name: "--dangerously-skip-permissions",
      description: "Bypass all permission checks",
    },
    {
      name: ["-d", "--debug"],
      description: "Enable debug mode with optional category filtering",
      args: { name: "filter", isOptional: true },
    },
    {
      name: "--debug-file",
      description: "Write debug logs to a specific file path",
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "--disable-slash-commands",
      description: "Disable all skills",
    },
    {
      name: ["--disallowedTools", "--disallowed-tools"],
      description: "Comma or space-separated list of tool names to deny",
      args: { name: "tools", isVariadic: true },
    },
    {
      name: "--effort",
      description: "Effort level for the current session",
      args: { name: "level", suggestions: effortLevels },
    },
    {
      name: "--environment",
      description:
        "Create a new cloud session that runs on the given self-hosted environment",
      args: { name: "environment_id" },
    },
    {
      name: "--exclude-dynamic-system-prompt-sections",
      description:
        "Move per-machine sections (cwd, env info, memory paths, git status) from the system prompt into the first user message",
    },
    {
      name: "--fallback-model",
      description:
        "Enable automatic fallback to specified model(s) when the default model is overloaded or not available",
      args: { name: "model" },
    },
    {
      name: "--file",
      description:
        "File resources to download at startup, formatted as file_id:relative_path",
      args: { name: "specs", isVariadic: true },
    },
    {
      name: "--fork-session",
      description:
        "When resuming, create a new session ID instead of reusing the original",
    },
    {
      name: "--forward-subagent-text",
      description:
        "Forward subagent text and thinking blocks as assistant/user messages with parent_tool_use_id set",
    },
    {
      name: "--from-pr",
      description:
        "Resume a session linked to a PR by PR number/URL, or open interactive picker with optional search term",
      args: { name: "value", isOptional: true },
    },
    {
      name: ["-h", "--help"],
      description: "Display help for command",
      isPersistent: true,
    },
    {
      name: "--ide",
      description:
        "Automatically connect to IDE on startup if exactly one valid IDE is available",
    },
    {
      name: "--include-hook-events",
      description: "Include all hook lifecycle events in the output stream",
    },
    {
      name: "--include-partial-messages",
      description: "Include partial message chunks as they arrive",
    },
    {
      name: "--input-format",
      description: "Input format (only works with --print)",
      args: {
        name: "format",
        default: "text",
        suggestions: [{ name: "text" }, { name: "stream-json" }],
      },
    },
    {
      name: "--json-schema",
      description: "JSON Schema for structured output validation",
      args: { name: "schema" },
    },
    {
      name: "--max-budget-usd",
      description: "Maximum dollar amount to spend on API calls",
      args: { name: "amount" },
    },
    {
      name: "--mcp-config",
      description: "Load MCP servers from JSON files or strings",
      args: { name: "configs", isVariadic: true, template: "filepaths" },
    },
    {
      name: "--model",
      description: "Model for the current session",
      args: {
        name: "model",
        suggestions: [{ name: "fable" }, { name: "opus" }, { name: "sonnet" }],
      },
    },
    {
      name: ["-n", "--name"],
      description: "Set a display name for this session",
      args: { name: "name" },
    },
    {
      name: "--no-chrome",
      description: "Disable Claude in Chrome integration",
      exclusiveOn: ["--chrome"],
    },
    {
      name: "--no-session-persistence",
      description:
        "Disable session persistence - sessions will not be saved to disk and cannot be resumed",
    },
    {
      name: "--output-format",
      description: "Output format (only works with --print)",
      args: {
        name: "format",
        default: "text",
        suggestions: [
          { name: "text" },
          { name: "json" },
          { name: "stream-json" },
        ],
      },
    },
    {
      name: "--permission-mode",
      description: "Permission mode to use for the session",
      args: { name: "mode", suggestions: permissionModes },
    },
    {
      name: "--plugin-dir",
      description:
        "Load a plugin from a directory or .zip for this session only",
      isRepeatable: true,
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "--plugin-url",
      description: "Fetch a plugin .zip from a URL for this session only",
      isRepeatable: true,
      args: { name: "url" },
    },
    {
      name: ["-p", "--print"],
      description: "Print response and exit (useful for pipes)",
    },
    {
      name: "--prompt-suggestions",
      description: "Enable prompt suggestions",
      args: {
        name: "value",
        isOptional: true,
        default: "true",
        suggestions: [
          { name: "true" },
          { name: "false" },
          { name: "1" },
          { name: "0" },
          { name: "yes" },
          { name: "no" },
          { name: "on" },
          { name: "off" },
        ],
      },
    },
    {
      name: "--remote-control",
      description:
        "Start an interactive session with Remote Control enabled (optionally named)",
      args: { name: "name", isOptional: true },
    },
    {
      name: "--remote-control-session-name-prefix",
      description:
        "Prefix for auto-generated Remote Control session names (default: hostname)",
      args: { name: "prefix" },
    },
    {
      name: "--replay-user-messages",
      description:
        "Re-emit user messages from stdin back on stdout for acknowledgment",
    },
    {
      name: ["-r", "--resume"],
      description:
        "Resume a conversation by session ID, or open interactive picker with optional search term",
      args: { name: "value", isOptional: true },
    },
    {
      name: "--safe-mode",
      description:
        "Start with all customizations disabled - useful for troubleshooting a broken configuration",
    },
    {
      name: "--session-id",
      description:
        "Use a specific session ID for the conversation (must be a valid UUID)",
      args: { name: "uuid" },
    },
    {
      name: "--setting-sources",
      description:
        "Comma-separated list of setting sources to load (user, project, local)",
      args: { name: "sources", suggestions: settingSources },
    },
    {
      name: "--settings",
      description:
        "Path to a settings JSON file or a JSON string to load additional settings from",
      args: { name: "file-or-json", template: "filepaths" },
    },
    {
      name: "--strict-mcp-config",
      description:
        "Only use MCP servers from --mcp-config, ignoring all other MCP configurations",
    },
    {
      name: "--system-prompt",
      description: "System prompt to use for the session",
      args: { name: "prompt" },
    },
    {
      name: "--teleport",
      description: "Resume a teleport session, optionally specify session ID",
      args: { name: "session", isOptional: true },
    },
    {
      name: "--tmux",
      description:
        "Create a tmux session for the worktree (requires --worktree)",
      dependsOn: ["--worktree"],
    },
    {
      name: "--tools",
      description: "Specify the list of available tools from the built-in set",
      args: {
        name: "tools",
        isVariadic: true,
        suggestions: [{ name: "default" }],
      },
    },
    {
      name: "--verbose",
      description: "Override verbose mode setting from config",
    },
    {
      name: ["-v", "--version"],
      description: "Output the version number",
    },
    {
      name: ["-w", "--worktree"],
      description:
        "Create a new git worktree for this session (optionally specify a name)",
      args: { name: "name", isOptional: true },
    },
  ],
};

export default completionSpec;
