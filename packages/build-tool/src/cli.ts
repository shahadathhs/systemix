#!/usr/bin/env node
import { buildDual } from './index.js';
import * as fs from 'node:fs';

interface CliOptions {
  entry: string;
  outDir: string;
  tsconfig?: string;
  clean?: boolean;
}

function findTsConfig(): string | undefined {
  // Common tsconfig locations
  const locations = ['tsconfig.json', 'configs/typescript/base.json'];

  for (const location of locations) {
    if (fs.existsSync(location)) {
      return location;
    }
  }

  return undefined;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    entry: 'src/index.ts',
    outDir: 'dist',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--entry':
      case '-e':
        if (nextArg) {
          options.entry = nextArg;
          i++;
        }
        break;
      case '--outDir':
      case '-o':
        if (nextArg) {
          options.outDir = nextArg;
          i++;
        }
        break;
      case '--tsconfig':
      case '-t':
        if (nextArg) {
          options.tsconfig = nextArg;
          i++;
        }
        break;
      case '--clean':
        options.clean = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  // Auto-detect tsconfig if not specified
  options.tsconfig ??= findTsConfig();

  return options;
}

function printHelp() {
   
  console.info(`
Systemix Build Tool

Usage:
  systemix-build [options]

Options:
  --entry, -e        Entry file (default: src/index.ts)
  --outDir, -o       Output directory (default: dist)
  --tsconfig, -t     Path to tsconfig.json
  --clean            Clean output directory before build
  --help, -h         Show this help

Example:
  systemix-build --entry src/index.ts --outDir dist --tsconfig tsconfig.json
  `);
}

function main() {
  try {
    const options = parseArgs();

    // Validate entry file exists
    if (!fs.existsSync(options.entry)) {
       
      console.error(`Error: Entry file not found: ${options.entry}`);
      process.exit(1);
    }

     
    console.info(`🔨 Building ${options.entry}...`);
    buildDual(options);
     
    console.info('✅ Build complete!');
  } catch (error) {
     
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

void main();