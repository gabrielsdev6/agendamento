import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-blue-600 font-bold text-lg">
        Agendamento
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Olá, {user?.name}</span>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="text-sm text-blue-600 hover:underline">Painel Admin</Link>
        )}
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
          Sair
        </button>
      </div>
    </nav>
  );
}
