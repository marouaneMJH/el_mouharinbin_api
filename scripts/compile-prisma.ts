import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, extname } from 'path';

// Change this if your prisma files are in a different folder
const ROOT_DIR = process.cwd();

const APPS_DIR = ROOT_DIR + '/apps';
const OUTPUT_SCHEMA = ROOT_DIR + '/libs/contract/prisma/schema.prisma'; // central schema file

// Recursive function to find all .prisma files inside apps/
function findPrismaFiles(dir: string): string[] {
  let results: string[] = [];
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      results = results.concat(findPrismaFiles(fullPath));
    } else if (extname(fullPath) === '.prisma') {
      results.push(fullPath);
    }
  }
  return results;
}

// Extract only model, enum, and datasource/generator blocks
function extractSchemaBlocks(content: string) {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let insideBlock = false;

  for (let line of lines) {
    line = line.trimEnd();

    if (line.startsWith('model ') || line.startsWith('enum ')) {
      insideBlock = true;
      currentBlock = [line];
    } else if (insideBlock) {
      currentBlock.push(line);
      if (line === '}') {
        blocks.push(currentBlock.join('\n'));
        insideBlock = false;
      }
    }
  }

  return blocks.join('\n\n');
}

// Start merging
const prismaFiles = findPrismaFiles(APPS_DIR);
console.log('Found Prisma files:', prismaFiles);

let mergedSchema = `// THIS FILE IS AUTO-GENERATED\n\n`;

prismaFiles.forEach((file, index) => {
  const content = readFileSync(file, 'utf-8');
  const blocks = extractSchemaBlocks(content);
  mergedSchema += `// From ${file}\n${blocks}\n\n`;
});

// Add a single generator and datasource (you may need to adjust)
mergedSchema =
  `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
` + mergedSchema;

writeFileSync(OUTPUT_SCHEMA, mergedSchema);
console.log(`✅ Merged schema written to ${OUTPUT_SCHEMA}`);
