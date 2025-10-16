import { useRouter } from 'next/router';

interface HeaderProps {
  title: string;
  showAuthButtons?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

export default function Header({ 
  title, 
  showAuthButtons = false, 
  showBackButton = false,
  backButtonText = "🏡 Back to Home",
  backButtonPath = "/home"
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-800">{title}</h1>
          </div>
          <div className="flex space-x-4">
            {showAuthButtons && (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-secondary"
                >
                  🌲 Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="btn btn-primary"
                >
                  🌱 Register
                </button>
              </>
            )}
            {showBackButton && (
              <button
                onClick={() => router.push(backButtonPath)}
                className="btn btn-secondary"
              >
                {backButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
