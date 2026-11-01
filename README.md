# BookNook — Backend

Express.js + MongoDB + Better Auth + JWT backend for BookNook.

## Project description

REST API for the BookNook small online library: book catalogue, borrows, and authentication.

## Technologies

- Node.js
- Express 5 (ES modules: `"type": "module"`)
- MongoDB (native driver)
- Better Auth (with MongoDB adapter)
- JWT (via Better Auth JWT plugin, verified in Express middleware)

## Environment variables

Copy `.env.example` to `.env` and fill in real values.

- `PORT` — API port (default 5000)
- `DB_URL` — MongoDB connection string
- `DB_NAME` — MongoDB database name
- `BETTER_AUTH_SECRET` — Better Auth secret
- `BETTER_AUTH_URL` — Better Auth base URL (backend)
- `JWT_ISSUER` — JWT issuer (default `booknook`)
- `JWT_AUDIENCE` — JWT audience (default `booknook`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `IMGBB_API_KEY` — ImgBB API key for cover uploads
- `CLIENT_URL` — frontend origin allowed by CORS

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```

## API endpoints

### Books

- `GET /api/books` — list all books (newest first)
- `GET /api/books/:id` — get one book
- `POST /api/books` — create book (JWT protected)
- `PATCH /api/books/:id` — update book (JWT protected, owner only)
- `DELETE /api/books/:id` — delete book (JWT protected, owner only)

### Borrows

- `POST /api/borrows` — create borrow (JWT protected, checks availability + duplicates)
- `GET /api/borrows` — list borrows for the authenticated user (JWT protected)
- `DELETE /api/borrows/:id` — return a borrow (JWT protected, owner only)

### Auth (Better Auth)

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET /api/auth/get-session`
- `GET /api/auth/jwks` — JSON Web Key Set used by Express to verify JWTs

### Images

- `POST /api/upload` — upload an image (base64) to ImgBB, returns `{ imageUrl }`

## Authentication / JWT explanation

1. Better Auth manages users and issues sessions.
2. The Better Auth JWT plugin signs session JWTs (issuer/audience/expiry configured).
3. Express uses the JWKS endpoint (`createRemoteJWKSet` from `jose`) to verify the Bearer token signature, issuer, audience and expiry.
4. Private API routes use the `requireAuth` middleware; protected book routes additionally check ownership.

## MongoDB setup

See `MONGODB-IMPORT-GUIDE.md` for importing `seed-books.json`.

## Image upload

Cover images are uploaded to ImgBB through the backend using `IMGBB_API_KEY`. The API key must never be exposed to the frontend.

## Error handling

Central error handler returns consistent JSON errors and does not leak stack traces.
