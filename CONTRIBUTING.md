# Contributing to Tessera.io

First off, thank you for considering contributing to Tessera.io! It's people like you that make this tool such a great collaborative sandbox.

## Reporting Issues

Before opening a new issue, please search the existing issues to see if the problem or feature request has already been discussed.

If you find a new bug or have a feature proposal, please open an issue using our interactive templates:
- **🐛 Bug Reports:** Choose this template to report crashes, unexpected behavior, or security issues. Please include reproduction steps, expected behavior, and system environment info.
- **💡 Feature Requests:** Choose this template to suggest new features, integrations, or improvements to the collaborative developer sandbox.

---

## How to Contribute

### 1. Claim an Issue
- Find an open issue you'd like to work on. We recommend checking out our [good first issues](https://github.com/Kushaal-k/Tessera.io/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).
- Comment `/claim` directly on the issue.

### 2. Star & Fork the Repository
- **Star the repo:** Show your support by starring the main Tessera.io repository!
- **Fork it:** Click the "Fork" button at the top right of the repository page.
- **Clone your fork:**
```bash
  git clone git@github.com:<your-username>/Tessera.io.git
  cd Tessera.io
```

### 3. Branching
```bash
git checkout -b feature/your-feature-name
```

### 4. Making Changes
Test your changes locally:
```bash
npm run typecheck
npm run build
npm run dev
```

### 5. Committing Your Changes
```bash
git commit -m "feat: your descriptive commit message"
```

### 6. Submit a Pull Request
Provide a clear description of the problem you're solving and the changes you've made.

---

## Adding a New Language

To add support for a new language in Tessera.io, follow these steps:

### 1. Shared Types
Add the new language to `SupportedLanguage` in `packages/shared-types/`.

### 2. Execution Sandbox
Add a new Docker sandbox container for the language in `apps/execution-engine/`.

### 3. Monaco Editor Mapping
Map the language to its Monaco editor identifier in `apps/web/src/App.tsx`.

### 4. IntelliSense (Optional)
Add an IntelliSense completion provider in `apps/web/src/` following the existing provider patterns in the codebase.

---

## UI Changes

If your pull request includes UI changes, please include at least one of the following:
- A **screenshot** of the updated UI
- A short **GIF or video** demonstrating the change and relevant interactions

This helps maintainers review and verify visual changes more efficiently.

---

## Need Help?
Look for issues tagged with `good first issue` if you're not sure where to start. We look forward to your contributions!