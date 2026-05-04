# 🎯 Target TestZone — Backend

<div align="center">

  <img src="https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

</div>

<br />

> The REST API server for Target TestZone. Built with **Node.js + Express** and **MongoDB (Mongoose)**, it handles authentication, test management, submission scoring, student approval workflows, and admin operations.

---

## 📁 Folder Structure

```
backend/
├── models/
│   ├── User.js           # Student/Admin schema (role, status, studentId, avatar)
│   ├── Test.js           # Test schema (type, durationSeconds, liveAt, liveUntil)
│   ├── Question.js       # Question schema (subject, options, image, solution)
│   └── Submission.js     # Submission schema (answers, subjectScores, timeTaken)
│
├── routes/
│   ├── auth.js           # POST /register, /login, /google
│   ├── users.js          # GET|PUT /me, GET /me/submissions
│   ├── tests.js          # GET /, GET /:id/questions, POST /:id/submit
│   └── admin.js          # Student approval, test CRUD, question import, stats
│
├── middleware/
│   └── authMiddleware.js # JWT verification middleware
│
├── scripts/
│   ├── makeAdmin.js      # CLI: promote user to admin by email
│   ├── seedMHT.js        # CLI: seed 150 MHT-CET questions into DB
│   └── seedData/
│       ├── physics.js    # 50 Physics questions
│       ├── chemistry.js  # 50 Chemistry questions
│       └── maths.js      # 50 Mathematics questions
│
├── .env                  # Environment variables (DO NOT commit to GitHub)
├── index.js              # Express entry point
└── package.json
```

---

## ⚙️ Setup & Installation

**1. Install dependencies**
```bash
npm install
```

**2. Create `.env` file**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/target_testzone
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**3. Start the server**
```bash
node index.js
```

API runs at → **http://localhost:5000**

---

## 🌱 Database Seeding

Populate the database with 150 MHT-CET mock questions:

```bash
node scripts/seedMHT.js
```

Output:
```
✅ Connected to MongoDB
📝 Created test: MHT-CET Mock Test 1 [<id>]
✅ Inserted 150 questions (50 Physics + 50 Chemistry + 50 Maths)
🎉 Seed complete!
```

---

## 👑 Promote a User to Admin

```bash
node scripts/makeAdmin.js your-email@example.com
```

---

## 🔗 API Reference

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/register` | `{ name, email, password }` | Register new student |
| POST | `/login` | `{ email, password }` | Login, returns JWT |
| POST | `/google` | `{ credential }` | Google OAuth login |

---

### 👤 Users — `/api/users` *(JWT required)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get logged-in user profile |
| PUT | `/me` | Update name, phone, targetExam, avatar |
| GET | `/me/submissions` | Get all past test submissions |

---

### 📝 Tests — `/api/tests` *(JWT + Approved required)*

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | `/` | List all active tests |
| GET | `/:id/questions` | Get questions (checks live window) |
| POST | `/:id/submit` | Submit answers, returns score |
| GET | `/submission/:id` | Get detailed submission |

---

### 📚 Practice — `/api/practice` *(JWT required)*

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | `/subjects` | List distinct subjects |
| GET | `/:subject/chapters` | List chapters for a subject |
| GET | `/:subject/:chapter/questions` | Get shuffled practice questions (max 20) |

---

### 🔔 Notifications — `/api/notifications` *(JWT required)*

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | `/` | Get my notifications + unread count |
| PUT | `/:id/read` | Mark one as read |
| PUT | `/read-all` | Mark all as read |

---

### 🛡️ Admin — `/api/admin` *(JWT + Admin role required)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform statistics |
| GET | `/users` | All non-admin users |
| PUT | `/users/:id/approve` | Approve & assign Student ID |
| PUT | `/users/:id/reject` | Reject student |
| POST | `/tests` | Create a new test |
| POST | `/tests/:id/questions/import` | Bulk import questions (JSON array) |

---

## 📋 Data Models

### User
```js
{ name, email, password, googleId, phone, targetExam,
  role: 'student' | 'admin',
  status: 'pending' | 'approved' | 'rejected',
  studentId: String,   // e.g. TZ-2025-001 (assigned by admin)
  avatar: String       // base64 or URL
}
```

### Test
```js
{ title, type, durationSeconds, subjects,
  totalQuestions, liveAt, liveUntil, isActive }
```

### Question
```js
{ testId, subject, text,
  questionImage: String | null,
  options: [String], correctOptionIndex,
  solutionText, marks, negativeMarks }
```

### Submission
```js
{ userId, testId,
  answers: [{ questionId, selectedOptionIndex, timeSpentSeconds }],
  totalScore, subjectScores, timeTakenSeconds }
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth |
| `google-auth-library` | Google OAuth verification |
| `cors` | Cross-Origin Resource Sharing |
| `dotenv` | Environment variable loader |

---

## 🔒 Security Notes

- JWT tokens expire in **7 days**
- Passwords hashed with **bcryptjs** (10 salt rounds)
- Admin routes: **JWT + role check**
- Student test routes: **JWT + approved status + live window check**
- Never commit `.env` — add it to `.gitignore`

---

> 📌 Frontend runs at `http://localhost:5173` and makes API calls to this server.
