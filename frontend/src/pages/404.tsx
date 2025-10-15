import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Track 404 errors for analytics
    console.log('404 Error - Page not found:', router.asPath);
  }, [router.asPath]);

  return (
    <div className="min-h-screen nature-bg flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Nature Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🌲</div>
        <div className="absolute top-20 right-20 text-4xl">🌿</div>
        <div className="absolute bottom-20 left-20 text-5xl">🍃</div>
        <div className="absolute bottom-10 right-10 text-3xl">🌱</div>
        <div className="absolute top-1/2 left-5 text-4xl">🌳</div>
        <div className="absolute top-1/3 right-5 text-3xl">🌾</div>
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🌿</div>
          <div className="text-6xl font-bold text-green-700 mb-2">404</div>
          <div className="text-2xl font-semibold text-green-800 mb-2">Lost in the Forest</div>
          <p className="text-green-700">
            Oops! The page you're looking for seems to have wandered off into the deep forest. 
            Let's help you find your way back to civilization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary w-full"
          >
            🏡 Return to Home
          </button>
          
          <button
            onClick={() => router.back()}
            className="btn btn-secondary w-full"
          >
            🌲 Go Back
          </button>
          
          <button
            onClick={() => router.push('/books')}
            className="btn btn-secondary w-full"
          >
            📚 Explore Library
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-green-600">
          <p>If you believe this is an error, please contact our forest rangers.</p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Floating Leaves Animation */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="text-2xl animate-bounce">🍃</div>
        </div>
        <div className="absolute -top-5 right-10">
          <div className="text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍃</div>
        </div>
        <div className="absolute -top-8 left-10">
          <div className="text-lg animate-bounce" style={{ animationDelay: '1s' }}>🍃</div>
        </div>
      </div>
    </div>
  );
}
