# Authentication System — Node.js + Express + MongoDB

A production-ready authentication backend built with clean architecture — covering everything from user registration and JWT-based auth to email verification, password reset, and rate limiting.

---

## Architecture

```
├── config/         # DB connection & environment setup
├── controller/     # Auth logic (register, login, logout, reset)
├── middleware/     # JWT verification, auth guards
├── model/          # Mongoose User schema
├── routes/         # API route definitions
├── services/       # Email service (Nodemailer)
└── utils/          # Helper functions & token utilities
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Security | express-rate-limit, cookie-parser |
| Config | dotenv |

---

## Features

- User Registration with hashed passwords (bcrypt)
- Login with JWT token issued via HTTP-only cookie
- Protected routes using custom auth middleware
- Email verification on signup (Nodemailer)
- Forgot password & reset password flow via email token
- Rate limiting on auth endpoints to prevent brute force attacks
- Clean separation of concerns — controller / service / middleware / utils layers

---

## API Endpoints

### Auth Routes

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login & receive JWT cookie
POST   /api/auth/logout            Clear auth cookie
GET    /api/auth/verify-email      Verify email via token
POST   /api/auth/forgot-password   Send password reset email
POST   /api/auth/reset-password    Reset password via token
GET    /api/auth/me                Get current user (protected)
```

---

## JWT Flow

```
Client
  │
  ├── POST /login  ──────────────────► Server
  │                                      │
  │                                  Verify credentials
  │                                      │
  │                                  Sign JWT
  │                                      │
  │◄── Set-Cookie: token=<jwt> ─────────┘
  │
  ├── GET /protected (cookie auto-sent)
  │
  │                              Middleware verifies JWT
  │                                      │
  │◄── 200 OK + protected data ─────────┘
```

---

## Password Reset Flow

```
User → POST /forgot-password
         │
         ├── Generate reset token (JWT / crypto)
         ├── Save hashed token to DB
         └── Send email with reset link (Nodemailer)

User clicks link → POST /reset-password
         │
         ├── Validate token
         ├── Hash new password (bcrypt)
         └── Update DB + invalidate token
```

---

## Security Practices

- Passwords hashed using `bcrypt` (never stored in plain text)
- JWT stored in HTTP-only cookie (not accessible via `document.cookie`)
- Auth endpoints protected with `express-rate-limit` — limits brute force attempts
- Environment variables managed via `dotenv` (no secrets in codebase)
- Token expiry enforced on both access tokens and reset tokens

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/junaid1506/Authentication.git
cd Authentication

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, EMAIL credentials

# Start development server
npm start
```

### .env Variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

---

## Author

**Mohammad Junaid** — Full Stack MERN Developer  
[GitHub](https://github.com/junaid1506) · [Portfolio](https://portfolio-junaids-projects-006ff7f4.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/mohammad-junaid-a13275319/)
