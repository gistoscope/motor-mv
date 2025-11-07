# I2 smoke test runner
param(
  [switch]$Watch
)

cd D:\work\motor-mv
pnpm install

if ($Watch) {
  pnpm -r test -- --watch
} else {
  pnpm run verify
  pnpm -r test
}