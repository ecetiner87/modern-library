import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authorsApi } from '../services/api';
import { UserIcon, BookOpenIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Authors() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['authors-from-books', { search: debouncedSearch }],
    queryFn: () => authorsApi.getFromBooks({ 
      search: debouncedSearch || undefined
    }).then(res => res.data),
    keepPreviousData: true,
  });

  // Debug logging
  console.log('Authors API Response:', data);
  console.log('Authors API Error:', error);
  console.log('Authors API Loading:', isLoading);

  // Query for selected author's books
  const { data: authorData, isLoading: loadingAuthor } = useQuery({
    queryKey: ['author-books', selectedAuthor?.first_name, selectedAuthor?.last_name],
    queryFn: () => authorsApi.getBooksByAuthor(selectedAuthor.first_name, selectedAuthor.last_name).then(res => res.data),
    enabled: !!(selectedAuthor?.first_name && selectedAuthor?.last_name),
  });

  // Debug logging for author books
  console.log('Author Books API Response:', authorData);
  console.log('Author Books Loading:', loadingAuthor);

  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const handleAuthorClick = (author) => {
    setSelectedAuthor(author);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAuthor(null);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Loading authors...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Error loading authors: {error.message}</div>;
  }

  const authors = data || [];
  const safeAuthors = Array.isArray(authors) ? authors : [];
  
  // Sort authors alphabetically by full_name
  const sortedAuthors = safeAuthors.sort((a, b) => {
    const nameA = (a.full_name || `${a.first_name} ${a.last_name}`).toLowerCase();
    const nameB = (b.full_name || `${b.first_name} ${b.last_name}`).toLowerCase();
    return nameA.localeCompare(nameB);
  });
  
  console.log('Processed authors:', sortedAuthors);
  const pagination = { total: sortedAuthors.length, page: 1, pages: 1, limit: sortedAuthors.length };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search authors..."
            value={searchInput}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Authors ({pagination.total || 0})
          </h2>
        </div>
        <div className="p-6">
          {sortedAuthors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No authors found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedAuthors.map((author, index) => (
                  <div
                    key={`${author.first_name}-${author.last_name}-${index}`}
                    onClick={() => handleAuthorClick(author)}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <UserIcon className="h-6 w-6 text-gray-400 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {author.full_name}
                        </h3>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <BookOpenIcon className="h-4 w-4 mr-1" />
                          {author.book_count} book{author.book_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} authors
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Author Books Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedAuthor?.full_name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {loadingAuthor ? 'Loading books...' : `${authorData?.books?.length || 0} books`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingAuthor ? (
                <div className="text-center py-8 text-gray-500">
                  Loading books...
                </div>
              ) : authorData?.books?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No books found for this author.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {authorData?.books?.map((book) => (
                    <div key={book.id} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {book.title}
                      </h3>
                      {book.category_name && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-2">
                          {book.category_name}
                        </span>
                      )}
                      <div className="text-xs text-gray-500 space-y-1">
                        {book.publication_year && (
                          <div>Year: {book.publication_year}</div>
                        )}
                        {book.rating && (
                          <div className="flex items-center">
                            Rating: 
                            <div className="flex ml-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={i < book.rating ? 'text-yellow-400' : 'text-gray-300'}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className={`font-medium ${book.is_read ? 'text-green-600' : 'text-gray-500'}`}>
                          {book.is_read ? 'Read' : 'Not Read'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 