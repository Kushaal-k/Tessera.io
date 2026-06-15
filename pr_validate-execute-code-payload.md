# Title

Fix execute-code payload validation in sync-server

## Description

The Socket.IO `execute-code` handler in `apps/sync-server/src/server.ts` was passing `payload.code` and `payload.language` directly into BullMQ without validation. A malicious or buggy client could submit empty/invalid values (e.g., empty `language` or `code`) or extremely large payloads, which could lead to unexpected worker behavior or wasted sandbox resources.

This change adds strict server-side validation before enqueueing a job:

- `code` must be a non-empty (non-whitespace) string
- `language` must be one of the supported values from `SupportedLanguage`
- `code` size is capped to a reasonable maximum (64KiB UTF-8 bytes)

If validation fails, the handler emits `execution-result` with `status: "failed"` and does **not** enqueue a BullMQ job.

Fixes #<!-- Issue number goes here -->

## Type of Change

- [x] Bug fix (non-breaking change which fixes an issue)

## How Has This Been Tested?

### Automated Verification

- [x] `npm -w apps/sync-server build`

### Manual Verification

- [ ] Tested via Socket.IO client with invalid payloads (expected: job not enqueued, `execution-result` failed)

## Checklist

- [x] I have read the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines.
- [x] My code follows the style guidelines of this project.
- [x] I have performed a self-review of my own code.
- [x] I have commented my code, particularly in hard-to-understand areas.
- [x] My changes generate no new warnings or console errors.
