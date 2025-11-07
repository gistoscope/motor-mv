let _counter = 0;

export function makeId(prefix = "mv"): string {
  const c = (++_counter).toString(36);
  const t = Date.now().toString(36);
  return `${prefix}-${t}-${c}`;
}
