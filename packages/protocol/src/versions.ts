/**
 * Local/base version helpers to avoid applying stale responses.
 */
export class LocalVersion {
  private _n = 0;
  get current(): number { return this._n; }
  bump(): number { this._n += 1; return this._n; }
  equals(n?: number): boolean { return typeof n === "number" && n === this._n; }
}
