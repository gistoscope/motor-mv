// @motor/engine-adapter — in-process transport
/**
 * makeInprocPort takes an async handler(intent) and adapts it into a "port"
 * consumed by createEngineAdapter.
 */
export function makeInprocPort(handler) {
  if (typeof handler !== 'function') {
    throw new Error('makeInprocPort(handler) requires a function')
  }
  return {
    async request(intent) {
      return handler(intent)
    },
    classify(intent) {
      // optional lightweight path
      return { status: 'noop' }
    }
  }
}