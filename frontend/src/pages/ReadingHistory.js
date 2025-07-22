import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClockIcon, BookOpenIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/outline';
import { readingHistoryApi } from '../services/api';

export default function ReadingHistory() {
  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['reading-history'],
    queryFn: () => readingHistoryApi.getAll().then(res => res.data),
  });

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <p className="text-red-500">Error loading reading history: {error.message}</p>
      </div>
    );
  }

  const history = historyData || [];

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Reading History</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start marking books as read to see your reading history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reading History</h1>
          <p className="text-gray-600">
            {history.length} books finished
          </p>
        </div>
      </div>

      {/* Reading History List */}
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <BookOpenIcon className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {entry.title}
                  </h3>
                </div>
                
                {entry.author_name && (
                  <p className="text-sm text-gray-600 mb-2">
                    by {entry.author_name}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Finished: {formatDate(entry.finish_date)}
                  </div>
                  
                  {entry.pages && (
                    <div className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {entry.pages} pages
                    </div>
                  )}
                </div>
                
                {entry.rating && (
                  <div className="mt-2">
                    {renderStars(entry.rating)}
                  </div>
                )}
                
                {entry.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{entry.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-1"></span>
                  Completed
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 