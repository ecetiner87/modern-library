import React from 'react';
import { useParams } from 'react-router-dom';

export default function BookDetails() {
  const { id } = useParams();
  
  return (
    <div className="text-center py-12">
      <h3 className="mt-2 text-sm font-medium text-gray-900">Book Details</h3>
      <p className="mt-1 text-sm text-gray-500">
        Viewing book ID: {id}
      </p>
    </div>
  );
} 