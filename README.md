# Language Learning Tracker

A full-stack **Language Learning Tracker** platform designed to help learners practice, test, and track their language learning progress, while enabling tutors to create, manage, and review tests.

---

## 🚀 Features

- **Role-Based Access**: Separate dashboards and features for Learners and Tutors.
- **Test Creation & Management**: Tutors can create, publish, and manage tests.
- **AI-Powered Question Generation**: Automatically generate MCQs using Google Gemini AI.
- **Progress Tracking**: Learners can track completed tests and scores.
- **Ask AI or Tutor**: Learners can ask AI for quick answers or directly text tutors with doubts.
- **Real-Time Chat**: WebSocket-powered learner-tutor messaging with live typing indicators.
- **Notifications**: Real-time notifications for test updates, chat messages, and doubts.
- **Dockerized Deployment**: Easily deployable using Docker & Docker Compose.
- **Responsive UI**: Clean white-blue modern UI for both desktop and mobile.

---

## 🛠️ Tech Stack

### **Frontend**
- React.js
- Tailwind CSS
- Axios
- WebSockets (Socket.IO)

### **Backend**
- Node.js (Express.js)
- MongoDB (Mongoose)
- Google Gemini AI API
- JWT Authentication
- Socket.IO for real-time communication

### **Deployment**
- Docker & Docker Compose
- AWS EC2

---

## 📦 Installation

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/language-learning-tracker.git
cd language-learning-tracker
```

2. **Set up Environment Variables**
Create `.env` in both **server** and **client** directories and configure:
```env
# Server .env
PORT=5000
MONGO_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_api_key
CORS_ORIGIN=http://localhost:5173
```

```env
# Client .env
VITE_API_URL=http://localhost:5000
```

3. **Run Locally**
```bash
docker-compose up --build
```

4. Access the app:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📸 Screenshots
Add Screenshots
