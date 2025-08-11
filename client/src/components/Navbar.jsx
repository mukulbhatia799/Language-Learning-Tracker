import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isLearner = user?.role === 'learner';
  const isTutor = user?.role === 'tutor';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          LLT<span className="text-brand">.</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLearner && (
            <>
              <Link to="/notes" className="hover:text-brand">Notes</Link>
              <Link to="/tests" className="hover:text-brand">Tests</Link>
              <Link to="/progress" className="hover:text-brand">Progress</Link>
              <Link to="/doubts" className="hover:text-brand">Doubts</Link> {/* 👈 new */}
              <Link to="/chat" className="nav-link">Chat</Link>
            </>
          )}

          {/* Tutor-only links */}
          {isTutor && (
            <>
              <Link to="/tests/create" className="hover:text-brand">Create Test</Link>
              <Link to="/tests/manage" className="hover:text-brand">Manage Tests</Link>
              <Link to="/tutor/doubts" className="hover:text-brand">Doubts</Link> {/* new */}
              <Link to="/chat" className="nav-link">Chat</Link>
            </>
          )}

          {/* Common links */}
          <Link to="/profile" className="hover:text-brand">Profile</Link>
          <Link to="/help" className="hover:text-brand">Help</Link>

          {user && <NotificationBell />}

          {user ? (
            <button onClick={logout} className="btn btn-primary">Logout</button>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}