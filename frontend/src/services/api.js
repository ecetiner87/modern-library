import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth (if needed later)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Books API
export const booksApi = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  markAsRead: (id, data) => api.patch(`/books/${id}/read`, data),
};

// Authors API
export const authorsApi = {
  getAll: (params = {}) => api.get('/authors', { params }),
  getFromBooks: (params = {}) => api.get('/authors/from-books', { params }),
  getBooksByAuthor: (firstName, lastName) => api.get(`/authors/books/${firstName}/${lastName}`),
  getById: (id) => api.get(`/authors/${id}`),
  create: (data) => api.post('/authors', data),
  update: (id, data) => api.put(`/authors/${id}`, data),
  delete: (id) => api.delete(`/authors/${id}`)
};

// Categories API
export const categoriesApi = {
  getAll: (params = {}) => api.get('/categories', { params }),
  getDistribution: () => api.get('/categories/distribution'),
  getBooksByCategory: (id, params = {}) => api.get(`/categories/${id}/books`, { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Sub-Categories API
export const subCategoriesApi = {
  getAll: () => api.get('/sub-categories'),
  getByCategory: (category) => api.get(`/sub-categories/${category}`),
};

// Reading History API
export const readingHistoryApi = {
  getAll: (params = {}) => api.get('/reading-history', { params }),
};

// Wishlist API
export const wishlistApi = {
  getAll: (params = {}) => api.get('/wishlist', { params }),
  create: (data) => api.post('/wishlist', data),
  update: (id, data) => api.put(`/wishlist/${id}`, data),
  delete: (id) => api.delete(`/wishlist/${id}`),
  markAsPurchased: (id) => api.patch(`/wishlist/${id}/purchase`),
  getStats: () => api.get('/wishlist/stats'),
};

// Borrowed Books API
export const borrowedApi = {
  getAll: (params = {}) => api.get('/borrowed', { params }),
  getAvailableBooks: () => api.get('/borrowed/available-books'),
  create: (data) => api.post('/borrowed', data),
  markAsReturned: (id, data = {}) => api.patch(`/borrowed/${id}/return`, data),
};

// Borrowed Books API
export const borrowedBooksApi = {
  getAll: (params = {}) => api.get('/borrowed', { params }),
  lend: (data) => api.post('/borrowed', data),
  return: (id, data) => api.patch(`/borrowed/${id}/return`, data),
};

// Statistics API
export const statsApi = {
  getOverview: () => api.get('/stats'),
  getCategoryDistribution: () => api.get('/stats/category-distribution'),
  getReadingProgress: (params = {}) => api.get('/stats/reading-progress', { params }),
  getTopAuthors: (params = {}) => api.get('/stats/top-authors', { params }),
  getAchievements: () => api.get('/stats/achievements'),
};

export default api; 