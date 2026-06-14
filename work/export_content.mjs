import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const sourcePath = path.join(root, "src/data/content.ts");
const generatedPath = path.join(root, "work/content.generated.mjs");
const outputPath = path.join(root, "work/content.json");

const source = await fs.readFile(sourcePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
});

await fs.writeFile(generatedPath, transpiled.outputText, "utf8");

const moduleUrl = `${pathToFileURL(generatedPath).href}?v=${Date.now()}`;
const content = await import(moduleUrl);

const payload = {
  generatedAt: new Date().toISOString(),
  sections: content.sections,
  executiveSummary: content.executiveSummary,
  documentLinks: content.documentLinks,
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(outputPath);
