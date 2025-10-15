import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode token to get user info (simple JWT decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUser: User = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        isVerified: payload.isVerified
      };

      setUser(currentUser);
      setIsAdmin(currentUser.role === 'ADMIN');
      
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, isAdmin };
}
