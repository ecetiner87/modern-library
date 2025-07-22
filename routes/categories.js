const express = require('express');
const router = express.Router();
const db = require('../database/config');
const { body, validationResult } = require('express-validator');

// Get category distribution with subcategories
router.get('/distribution', async (req, res) => {
  try {
    const categories = await db('categories')
      .leftJoin('books', 'categories.id', 'books.category_id')
      .select(
        'categories.*',
        db.raw('COUNT(books.id) as book_count'),
        db.raw('SUM(CASE WHEN books.is_read = 1 THEN 1 ELSE 0 END) as read_count')
      )
      .groupBy('categories.id')
      .orderBy('book_count', 'desc');

    // Get subcategories for each category
    const categoriesWithSubs = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await db('books')
          .select('sub_category')
          .count('* as book_count')
          .where('category_id', category.id)
          .whereNotNull('sub_category')
          .where('sub_category', '!=', '')
          .groupBy('sub_category')
          .orderBy('book_count', 'desc');

        return {
          ...category,
          subcategories: subcategories || []
        };
      })
    );

    res.json(categoriesWithSubs);
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).json({ error: 'Failed to fetch category distribution' });
  }
});

// Get books by category with enhanced data
router.get('/:id/books', async (req, res) => {
  try {
    const { id } = req.params;
    const { subcategory } = req.query;
    
    const category = await db('categories').where('id', id).first();
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let query = db('books')
      .select(
        'books.*',
        'categories.name as category_name',
        'categories.color as category_color'
      )
      .leftJoin('categories', 'books.category_id', 'categories.id')
      .where('books.category_id', id);

    if (subcategory) {
      query = query.where('books.sub_category', subcategory);
    }

    const books = await query.orderBy('books.title');

    // Get statistics
    const stats = {
      total_books: books.length,
      read_books: books.filter(book => book.is_read).length,
      avg_rating: books.filter(book => book.rating).reduce((sum, book, _, arr) => 
        arr.length ? sum + book.rating / arr.length : 0, 0
      ).toFixed(1),
      subcategories: [...new Set(books.filter(book => book.sub_category).map(book => book.sub_category))]
    };

    res.json({
      category: { ...category, ...stats },
      books
    });
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).json({ error: 'Failed to fetch books by category' });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await db('categories')
      .leftJoin('books', 'categories.id', 'books.category_id')
      .select(
        'categories.*',
        db.raw('COUNT(books.id) as book_count')
      )
      .groupBy('categories.id')
      .orderBy('categories.name');

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await db('categories')
      .where('id', req.params.id)
      .first();

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get books in this category
    const books = await db('books')
      .leftJoin('authors', 'books.author_id', 'authors.id')
      .where('books.category_id', req.params.id)
      .select('books.*', 'authors.name as author_name');

    res.json({ ...category, books });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', [
  body('name').notEmpty().withMessage('Category name is required'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [newCategory] = await db('categories').insert(req.body).returning('*');
    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique constraint error
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [updatedCategory] = await db('categories')
      .where('id', req.params.id)
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique constraint error
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    // Check if category has books
    const bookCount = await db('books')
      .where('category_id', req.params.id)
      .count('id as count')
      .first();

    if (parseInt(bookCount.count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has books assigned to it' 
      });
    }

    const deleted = await db('categories').where('id', req.params.id).del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router; 