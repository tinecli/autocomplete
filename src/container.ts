const icon = "fig://icon?type=docker";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const jsonEntries = (out: string): unknown[] => {
  try {
    const parsed: unknown = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readString = (source: unknown, ...path: string[]): string | undefined => {
  const value = path.reduce<unknown>(
    (node, key) => (isRecord(node) ? node[key] : undefined),
    source
  );
  return typeof value === "string" ? value : undefined;
};

const describe = (...parts: (string | undefined)[]): string | undefined =>
  parts.filter((part): part is string => Boolean(part)).join(" · ") ||
  undefined;

const splitReference = (reference: string) => {
  const separator = reference.lastIndexOf(":");
  if (separator < 0 || reference.includes("/", separator)) {
    return { repository: reference, tag: undefined };
  }
  return {
    repository: reference.slice(0, separator),
    tag: reference.slice(separator + 1),
  };
};

const lineSuggestions = (out: string): Fig.Suggestion[] =>
  out
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((name) => ({ name, icon }));

const containerSuggestions = (out: string): Fig.Suggestion[] =>
  jsonEntries(out).flatMap((entry) => {
    const name = readString(entry, "id");
    if (!name) {
      return [];
    }
    return [
      {
        name,
        description: describe(
          readString(entry, "status", "state"),
          readString(entry, "configuration", "image", "reference")
        ),
        icon,
      },
    ];
  });

const containerGenerators: Record<string, Fig.Generator> = {
  runningContainers: {
    script: ["container", "list", "--format", "json"],
    cache: { ttl: 5000, cacheKey: "container-running-containers" },
    postProcess: containerSuggestions,
  },
  allContainers: {
    script: ["container", "list", "--all", "--format", "json"],
    cache: { ttl: 5000, cacheKey: "container-all-containers" },
    postProcess: containerSuggestions,
  },
  images: {
    script: ["container", "image", "list", "--format", "json"],
    cache: { ttl: 30000, cacheKey: "container-images" },
    postProcess: (out) =>
      jsonEntries(out).flatMap((entry) => {
        const name = readString(entry, "configuration", "name");
        if (!name) {
          return [];
        }
        return [
          {
            name,
            description: describe(readString(entry, "id")?.slice(0, 12)),
            icon,
          },
        ];
      }),
  },
  imageRepositories: {
    script: ["container", "image", "list", "--format", "json"],
    cache: { ttl: 30000, cacheKey: "container-image-repositories" },
    postProcess: (out) => {
      const tagsByRepository = new Map<string, string[]>();
      for (const entry of jsonEntries(out)) {
        const reference = readString(entry, "configuration", "name");
        if (!reference) {
          continue;
        }
        const { repository, tag } = splitReference(reference);
        const tags = tagsByRepository.get(repository) ?? [];
        tagsByRepository.set(repository, tag ? [...tags, tag] : tags);
      }
      return [...tagsByRepository].map(([repository, tags]) => ({
        name: repository,
        description: describe(tags.join(", ")),
        icon,
      }));
    },
  },
  volumes: {
    script: ["container", "volume", "list", "--format", "json"],
    cache: { ttl: 30000, cacheKey: "container-volumes" },
    postProcess: (out) =>
      jsonEntries(out).flatMap((entry) => {
        const name = readString(entry, "id");
        if (!name) {
          return [];
        }
        return [
          {
            name,
            description: describe(
              readString(entry, "configuration", "driver"),
              readString(entry, "configuration", "format")
            ),
            icon,
          },
        ];
      }),
  },
  networks: {
    script: ["container", "network", "list", "--format", "json"],
    cache: { ttl: 30000, cacheKey: "container-networks" },
    postProcess: (out) =>
      jsonEntries(out).flatMap((entry) => {
        const name = readString(entry, "id");
        if (!name) {
          return [];
        }
        return [
          {
            name,
            description: describe(
              readString(entry, "configuration", "mode"),
              readString(entry, "status", "ipv4Subnet")
            ),
            icon,
          },
        ];
      }),
  },
  machines: {
    script: ["container", "machine", "list", "--format", "json"],
    cache: { ttl: 10000, cacheKey: "container-machines" },
    postProcess: (out) =>
      jsonEntries(out).flatMap((entry) => {
        const name = readString(entry, "id");
        if (!name) {
          return [];
        }
        return [
          {
            name,
            description: describe(
              readString(entry, "status"),
              readString(entry, "ipAddress")
            ),
            icon,
          },
        ];
      }),
  },
  registries: {
    script: ["container", "registry", "list", "--quiet"],
    cache: { ttl: 60000, cacheKey: "container-registries" },
    postProcess: lineSuggestions,
  },
  dnsDomains: {
    script: ["container", "system", "dns", "list", "--quiet"],
    cache: { ttl: 60000, cacheKey: "container-dns-domains" },
    postProcess: lineSuggestions,
  },
  k8sClusters: {
    script: ["container", "k8s", "list"],
    cache: { ttl: 10000, cacheKey: "container-k8s-clusters" },
    postProcess: (out) => {
      const names = new Set(
        out
          .split("\n")
          .slice(1)
          .map((line) => line.trim().split(/\s+/)[0])
          .filter((name) => name && name.length > 0)
      );
      return [...names].map((name) => ({ name, icon }));
    },
  },
};

const objectArg = (
  name: string,
  generators: Fig.Generator,
  overrides: Partial<Fig.Arg> = {}
): Fig.Arg => ({ name, generators, filterStrategy: "fuzzy", ...overrides });

const formatOption = (values: string[]): Fig.Option => ({
  name: "--format",
  description: "Format of the output",
  args: { name: "format", suggestions: values },
});

const listFormatOption = formatOption(["json", "table", "yaml", "toml"]);

const quietOption = (description: string): Fig.Option => ({
  name: ["-q", "--quiet"],
  description,
});

const progressOption = (values: string[]): Fig.Option => ({
  name: "--progress",
  description: "Progress type",
  args: { name: "type", suggestions: values, default: "auto" },
});

const schemeOption: Fig.Option = {
  name: "--scheme",
  description: "Scheme to use when connecting to the container registry",
  args: {
    name: "scheme",
    suggestions: ["http", "https", "auto"],
    default: "auto",
  },
};

const maxConcurrentDownloadsOption: Fig.Option = {
  name: "--max-concurrent-downloads",
  description: "Maximum number of concurrent downloads",
  args: { name: "max-concurrent-downloads", default: "3" },
};

const resourceOptions: Fig.Option[] = [
  {
    name: ["-c", "--cpus"],
    description: "Number of CPUs to allocate to the container",
    args: { name: "cpus" },
  },
  {
    name: ["-m", "--memory"],
    description:
      "Amount of memory (1MiByte granularity), with optional K, M, G, T, or P suffix",
    args: { name: "memory" },
  },
];

const dnsOptions: Fig.Option[] = [
  {
    name: "--dns",
    description: "DNS nameserver IP address",
    isRepeatable: true,
    args: { name: "ip" },
  },
  {
    name: "--dns-domain",
    description: "Default DNS domain",
    args: { name: "domain" },
  },
  {
    name: "--dns-option",
    description: "DNS options",
    isRepeatable: true,
    args: { name: "option" },
  },
  {
    name: "--dns-search",
    description: "DNS search domains",
    isRepeatable: true,
    args: { name: "domain" },
  },
];

const processOptions: Fig.Option[] = [
  {
    name: ["-e", "--env"],
    description:
      "Set environment variables (key=value, or just key to inherit from host)",
    isRepeatable: true,
    args: { name: "env" },
  },
  {
    name: "--env-file",
    description: "Read in a file of environment variables (key=value format)",
    isRepeatable: true,
    args: { name: "env-file", template: "filepaths" },
  },
  {
    name: "--gid",
    description: "Set the group ID for the process",
    args: { name: "gid" },
  },
  {
    name: ["-i", "--interactive"],
    description: "Keep the standard input open even if not attached",
  },
  { name: ["-t", "--tty"], description: "Open a TTY with the process" },
  {
    name: ["-u", "--user"],
    description: "Set the user for the process (format: name|uid[:gid])",
    args: { name: "user" },
  },
  {
    name: "--uid",
    description: "Set the user ID for the process",
    args: { name: "uid" },
  },
  {
    name: ["-w", "--workdir", "--cwd"],
    description: "Set the initial working directory inside the container",
    args: { name: "dir", template: "folders" },
  },
  {
    name: "--ulimit",
    description: "Set resource limits (format: <type>=<soft>[:<hard>])",
    isRepeatable: true,
    args: { name: "limit" },
  },
];

const imagePlatformOptions: Fig.Option[] = [
  {
    name: ["-a", "--arch"],
    description: "Set arch if image can target multiple architectures",
    args: { name: "arch", suggestions: ["arm64", "amd64"], default: "arm64" },
  },
  {
    name: "--os",
    description: "Set OS if image can target multiple operating systems",
    args: { name: "os", suggestions: ["linux"], default: "linux" },
  },
  {
    name: "--platform",
    description:
      "Platform for the image if it's multi-platform, taking precedence over --os and --arch",
    args: { name: "platform", suggestions: ["linux/arm64", "linux/amd64"] },
  },
];

const runCreateOptions: Fig.Option[] = [
  ...processOptions,
  ...resourceOptions,
  ...imagePlatformOptions,
  ...dnsOptions,
  {
    name: "--cap-add",
    description: "Add a Linux capability (e.g. CAP_NET_RAW, or ALL)",
    isRepeatable: true,
    args: { name: "cap" },
  },
  {
    name: "--cap-drop",
    description: "Drop a Linux capability (e.g. CAP_NET_RAW, or ALL)",
    isRepeatable: true,
    args: { name: "cap" },
  },
  {
    name: "--cidfile",
    description: "Write the container ID to the path provided",
    args: { name: "cidfile", template: "filepaths" },
  },
  {
    name: ["-d", "--detach"],
    description: "Run the container and detach from the process",
  },
  {
    name: "--entrypoint",
    description: "Override the entrypoint of the image",
    args: { name: "cmd" },
  },
  {
    name: "--init",
    description:
      "Run an init process inside the container that forwards signals and reaps processes",
  },
  {
    name: "--init-image",
    description: "Use a custom init image instead of the default",
    args: objectArg("image", containerGenerators.images),
  },
  {
    name: ["-k", "--kernel"],
    description: "Set a custom kernel path",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--kernel-arg",
    description: "Append a raw boot argument to the kernel command line",
    isRepeatable: true,
    args: { name: "arg" },
  },
  {
    name: ["-l", "--label"],
    description: "Add a key=value label to the container",
    isRepeatable: true,
    args: { name: "label" },
  },
  {
    name: "--masked-path",
    description: "[EXPERIMENTAL] Hide a path inside the container",
    isRepeatable: true,
    args: { name: "path" },
  },
  {
    name: "--mount",
    description:
      "Add a mount to the container (format: type=<>,source=<>,target=<>,readonly)",
    isRepeatable: true,
    args: { name: "mount" },
  },
  {
    name: "--name",
    description: "Use the specified name as the container ID",
    args: { name: "name" },
  },
  {
    name: "--network",
    description:
      "Attach the container to a network (format: <name>[,mac=XX:XX:XX:XX:XX:XX][,mtu=VALUE])",
    isRepeatable: true,
    args: objectArg("network", containerGenerators.networks),
  },
  { name: "--no-dns", description: "Do not configure DNS in the container" },
  {
    name: ["-p", "--publish"],
    description:
      "Publish a port from container to host (format: [host-ip:]host-port:container-port[/protocol])",
    isRepeatable: true,
    args: { name: "spec" },
  },
  {
    name: "--publish-socket",
    description:
      "Publish a socket from container to host (format: host_path:container_path)",
    isRepeatable: true,
    args: { name: "spec" },
  },
  {
    name: "--read-only",
    description: "Mount the container's root filesystem as read-only",
  },
  {
    name: "--read-only-path",
    description: "[EXPERIMENTAL] Mark a path inside the container read-only",
    isRepeatable: true,
    args: { name: "path" },
  },
  {
    name: ["--rm", "--remove"],
    description: "Remove the container after it stops",
  },
  { name: "--rosetta", description: "Enable Rosetta in the container" },
  {
    name: "--runtime",
    description: "Set the runtime handler for the container",
    args: { name: "runtime", default: "container-runtime-linux" },
  },
  { name: "--ssh", description: "Forward SSH agent socket to container" },
  {
    name: "--shm-size",
    description: "Size of /dev/shm (e.g. 64M, 1G)",
    args: { name: "shm-size" },
  },
  {
    name: "--tmpfs",
    description: "Add a tmpfs mount to the container at the given path",
    isRepeatable: true,
    args: { name: "tmpfs" },
  },
  {
    name: "--virtualization",
    description:
      "Expose virtualization capabilities to the container (requires host and guest support)",
  },
  {
    name: ["-v", "--volume"],
    description: "Bind mount a volume into the container",
    isRepeatable: true,
    args: objectArg("volume", containerGenerators.volumes),
  },
  schemeOption,
  maxConcurrentDownloadsOption,
];

const signalSuggestions = [
  "KILL",
  "TERM",
  "INT",
  "HUP",
  "QUIT",
  "USR1",
  "USR2",
  "STOP",
  "CONT",
];

const imageSubcommands: Fig.Subcommand[] = [
  {
    name: ["delete", "rm"],
    description: "Delete one or more images",
    args: objectArg("images", containerGenerators.images, {
      isVariadic: true,
      isOptional: true,
    }),
    options: [
      { name: ["-a", "--all"], description: "Delete all images" },
      {
        name: ["-f", "--force"],
        description: "Ignore errors for images that are not found",
      },
    ],
  },
  {
    name: "inspect",
    description: "Display information about one or more images",
    args: objectArg("images", containerGenerators.images, { isVariadic: true }),
  },
  {
    name: ["list", "ls"],
    description: "List images",
    options: [
      listFormatOption,
      quietOption("Only output the image name"),
      { name: ["-v", "--verbose"], description: "Verbose output" },
    ],
  },
  {
    name: "load",
    description: "Load images from an OCI compatible tar archive",
    options: [
      {
        name: ["-i", "--input"],
        description: "Path to the image tar archive",
        args: { name: "input", template: "filepaths" },
      },
      {
        name: ["-f", "--force"],
        description: "Load images even if the archive contains invalid files",
      },
    ],
  },
  {
    name: "prune",
    description: "Remove unused or all images",
    options: [
      {
        name: ["-a", "--all"],
        description: "Remove all unused images, not just dangling ones",
      },
    ],
  },
  {
    name: "pull",
    description: "Pull an image",
    args: { name: "reference" },
    options: [
      schemeOption,
      progressOption(["auto", "none", "ansi", "plain", "color"]),
      maxConcurrentDownloadsOption,
      {
        name: ["-a", "--arch"],
        description: "Limit the pull to the specified architecture",
        args: {
          name: "arch",
          suggestions: ["arm64", "amd64"],
        },
      },
      {
        name: "--os",
        description: "Limit the pull to the specified OS",
        args: { name: "os", suggestions: ["linux"] },
      },
      {
        name: "--platform",
        description:
          "Limit the pull to the specified platform (format: os/arch[/variant])",
        args: { name: "platform", suggestions: ["linux/arm64", "linux/amd64"] },
      },
    ],
  },
  {
    name: "push",
    description: "Push an image",
    args: objectArg("reference", containerGenerators.images),
    options: [
      schemeOption,
      progressOption(["auto", "none", "ansi", "plain", "color"]),
      {
        name: ["-a", "--arch"],
        description: "Limit the push to the specified architecture",
        args: { name: "arch", suggestions: ["arm64", "amd64"] },
      },
      {
        name: "--os",
        description: "Limit the push to the specified OS",
        args: { name: "os", suggestions: ["linux"] },
      },
      {
        name: "--platform",
        description:
          "Limit the push to the specified platform (format: os/arch[/variant])",
        args: { name: "platform", suggestions: ["linux/arm64", "linux/amd64"] },
      },
    ],
  },
  {
    name: "save",
    description: "Save one or more images as an OCI compatible tar archive",
    args: objectArg("references", containerGenerators.images, {
      isVariadic: true,
    }),
    options: [
      {
        name: ["-a", "--arch"],
        description: "Architecture for the saved image",
        args: { name: "arch", suggestions: ["arm64", "amd64"] },
      },
      {
        name: "--os",
        description: "OS for the saved image",
        args: { name: "os", suggestions: ["linux"] },
      },
      {
        name: ["-o", "--output"],
        description: "Pathname for the saved image",
        args: { name: "output", template: "filepaths" },
      },
      {
        name: "--platform",
        description: "Platform for the saved image (format: os/arch[/variant])",
        args: { name: "platform", suggestions: ["linux/arm64", "linux/amd64"] },
      },
    ],
  },
  {
    name: "tag",
    description: "Create a new reference for an existing image",
    args: [
      objectArg("source", containerGenerators.images, {
        description: "The existing image reference (format: image-name[:tag])",
      }),
      objectArg("target", containerGenerators.imageRepositories, {
        description: "The new image reference",
      }),
    ],
  },
];

const registrySubcommands: Fig.Subcommand[] = [
  {
    name: "login",
    description: "Log in to a registry",
    args: objectArg("server", containerGenerators.registries, {
      description: "Registry server name",
    }),
    options: [
      schemeOption,
      { name: "--password-stdin", description: "Take the password from stdin" },
      {
        name: ["-u", "--username"],
        description: "Registry user name",
        args: { name: "username" },
      },
    ],
  },
  {
    name: "logout",
    description: "Log out from a registry",
    args: objectArg("registry", containerGenerators.registries, {
      description: "Registry server name",
    }),
  },
  {
    name: ["list", "ls"],
    description: "List image registry logins",
    options: [
      listFormatOption,
      quietOption("Only output the registry hostname"),
    ],
  },
];

const machineNameOption: Fig.Option = {
  name: ["-n", "--name"],
  description: "Container machine ID (uses default if not specified)",
  args: objectArg("name", containerGenerators.machines),
};

const machineSubcommands: Fig.Subcommand[] = [
  {
    name: "create",
    description: "Create a new container machine and boot it",
    args: objectArg("image", containerGenerators.images, {
      description: "Container image reference (e.g., alpine:3.22)",
    }),
    options: [
      ...imagePlatformOptions,
      schemeOption,
      progressOption(["auto", "none", "ansi", "plain", "color"]),
      maxConcurrentDownloadsOption,
      {
        name: ["-n", "--name"],
        description: "Name for the container machine",
        args: { name: "name" },
      },
      {
        name: "--set-default",
        description: "Set this container machine as the default",
      },
      {
        name: "--no-boot",
        description: "Create the container machine without booting it",
      },
      {
        name: "--cpus",
        description: "Number of virtual CPUs",
        args: { name: "cpus" },
      },
      {
        name: "--memory",
        description: "Memory allocation (e.g., 2G, 8G)",
        args: { name: "memory" },
      },
      {
        name: "--home-mount",
        description: "User's home directory mount option",
        args: {
          name: "home-mount",
          suggestions: ["ro", "rw", "none"],
          default: "rw",
        },
      },
      {
        name: "--virtualization",
        description: "Enable nested virtualization",
      },
      {
        name: "--kernel",
        description: "Path to a custom kernel binary (e.g. vmlinux)",
        args: { name: "kernel", template: "filepaths" },
      },
    ],
  },
  {
    name: ["delete", "rm"],
    description: "Delete a container machine",
    args: objectArg("id", containerGenerators.machines, {
      description: "Container machine ID",
    }),
  },
  {
    name: "inspect",
    description: "Display detailed information about a container machine",
    args: objectArg("id", containerGenerators.machines, {
      description: "Container machine ID (uses default if not specified)",
      isOptional: true,
    }),
  },
  {
    name: ["list", "ls"],
    description: "List container machines",
    options: [
      formatOption(["json", "table"]),
      quietOption("Only output the container machine ID"),
    ],
  },
  {
    name: "logs",
    description: "Fetch container machine logs",
    args: objectArg("id", containerGenerators.machines, {
      description: "Machine VM ID (uses default if not specified)",
      isOptional: true,
    }),
    options: [
      {
        name: "--boot",
        description:
          "Display the boot log for the container machine instead of stdio",
      },
      { name: ["-f", "--follow"], description: "Follow log output" },
      {
        name: "-n",
        description: "Number of lines to show from the end of the logs",
        args: { name: "n" },
      },
    ],
  },
  {
    name: "run",
    description: "Run a command or interactive shell in a container machine",
    args: [
      {
        name: "executable",
        description: "Command to run (default: login shell)",
        isOptional: true,
        isCommand: true,
      },
    ],
    options: [
      ...processOptions,
      machineNameOption,
      {
        name: ["-d", "--detach"],
        description: "Run a process in a container machine and detach from it",
      },
      {
        name: "--root",
        description: "Run as root instead of matching host user",
      },
    ],
  },
  {
    name: "set",
    description: "Set container machine configuration values",
    args: {
      name: "setting",
      isVariadic: true,
      isOptional: true,
      suggestions: [
        { name: "cpus=", description: "Number of virtual CPUs" },
        { name: "memory=", description: "Memory allocation (e.g., 2G, 1G)" },
        {
          name: "home-mount=",
          description: "User home directory mount option (ro, rw, none)",
        },
        {
          name: "virtualization=",
          description: "Enable nested virtualization (true|false)",
        },
        { name: "kernel=", description: "Path to a custom kernel binary" },
      ],
    },
    options: [machineNameOption],
  },
  {
    name: "set-default",
    description: "Set the default container machine",
    args: objectArg("id", containerGenerators.machines, {
      description: "Container machine ID",
    }),
  },
  {
    name: "stop",
    description: "Stop a running container machine",
    args: objectArg("id", containerGenerators.machines, {
      description: "Container machine ID (uses default if not specified)",
      isOptional: true,
    }),
  },
];

const volumeSubcommands: Fig.Subcommand[] = [
  {
    name: "create",
    description: "Create a new volume",
    args: { name: "name", description: "Volume name" },
    options: [
      {
        name: "--label",
        description: "Set metadata for a volume",
        isRepeatable: true,
        args: { name: "label" },
      },
      {
        name: "--opt",
        description: "Set driver specific options",
        isRepeatable: true,
        args: { name: "opt" },
      },
      {
        name: "-s",
        description:
          "Size of the volume in bytes, with optional K, M, G, T, or P suffix",
        args: { name: "s" },
      },
    ],
  },
  {
    name: ["delete", "rm"],
    description: "Delete one or more volumes",
    args: objectArg("names", containerGenerators.volumes, {
      description: "Volume names",
      isVariadic: true,
      isOptional: true,
    }),
    options: [{ name: ["-a", "--all"], description: "Delete all volumes" }],
  },
  {
    name: ["list", "ls"],
    description: "List volumes",
    options: [listFormatOption, quietOption("Only output the volume name")],
  },
  {
    name: "inspect",
    description: "Display information about one or more volumes",
    args: objectArg("names", containerGenerators.volumes, {
      description: "Volumes to inspect",
      isVariadic: true,
    }),
  },
  {
    name: "prune",
    description: "Remove volumes with no container references",
  },
];

const networkSubcommands: Fig.Subcommand[] = [
  {
    name: "create",
    description: "Create a new network",
    args: { name: "name", description: "Network name" },
    options: [
      { name: "--internal", description: "Restrict to host-only network" },
      {
        name: "--label",
        description: "Set metadata for a network",
        isRepeatable: true,
        args: { name: "label" },
      },
      {
        name: "--option",
        description: "Set a plugin-specific option (key=value)",
        isRepeatable: true,
        args: { name: "option" },
      },
      {
        name: "--plugin",
        description: "Set the plugin to use to create this network",
        args: { name: "plugin", default: "container-network-vmnet" },
      },
      {
        name: "--subnet",
        description: "Set subnet for a network",
        args: { name: "subnet" },
      },
      {
        name: "--subnet-v6",
        description: "Set the IPv6 prefix for a network",
        args: { name: "subnet-v6" },
      },
    ],
  },
  {
    name: ["delete", "rm"],
    description: "Delete one or more networks",
    args: objectArg("network-names", containerGenerators.networks, {
      description: "Network names",
      isVariadic: true,
      isOptional: true,
    }),
    options: [{ name: ["-a", "--all"], description: "Delete all networks" }],
  },
  {
    name: ["list", "ls"],
    description: "List networks",
    options: [listFormatOption, quietOption("Only output the network name")],
  },
  {
    name: "inspect",
    description: "Display information about one or more networks",
    args: objectArg("networks", containerGenerators.networks, {
      description: "Networks to inspect",
      isVariadic: true,
    }),
  },
  {
    name: "prune",
    description: "Remove networks with no container connections",
  },
];

const builderSubcommands: Fig.Subcommand[] = [
  {
    name: "start",
    description: "Start the builder container",
    options: [...resourceOptions, ...dnsOptions],
  },
  {
    name: "status",
    description: "Display the builder container status",
    options: [listFormatOption, quietOption("Only output the container ID")],
  },
  { name: "stop", description: "Stop the builder container" },
  {
    name: ["delete", "rm"],
    description: "Delete the builder container",
    options: [
      {
        name: ["-f", "--force"],
        description: "Delete the builder even if it is running",
      },
    ],
  },
];

const systemPrefixOption: Fig.Option = {
  name: ["-p", "--prefix"],
  description: "Launchd prefix for services",
  args: { name: "prefix", default: "com.apple.container." },
};

const systemSubcommands: Fig.Subcommand[] = [
  {
    name: "df",
    description: "Show disk usage for images, containers, and volumes",
    options: [listFormatOption],
  },
  {
    name: "dns",
    description: "Manage local DNS domains",
    subcommands: [
      {
        name: "create",
        description: "Create a local DNS domain for containers",
        args: { name: "domain-name", description: "The local domain name" },
        options: [
          {
            name: "--localhost",
            description: "Set the ip address to be redirected to localhost",
            args: { name: "localhost" },
          },
        ],
      },
      {
        name: ["delete", "rm"],
        description: "Delete a local DNS domain",
        args: objectArg("domain-name", containerGenerators.dnsDomains, {
          description: "The local domain name",
        }),
      },
      {
        name: ["list", "ls"],
        description: "List local DNS domains",
        options: [listFormatOption, quietOption("Only output the domain")],
      },
    ],
  },
  {
    name: "kernel",
    description: "Manage the default kernel configuration",
    subcommands: [
      {
        name: "set",
        description: "Set the default kernel",
        options: [
          {
            name: "--arch",
            description: "The architecture of the kernel binary",
            args: {
              name: "arch",
              suggestions: ["amd64", "arm64"],
              default: "arm64",
            },
          },
          {
            name: "--binary",
            description:
              "Path to the kernel file (or archive member, if used with --tar)",
            args: { name: "binary", template: "filepaths" },
          },
          {
            name: "--force",
            description: "Overwrites an existing kernel with the same name",
          },
          {
            name: "--recommended",
            description:
              "Download and install the recommended kernel as the default",
          },
          {
            name: "--tar",
            description:
              "Filesystem path or remote URL to a tar archive containing a kernel file",
            args: { name: "tar", template: "filepaths" },
          },
          {
            name: "--digest",
            description:
              "Expected digest for the tar archive, for example sha256:<hex>",
            args: { name: "digest" },
          },
        ],
      },
    ],
  },
  {
    name: "logs",
    description: "Fetch system logs for `container` services",
    options: [
      { name: ["-f", "--follow"], description: "Follow log output" },
      {
        name: "--last",
        description:
          "Fetch logs starting from the specified time period; supported formats: <number>[m|h|d]",
        args: { name: "last", default: "5m" },
      },
    ],
  },
  {
    name: "property",
    description: "Manage system property values",
    subcommands: [
      {
        name: ["list", "ls"],
        description: "List system properties",
        options: [
          {
            name: "--format",
            description: "Format of the output",
            args: { name: "format", default: "toml" },
          },
        ],
      },
    ],
  },
  {
    name: "start",
    description: "Start `container` services",
    options: [
      {
        name: ["-a", "--app-root"],
        description: "Path to the root directory for application data",
        args: { name: "app-root", template: "folders" },
      },
      {
        name: "--install-root",
        description:
          "Path to the root directory for application executables and plugins",
        args: { name: "install-root", template: "folders" },
      },
      {
        name: "--log-root",
        description: "Path to the root directory for log data",
        args: { name: "log-root", template: "folders" },
      },
      {
        name: "--enable-kernel-install",
        description: "Install the default kernel",
        exclusiveOn: ["--disable-kernel-install"],
      },
      {
        name: "--disable-kernel-install",
        description: "Do not install the default kernel",
        exclusiveOn: ["--enable-kernel-install"],
      },
      {
        name: "--timeout",
        description:
          "Number of seconds to wait for API service to become responsive",
        args: { name: "timeout" },
      },
    ],
  },
  {
    name: "status",
    description: "Show the status of `container` services",
    options: [systemPrefixOption, listFormatOption],
  },
  {
    name: "stop",
    description: "Stop all `container` services",
    options: [systemPrefixOption],
  },
  {
    name: "version",
    description: "Show version information",
    options: [listFormatOption],
  },
];

const k8sClusterNameOption: Fig.Option = {
  name: "--name",
  description: "Cluster name",
  args: objectArg("name", containerGenerators.k8sClusters, {
    default: "k8s-dev",
  }),
};

const k8sSubcommands: Fig.Subcommand[] = [
  {
    name: "create",
    description: "Create and start a local Kubernetes cluster",
    options: [
      ...resourceOptions,
      schemeOption,
      maxConcurrentDownloadsOption,
      {
        name: "--name",
        description: "Cluster name",
        args: { name: "name", default: "k8s-dev" },
      },
      {
        name: ["--rm", "--remove"],
        description: "Remove the cluster container after it stops",
      },
      {
        name: "--node-image",
        description: "Node image reference",
        args: objectArg("node-image", containerGenerators.images),
      },
    ],
  },
  {
    name: ["delete", "rm"],
    description: "Delete a Kubernetes cluster",
    options: [k8sClusterNameOption],
  },
  { name: ["list", "ls"], description: "List clusters and their nodes" },
  {
    name: "load-image",
    description: "Load a container image into a cluster's containerd",
    args: objectArg("image", containerGenerators.images, {
      description: "Image reference to load (e.g. demo-api:latest)",
    }),
    options: [
      k8sClusterNameOption,
      {
        name: "--platform",
        description:
          "Platform of the image to load (format: os/arch[/variant])",
        args: {
          name: "platform",
          suggestions: ["linux/arm64", "linux/amd64"],
          default: "linux/arm64",
        },
      },
    ],
  },
  {
    name: "start",
    description: "Start a stopped Kubernetes cluster",
    options: [k8sClusterNameOption],
  },
  {
    name: "write-config",
    description: "Write the cluster context to a Kubernetes configuration file",
    options: [
      k8sClusterNameOption,
      {
        name: "--kubeconfig",
        description: "Path to the kubeconfig file to write or append to",
        args: {
          name: "kubeconfig",
          template: "filepaths",
          default: "~/.kube/config",
        },
      },
    ],
  },
];

const completionSpec: Fig.Spec = {
  name: "container",
  description: "A container platform for macOS",
  options: [
    {
      name: "--debug",
      description: "Enable debug output",
      isPersistent: true,
    },
    { name: "--version", description: "Show the version" },
    { name: ["-h", "--help"], description: "Show help information" },
  ],
  subcommands: [
    {
      name: ["copy", "cp"],
      description:
        "Copy files/folders between a container and the local filesystem",
      args: [
        objectArg("source", containerGenerators.allContainers, {
          description: "Source path (container:path or local path)",
          template: "filepaths",
        }),
        objectArg("destination", containerGenerators.allContainers, {
          description: "Destination path (container:path or local path)",
          template: "filepaths",
        }),
      ],
    },
    {
      name: "create",
      description: "Create a new container",
      args: [
        objectArg("image", containerGenerators.images, {
          description: "Image name",
        }),
        {
          name: "arguments",
          description: "Container init process arguments",
          isOptional: true,
          isCommand: true,
        },
      ],
      options: runCreateOptions,
    },
    {
      name: ["delete", "rm"],
      description: "Delete one or more containers",
      args: objectArg("container-ids", containerGenerators.allContainers, {
        description: "Container IDs",
        isVariadic: true,
        isOptional: true,
      }),
      options: [
        { name: ["-a", "--all"], description: "Delete all containers" },
        {
          name: ["-f", "--force"],
          description: "Delete containers even if they are running",
        },
      ],
    },
    {
      name: "exec",
      description: "Run a new command in a running container",
      args: [
        objectArg("container-id", containerGenerators.runningContainers, {
          description: "Container ID",
        }),
        { name: "command", isCommand: true },
      ],
      options: [
        ...processOptions,
        {
          name: ["-d", "--detach"],
          description: "Run the process and detach from it",
        },
      ],
    },
    {
      name: "export",
      description: "Export a container's filesystem as a tar archive",
      args: objectArg("id", containerGenerators.allContainers, {
        description: "Container ID",
      }),
      options: [
        {
          name: ["-o", "--output"],
          description:
            "Pathname for the saved container filesystem (defaults to stdout)",
          args: { name: "output", template: "filepaths" },
        },
      ],
    },
    {
      name: "inspect",
      description: "Display information about one or more containers",
      args: objectArg("container-ids", containerGenerators.allContainers, {
        description: "Container IDs to inspect",
        isVariadic: true,
      }),
    },
    {
      name: "kill",
      description: "Kill or signal one or more running containers",
      args: objectArg("container-ids", containerGenerators.runningContainers, {
        description: "Container IDs",
        isVariadic: true,
        isOptional: true,
      }),
      options: [
        {
          name: ["-a", "--all"],
          description: "Kill or signal all running containers",
        },
        {
          name: ["-s", "--signal"],
          description: "Signal to send to the container(s)",
          args: {
            name: "signal",
            suggestions: signalSuggestions,
            default: "KILL",
          },
        },
      ],
    },
    {
      name: ["list", "ls"],
      description: "List running containers",
      options: [
        {
          name: ["-a", "--all"],
          description: "Include containers that are not running",
        },
        listFormatOption,
        quietOption("Only output the container ID"),
      ],
    },
    {
      name: "logs",
      description: "Fetch container logs",
      args: objectArg("container-id", containerGenerators.runningContainers, {
        description: "Container ID",
      }),
      options: [
        {
          name: "--boot",
          description:
            "Display the boot log for the container instead of stdio",
        },
        { name: ["-f", "--follow"], description: "Follow log output" },
        {
          name: "-n",
          description: "Number of lines to show from the end of the logs",
          args: { name: "n" },
        },
      ],
    },
    {
      name: "run",
      description: "Run a container",
      args: [
        objectArg("image", containerGenerators.images, {
          description: "Image name",
        }),
        {
          name: "arguments",
          description: "Container init process arguments",
          isOptional: true,
          isCommand: true,
        },
      ],
      options: [
        ...runCreateOptions,
        progressOption(["auto", "none", "ansi", "plain", "color"]),
      ],
    },
    {
      name: "start",
      description: "Start a container",
      args: objectArg("container-id", containerGenerators.allContainers, {
        description: "Container ID",
      }),
      options: [
        { name: ["-a", "--attach"], description: "Attach stdout/stderr" },
        { name: ["-i", "--interactive"], description: "Attach stdin" },
      ],
    },
    {
      name: "stats",
      description: "Display resource usage statistics for containers",
      args: objectArg("containers", containerGenerators.runningContainers, {
        description: "Container ID or name",
        isVariadic: true,
        isOptional: true,
      }),
      options: [
        listFormatOption,
        {
          name: "--no-stream",
          description: "Disable streaming stats and only pull the first result",
        },
      ],
    },
    {
      name: "stop",
      description: "Stop one or more running containers",
      args: objectArg("container-ids", containerGenerators.runningContainers, {
        description: "Container IDs",
        isVariadic: true,
        isOptional: true,
      }),
      options: [
        { name: ["-a", "--all"], description: "Stop all running containers" },
        {
          name: ["-s", "--signal"],
          description: "Signal to send to the containers",
          args: { name: "signal", suggestions: signalSuggestions },
        },
        {
          name: ["-t", "--time"],
          description: "Seconds to wait before killing the containers",
          args: { name: "time", default: "5" },
        },
      ],
    },
    { name: "prune", description: "Remove all stopped containers" },
    {
      name: "build",
      description: "Build an image from a Dockerfile or Containerfile",
      args: {
        name: "context-dir",
        description: "Build directory",
        template: "folders",
        isOptional: true,
        default: ".",
      },
      options: [
        ...resourceOptions,
        ...dnsOptions,
        {
          name: ["-a", "--arch"],
          description: "Add the architecture type to the build",
          args: { name: "value", suggestions: ["arm64", "amd64"] },
        },
        {
          name: "--build-arg",
          description: "Set build-time variables",
          isRepeatable: true,
          args: { name: "key=val" },
        },
        {
          name: ["-f", "--file"],
          description: "Path to Dockerfile",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: ["-l", "--label"],
          description: "Set a label",
          isRepeatable: true,
          args: { name: "key=val" },
        },
        { name: "--no-cache", description: "Do not use cache" },
        {
          name: ["-o", "--output"],
          description:
            "Output configuration for the build (format: type=<oci|tar|local>[,dest=])",
          args: { name: "value", default: "type=oci" },
        },
        {
          name: "--os",
          description: "Add the OS type to the build",
          args: { name: "value", suggestions: ["linux"] },
        },
        {
          name: "--platform",
          description:
            "Add the platform to the build (format: os/arch[/variant])",
          args: {
            name: "platform",
            suggestions: ["linux/arm64", "linux/amd64"],
          },
        },
        progressOption(["auto", "plain", "tty"]),
        quietOption("Suppress build output"),
        {
          name: "--secret",
          description:
            "Set build-time secrets (format: id=<key>[,env=<ENV_VAR>|,src=<local/path>])",
          isRepeatable: true,
          args: { name: "id=key,..." },
        },
        {
          name: "--ssh",
          description: "Forward SSH agent authentication to the build",
          args: { name: "default", suggestions: ["default"] },
        },
        {
          name: ["-t", "--tag"],
          description: "Name for the built image",
          args: objectArg("name", containerGenerators.imageRepositories),
        },
        {
          name: "--target",
          description: "Set the target build stage",
          args: { name: "stage" },
        },
        {
          name: "--vsock-port",
          description: "Builder shim vsock port",
          args: { name: "port", default: "8088" },
        },
        { name: "--pull", description: "Pull latest image" },
      ],
    },
    {
      name: ["image", "i"],
      description: "Manage images",
      subcommands: imageSubcommands,
    },
    {
      name: ["registry", "r"],
      description: "Manage registry logins",
      subcommands: registrySubcommands,
    },
    {
      name: ["machine", "m"],
      description: "Manage container machines",
      subcommands: machineSubcommands,
    },
    {
      name: ["volume", "v"],
      description: "Manage container volumes",
      subcommands: volumeSubcommands,
    },
    {
      name: "builder",
      description: "Manage an image builder instance",
      subcommands: builderSubcommands,
    },
    {
      name: ["network", "n"],
      description: "Manage container networks",
      subcommands: networkSubcommands,
    },
    {
      name: ["system", "s"],
      description: "Manage system components",
      subcommands: systemSubcommands,
    },
    {
      name: "k8s",
      description: "Local Kubernetes development cluster management",
      subcommands: k8sSubcommands,
    },
  ],
};

export default completionSpec;
