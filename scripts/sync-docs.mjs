import { cpSync, existsSync, lstatSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = process.cwd();
const repositories = ["nyte-server", "nyte-web"];

for (const repository of repositories) {
  const source = resolve(root, ".sources", repository, "docs");
  const destination = resolve(root, ".generated", "docs", repository);

  if (!existsSync(source)) {
    throw new Error(`Documentation source missing: ${source}`);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });

  cpSync(source, destination, {
    recursive: true,
    filter: (path) => {
      if (lstatSync(path).isSymbolicLink()) {
        throw new Error(`Symlink not allowed: ${path}`);
      }

      return true;
    }
  });

  console.log(`Synchronized ${repository}`);
}
