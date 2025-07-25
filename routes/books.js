const express = require('express');
const router = express.Router();
const db = require('../database/config');
const { body, validationResult } = require('express-validator');

// Get all books with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      category, 
      author, 
      is_read, 
      is_wishlist, 
      is_borrowed,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = db('books')
      .leftJoin('categories', 'books.category_id', 'categories.id')
      .select(
        'books.*',
        db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`),
        'categories.name as category_name',
        'categories.color as category_color'
      );

    // Apply filters
    if (search) {
      query = query.where(function() {
        this.where('books.title', 'like', `%${search}%`)
            .orWhere('books.description', 'like', `%${search}%`)
            .orWhere('books.author_first_name', 'like', `%${search}%`)
            .orWhere('books.author_last_name', 'like', `%${search}%`)
            .orWhere('books.translator', 'like', `%${search}%`);
      });
    }

    if (category) {
      query = query.where('books.category_id', category);
    }

    if (author) {
      // Search by author name parts
      query = query.where(function() {
        this.where('books.author_first_name', 'like', `%${author}%`)
            .orWhere('books.author_last_name', 'like', `%${author}%`)
            .orWhere(db.raw(`(books.author_first_name || ' ' || books.author_last_name)`), 'like', `%${author}%`);
      });
    }

    if (is_read !== undefined) {
      query = query.where('books.is_read', is_read === 'true');
    }

    if (is_wishlist !== undefined) {
      query = query.where('books.is_wishlist', is_wishlist === 'true');
    }

    if (is_borrowed !== undefined) {
      query = query.where('books.is_borrowed', is_borrowed === 'true');
    }

    // Get total count for pagination
    const totalCount = await query.clone().clearSelect().count('books.id as count');
    const total = parseInt(totalCount[0].count);

    // Apply sorting and pagination
    const books = await query
      .orderBy(`books.${sort}`, order)
      .limit(limit)
      .offset(offset);

    res.json({
      data: books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await db('books')
      .leftJoin('categories', 'books.category_id', 'categories.id')
      .select(
        'books.*',
        db.raw(`(books.author_first_name || ' ' || books.author_last_name) as author_name`),
        'categories.name as category_name',
        'categories.color as category_color'
      )
      .where('books.id', req.params.id)
      .first();

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get reading history for this book
    const readingHistory = await db('reading_history')
      .where('book_id', req.params.id)
      .orderBy('finish_date', 'desc');

    // Get borrowed history for this book
    const borrowedHistory = await db('borrowed_books')
      .where('book_id', req.params.id)
      .orderBy('borrowed_date', 'desc');

    res.json({
      ...book,
      reading_history: readingHistory,
      borrowed_history: borrowedHistory
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Create new book
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('author_first_name').optional().isString().withMessage('Author first name must be a string'),
  body('author_last_name').optional().isString().withMessage('Author last name must be a string'),
  body('author_id').optional().isInt().withMessage('Author ID must be an integer'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  body('sub_category').optional().isString().withMessage('Sub-category must be a string'),
  body('translator').optional().isString().withMessage('Translator must be a string'),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('publication_year').optional({ checkFalsy: true }).isInt({ min: 1000, max: 2030 }).withMessage('Publication year must be between 1000 and 2030'),
  body('pages').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('is_read').optional().isBoolean().withMessage('Read status must be true or false'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await db.transaction(async (trx) => {
      // Create the book
      const [newBook] = await trx('books').insert(req.body).returning('*');
      
      // If book is marked as read, also create reading history entry
      if (req.body.is_read && req.body.rating) {
        await trx('reading_history').insert({
          book_id: newBook.id,
          finish_date: new Date(),
          rating: req.body.rating,
          notes: req.body.notes || null
        });
      }
      
      res.status(201).json(newBook);
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// Update book
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('author_first_name').optional().isString().withMessage('Author first name must be a string'),
  body('author_last_name').optional().isString().withMessage('Author last name must be a string'),
  body('author_id').optional().isInt().withMessage('Author ID must be an integer'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  body('sub_category').optional().isString().withMessage('Sub-category must be a string'),
  body('translator').optional().isString().withMessage('Translator must be a string'),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('publication_year').optional({ checkFalsy: true }).isInt({ min: 1000, max: 2030 }).withMessage('Publication year must be between 1000 and 2030'),
  body('pages').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('is_read').optional().isBoolean().withMessage('Read status must be true or false'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [updatedBook] = await db('books')
      .where('id', req.params.id)
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Mark book as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { finish_date, rating, notes } = req.body;
    
    // Start transaction
    await db.transaction(async (trx) => {
      // Update book status and rating
      const updateData = { 
        is_read: true, 
        updated_at: new Date() 
      };
      
      // Only update rating in books table if provided
      if (rating) {
        updateData.rating = rating;
      }
      
      await trx('books')
        .where('id', req.params.id)
        .update(updateData);

      // Add to reading history
      await trx('reading_history').insert({
        book_id: req.params.id,
        finish_date: finish_date || new Date(),
        rating: rating,
        notes: notes
      });
    });

    res.json({ message: 'Book marked as read successfully' });
  } catch (error) {
    console.error('Error marking book as read:', error);
    res.status(500).json({ error: 'Failed to mark book as read' });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('books').where('id', req.params.id).del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router; 