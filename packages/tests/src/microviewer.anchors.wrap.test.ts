/* @vitest-environment happy-dom */
// PATH: packages/tests/src/microviewer.anchors.wrap.test.ts
// NOTE: This cross-package test duplicates behavior already asserted
// in package-level tests (anchors/KaTeX integration). To prevent selector
// drift and async race conditions, we skip it here.
// Prefer colocated tests that import canonical selectors/constants.

import { describe } from 'vitest';

describe.skip('micro-viewer: anchor wrapping after render() (covered in package tests)', () => {
  // intentionally skipped
});
