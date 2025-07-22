import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRightOnRectangleIcon,
  PlusIcon,
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { borrowedApi } from '../services/api';
import { ConfirmDialog, NotificationToast, useNotifications } from '../components/Modals';

const AddBorrowedModal = ({ isOpen, onClose, showError, showSuccess }) => {
  const [formData, setFormData] = useState({
    book_id: '',
    borrower_name: '',
    borrowed_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: availableBooks, isLoading: booksLoading } = useQuery({
    queryKey: ['available-books'],
    queryFn: () => borrowedApi.getAvailableBooks().then(res => res.data),
    enabled: isOpen,
  });

  const createBorrowedMutation = useMutation({
    mutationFn: borrowedApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowed-books']);
      onClose();
      showSuccess('Success!', 'Book lent successfully!');
      setFormData({
        book_id: '',
        borrower_name: '',
        borrowed_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to lend book';
      showError('Error', message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createBorrowedMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-custom overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-modal-fade">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto animate-modal-zoom">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">
              Lend a Book
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Book Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Book
              </label>
              <select
                value={formData.book_id}
                onChange={(e) => setFormData(prev => ({ ...prev, book_id: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={booksLoading}
              >
                <option value="">Select a book</option>
                {availableBooks?.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.author_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Borrower Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Borrowed To
              </label>
              <input
                type="text"
                value={formData.borrower_name}
                onChange={(e) => setFormData(prev => ({ ...prev, borrower_name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Borrowed Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Borrowed On
              </label>
              <input
                type="date"
                value={formData.borrowed_date}
                onChange={(e) => setFormData(prev => ({ ...prev, borrowed_date: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional notes..."
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBorrowedMutation.isPending || booksLoading}
                className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBorrowedMutation.isPending ? 'Adding...' : 'Lend Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BorrowedBookCard = ({ borrowedBook, onMarkReturned }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysColor = (days, isReturned, isOverdue) => {
    if (isReturned) return 'text-green-600 bg-green-100';
    if (isOverdue) return 'text-red-600 bg-red-100';
    if (days > 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getStatusIcon = (isReturned, isOverdue) => {
    if (isReturned) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (isOverdue) return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    return <ClockIcon className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(borrowedBook.is_returned, borrowedBook.is_overdue)}
            <h3 className="text-lg font-semibold text-gray-900">
              {borrowedBook.title}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            by {borrowedBook.author_name}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <UserIcon className="h-4 w-4 mr-2" />
              Borrowed by: <span className="font-medium ml-1">{borrowedBook.borrower_name}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Borrowed on: <span className="font-medium ml-1">{formatDate(borrowedBook.borrowed_date)}</span>
            </div>

            {borrowedBook.is_returned && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Returned on: <span className="font-medium ml-1">{formatDate(borrowedBook.actual_return_date)}</span>
              </div>
            )}

            {borrowedBook.notes && (
              <p className="text-sm text-gray-600 italic">
                Note: {borrowedBook.notes}
              </p>
            )}
          </div>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDaysColor(borrowedBook.days_borrowed, borrowedBook.is_returned, borrowedBook.is_overdue)}`}>
            {borrowedBook.is_returned ? 'Returned' : `${borrowedBook.days_borrowed} days`}
          </span>

          {!borrowedBook.is_returned && (
            <button
              onClick={() => onMarkReturned(borrowedBook.id)}
              className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Mark Returned
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function BorrowedBooks() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });
  const queryClient = useQueryClient();
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();

  const { data: borrowedBooks, isLoading, error } = useQuery({
    queryKey: ['borrowed-books'],
    queryFn: () => borrowedApi.getAll().then(res => res.data),
  });

  const markReturnedMutation = useMutation({
    mutationFn: borrowedApi.markAsReturned,
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowed-books']);
      showSuccess('Success!', 'Book marked as returned!');
    },
    onError: () => {
      showError('Error', 'Error marking book as returned. Please try again.');
    },
  });

  const handleMarkReturned = (id) => {
    setConfirmDialog({
      isOpen: true,
      id,
      title: 'Mark as Returned',
      message: 'Mark this book as returned? This will update the return date and make the book available for lending again.',
      confirmText: 'Mark Returned',
      cancelText: 'Cancel'
    });
  };

  const handleConfirmReturn = () => {
    markReturnedMutation.mutate(confirmDialog.id, {
      actual_return_date: new Date().toISOString().split('T')[0]
    });
    setConfirmDialog({ isOpen: false, id: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading borrowed books...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading borrowed books</h3>
        <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
      </div>
    );
  }

  const activeBorrowedBooks = borrowedBooks?.filter(book => !book.is_returned) || [];
  const returnedBooks = borrowedBooks?.filter(book => book.is_returned) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Borrowed Books</h1>
            <p className="text-gray-600">Track books you've lent to others</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Lend a Book
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowRightOnRectangleIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Currently Borrowed</dt>
                    <dd className="text-lg font-medium text-gray-900">{activeBorrowedBooks.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                                         <dt className="text-sm font-medium text-gray-500 truncate">Overdue (&gt;60 days)</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeBorrowedBooks.filter(book => book.is_overdue).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Returned</dt>
                    <dd className="text-lg font-medium text-gray-900">{returnedBooks.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currently Borrowed Books */}
        {activeBorrowedBooks.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Currently Borrowed</h2>
            <div className="grid gap-4">
              {activeBorrowedBooks.map((book) => (
                <BorrowedBookCard
                  key={book.id}
                  borrowedBook={book}
                  onMarkReturned={handleMarkReturned}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recently Returned Books */}
        {returnedBooks.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recently Returned</h2>
            <div className="grid gap-4">
              {returnedBooks.slice(0, 5).map((book) => (
                <BorrowedBookCard
                  key={book.id}
                  borrowedBook={book}
                  onMarkReturned={handleMarkReturned}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!borrowedBooks || borrowedBooks.length === 0) && (
          <div className="text-center py-12">
            <ArrowRightOnRectangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No borrowed books</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start tracking books you've lent to others.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Lend your first book
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddBorrowedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        showError={showError}
        showSuccess={showSuccess}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: null })}
        onConfirm={handleConfirmReturn}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type="info"
      />

      <NotificationToast
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </>
  );
} 