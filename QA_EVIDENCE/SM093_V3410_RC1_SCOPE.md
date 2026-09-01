# SM093 v3.4.10-rc1 QA Scope

This candidate packages only the verified boot hydration repair and candidate metadata.

- `RELOAD_EXACT_RESUME`: required PASS
- static runtime coverage: required 6/6
- direct UI exposure gap: recorded, not repaired
- authenticated browser gate: environment blocked without authorized session
- full source text is never sent to providers: `fullSourceSent = false`
- legacy `source_passages` body contract remains zero / unchanged
