import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import ReadingHistory from './pages/ReadingHistory';
import Wishlist from './pages/Wishlist';
import BorrowedBooks from './pages/BorrowedBooks';
import CurrentlyReading from './pages/CurrentlyReading';
import Stats from './pages/Stats';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/authors" element={<Authors />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/reading-history" element={<ReadingHistory />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/borrowed" element={<BorrowedBooks />} />
              <Route path="/currently-reading" element={<CurrentlyReading />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App; 