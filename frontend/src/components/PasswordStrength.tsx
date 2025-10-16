import { useEffect } from 'react';
import { XCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (strength: any) => void;
  showFeedback?: boolean;
  className?: string;
}

export default function PasswordStrength({ 
  password, 
  onStrengthChange, 
  showFeedback = true, 
  className = '' 
}: PasswordStrengthProps) {
  const { passwordStrength: strength, validatePassword } = useAuthStore();

  useEffect(() => {
    if (!password) {
      onStrengthChange?.(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      validatePassword(password);
    }, 300); // Debounce
    
    return () => clearTimeout(timeoutId);
  }, [password, validatePassword, onStrengthChange]);

  // Update parent component when strength changes
  useEffect(() => {
    onStrengthChange?.(strength);
  }, [strength, onStrengthChange]);

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

  const getStrengthTextColor = (score: number) => {
    if (score <= 2) return 'text-red-600';
    if (score <= 3) return 'text-yellow-600';
    if (score <= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Password strength:</span>
        {strength ? (
          <span className={`font-medium ${getStrengthTextColor(strength.score)}`}>
            {getStrengthText(strength.score)}
          </span>
        ) : null}
      </div>
      
      {strength && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
      )}

      {showFeedback && strength && strength.feedback.length > 0 && (
        <div className="mt-2">
          <ul className="text-sm space-y-1">
            {strength.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center">
                <XCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                <span className="text-gray-600">{feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {strength && strength.isValid && (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Password meets all requirements</span>
        </div>
      )}
    </div>
  );
}
