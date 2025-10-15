import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Custom500() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Track 500 errors for analytics
    console.log('500 Error - Internal server error');
  }, []);

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
        {/* 500 Illustration */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🌧️</div>
          <div className="text-6xl font-bold text-amber-700 mb-2">500</div>
          <div className="text-2xl font-semibold text-amber-800 mb-2">Storm in the Forest</div>
          <p className="text-amber-700">
            Oops! A storm has disrupted our digital ecosystem. Our forest guardians are working to restore the natural balance.
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
            onClick={() => window.location.reload()}
            className="btn btn-secondary w-full"
          >
            🌱 Try Again
          </button>
          
          <button
            onClick={() => router.back()}
            className="btn btn-secondary w-full"
          >
            🌲 Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-amber-600">
          <p>If this storm persists, please contact our forest rangers.</p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Weather Animation */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="text-2xl animate-bounce">🌧️</div>
        </div>
        <div className="absolute -top-5 right-10">
          <div className="text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>⚡</div>
        </div>
        <div className="absolute -top-8 left-10">
          <div className="text-lg animate-bounce" style={{ animationDelay: '1s' }}>🌩️</div>
        </div>
        <div className="absolute -bottom-10 right-1/3">
          <div className="text-lg animate-bounce" style={{ animationDelay: '1.5s' }}>🌦️</div>
        </div>
      </div>
    </div>
  );
}
