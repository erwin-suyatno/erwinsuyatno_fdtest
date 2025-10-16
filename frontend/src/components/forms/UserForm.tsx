import { useState } from 'react';
import { User, UpdateUserData } from '../../types';

interface UserFormProps {
  user: User;
  onSubmit: (data: UpdateUserData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, loading = false }: UserFormProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    role: user.role as 'ADMIN' | 'USER' | 'MEMBER'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          👤 Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="input"
          placeholder="Enter user name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📧 Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="input"
          placeholder="Enter email address"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          👑 Role
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'ADMIN' | 'USER' | 'MEMBER' }))}
          className="input"
        >
          <option value="USER">🌿 User</option>
          <option value="MEMBER">🌱 Member</option>
          <option value="ADMIN">👑 Admin</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isVerified"
          checked={formData.isVerified}
          onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700">
          ✅ Email Verified
        </label>
      </div>
      
      <div className="flex space-x-4 mt-6">
        <button
          onClick={onCancel}
          className="btn btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.email || loading}
          className="btn btn-primary flex-1"
        >
          {loading ? '⏳ Processing...' : '✏️ Update User'}
        </button>
      </div>
    </div>
  );
}
