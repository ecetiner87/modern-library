import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TagIcon, 
  BookOpenIcon, 
  ChevronRightIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { categoriesApi } from '../services/api';

const CategoryCard = ({ category, onClick }) => {
  const readPercentage = category.book_count > 0 
    ? (category.read_count / category.book_count) * 100 
    : 0;

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
          <span className="text-gray-600">Read Progress</span>
          <span className="font-medium">
            {category.read_count || 0}/{category.book_count}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full"
            style={{ 
              width: `${readPercentage}%`,
              backgroundColor: category.color
            }}
          ></div>
        </div>

        {/* Subcategories preview */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              {category.subcategories.length} subcategories
            </p>
            <div className="flex flex-wrap gap-1">
              {category.subcategories.slice(0, 3).map((sub, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {sub.sub_category}
                </span>
              ))}
              {category.subcategories.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{category.subcategories.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
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

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories-distribution'],
    queryFn: () => categoriesApi.getDistribution().then(res => res.data),
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

  const categoriesList = categories || [];
  const totalBooks = categoriesList.reduce((sum, cat) => sum + (cat.book_count || 0), 0);
  const totalRead = categoriesList.reduce((sum, cat) => sum + (cat.read_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">
            {categoriesList.length} categories • {totalBooks} books • {totalRead} read
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{categoriesList.length}</p>
              <p className="text-sm text-gray-600">Categories</p>
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
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{totalRead}</p>
              <p className="text-sm text-gray-600">Books Read</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">
                {totalBooks > 0 ? Math.round((totalRead / totalBooks) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {categoriesList.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add some books to see categories here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesList.map((category) => (
            <CategoryCard 
              key={category.id}
              category={category} 
              onClick={setSelectedCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
} 