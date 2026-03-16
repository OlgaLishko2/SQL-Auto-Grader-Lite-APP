# SQL Auto-Grader Lite

A web-based educational platform for learning SQL through hands-on practice. SQL runs entirely in the browser using SQLite WASM — no server-side database required. Students get instant automated feedback by comparing their query results against hidden reference solutions.

---

## Tech Stack

- **React 19** — UI framework
- **Firebase** — Authentication (email/password) + Firestore (user data, datasets)
- **sql.js** — SQLite compiled to WebAssembly, runs SQL in the browser
- **react-router-dom v7** — Client-side routing
- **react-data-table-component** — Data tables for assignments, quizzes, results
- **CRACO** — Create React App config override (for WASM support)
- **Font Awesome 5** — Icons

---

## Features

### Authentication
- Register as **student** or **teacher**
- Email verification required before login
- Firebase Auth + Firestore stores user profile (name, email, role)

### Student Dashboard
- **Assignments** — View and start SQL assignments with status tracking (New / In Progress / Completed)
- **Quizzes** — View quiz list with status
- **Results** — View grades, marks, percentage, pass/fail per assignment and quiz
- **SQL Tester** — Run SELECT queries against real datasets directly from the dashboard
- **Anti-cheat system** — Disables copy/paste, right-click, text selection; detects tab switching and window blur during assignments

### Teacher Dashboard
- **Datasets** — Create and manage datasets and tables stored in Firestore
  - Create datasets
  - Create tables with custom schema (column name, type, nullable, primary/foreign key)
  - Fetch and view table data
  - Insert rows via raw SQL (`INSERT INTO ...`)

### Shared
- Responsive navbar with hamburger menu on mobile
- Role-based sidebar navigation (student vs teacher)
- Shared dashboard home with summary cards

---

## Database Architecture

Datasets are **not** stored as physical `.sqlite` files. Instead:
- Dataset schemas and seed data are defined as SQL queries in `db-config.json`
- On first run, this config is uploaded to Firestore (`sqliteConfigs/mainConfig`)
- On each app load, `loadSqliteData()` fetches the config from Firestore and builds **in-memory SQLite databases** using `sql.js`
- Teachers can add new datasets/tables dynamically — changes are saved back to Firestore

---

## Project Structure

```
src/
├── components/
│   ├── bars/               # Navbar, Footer
│   ├── comparison/         # SQL result comparison logic
│   ├── db/
│   │   ├── dbTest.js       # SQL Tester component
│   │   ├── queryValidation.js  # SELECT-only enforcement + query normalization
│   │   ├── sqlOperations.js    # runSelectQuery helper
│   │   ├── useDatabase.js      # Hook: loads all DBs from Firestore
│   │   ├── service/        # AppContext (global DB state), setupDatabases
│   │   └── setup/          # Firebase DB setup, db-config.json
│   ├── hooks/              # useAntiCheat hook
│   └── model/              # Data models (assignments, questions)
│
├── pages/
│   ├── home/               # Landing page
│   ├── about/              # About page
│   ├── login/              # Login page
│   ├── register/           # Register page (email verification)
│   ├── profile/            # User profile page
│   └── dashboard/
│       ├── layout/         # Dashboard shell (sidebar + topbar + outlet)
│       ├── leftmenu/       # Sidebar navigation
│       ├── topbar/         # Top bar with user avatar
│       ├── Dashboard.js    # Shared dashboard home (role-aware cards + SQL Tester)
│       ├── CardDashboard.js
│       ├── student/
│       │   ├── assignments/  # Assignments list + anti-cheat assignment detail
│       │   ├── quizzes/      # Quizzes list
│       │   └── results/      # Results table
│       └── teacher/
│           └── datasets/     # Dataset & table manager (DatabaseManager)
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (required to run the development toolchain — not needed at runtime)
- A Firebase project with Authentication and Firestore enabled

### Install
```bash
npm install
```

### Configure Firebase
Create a `.env` file in the project root:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Run
```bash
npm start
```

---

## Routes

| Path | Access | Component |
|---|---|---|
| `/` | Public | Home |
| `/about` | Public | About |
| `/register` | Public | Register |
| `/login` | Public | Login |
| `/dashboard` | Protected | Dashboard (role-aware) |
| `/dashboard/assignments` | Student | Assignments list |
| `/dashboard/assignments/:id` | Student | Assignment detail (anti-cheat) |
| `/dashboard/quizzes` | Student | Quizzes list |
| `/dashboard/results` | Student | Results |
| `/dashboard/datasets` | Teacher | Dataset manager |
| `/dashboard/profile` | Both | Profile |

---

## Anti-Cheat System

During assignments, `useAntiCheat` hook:
- Disables text selection
- Blocks copy and paste events
- Detects tab switching (`visibilitychange`)
- Detects window blur (switching apps)
- Disables right-click context menu
- Logs each violation with a timestamp
