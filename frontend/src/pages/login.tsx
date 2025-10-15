import { useState } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../lib/auth/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData.email, formData.password);
      localStorage.setItem('token', response.token);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen nature-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Nature Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl animate-pulse">🌲</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌿</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
        <div className="absolute bottom-10 right-10 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>🌱</div>
        <div className="absolute top-1/2 left-5 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🌳</div>
        <div className="absolute top-1/3 right-5 text-3xl animate-pulse" style={{ animationDelay: '2.5s' }}>🌾</div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-green-800">
            🌲 Welcome to the Forest
          </h2>
          <p className="mt-2 text-center text-sm text-green-600">
            Or{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              🌱 create a new account
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border-2 border-green-200 placeholder-green-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-white/80 backdrop-blur-sm"
                placeholder="🌿 Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border-2 border-green-200 placeholder-green-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-white/80 backdrop-blur-sm"
                placeholder="🔒 Password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-amber-400">🌧️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? '🌿 Entering the forest...' : '🌲 Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-green-600 hover:text-green-500"
            >
              🏡 Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
