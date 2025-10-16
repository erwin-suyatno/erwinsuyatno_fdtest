import { useState } from 'react';
import { Book, CreateBookData } from '../../types';

interface BookFormProps {
  book?: Book | null;
  onSubmit: (data: CreateBookData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function BookForm({ book, onSubmit, onCancel, loading = false }: BookFormProps) {
  const [formData, setFormData] = useState<CreateBookData>({
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    thumbnailUrl: book?.thumbnailUrl || '',
    rating: book?.rating
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📖 Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="input"
          placeholder="Enter book title"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ✍️ Author *
        </label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
          className="input"
          placeholder="Enter author name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📝 Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="input"
          placeholder="Enter book description"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🖼️ Thumbnail URL
        </label>
        <input
          type="url"
          value={formData.thumbnailUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
          className="input"
          placeholder="Enter image URL"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ⭐ Rating
        </label>
        <select
          value={formData.rating || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value ? Number(e.target.value) : undefined }))}
          className="input"
        >
          <option value="">No Rating</option>
          <option value="1">⭐ 1 Star</option>
          <option value="2">⭐⭐ 2 Stars</option>
          <option value="3">⭐⭐⭐ 3 Stars</option>
          <option value="4">⭐⭐⭐⭐ 4 Stars</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
        </select>
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
          disabled={!formData.title || !formData.author || loading}
          className="btn btn-primary flex-1"
        >
          {loading ? '⏳ Processing...' : book ? '✏️ Update Book' : '➕ Add Book'}
        </button>
      </div>
    </div>
  );
}
