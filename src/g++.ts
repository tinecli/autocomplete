import { stdCPPSuggestions } from "./clang";
import { gccBase } from "./gcc";

const completionSpec: Fig.Spec = {
  ...gccBase,
  name: "g++",
  description: "The default C++ compiler for most linux distributions",
  options: [
    ...(gccBase as Fig.Subcommand).options,
    {
      name: "-std",
      description: "Language standard to compile for",
      args: {
        name: "value",
        suggestions: [...stdCPPSuggestions],
      },
      requiresSeparator: true,
    },
  ],
};
export default completionSpec;
