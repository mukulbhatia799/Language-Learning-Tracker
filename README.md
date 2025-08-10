# 🌐 Language Learning Tracker

A full-stack web application to help learners practice, track progress, and interact with tutors.  
Learners can take AI-generated MCQ tests, make notes, ask doubts from tutors or AI, and monitor their progress through a heatmap graph.  
Tutors can create/manage tests, view submissions, answer learner doubts, and track learner engagement.

---

## ✨ Features

### For Learners
- 📚 **AI-Powered Tests** — Take MCQ-based language translation tests generated via Google Gemini API.
- 📅 **Progress Tracking** — View daily activity in a heatmap graph (similar to LeetCode).
- 📝 **Notes Page** — Save learned vocabulary in `source → target` format.
- ❓ **Ask Doubts** — Ask AI or directly message tutors; choose the test related to the doubt.
- 🔔 **Notifications** — Receive alerts for tutor replies or important updates.

### For Tutors
- 🛠 **Test Creation** — Generate translation MCQs by specifying source & target languages, number of questions, and difficulty.
- 📊 **Manage Tests** — Publish/unpublish tests, delete tests, and see completion counts.
- 📥 **View Submissions** — Check learner answers and provide feedback.
- 💬 **Doubt Resolution** — View learner doubts, reply, and mark them as solved.
- 🔔 **Notifications** — Get notified when a learner asks a doubt.

---

## 🏗 Tech Stack

### Frontend
- **React.js** — UI framework
- **React Router** — Routing
- **Tailwind CSS** — Styling
- **react-hot-toast** — Notifications
- **typewriter-effect** — Typing animation for AI responses

### Backend
- **Node.js** with **Express.js**
- **MongoDB** & **Mongoose** for data storage
- **JWT Authentication**
- **Google Gemini API** for AI-generated test questions

---

## 📂 Project Structure

```
.
├── client/           # React frontend
│   ├── src/
│   └── package.json
├── server/           # Express backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the **server** directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
GOOGLE_API_KEY=your_google_gemini_api_key
```

For **client** (optional `.env` if needed):
```env
VITE_API_BASE=http://localhost:5000/api
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/language-learning-tracker.git
cd language-learning-tracker
```

### 2️⃣ Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3️⃣ Start development servers
```bash
# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm run dev
```

---

## 📸 Screenshots

### Learner Dashboard
![Learner Dashboard](docs/screenshots/learner_dashboard.png)

### Tutor Manage Tests
![Tutor Manage Tests](docs/screenshots/tutor_manage_tests.png)

---

## 📌 Notes
- Ensure you have a valid **Google Gemini API Key** to generate AI-based questions.
- For deployment, configure environment variables for both frontend and backend in your hosting platform.
