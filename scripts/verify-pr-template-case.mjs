#!/usr/bin/env node
import { execSync } from 'node:child_process';

const allowedFile = '.github/pull_request_template.md';
const allowedDir = '.github/PULL_REQUEST_TEMPLATE/';

let files;
try {
  const output = execSync('git ls-files -z', { encoding: 'utf8' });
  files = output.split('\0').filter(Boolean);
} catch (error) {
  console.error('Failed to list tracked files via git ls-files:', error.message);
  process.exit(1);
}

let hasAllowedFile = false;
const violations = [];

for (const file of files) {
  if (file === allowedFile) {
    hasAllowedFile = true;
    continue;
  }

  if (file.startsWith(allowedDir)) {
    continue;
  }

  if (!file.startsWith('.github/')) {
    continue;
  }

  const normalized = file.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('pullrequesttempl')) {
    violations.push(file);
  }
}

const errorMessages = [];

if (!hasAllowedFile) {
  errorMessages.push(
    `Missing required PR template "${allowedFile}". Ensure the standard template exists and is tracked.`
  );
}

if (violations.length > 0) {
  errorMessages.push(
    [
      'Found PR template files with incorrect casing or location:',
      ...violations.map((v) => ` - ${v}`),
      '',
      'Only the following are allowed:',
      ` - ${allowedFile}`,
      ` - ${allowedDir}*`,
    ].join('\n')
  );
}

if (errorMessages.length > 0) {
  console.error(errorMessages.join('\n\n'));
  process.exit(1);
}

process.exit(0);
