/* global __dirname */

// Transpile only pure models and domain tests using the project's TypeScript.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(projectRoot, '.expo', 'linking-domain-tests');
const sourceFiles = [
  'src/models/auth/types.ts',
  'src/models/seniors/types.ts',
  'src/models/linking/types.ts',
  'src/models/linking/link-repository.ts',
  'src/models/linking/index.ts',
  'tests/linking-domain.test.ts',
];

for (const file of sourceFiles) {
  const sourcePath = path.join(projectRoot, file);
  const destinationPath = path.join(outputRoot, file.replace(/\.ts$/, '.js'));
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  const result = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    fileName: sourcePath,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  });
  fs.writeFileSync(destinationPath, result.outputText);
}

const result = spawnSync(
  process.execPath,
  ['--test', path.join(outputRoot, 'tests', 'linking-domain.test.js')],
  { cwd: projectRoot, stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
