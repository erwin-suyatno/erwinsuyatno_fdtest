export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role: string;
}

export interface AuthResponse {
  token: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  },

  async register(name: string, email: string, password: string): Promise<{ message: string; verifyToken?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return response.json();
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    const data = await response.json();
    return data.user;
  },

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
