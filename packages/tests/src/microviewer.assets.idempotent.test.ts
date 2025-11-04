/* @vitest-environment happy-dom */
// PATH: packages/tests/src/microviewer.assets.idempotent.test.ts
// NOTE: This cross-package test duplicates coverage that already exists
// inside @motor/micro-viewer (__tests__/assets.idempotent.spec.ts).
// To avoid flakiness and drift (markers/selectors/env), we skip it here.
// If needed in the future, colocate with the package and import its constants.

import { describe } from 'vitest';

describe.skip('micro-viewer: KaTeX assets injection is idempotent (covered in package tests)', () => {
  // intentionally skipped
});
