import {build} from "esbuild";
import {mkdir, rm, cp} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(root, "..");
const distDir = resolve(projectRoot, "public");
const srcDir = resolve(projectRoot, "src");

await rm(distDir, {recursive: true, force: true});
await mkdir(distDir, {recursive: true});
await cp(resolve(srcDir, "index.html"), resolve(distDir, "index.html"));
await cp(resolve(srcDir, "styles"), resolve(distDir, "styles"), {recursive: true});
await cp(resolve(srcDir, "assets"), resolve(distDir, "assets"), {recursive: true});

await build({
  entryPoints: [resolve(srcDir, "ts", "main.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  sourcemap: true,
  outfile: resolve(distDir, "bundle.js"),
  loader: {
    ".ts": "ts"
  }
});
