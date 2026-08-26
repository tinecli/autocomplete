const configOverrideOption: Fig.Option = {
  name: ["-c", "--config"],
  description: "Override a configuration value from `~/.codex/config.toml`",
  isPersistent: true,
  isRepeatable: true,
  args: { name: "key=value" },
};

const enableFeatureOption: Fig.Option = {
  name: "--enable",
  description: "Enable a feature, equivalent to `-c features.<name>=true`",
  isPersistent: true,
  isRepeatable: true,
  args: { name: "feature" },
};

const disableFeatureOption: Fig.Option = {
  name: "--disable",
  description: "Disable a feature, equivalent to `-c features.<name>=false`",
  isPersistent: true,
  isRepeatable: true,
  args: { name: "feature" },
};

const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Print help",
  isPersistent: true,
};

const versionOption: Fig.Option = {
  name: ["-V", "--version"],
  description: "Print version",
};

const strictConfigOption: Fig.Option = {
  name: "--strict-config",
  description: "Error out when config.toml contains unrecognized fields",
};

const imageOption: Fig.Option = {
  name: ["-i", "--image"],
  description: "Image to attach to the initial prompt",
  isRepeatable: true,
  args: { name: "file", template: "filepaths" },
};

const modelOption: Fig.Option = {
  name: ["-m", "--model"],
  description: "Model the agent should use",
  args: { name: "model" },
};

const ossOption: Fig.Option = {
  name: "--oss",
  description: "Use open-source provider",
};

const localProviderOption: Fig.Option = {
  name: "--local-provider",
  description: "Local provider to use with an open-source model",
  args: {
    name: "oss_provider",
    suggestions: ["lmstudio", "ollama"],
  },
};

const profileOption: Fig.Option = {
  name: ["-p", "--profile"],
  description:
    "Layer `$CODEX_HOME/<name>.config.toml` on top of the user config",
  args: { name: "config_profile" },
};

const sandboxOption: Fig.Option = {
  name: ["-s", "--sandbox"],
  description: "Sandbox policy for model-generated shell commands",
  args: {
    name: "sandbox_mode",
    suggestions: [
      { name: "read-only", description: "Deny all writes and network access" },
      {
        name: "workspace-write",
        description: "Allow writes inside the workspace",
      },
      {
        name: "danger-full-access",
        description: "Run commands without a sandbox",
      },
    ],
  },
};

const approveForMeOption: Fig.Option = {
  name: "--approve-for-me",
  description:
    "Route approval requests through automatic review using the workspace-write sandbox",
};

const bypassApprovalsOption: Fig.Option = {
  name: "--dangerously-bypass-approvals-and-sandbox",
  description:
    "Skip all confirmation prompts and run commands without sandboxing",
};

const bypassHookTrustOption: Fig.Option = {
  name: "--dangerously-bypass-hook-trust",
  description: "Run enabled hooks without requiring persisted hook trust",
};

const cdOption: Fig.Option = {
  name: ["-C", "--cd"],
  description: "Directory the agent should use as its working root",
  args: { name: "dir", template: "folders" },
};

const addDirOption: Fig.Option = {
  name: "--add-dir",
  description: "Additional directory that should be writable",
  isRepeatable: true,
  args: { name: "dir", template: "folders" },
};

const remoteOption: Fig.Option = {
  name: "--remote",
  description: "Connect the TUI to a remote app server endpoint",
  args: { name: "addr" },
};

const remoteAuthTokenEnvOption: Fig.Option = {
  name: "--remote-auth-token-env",
  description:
    "Environment variable holding the bearer token for the remote app server",
  args: { name: "env_var" },
};

const askForApprovalOption: Fig.Option = {
  name: ["-a", "--ask-for-approval"],
  description:
    "When the model requires human approval before running a command",
  args: {
    name: "approval_policy",
    suggestions: [
      {
        name: "untrusted",
        description: 'Only run "trusted" commands without asking',
      },
      {
        name: "on-request",
        description: "The model decides when to ask for approval",
      },
      {
        name: "never",
        description: "Never ask; execution failures return to the model",
      },
    ],
  },
};

