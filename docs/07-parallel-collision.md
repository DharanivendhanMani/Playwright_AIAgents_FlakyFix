# 07 · Parallel data collision

**Strategy:** #8 Run tests in parallel correctly · **Baseline:** 0–20% pass (one of two tests wins the race) · **Fixed:** 20/20

## Symptom
```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#signup-result')
Expected substring: "testuser@example.com"
Received string:    "Email already registered"
```
The test that fails is not always the same one; it's whichever registers second.

## Where it lives
[server.js:41](../server.js#L41) and [server.js:77](../server.js#L77): the server remembers registered e-mails and rejects duplicates.
```js
const registered = new Set();
...
if (registered.has(email)) return sendJSON(res, 409, { error: 'Email already registered' }, 200);
```

## Root cause
Both tests assume `testuser@example.com` is unused, but they run in parallel against the same server, and the second to register is rejected as a duplicate. The server also keeps the e-mail between runs, so a repeat run fails both.

## Reproduce
```bash
npx playwright test 07-parallel-collision --repeat-each=5
```

## Naive test
```ts
await page.getByLabel('Email address').fill('testuser@example.com');   // same value in both tests
```

## Band-aid (don't)
- `workers: 1`: hides the collision, slows the suite, and still fails on a re-run (the server remembers).
- `test.describe.serial`: same problem.
- Cleaning up after the test: breaks the moment a test crashes before cleanup.

## Real fix ([tests/solutions/07-parallel-collision.spec.ts](../tests/solutions/07-parallel-collision.spec.ts))
```ts
const email = `${faker.string.uuid()}@example.com`;
```
Each test registers its own unique e-mail, so there is nothing to collide on.

## Prove it
```bash
npx playwright test -c playwright.solutions.config.ts 07-parallel-collision --repeat-each=20 --workers=4
```

## Lesson
Parallelism only **exposes** shared data; it isn't the cause. Give every test its own data.
