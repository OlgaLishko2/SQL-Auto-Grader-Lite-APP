# SQL Auto-Grader Lite

A web-based educational platform for learning SQL through hands-on practice. SQL runs entirely in the browser using SQLite WASM — no server-side database required. Students get instant automated feedback by comparing their query results against hidden reference solutions.

---

## Tech Stack

- **React 19** — UI framework
- **Firebase** — Authentication (email/password) + Firestore (user data, assignments, questions)
- **sql.js** — SQLite compiled to WebAssembly, runs SQL in the browser
- **react-router-dom v7** — Client-side routing
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
- **Anti-cheat system** — Disables copy/paste, right-click, text selection; detects tab switching and window blur during assignments

### Teacher Dashboard
- **Datasets** — Create and manage datasets and tables stored in Firestore
- **Cohorts** — Group students into cohorts (Beginner, Intermediate, Advanced)
- **Assignments** — Create multi-step assignments with:
  - Title, description, total marks, due date
  - Assign to a student cohort
  - Add questions with preset SQL questions or custom ones
  - Per-question settings: difficulty, max attempts, order matters, alias strict
  - Shared SQL code editor (fixed on right) to test queries while building questions
- **Edit Questions** — Expand any assignment to edit its questions inline

---

## Database Architecture

Datasets are **not** stored as physical `.sqlite` files. Instead:
- Dataset schemas and seed data are defined as SQL queries in `src/data/db-config.json`
- On first run, this config is uploaded to Firestore (`sqliteConfigs/mainConfig`)
- On each app load, the config is fetched from Firestore and builds **in-memory SQLite databases** using `sql.js`
- Teachers can add new datasets/tables dynamically — changes are saved back to Firestore

---

## Project Structure

```
src/
├── data/                       # DEV ONLY seed files (remove before production push)
│   ├── devSeed.js              # All seed functions — delete this before pushing to GitHub
│   ├── seedData.json           # Sample cohorts, assignments, questions
│   ├── questions.json          # Preset SQL questions with difficulty levels
│   └── db-config.json          # SQLite schema + seed data for in-browser databases
│
├── components/
│   ├── bars/                   # Navbar, Footer
│   ├── comparison/             # SQL result comparison logic
│   ├── db/
│   │   ├── sqlTest.js          # SQL Tester component
│   │   ├── queryValidation.js  # SELECT-only enforcement + query normalization
│   │   ├── service/            # AppContext (global DB state), setupDatabases
│   │   └── setup/              # Firebase DB setup
│   ├── hooks/                  # useAntiCheat hook
│   └── model/                  # Firestore data models (assignments, questions, cohorts, presetQuestions)
│
├── pages/
│   ├── home/
│   ├── about/
│   ├── login/
│   ├── register/
│   ├── profile/
│   └── dashboard/
│       ├── layout/             # Dashboard shell (sidebar + topbar + outlet)
│       ├── leftmenu/           # Sidebar navigation
│       ├── topbar/             # Top bar
│       ├── Dashboard.js        # Dashboard home (seed buttons for dev, role-aware cards)
│       ├── student/
│       │   ├── assignments/    # Assignments list + anti-cheat detail
│       │   ├── quizzes/
│       │   └── results/
│       └── teacher/
│           ├── assignmentform/ # AssignmentForm (multi-step) + AssignmentList
│           ├── cohorts/        # CohortManager
│           ├── createquestionset/ # CreateQuestionSet with fixed code editor
│           └── datasets/       # DatabaseManager
```

---

## Getting Started

### Prerequisites
- Node.js 18+
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

### First-Time Setup (Dev Only)
Log in as a teacher and use the buttons on the Dashboard:
1. **Seed Sample Data** — loads cohorts, assignments, and preset questions into Firestore
2. **Upload Dataset Config** — uploads the SQLite schema to Firestore so databases load in-browser

> Before pushing to GitHub: delete `src/data/devSeed.js` and remove the 2 marked `DEV ONLY` lines in `Dashboard.js`

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
| `/dashboard/assignments` | Teacher | Assignment list + create form |
| `/dashboard/cohorts` | Teacher | Cohort manager |
| `/dashboard/datasets` | Teacher | Dataset manager |
| `/dashboard/profile` | Both | Profile |

---

## Anti-Cheat System

During assignments, `useAntiCheat` hook:
- Disables text selection, copy, and paste
- Detects tab switching (`visibilitychange`) and window blur
- Disables right-click context menu
- Logs each violation with a timestamp
