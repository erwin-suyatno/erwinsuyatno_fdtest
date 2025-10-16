import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../lib/api/client';
import { useAuth } from '../middleware/auth';
import { PageContainer, LoadingState, ErrorState } from '../components';

interface HomeData {
  name: string;
  isVerified: boolean;
  role: string;
}

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await apiClient.get('/home');
        setHomeData(response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load home data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [router]);

  if (loading || authLoading) {
    return (
      <PageContainer>
        <LoadingState message="🌿 Loading your forest..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
        {/* Welcome Header with Gradient */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent mb-4 animate-fade-in">
              🌿 Welcome to Your Forest
            </h1>
            <p className="text-2xl text-green-700 font-semibold animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {homeData?.name}!
            </p>
            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full animate-scale-x" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isAdmin ? (
            <>
              <div className="group transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:animate-bounce">👥</div>
                    <h3 className="text-xl font-bold text-purple-800 mb-2">Manage Users</h3>
                    <p className="text-purple-600 mb-4">View and edit user accounts</p>
                    <button
                      onClick={() => router.push('/users')}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                      👥 Manage Users
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="group transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:animate-bounce">📚</div>
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Manage Books</h3>
                    <p className="text-blue-600 mb-4">Add, edit, and organize books</p>
                    <button
                      onClick={() => router.push('/books')}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      📚 Manage Books
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="group transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:animate-bounce">📖</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Borrow Books</h3>
                    <p className="text-green-600 mb-4">Browse and borrow books</p>
                    <button
                      onClick={() => router.push('/booking')}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                    >
                      📖 Borrow Books
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="group transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:animate-bounce">📖</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Browse Books</h3>
                    <p className="text-green-600 mb-4">Discover amazing books</p>
                    <button
                      onClick={() => router.push('/booking')}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                    >
                      📖 Browse Books
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="group transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:animate-bounce">📋</div>
                    <h3 className="text-xl font-bold text-blue-800 mb-2">My Bookings</h3>
                    <p className="text-blue-600 mb-4">View your current bookings</p>
                    <button
                      onClick={() => router.push('/booking')}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      📋 My Bookings
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile and Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* User Profile Card */}
          <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl text-white font-bold">
                  {homeData?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">🌿 Your Forest Profile</h2>
              <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">🌲 Name</label>
                    <p className="text-lg font-semibold text-gray-900">{homeData?.name}</p>
                  </div>
                  <div className="text-2xl">👤</div>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">👑 Role</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isAdmin 
                        ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' 
                        : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                    }`}>
                      {isAdmin ? '👑 Admin' : '🌿 Member'}
                    </span>
                  </div>
                  <div className="text-2xl">{isAdmin ? '👑' : '🌿'}</div>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">📧 Email Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      homeData?.isVerified 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                        : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300'
                    }`}>
                      {homeData?.isVerified ? '✅ Verified' : '⏳ Not Verified'}
                    </span>
                  </div>
                  <div className="text-2xl">{homeData?.isVerified ? '✅' : '⏳'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">📊 Forest Statistics</h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/70 rounded-2xl p-4 text-center border border-blue-200">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold text-blue-800">12</div>
                <div className="text-sm text-blue-600">Books Available</div>
              </div>
              <div className="bg-white/70 rounded-2xl p-4 text-center border border-blue-200">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-blue-800">24</div>
                <div className="text-sm text-blue-600">Active Users</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Email Verification Warning */}
        {!homeData?.isVerified && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🌧️</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-800 mb-3">
                Email Not Verified
              </h3>
              <p className="text-amber-700 text-lg leading-relaxed">
                Your email address has not been verified yet. Please check your email for verification instructions to fully access all forest features.
              </p>
              <div className="mt-4 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
  );
}
