import React from 'react';

interface LazyLoadingSpinnerProps {
  message?: string;
}

export default function LazyLoadingSpinner({ message = "🌿 Loading..." }: LazyLoadingSpinnerProps) {
  return (
    <div className="min-h-screen nature-bg flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Nature Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl animate-pulse">🌲</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌿</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
        <div className="absolute bottom-10 right-10 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>🌱</div>
        <div className="absolute top-1/2 left-5 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🌳</div>
        <div className="absolute top-1/3 right-5 text-3xl animate-pulse" style={{ animationDelay: '2.5s' }}>🌾</div>
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            
            {/* Inner pulsing circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Nature icon with animation */}
          <div className="text-4xl mb-4 animate-bounce">🌿</div>
          
          <h2 className="text-2xl font-semibold text-green-800 mb-2">
            {message}
          </h2>
          <p className="text-green-700">
            Please wait while we prepare your forest experience
          </p>
        </div>

        {/* Progress indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Loading components</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span>Preparing data</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span>Almost ready</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-8 bg-gradient-to-t from-green-200 to-green-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
