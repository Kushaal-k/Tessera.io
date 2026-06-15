# TODO - Validate execute-code payload

- [x] Add server-side validation for execute-code payload: non-empty code, valid SupportedLanguage, and max code byte size.
- [x] Update server.ts to reject invalid payloads by emitting execution-result with failed status (and do not enqueue job).
- [x] Ensure code compiles (TypeScript) and formatting is consistent.
- [ ] Push branch `fix/validate-execute-code-payload` to origin.
