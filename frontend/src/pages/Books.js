import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpenIcon, 
  PlusIcon, 
  XMarkIcon,
  UserIcon,
  TagIcon,
  CalendarDaysIcon,
  StarIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { booksApi, categoriesApi, subCategoriesApi } from '../services/api';
import { ConfirmDialog, NotificationToast, useNotifications } from '../components/Modals';

const AddBookModal = ({ isOpen, onClose, showError }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    author_first_name: '',
    author_last_name: '',
    category_id: '',
    sub_category: '',
    translator: '',
    price: '',
    publication_year: '',
    pages: '',
    description: '',
    rating: '',
    is_read: 'false'  // Changed to string to match select options
  });
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(res => res.data),
    enabled: Boolean(isOpen)
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ['sub-categories', selectedCategory],
    queryFn: () => subCategoriesApi.getByCategory(selectedCategory).then(res => res.data),
    enabled: Boolean(isOpen && selectedCategory)
  });

  const createBookMutation = useMutation({
    mutationFn: (bookData) => booksApi.create(bookData),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      onClose();
      setFormData({
        title: '',
        author_first_name: '',
        author_last_name: '',
        category_id: '',
        sub_category: '',
        translator: '',
        price: '',
        publication_year: '',
        pages: '',
        description: '',
        rating: '',
        is_read: 'false'
      });
      setSelectedCategory('');
    },
    onError: (error) => {
      console.error('Error creating book:', error);
      showError('Error', 'Error creating book. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookData = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      pages: formData.pages ? parseInt(formData.pages) : null,
      rating: formData.rating ? parseInt(formData.rating) : null,
      publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      is_read: formData.is_read === 'true'  // Properly convert string to boolean
    };
    createBookMutation.mutate(bookData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category_id') {
      const selectedCat = categories.find(cat => cat.id === parseInt(value));
      setSelectedCategory(selectedCat ? selectedCat.name : '');
      setFormData(prev => ({
        ...prev,
        category_id: value,
        sub_category: '' // Reset sub-category when category changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      author_first_name: '',
      author_last_name: '',
      category_id: '',
      sub_category: '',
      translator: '',
      price: '',
      publication_year: '',
      pages: '',
      description: '',
      rating: '',
      is_read: 'false'
    });
    setSelectedCategory('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Book</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="author_first_name" className="block text-sm font-medium text-gray-700">
                  Author First Name
                </label>
                <input
                  type="text"
                  id="author_first_name"
                  name="author_first_name"
                  value={formData.author_first_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Orhan"
                />
              </div>
              <div>
                <label htmlFor="author_last_name" className="block text-sm font-medium text-gray-700">
                  Author Last Name
                </label>
                <input
                  type="text"
                  id="author_last_name"
                  name="author_last_name"
                  value={formData.author_last_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Pamuk"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sub_category" className="block text-sm font-medium text-gray-700">
                  Sub-Category
                </label>
                <select
                  id="sub_category"
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleChange}
                  disabled={!selectedCategory}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                >
                  <option value="">Select a sub-category</option>
                  {subCategories.map(subCat => (
                    <option key={subCat.value} value={subCat.value}>
                      {subCat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="translator" className="block text-sm font-medium text-gray-700">
                Translator (Optional)
              </label>
              <input
                type="text"
                id="translator"
                name="translator"
                value={formData.translator}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Müfit Özdeş"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="pages" className="block text-sm font-medium text-gray-700">
                  Pages
                </label>
                <input
                  type="number"
                  id="pages"
                  name="pages"
                  min="1"
                  value={formData.pages}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="publication_year" className="block text-sm font-medium text-gray-700">
                  Publication Year
                </label>
                <input
                  type="number"
                  id="publication_year"
                  name="publication_year"
                  min="1000"
                  max="2030"
                  value={formData.publication_year}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 2023"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (TL)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 45.90"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Only show rating field if book is marked as read */}
              {formData.is_read === 'true' && (
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                    Rating (1-5) *
                  </label>
                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    required={formData.is_read === 'true'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Rate this book</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              )}

              <div className={formData.is_read === 'true' ? '' : 'col-span-2'}>
                <label htmlFor="is_read" className="block text-sm font-medium text-gray-700">
                  Read Status
                </label>
                <select
                  id="is_read"
                  name="is_read"
                  value={formData.is_read}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="false">No - Not Read Yet</option>
                  <option value="true">Yes - Already Read</option>
                </select>
                {formData.is_read === 'false' && (
                  <p className="mt-1 text-xs text-gray-500">
                    💡 You can add a rating later when you mark the book as read
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBookMutation.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {createBookMutation.isLoading ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BookCard = ({ book, onDelete, onMarkAsRead }) => {
  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Convert database integers to booleans
  const isRead = Boolean(book.is_read);
  const isWishlist = Boolean(book.is_wishlist);
  const isBorrowed = Boolean(book.is_borrowed);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Book Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
            {book.title}
          </h3>
          
          {/* Author Information */}
          {book.author_name && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{book.author_name}</span>
            </div>
          )}
          
          {(book.author_first_name || book.author_last_name) && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{book.author_first_name} {book.author_last_name}</span>
            </div>
          )}
          
          {/* Category and Sub-category */}
          <div className="flex items-center gap-2 mb-3">
            {book.category_name && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: book.category_color + '20',
                  color: book.category_color 
                }}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {book.category_name}
              </span>
            )}
            
            {book.sub_category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {book.sub_category}
              </span>
            )}
          </div>
          
          {/* Book Details Row */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {book.pages && (
              <span className="flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {book.pages} pages
              </span>
            )}
            
            {book.publication_year && (
              <span className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400" />
                {book.publication_year}
              </span>
            )}
            
            {book.price && (
              <span className="flex items-center font-medium text-green-600">
                <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                {book.price} TL
              </span>
            )}
          </div>
          
          {/* Rating */}
          {book.rating && (
            <div className="mb-3">
              {renderStars(book.rating)}
            </div>
          )}
          
          {/* Translator */}
          {book.translator && (
            <div className="text-xs text-gray-500 mb-3">
              <span className="font-medium">Translated by:</span> {book.translator}
            </div>
          )}
          
          {/* Description */}
          {book.description && (
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
              {book.description}
            </p>
          )}
          
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {isRead ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Read
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Not Read
              </span>
            )}
            
            {isWishlist && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Wishlist
              </span>
            )}
            
            {isBorrowed && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Borrowed
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col items-end ml-4 space-y-2">
          {!isRead && (
            <button
              onClick={() => onMarkAsRead(book.id)}
              className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Mark as read"
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(book.id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete book"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// MarkAsReadModal Component
const MarkAsReadModal = ({ isOpen, onClose, onConfirm, bookTitle }) => {
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a rating before marking as read');
      return;
    }
    onConfirm({ rating: parseInt(rating), notes: notes.trim() || undefined });
    // Reset form
    setRating('');
    setNotes('');
  };

  const handleClose = () => {
    setRating('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Mark as Read
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    You're about to mark "<strong>{bookTitle}</strong>" as read. How would you rate it?
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="mark-rating" className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (1-5 stars) *
                      </label>
                      <select
                        id="mark-rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select your rating</option>
                        <option value="1">⭐ 1 Star - Poor</option>
                        <option value="2">⭐⭐ 2 Stars - Fair</option>
                        <option value="3">⭐⭐⭐ 3 Stars - Good</option>
                        <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Excellent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="mark-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        id="mark-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Your thoughts about this book..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Mark as Read
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Books Component
export default function Books() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [markAsReadModal, setMarkAsReadModal] = useState({ isOpen: false, bookId: null, bookTitle: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null });
  const queryClient = useQueryClient();
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Memoize the search input handler to prevent unnecessary re-renders
  const handleSearchChange = React.useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const { data: booksData, isLoading, error } = useQuery({
    queryKey: ['books', { search: debouncedSearch }],
    queryFn: () => booksApi.getAll({ search: debouncedSearch }).then(res => res.data),
  });

  const deleteBookMutation = useMutation({
    mutationFn: (bookId) => booksApi.delete(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ bookId, ratingData }) => booksApi.markAsRead(bookId, ratingData),
    onSuccess: () => {
      showSuccess('Book marked as read successfully! 📚');
      queryClient.invalidateQueries(['books']);
    },
    onError: (error) => {
      showError('Failed to mark book as read: ' + error.message);
    },
  });

  const handleDeleteBook = (bookId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      id: bookId,
      title: 'Delete Book',
      message: 'Are you sure you want to delete this book? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const handleMarkAsRead = (bookId) => {
    const book = books.find(b => b.id === bookId);
    setMarkAsReadModal({ 
      isOpen: true, 
      bookId: bookId, 
      bookTitle: book?.title || 'this book' 
    });
  };

  const handleMarkAsReadConfirm = (ratingData) => {
    markAsReadMutation.mutate({ 
      bookId: markAsReadModal.bookId, 
      ratingData: {
        ...ratingData,
        finish_date: new Date().toISOString()
      }
    });
    setMarkAsReadModal({ isOpen: false, bookId: null, bookTitle: '' });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === 'delete') {
      deleteBookMutation.mutate(confirmDialog.id);
    }
    setConfirmDialog({ isOpen: false, type: '', id: null });
  };

  const books = booksData?.data || [];
  const pagination = booksData?.pagination || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading books: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-600">
            {pagination.total ? `${pagination.total} books in your library` : 'No books yet'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          data-testid="add-book-button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Book
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search books..."
          value={searchInput}
          onChange={handleSearchChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {debouncedSearch ? 'Try adjusting your search terms.' : 'Get started by adding your first book.'}
          </p>
          {!debouncedSearch && (
            <div className="mt-6">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Book
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <BookCard key={book.id} book={book} onDelete={handleDeleteBook} onMarkAsRead={handleMarkAsRead} />
          ))}
        </div>
      )}

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        showError={showError}
      />
      
      {/* Mark as Read Modal */}
      <MarkAsReadModal
        isOpen={markAsReadModal.isOpen}
        onClose={() => setMarkAsReadModal({ isOpen: false, bookId: null, bookTitle: '' })}
        onConfirm={handleMarkAsReadConfirm}
        bookTitle={markAsReadModal.bookTitle}
      />
      
      {/* Modern Modals */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', id: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type === 'delete' ? 'danger' : 'info'}
      />
      
      <NotificationToast
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
} 