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
      wishlistStats,
      categoryStats,
      readingActivity
    ] = await Promise.all([
      db('books').count('id as count').first(),
      db('books').where('is_read', true).count('id as count').first(),
      // Count from borrowed_books table instead of books.is_borrowed
      db('borrowed_books').where('is_returned', false).count('id as count').first(),
      // Count unique authors from books table (using first_name + last_name)
      db.raw(`
        SELECT COUNT(DISTINCT (author_first_name || ' ' || author_last_name)) as count
        FROM books 
        WHERE author_first_name IS NOT NULL 
        AND author_last_name IS NOT NULL 
        AND author_first_name != ''
        AND author_last_name != ''
      `).then(result => result.rows[0]),
      db('categories').count('id as count').first(),
      db('reading_history')
        .join('books', 'reading_history.book_id', 'books.id')
        .select(
          'books.title',
          db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`),
          'reading_history.finish_date'
        )
        .orderBy('reading_history.finish_date', 'desc')
        .limit(5),
      // Get wishlist stats (PostgreSQL boolean handling)
      db('wishlist').where('is_purchased', false).count('id as count').first(),
      // Category distribution for charts
      db('categories')
        .leftJoin('books', 'categories.id', 'books.category_id')
        .select(
          'categories.name',
          'categories.color',
          db.raw('COUNT(books.id) as book_count')
        )
        .groupBy('categories.id', 'categories.name', 'categories.color')
        .havingRaw('COUNT(books.id) > 0')
        .orderBy('book_count', 'desc'),
      // Monthly reading activity for line chart
      db('reading_history')
        .select(
          db.raw("DATE_TRUNC('month', finish_date) as month"),
          db.raw('COUNT(*) as books_read')
        )
        .whereRaw("finish_date >= NOW() - INTERVAL '12 months'")
        .groupBy(db.raw("DATE_TRUNC('month', finish_date)"))
        .orderBy('month')
    ]);

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
      recent_activity: recentActivity,
      category_stats: categoryStats.map(stat => ({
        name: stat.name,
        value: parseInt(stat.book_count),
        color: stat.color || '#8B5CF6'
      })),
      reading_activity: readingActivity.map(activity => ({
        month: activity.month.toISOString().slice(0, 7), // Format as YYYY-MM
        books_read: parseInt(activity.books_read)
      }))
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
      let date;
      if (typeof item.finish_date === 'string') {
        date = new Date(item.finish_date);
      } else if (typeof item.finish_date === 'number') {
        date = new Date(item.finish_date);
      } else {
        date = item.finish_date;
      }
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
        db.raw('SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) as books_read')
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