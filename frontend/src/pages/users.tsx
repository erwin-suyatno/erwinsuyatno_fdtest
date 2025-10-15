import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '../types';
import { useAdminAuth } from '../middleware/adminAuth';
import { userService, UpdateUserData } from '../services/userService';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    is_verified: '',
    search: '',
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UpdateUserData>({
    name: '',
    email: '',
    isVerified: false,
    role: 'USER'
  });
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchUsers();
    }
  }, [filters, isAdmin, authLoading]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen nature-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 text-sm">🌿 Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect if no user (not authenticated)
  if (!user) {
    router.push('/login');
    return null;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen nature-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">You need admin privileges to access this page</p>
          <button
            onClick={() => router.push('/home')}
            className="btn btn-primary"
          >
            🏡 Back to Home
          </button>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
        search: filters.search || undefined
      });
      setUsers(response.users);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role as 'ADMIN' | 'USER' | 'MEMBER'
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async () => {
    if (!editingUser) return;

    try {
      await userService.updateUser(editingUser.id, userForm);
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        isVerified: false,
        role: 'USER'
      });
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setError('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen nature-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 text-sm">🌿 Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nature-bg relative overflow-hidden">
      {/* Background Nature Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl animate-pulse">🌲</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌿</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
        <div className="absolute bottom-10 right-10 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>🌱</div>
        <div className="absolute top-1/2 left-5 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🌳</div>
        <div className="absolute top-1/3 right-5 text-3xl animate-pulse" style={{ animationDelay: '2.5s' }}>🌾</div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100">
          <div className="px-6 py-4 border-b border-green-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-green-800">🌲 Admin - User Management</h1>
              <button
                onClick={() => router.push('/home')}
                className="btn btn-secondary"
              >
                🏡 Back to Home
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  🌿 Verification Status
                </label>
                <select
                  value={filters.is_verified}
                  onChange={(e) => handleFilterChange('is_verified', e.target.value)}
                  className="input"
                >
                  <option value="">All Users</option>
                  <option value="true">✅ Verified Only</option>
                  <option value="false">❌ Unverified Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  🔍 Search
                </label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ is_verified: '', search: '' })}
                  className="btn btn-secondary w-full"
                >
                  🌱 Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {error ? (
              <div className="px-6 py-8 text-center">
                <div className="text-amber-600 text-xl mb-4">🌧️</div>
                <p className="text-amber-600 mb-4">{error}</p>
                <button 
                  onClick={fetchUsers} 
                  className="btn btn-primary"
                >
                  🌱 Try Again
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="text-green-400 text-xl mb-4">👥</div>
                <p className="text-green-600">No users found in the forest</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isVerified ? '✅ Verified' : '❌ Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="btn btn-secondary text-sm"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-green-50 border-t border-green-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">
                🌿 Showing {users.length} user{users.length !== 1 ? 's' : ''} in the forest
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/books')}
                  className="btn btn-primary"
                >
                  📚 Manage Books
                </button>
                <button
                  onClick={() => router.push('/home')}
                  className="btn btn-secondary"
                >
                  🏡 Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Edit Modal */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ✏️ Edit User: {editingUser.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 Name *
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter user name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 Email *
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👑 Role
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'ADMIN' | 'USER' | 'MEMBER' }))}
                  className="input"
                >
                  <option value="USER">🌿 User</option>
                  <option value="MEMBER">🌱 Member</option>
                  <option value="ADMIN">👑 Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={userForm.isVerified}
                  onChange={(e) => setUserForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700">
                  ✅ Email Verified
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUserSubmit}
                disabled={!userForm.name || !userForm.email}
                className="btn btn-primary flex-1"
              >
                ✏️ Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
