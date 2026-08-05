# GoList v2 (Beta)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/Gan-Tu/GoList-v2/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Gan-Tu/GoList-v2/actions/workflows/ci.yml)
[![Deploy to Prod](https://github.com/Gan-Tu/GoList-v2/actions/workflows/deploy_to_prod.yml/badge.svg?branch=main)](https://github.com/Gan-Tu/GoList-v2/actions/workflows/deploy_to_prod.yml)

Quickly browse a collection of links or files with one short URL.

**Demo** — create a list at https://goli.st, or view https://goli.st/demo.

## Run it locally

Everything runs against the Firebase emulator suite, so no cloud credentials
are needed and production data is never touched.

```bash
npm run install:all && npm run demo
```

That starts the emulators, seeds a few collections, and opens the app on
http://localhost:3000. Requires Node 20+, a JRE (for the Firestore emulator),
and `npm install -g firebase-tools`.

Seeded routes worth clicking: `/web-mobile` (populated), `/empty-list` (empty
state), `/nope-nope` (not found).

## Layout

| Path            | What it is                                                    |
| --------------- | ------------------------------------------------------------- |
| `frontend/`     | React 18 + Vite SPA, Redux Toolkit + redux-saga                 |
| `functions/`    | Cloud Functions v2 — link metadata, Domains mirror, OG renderer |
| `firestore.rules` | Authorization for every read and write                        |
| `tests/`        | Security-rules tests against the emulator                       |
| `scripts/`      | Local demo, emulator seeding, build glue                        |

`firebase.json` at the repository root covers hosting, functions, rules,
indexes, and emulators.

## Data model

`DataGroups/{shortUrl}` holds one collection:

```jsonc
{
  "id": "my-list",
  "title": "Weekend reading",
  "ownerId": "<uid> | PUBLIC",
  "items": {
    "<itemId>": { "id", "link", "title", "snippet", "imageUrl", "order" }
  }
}
```

`Domains/{shortUrl}` is a denormalized mirror powering "My Lists". It is
written **only** by Cloud Functions triggers — clients have no write access.

Every collection has an owner: the client signs in anonymously when no account
is present, which is what makes the ownership checks in `firestore.rules`
enforceable. `ownerId: "PUBLIC"` marks shared demo lists, editable by any
signed-in user but deletable by none.

Short URLs are claim-once. Creation runs in a transaction and the rules allow
`create` but not overwrite, so an existing list can never be clobbered.

## Commands

```bash
npm run demo            # full local stack with seed data
npm test                # rules + frontend tests
npm run test:rules      # security rules only (starts its own emulator)
npm run lint            # frontend + functions
npm run build           # production build + sync the SSR shell
```

Per-package: `npm --prefix frontend run dev|build|test|lint`,
`npm --prefix functions run test|lint`.

## Deploying

CI deploys on push to `main` — rules, indexes, functions, and hosting. To
deploy by hand you need `firebase login` first:

```bash
npm run deploy:preview   # throwaway preview channel, expires in 7 days
npm run deploy:rules     # firestore rules + indexes
npm run deploy:functions # cloud functions
npm run deploy:hosting   # build + hosting (production)
```

Deploy rules before functions before hosting, so that tightened rules are never
live against a client that predates them.

### App Check

Callables enforce App Check in production. Enforcement is behind the
`ENFORCE_APP_CHECK` environment variable so it can be staged:

- `functions/.env.local` sets it to `false` for the emulator, which has no
  attestation provider. With enforcement on, the functions framework rejects
  every callable with `unauthenticated` before the handler runs.
- To roll out gradually, deploy once with `ENFORCE_APP_CHECK=false`, confirm
  clients are sending tokens, then remove the override.

## Configuration

`frontend/.env` holds the Firebase web config. Those values are public by
design — they identify the project and authorize nothing; access control lives
in `firestore.rules` and App Check. Override them in `frontend/.env.local`
(git-ignored) to point at a different project.
