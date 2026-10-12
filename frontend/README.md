# Finance Manager frontend — Phase 1

React, Vite, TypeScript, Tailwind CSS, React Router, and Axios.

## Run locally

1. Start the Spring Boot backend on `http://localhost:8080`.
2. In this directory, copy `.env.example` to `.env` if you need a different backend URL.
3. Run `npm install`, then `npm run dev`.

Vite forwards `/api` requests to `VITE_BACKEND_URL`. The app expects the backend at port 8080 by default. For a production deployment, set `VITE_API_BASE_URL` to the API base URL (including `/api` if needed), and configure CORS in Spring Security if the frontend and backend use different origins. The current backend has no CORS configuration. Same-origin deployments do not need it.

## Authentication contract

- Registration: `POST /api/users` with `{ name, email, password }`. Returns the created user with HTTP 201; it does not issue a token.
- Login: `POST /api/auth/login` with `{ email, password }`. Returns `{ token, userId, name, email }`.
- Authenticated backend requests use `Authorization: Bearer <token>`.
- Duplicate email returns HTTP 409; invalid credentials return HTTP 401; request validation returns HTTP 400 with a `message` field.

The JWT and user profile are kept in `sessionStorage`, so they are scoped to the current browser tab session and cleared on sign-out. Browser storage is readable by JavaScript, so production deployments should use HTTPS and protect against script injection. A same-origin HttpOnly cookie would provide stronger token isolation, but the backend currently returns a bearer token in JSON and does not implement that cookie flow.

## Phase 1 scope

The login and registration forms call the real backend. The authenticated landing page confirms the signed-in identity without displaying fabricated financial data. Route protection and sign-out are client-side; the backend remains responsible for authorization on every protected API request. The backend issues JWTs for one hour and currently exposes no refresh or logout endpoint.
