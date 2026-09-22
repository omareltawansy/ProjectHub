# ProjectHub

ProjectHub is a React application for managing student projects, portfolios, and
internships across four roles: students, instructors, employers, and admins.
Each role gets its own dashboard for tracking projects, tasks, applications,
messages, and notifications.

## Frontend-only project

This is a **frontend-focused demo/prototype**, not a production app with a real
backend. There is no server or database — all data (users, projects,
portfolios, internships, etc.) lives in `src/data/appData.js` and is persisted
to the browser's `localStorage` via the `useAppData` hook. Things like
authentication, password resets, and file uploads are mocked for the purposes
of demonstrating the UI/UX, not built to production security standards.

## Getting started

```bash
npm install
npm start
```

This runs the app in development mode at [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm start` — run the dev server
- `npm run build` — create a production build
- `npm test` — run tests
