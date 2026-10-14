/* global __dirname */

// Use the existing TypeScript dependency to run pure domain tests on Node.
// Generated JavaScript stays under the project's ignored .expo directory.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(projectRoot, '.expo', 'senior-domain-tests');
const sourceFiles = [
  'src/config/demo-flags.ts',
  'src/models/auth/types.ts',
  'src/models/auth/demo-auth-service.ts',
  'src/controllers/auth/login-destination.ts',
  'src/models/seniors/types.ts',
  'src/models/seniors/form-model.ts',
  'src/models/seniors/senior-repository.ts',
  'tests/senior-domain.test.ts',
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
  ['--test', path.join(outputRoot, 'tests', 'senior-domain.test.js')],
  { cwd: projectRoot, stdio: 'inherit' }
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
