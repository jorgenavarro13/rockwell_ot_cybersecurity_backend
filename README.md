# Rockwell Automation OT Cybersecurity Backend

REST API backend for the Rockwell Automation OT Cybersecurity Educative Platform — a gamified learning environment for industrial OT security concepts.

**Authors:**
- Jorge Arturo Montiel Navarro | A01278612
- Francisco Nassif Membrive | A01831673
- Ian
- Daniel

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| Node.js | ≥18 (ESM) | Runtime |
| Express | 5.2.1 | Web framework |
| PostgreSQL | — | Database (Aiven Cloud) |
| postgres | 3.4.8 | PostgreSQL client (native queries) |
| jsonwebtoken | 9.0.3 | JWT generation and verification |
| argon2 | 0.44.0 | Password hashing |
| zod | 4.3.6 | Schema validation |
| cookie-parser | 1.4.7 | Cookie parsing |
| cors | 2.8.6 | CORS middleware |
| morgan | 1.10.1 | HTTP request logging |
| dotenv | 17.3.1 | Environment variable loading |

---

## Project Structure

```
rockwell_ot_cybersecurity_backend/
│
├── server-with-postgre.js          # Entry point — instantiates DB model and starts app
├── app.js                          # Express app factory, middleware stack, route mounting
├── package.json
│
├── controllers/
│   ├── rockwell.js                 # RockwellController — user auth, CRUD, ranking
│   └── AdminController.js          # AdminController — admin dashboard
│
├── routes/
│   └── rockwell.js                 # All HTTP route definitions (public + admin)
│
├── models/
│   └── postgre/
│       ├── db.js                   # PostgreSQL connection (postgres library)
│       ├── rockwell.js             # RockwellModel — all database queries
│       ├── seeding.js              # Seed runner
│       ├── rockwell-declaration.sql
│       ├── storeProcedures.sql
│       ├── triggers.sql
│       ├── functions.sql
│       └── seeds/
│           ├── contries_seed.js
│           ├── roles_seed.js
│           └── typeUsers_seed.js
│
├── middlewares/
│   ├── tokenParser.js              # JWT extraction from cookie → req.session.user
│   └── cors.js                     # CORS allowlist middleware
│
├── schemas/
│   └── users.js                    # Zod schemas and validation functions
│
├── services/
│   └── authService.js              # Argon2 password hash and verify
│
└── helpers/
    └── updateMissingFieldsRegister.js  # Stored procedure calls for optional user fields
```

---

## Architecture: MVC

This project follows the MVC pattern adapted for a JSON API (no HTML views).

```
HTTP Request
     │
     ▼
middlewares/cors.js          ← CORS policy
middlewares/tokenParser.js   ← JWT → req.session.user
     │
     ▼
routes/rockwell.js           ← Route dispatcher (maps method+path to controller)
     │
     ▼
controllers/rockwell.js      ← Business logic, validation, response formatting
     │
     ▼
models/postgre/rockwell.js   ← Data access (parameterized SQL queries)
     │
     ▼
PostgreSQL (Aiven)
```

### Model — `models/postgre/rockwell.js`
`RockwellModel` is a class of static methods. It owns all database interaction. Controllers receive the model via constructor injection (`{ model }`), which makes testing and swapping implementations straightforward.

### Controller — `controllers/rockwell.js` + `controllers/AdminController.js`
Controllers validate input with Zod, call model methods, and format HTTP responses. They never write SQL directly.

### Routes — `routes/rockwell.js`
Routes wire HTTP verbs and paths to controller methods. They contain no logic.

---

## Authentication — JWT + HTTP-only Cookie

Authentication is stateless and token-based.

### Flow

1. Client sends `POST /login` (or `POST /register`) with credentials.
2. Server verifies credentials (Argon2 hash comparison via `services/authService.js`).
3. On success, server generates a JWT and sets it as an HTTP-only cookie.
4. Every subsequent request carries the cookie automatically.
5. `middlewares/tokenParser.js` runs on every request, verifies the token, and populates `req.session.user`.

### JWT Payload

```json
{
  "username": "User's display name",
  "role": 1,
  "user_id": 42
}
```

- `role` is the integer role ID from the database.
- `expiresIn`: 1 hour.
- Signed with `SECRET_JWT_KEY` from environment.

### Cookie Settings

| Setting | Development | Production |
|---|---|---|
| `httpOnly` | `true` | `true` |
| `secure` | `false` | `true` |
| `sameSite` | `lax` | `none` |
| `maxAge` | 3 600 000 ms (1 h) | 3 600 000 ms (1 h) |

