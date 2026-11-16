# Mini Project Manager

Next.js app for signing in and managing your own projects and tasks. It talks to the NestJS API with Redux Toolkit and RTK Query.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

`NEXT_PUBLIC_API_URL` must include the `/api/v1` prefix, for example `http://localhost:3001/api/v1`.

Demo account after the API seed: `ava@demo.com` / `Demo1234`.

## Production

```bash
npm install
npm run build
npm start
```

Set `NEXT_PUBLIC_API_URL` to the deployed API, including `/api/v1`, before the build. The API must allow this site's origin in `CLIENT_ORIGIN`.
