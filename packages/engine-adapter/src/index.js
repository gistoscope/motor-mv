// @motor/engine-adapter — minimal in-process adapter (I3)
/**
 * createEngineAdapter wraps a "port" object with two methods:
 *   - request(intent): Promise<MVResponse>
 *   - classify?(intent): { status: 'ok'|'blocked'|'noop', hints?: any }
 */
export function createEngineAdapter({ port }) {
  if (!port || typeof port.request !== 'function') {
    throw new Error('EngineAdapter: port.request(intent) is required')
  }
  return {
    request(intent) {
      return Promise.resolve(port.request(intent))
    },
    classify(intent) {
      if (typeof port.classify === 'function') return port.classify(intent)
      return { status: 'noop' }
    }
  }
}