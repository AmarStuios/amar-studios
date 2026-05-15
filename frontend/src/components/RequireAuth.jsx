import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Chargement…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
