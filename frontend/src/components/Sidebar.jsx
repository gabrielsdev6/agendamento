import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  services: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  const navItems = isAdmin
    ? [
        { to: '/admin', label: 'Painel Admin', icon: icons.calendar },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
      ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen`}>
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <span className="text-indigo-600 font-bold text-lg tracking-tight">Agendamento</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition ml-auto"
        >
          {icons.menu}
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-indigo-500 font-medium">{isAdmin ? 'Administrador' : 'Cliente'}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className={active ? 'text-indigo-600' : ''}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all w-full"
        >
          {icons.logout}
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
