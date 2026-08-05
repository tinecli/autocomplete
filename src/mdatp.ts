const enabledDisabled = ["enabled", "disabled"];
const enabledDisabledDefault = ["enabled", "disabled", "default"];

function toggleOption(suggestions: string[] = enabledDisabled): Fig.Option[] {
  return [
    { name: "--value", args: { name: "value", suggestions }, isRequired: true },
  ];
}

const pathArg = { name: "path", template: "filepaths" as const };
const nameArg = { name: "name" };
const idArg = {
  name: "id",
  description: "Threat identifier (see 'threat list')",
};

function exclusionGroup(kind: string, byNameOrPath: boolean): Fig.Subcommand {
  const identifyingOptions: Fig.Option[] = byNameOrPath
    ? [
        { name: "--path", args: pathArg },
        { name: "--name", args: nameArg },
      ]
    : [{ name: "--path", args: pathArg, isRequired: true }];

  return {
    name: kind,
    description: `Manage antivirus exclusions for a ${kind}`,
    subcommands: [
      {
        name: "add",
        description: `Add a ${kind} to the exclusions list`,
        options: identifyingOptions,
      },
      {
        name: "remove",
        description: `Remove a ${kind} from the exclusions list`,
        options: identifyingOptions,
      },
    ],
  };
}

function processExclusionGroup(
  name: string,
  description: string
): Fig.Subcommand {
  return {
    name,
    description,
    subcommands: [
      {
        name: "add",
        description: "Add a process to the exclusion list",
        options: [{ name: "--path", args: pathArg, isRequired: true }],
      },
      {
        name: "remove",
        description: "Remove a process from the exclusion list",
        options: [{ name: "--path", args: pathArg, isRequired: true }],
      },
      {
        name: "list",
        description: "List process exclusions",
      },
    ],
  };
}

function deviceListGroup(
  description: string,
  withPrint?: boolean
): Fig.Subcommand {
  return {
    name: "devices",
    description: "Devices options",
    subcommands: [
      { name: "list", description },
      ...(withPrint
        ? [
            {
              name: "print",
              description: "Get details for a specific device",
              options: [{ name: "--id", args: idArg, isRequired: true }],
            } as Fig.Subcommand,
          ]
        : []),
    ],
  };
}

const policyOptionsGroup: Fig.Subcommand = {
  name: "policy",
  description: "Policy options",
  subcommands: [
    {
      name: "groups",
      description: "Groups options",
      subcommands: [{ name: "list", description: "List all policy groups" }],
    },
    {
      name: "rules",
      description: "Rules options",
      subcommands: [{ name: "list", description: "List all policy rules" }],
    },
    {
      name: "preferences",
      description: "Preferences options",
      subcommands: [
        { name: "list", description: "List all policy preferences" },
      ],
    },
    {
      name: "validate",
      description: "Verify that a policy file has no errors",
      options: [
        {
          name: "--path",
          description: "Path to the policy JSON file",
          args: pathArg,
          isRequired: true,
        },
      ],
    },
  ],
};

