import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '../types';
import { useAdminAuth } from '../middleware/adminAuth';
import { userService, UpdateUserData } from '../services/userService';
import { useUsers } from '../hooks/useUsers';
import { 
  PageContainer, 
  Pagination, 
  FilterSection, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  Modal,
  UserForm
} from '../components';

export default function UsersPage() {
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
  
  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    filters,
    handleVerificationFilter,
    handleSearch,
    clearFilters,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    fetchUsers,
  } = useUsers();

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchUsers();
    }
  }, [isAdmin, authLoading]);

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
      console.error('Failed to update user:', err);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="🌿 Loading users..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
          <FilterSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  🌿 Verification Status
                </label>
                <select
                  value={String(filters.is_verified || '')}
                  onChange={(e) => handleVerificationFilter(e.target.value)}
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
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary w-full"
                >
                  🌱 Clear Filters
                </button>
              </div>
            </div>
          </FilterSection>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {error ? (
              <ErrorState 
                message={error}
                onRetry={() => fetchUsers(true)}
              />
            ) : users.length === 0 ? (
              <EmptyState 
                icon="👥"
                title="No users found in the forest"
                description=""
              />
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            itemsPerPage={itemsPerPage}
            itemsOnCurrentPage={users.length}
            loading={loading}
            onPageChange={handlePageChange}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />

          {/* Footer */}
          <div className="px-6 py-4 bg-green-50 border-t border-green-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">
                🌿 Showing {users.length} user{users.length !== 1 ? 's' : ''} on page {currentPage} of {totalPages} • {total} total users
              </p>
            </div>
          </div>
        </div>

        {/* User Edit Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title={`✏️ Edit User: ${editingUser?.name || ''}`}
        >
          {editingUser && (
            <UserForm
              user={editingUser}
              onSubmit={handleUserSubmit}
              onCancel={() => setShowUserModal(false)}
            />
          )}
        </Modal>
      </PageContainer>
  );
}
