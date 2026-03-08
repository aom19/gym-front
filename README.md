# Gym Frontend (Auth)

Frontend auth project built with Next.js (App Router), TypeScript, Tailwind CSS, Shadcn-style UI components, React Query, Axios, and Zustand.

## Implemented Pages

- `/auth/login` - login form (`email`, `password`)
- `/auth/register` - register form (`email`, `password`, `role` dropdown: `ADMIN`/`TRAINER`)
- `/auth/forgot-password` - forgot password form (`email`)

## Implemented Structure

```text
src/
├─ app/auth/
│  ├─ login/page.tsx
│  ├─ register/page.tsx
│  ├─ forgot-password/page.tsx
│  └─ components/AuthForm.tsx
├─ components/ui/
│  ├─ InputField.tsx
│  └─ Button.tsx
├─ services/api.ts
├─ services/auth.ts
├─ hooks/useAuth.ts
└─ store/useStore.ts
```

## API Integration

- `loginUser(email, password)` -> `POST /auth/login`
- `registerUser(email, password, role)` -> `POST /auth/register`
- `forgotPassword(email)` -> `POST /auth/forgot-password`

Set backend base URL in `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Forms are reusable through `AuthForm`.
- Toast feedback is provided by `react-hot-toast`.
- Auth tokens are persisted in Zustand store.
