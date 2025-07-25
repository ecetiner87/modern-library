const express = require('express');
const router = express.Router();
const db = require('../database/config');

// Get reading history
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, year } = req.query;
    const offset = (page - 1) * limit;

    let query = db('reading_history')
      .join('books', 'reading_history.book_id', 'books.id')
      .select(
        'reading_history.*',
        'books.title',
        'books.pages',
        db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`)
      );

    if (year) {
      query = query.whereRaw('EXTRACT(YEAR FROM finish_date) = ?', [year]);
    }

    // Fetch data without ordering first (we'll sort in JavaScript)
    const rawHistory = await query;

    // Sort chronologically (handle mixed date formats)
    const sortedHistory = rawHistory
      .map(item => ({
        ...item,
        sortDate: item.finish_date.toString().includes('-') 
          ? new Date(item.finish_date)
          : new Date(parseInt(item.finish_date))
      }))
      .sort((a, b) => b.sortDate - a.sortDate)
      .map(({ sortDate, ...item }) => item); // Remove the temporary sortDate field

    // Apply pagination after sorting
    const paginatedHistory = sortedHistory.slice(offset, offset + limit);

    res.json(paginatedHistory);
  } catch (error) {
    console.error('Error fetching reading history:', error);
    res.status(500).json({ error: 'Failed to fetch reading history' });
  }
});

module.exports = router; 