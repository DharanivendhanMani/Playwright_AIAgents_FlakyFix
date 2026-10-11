# Claude Code prompts — the Diagnose → Fix → Push back loop

The **Healer** agent lives in `.claude/agents/playwright-test-healer.md`. Start Claude Code in this folder so
`.mcp.json` connects the Playwright MCP servers. Run `npm test` first so there are failures to read.

## Prompt 1 — Diagnose (no edits)
```
Use the playwright-test-healer rules. For each failing test in tests/flakiness-suite/:
1. Read the test, the matching code in src/ and server.js, and the failure in test-results/.
2. Output a table: file | flake category | ROOT CAUSE (not symptom) | proposed fix (one sentence).
Do not edit anything. Stop and wait for my approval.
```

## Prompt 2 — Apply fixes (originals stay put)
```
Approved. Write the fixed version of each test to tests/solutions/ using the same file name.
Do NOT modify tests/flakiness-suite/. Then run:
  npx playwright test -c playwright.solutions.config.ts --repeat-each=20
and report pass counts.
```

## Prompt 3 — Push back on band-aids
```
Review your fixes. For each one, tell me if it uses waitForTimeout, networkidle, force:true,
.first()/.nth() to dodge strictness, or retries. Those are band-aids.
Re-read src/app.js and server.js: which two operations are racing in <test>?
Replace the band-aid with a condition-based wait (web-first assertion, waitForResponse,
role/testid locator, isolated or unique test data). No magic numbers.
```

## Prompt 4 — Audit
```
List every change you made and classify each: ROOT-CAUSE FIX or BAND-AID, with a one-line reason.
```

## Rubric: what a real fix looks like

| Test | Band-aid | Real fix |
|---|---|---|
| 01 brittle-locator | another CSS class / nth-child | `getByRole('button', { name: 'Add Oyster Mushrooms to cart' })` |
| 02 hard-wait | longer `waitForTimeout` | `await expect(page.locator('.product-row')).toHaveCount(4)` |
| 03 shared-state | `test.describe.serial` / rely on order | seed the cart in the test (`addInitScript` or UI) |
| 04 loading-state | `waitForTimeout(2000)` | `await expect(page.getByTestId('loading-spinner')).toBeHidden()` before click |
| 05 dynamic-content | `.nth(2)` that happens to match | `getByTestId('rec-oyster').getByRole('button')` |
| 06 network-race | sleep before reading | `await expect(row.locator('.price')).toHaveText('$4.99')` or `waitForResponse('**/api/stock')` |
| 07 parallel-collision | `workers: 1` | unique e-mail per test (`faker.internet.email()` or timestamp) |
