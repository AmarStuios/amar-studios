import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <Logo size={42} />
        </div>
        <nav>
          <NavLink to="/admin" end>Tableau de bord</NavLink>
          <NavLink to="/admin/produits">Produits</NavLink>
          <NavLink to="/admin/commandes">Commandes</NavLink>
          <NavLink to="/admin/codes-promo">Codes promo</NavLink>
        </nav>
        <div className="logout">
          <button onClick={handleLogout} style={{ color: '#a3a3a3', fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Deconnexion
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
