import * as ts from 'typescript';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface BuildOptions {
  entry: string;
  outDir: string;
  format: 'cjs' | 'esm' | 'dual';
  declaration?: boolean;
  tsconfig?: string;
  clean?: boolean;
}

export function build(options: BuildOptions) {
  const {
    entry,
    outDir,
    format,
    declaration = true,
    tsconfig: tsconfigPath,
    clean = true,
  } = options;

  // Clean output directory if requested
  if (clean && fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Load or create TypeScript config
  const tsConfig = loadTsConfig(tsconfigPath);

  // Create compiler options
  const compilerOptions: ts.CompilerOptions = {
    ...tsConfig.compilerOptions,
    outDir,
    declaration,
    // Override format-specific options
    ...(format === 'cjs' && {
      module: ts.ModuleKind.CommonJS,
    }),
    ...(format === 'esm' && {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    }),
  };

  // Ensure we don't inject problematic baseUrl
  delete compilerOptions.baseUrl;

  // Create program
  const program = ts.createProgram([entry], compilerOptions);

  // Emit files
  const emitResult = program.emit();

  // Check for errors
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  const errors = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);

  if (errors.length > 0) {
     
    console.error('Build errors:');
    errors.forEach(error => {
      const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
      const file = error.file ? error.file.fileName : '';
      const line = error.start ? `:${error.start}` : '';
       
      console.error(`  ${file}${line} - ${message}`);
    });
    throw new Error('Build failed with errors');
  }

  // eslint-disable-next-line no-console
  console.log(`✅ Built ${format.toUpperCase()} to ${outDir}`);
  return emitResult;
}

function loadTsConfig(tsconfigPath?: string): any {
  if (tsconfigPath && fs.existsSync(tsconfigPath)) {
    const configContent = fs.readFileSync(tsconfigPath, 'utf-8');
    const { config } = ts.parseConfigFileTextToJson(tsconfigPath, configContent);

    // Convert string module resolution to TypeScript enum
    if (config.compilerOptions?.moduleResolution === 'bundler') {
      config.compilerOptions.moduleResolution = ts.ModuleResolutionKind.Bundler;
    }
    if (config.compilerOptions?.moduleResolution === 'node') {
      config.compilerOptions.moduleResolution = ts.ModuleResolutionKind.Node10;
    }

    return config;
  }

  // Default config for modern TypeScript
  return {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      lib: ['ES2020', 'DOM'],
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      resolvePackageJsonExports: true,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
  };
}

export function buildDual(options: Omit<BuildOptions, 'format'>) {
  const { entry, outDir, declaration, tsconfig, clean } = options;

  // Build ESM version
  build({
    entry,
    outDir,
    format: 'esm',
    declaration,
    tsconfig,
    clean,
  });

  // Build CJS version to separate directory
  const cjsDir = path.join(outDir, 'cjs');
  build({
    entry,
    outDir: cjsDir,
    format: 'cjs',
    declaration: false, // Already generated in ESM build
    tsconfig,
    clean: false, // Don't clean again
  });

  // Copy and rename .d.ts to .d.cts for CJS
  if (declaration) {
    const dtsFile = path.join(outDir, path.basename(entry).replace(/\.ts$/, '.d.ts'));
    const dctsFile = path.join(cjsDir, path.basename(entry).replace(/\.ts$/, '.d.cts'));

    if (fs.existsSync(dtsFile)) {
      fs.copyFileSync(dtsFile, dctsFile);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`✅ Built dual CJS/ESM to ${outDir}`);
}