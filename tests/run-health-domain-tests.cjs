/* global __dirname */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(projectRoot, '.expo', 'health-domain-tests');
const sourceFiles = [
  'src/models/auth/types.ts',
  'src/models/health/types.ts',
  'src/models/health/health-model.ts',
  'src/models/health/health-repository.ts',
  'src/models/health/health-form-model.ts',
  'src/models/health/care-plan.ts',
  'src/models/schedules/types.ts',
  'src/models/schedules/schedule-model.ts',
  'tests/health-domain.test.ts',
];

for (const file of sourceFiles) {
  const sourcePath = path.join(projectRoot, file);
  const destinationPath = path.join(outputRoot, file.replace(/\.ts$/, '.js'));
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  const result = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    fileName: sourcePath,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  fs.writeFileSync(destinationPath, result.outputText);
}

const result = spawnSync(process.execPath, ['--test', path.join(outputRoot, 'tests', 'health-domain.test.js')], { cwd: projectRoot, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
