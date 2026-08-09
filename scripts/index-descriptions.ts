import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const build = resolve(import.meta.dirname, "..", "build");
const indexPath = resolve(build, "index.json");

const isTopLevel = (name: string) =>
  !name.includes("/") || (name.startsWith("@") && name.split("/").length === 2);

const tilePath = (name: string) =>
  existsSync(resolve(build, `${name}.js`))
    ? resolve(build, `${name}.js`)
    : resolve(build, name, "index.js");

const rootDescription = async (name: string) => {
  const tile = await import(tilePath(name));
  const description = tile.default?.description;
  return typeof description === "string" ? description : undefined;
};

const index = JSON.parse(await readFile(indexPath, "utf8"));
const descriptions: Record<string, string> = {};

for (const name of index.completions.filter(isTopLevel)) {
  const description = await rootDescription(name);
  if (description) descriptions[name] = description;
}

await writeFile(indexPath, JSON.stringify({ ...index, descriptions }));
console.log(`Described ${Object.keys(descriptions).length} specs`);
