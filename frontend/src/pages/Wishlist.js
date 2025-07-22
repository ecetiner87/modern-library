import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HeartIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ShoppingCartIcon,
  XMarkIcon,
  BanknotesIcon,
  BookOpenIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { wishlistApi } from '../services/api';
import { ConfirmDialog, NotificationToast, useNotifications } from '../components/Modals';

const AddWishModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    book_name: '',
    author_name: '',
    notes: '',
    price: '',
    publisher: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.book_name || !formData.author_name) return;
    
    onAdd({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null
    });
  };

  const handleReset = () => {
    setFormData({
      book_name: '',
      author_name: '',
      notes: '',
      price: '',
      publisher: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Add New Wish</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="book_name" className="block text-sm font-medium text-gray-700">
              Book Name *
            </label>
            <input
              type="text"
              id="book_name"
              required
              value={formData.book_name}
              onChange={(e) => setFormData(prev => ({ ...prev, book_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter book name"
            />
          </div>

          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-gray-700">
              Author Name *
            </label>
            <input
              type="text"
              id="author_name"
              required
              value={formData.author_name}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
              Publisher
            </label>
            <input
              type="text"
              id="publisher"
              value={formData.publisher}
              onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter publisher"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Estimated Price (₺)
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add Wish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WishCard = ({ wish, onDelete, onBuy, onMarkPurchased }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBuy = () => {
    const query = `${wish.author_name} ${wish.book_name}`.toLowerCase().replace(/\s+/g, '+');
    const url = `https://www.cimri.com/arama?q=${query}`;
    window.open(url, '_blank');
    onBuy?.(wish.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border ${wish.is_purchased ? 'border-green-200 bg-green-50' : 'border-gray-200'} hover:shadow-lg transition-shadow duration-300`}>
      <div className="p-6">
        {/* Header with status indicator */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {wish.book_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              {wish.author_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {wish.is_purchased ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Purchased
              </span>
            ) : (
              <HeartSolidIcon className="h-6 w-6 text-red-500" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {wish.publisher && (
            <p className="text-sm text-gray-600 flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              {wish.publisher}
            </p>
          )}
          
          {wish.price && (
            <p className="text-sm text-gray-600 flex items-center">
              <BanknotesIcon className="h-4 w-4 mr-1" />
              ₺{parseFloat(wish.price).toFixed(2)}
            </p>
          )}
          
          {wish.notes && (
            <p className="text-sm text-gray-600 flex items-start">
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1 mt-0.5" />
              <span className="italic">{wish.notes}</span>
            </p>
          )}
        </div>

        {/* Footer with actions and date */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Added: {formatDate(wish.added_date)}
          </div>
          
          <div className="flex space-x-2">
            {!wish.is_purchased && (
              <>
                <button
                  onClick={handleBuy}
                  className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Buy from Cimri.com"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onMarkPurchased(wish.id)}
                  className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Mark as purchased"
                >
                  <HeartSolidIcon className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(wish.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete wish"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Wishlist() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  // Memoize the search input handler
  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  // Fetch wishlist
  const { data: wishes, isLoading, error } = useQuery({
    queryKey: ['wishlist', { search: debouncedSearch }],
    queryFn: () => wishlistApi.getAll({ search: debouncedSearch }).then(res => res.data),
  });

  // Fetch wishlist stats
  const { data: stats } = useQuery({
    queryKey: ['wishlist-stats'],
    queryFn: () => wishlistApi.getStats().then(res => res.data),
  });

  // Add wish mutation
  const addWishMutation = useMutation({
    mutationFn: wishlistApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      queryClient.invalidateQueries(['wishlist-stats']);
      setIsAddModalOpen(false);
      showSuccess('Success!', 'Wish added successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to add wish';
      showError('Error', message);
    },
  });

  // Delete wish mutation
  const deleteWishMutation = useMutation({
    mutationFn: wishlistApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      queryClient.invalidateQueries(['wishlist-stats']);
      showSuccess('Deleted!', 'Wish deleted successfully!');
    },
    onError: () => {
      showError('Error', 'Error deleting wish. Please try again.');
    },
  });

  // Mark as purchased mutation
  const markPurchasedMutation = useMutation({
    mutationFn: wishlistApi.markAsPurchased,
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      queryClient.invalidateQueries(['wishlist-stats']);
      showSuccess('Purchased!', 'Wish marked as purchased!');
    },
    onError: () => {
      showError('Error', 'Error marking wish as purchased. Please try again.');
    },
  });

  const handleAddWish = (wishData) => {
    addWishMutation.mutate(wishData);
  };

  const handleDeleteWish = (id) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      id,
      title: 'Delete Wish',
      message: 'Are you sure you want to delete this wish? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const handleMarkPurchased = (id) => {
    setConfirmDialog({
      isOpen: true,
      type: 'purchase',
      id,
      title: 'Mark as Purchased',
      message: 'Mark this wish as purchased? You can still delete it later if needed.',
      confirmText: 'Mark Purchased',
      cancelText: 'Cancel'
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === 'delete') {
      deleteWishMutation.mutate(confirmDialog.id);
    } else if (confirmDialog.type === 'purchase') {
      markPurchasedMutation.mutate(confirmDialog.id);
    }
    setConfirmDialog({ isOpen: false, type: '', id: null });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">Error loading wishlist</div>
        <button 
          onClick={() => window.location.reload()} 
          className="text-indigo-600 hover:text-indigo-500"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">Books you want to read and buy</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Wish
          </button>
        </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Wishes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_wishes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_wishes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCartIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Purchased</p>
                <p className="text-2xl font-bold text-gray-900">{stats.purchased_wishes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Est. Value</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.estimated_total_value.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search wishes..."
          value={searchInput}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Wishlist */}
      {wishes && wishes.length === 0 ? (
        <div className="text-center py-12">
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No wishes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {debouncedSearch ? 'Try a different search term' : 'Start by adding your first wish!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishes?.map(wish => (
            <WishCard 
              key={wish.id} 
              wish={wish} 
              onDelete={handleDeleteWish}
              onMarkPurchased={handleMarkPurchased}
            />
          ))}
        </div>
      )}

        {/* Add Wish Modal */}
        <AddWishModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddWish}
        />
      </div>

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
    </>
  );
} 