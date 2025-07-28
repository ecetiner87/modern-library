import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpenIcon, 
  PlusIcon, 
  XMarkIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { currentlyReadingApi } from '../services/api';
import { ConfirmDialog, NotificationToast, useNotifications } from '../components/Modals';

const AddCurrentlyReadingModal = ({ isOpen, onClose, showError, showSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    book_id: '',
    current_page: '',
    notes: ''
  });

  const { data: availableBooks, isLoading: loadingBooks } = useQuery({
    queryKey: ['available-books-currently-reading'],
    queryFn: () => currentlyReadingApi.getAvailableBooks().then(res => res.data),
    enabled: isOpen
  });

  const createMutation = useMutation({
    mutationFn: (data) => currentlyReadingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currently-reading']);
      onClose();
      setFormData({ book_id: '', current_page: '', total_pages: '', notes: '' });
      showSuccess('Success!', 'Book added to currently reading!');
    },
    onError: (error) => {
      showError('Error', error.response?.data?.error || 'Error adding book to currently reading');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      book_id: parseInt(formData.book_id),
      current_page: parseInt(formData.current_page)
    };
    createMutation.mutate(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    onClose();
    setFormData({ book_id: '', current_page: '', notes: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add to Currently Reading</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Book
            </label>
            <select
              name="book_id"
              value={formData.book_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a book...</option>
              {availableBooks?.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Page
            </label>
            <input
              type="number"
              name="current_page"
              value={formData.current_page}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 90"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any notes about your reading progress..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UpdateProgressModal = ({ isOpen, onClose, book, onUpdate, showError }) => {
  const [formData, setFormData] = useState({
    current_page: book?.current_page || '',
    notes: book?.notes || ''
  });

  const updateMutation = useMutation({
    mutationFn: (data) => currentlyReadingApi.update(book.id, data),
    onSuccess: () => {
      onUpdate();
      onClose();
    },
    onError: (error) => {
      showError('Error', error.response?.data?.error || 'Error updating progress');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      current_page: parseInt(formData.current_page)
    };
    updateMutation.mutate(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    onClose();
    setFormData({
      current_page: book?.current_page || '',
      notes: book?.notes || ''
    });
  };

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Update Reading Progress</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{book.title}</h3>
          <p className="text-sm text-gray-600">by {book.author_name}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Page
            </label>
            <input
              type="number"
              name="current_page"
              value={formData.current_page}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CurrentlyReadingCard = ({ book, onUpdate, onFinish, onRemove }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {book.title}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            by {book.author_name}
          </p>

          {/* Progress Bar */}
          {book.total_pages && book.reading_progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{book.reading_progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(book.reading_progress)}`}
                  style={{ width: `${book.reading_progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Page {book.current_page} of {book.total_pages}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <EyeIcon className="h-4 w-4 mr-2" />
              Current Page: <span className="font-medium ml-1">{book.current_page}</span>
              {book.total_pages && (
                <span className="text-gray-400 ml-1">/ {book.total_pages}</span>
              )}
              {!book.total_pages && (
                <span className="text-gray-400 ml-1">(total pages unknown)</span>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Started: <span className="font-medium ml-1">{formatDate(book.started_date)}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Last Read: <span className="font-medium ml-1">{formatDate(book.last_read_date)}</span>
            </div>

            {book.notes && (
              <p className="text-sm text-gray-600 italic">
                Note: {book.notes}
              </p>
            )}
          </div>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdate(book)}
              className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <PencilIcon className="h-3 w-3 mr-1" />
              Update
            </button>
            <button
              onClick={() => onFinish(book.id)}
              className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Finish
            </button>
            <button
              onClick={() => onRemove(book.id)}
              className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <TrashIcon className="h-3 w-3 mr-1" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CurrentlyReading() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [updateModal, setUpdateModal] = useState({ isOpen: false, book: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null });
  const queryClient = useQueryClient();
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();

  const { data: currentlyReading, isLoading, error } = useQuery({
    queryKey: ['currently-reading'],
    queryFn: () => currentlyReadingApi.getAll().then(res => res.data),
  });

  const finishMutation = useMutation({
    mutationFn: currentlyReadingApi.finish,
    onSuccess: () => {
      queryClient.invalidateQueries(['currently-reading']);
      showSuccess('Success!', 'Book marked as finished!');
    },
    onError: () => {
      showError('Error', 'Error marking book as finished. Please try again.');
    },
  });

  const removeMutation = useMutation({
    mutationFn: currentlyReadingApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['currently-reading']);
      showSuccess('Success!', 'Book removed from currently reading!');
    },
    onError: () => {
      showError('Error', 'Error removing book. Please try again.');
    },
  });

  const handleUpdate = (book) => {
    setUpdateModal({ isOpen: true, book });
  };

  const handleFinish = (id) => {
    setConfirmDialog({
      isOpen: true,
      type: 'finish',
      id,
      title: 'Mark as Finished',
      message: 'Mark this book as finished? It will be removed from currently reading.',
      confirmText: 'Mark Finished',
      cancelText: 'Cancel'
    });
  };

  const handleRemove = (id) => {
    setConfirmDialog({
      isOpen: true,
      type: 'remove',
      id,
      title: 'Remove from Currently Reading',
      message: 'Remove this book from currently reading? This action cannot be undone.',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === 'finish') {
      finishMutation.mutate(confirmDialog.id);
    } else if (confirmDialog.type === 'remove') {
      removeMutation.mutate(confirmDialog.id);
    }
    setConfirmDialog({ isOpen: false, type: '', id: null });
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries(['currently-reading']);
    showSuccess('Success!', 'Reading progress updated!');
  };

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
        <p className="text-red-500">Error loading currently reading books: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Currently Reading</h1>
          <p className="text-gray-600">
            Track your reading progress and manage ongoing books
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Book
        </button>
      </div>

      {/* Currently Reading Books */}
      {currentlyReading?.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No books in progress</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start tracking your reading progress by adding a book.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Book
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {currentlyReading?.map(book => (
            <CurrentlyReadingCard
              key={book.id}
              book={book}
              onUpdate={handleUpdate}
              onFinish={handleFinish}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Add Book Modal */}
      <AddCurrentlyReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        showError={showError}
        showSuccess={showSuccess}
      />

      {/* Update Progress Modal */}
      <UpdateProgressModal
        isOpen={updateModal.isOpen}
        onClose={() => setUpdateModal({ isOpen: false, book: null })}
        book={updateModal.book}
        onUpdate={handleUpdateSuccess}
        showError={showError}
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
      />

      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
} 