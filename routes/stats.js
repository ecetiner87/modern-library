const express = require('express');
const router = express.Router();
const db = require('../database/config');

// Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    const [
      totalBooks,
      readBooks,
      borrowedBooks,
      uniqueAuthors,
      totalCategories,
      recentActivity,
      wishlistStats
    ] = await Promise.all([
      db('books').count('id as count').first(),
      db('books').where('is_read', true).count('id as count').first(),
      db('books').where('is_borrowed', true).count('id as count').first(),
      // Count unique authors from books table (using first_name + last_name)
      db('books')
        .whereNotNull('author_first_name')
        .whereNotNull('author_last_name')
        .select(db.raw("COUNT(DISTINCT (author_first_name || ' ' || author_last_name)) as count"))
        .first(),
      db('categories').count('id as count').first(),
      db('reading_history')
        .join('books', 'reading_history.book_id', 'books.id')
        .select(
          'books.title',
          db.raw("(books.author_first_name || ' ' || books.author_last_name) as author_name"),
          'reading_history.finish_date'
        )
        .whereNotNull('books.author_first_name')
        .whereNotNull('books.author_last_name'),
      // Get wishlist stats from the dedicated wishlist table (SQLite boolean compatibility)
      db('wishlist').where('is_purchased', 0).count('id as count').first()
    ]);

    // Sort recent activity chronologically (handle mixed date formats)
    const sortedActivity = recentActivity
      .map(item => ({
        ...item,
        sortDate: item.finish_date.toString().includes('-') 
          ? new Date(item.finish_date)
          : new Date(parseInt(item.finish_date))
      }))
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 5)
      .map(({ sortDate, ...item }) => item); // Remove the temporary sortDate field

    res.json({
      overview: {
        total_books: parseInt(totalBooks.count),
        read_books: parseInt(readBooks.count),
        wishlist_books: parseInt(wishlistStats.count),
        borrowed_books: parseInt(borrowedBooks.count),
        total_authors: parseInt(uniqueAuthors.count),
        total_categories: parseInt(totalCategories.count),
        reading_percentage: totalBooks.count > 0 
          ? Math.round((readBooks.count / totalBooks.count) * 100) 
          : 0
      },
      recent_activity: sortedActivity
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get books by category distribution
router.get('/category-distribution', async (req, res) => {
  try {
    const distribution = await db('categories')
      .leftJoin('books', 'categories.id', 'books.category_id')
      .select(
        'categories.name',
        'categories.color',
        db.raw('COUNT(books.id) as book_count')
      )
      .groupBy('categories.id', 'categories.name', 'categories.color')
      .orderBy('book_count', 'desc');

    res.json(distribution);
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).json({ error: 'Failed to fetch category distribution' });
  }
});

// Get reading progress over time
router.get('/reading-progress', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    // Get all reading history data first
    const allHistory = await db('reading_history').select('finish_date');
    
    // Process dates in JavaScript (handle mixed formats)
    const processedHistory = allHistory.map(item => {
      const date = item.finish_date.toString().includes('-') 
        ? new Date(item.finish_date)
        : new Date(parseInt(item.finish_date));
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1
      };
    });

    // Filter by year and count by month
    const monthCounts = processedHistory
      .filter(item => item.year === parseInt(year))
      .reduce((acc, item) => {
        acc[item.month] = (acc[item.month] || 0) + 1;
        return acc;
      }, {});

    // Fill missing months with 0
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      books_read: monthCounts[i + 1] || 0
    }));

    res.json({
      year: parseInt(year),
      monthly_data: months
    });
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    res.status(500).json({ error: 'Failed to fetch reading progress' });
  }
});

// Get top authors by book count
router.get('/top-authors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get authors from books table (since authors are stored there)
    const authorsData = await db('books')
      .select(
        db.raw("(author_first_name || ' ' || author_last_name) as name"),
        db.raw('COUNT(*) as book_count'),
        db.raw('SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as books_read')
      )
      .whereNotNull('author_first_name')
      .whereNotNull('author_last_name')
      .groupBy('author_first_name', 'author_last_name')
      .orderBy('book_count', 'desc')
      .limit(limit);

    res.json(authorsData);
  } catch (error) {
    console.error('Error fetching top authors:', error);
    res.status(500).json({ error: 'Failed to fetch top authors' });
  }
});

// Get reading streaks and achievements
router.get('/achievements', async (req, res) => {
  try {
    // Get all reading history data
    const allHistory = await db('reading_history').select('finish_date', 'rating');
    
    // Process dates and calculate achievements in JavaScript
    const processedHistory = allHistory.map(item => {
      const date = item.finish_date.toString().includes('-') 
        ? new Date(item.finish_date)
        : new Date(parseInt(item.finish_date));
      return {
        date: date,
        rating: item.rating
      };
    }).sort((a, b) => a.date - b.date);

    // Calculate achievements
    const totalBooks = processedHistory.length;
    
    // Get books read in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBooks = processedHistory.filter(item => item.date >= thirtyDaysAgo);
    
    // Calculate unique reading days
    const uniqueDays = new Set(
      processedHistory.map(item => item.date.toDateString())
    ).size;

    // Calculate average rating
    const ratingsOnly = processedHistory.filter(item => item.rating && item.rating > 0);
    const avgRating = ratingsOnly.length > 0 
      ? (ratingsOnly.reduce((sum, item) => sum + item.rating, 0) / ratingsOnly.length)
      : 0;

    res.json({
      longest_streak: totalBooks, // Simplified - could implement proper streak calculation
      current_streak: recentBooks.length,
      total_reading_days: uniqueDays,
      average_rating: avgRating.toFixed(1)
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

module.exports = router; 