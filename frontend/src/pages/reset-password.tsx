import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [form, setForm] = useState<ResetPasswordForm>({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Use auth store
  const {
    passwordLoading: loading,
    resetPasswordSuccess: success,
    error,
    passwordStrength,
    resetPassword,
    validatePassword,
    clearErrors,
    clearSuccessStates
  } = useAuthStore();

  useEffect(() => {
    // Only redirect if router is ready and there's definitely no token
    if (router.isReady && !token) {
      router.push('/forgot-password');
    }
  }, [token, router]);

  // Show loading while router is initializing
  if (!router.isReady) {
    return (
      <>
        <Head>
          <title>Reset Password - Library Management</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If no token after router is ready, show error message instead of redirecting immediately
  if (!token) {
    return (
      <>
        <Head>
          <title>Reset Password - Library Management</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                This password reset link is invalid or has expired.
              </p>
              <div className="mt-8">
                <Link
                  href="/forgot-password"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const validatePasswordStrength = async (password: string) => {
    await validatePassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    clearSuccessStates();

    if (form.password !== form.confirmPassword) {
      // Handle password mismatch locally since it's a client-side validation
      return;
    }

    if (!passwordStrength?.isValid) {
      // Handle password strength validation locally
      return;
    }

    if (token) {
      await resetPassword({
        token: token as string,
        password: form.password,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    clearErrors();

    if (name === 'password') {
      validatePasswordStrength(value);
    }
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  if (success) {
    return (
      <>
        <Head>
          <title>Password Reset Successful - Library Management</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Password Reset Successful
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password - Library Management</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Reset your password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your new password below. Make sure it's strong and secure.
              </p>
            </div>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-600' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' :
                      passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="mt-2">
                      <ul className="text-sm text-gray-600">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li key={index} className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !passwordStrength?.isValid || form.password !== form.confirmPassword}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