const searchOption: Fig.Option = {
  name: "--search",
  description: "Enable live web search",
};

const noAltScreenOption: Fig.Option = {
  name: "--no-alt-screen",
  description: "Run the TUI inline, preserving terminal scrollback",
};

const lastOption: Fig.Option = {
  name: "--last",
  description: "Use the most recent session without showing the picker",
};

const allSessionsOption: Fig.Option = {
  name: "--all",
  description: "Show all sessions, disabling the working-directory filter",
};

const skipGitRepoCheckOption: Fig.Option = {
  name: "--skip-git-repo-check",
  description: "Allow running Codex outside a Git repository",
};

const ephemeralOption: Fig.Option = {
  name: "--ephemeral",
  description: "Run without persisting session files to disk",
};

const ignoreUserConfigOption: Fig.Option = {
  name: "--ignore-user-config",
  description: "Do not load `$CODEX_HOME/config.toml`",
};

const ignoreRulesOption: Fig.Option = {
  name: "--ignore-rules",
  description: "Do not load user or project execpolicy `.rules` files",
};

const outputSchemaOption: Fig.Option = {
  name: "--output-schema",
  description: "JSON Schema file describing the model's final response shape",
  args: { name: "file", template: "filepaths" },
};

const jsonlOption: Fig.Option = {
  name: "--json",
  description: "Print events to stdout as JSONL",
};

const outputLastMessageOption: Fig.Option = {
  name: ["-o", "--output-last-message"],
  description: "File to write the last message from the agent to",
  args: { name: "file", template: "filepaths" },
};

const remoteControlJsonOption: Fig.Option = {
  name: "--json",
  description: "Emit machine-readable JSON",
};

const agentOptions: Fig.Option[] = [
  strictConfigOption,
  imageOption,
  modelOption,
  ossOption,
  localProviderOption,
  profileOption,
  sandboxOption,
  approveForMeOption,
  bypassApprovalsOption,
  bypassHookTrustOption,
  cdOption,
  addDirOption,
];

const sessionOptions: Fig.Option[] = [
  remoteOption,
  remoteAuthTokenEnvOption,
  ...agentOptions,
];

const interactiveOptions: Fig.Option[] = [
  ...sessionOptions,
  askForApprovalOption,
  searchOption,
  noAltScreenOption,
];

const execRuntimeOptions: Fig.Option[] = [
  skipGitRepoCheckOption,
  ephemeralOption,
  ignoreUserConfigOption,
  ignoreRulesOption,
  outputSchemaOption,
  jsonlOption,
  outputLastMessageOption,
];

const reviewSelectionOptions: Fig.Option[] = [
  {
    name: "--uncommitted",
    description: "Review staged, unstaged, and untracked changes",
  },
  {
    name: "--base",
    description: "Review changes against the given base branch",
    args: { name: "branch" },
  },
  {
    name: "--commit",
    description: "Review the changes introduced by a commit",
    args: { name: "sha" },
  },
  {
    name: "--title",
    description: "Commit title to display in the review summary",
    args: { name: "title" },
  },
];

const promptArg: Fig.Arg = {
  name: "prompt",
  description: "Prompt to start the session with",
  isOptional: true,
};

const sessionArg: Fig.Arg = {
  name: "session",
  description: "Session id (UUID) or session name",
};

