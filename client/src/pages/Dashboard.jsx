import useAuth from '../hooks/useAuth';
import DashboardLearner from './DashboardLearner';
import DashboardTutor from './DashboardTutor';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'tutor' ? <DashboardTutor /> : <DashboardLearner />;
}