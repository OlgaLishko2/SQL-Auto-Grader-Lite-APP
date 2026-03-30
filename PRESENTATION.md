# SQL Auto-Grader Lite — Presentation Guide

---

## Team
- Volha Lishko (Ola)
- Sreyasi Munshi
- Fatemeh Hosseini
- Tham Nguyen
- Rupinder Kaur

*Women in Tech Program — Making Changes Association*

---

## Slide 1 — Title
**SQL Auto-Grader Lite**
*A free, browser-based SQL learning & automated grading platform*

---

## Slide 2 — Roadmap
1. Problem Statement
2. Our Solution
3. Tech Stack
4. Architecture
5. Features Walkthrough
6. Challenges & How We Solved Them
7. What We Learned
8. Future Enhancements
9. Live Demo
10. Q&A

---

## Slide 3 — Problem Statement
- SQL is essential for tech careers — but learning it is expensive and slow
- Traditional platforms need **server-side databases** → high cost, complex setup
- Students wait for **manual grading** → slow feedback loop
- Non-profits like Making Changes Association can't afford enterprise tools
- **The gap:** No free, scalable, instant-feedback SQL platform exists for community programs

---

## Slide 4 — Our Solution
**SQL Auto-Grader Lite** — runs entirely in the browser, zero server cost

- ✅ SQL executes in the **browser** via SQLite WebAssembly
- ✅ **Instant automated grading** — compares result sets, not query text
- ✅ Free forever — no database hosting fees
- ✅ Built for the **Women in Tech Program** at Making Changes Association

---

## Slide 5 — Tech Stack
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Firebase Auth + Firestore | Authentication & data storage |
| sql.js (SQLite WASM) | In-browser SQL execution |
| Web Worker | Background thread for SQL (no UI freeze) |
| Bootstrap | Responsive styling |
| EmailJS | Assignment notification emails |
| Netlify | Deployment & hosting |

---

## Slide 6 — Architecture
- **No backend server** — React app hosted on Netlify
- SQL runs in a **Web Worker** → isolated thread, 5s timeout, no UI freeze
- Datasets stored as SQL config in **Firestore** → built in-memory on load
- **Firebase Auth** handles login, email verification, role assignment
- **Firestore security rules** enforce attempt limits and data access

---

## Slide 7 — Features: Teacher
- Register as teacher → create cohorts of students
- Build multi-step assignments: title, questions, cohort assignment
- Per-question settings: difficulty, max attempts, marks, order matters, alias strict
- View submission status per student → override marks
- Email notifications on publish & student submission

---

## Slide 8 — Features: Student
- View active assignments & submitted assignments (separate tabs)
- **Anti-cheat system**: fullscreen prompt, no copy/paste, tab-switch detection
- SQL editor with syntax highlighting & autocomplete
- Run query → instant result comparison → correct/incorrect feedback
- Track marks and percentage per assignment

---

## Slide 9 — Challenges & How We Solved Them

**Challenge 1: Running SQL in the browser**
- Problem: No backend — how do we execute real SQL?
- Solution: Used **sql.js** (SQLite compiled to WebAssembly) inside a **Web Worker** so queries run in a background thread without freezing the UI

**Challenge 2: Grading by result, not by text**
- Problem: Two correct queries can look completely different
- Solution: Built a **canonical result comparison engine** — normalizes column names to lowercase, compares rows as a multiset (order-independent unless configured), case-insensitive string matching

**Challenge 3: CSS breaking on Netlify but not locally**
- Problem: Bootstrap's global CSS overrode our custom styles in production due to different CSS injection order
- Solution: Moved all CSS custom variables to `:root` and scoped component class names under parent selectors to guarantee specificity

**Challenge 4: Fullscreen API blocked by browser**
- Problem: `requestFullscreen()` called on page load threw a browser error — browsers only allow it from a user gesture
- Solution: Replaced auto-request with a sticky banner prompting the student to click "Enter Fullscreen" — triggered by user interaction

**Challenge 5: Firebase security vs. client-side grading**
- Problem: Grading happens in the browser — how do we prevent students from faking `is_correct = true`?
- Solution: Firestore security rules enforce that students can only **create** attempts with `is_correct = false` — only the grading logic running in their browser can set it to true after comparison

**Challenge 6: Datasets without a server**
- Problem: Can't bundle `.sqlite` files and serve them from a backend
- Solution: Stored dataset schemas and seed data as SQL statements in Firestore — fetched on load and built as **in-memory SQLite databases** using sql.js

---

## Slide 10 — What We Learned
- WebAssembly enables real database execution in the browser
- Firebase security rules are powerful enough to replace a backend for access control
- Agile sprints with Scrum Master rotation kept the team accountable
- CSS specificity and build-time differences between dev and production
- Anti-cheat in web apps requires working with browser APIs carefully

---

## Slide 11 — Future Enhancements

| Enhancement | Description |
|---|---|
| **AI Query Hints** | Use AI to give students hints when their query is wrong |
| **More Datasets** | Add real-world datasets (healthcare, finance, e-commerce) |
| **Query Explanation** | Show students *why* their query failed — highlight result set differences visually |
| **Leaderboard** | Gamify learning with class rankings and badges |
| **Mobile App** | React Native version for on-the-go SQL practice |
| **LMS Integration** | Connect with Moodle or Canvas for grade export |
| **Multi-language Support** | Support French, Spanish for broader accessibility |
| **Offline Mode** | Full PWA support — practice without internet |
| **Advanced Analytics** | Teacher dashboard with class-wide performance charts |
| **Peer Review** | Students review each other's queries with guided rubrics |

---

## Slide 12 — Live Demo
Suggested flow:
1. Teacher logs in → creates assignment → publishes to cohort
2. Student receives email → opens assignment → writes SQL → submits
3. Teacher views submission status → sees marks

---

## Slide 13 — Q&A
Each member answers questions for their area:

| Member | Area |
|---|---|
| **Rupinder** | Authentication & Firebase setup |
| **Volha (Ola)** | Student frontend & SQL editor |
| **Sreyasi** | Assignment creation & teacher dashboard |
| **Tham** | Anti-cheat & submission workflow |
| **Fatemeh** | Grading engine, datasets & architecture |

*"SQL Auto-Grader Lite — making SQL education free, instant, and accessible for everyone."*

---

## Visual Theme Guide

### Color Palette
| Role | Hex |
|---|---|
| Primary background (dark navy) | `#0F172A` |
| Accent (electric blue) | `#4A76C5` |
| Success green | `#1F9D55` |
| Slide body background | `#F1F5F9` |
| Text on dark | `#FFFFFF` |
| Subtitles / captions | `#94A3B8` |

### Typography
- Headings: **Poppins Bold** or **Inter Bold**
- Body: **Inter Regular** or **Roboto**
- Code: **Fira Code** or **JetBrains Mono**

### Layout
- Title slides → dark navy background + white text + blue accent line
- Content slides → light surface background + dark navy text + blue headers
- Challenge slides → split layout: dark left (problem) / light right (solution)
- Demo slide → full dark background with browser screenshot

### Recommended Tools
- [Canva](https://canva.com) — search "dark tech presentation"
- [Google Slides](https://slides.google.com) — free & collaborative
- [Beautiful.ai](https://beautiful.ai) — auto-layouts, polished look
