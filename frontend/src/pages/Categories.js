import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TagIcon, 
  BookOpenIcon, 
  ChevronRightIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { categoriesApi } from '../services/api';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div 
      onClick={() => onClick(category)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <TagIcon 
              className="h-6 w-6"
              style={{ color: category.color }}
            />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500">
              {category.book_count} {category.book_count === 1 ? 'book' : 'books'}
            </p>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
      </div>

      {category.description && (
        <p className="text-sm text-gray-600 mb-4">{category.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Books in Category</span>
          <span className="font-medium">
            {category.book_count || 0}
          </span>
        </div>
        
        <div className="w-full bg-indigo-100 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-indigo-600"
            style={{ 
              width: `${Math.min((category.book_count / 10) * 100, 100)}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const showPages = 5;
    
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === currentPage
                    ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const CategoryDetail = ({ category, onBack }) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category-books', category.id, selectedSubcategory],
    queryFn: () => categoriesApi.getBooksByCategory(category.id, 
      selectedSubcategory ? { subcategory: selectedSubcategory } : {}
    ).then(res => res.data),
    enabled: Boolean(category.id)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const books = categoryData?.books || [];
  const stats = categoryData?.category || {};
  const subcategories = stats.subcategories || [];

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
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <TagIcon 
                className="h-6 w-6"
                style={{ color: category.color }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600">
                {stats.total_books} books • {stats.read_books} read
                {stats.avg_rating > 0 && ` • ${stats.avg_rating} ★`}
              </p>
            </div>
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
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FolderOpenIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{subcategories.length}</p>
              <p className="text-sm text-gray-600">Subcategories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Filter */}
      {subcategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Filter by Subcategory</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !selectedSubcategory
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total_books})
            </button>
            {subcategories.map((sub, index) => (
              <button
                key={index}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedSubcategory === sub
                    ? 'text-white border border-transparent'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedSubcategory === sub ? category.color : undefined
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Books List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Books in {category.name}
            {selectedSubcategory && ` - ${selectedSubcategory}`}
          </h2>
          <span className="text-sm text-gray-500">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        </div>
        
        {books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedSubcategory 
                ? `No books found in ${selectedSubcategory} subcategory`
                : `No books found in ${category.name} category`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{book.title}</h3>
                
                <div className="space-y-2">
                  {book.author_first_name && book.author_last_name && (
                    <p className="text-sm text-gray-600">
                      by {book.author_first_name} {book.author_last_name}
                    </p>
                  )}
                  
                  {book.sub_category && (
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {book.sub_category}
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
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>{book.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    {book.publication_year && <span>{book.publication_year}</span>}
                    {book.pages && <span>{book.pages} pages</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories', { search: debouncedSearch, page, limit }],
    queryFn: () => categoriesApi.getAll({ 
      search: debouncedSearch || undefined, 
      page, 
      limit 
    }).then(res => res.data),
  });

  if (selectedCategory) {
    return (
      <CategoryDetail 
        category={selectedCategory} 
        onBack={() => setSelectedCategory(null)}
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
        <p className="text-red-500">Error loading categories: {error.message}</p>
      </div>
    );
  }

  const categories = data?.data || [];
  const pagination = data?.pagination || {};
  const totalBooks = categories.reduce((sum, cat) => sum + (parseInt(cat.book_count) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">
            {pagination.total || 0} categories • {totalBooks} books
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search categories..."
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{pagination.total || 0}</p>
              <p className="text-sm text-gray-600">Total Categories</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{totalBooks}</p>
              <p className="text-sm text-gray-600">Total Books</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">
                {categories.length > 0 ? Math.round(totalBooks / categories.length) : 0}
              </p>
              <p className="text-sm text-gray-600">Avg Books/Category</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
    <div className="text-center py-12">
      <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {debouncedSearch ? 'No categories found' : 'No categories available'}
          </h3>
      <p className="mt-1 text-sm text-gray-500">
            {debouncedSearch 
              ? `No categories match "${debouncedSearch}"`
              : 'Add some books to see categories here'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id}
                category={category} 
                onClick={setSelectedCategory}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination 
            currentPage={pagination.page || 1}
            totalPages={pagination.pages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
} 