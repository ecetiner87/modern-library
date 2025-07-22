const express = require('express');
const router = express.Router();
const db = require('../database/config');
const { body, validationResult } = require('express-validator');

// Get authors from books data (using first_name + last_name)
router.get('/from-books', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = db('books')
      .select(
        db.raw('author_first_name as first_name'),
        db.raw('author_last_name as last_name'),
        db.raw('CONCAT(author_first_name, " ", author_last_name) as full_name'),
        db.raw('COUNT(*) as book_count'),
        db.raw('SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count'),
        db.raw('AVG(CASE WHEN rating IS NOT NULL AND rating > 0 THEN rating END) as avg_rating')
      )
      .whereNotNull('author_first_name')
      .whereNotNull('author_last_name')
      .where('author_first_name', '!=', '')
      .where('author_last_name', '!=', '')
      .groupBy('author_first_name', 'author_last_name');

    if (search) {
      query = query.where(function() {
        this.where('author_first_name', 'like', `%${search}%`)
            .orWhere('author_last_name', 'like', `%${search}%`);
      });
    }

    const authors = await query.orderBy('author_last_name');

    res.json(authors);
  } catch (error) {
    console.error('Error fetching authors from books:', error);
    res.status(500).json({ error: 'Failed to fetch authors from books' });
  }
});

// Get books by author name (first_name + last_name)
router.get('/books/:firstName/:lastName', async (req, res) => {
  try {
    const { firstName, lastName } = req.params;
    
    const books = await db('books')
      .leftJoin('categories', 'books.category_id', 'categories.id')
      .select(
        'books.*',
        'categories.name as category_name',
        'categories.color as category_color'
      )
      .where('author_first_name', firstName)
      .where('author_last_name', lastName)
      .orderBy('books.title');

    const authorStats = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      total_books: books.length,
      read_books: books.filter(book => book.is_read).length,
      avg_rating: books.filter(book => book.rating).reduce((sum, book, _, arr) => 
        arr.length ? sum + book.rating / arr.length : 0, 0
      ).toFixed(1)
    };

    res.json({
      author: authorStats,
      books
    });
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({ error: 'Failed to fetch books by author' });
  }
});

// Get single author by ID  
router.get('/:id', async (req, res) => {
  try {
    const author = await db('authors')
      .where('id', req.params.id)
      .first();

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    // Get books by this author
    const books = await db('books')
      .leftJoin('categories', 'books.category_id', 'categories.id')
      .where('books.author_id', req.params.id)
      .select('books.*', 'categories.name as category_name');

    res.json({ ...author, books });
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ error: 'Failed to fetch author' });
  }
});

// Create new author
router.post('/', [
  body('name').notEmpty().withMessage('Author name is required'),
  body('birth_date').optional().isISO8601().withMessage('Birth date must be a valid date'),
  body('death_date').optional().isISO8601().withMessage('Death date must be a valid date'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [newAuthor] = await db('authors').insert(req.body).returning('*');
    res.status(201).json(newAuthor);
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ error: 'Failed to create author' });
  }
});

// Update author
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Author name cannot be empty'),
  body('birth_date').optional().isISO8601().withMessage('Birth date must be a valid date'),
  body('death_date').optional().isISO8601().withMessage('Death date must be a valid date'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [updatedAuthor] = await db('authors')
      .where('id', req.params.id)
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');

    if (!updatedAuthor) {
      return res.status(404).json({ error: 'Author not found' });
    }

    res.json(updatedAuthor);
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// Delete author
router.delete('/:id', async (req, res) => {
  try {
    // Check if author has books
    const bookCount = await db('books')
      .where('author_id', req.params.id)
      .count('id as count')
      .first();

    if (parseInt(bookCount.count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete author that has books assigned to them' 
      });
    }

    const deleted = await db('authors').where('id', req.params.id).del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Author not found' });
    }

    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ error: 'Failed to delete author' });
  }
});

// Get all authors (traditional authors table)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = db('authors')
      .leftJoin('books', 'authors.id', 'books.author_id')
      .select(
        'authors.*',
        db.raw('COUNT(books.id) as book_count')
      )
      .groupBy('authors.id');

    if (search) {
      query = query.where('authors.name', 'like', `%${search}%`);
    }

    const authors = await query.orderBy('authors.name');

    res.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Failed to fetch authors' });
  }
});

module.exports = router; 