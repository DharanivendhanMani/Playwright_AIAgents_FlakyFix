# Your fixes go here

This folder starts empty on purpose. `tests/solutions/` is the **answer key**; try your own fix first.

```bash
npm run fix -- 06                 # copies tests/flakiness-suite/06-*.spec.ts into this folder
# edit tests/my-fixes/06-network-race.spec.ts
npm run test:mine -- 06 --repeat-each=20
```

A fix counts when it passes **20/20** and `npm run verify-lab:mine` reports no band-aids.
Then compare with `docs/06-network-race.md` and `tests/solutions/`.
