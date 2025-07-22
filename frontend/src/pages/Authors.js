import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UsersIcon, 
  BookOpenIcon, 
  StarIcon, 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { authorsApi } from '../services/api';

const AuthorCard = ({ author, onClick }) => {
  const avgRating = parseFloat(author.avg_rating) || 0;

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-3 w-3 ${
              i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">({rating})</span>
      </div>
    );
  };

  return (
    <div 
      onClick={() => onClick(author)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <UsersIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {author.full_name}
            </h3>
            <p className="text-sm text-gray-500">
              {author.book_count} {author.book_count === 1 ? 'book' : 'books'}
            </p>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Read Progress</span>
          <span className="font-medium">
            {author.read_count}/{author.book_count}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full"
            style={{ 
              width: `${author.book_count > 0 ? (author.read_count / author.book_count) * 100 : 0}%` 
            }}
          ></div>
        </div>
        
        {avgRating > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Average Rating</span>
            {renderStars(avgRating)}
          </div>
        )}
      </div>
    </div>
  );
};

const AuthorDetail = ({ author, onBack }) => {
  const { data: authorData, isLoading } = useQuery({
    queryKey: ['author-books', author.first_name, author.last_name],
    queryFn: () => authorsApi.getBooksByAuthor(author.first_name, author.last_name).then(res => res.data),
    enabled: Boolean(author.first_name && author.last_name)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const books = authorData?.books || [];
  const stats = authorData?.author || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 mr-3"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stats.full_name}</h1>
            <p className="text-gray-600">
              {stats.total_books} books • {stats.read_books} read
              {stats.avg_rating > 0 && ` • ${stats.avg_rating} ★`}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.total_books}</p>
              <p className="text-sm text-gray-600">Total Books</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.read_books}</p>
              <p className="text-sm text-gray-600">Books Read</p>
            </div>
          </div>
        </div>
        
        {stats.avg_rating > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-500 fill-current" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-gray-900">{stats.avg_rating}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Books List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Books by {stats.full_name}</h2>
        
        {books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No books by this author in your library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{book.title}</h3>
                
                {book.category_name && (
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white mb-2"
                    style={{ backgroundColor: book.category_color || '#6B7280' }}
                  >
                    {book.category_name}
                  </span>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {book.is_read ? (
                      <span className="text-green-600 font-medium">✓ Read</span>
                    ) : (
                      <span className="text-gray-400">Not Read</span>
                    )}
                  </span>
                  
                  {book.rating && (
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{book.rating}</span>
                    </div>
                  )}
                </div>
                
                {book.publication_year && (
                  <p className="text-xs text-gray-400 mt-2">{book.publication_year}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Authors() {
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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

  const { data: authors, isLoading, error } = useQuery({
    queryKey: ['authors-from-books', { search: debouncedSearch }],
    queryFn: () => authorsApi.getFromBooks({ search: debouncedSearch }).then(res => res.data),
  });

  if (selectedAuthor) {
    return (
      <AuthorDetail 
        author={selectedAuthor} 
        onBack={() => setSelectedAuthor(null)}
      />
    );
  }

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
        <p className="text-red-500">Error loading authors: {error.message}</p>
      </div>
    );
  }

  const authorsList = authors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
          <p className="text-gray-600">
            {authorsList.length} authors in your library
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search authors..."
          value={searchInput}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Authors Grid */}
      {authorsList.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No authors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {debouncedSearch ? 'Try a different search term' : 'Add some books to see authors here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authorsList.map((author, index) => (
            <AuthorCard 
              key={`${author.first_name}-${author.last_name}-${index}`}
              author={author} 
              onClick={setSelectedAuthor}
            />
          ))}
        </div>
      )}
    </div>
  );
} 