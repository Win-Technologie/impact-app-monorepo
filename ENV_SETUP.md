# Environment Setup (Backend + Frontend)

Each developer keeps personal values in local `.env` files.
Only `.env.example` files are versioned in git.

## First-time setup

### Backend
1. Copy `Backend/.env.example` to `Backend/.env`
2. Fill in your own secrets and local values

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env`
2. Update `EXPO_PUBLIC_API_URL` and `HOST_URL` for your machine

## Daily workflow
- Update local `.env` values as needed
- Do not commit `.env`
- If a new variable is needed by code, add it to both:
  - your local `.env`
  - matching `.env.example` template with a placeholder value

## Security
If secrets were ever committed before, rotate them (database, API keys, JWT, mail password, etc.).
