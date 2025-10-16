import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { User, Key, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { useAuthStore } from '../stores/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Use auth store
  const {
    user,
    profileLoading: loading,
    error,
    fetchCurrentUser,
    logout
  } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCurrentUser();
  }, [router, fetchCurrentUser]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Profile - Library Management</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Profile Error - Library Management</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - Library Management</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <button
                    onClick={() => router.push('/home')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-2 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user?.isVerified ? (
                          <>
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Unverified
                          </>
                        )}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Key className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Password</h4>
                          <p className="text-sm text-gray-500">
                            Last updated: Recently
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowChangePasswordModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email address</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Account type</dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email verification</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user?.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user?.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => router.push('/my-bookings')}
                      className="relative bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900">My Bookings</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          View and manage your book reservations
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => router.push('/books')}
                      className="relative bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900">Browse Books</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Discover and explore our book collection
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => {
            // Optionally show a success message or refresh profile
            console.log('Password changed successfully');
          }}
        />
      </div>
    </>
  );
}
