/**
 * Coalesce frequent calls (e.g., hover) into at most one call per 'interval' ms.
 */
export function coalesce<T extends (...args: any[]) => void>(fn: T, interval = 40): T {
  let last = 0;
  let pending: any[] | null = null;
  let timer: number | null = null as any;

  function fire(args: any[]) {
    last = Date.now();
    pending = null;
    fn(...args);
  }

  return function(this: any, ...args: any[]) {
    const now = Date.now();
    if (now - last >= interval) {
      fire(args);
      return;
    }
    pending = args;
    if (timer == null) {
      timer = setTimeout(() => {
        timer = null as any;
        if (pending) fire(pending);
      }, interval) as unknown as number;
    }
  } as T;
}
