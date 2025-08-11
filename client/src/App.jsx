import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Vocab from './pages/Vocab';
import Progress from './pages/Progress';
import Login from './pages/Login';
import Tests from './pages/Tests';          // learner routes
import TestsManage from './pages/TestsManage'; // tutor routes
import Profile from './pages/Profile';
import Help from './pages/Help';
import './styles.css';
import Notes from './pages/Notes';
import { TestsHome, Take } from './pages/Tests';
import DoubtsPage from './pages/Doubts';
import TutorDoubts from './pages/TutorDoubts';
import Chat from './pages/Chat';

function Private({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedBackground />
        <Navbar />
        <Routes>
          <Route path="/" element={<Private><Dashboard /></Private>} />
          <Route path="/lessons" element={<Private><Lessons /></Private>} />
          <Route path="/vocab" element={<Private><Vocab /></Private>} />
          <Route path="/tests/*" element={<Private><Tests /></Private>} />
          <Route path="/tests/*" element={<Private><Tests /></Private>} />
          <Route path="/tests/create" element={<Private><TestsManage /></Private>} />
          <Route path="/tests/manage" element={<Private><TestsManage /></Private>} />
          <Route path="/tests/manage/:id" element={<Private><TestsManage /></Private>} />
          <Route path="/progress" element={<Private><Progress /></Private>} />
          <Route path="/profile" element={<Private><Profile /></Private>} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/notes" element={<Private><Notes /></Private>} />
          <Route path="/tests" element={<Private><TestsHome /></Private>} />
          <Route path="/tests/:id" element={<Private><Take /></Private>} />
          <Route path="/doubts" element={<Private><DoubtsPage /></Private>} />
          <Route path="/tutor/doubts" element={<Private><TutorDoubts /></Private>} />
          <Route path="/chat" element={<Private><Chat /></Private>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}