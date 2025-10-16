import { useState } from 'react';
import { Book } from '../../types';

interface BookingFormProps {
  book: Book;
  onSubmit: (data: { borrowDate: string; returnDate: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function BookingForm({ book, onSubmit, onCancel, loading = false }: BookingFormProps) {
  const [formData, setFormData] = useState({
    borrowDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📅 Borrow Date
        </label>
        <input
          type="date"
          value={formData.borrowDate}
          onChange={(e) => setFormData(prev => ({ ...prev, borrowDate: e.target.value }))}
          className="input"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📅 Return Date
        </label>
        <input
          type="date"
          value={formData.returnDate}
          onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
          className="input"
          min={formData.borrowDate}
        />
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
          disabled={!formData.borrowDate || !formData.returnDate || loading}
          className="btn btn-primary flex-1"
        >
          {loading ? '⏳ Processing...' : '📖 Borrow Book'}
        </button>
      </div>
    </div>
  );
}