`httpOnly: true` prevents client-side JavaScript from accessing the token, mitigating XSS token theft.

---

## Session Management

Sessions are stateless — there is no server-side session store. The JWT cookie is the entire session.

| Endpoint | Method | Description |
|---|---|---|
| `/session` | GET | Returns `{ activeSession, username, isAdmin }` based on current cookie |
| `/logout` | POST | Clears the `token` cookie |

The `tokenParser` middleware initializes `req.session = { user: null }` on every request. If the cookie contains a valid, non-expired JWT, `req.session.user` is populated with the decoded payload. Controllers use `req.session.user` to determine whether a request is authenticated and what role the caller has.

---

## Validation Layer — Zod

All user input is validated with Zod before reaching the database layer.

**File:** `schemas/users.js`

### Registration Schema (`validateUser`)

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | — |
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | — |
| `typeOfUser` | enum | Yes | `Employee` \| `Client` \| `Not related` |
| `country` | object | No | `{ code, name, flag: url }` |
| `phone` | string | No | max 13 chars |
| `company` | string | No | — |
| `birthday` | string | No | ISO date (`YYYY-MM-DD`) |

`validateUser()` strips null/empty optional fields before parsing to avoid Zod rejecting explicitly-passed empty strings.

### Login Schema (`validatePartialUser`)

Uses `.partial()` on the same schema — accepts any subset of fields, used to extract and validate `email` and `password` at login.

---

## Access Control

Role-based access control is enforced via the JWT `role` claim, compared against the admin role ID fetched from the database via the `get_admin_role()` PostgreSQL function.

### How admin check works

```
GET /session
  → tokenParser decodes JWT into req.session.user
  → RockwellController.session() calls model.getAdminRoleId()
  → Compares req.session.user.role === adminRoleId
  → Returns { isAdmin: true/false }
```

The `/admin/dashboard` endpoint is mounted on the `/admin` prefix. Controllers are expected to verify `req.session.user` and role before returning sensitive data.

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user, returns JWT cookie |
| POST | `/login` | No | Authenticate user, returns JWT cookie |
| POST | `/logout` | Yes | Clears JWT cookie |
| GET | `/session` | Optional | Returns current session info |
| GET | `/user` | No | List all users (optional `?type=` filter) |
| GET | `/user/:id` | No | Get user by ID |
| GET | `/check-email` | No | Check if email is taken (`?email=`) |
| GET | `/ranking` | No | Get users ranked by score |
| GET | `/admin/dashboard` | Admin | Dashboard statistics |

---

## Database

**Provider:** Aiven Cloud (managed PostgreSQL)
**Connection:** SSL required, via `SERVICE_URI` connection string.

### Key database objects

| Object | Type | Purpose |
|---|---|---|
| `users` | Table | User accounts |
| `matches` | Table | Game session records with scores |
| `countries` | Table | Country reference data |
| `type_users` | Table | User type classifications |
| `companies` | Table | Company reference data |
| `roles` | Table | Role definitions |
| `insert_user_country` | Stored Procedure | Associates user with a country |
| `insert_user_birthday` | Stored Procedure | Sets user birthday |
| `insert_user_phone` | Stored Procedure | Sets user phone |
| `get_admin_role` | Function | Returns the admin role ID |

All queries use parameterized template literals via the `postgres` library — no string concatenation, no SQL injection risk.

---

## Environment Variables

Create a `.env` file at the project root with the following variables:

```env
# PostgreSQL (Aiven)
PORT=25123
HOST=your-db-host.aivencloud.com
DATABASE=defaultdb
USER=avnadmin
PASSWORD=your_password

# Full connection string (used by db.js)
SERVICE_URI=postgres://user:password@host:port/database?sslmode=require

# Application
LOCALPORT=3000

# JWT
SECRET_JWT_KEY=your_secret_key_here
```

> Never commit `.env` to version control. It is listed in `.gitignore`.

---

## How to Run

### Prerequisites

- Node.js 18 or later
- Access to a PostgreSQL database (Aiven or local)
- SSL certificate (`ca.pem`) if using Aiven — place it in `models/postgre/`

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/jorgenavarro13/rockwell_ot_cybersecurity_backend.git
cd rockwell_ot_cybersecurity_backend

# 2. Install dependencies
npm install

# 3. Create and fill the .env file
cp .env.example .env   # or create manually — see Environment Variables section above

# 4. (Optional) Seed the database
node models/postgre/seeding.js

# 5. Start the development server (with file watching)
npm run dev
```

The server will start at `http://localhost:3000` (or the port set in `LOCALPORT`).

### Available npm scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `node --watch server-with-postgre.js` | Start with auto-restart on file changes |
