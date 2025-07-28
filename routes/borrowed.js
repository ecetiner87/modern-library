const express = require('express');
const router = express.Router();
const db = require('../database/config');
const { body, validationResult } = require('express-validator');

// Get borrowed books
router.get('/', async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    let query = db('borrowed_books')
      .join('books', 'borrowed_books.book_id', 'books.id')
      .select(
        'borrowed_books.*',
        'books.title',
        'books.publisher',
        db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`)
      );

    if (status === 'active') {
      query = query.where('borrowed_books.is_returned', 0); // SQLite uses 0/1 for boolean
    } else if (status === 'returned') {
      query = query.where('borrowed_books.is_returned', 1);
    }

    const borrowed = await query.orderBy('borrowed_books.borrowed_date', 'desc');

    // Calculate days borrowed for each entry
    const enrichedBorrowed = borrowed.map(item => {
      const borrowedDate = new Date(item.borrowed_date);
      const now = new Date();
      const daysBorrowed = Math.floor((now - borrowedDate) / (1000 * 60 * 60 * 24));
      
      return {
        ...item,
        author_name: item.author_name || 'Unknown Author',
        days_borrowed: daysBorrowed,
        is_overdue: daysBorrowed > 60 && !item.is_returned
      };
    });

    res.json(enrichedBorrowed);
  } catch (error) {
    console.error('Error fetching borrowed books:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch borrowed books', details: error.message });
  }
});

// Get available books for borrowing
router.get('/available-books', async (req, res) => {
  try {
    const books = await db('books')
      .select(
        'books.id',
        'books.title',
        'books.publisher',
        db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`)
      )
      .where('books.is_borrowed', false)
      .orderBy('books.title');

    const enrichedBooks = books.map(book => ({
      ...book,
      author_name: book.author_name || 'Unknown Author'
    }));

    res.json(enrichedBooks);
  } catch (error) {
    console.error('Error fetching available books:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch available books', details: error.message });
  }
});

// Lend a book
router.post('/', [
  body('book_id').isInt().withMessage('Book ID is required'),
  body('borrower_name').notEmpty().withMessage('Borrower name is required'),
  body('borrowed_date').isISO8601().withMessage('Valid borrowed date is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await db.transaction(async (trx) => {
      // Mark book as borrowed
      await trx('books')
        .where('id', req.body.book_id)
        .update({ is_borrowed: true });

      // Add borrowed record
      await trx('borrowed_books').insert(req.body);
    });

    res.status(201).json({ message: 'Book lent successfully' });
  } catch (error) {
    console.error('Error lending book:', error);
    res.status(500).json({ error: 'Failed to lend book' });
  }
});

// Return a book
router.patch('/:id/return', async (req, res) => {
  try {
    const { actual_return_date = new Date() } = req.body;

    await db.transaction(async (trx) => {
      // Get the borrowed record
      const borrowed = await trx('borrowed_books')
        .where('id', req.params.id)
        .first();

      if (!borrowed) {
        throw new Error('Borrowed record not found');
      }

      // Mark as returned
      await trx('borrowed_books')
        .where('id', req.params.id)
        .update({
          is_returned: true,
          actual_return_date: actual_return_date
        });

      // Mark book as not borrowed
      await trx('books')
        .where('id', borrowed.book_id)
        .update({ is_borrowed: false });
    });

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ error: 'Failed to return book' });
  }
});

module.exports = router; 