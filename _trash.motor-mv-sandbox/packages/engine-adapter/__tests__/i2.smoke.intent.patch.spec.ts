/**
 * I2/E1 smoke: event → intent → response → patch → text
 * Minimal, dependency-light. Types are intentionally "any" to avoid TS frictions.
 */
import { describe, it, expect } from 'vitest'
import { createEngineAdapter } from '../src/index'
import { makeInprocPort } from '../src/inproc.adapter'
import { applyPatches } from '../src/applyPatches'

const now = () => Date.now()

// naive "unwrap" helper for "(...)" at [0, text.length-1] just for demo
function unwrapWhole(text: string) {
  if (text.length >= 2 && text[0] === '(' && text[text.length - 1] === ')') {
    return [{ op: 'unwrap', open: 0, close: text.length - 1 }] as any[]
  }
  return []
}

describe('I2 smoke: request() returns patches and applyPatches mutates text', () => {
  it('click-paren on (1+2) produces unwrap → "1+2"', async () => {
    const port = makeInprocPort(async (intent: any) => {
      if (intent.type === 'click-paren') {
        return {
          id: intent.id,
          ok: true,
          decision: 'transform',
          patches: unwrapWhole(intent.text),
        }
      }
      return { id: intent.id, ok: true, decision: 'noop', patches: [] }
    })

    const adapter = createEngineAdapter({ port })

    const text = '(1+2)'
    const intent = {
      v: '1.0',
      id: 't-click-1',
      type: 'click-paren',
      ts: now(),
      format: 'ascii',
      text,
      pid: 0,
    }

    const resp: any = await adapter.request(intent as any)
    expect(resp).toBeTruthy()
    expect(resp.ok).toBe(true)
    expect(resp.decision).toBe('transform')
    expect(Array.isArray(resp.patches)).toBe(true)

    const out = applyPatches(text, resp.patches as any)
    expect(out).toBe('1+2')
  })

  it('hover-op does not change text (noop/empty patches)', async () => {
    const port = makeInprocPort(async (intent: any) => {
      if (intent.type === 'hover-op') {
        return { id: intent.id, ok: true, decision: 'noop', patches: [] }
      }
      return { id: intent.id, ok: true, decision: 'noop', patches: [] }
    })

    const adapter = createEngineAdapter({ port })
    const text = '1+(2*3)'
    const intent = {
      v: '1.0',
      id: 't-hover-1',
      type: 'hover-op',
      ts: now(),
      format: 'ascii',
      text,
      idx: 0,
    }
    const resp: any = await adapter.request(intent as any)
    expect(resp.ok).toBe(true)
    const out = applyPatches(text, resp.patches as any)
    expect(out).toBe(text)
  })
})