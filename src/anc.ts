const listeningModes: Fig.Generator = {
  script: ["anc", "--list"],
  postProcess: (out) =>
    out
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => ({
        name: line.slice(2),
        description: line.startsWith("*") ? "Current mode" : "Listening mode",
      })),
};

const completionSpec: Fig.Spec = {
  name: "anc",
  description: "Switch AirPods noise control",
  args: {
    name: "mode",
    isOptional: true,
    generators: listeningModes,
    suggestions: [
      {
        name: "toggle",
        description: "Switch between noise cancellation and transparency",
      },
    ],
  },
  options: [
    {
      name: "--list",
      description: "List the modes the connected device supports",
    },
  ],
};

export default completionSpec;