const completionSpec: Fig.Spec = {
  name: "codex",
  description: "OpenAI Codex coding agent in your terminal",
  args: promptArg,
  subcommands: [
    {
      name: ["exec", "e"],
      description: "Run Codex non-interactively",
      args: {
        name: "prompt",
        description: "Initial instructions, or `-` to read them from stdin",
        isOptional: true,
      },
      subcommands: [
        {
          name: "resume",
          description: "Resume a previous session by id or with --last",
          args: [
            {
              name: "session_id",
              description: "Session id (UUID) or thread name",
              isOptional: true,
            },
            {
              name: "prompt",
              description: "Prompt to send after resuming the session",
              isOptional: true,
            },
          ],
          options: [
            lastOption,
            allSessionsOption,
            imageOption,
            strictConfigOption,
            modelOption,
            bypassApprovalsOption,
            bypassHookTrustOption,
            ...execRuntimeOptions,
          ],
        },
        {
          name: "review",
          description: "Run a code review against the current repository",
          args: {
            name: "prompt",
            description: "Custom review instructions",
            isOptional: true,
          },
          options: [
            ...reviewSelectionOptions,
            strictConfigOption,
            modelOption,
            bypassApprovalsOption,
            bypassHookTrustOption,
            ...execRuntimeOptions,
          ],
        },
      ],
      options: [
        ...agentOptions,
        ...execRuntimeOptions,
        {
          name: "--color",
          description: "Color settings for the output",
          args: {
            name: "color",
            default: "auto",
            suggestions: ["always", "never", "auto"],
          },
        },
        versionOption,
      ],
    },
    {
      name: "review",
      description: "Run a code review non-interactively",
      args: {
        name: "prompt",
        description: "Custom review instructions",
        isOptional: true,
      },
      options: [strictConfigOption, ...reviewSelectionOptions],
    },
    {
      name: "login",
      description: "Manage login",
      subcommands: [{ name: "status", description: "Show login status" }],
      options: [
        {
          name: "--with-api-key",
          description: "Read the API key from stdin",
        },
        {
          name: "--with-access-token",
          description: "Read the access token from stdin",
        },
        {
          name: "--device-auth",
          description: "Log in with the device authorization flow",
        },
      ],
    },
    {
      name: "logout",
      description: "Remove stored authentication credentials",
    },
    {
      name: "mcp",
      description: "Manage external MCP servers for Codex",
      subcommands: [
        {
          name: "list",
          description: "List configured MCP servers",
          options: [
            {
              name: "--json",
              description: "Output the configured servers as JSON",
            },
          ],
        },
        {
          name: "get",
          description: "Show the configuration of one MCP server",
          args: { name: "name", description: "Name of the MCP server" },
          options: [
            {
              name: "--json",
              description: "Output the server configuration as JSON",
            },
          ],
        },
        {
          name: "add",
          description: "Add an MCP server configuration",
          args: [
            { name: "name", description: "Name for the MCP server" },
            {
              name: "command",
              description: "Command to launch the MCP server",
              isVariadic: true,
              isOptional: true,
              isCommand: true,
            },
          ],
          options: [
            {
              name: "--env",
              description: "Environment variable to set for a stdio server",
              isRepeatable: true,
              args: { name: "key=value" },
            },
            {
              name: "--url",
              description: "URL for a streamable HTTP MCP server",
              args: { name: "url" },
            },
            {
              name: "--bearer-token-env-var",
              description: "Environment variable to read a bearer token from",
              args: { name: "env_var" },
            },
            {
              name: "--oauth-client-id",
              description: "OAuth client identifier for this MCP server",
              args: { name: "client_id" },
            },
            {
              name: "--oauth-resource",
              description: "OAuth resource parameter to include during login",
              args: { name: "resource" },
            },
          ],
        },
        {
          name: "remove",
          description: "Remove an MCP server configuration",
          args: { name: "name", description: "Name of the MCP server" },
        },
        {
          name: "login",
          description: "Authenticate with an MCP server over OAuth",
          args: { name: "name", description: "Name of the MCP server" },
          options: [
            {
              name: "--scopes",
              description: "Comma-separated list of OAuth scopes to request",
              args: { name: "scope,scope" },
            },
          ],
        },
        {
          name: "logout",
          description: "Deauthenticate an MCP server",
          args: { name: "name", description: "Name of the MCP server" },
        },
      ],
    },
    {
      name: "plugin",
      description: "Manage Codex plugins",
      subcommands: [
        {
          name: "add",
          description:
            "Install a plugin from a configured marketplace snapshot",
          args: {
            name: "plugin[@marketplace]",
            description: "Plugin selector to install",
          },
          options: [
            {
              name: ["-m", "--marketplace"],
              description: "Marketplace name to install from",
              args: { name: "marketplace" },
            },
            {
              name: "--json",
              description: "Output install result as JSON",
            },
          ],
        },
        {
          name: "list",
          description: "List plugins available from configured marketplaces",
          options: [
            {
              name: ["-m", "--marketplace"],
              description: "Only list plugins from this marketplace",
              args: { name: "marketplace" },
            },
            { name: "--json", description: "Output plugin list as JSON" },
            {
              name: "--available",
              description: "Include uninstalled marketplace plugins",
            },
          ],
        },
        {
          name: "marketplace",
          description: "Manage configured plugin marketplaces",
          subcommands: [
            {
              name: "add",
              description: "Add a local or Git marketplace source",
              args: {
                name: "source",
                description:
                  "Local path, owner/repo[@ref], HTTPS Git URL, or SSH Git URL",
              },
              options: [
                {
                  name: "--ref",
                  description: "Git ref to fetch for Git marketplace sources",
                  args: { name: "ref" },
                },
                {
                  name: "--sparse",
                  description:
                    "Sparse checkout path for Git marketplace sources",
                  isRepeatable: true,
                  args: { name: "path" },
                },
                { name: "--json", description: "Output add result as JSON" },
              ],
            },
            {
              name: "list",
              description:
                "List configured plugin marketplaces and their roots",
              options: [
                {
                  name: "--json",
                  description: "Output marketplace list as JSON",
                },
              ],
            },
            {
              name: "upgrade",
              description: "Refresh configured Git marketplace snapshots",
              args: {
                name: "marketplace_name",
                description: "Marketplace to upgrade, or omit to upgrade all",
                isOptional: true,
              },
              options: [
                {
                  name: "--json",
                  description: "Output upgrade result as JSON",
                },
              ],
            },
            {
              name: "remove",
              description: "Remove a configured marketplace source by name",
              args: {
                name: "marketplace_name",
                description: "Configured marketplace name to remove",
              },
              options: [
                { name: "--json", description: "Output remove result as JSON" },
              ],
            },
          ],
        },
        {
          name: "remove",
          description: "Remove an installed plugin from local config and cache",
          args: {
            name: "plugin[@marketplace]",
            description: "Plugin selector to remove",
          },
          options: [
            {
              name: ["-m", "--marketplace"],
              description: "Marketplace name to remove the plugin from",
              args: { name: "marketplace" },
            },
            { name: "--json", description: "Output remove result as JSON" },
          ],
        },
      ],
    },
    {
      name: "mcp-server",
      description: "Start Codex as an MCP server over stdio",
      options: [strictConfigOption],
    },
    {
      name: "app-server",
      description: "Run the app server or related tooling",
      subcommands: [
        {
          name: "daemon",
          description: "Manage the local app-server daemon",
          subcommands: [
            {
              name: "bootstrap",
              description:
                "Install durable local app-server management for SSH-driven use",
              options: [
                {
                  name: "--remote-control",
                  description:
                    "Launch the managed app-server with remote control enabled",
                },
              ],
            },
            {
              name: "start",
              description: "Start the local app server daemon",
            },
            {
              name: "restart",
              description: "Restart the local app server daemon",
            },
            {
              name: "enable-remote-control",
              description: "Enable remote control for the managed daemon",
            },
            {
              name: "disable-remote-control",
              description: "Disable remote control for the managed daemon",
            },
            { name: "stop", description: "Stop the local app server daemon" },
            {
              name: "version",
              description:
                "Print local CLI and running app-server versions as JSON",
            },
          ],
        },
        {
          name: "proxy",
          description:
            "Proxy stdio bytes to the running app-server control socket",
          options: [
            {
              name: "--sock",
              description: "Path to the app-server Unix domain socket",
              args: { name: "socket_path", template: "filepaths" },
            },
          ],
        },
        {
          name: "generate-ts",
          description:
            "Generate TypeScript bindings for the app server protocol",
          options: [
            {
              name: ["-o", "--out"],
              description: "Output directory for the generated .ts files",
              isRequired: true,
              args: { name: "dir", template: "folders" },
            },
            {
              name: ["-p", "--prettier"],
              description: "Prettier executable used to format generated files",
              args: { name: "prettier_bin", template: "filepaths" },
            },
            {
              name: "--experimental",
              description: "Include experimental methods and fields",
            },
          ],
        },
        {
          name: "generate-json-schema",
          description: "Generate JSON Schema for the app server protocol",
          options: [
            {
              name: ["-o", "--out"],
              description: "Output directory for the schema bundle",
              isRequired: true,
              args: { name: "dir", template: "folders" },
            },
            {
              name: "--experimental",
              description: "Include experimental methods and fields",
            },
          ],
        },
      ],
      options: [
        {
          name: "--code-mode-host",
          description:
            "Connect to a remote code-mode host instead of starting a local host",
          args: { name: "ws_url" },
        },
        strictConfigOption,
        {
          name: "--listen",
          description: "Transport endpoint URL",
          args: {
            name: "url",
            default: "stdio://",
            suggestions: ["stdio://", "unix://", "ws://"],
          },
        },
        {
          name: "--stdio",
          description: "Use stdio as the transport",
        },
        {
          name: "--analytics-default-enabled",
          description: "Enable analytics by default for this app server",
        },
        {
          name: "--ws-auth",
          description: "Websocket auth mode for non-loopback listeners",
          args: {
            name: "mode",
            suggestions: ["capability-token", "signed-bearer-token"],
          },
        },
        {
          name: "--ws-token-file",
          description: "Absolute path to the capability-token file",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--ws-token-sha256",
          description: "Hex-encoded SHA-256 digest of the capability token",
          args: { name: "hex" },
        },
        {
          name: "--ws-shared-secret-file",
          description:
            "Absolute path to the shared secret file for signed JWT bearer tokens",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--ws-issuer",
          description: "Expected issuer for signed JWT bearer tokens",
          args: { name: "issuer" },
        },
        {
          name: "--ws-audience",
          description: "Expected audience for signed JWT bearer tokens",
          args: { name: "audience" },
        },
        {
          name: "--ws-max-clock-skew-seconds",
          description:
            "Maximum clock skew when validating signed JWT bearer tokens",
          args: { name: "seconds" },
        },
      ],
    },
    {
      name: "remote-control",
      description: "Manage the app-server daemon with remote control enabled",
      subcommands: [
        {
          name: "start",
          description:
            "Start the app-server daemon with remote control enabled",
          options: [remoteControlJsonOption],
        },
        {
          name: "stop",
          description: "Stop the app-server daemon",
          options: [remoteControlJsonOption],
        },
        {
          name: "pair",
          description: "Create and print a short-lived manual pairing code",
          options: [remoteControlJsonOption],
        },
      ],
      options: [remoteControlJsonOption],
    },
    {
      name: "app",
      description: "Launch the Desktop app",
      args: {
        name: "path",
        description: "Workspace path to open in the Desktop app",
        isOptional: true,
        default: ".",
        template: "folders",
      },
      options: [
        {
          name: "--download-url",
          description: "Override the app installer download URL",
          args: { name: "download_url_override" },
        },
      ],
    },
    {
      name: "completion",
      description: "Generate shell completion scripts",
      args: {
        name: "shell",
        description: "Shell to generate completions for",
        isOptional: true,
        default: "bash",
        suggestions: ["bash", "elvish", "fish", "powershell", "zsh"],
      },
    },
    {
      name: "update",
      description: "Update Codex to the latest version",
    },
    {
      name: "doctor",
      description:
        "Diagnose local Codex installation, config, auth, and runtime health",
      options: [
        {
          name: "--json",
          description: "Emit a redacted machine-readable report",
        },
        {
          name: "--summary",
          description:
            "Only show grouped check rows and the final count summary",
        },
        {
          name: "--all",
          description: "Expand long lists in detailed human output",
        },
        {
          name: "--no-color",
          description: "Disable ANSI color in human output",
        },
        {
          name: "--ascii",
          description: "Use ASCII status labels and separators",
        },
      ],
    },
    {
      name: "sandbox",
      description: "Run a command within a Codex-provided sandbox",
      args: {
        name: "command",
        description: "Full command to run under the sandbox",
        isVariadic: true,
        isOptional: true,
        isCommand: true,
      },
      options: [
        {
          name: "--sandbox-state-json",
          description: "JSON value from `codex/sandbox-state-meta` to apply",
          args: { name: "json" },
        },
        {
          name: "--sandbox-state-readable-root",
          description: "Add a readable root to the supplied sandbox state",
          isRepeatable: true,
          args: { name: "root", template: "folders" },
        },
        {
          name: "--sandbox-state-disable-network",
          description: "Disable direct network access in the sandbox state",
        },
        {
          name: ["-P", "--permission-profile"],
          description: "Named permissions profile from the configuration stack",
          args: { name: "name" },
        },
        profileOption,
        {
          name: ["-C", "--cd"],
          description:
            "Working directory used for profile resolution and execution",
          args: { name: "dir", template: "folders" },
        },
        {
          name: "--include-managed-config",
          description:
            "Include managed requirements while resolving a permissions profile",
        },
        {
          name: "--allow-unix-socket",
          description:
            "Allow the command to use AF_UNIX sockets under this path",
          isRepeatable: true,
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--log-denials",
          description: "Capture and print macOS sandbox denials after exit",
        },
      ],
    },
    {
      name: "debug",
      description: "Debugging tools",
      subcommands: [
        {
          name: "models",
          description: "Render the raw model catalog as JSON",
          options: [
            {
              name: "--bundled",
              description: "Dump only the bundled catalog shipped with Codex",
            },
          ],
        },
        {
          name: "app-server",
          description: "Tooling that helps debug the app server",
          subcommands: [
            {
              name: "send-message-v2",
              description: "Send a user message to the running app server",
              args: { name: "user_message" },
            },
          ],
        },
        {
          name: "prompt-input",
          description: "Render the model-visible prompt input list as JSON",
          args: {
            name: "prompt",
            description: "Prompt to append after session context",
            isOptional: true,
          },
          options: [imageOption],
        },
      ],
    },
    {
      name: ["apply", "a"],
      description: "Apply the latest diff produced by Codex with `git apply`",
      args: { name: "task_id", description: "Task whose diff to apply" },
    },
    {
      name: "resume",
      description: "Resume a previous interactive session",
      args: [
        {
          name: "session_id",
          description: "Session id (UUID) or session name",
          isOptional: true,
        },
        promptArg,
      ],
      options: [
        lastOption,
        allSessionsOption,
        {
          name: "--include-non-interactive",
          description: "Include non-interactive sessions in the picker",
        },
        ...interactiveOptions,
        versionOption,
      ],
    },
    {
      name: "archive",
      description: "Archive a saved session by id or session name",
      args: sessionArg,
      options: sessionOptions,
    },
    {
      name: "delete",
      description: "Permanently delete a saved session by id or session name",
      args: sessionArg,
      options: [
        ...sessionOptions,
        {
          name: "--force",
          description: "Delete without prompting, requires a UUID",
        },
      ],
    },
    {
      name: "unarchive",
      description: "Unarchive a saved session by id or session name",
      args: sessionArg,
      options: sessionOptions,
    },
    {
      name: "fork",
      description: "Fork a previous interactive session",
      args: [
        {
          name: "session_id",
          description: "Session id (UUID) of the session to fork",
          isOptional: true,
        },
        promptArg,
      ],
      options: [
        lastOption,
        allSessionsOption,
        ...interactiveOptions,
        versionOption,
      ],
    },
    {
      name: "cloud",
      description: "Browse tasks from Codex Cloud and apply changes locally",
      subcommands: [
        {
          name: "exec",
          description:
            "Submit a new Codex Cloud task without launching the TUI",
          args: {
            name: "query",
            description: "Task prompt to run in Codex Cloud",
            isOptional: true,
          },
          options: [
            {
              name: "--env",
              description: "Target environment identifier",
              isRequired: true,
              args: { name: "env_id" },
            },
            {
              name: "--attempts",
              description: "Number of assistant attempts (best-of-N)",
              args: { name: "attempts", default: "1" },
            },
            {
              name: "--branch",
              description: "Git branch to run in Codex Cloud",
              args: { name: "branch" },
            },
          ],
        },
        {
          name: "status",
          description: "Show the status of a Codex Cloud task",
          args: { name: "task_id", description: "Task to inspect" },
        },
        {
          name: "list",
          description: "List Codex Cloud tasks",
          options: [
            {
              name: "--env",
              description: "Filter tasks by environment identifier",
              args: { name: "env_id" },
            },
            {
              name: "--limit",
              description: "Maximum number of tasks to return (1-20)",
              args: { name: "n", default: "20" },
            },
            {
              name: "--cursor",
              description: "Pagination cursor returned by a previous call",
              args: { name: "cursor" },
            },
            {
              name: "--json",
              description: "Emit JSON instead of plain text",
            },
          ],
        },
        {
          name: "apply",
          description: "Apply the diff for a Codex Cloud task locally",
          args: { name: "task_id", description: "Task whose diff to apply" },
          options: [
            {
              name: "--attempt",
              description: "Attempt number to apply (1-based)",
              args: { name: "n" },
            },
          ],
        },
        {
          name: "diff",
          description: "Show the unified diff for a Codex Cloud task",
          args: { name: "task_id", description: "Task whose diff to display" },
          options: [
            {
              name: "--attempt",
              description: "Attempt number to display (1-based)",
              args: { name: "n" },
            },
          ],
        },
      ],
      options: [versionOption],
    },
    {
      name: "exec-server",
      description: "Run the standalone exec-server service",
      options: [
        strictConfigOption,
        {
          name: "--concurrent-requests",
          description:
            "Maximum number of requests to process concurrently per connection",
          args: { name: "count", default: "1" },
        },
        {
          name: "--listen",
          description: "Transport endpoint URL",
          args: {
            name: "url",
            suggestions: ["ws://", "stdio", "stdio://"],
          },
        },
        {
          name: "--remote",
          description:
            "Register this exec-server as a remote environment at this base URL",
          args: { name: "url" },
        },
        {
          name: "--environment-id",
          description: "Environment id to attach to when registering remotely",
          args: { name: "id" },
        },
        {
          name: "--name",
          description: "Human-readable environment name",
          args: { name: "name" },
        },
        {
          name: "--use-agent-identity-auth",
          description:
            "Use Agent Identity auth from CODEX_ACCESS_TOKEN for remote registration",
        },
        {
          name: "--exit-on-stdin-close",
          description: "Exit when the parent-owned stdin pipe closes",
        },
      ],
    },
    {
      name: "features",
      description: "Inspect feature flags",
      subcommands: [
        {
          name: "list",
          description:
            "List known features with their stage and effective state",
        },
        {
          name: "enable",
          description: "Enable a feature in config.toml",
          args: { name: "feature", description: "Feature key to update" },
        },
        {
          name: "disable",
          description: "Disable a feature in config.toml",
          args: { name: "feature", description: "Feature key to update" },
        },
      ],
    },
  ],
  options: [
    configOverrideOption,
    enableFeatureOption,
    disableFeatureOption,
    helpOption,
    ...interactiveOptions,
    versionOption,
  ],
};

export default completionSpec;
