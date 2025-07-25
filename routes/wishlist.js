const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../database/config');

// Get all wishlist items
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = db('wishlist').select('*').orderBy('added_date', 'desc');
    
    if (search) {
      query = query.where(function() {
        this.whereRaw('book_name LIKE ?', [`%${search}%`])
            .orWhereRaw('author_name LIKE ?', [`%${search}%`]);
      });
    }
    
    const wishlist = await query;
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add new wish to wishlist
router.post('/', [
  body('book_name').notEmpty().trim().withMessage('Book name is required'),
  body('author_name').notEmpty().trim().withMessage('Author name is required'),
  body('notes').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('publisher').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { book_name, author_name, notes, price, publisher } = req.body;
    
    // Check if the wish already exists (SQLite uses LIKE instead of ilike)
    const existingWish = await db('wishlist')
      .whereRaw('LOWER(book_name) = LOWER(?)', [book_name])
      .andWhereRaw('LOWER(author_name) = LOWER(?)', [author_name])
      .first();
      
    if (existingWish) {
      return res.status(400).json({ error: 'This book is already in your wishlist' });
    }

    const insertData = {
      book_name: book_name.trim(),
      author_name: author_name.trim(),
      notes: notes?.trim() || null,
      price: price || null,
      publisher: publisher?.trim() || null
    };

    // Insert and return the new wish (PostgreSQL compatible)
    const [newWish] = await db('wishlist').insert(insertData).returning('*');
    res.status(201).json(newWish);
  } catch (error) {
    console.error('Error adding wish to wishlist:', error);
    res.status(500).json({ error: 'Failed to add wish to wishlist' });
  }
});

// Update wish
router.put('/:id', [
  body('book_name').optional().notEmpty().trim().withMessage('Book name cannot be empty'),
  body('author_name').optional().notEmpty().trim().withMessage('Author name cannot be empty'),
  body('notes').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('publisher').optional().trim(),
  body('is_purchased').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {};
    
    if (req.body.book_name !== undefined) updateData.book_name = req.body.book_name.trim();
    if (req.body.author_name !== undefined) updateData.author_name = req.body.author_name.trim();
    if (req.body.notes !== undefined) updateData.notes = req.body.notes?.trim() || null;
    if (req.body.price !== undefined) updateData.price = req.body.price || null;
    if (req.body.publisher !== undefined) updateData.publisher = req.body.publisher?.trim() || null;
    if (req.body.is_purchased !== undefined) updateData.is_purchased = req.body.is_purchased;
    
    updateData.updated_at = new Date();

    const updated = await db('wishlist').where('id', id).update(updateData);
    
    if (updated === 0) {
      return res.status(404).json({ error: 'Wish not found' });
    }

    const updatedWish = await db('wishlist').where('id', id).first();
    res.json(updatedWish);
  } catch (error) {
    console.error('Error updating wish:', error);
    res.status(500).json({ error: 'Failed to update wish' });
  }
});

// Delete wish from wishlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db('wishlist').where('id', id).del();
    
    if (deleted === 0) {
      return res.status(404).json({ error: 'Wish not found' });
    }

    res.json({ message: 'Wish deleted from wishlist successfully' });
  } catch (error) {
    console.error('Error deleting wish from wishlist:', error);
    res.status(500).json({ error: 'Failed to delete wish from wishlist' });
  }
});

// Mark wish as purchased
router.patch('/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await db('wishlist')
      .where('id', id)
      .update({ 
        is_purchased: true,
        updated_at: new Date()
      });
    
    if (updated === 0) {
      return res.status(404).json({ error: 'Wish not found' });
    }

    res.json({ message: 'Wish marked as purchased' });
  } catch (error) {
    console.error('Error marking wish as purchased:', error);
    res.status(500).json({ error: 'Failed to mark wish as purchased' });
  }
});

// Get wishlist statistics
router.get('/stats', async (req, res) => {
  try {
    const totalWishes = await db('wishlist').count('id as count').first();
    const purchasedWishes = await db('wishlist').where('is_purchased', true).count('id as count').first();
    const pendingWishes = await db('wishlist').where('is_purchased', false).count('id as count').first();
    
    const totalValue = await db('wishlist')
      .where('price', 'is not', null)
      .sum('price as total')
      .first();

    res.json({
      total_wishes: parseInt(totalWishes.count),
      purchased_wishes: parseInt(purchasedWishes.count),
      pending_wishes: parseInt(pendingWishes.count),
      estimated_total_value: parseFloat(totalValue.total || 0)
    });
  } catch (error) {
    console.error('Error fetching wishlist stats:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist statistics' });
  }
});

module.exports = router; 