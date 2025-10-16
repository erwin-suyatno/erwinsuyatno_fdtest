import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface NavigationProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const navItems = [
    { path: '/home', label: '🏡 Home', icon: '🏡' },
    { path: '/my-bookings', label: '📋 My Bookings', icon: '📋' },
  ];

  const adminNavItems = [
    { path: '/users', label: '👥 Users', icon: '👥' },
    { path: '/books', label: '📚 Books', icon: '📚' },
    { path: '/admin/bookings', label: '📊 Manage Bookings', icon: '📊' },
  ];

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/home')}
              className="text-2xl font-bold text-green-800 hover:text-green-600 transition-colors"
            >
              🌿 Library
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user.role != 'ADMIN' && (
              <>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}
            
            
            {user.role === 'ADMIN' && (
              <>
                {adminNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-600">
              Welcome, <span className="font-medium text-green-800">{user.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              🚪 Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {user.role === 'ADMIN' && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="text-xs font-semibold text-gray-500 px-3 py-1">Admin</div>
                  {adminNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-green-100 text-green-800'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
