# E2E Tests

This directory contains end-to-end tests for the 10x Cards application.

## Requirements

To run the tests, you need:

1. Node.js (version compatible with the project)
2. Installed project dependencies (`npm install`)
3. Locally running application (`npm run dev`) on the default port 3000

## Environment Variables

The tests require the following environment variables:

- `E2E_USERNAME` - email address of the test user
- `E2E_PASSWORD` - password of the test user

You can set these variables in the `.env` file in the project root directory:

```
E2E_USERNAME=your-email@example.com
E2E_PASSWORD=your-password
```

## Running Tests

To run all E2E tests:

```bash
npm run test:e2e
```

To run a specific test:

```bash
npx playwright test tests/e2e/auth.spec.ts
```

## Test Structure

- `page-objects/` - directory containing Page Object Model classes
- `*.spec.ts` - test files 