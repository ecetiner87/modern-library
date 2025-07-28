const express = require('express');
const router = express.Router();
const db = require('../database/config');
const { body, validationResult } = require('express-validator');

// Get all currently reading books
router.get('/', async (req, res) => {
  try {
    const currentlyReading = await db('currently_reading')
      .join('books', 'currently_reading.book_id', 'books.id')
      .select(
        'currently_reading.*',
        'books.title',
        'books.publisher',
        'books.publication_year',
        'books.rating',
        'books.is_read',
        db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`)
      )
      .where('currently_reading.is_active', true)
      .orderBy('currently_reading.last_read_date', 'desc');

    res.json(currentlyReading);
  } catch (error) {
    console.error('Error fetching currently reading books:', error);
    res.status(500).json({ error: 'Failed to fetch currently reading books' });
  }
});

// Add a book to currently reading
router.post('/', [
  body('book_id').isInt().withMessage('Book ID is required'),
  body('current_page').isInt({ min: 1 }).withMessage('Current page must be at least 1'),
  body('total_pages').optional().isInt({ min: 1 }).withMessage('Total pages must be at least 1'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { book_id, current_page, total_pages, notes } = req.body;

    // Check if book is already in currently reading
    const existing = await db('currently_reading')
      .where({ book_id, is_active: true })
      .first();

    if (existing) {
      return res.status(400).json({ error: 'Book is already in currently reading list' });
    }

    // Get book details from database to use actual page count
    const book = await db('books')
      .select('pages')
      .where('id', book_id)
      .first();

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Use provided total_pages or book's actual pages from database
    const actualTotalPages = total_pages || book.pages;
    
    // Calculate reading progress only if we have total pages
    const reading_progress = actualTotalPages ? Math.round((current_page / actualTotalPages) * 100 * 100) / 100 : 0;

    const [newReading] = await db('currently_reading')
      .insert({
        book_id,
        current_page,
        total_pages: actualTotalPages,
        reading_progress,
        notes,
        started_date: new Date(),
        last_read_date: new Date()
      })
      .returning('*');

    res.status(201).json(newReading);
  } catch (error) {
    console.error('Error adding book to currently reading:', error);
    res.status(500).json({ error: 'Failed to add book to currently reading' });
  }
});

// Update reading progress
router.patch('/:id', [
  body('current_page').isInt({ min: 1 }).withMessage('Current page must be at least 1'),
  body('total_pages').optional().isInt({ min: 1 }).withMessage('Total pages must be at least 1'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { current_page, total_pages, notes } = req.body;

    // Get current reading record
    const currentReading = await db('currently_reading')
      .where({ id, is_active: true })
      .first();

    if (!currentReading) {
      return res.status(404).json({ error: 'Currently reading record not found' });
    }

    // Get book details from database to use actual page count if not provided
    const book = await db('books')
      .select('pages')
      .where('id', currentReading.book_id)
      .first();

    // Use provided total_pages, existing total_pages, or book's actual pages from database
    const actualTotalPages = total_pages || currentReading.total_pages || book.pages;
    
    // Calculate reading progress only if we have total pages
    const reading_progress = actualTotalPages ? Math.round((current_page / actualTotalPages) * 100 * 100) / 100 : 0;

    const [updatedReading] = await db('currently_reading')
      .where({ id })
      .update({
        current_page,
        total_pages: actualTotalPages,
        reading_progress,
        notes,
        last_read_date: new Date()
      })
      .returning('*');

    res.json(updatedReading);
  } catch (error) {
    console.error('Error updating reading progress:', error);
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
});

// Mark book as finished (remove from currently reading)
router.patch('/:id/finish', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the currently reading record
    const currentReading = await db('currently_reading')
      .where({ id, is_active: true })
      .first();

    if (!currentReading) {
      return res.status(404).json({ error: 'Currently reading record not found' });
    }

    // Mark as inactive
    await db('currently_reading')
      .where({ id })
      .update({ is_active: false });

    res.json({ message: 'Book marked as finished' });
  } catch (error) {
    console.error('Error marking book as finished:', error);
    res.status(500).json({ error: 'Failed to mark book as finished' });
  }
});

// Remove book from currently reading (without marking as read)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db('currently_reading')
      .where({ id, is_active: true })
      .del();

    if (result === 0) {
      return res.status(404).json({ error: 'Currently reading record not found' });
    }

    res.json({ message: 'Book removed from currently reading' });
  } catch (error) {
    console.error('Error removing book from currently reading:', error);
    res.status(500).json({ error: 'Failed to remove book from currently reading' });
  }
});

// Get available books for adding to currently reading
router.get('/available-books', async (req, res) => {
  try {
    const books = await db('books')
      .select(
        'books.id',
        'books.title',
        'books.pages',
        'books.publisher',
        'books.publication_year',
        db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`)
      )
      .where('books.is_read', false)
      .whereNotIn('books.id', function() {
        this.select('book_id').from('currently_reading').where('is_active', true);
      })
      .orderBy('books.title');

    res.json(books);
  } catch (error) {
    console.error('Error fetching available books:', error);
    res.status(500).json({ error: 'Failed to fetch available books' });
  }
});

module.exports = router; 