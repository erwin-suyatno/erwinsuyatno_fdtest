import { useState } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../lib/auth/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData.name, formData.email, formData.password);
      setSuccess(response.message);
      if (response.verifyToken) {
        setSuccess(`${response.message} Verification token: ${response.verifyToken}`);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
            🌱 Join Our Forest Community
          </h2>
          <p className="mt-2 text-center text-sm text-green-600">
            Or{' '}
            <button
              onClick={() => router.push('/login')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              🌲 sign in to your existing account
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-green-700">
                🌿 Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border-2 border-green-200 placeholder-green-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-white/80 backdrop-blur-sm"
                placeholder="🌿 Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-700">
                📧 Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border-2 border-green-200 placeholder-green-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-white/80 backdrop-blur-sm"
                placeholder="📧 Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-700">
                🔒 Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border-2 border-green-200 placeholder-green-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-white/80 backdrop-blur-sm"
                placeholder="🔒 Enter your password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-700">
                🔐 Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border-2 border-green-200 placeholder-green-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-white/80 backdrop-blur-sm"
                placeholder="🔐 Confirm your password"
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

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400">🌱</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
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
              {loading ? '🌱 Growing your account...' : '🌿 Create account'}
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
