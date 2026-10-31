import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { webcrypto } from "node:crypto";
const require = createRequire(import.meta.url);
const ts = require("../../web/node_modules/typescript");

// Execute the real server modules with a controlled HTTP boundary. No live credentials or API calls.
export function loadEngine(fetch) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const localRequire = (name) => {
      if (name === "server-only") return {};
      if (!name.startsWith(".")) throw new Error(`Unexpected test import: ${name}`);
      return load(path.resolve(path.dirname(file), name.endsWith(".ts") ? name : `${name}.ts`));
    };
    new Function("require", "module", "exports", "fetch", "process", "crypto", source)(
      localRequire, module, module.exports, fetch, { env: { QLOO_KEY: "fixture-only" } }, webcrypto,
    );
    return module.exports;
  }
  return load(path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../web/lib/engine.ts"));
}
