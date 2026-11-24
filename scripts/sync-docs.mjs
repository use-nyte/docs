import { cpSync, existsSync, lstatSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const repositories = ["nyte-server", "nyte-web"];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function copyDirectory(source, destination) {
  if (!existsSync(source)) {
    throw new Error(`Documentation source missing: ${source}`);
  }

  cpSync(source, destination, {
    recursive: true,
    filter: (path) => {
      if (lstatSync(path).isSymbolicLink()) {
        throw new Error(`Symlink not allowed: ${path}`);
      }

      return true;
    }
  });
}

for (const repository of repositories) {
  const sourceRoot = resolve(root, ".sources", repository);
  const destination = resolve(root, ".generated", "docs", repository);

  const guidesSource = resolve(sourceRoot, "docs");
  const apiSource = resolve(sourceRoot, ".generated", "api");

  if (!existsSync(resolve(apiSource, "index.md"))) {
    throw new Error(`API reference not generated for ${repository}`);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });

  copyDirectory(guidesSource, destination);
  copyDirectory(apiSource, resolve(destination, "api"));

  console.log(`Synchronized guides and API for ${repository}`);
}