const completionSpec: Fig.Spec = {
  name: "mdatp",
  description: "Microsoft Defender for Endpoint command line tool",
  subcommands: [
    {
      name: "health",
      description: "Display product health information",
      options: [
        {
          name: "--field",
          description: "Check a specific product health attribute",
          args: { name: "attribute" },
        },
        {
          name: "--details",
          description: "Show extended details for a health area",
          args: { name: "area", suggestions: ["tamper_protection"] },
        },
      ],
    },
    {
      name: "config",
      description: "Manage product configuration",
      subcommands: [
        {
          name: "real-time-protection",
          description: "Configure real-time protection",
          options: toggleOption(),
        },
        {
          name: "real-time-protection-statistics",
          description:
            "Configure real-time protection resource usage statistics",
          options: toggleOption(enabledDisabledDefault),
        },
        {
          name: "cloud",
          description: "Configure cloud-delivered protection",
          options: toggleOption(),
        },
        {
          name: "cloud-diagnostic",
          description: "Configure optional diagnostic data collection",
          options: toggleOption(),
        },
        {
          name: "cloud-pin-certificate-thumbs",
          description:
            "[PREVIEW] Configure whether to validate certificate thumbprints of cloud services",
          options: toggleOption(),
        },
        {
          name: "cloud-automatic-sample-submission",
          description: "Configure automatic sample submission",
          options: toggleOption(),
        },
        {
          name: "passive-mode",
          description: "Configure passive mode",
          options: toggleOption(),
        },
        {
          name: "behavior-monitoring",
          description: "Configure behavior monitoring protection",
          options: toggleOption(),
        },
        {
          name: "behavior-monitoring-statistics",
          description:
            "Configure behavior monitoring resource usage statistics",
          options: toggleOption(enabledDisabledDefault),
        },
        {
          name: "collect-scanned-files-per-process",
          description:
            "Configure stats collection on file paths operated by processes",
          options: toggleOption(enabledDisabledDefault),
        },
        {
          name: "antivirus-engine-pool-content-monitoring",
          description:
            "Configure monitoring of events provided to antivirus engine but yet to receive response",
          options: toggleOption(enabledDisabledDefault),
        },
        {
          name: "data-loss-prevention",
          description: "Configure Data Loss Prevention feature",
          options: toggleOption(enabledDisabledDefault),
        },
        {
          name: "automatic-definitions-update",
          description: "Configure automatic security intelligence updates",
          options: toggleOption(),
        },
        {
          name: "scan-after-definition-update",
          description:
            "Configure whether to start a process scan after security intelligence updates",
          options: toggleOption(),
        },
        {
          name: "scan-archives",
          description: "Configure whether to scan archives in on-demand scans",
          options: toggleOption(),
        },
        {
          name: "enable-file-hash-computation",
          description: "Configure file hash computation",
          options: toggleOption(),
        },
        {
          name: "maximum-on-demand-scan-threads",
          description:
            "Configure maximum number of threads used in on-demand scans",
          options: [
            {
              name: "--value",
              description: "Numerical value between 1 and 64",
              args: { name: "threads" },
              isRequired: true,
            },
          ],
        },
        {
          name: "proxy",
          description: "Manage proxy settings for mdatp",
          subcommands: [
            {
              name: "set",
              description: "Configure proxy for mdatp",
              options: [
                {
                  name: "--value",
                  description: "Accepted format: http://address:port",
                  args: { name: "url" },
                  isRequired: true,
                },
              ],
            },
            { name: "reset", description: "Reset proxy for mdatp" },
          ],
        },
        {
          name: "tamper-protection",
          description: "Configure Tamper Protection",
          subcommands: [
            {
              name: "enforcement-level",
              description: "Configure enforcement level for Tamper Protection",
              options: [
                {
                  name: "--value",
                  args: {
                    name: "level",
                    suggestions: ["disabled", "audit", "block"],
                  },
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          name: "network-protection",
          description: "Configure network protection",
          subcommands: [
            {
              name: "enforcement-level",
              description: "Configure enforcement level for network protection",
              options: [
                {
                  name: "--value",
                  args: {
                    name: "level",
                    suggestions: ["disabled", "audit", "block"],
                  },
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          name: "log-rotation-parameters",
          description: "Configure the size limit of product logs retained",
          subcommands: [
            {
              name: "max-current-size",
              description:
                "Set the maximum individual log file size in megabytes",
              options: [
                {
                  name: "--size",
                  args: { name: "megabytes" },
                  isRequired: true,
                },
              ],
            },
            {
              name: "max-rotated-size",
              description:
                "Set the maximum size of all rotated log files in megabytes",
              options: [
                {
                  name: "--size",
                  args: { name: "megabytes" },
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          name: "device-control",
          description: "Configure Device Control",
          subcommands: [{ name: "policy", description: "Configure policy" }],
        },
        {
          name: "scheduled-scan",
          description: "Configure scheduled scans",
          subcommands: [
            {
              name: "quick-scan",
              description: "Configure scheduled quick scans",
              subcommands: [
                {
                  name: "hourly-interval",
                  description:
                    "Configure hours elapsed between scheduled quick scans",
                  options: [
                    {
                      name: "--value",
                      description:
                        "Numerical value between 0 (never) and 24 (1 scan per day)",
                      args: { name: "hours" },
                      isRequired: true,
                    },
                  ],
                },
                {
                  name: "time-of-day",
                  description:
                    "Configure time of day for scheduled quick scans",
                  options: [
                    {
                      name: "--value",
                      description: "Minutes after midnight, between 0 and 1440",
                      args: { name: "minutes" },
                      isRequired: true,
                    },
                  ],
                },
              ],
            },
            {
              name: "weekly-scan",
              description: "Configure scheduled weekly scans",
              options: [
                {
                  name: "--day-of-week",
                  description:
                    "0-8: 0 is Never, 1 is Sunday, 2 is Monday, ... 8 is Everyday",
                  args: { name: "day" },
                },
                {
                  name: "--time-of-day",
                  description: "Minutes after midnight, between 0 and 1440",
                  args: { name: "minutes" },
                },
                {
                  name: "--scan-type",
                  args: { name: "type", suggestions: ["quick", "full"] },
                },
              ],
            },
            {
              name: "settings",
              description: "Configure scheduled scan settings",
              subcommands: [
                {
                  name: "feature",
                  description: "Turn on/off scheduled scan feature",
                  options: toggleOption(),
                },
                {
                  name: "check-for-definitions",
                  description:
                    "Check for definitions update before scheduled scan",
                  options: toggleOption(["true", "false"]),
                },
                {
                  name: "low-priority",
                  description: "Run scheduled scan with low priority",
                  options: toggleOption(["true", "false"]),
                },
                {
                  name: "scan-when-idle",
                  description: "Run scheduled scan when system is idle",
                  options: toggleOption(["true", "false"]),
                },
                {
                  name: "ignore-exclusions",
                  description: "Ignore AV exclusions for scheduled scans",
                  options: toggleOption(["true", "false"]),
                },
                {
                  name: "randomize-start-time",
                  description:
                    "Randomize scheduled scan start time (not applicable for hourly scans)",
                  options: toggleOption(["true", "false"]),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "connectivity",
      description: "Troubleshoot cloud connectivity",
      subcommands: [
        { name: "test", description: "Start a cloud connectivity test" },
      ],
    },
    {
      name: "definitions",
      description: "Manage security intelligence updates",
      subcommands: [
        {
          name: "update",
          description: "Check for security intelligence updates",
        },
        {
          name: "restore",
          description:
            "Rollback security intelligence to the original default set",
        },
        {
          name: "path",
          description: "Manage security intelligence updates path",
          subcommands: [
            {
              name: "get",
              description:
                "Get path where security intelligence updates are stored",
            },
            {
              name: "set",
              description:
                "Set path under which security intelligence updates will be stored",
              options: [{ name: "--path", args: pathArg, isRequired: true }],
            },
          ],
        },
      ],
    },
    {
      name: "diagnostic",
      description: "Troubleshoot product issues and collect diagnostics",
      subcommands: [
        {
          name: "create",
          description: "Generate support log (requires root)",
          options: [
            {
              name: "--path",
              description: "Directory to write the archive to",
              args: pathArg,
            },
          ],
        },
        {
          name: "upload",
          description: "Generate and submit support log to Microsoft",
        },
        {
          name: "real-time-protection-statistics",
          description: "Display real-time protection resource usage statistics",
        },
        {
          name: "behavior-monitoring-statistics",
          description: "Display behavior monitoring resource usage statistics",
        },
        {
          name: "antivirus-engine-pool-content",
          description:
            "Monitor the content for all antivirus engine core pools content",
        },
        {
          name: "event-provider-statistics",
          description: "Display event provider internal statistics",
        },
        { name: "hot-event-sources", description: "Monitor hot event sources" },
        { name: "perf-trace", description: "Run performance tracing" },
        {
          name: "restore-permissions",
          description: "Restore permissions of mde files",
        },
      ],
    },
    {
      name: "edr",
      description: "Manage Endpoint Detection & Response (EDR) configuration",
      subcommands: [
        {
          name: "early-preview",
          description: "Configure EDR early preview",
          subcommands: [
            { name: "enable", description: "Enable early preview" },
            { name: "disable", description: "Disable early preview" },
          ],
        },
        {
          name: "group-ids",
          description: "Configure machine group",
          options: [
            { name: "--group-id", args: { name: "group" }, isRequired: true },
          ],
        },
        {
          name: "tag",
          description: "Configure machine tags",
          subcommands: [
            {
              name: "set",
              description:
                "Set machine tag and value. Currently supported tags: GROUP",
              options: [
                {
                  name: "--name",
                  args: { name: "name", suggestions: ["GROUP"] },
                  isRequired: true,
                },
                { name: "--value", args: { name: "value" }, isRequired: true },
              ],
            },
            {
              name: "remove",
              description: "Remove machine tag",
              options: [
                {
                  name: "--name",
                  args: { name: "name", suggestions: ["GROUP"] },
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          name: "exclusion",
          description: "Manage EDR exclusion configuration",
          subcommands: [{ name: "list", description: "List EDR exclusions" }],
        },
      ],
    },
    {
      name: "exclusion",
      description: "Manage antivirus exclusions",
      subcommands: [
        processExclusionGroup("process", "Add or remove a process exclusion"),
        exclusionGroup("file", false),
        exclusionGroup("folder", false),
        exclusionGroup("extension", false),
        { name: "list", description: "List exclusions" },
      ],
    },
    {
      name: "performance-profiles",
      description: "Manage performance profiles",
      subcommands: [
        {
          name: "list-available",
          description: "List all performance profiles available to apply",
        },
        {
          name: "list-applied",
          description: "List all performance profiles currently applied",
        },
        {
          name: "apply",
          description: "Apply a performance profile",
          options: [{ name: "--name", args: nameArg, isRequired: true }],
        },
        {
          name: "remove",
          description: "Remove a performance profile",
          options: [{ name: "--name", args: nameArg, isRequired: true }],
        },
      ],
    },
    {
      name: "end-user",
      description: "Manage end user",
      subcommands: [
        { name: "version", description: "Get the front-end version" },
        { name: "update", description: "Check for front-end updates" },
        {
          name: "installer",
          description: "Get Microsoft Defender installer type",
        },
      ],
    },
    {
      name: "log",
      description: "Manage product logging",
      subcommands: [
        {
          name: "level",
          description: "Manage the diagnostic log level",
          subcommands: [
            {
              name: "set",
              description: "Set diagnostic log level",
              options: [
                {
                  name: "--level",
                  args: {
                    name: "level",
                    suggestions: [
                      "error",
                      "warning",
                      "info",
                      "debug",
                      "verbose",
                    ],
                  },
                  isRequired: true,
                },
              ],
            },
            {
              name: "persist",
              description:
                "Set and persist diagnostic log level for a number of hours",
              options: [
                {
                  name: "--level",
                  args: {
                    name: "level",
                    suggestions: [
                      "error",
                      "warning",
                      "info",
                      "debug",
                      "verbose",
                    ],
                  },
                  isRequired: true,
                },
                {
                  name: "--time-to-last",
                  description: "Hours (1-168) before reverting to info level",
                  args: { name: "hours" },
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          name: "view",
          description:
            "Display the log file contents to the console (requires root)",
        },
      ],
    },
    {
      name: "scan",
      description: "Scan for malicious software",
      subcommands: [
        { name: "quick", description: "Start quick scan" },
        { name: "full", description: "Start full system scan" },
        {
          name: "custom",
          description: "Start custom scan",
          options: [
            { name: "--path", args: pathArg, isRequired: true },
            {
              name: "--ignore-exclusions",
              description: "Scan paths that are otherwise excluded",
            },
          ],
        },
        { name: "cancel", description: "Cancel in-progress scan" },
        { name: "list", description: "List on-demand scans" },
      ],
    },
    {
      name: "device-control",
      description: "Manage device control",
      subcommands: [
        {
          name: "removable-media",
          description: "Devices options",
          subcommands: [
            { name: "list", description: "List all removable media devices" },
          ],
        },
        {
          name: "portable-devices",
          description: "Devices options",
          subcommands: [deviceListGroup("List all portable devices")],
        },
        {
          name: "bluetooth",
          description: "Device options",
          subcommands: [deviceListGroup("List all bluetooth devices")],
        },
        {
          name: "generic",
          description: "Devices options",
          subcommands: [deviceListGroup("List all devices", true)],
        },
        policyOptionsGroup,
      ],
    },
    {
      name: "system-extension",
      description: "Manage system extensions",
      subcommands: [
        {
          name: "endpoint-security",
          description: "Manage endpoint security system extension",
          subcommands: [
            {
              name: "load",
              description: "Install endpoint security system extension",
            },
          ],
        },
        {
          name: "network-filter",
          description: "Manage network filter system extension",
          subcommands: [
            {
              name: "load",
              description: "Install network filter system extension",
            },
            { name: "enable", description: "Enable network filter" },
            { name: "disable", description: "Disable network filter" },
          ],
        },
      ],
    },
    {
      name: "data-loss-prevention",
      description: "Manage data loss prevention",
      subcommands: [
        {
          name: "classification",
          description: "Classification options",
          subcommands: [
            {
              name: "query",
              description: "Query the classification of a file",
              options: [{ name: "--path", args: pathArg, isRequired: true }],
            },
          ],
        },
        {
          name: "policy",
          description: "Policy options",
          subcommands: [
            {
              name: "enforcement",
              description: "Enforcement policy options",
              subcommands: [
                {
                  name: "list",
                  description:
                    "List the data loss prevention enforcement policy",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "network-protection",
      description: "Manage network protection",
      subcommands: [
        {
          name: "exclusion",
          description: "Configure network protection exclusions for processes",
          subcommands: [
            {
              name: "add",
              description: "Add a process to the exclusion list",
              options: [
                {
                  name: "--path",
                  description: "Full path to the process",
                  args: pathArg,
                  isRequired: true,
                },
              ],
            },
            {
              name: "remove",
              description: "Remove a process from the exclusion list",
              options: [{ name: "--path", args: pathArg, isRequired: true }],
            },
            { name: "list", description: "List process exclusions" },
          ],
        },
        {
          name: "trace",
          description: "Control network trace",
          subcommands: [
            { name: "start", description: "Start network trace" },
            { name: "stop", description: "Stop network trace" },
          ],
        },
        {
          name: "feature-control",
          description: "Manage network protection features",
          subcommands: [
            "http-parsing",
            "tls-parsing",
            "dns-parsing",
            "dns-over-tcp-parsing",
            "ssh-parsing",
            "rdp-parsing",
            "ftp-parsing",
            "smtp-parsing",
            "icmp-parsing",
            "inbound-filtering",
            "convert-warn-to-block",
          ].map((feature) => ({
            name: feature,
            description: `Manage ${feature.replace(/-/g, " ")}`,
            options: toggleOption(enabledDisabledDefault),
          })),
        },
        {
          name: "set-log-level",
          description: "Change the trace level of network protection",
          options: [
            {
              name: "--value",
              args: {
                name: "level",
                suggestions: ["error", "warning", "info", "debug", "verbose"],
              },
              isRequired: true,
            },
          ],
        },
        {
          name: "remote-settings-override",
          description: "Override Remote Settings",
          subcommands: [
            {
              name: "set",
              description: "Override Network Protection remote settings",
              options: [
                {
                  name: "--value",
                  description:
                    "JSON string representation of a remote settings structure",
                  args: { name: "json" },
                  isRequired: true,
                },
              ],
            },
            {
              name: "reset",
              description:
                "Remove overrides and reset remote settings back to defaults",
            },
          ],
        },
        { name: "reset", description: "Reset the network extension" },
      ],
    },
    {
      name: "threat",
      description: "Manage threats and configure threat handling policies",
      subcommands: [
        { name: "list", description: "List all threats on this device" },
        {
          name: "get",
          description: "Get threat details",
          options: [{ name: "--id", args: idArg, isRequired: true }],
        },
        {
          name: "allowed",
          description: "Add or remove allowed threat families",
          subcommands: [
            { name: "list", description: "List allowed threat families" },
            {
              name: "add",
              description: "Add a threat to the allowed list",
              options: [
                {
                  name: "--name",
                  description: "Threat family name",
                  args: nameArg,
                  isRequired: true,
                },
              ],
            },
            {
              name: "remove",
              description: "Remove a threat family from the allowed list",
              options: [
                {
                  name: "--name",
                  description: "Threat family name",
                  args: nameArg,
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          name: "policy",
          description: "Manage threat handling policies",
          subcommands: [
            { name: "list", description: "List all threat handling policies" },
            {
              name: "set",
              description: "Configure a threat handling policy",
              options: [
                {
                  name: "--type",
                  args: {
                    name: "type",
                    suggestions: ["potentially_unwanted_application"],
                  },
                  isRequired: true,
                },
                {
                  name: "--action",
                  args: {
                    name: "action",
                    suggestions: ["off", "audit", "block"],
                  },
                  isRequired: true,
                },
              ],
            },
            {
              name: "unset",
              description: "Remove a threat handling policy",
              options: [
                { name: "--type", args: { name: "type" }, isRequired: true },
              ],
            },
          ],
        },
        {
          name: "quarantine",
          description: "Manage quarantine",
          subcommands: [
            { name: "list", description: "List quarantined threat(s)" },
            {
              name: "add",
              description: "Quarantine a threat",
              options: [{ name: "--id", args: idArg, isRequired: true }],
            },
            {
              name: "remove",
              description: "Remove a threat from the quarantine",
              options: [{ name: "--id", args: idArg, isRequired: true }],
            },
            {
              name: "remove-all",
              description: "Remove all threats from the quarantine",
            },
            {
              name: "restore",
              description: "Restore threat from the quarantine",
              subcommands: [
                {
                  name: "threat-id",
                  description: "Restore by threat identifier",
                  options: [
                    { name: "--id", args: idArg, isRequired: true },
                    {
                      name: "--destination-path",
                      description: "Destination path to restore to (optional)",
                      args: pathArg,
                    },
                  ],
                },
                {
                  name: "threat-path",
                  description:
                    "Restore by the threat's original path (requires sudo to list)",
                  options: [
                    {
                      name: "--path",
                      description: "Original path of the quarantined threat",
                      args: pathArg,
                      isRequired: true,
                    },
                    {
                      name: "--destination-path",
                      description: "Destination path to restore to (optional)",
                      args: pathArg,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "notice",
      description: "Display the Third-Party Notice",
    },
    {
      name: "version",
      description: "Display the product version",
    },
    {
      name: "help",
      description: "Display all available options for this tool",
    },
  ],
};

export default completionSpec;
